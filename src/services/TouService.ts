// Бизнес-логика: что делать при подключении, преобразование данных и тд

import { TouProtocol} from '../protocols/TouProtocol';
import { TouRepository } from '../repositories/TouRepository';
import { SerialTransport } from '../transports/SerialTransport';
import type {
  SerialNumberData, 
  SuccessResponse,
  DeviceTypeData, 
  OperTimeData, 
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
} from '../types';

export class TouService {
  private repository: TouRepository;
  private transport: SerialTransport;

  constructor(repository: TouRepository, transport: SerialTransport) {
    this.repository = repository;
    this. transport = transport;
  }

  async connect(): Promise<void> {
    await this.transport.connect();
  }
  
  async disconnect(): Promise<void> {
    await this.transport.disconnect();
  }
  
  get isConnected(): boolean {
    return this.transport.isConnected;
  }

  public async getAllData(): Promise<{
    serialNumber: SerialNumberData;
    deviceType: DeviceTypeData;
    operTime: OperTimeData;
    currentTime: TimeData;
    settingsSV: SettingsSVData;
    idSV: IdSVData;
    idVlan: IdVlanData;
  }> {
    const [serialRaw, deviceTypeRaw, operTimeRaw, timeRaw, svRaw, idSvRaw, idVlanRaw] = await Promise.all([
      await this.repository.fetchSerialNumberRaw(),
      await this.repository.fetchDeviceTypeRaw(),
      await this.repository.fetchOperTimeRaw(),
      await this.repository.fetchTimeRaw(),
      await this.repository.fetchSettingsSVRaw(),
      await this.repository.fetchIdSVRaw(),
      await this.repository.fetchIdVlanRaw(),
    ]);
    
    return {
      serialNumber: TouProtocol.parseSerialNumber(serialRaw),
      deviceType: TouProtocol.parseDeviceType(deviceTypeRaw),
      operTime: TouProtocol.parseOperTime(operTimeRaw),
      currentTime: TouProtocol.parseTime(timeRaw),
      settingsSV: TouProtocol.parseSettingsSV(svRaw),
      idSV: TouProtocol.parseIdSV(idSvRaw),
      idVlan: TouProtocol.parseIdVlan(idVlanRaw),
    };
  }

  public async getSerialNumber(): Promise<SerialNumberData> {
    const response = await this.repository.fetchSerialNumberRaw();
    const parsed = TouProtocol.parseSerialNumber(response);

    return parsed;
  }

  public async getDeviceType(): Promise<DeviceTypeData> {
    const response = await this.repository.fetchDeviceTypeRaw();
    const parsed = TouProtocol.parseDeviceType(response);

    return parsed;
  }

  public async getOperTime(): Promise<OperTimeData> {
    const response = await this.repository.fetchOperTimeRaw();
    const parsed = TouProtocol.parseOperTime(response);

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
  ): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.repository.sendTimeCommand(year, month, day, hour, minute, second, timezone);

    return {rawResponse, isSuccess};
  }

  public async getTime(): Promise<TimeData> {
    const response = await this.repository.fetchTimeRaw();
    const parsed = TouProtocol.parseTime(response);

    return parsed;
  }

  public async getSettingsSV(): Promise<SettingsSVData> {
    const response = await this.repository.fetchSettingsSVRaw()
    const parsed = TouProtocol.parseSettingsSV(response);

    return parsed;
  }

  public async setMacConnected(
    macAddress: number[]
  ): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.repository.sendMacCommand(macAddress);

    return {rawResponse, isSuccess};
  }

  public async getIdSV(): Promise<IdSVData> {
    const response = await this.repository.fetchIdSVRaw();
    const parsed = TouProtocol.parseIdSV(response);

    return parsed;
  }

  public async setIdSV(nameTou: string): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.repository.sendIdSVCommand(nameTou);

    return { rawResponse, isSuccess };
  }

  public async getIdVlan(): Promise<IdVlanData> {
    const response = await this.repository.fetchIdVlanRaw();
    const parsed = TouProtocol.parseIdVlan(response);

    return parsed;
  }

  public async setIdVlan(idVlan: number): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.repository.sendIdVlanCommand(idVlan);

    return { rawResponse, isSuccess };
  }

  public async getStatusLog(numLog: number): Promise<StatusLogData> {
    const response = await this.repository.fetchStatusLogRaw(numLog);
    const parsed = TouProtocol.parseStatusLog(response);

    return parsed;
  }

  public async getNumLineLog(
    numLog: number,
    year: number, 
    month: number, 
    day: number, 
    hour: number, 
    minute: number, 
    second: number, 
  ): Promise<NumLineLogData> {
    const response = await this.repository.fetchNumLineLogRaw(numLog, year, month, day, hour, minute, second);
    const parsed = TouProtocol.parseNumLineLog(response);

    return parsed;
  }

  public async getLineLogOnOff(numLog: number, numLine: number): Promise<LineLogOnOffData> {
    const response = await this.repository.fetchLineLogRaw(numLog, numLine);
    const parsed = TouProtocol.parseLineLogOnOff(response);

    return parsed;
  }

  public async getLineLogCorrections(numLog: number, numLine: number): Promise<LineLogCorrectionsData> {
    const response = await this.repository.fetchLineLogRaw(numLog, numLine);
    const parsed = TouProtocol.parseLineLogCorrections(response);

    return parsed;
  }

  public async getLineLogMalfunctions(numLog: number, numLine: number): Promise<LineLogMalfunctionsData> {
    const response = await this.repository.fetchLineLogRaw(numLog, numLine);
    const parsed = TouProtocol.parseLineLogMalfunctions(response);

    return parsed;
  }

  public async getLineLogConnections(numLog: number, numLine: number): Promise<LineLogConnectionsData> {
    const response = await this.repository.fetchLineLogRaw(numLog, numLine);
    const parsed = TouProtocol.parseLineLogConnections(response);

    return parsed;
  }

  public async setClearLog(numLog: number): Promise<SuccessResponse> {
    const {rawResponse, isSuccess} = await this.repository.clearLogRaw(numLog);

    return { rawResponse, isSuccess };
  }
}
