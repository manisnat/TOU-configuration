export type DeviceAddress = [number, number, number];

export type RawResponse = Uint8Array | number[];

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

export interface ErrorMessages {
  [errorCode: number]: string;
}