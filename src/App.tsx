import { useState, useEffect } from "react";
import { DataList } from "@chakra-ui/react";
import { InfoTip } from "./components/ui/toggle-tip";
import { TouController } from "./TouController";
import { TouProtocol } from "./TouProtocol";
import "./App.css";

function App() {  
  const [tou] = useState(new TouController(TouProtocol));
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [mainSoftware, setMainSoftware] = useState("");
  const [additionalSoftware, setAdditionalSoftware] = useState("");
  const [operTime, setOperTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const toStringPadStart = (num: number, count: number, data: string = "0"): string => {
    return num.toString().padStart(count, data);
  };

  const connectFunc = async (): Promise<void> => {
    try {
      const result = await tou.connect();
      console.log(result);

      await readSerialFunc();
      await readDeviceTypeFunc();
      await readOperTimeFunc();
      await readTimeFunc();
    } catch (error) {
      console.log("Ошибка: " + (error as Error).message);
    }
  };

  const disconnectFunc = async (): Promise<void> => {
    try {
      const result = await tou.disconnect();
      console.log(result);
    } catch (error) {
      console.log("Ошибка: " + (error as Error).message);
    }
  };

  const readSerialFunc = async (): Promise<void> => {
    try {
      const dataSerial = await tou.readSerialNumber();

      const bytes = Array.from(dataSerial.rawResponse as number[]);
      console.log(`Ответ чтения серийного номера: ${TouProtocol.formatPacket(bytes)}`);

      console.log(
        `Серийный номер hex: ${TouProtocol.formatPacket(dataSerial.deviceAddress)}`,
      );
      const sn = toStringPadStart(dataSerial.serialNumber, 6);
      setSerialNumber(sn);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readDeviceTypeFunc = async (): Promise<void> => {
    try {
      const dataDevice = await tou.readDeviceType();

      const bytes = Array.from(dataDevice.rawResponse as number[]);
      console.log(`Ответ чтения типа устройства: ${TouProtocol.formatPacket(bytes)}`);

      setDeviceType(dataDevice.deviceType.join("."));
      setMainSoftware(`${dataDevice.buildMainSoftware}.${dataDevice.versionMainSoftware}`);
      setAdditionalSoftware(`${dataDevice.buildAddSoftware}.${dataDevice.versionAddSoftware}`);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readOperTimeFunc = async (): Promise<void> => {
    try {
      const dataOperTime = await tou.readOperTime();

      const bytes = Array.from(dataOperTime.rawResponse as number[]);
      console.log(`Ответ чтения времени наработки: ${TouProtocol.formatPacket(bytes)}`);

      const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
        TouProtocol.formatOperTime(dataOperTime.operTime);

      setOperTime(`${dayOperTime} дней ${hourOperTime} часов ${minuteOperTime} минут ${secOperTime} секунд`);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readTimeFunc = async (): Promise<void> => {
    try {
      const dataTime = await tou.readTime();

      const bytes = Array.from(dataTime.rawResponse as number[]);
      console.log(`Ответ чтения времени: ${TouProtocol.formatPacket(bytes)}`);

      setCurrentTime(`${toStringPadStart(dataTime.yearTime, 4, "2000")}.${toStringPadStart(dataTime.monthTime, 2)}.${toStringPadStart(dataTime.dayTime, 2)} ${toStringPadStart(dataTime.hourTime, 2)}:${toStringPadStart(dataTime.minuteTime, 2)}:${toStringPadStart(dataTime.secTime, 2)}`);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
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
      console.log(`Ответ установки времени: ${TouProtocol.formatPacket(bytes)}`);
      console.log("Поменяли время в ТОУ");
      readTimeFunc();
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  useEffect(() => {
    if (!navigator.serial) {
      console.log("Web Serial API не поддерживается! Используйте Chrome/Edge");
    }
  }, []);

  const stats = [
    { label: "Серийный номер", value: `${serialNumber || "—"}`, helpText: "Уникальный идентификатор устройства" },
    { label: "Тип устройства", value: deviceType ? `РиМ ТОУ ${deviceType}` : "—", helpText: "Код модели" },
    { label: "Версия ПО", value: `${mainSoftware || "—"} `, helpText: "Основное ПО" },
    { label: "Дополнительное ПО", value: `${additionalSoftware || "—"}`, helpText: "Дополнительное ПО"},
    { label: "Время наработки", value: `${operTime || "—"}`, helpText: "С момента запуска" },
    { label: "Текущее время", value: `${currentTime || "—"}`, helpText: "Время в устройстве" },
  ]


  return (
    <div className="app">
      <h1>Конфигуратор ТОУ</h1>

      <div className="buttons">
        <button onClick={connectFunc}>Подключиться</button>
        <button onClick={disconnectFunc}>Отключиться</button>
        <button onClick={setTimeFunc}>Настроить время</button>
        <button onClick={readTimeFunc}>Обновить время</button>
      </div>

      <DataList.Root className="data-list" size='lg'>
        {stats.map((item) => (
          <DataList.Item key={item.label}>
            <DataList.ItemLabel>
              {item.label}
              <InfoTip>{item.helpText}</InfoTip>
            </DataList.ItemLabel>
            <DataList.ItemValue>{item.value}</DataList.ItemValue>
          </DataList.Item>
        ))}
      </DataList.Root>

    </div>
    
  );
}

export default App; 