import { useRef, useCallback } from 'react';
import { useDeviceStore } from '../store/deviceStore';
import { SerialTransport } from '../transports/SerialTransport';
import { TouRepository } from '../repositories/TouRepository';
import { TouService } from '../services/TouService';
import { TouProtocol } from '../protocols/TouProtocol';
import { parseLogEntry, formatLogDate } from '../adapters/logAdapter';

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
    setLog,
    setIsLoadingLog,
    setLoadingProgressLog,
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

      await readLog(1);

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

  const readLog = useCallback(async (numLog: number): Promise<void> => {
    try {
      setIsLoadingLog(true);
      setLoadingProgressLog(0);
      const logData = await service.getStatusLog(numLog);
      const capacityLog = TouProtocol.bytesToInt(logData.capacityLog);

      type entriesType = Array<{ number: number; date: string; event: string; old: string; new: string}>;
      const entries: entriesType = [];

      for (let i = 1; i <= capacityLog; i++) {
        const progress = Math.round((i / capacityLog) * 100);
        setLoadingProgressLog(progress);

        let lineLogData;
        switch (numLog) {
          case 1: lineLogData = await service.getLineLogOnOff(numLog, i); break;
          case 2: lineLogData = await service.getLineLogCorrections(numLog, i); break;
          case 3: lineLogData = await service.getLineLogMalfunctions(numLog, i); break;
          case 4: lineLogData = await service.getLineLogConnections(numLog, i); break;
          default: throw new Error(`Неизвестный тип журнала: ${numLog}`);
        }
        entries.push(parseLogEntry(numLog, lineLogData));
      }

      setLog({ 
        timeLast: formatLogDate([logData.dayTimeLast, logData.monthTimeLast, logData.yearTimeLast, logData.hourTimeLast, logData.minuteTimeLast, logData.secTimeLast]),
        capacity: capacityLog,
        entries: entries,
      });

      setLoadingProgressLog(100);
      setIsLoadingLog(false);

      const line = await service.getLineLogCorrections(numLog, 2);
      console.log(line.rawResponse);
      // const arrOld = String.fromCharCode(...arrOldBytes);
      const arrOld = TouProtocol.bytesToInt(line.oldMeaning);
      console.log(arrOld);

      // const arrNew = String.fromCharCode(...arrNewBytes);
      const arrNew = TouProtocol.bytesToInt(line.newMeaning);
      console.log(arrNew);

    // const numLineLogData = await service.getNumLineLog(numLog, 2000, 1, 1, 1, 0, 0);
    // console.log(`${toStringPadStart(numLineLogData.dayTimeLast, 2)}.${toStringPadStart(numLineLogData.monthTimeLast, 2)}.${toStringPadStart(numLineLogData.yearTimeLast, 4, "2000")} ${toStringPadStart(numLineLogData.hourTimeLast, 2)}:${toStringPadStart(numLineLogData.minuteTimeLast, 2)}:${toStringPadStart(numLineLogData.secTimeLast, 2)}`);
    // console.log(TouProtocol.bytesToInt(numLineLogData.numberLine));

    // const lineLogData = await service.getLineLog(numLog, 2);
    // console.log(lineLogData.line);
    // console.log(TouProtocol.bytesToInt(lineLogData.numberLine));


    // const clearLogData = await service.setClearLog(numLog);
    // console.log(clearLogData.isSuccess);
    } catch (error) {
      setError((error as Error).message);
    }
  }, [service, setLog, setIsLoadingLog, setLoadingProgressLog, setError]);

  const cleanLogStore = useCallback((): void => {
    setIsLoadingLog(false);
    setLog({ 
      timeLast: '',
      capacity: 0,
      entries: [],
    });
  }, [setIsLoadingLog, setLog]);

  return {
    connectFunc,
    disconnectFunc,
    readOperTimeFunc,
    setTimeFunc,
    readTimeFunc,
    recordMacConnectedFunc,
    recordIdSVFunc,
    recordIdVlanFunc,
    readLog,
    cleanLogStore,
  };
}