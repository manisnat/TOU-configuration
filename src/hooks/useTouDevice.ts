import { useRef, useCallback } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { SerialTransport } from '../transports/SerialTransport';
import { TouRepository } from '../repositories/TouRepository';
import { TouService } from '../services/TouService';
import { TouProtocol } from '../protocols/TouProtocol';

const toStringPadStart = (num: number, count: number, data: string = "0"): string => {
  return num.toString().padStart(count, data);
};

const formatMacAddress = (bytes: number[]): string => {
  return bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(':');
};

export function useTouDevice() {
  const {
    setConnected,
    setError,
    setStats,
    setMacAddresses,
    setIdSV,
    setIdVlan,
    setSuccessFlag,
  } = useDeviceStore();

  const serviceRef = useRef<TouService | null>(null);

  if (!serviceRef.current) {
    const transport = new SerialTransport();
    const repository = new TouRepository(TouProtocol, transport);
    serviceRef.current = new TouService(repository, transport);
  }

  const service = serviceRef.current;

  const connectFunc = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      await service.connect();
      const allData = await service.getAllData();

      setConnected(true);

      setStats({
        serialNumber: toStringPadStart(allData.serialNumber.serialNumber, 6),
        deviceType: allData.deviceType.deviceType.join('.'),
        mainSoftware: `${allData.deviceType.buildMainSoftware}.${allData.deviceType.versionMainSoftware}`,
        additionalSoftware: `${allData.deviceType.buildAddSoftware}.${allData.deviceType.versionAddSoftware}`,
        operTime: (() => {
          const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
            TouProtocol.formatOperTime(allData.operTime.operTime);
          return `${dayOperTime}д. ${hourOperTime}ч. ${minuteOperTime}мин. ${secOperTime}сек.`;
        })(),
        currentTime: `${toStringPadStart(allData.currentTime.dayTime, 2)}.${toStringPadStart(allData.currentTime.monthTime, 2)}.${toStringPadStart(allData.currentTime.yearTime, 4, "2000")} ${toStringPadStart(allData.currentTime.hourTime, 2)}:${toStringPadStart(allData.currentTime.minuteTime, 2)}:${toStringPadStart(allData.currentTime.secTime, 2)}`,
      });

      setMacAddresses({
        tou: formatMacAddress(allData.settingsSV.macTou),
        connected: formatMacAddress(allData.settingsSV.macConnectedDevice),
      });
      
      setIdSV(allData.idSV.nameTou);
      setIdVlan(String(allData.idVlan.idVlan));

      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
  }, [service, setConnected, setError, setStats, setMacAddresses, setIdSV, setIdVlan]);

  const disconnectFunc = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      await service.disconnect();

      setConnected(false);
      return true;
    } catch (error) {
      setError((error as Error).message);
      return false;
    }
  }, [service, setError]);

  const readOperTimeFunc = useCallback(async (): Promise<void> => {
    try {
      const dataOperTime = await service.getOperTime();
      const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
        TouProtocol.formatOperTime(dataOperTime.operTime);

      const currentStats = useDeviceStore.getState().stats;

      setStats({ 
        ...currentStats,
        operTime: `${dayOperTime}д. ${hourOperTime}ч. ${minuteOperTime}мин. ${secOperTime}сек.`
      });
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setStats, setError]);

  const readTimeFunc = useCallback(async () => {
    try {
      const dataTime = await service.getTime();

      const currentStats = useDeviceStore.getState().stats;

      setStats({
        ...currentStats,
        currentTime: `${toStringPadStart(dataTime.dayTime, 2)}.${toStringPadStart(dataTime.monthTime, 2)}.${toStringPadStart(dataTime.yearTime, 4, "2000")} ${toStringPadStart(dataTime.hourTime, 2)}:${toStringPadStart(dataTime.minuteTime, 2)}:${toStringPadStart(dataTime.secTime, 2)}`,
      });
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setStats, setError]);

  const setTimeFunc = useCallback(async (
    year: number, 
    month: number, 
    day: number, 
    hour: number, 
    minute: number, 
    second: number, 
    timezone: number
  ): Promise<void> => {
    try {
      const { isSuccess } = await service.setTime(year, month, day, hour, minute, second, timezone);
      setSuccessFlag('time', isSuccess);

      if (isSuccess) {
        await readTimeFunc();
      }
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, readTimeFunc, setError, setSuccessFlag]);

  const recordMacConnectedFunc = useCallback(async (macAddress: number[]): Promise<void> => {
    try {
      //const macAddress = [0x01, 0x0C, 0xCD, 0x04, 0x00, 0x01];

      const { isSuccess } = await service.setMacConnected(macAddress);
      setSuccessFlag('macAddress', isSuccess);

      if (isSuccess) {
        const settingsSV = await service.getSettingsSV();

        setMacAddresses({
          tou: formatMacAddress(settingsSV.macTou),
          connected: formatMacAddress(settingsSV.macConnectedDevice),
        });
      }
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setMacAddresses, setSuccessFlag, setError]);

  const recordIdSVFunc = useCallback(async (idSV: string): Promise<void> => {
    try {
      // RiM61850_SV1
      const { isSuccess } = await service.setIdSV(idSV); // нужны ограничения на количество символов N ≤ 69
      setSuccessFlag('idSV', isSuccess);

      if (isSuccess) {
        const dataIdSv = await service.getIdSV();
        setIdSV(dataIdSv.nameTou);
      }
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setIdSV, setSuccessFlag, setError]);

  const recordIdVlanFunc = useCallback(async (idVlan: number): Promise<void> => {
    try {
      const {isSuccess} = await service.setIdVlan(idVlan); // нужны ограничение 0 - 4095
      setSuccessFlag('idVlan', isSuccess);

      if (isSuccess) {
        const dataIdVlan = await service.getIdVlan();
        setIdVlan(String(dataIdVlan.idVlan));
      }
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setIdVlan, setSuccessFlag, setError]);

  return {
    connectFunc,
    disconnectFunc,
    readOperTimeFunc,
    setTimeFunc,
    readTimeFunc,
    recordMacConnectedFunc,
    recordIdSVFunc,
    recordIdVlanFunc,
  };
}