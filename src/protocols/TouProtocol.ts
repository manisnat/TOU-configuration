import type { 
  DeviceAddress,
  RawResponse,
  SerialNumberData,
  DeviceTypeData,
  OperTimeData,
  FormattedOperTime,
  TimeData,
  SettingsSVData,
  IdSVData,
  IdVlanData,
  StatusLogData,
  NumLineLogData,
  LineLogOnOffData,
  LineLogCorrectionsData,
  LineLogMalfunctionsData,
  LineLogConnectionsData,
  ErrorMessages
} from "../types";

interface TouProtocolType {
  errors: ErrorMessages;
  getErrorMessage(errorCode: number): string;
  calculateCRC(data: number[]): number;
  makePacket(deviceAddress: DeviceAddress, command: number, data: number[]): number[];
  checkResponseError(response: RawResponse, expectedCommand: number): boolean;
  formatPacket(packet: RawResponse): string;
  bytesToInt(bytes: number[]): number;
  parseSerialNumber(response: RawResponse): SerialNumberData;
  parseDeviceType(response: RawResponse): DeviceTypeData;
  parseOperTime(response: RawResponse): OperTimeData;
  formatOperTime(operTime: number[]): FormattedOperTime;
  parseTime(response: RawResponse): TimeData;
  parseSettingsSV(response: RawResponse): SettingsSVData;
  parseIdSV(response: RawResponse): IdSVData;
  parseIdVlan(response: RawResponse): IdVlanData;
  parseStatusLog(response: RawResponse): StatusLogData;
  parseNumLineLog(response: RawResponse): NumLineLogData;
  parseLineLogOnOff(response: RawResponse): LineLogOnOffData;
  parseLineLogCorrections(response: RawResponse): LineLogCorrectionsData;
  parseLineLogMalfunctions(response: RawResponse): LineLogMalfunctionsData;
  parseLineLogConnections(response: RawResponse): LineLogConnectionsData;
}

