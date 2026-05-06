export type DeviceAddress = [number, number, number];

export type RawResponse = Uint8Array | number[];

export interface SuccessResponse {
  rawResponse: RawResponse;
  isSuccess: boolean;
}

export interface SerialNumberData {
  deviceAddress: DeviceAddress;
  serialNumber: number;
  rawResponse: RawResponse;
}

export interface DeviceTypeData {
  deviceType: [number, number, number];
  buildMainSoftware: number;
  versionMainSoftware: number;
  buildAddSoftware: number;
  versionAddSoftware: number;
  rawResponse: RawResponse;
}

export interface OperTimeData {
  operTime: [number, number, number, number];
  rawResponse: RawResponse;
}

export interface FormattedOperTime {
  dayOperTime: number;
  hourOperTime: number;
  minuteOperTime: number;
  secOperTime: number;
}

export interface TimeData {
  yearTime: number;
  monthTime: number;
  dayTime: number;
  hourTime: number;
  minuteTime: number;
  secTime: number;
  rawResponse: RawResponse;
}

export interface SettingsSVData {
  macTou: [number, number, number, number, number, number];
  macConnectedDevice: [number, number, number, number, number, number];
  rawResponse: RawResponse;
}

export interface IdSVData {
  nameTou: string;
  rawResponse: RawResponse;
}

export interface IdVlanData {
  vlan: [number, number, number, number];
  priorityVlan: number;
  dropIndicator: number;
  idVlan: number;
  appId: number;
  rawResponse: RawResponse;
}

export interface StatusLogData {
  numberLog: number;
  yearTimeLast: number;
  monthTimeLast: number;
  dayTimeLast: number;
  hourTimeLast: number;
  minuteTimeLast: number;
  secTimeLast: number;
  capacityLog: [number, number];
  rawResponse: RawResponse;
}

export interface NumLineLogData {
  numberLog: number;
  yearTimeLast: number;
  monthTimeLast: number;
  dayTimeLast: number;
  hourTimeLast: number;
  minuteTimeLast: number;
  secTimeLast: number;
  numberLine: [number, number];
  rawResponse: RawResponse;
}

export interface LineLogData {
  numberLog: number;
  numberLine: [number, number];
  line: number[];
  rawResponse: RawResponse;
}

export interface ErrorMessages {
  [errorCode: number]: string;
}