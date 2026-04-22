// Отвечает за команды устройству. Использует транспорт и протокол

import { TouProtocol} from '../protocols/TouProtocol';
import { SerialTransport } from '../transports/SerialTransport';
import type {
  RawResponse,
  DeviceAddress, 
  SuccessResponse,
} from '../types';

export class TouRepository {
  private protocol: typeof TouProtocol;
  private transport: SerialTransport;
  private deviceAddress: DeviceAddress = [0x00, 0x00, 0x00];

  constructor(protocol: typeof TouProtocol, transport: SerialTransport) {
    this.protocol = protocol;
    this.transport = transport;
  }

  public getDeviceAddress(): DeviceAddress {
    return this.deviceAddress;
  }

  private setDeviceAddress(address: DeviceAddress): void {
    this.deviceAddress = address;
  }

  private logCommand(command: number, rawResponse: RawResponse) {
    console.log(`Ответ команды 0x${command.toString(16)}: ${this.protocol.formatPacket(rawResponse)}`);
  }

  private async sendCommand(command: number, data: number[] = []): Promise<SuccessResponse> {
    const packet = this.protocol.makePacket(
      command === 0x01 ? [0x00, 0x00, 0x00] : this.deviceAddress,
      command,
      data,
    );
    // Вывод пакета, пока что
    console.log(`Отправка команды 0x${command.toString(16)}: ${this.protocol.formatPacket(packet)}`);

    const packetArray = new Uint8Array(packet);
    const rawResponse = await this.transport.sendReceive(packetArray);

    const isSuccess = this.protocol.checkResponseError(rawResponse, command);
    if (!isSuccess) {
      throw new Error(`Ошибка при выполнении команды ${command}`);
    }

    return {rawResponse, isSuccess};
  }

  private async readCommand(command: number): Promise<RawResponse> {
    const {rawResponse} = await this.sendCommand(command);
    this.logCommand(command, rawResponse);
    
    return rawResponse;
  }

  private async writeCommand(command: number, data: number[]): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.sendCommand(command, data);
    this.logCommand(command, rawResponse);
    
    return {rawResponse, isSuccess};
  }

  public async fetchSerialNumberRaw(): Promise<RawResponse> {
    const rawResponse: RawResponse = await this.readCommand(0x01);
    const parsed = this.protocol.parseSerialNumber(rawResponse);
    this.setDeviceAddress(parsed.deviceAddress as DeviceAddress);

    return rawResponse;
  }

  public async fetchDeviceTypeRaw(): Promise<RawResponse> {
    return this.readCommand(0x03);
  }

  public async fetchOperTimeRaw(): Promise<RawResponse> {
    return this.readCommand(0x04);
  }

  public async sendTimeCommand(
    year: number, 
    month: number, 
    day: number, 
    hour: number, 
    minute: number, 
    second: number, 
    timezone: number
  ): Promise<SuccessResponse> {
    let tzValue = timezone;
    if (tzValue < 0) {
      tzValue = 65536 + tzValue; // для отрицательных значений
    }

    const tzBytes = [tzValue & 0xff, (tzValue >> 8) & 0xff];
    const data: number[] = [year - 2000, month, day, hour, minute, second, ...tzBytes];

    return this.writeCommand(0x05, data);
  }

  public async fetchTimeRaw(): Promise<RawResponse> {
    return this.readCommand(0x06);
  }

  public async fetchSettingsSVRaw(): Promise<RawResponse> {
    return this.readCommand(0x42);
  }

  public async sendMacCommand(macAddress: number[]): Promise<SuccessResponse> {
    return this.writeCommand(0x41, macAddress);
  }

  public async fetchIdSVRaw(): Promise<RawResponse> {
    return this.readCommand(0x43);
  }

  public async sendIdSVCommand(nameTou: string): Promise<SuccessResponse> {
    let nameBytes: number[] = [];
    for (let i = 0; i < nameTou.length; i++) {
      nameBytes[i] = nameTou.charCodeAt(i);
    }

    return this.writeCommand(0x44, nameBytes);
  }

  public async fetchIdVlanRaw(): Promise<RawResponse> {
    return this.readCommand(0x45);
  }

  public async sendIdVlanCommand(idVlan: number): Promise<SuccessResponse> {
    if (idVlan < 0 || idVlan > 4095) {
        throw new Error("VLAN ID должен быть от 0 до 4095");
    }

    const idVlanBytes: number[] = [idVlan & 0xFF, (idVlan >> 8) & 0xFF]; 

    return this.writeCommand(0x4A, idVlanBytes);
  }
}
