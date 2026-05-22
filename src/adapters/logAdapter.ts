import { TouProtocol } from '../protocols/TouProtocol';

const toStringPadStart = (num: number, count: number, data: string = "0"): string => {
  return num.toString().padStart(count, data);
};

export interface LogEntry {
  number: number;
  date: string;
  event: string;
  old: string;
  new: string;
}

const CORRECTION_TYPES: Record<number, string> = {
  0: "Серийный номер",
  1: "Mac-адрес подключенного устройства",
//   2: "Обновление прошивки",
  2: "MAC-адрес ТОУ",
  3: "Калибровка ЧРВ",
  4: "Смена времени",
  5: "Очистка памяти",
  6: "Очистка журнала",
  7: "Смена SV ID",
  8: "Смена тестового режима",
  9: "Смена VLAN ID",
  10: "Дата калибровки КДТН",
  11: "Константа калибровки КДТН",
  12: "Сброс калибровки ЧРВ",
  13: "Запись типа исполнения",
  14: "Включение PTP",
  15: "Смена типа синхронизации PTP",
  16: "Смена режима расчета задержки PTP",
  17: "Смена смещения временной метки в секундах для PTP",
  18: "Смена домена PTP",
  19: "Смена интервала Delay_Req",
  20: "Смена интервала Announce",
  21: "Смена интервала Sync",
  22: "Смена приоритета 1 PTP",
  23: "Смена приоритета 2 PTP",
  24: "Смена использования VLAN для PTP",
  25: "Смена VLAN ID для PTP"
};

export const getFaultType = (code: number): string => {
  if (code >= 144 && code <= 162) {
    return "Ошибка кода";
  }
  
  const faults: Record<number, string> = {
    0: "Разрыв соединения с фазой А",
    2: "Ошибка памяти",
    18: "Ошибка Ethernet",
    41: "Ошибка общения с модулем PTP",
    48: "Ошибка общения с памятью",
    49: "Ошибка связи с фазой A",
    50: "Ошибка связи с фазой B",
    51: "Ошибка связи с фазой C",
    56: "Ошибка связи по USB",
    59: "Ошибка связи по RS-485",
    62: "Ошибка связи с GPS",
    128: "Не пришли данные от КДТН фазы А",
    129: "Не пришли данные от КДТН фазы B",
    130: "Не пришли данные от КДТН фазы C",
    208: "Ошибка калибровки ЧРВ",
  };
  
  return faults[code] || `Неизвестная ошибка (код: ${code})`;
};

const PHASES = ['A', 'B', 'C'];

export const formatLogDate = (time: number[]): string => {
  return `${toStringPadStart(time[2], 2)}.${toStringPadStart(time[1], 2)}.${toStringPadStart(time[0], 4, "2000")} ${toStringPadStart(time[3], 2)}:${toStringPadStart(time[4], 2)}:${toStringPadStart(time[5], 2)}`;
};

export const parseLogEntry = (
  numLog: number,
  lineLogData: any
): LogEntry => {
  const baseEntry: Omit<LogEntry, 'event'> = {
    number: TouProtocol.bytesToInt(lineLogData.numberLine),
    date: formatLogDate(lineLogData.date),
    old: "",
    new: "",
  };

  switch (numLog) {
    case 1: // Журнал включений/отключений
      return { ...baseEntry, event: lineLogData.onOff ? 'Включение' : 'Отключение' };
      
    case 2: // Журнал коррекций
      return {
        ...baseEntry,
        event: CORRECTION_TYPES[lineLogData.typeCorrection] || String(lineLogData.typeCorrection),
        old: lineLogData.typeCorrection === 0 ? String(TouProtocol.bytesToInt(lineLogData.oldMeaning)) : "",
        new: lineLogData.typeCorrection === 0 ? String(TouProtocol.bytesToInt(lineLogData.newMeaning)) : "",
      };
      
    case 3: // Журнал неисправностей
      return {
        ...baseEntry,
        event: getFaultType(lineLogData.typeOfFault) || String(lineLogData.typeOfFault),
      };
      
    case 4: // Журнал подключений
      const action = lineLogData.onOff ? 'Включение' : 'Отключение';
      const phase = PHASES[lineLogData.numberPhase] || '?';
      return { ...baseEntry, event: `${action}: Фаза ${phase}` };
      
    default:
      return { ...baseEntry, event: `Неизвестный тип журнала: ${numLog}` };
  }
};