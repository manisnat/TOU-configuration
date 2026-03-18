import { TouProtocol} from './TouProtocol';
import type {
  DeviceAddress, 
  SerialNumberData, 
  DeviceTypeData, 
  OperTimeData, 
  TimeData,
  SettingsSVData,
  IdSVData, 
  IdVlanData,
} from './types';

interface SerialPort {
  readable: ReadableStream;
  writable: WritableStream;
  open(opttions: {baudRate: number, dataBits: number, stopBits: number, parity: string}): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Navigator {
    serial: {
      requestPort(): Promise<SerialPort>;
    };
  }
}

export class TouController {
  private protocol: typeof TouProtocol;
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private deviceAddress: DeviceAddress = [0x00, 0x00, 0x00];
  private isConnected: boolean = false;

  constructor(protocol: typeof TouProtocol) {
    this.protocol = protocol;
  }

  public getDeviceAddress(): DeviceAddress {
    return this.deviceAddress;
  }

  public async connect(): Promise<string> {
    try {
      if (this.isConnected) {
        return "Порт уже подключен";
      }

      this.port = await navigator.serial.requestPort();
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;

      return "Подключились к порту";
    } catch (err) {
      await this.disconnect();
      throw new Error("Ошибка подключения: " + (err as Error).message);
    }
  }

  public async disconnect(): Promise<string> {
    try {
      if (!this.isConnected) {
        return "Вы не были подключены к порту";
      }

      if (this.reader) {
        try {
          await this.reader.cancel();
          this.reader.releaseLock();
        } catch (e) {
          console.log("Ошибка при закрытии reader:", e);
        } finally {
          this.reader = null;
        }
      }

      if (this.writer) {
        try {
          await this.writer.close();
          this.writer.releaseLock();
        } catch (e) {
          console.log("Ошибка при закрытии writer:", e);
        } finally {
          this.writer = null;
        }
      }

      if (this.port) {
        try {
          if (this.port.readable || this.port.writable) {
            await this.port.close();
          }
        } catch (e) {
          console.log("Ошибка при закрытии port:", e);
        } finally {
          this.port = null;
        }
      }

      this.isConnected = false;
      return "Отключились от порта";
    } catch (err) {
      throw new Error("Ошибка отключения: " + (err as Error).message);
    }
  }

  private async sendCommand(command: number, data: number[] = []): Promise<Uint8Array> {
    if (!this.isConnected || !this.writer || !this.reader) {
      throw new Error("Нет подключения к устройству");
    }

    const packet = this.protocol.makePacket(
      command === 0x01 ? [0x00, 0x00, 0x00] : this.deviceAddress,
      command,
      data,
    );

    await this.writer.write(new Uint8Array(packet));
    const value = await this.readResponse();

    this.protocol.checkResponseError(value, command);
    return value;
  }

  private async readResponse(): Promise<Uint8Array> {
    if (!this.reader) {
        throw new Error("Reader не инициализирован");
    }
    const chunks: Uint8Array[] = [];

    while (true) {
      const { value, done } = await this.reader.read();

      if (done) {
        await this.disconnect();
        throw new Error("Соединение потеряно");
      }

      chunks.push(value);
      const fullResponse = new Uint8Array(chunks.flatMap(chunks=>[...chunks]));

      if (fullResponse.length >= 5) {
        const expectedLength = 5 + fullResponse[4];

        if (fullResponse.length === expectedLength) {
          return fullResponse;
        }
      }
    }
  }

  public async readSerialNumber(): Promise<SerialNumberData> {
    const response = await this.sendCommand(0x01);
    const parsed = this.protocol.parseSerialNumber(response);

    this.deviceAddress = parsed.deviceAddress as DeviceAddress;

    return parsed;
  }

  public async readDeviceType(): Promise<DeviceTypeData> {
    const response = await this.sendCommand(0x03);
    const parsed = this.protocol.parseDeviceType(response);

    return parsed;
  }

  public async readOperTime(): Promise<OperTimeData> {
    const response = await this.sendCommand(0x4);
    const parsed = this.protocol.parseOperTime(response);

    return parsed;
  }

  public async setTime(
    year: number, 
    month: number, 
    day: number, 
    hour: number, 
    minute: number, 
    second: number, 
    timezone: number
  ): Promise<Uint8Array> {
    let tzValue = timezone;
    if (tzValue < 0) {
      tzValue = 65536 + tzValue; // для отрицательных значений
    }

    const tzBytes = [tzValue & 0xff, (tzValue >> 8) & 0xff];
    const data: number[] = [year - 2000, month, day, hour, minute, second, ...tzBytes];

    const response = await this.sendCommand(0x5, data);

    return response;
  }

  public async readTime(): Promise<TimeData> {
    const response = await this.sendCommand(0x6);
    const parsed = this.protocol.parseTime(response);

    return parsed;
  }

  public async readSettingsSV(): Promise<SettingsSVData> {
    const response = await this.sendCommand(0x42);
    const parsed = this.protocol.parseSettingsSV(response);

    return parsed;
  }

  public async recordMacConnected(
    macAddress: number[]
  ): Promise<Uint8Array> {
    const response = await this.sendCommand(0x41, macAddress);

    return response;
  }

  public async readIdSV(): Promise<IdSVData> {
    const response = await this.sendCommand(0x43);
    const parsed = this.protocol.parseIdSV(response);

    return parsed;
  }

  public async recordIdSV(nameTou: string): Promise<Uint8Array> {
    let nameBytes: number[] = [];
    for (let i = 0; i < nameTou.length; i++) {
      nameBytes[i] = nameTou.charCodeAt(i);
    }

    const response = await this.sendCommand(0x44, nameBytes);

    return response;
  }

  public async readIdVlan(): Promise<IdVlanData> {
    const response = await this.sendCommand(0x45);
    const parsed = this.protocol.parseIdVlan(response);

    return parsed;
  }

  public async recordIdVlan(idVlan: number): Promise<Uint8Array> {
    if (idVlan < 0 || idVlan > 4095) {
        throw new Error("VLAN ID должен быть от 0 до 4095");
    }

    const idVlanBytes: number[] = [idVlan & 0xFF, (idVlan >> 8) & 0xFF]; 
    console.log(`Устанавливаем VLAN ID: ${idVlan}, байты:`, idVlanBytes.map(b => '0x' + b.toString(16)));
    
    const response = await this.sendCommand(0x4A, idVlanBytes);

    return response;
  }
}