export const TouProtocol: TouProtocolType = {
  errors: {
    1: "Неизвестная функция (не поддерживается)",
    2: "Неверная длина запроса",
    3: "Ошибка контрольной суммы",
    4: "Неверные данные в запросе",
    5: "Ошибка записи FLASH памяти",
    6: "Память защищена (отсутствует калибровочная перемычка)",
    7: "Неверный адрес",
    8: "Ответ от КДТН: Неизвестная функция (не поддерживаемая функция)",
    9: "Ответ от КДТН: Неверная длина запроса",
    10: "Ответ от КДТН: Ошибка контрольной суммы",
    11: "Ответ от КДТН: Неверные данные в запросе",
  },

  getErrorMessage(errorCode: number): string {
    return this.errors[errorCode] || `Неизвестная ошибка (код: ${errorCode})`;
  },

  calculateCRC(data: number[]): number {
    let crc: number = 0xffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >> 1) ^ 0xa001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    return crc;
  },

  makePacket(deviceAddress: DeviceAddress, command: number, data: number[] = []): number[] {
    const addr = command === 0x01 ? [0x00, 0x00, 0x00] as DeviceAddress : deviceAddress;

    const packet: number[] = [...addr, command, data.length + 2, ...data];
    const crc: number = this.calculateCRC(packet);
    packet.push(crc & 0xff);
    packet.push((crc >> 8) & 0xff);

    return packet;
  },

  checkResponseError(response: RawResponse, expectedCommand: number): boolean {
    if (!response || response.length === 0) {
      throw new Error("Получен пустой ответ");
    }

    const arr = Array.from(response);
    const responseNoCrc: number[] = arr.slice(0, -2);
    const crc: number = this.calculateCRC(responseNoCrc);
    if ((arr.at(-2) !== (crc & 0xff)) && (arr.at(-1) !== ((crc >> 8) & 0xff))) {
      throw new Error("Не совпадает контрольная сумма");
    }

    if (response[3] !== expectedCommand) {
      throw new Error("Пришёл не тот код функции от ТОУ");
    }

    // Если код функции = ожидаемый + 0x80, значит это ошибка
    if (response[3] === expectedCommand + 0x80) {
      throw new Error(
        `Причина ошибки от ТОУ: ${this.getErrorMessage(response[5])}`,
      );
    }
    return true;
  },

  formatPacket(packet: RawResponse): string {
    return Array.from(packet)
      .map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0"))
      .join(" ");
  },

  // Преобразование массива байт в число (little-endian)
  bytesToInt(bytes: number[]): number {
    let result: number = 0;
    for (let i = 0; i < bytes.length; i++) {
      result |= bytes[i] << (i * 8);
    }
    return result;
  },

  // Парсинг серийного номера из ответа
  parseSerialNumber(response: RawResponse): SerialNumberData {
    const arr = Array.from(response);
    const deviceAddress: DeviceAddress = [arr[5], arr[6], arr[7]];
    const serialNumber = this.bytesToInt(deviceAddress);

    return {
      deviceAddress: deviceAddress,
      serialNumber: serialNumber,
      rawResponse: arr,
    };
  },

  parseDeviceType(response: RawResponse): DeviceTypeData {
    const arr = Array.from(response);
    const deviceType: [number, number, number] = [arr[5], arr[6], arr[7]];

    return {
      deviceType: deviceType,
      buildMainSoftware: arr[8],
      versionMainSoftware: arr[9],
      buildAddSoftware: arr[10],
      versionAddSoftware: arr[11],
      rawResponse: arr,
    };
  },

  parseOperTime(response: RawResponse): OperTimeData {
    const arr = Array.from(response);
    const operTime: [number, number, number, number] = [arr[5], arr[6], arr[7], arr[8]];
    
    return {
      operTime: operTime,
      rawResponse: response,
    };
  },

  formatOperTime(operTime: number[]): FormattedOperTime {
    const numOperTime: number = this.bytesToInt(operTime);

    return {
      dayOperTime: Math.floor(numOperTime / 86400),
      hourOperTime: Math.floor((numOperTime % 86400) / 3600),
      minuteOperTime: Math.floor((numOperTime % 3600) / 60),
      secOperTime: numOperTime % 60,
    };
  },

  parseTime(response: RawResponse): TimeData {
    const arr = Array.from(response);
    return {
      yearTime: arr[5],
      monthTime: arr[6],
      dayTime: arr[7],
      hourTime: arr[8],
      minuteTime: arr[9],
      secTime: arr[10],
      rawResponse: arr,
    };
  },

  parseSettingsSV(response: RawResponse): SettingsSVData {
    const arr = Array.from(response);
    type macAddress = [number, number, number, number, number, number];
    const macTou: macAddress = [arr[5], arr[6], arr[7], arr[8], arr[9], arr[10]];
    const macConnectedDevice: macAddress = [arr[11], arr[12], arr[13], arr[14], arr[15], arr[16]];
    
    return {
      macTou: macTou,
      macConnectedDevice: macConnectedDevice,
      rawResponse: arr,
    };
  },

  parseIdSV(response: RawResponse): IdSVData {
    const arr = Array.from(response);

    const nameBytes = arr.slice(5, arr.length - 2);
    const nameTou = String.fromCharCode(...nameBytes);

    return {
      nameTou: nameTou,
      rawResponse: arr,
    };
  },  

  parseIdVlan(response: RawResponse): IdVlanData {
    const arr = Array.from(response);
    const firstByte = arr[19];  
    const secondByte = arr[20]; 

    const priorityVlan = (firstByte >> 5) & 0x07;  // маска 0x07 = 0b111
    const dropIndicator = (firstByte >> 4) & 0x01;
    const idVlan = ((firstByte & 0x0F) << 8) | secondByte;
    const appId: number = (arr[23]<<8) | arr[24];

    return {
      vlan: [arr[17], arr[18], firstByte, secondByte],
      priorityVlan: priorityVlan,
      dropIndicator: dropIndicator,
      idVlan: idVlan,
      appId: appId,
      rawResponse: arr,
    };
  }, 

  parseStatusLog(response: RawResponse): StatusLogData {
    const arr = Array.from(response);
    const capacityLog: [number, number] = [arr[12], arr[13]];
    
    return {
      numberLog: arr[5],
      yearTimeLast: arr[6],
      monthTimeLast: arr[7],
      dayTimeLast: arr[8],
      hourTimeLast: arr[9],
      minuteTimeLast: arr[10],
      secTimeLast: arr[11],
      capacityLog: capacityLog,
      rawResponse: arr,
    };
  },

  parseNumLineLog(response: RawResponse): NumLineLogData {
    const arr = Array.from(response);
    const numLine: [number, number] = [arr[12], arr[13]];
    
    return {
      numberLog: arr[5],
      yearTimeLast: arr[6],
      monthTimeLast: arr[7],
      dayTimeLast: arr[8],
      hourTimeLast: arr[9],
      minuteTimeLast: arr[10],
      secTimeLast: arr[11],
      numberLine: numLine,
      rawResponse: arr,
    };
  },

  parseLineLogOnOff(response: RawResponse): LineLogOnOffData {
    const arr = Array.from(response);
    const numLine: [number, number] = [arr[6], arr[7]];
    const date: [number, number, number, number, number, number] = [arr[8], arr[9], arr[10], arr[11], arr[12], arr[13]];
    
    return {
      numberLog: arr[5],
      numberLine: numLine,
      date: date,
      onOff: arr[14],
      rawResponse: arr,
    };
  },

  parseLineLogCorrections(response: RawResponse): LineLogCorrectionsData {
    const arr = Array.from(response);
    const numLine: [number, number] = [arr[6], arr[7]];
    type sixNumberArray = [number, number, number, number, number, number];
    const date: sixNumberArray = [arr[8], arr[9], arr[10], arr[11], arr[12], arr[13]];
    const oldMeaning: sixNumberArray = [arr[15], arr[16], arr[17], arr[18], arr[19], arr[20]];
    const newMeaning: sixNumberArray = [arr[21], arr[22], arr[23], arr[24], arr[25], arr[26]];
    
    
    return {
      numberLog: arr[5],
      numberLine: numLine,
      date: date,
      typeCorrection: arr[14],
      oldMeaning: oldMeaning,
      newMeaning: newMeaning,
      rawResponse: arr,
    };
  },

  parseLineLogMalfunctions(response: RawResponse): LineLogMalfunctionsData {
    const arr = Array.from(response);
    const numLine: [number, number] = [arr[6], arr[7]];
    const date: [number, number, number, number, number, number] = [arr[8], arr[9], arr[10], arr[11], arr[12], arr[13]];
    
    return {
      numberLog: arr[5],
      numberLine: numLine,
      date: date,
      typeOfFault: arr[14],
      rawResponse: arr,
    };
  },

  parseLineLogConnections(response: RawResponse): LineLogConnectionsData {
    const arr = Array.from(response);
    const numLine: [number, number] = [arr[6], arr[7]];
    const date: [number, number, number, number, number, number] = [arr[8], arr[9], arr[10], arr[11], arr[12], arr[13]];
    
    return {
      numberLog: arr[5],
      numberLine: numLine,
      date: date,
      numberPhase: arr[14],
      onOff: arr[15],
      rawResponse: arr,
    };
  },
};
