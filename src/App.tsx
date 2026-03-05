import { useState, useEffect } from "react";
import { TouController } from "./TouController";
import { TouProtocol } from "./TouProtocol";
import "./App.css";

function App() {  
  const [tou] = useState(new TouController(TouProtocol));
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (text: string) => {
    setLogs(prev => [...prev, text]);
  };

  const toStringPadStart = (num: number, count: number, data: string = "0"): string => {
    return num.toString().padStart(count, data);
  };

  const connectFunc = async (): Promise<void> => {
    try {
      const result = await tou.connect();
      addLog(result);

      const dataSerial = await tou.readSerialNumber();
      addLog(`Серийный номер: ${toStringPadStart(dataSerial.serialNumber, 6)}`);
    } catch (error) {
      addLog("Ошибка: " + (error as Error).message);
    }
  };

  const disconnectFunc = async (): Promise<void> => {
    try {
      const result = await tou.disconnect();
      addLog(result);
    } catch (error) {
      addLog("Ошибка: " + (error as Error).message);
    }
  };

  const readSerialFunc = async (): Promise<void> => {
    try {
      const dataSerial = await tou.readSerialNumber();

      const bytes = Array.from(dataSerial.rawResponse as number[]);
      addLog(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      addLog(
        `Серийный номер hex: ${TouProtocol.formatPacket(dataSerial.deviceAddress)}`,
      );
      addLog(`Серийный номер: ${toStringPadStart(dataSerial.serialNumber, 6)}`);
    } catch (error) {
      addLog("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readDeviceTypeFunc = async (): Promise<void> => {
    try {
      const dataDevice = await tou.readDeviceType();

      const bytes = Array.from(dataDevice.rawResponse as number[]);
      addLog(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      addLog(`Тип устройства: ${dataDevice.deviceType.join(".")}`);
      addLog(
        `Основной ПО: ${dataDevice.buildMainSoftware}.${dataDevice.versionMainSoftware}`,
      );
      addLog(
        `Дополнительный ПО: ${dataDevice.buildAddSoftware}.${dataDevice.versionAddSoftware}`,
      );
    } catch (error) {
      addLog("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readOperTimeFunc = async (): Promise<void> => {
    try {
      const dataOperTime = await tou.readOperTime();

      const bytes = Array.from(dataOperTime.rawResponse as number[]);
      addLog(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
        TouProtocol.formatOperTime(dataOperTime.operTime);
      addLog(
        `Время наработки: ${TouProtocol.bytesToInt(dataOperTime.operTime)} секунд`,
      );
      addLog(
        `Время наработки: ${dayOperTime} дней ${hourOperTime} часов ${minuteOperTime} минут ${secOperTime} секунд`,
      );
    } catch (error) {
      addLog("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readTimeFunc = async (): Promise<void> => {
    try {
      const dataTime = await tou.readTime();

      const bytes = Array.from(dataTime.rawResponse as number[]);
      addLog(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);
      addLog(
        `Время в ТОУ: ${toStringPadStart(dataTime.yearTime, 4, "2000")}.${toStringPadStart(dataTime.monthTime, 2)}.${toStringPadStart(dataTime.dayTime, 2)} ${toStringPadStart(dataTime.hourTime, 2)}:${toStringPadStart(dataTime.minuteTime, 2)}:${toStringPadStart(dataTime.secTime, 2)}`,
      );
    } catch (error) {
      addLog("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const setTimeFunc = async (): Promise<void> => {
    try {
      const [year, month, day, hour, minute, second, timezone] = [
        2026, 2, 25, 10, 10, 23, 700,
      ];

      const rawResponse = await tou.setTime(
        year,
        month,
        day,
        hour,
        minute,
        second,
        timezone,
      );

      const bytes = Array.from(rawResponse);
      addLog(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);
    } catch (error) {
      addLog("Не удалось прочитать: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (!navigator.serial) {
      addLog("Web Serial API не поддерживается! Используйте Chrome/Edge");
    }
  }, []);

  return (
    <div className="app">
      <h1>Конфигуратор ТОУ</h1>

      <div className="buttons">
        <button onClick={connectFunc}>Подключиться</button>
        <button onClick={disconnectFunc}>Отключиться</button>
        <button onClick={readSerialFunc}>Серийный номер</button>
        <button onClick={readDeviceTypeFunc}>Тип устройства</button>
        <button onClick={readOperTimeFunc}>Время наработки</button>
        <button onClick={readTimeFunc}>Время в тоу</button>
        <button onClick={setTimeFunc}>Установка времени</button>
      </div>

      <div className="output">
        {logs.map((log, index) => (
          <div key={index} className="log-line">{log}</div>
        ))}
      </div>
    </div>
  );
}

export default App; 