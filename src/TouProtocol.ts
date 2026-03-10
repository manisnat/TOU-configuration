import type { 
  DeviceAddress,
  RawResponse,
  SerialNumberData,
  DeviceTypeData,
  OperTimeData,
  FormattedOperTime,
  TimeData,
  SettingsSVData,
  ErrorMessages
} from "./types";

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
};
