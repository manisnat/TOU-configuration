import { useState, useEffect } from "react";
import { TouController } from "../TouController";
import { TouProtocol } from "../TouProtocol";

export function useTouDevice() {
  const [tou] = useState(new TouController(TouProtocol));
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [mainSoftware, setMainSoftware] = useState("");
  const [additionalSoftware, setAdditionalSoftware] = useState("");
  const [operTime, setOperTime] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [macAddressTou, setMacAddressTou] = useState("");
  const [macAddressConnected, setMacAddressConnected] = useState("");
  const [idSV, setIdSV] = useState("");
  const [idVlan, setIdVlan] = useState("");

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
      await readSettingsSVFunc();
      await recordMacConnectedFunc();
      await readIdSVFunc();
      //await recordIdSVFunc();
      await readIdVlanFunc();
      //await recordIdVlanFunc();
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

  const readSettingsSVFunc = async (): Promise<void> => {
    try {
      const dataSettingsSV = await tou.readSettingsSV();

      const bytes = Array.from(dataSettingsSV.rawResponse as number[]);
      console.log(`Ответ чтения настроек sv-потока: ${TouProtocol.formatPacket(bytes)}`);
      console.log(
        `mac адрес тоу hex: ${TouProtocol.formatPacket(dataSettingsSV.macTou)}`,
      );
      console.log(
        `mac адрес подключенного hex: ${TouProtocol.formatPacket(dataSettingsSV.macConnectedDevice)}`,
      );
      setMacAddressTou(Array.from(dataSettingsSV.macTou)
      .map((address) => address.toString(16).toUpperCase().padStart(2, "0"))
      .join(":"));
      setMacAddressConnected(Array.from(dataSettingsSV.macConnectedDevice)
      .map((address) => address.toString(16).toUpperCase().padStart(2, "0"))
      .join(":"));
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const recordMacConnectedFunc = async (): Promise<void> => {
    try {
      const macAddress = [0x01, 0x0C, 0xCD, 0x04, 0x00, 0x01];

      const rawResponse = await tou.recordMacConnected(
        macAddress
      );

      const bytes = Array.from(rawResponse);
      console.log(`Ответ установки mac-адреса: ${TouProtocol.formatPacket(bytes)}`);
      console.log("Установили mac-адрес подключенного устройства");
      await readSettingsSVFunc();
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readIdSVFunc = async (): Promise<void> => {
    try {
      const dataIdSV = await tou.readIdSV();

      const bytes = Array.from(dataIdSV.rawResponse as number[]);
      console.log(`Ответ чтения имени устройства (id sv): ${TouProtocol.formatPacket(bytes)}`);
      console.log(`Ответ чтения id sv: ${dataIdSV.nameTou}`);

      setIdSV(dataIdSV.nameTou);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const recordIdSVFunc = async (idSV: string): Promise<void> => {
    try {
      // RiM61850_SV1
      const rawResponse = await tou.recordIdSV(idSV); // нужны ограничения на количество символов N ≤ 69

      const bytes = Array.from(rawResponse);
      console.log(`Ответ установки имени устройства (id sv): ${TouProtocol.formatPacket(bytes)}`);
      

      await readIdSVFunc();
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const readIdVlanFunc = async (): Promise<void> => {
    try {
      const dataIdVlan = await tou.readIdVlan();

      const bytes = Array.from(dataIdVlan.rawResponse as number[]);
      console.log(`Ответ чтения кадра SV-потока: ${TouProtocol.formatPacket(bytes)}`);
      console.log(
        `VLAN hex: ${TouProtocol.formatPacket(dataIdVlan.vlan)}`,
      );
      console.log(
        `Id VLAN: ${dataIdVlan.idVlan}`);
      console.log(
        `priority VLAN: ${dataIdVlan.priorityVlan}`,
      );
      console.log(
        `Drop Eligible Indicator: ${dataIdVlan.dropIndicator}`,
      );
      console.log(
        `APPID: ${dataIdVlan.appId}`,
      );
      setIdVlan(`${dataIdVlan.idVlan}`);
    } catch (error) {
      console.log("Не удалось прочитать: " + (error as Error).message);
    }
  };

  const recordIdVlanFunc = async (idVlan: number): Promise<void> => {
    try {
      const rawResponse = await tou.recordIdVlan(idVlan); // нужны ограничение 0 - 4095

      const bytes = Array.from(rawResponse);
      console.log(`Ответ установки id vlan: ${TouProtocol.formatPacket(bytes)}`);
      await readIdVlanFunc();

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
    { label: "Версия ПО", value: `${mainSoftware || "—"} `, helpText: "Основное программное обеспечение" },
    { label: "Доп ПО", value: `${additionalSoftware || "—"}`, helpText: "Дополнительное программное обеспечение"},
    { label: "Время наработки", value: `${operTime || "—"}`, helpText: "С момента запуска" },
    { label: "Текущее время", value: `${currentTime || "—"}`, helpText: "Время в устройстве" },
  ]

  const macAddress = [
    {  name: "ТОУ отправитель", value: `${macAddressTou || "00:00:00:00:00:00"}`},
    {  name: "Получатель", value: `${macAddressConnected || "00:00:00:00:00:00"}`},
  ]

  return {
    stats,
    macAddress,
    connectFunc,
    disconnectFunc,
    setTimeFunc,
    readTimeFunc,
    recordIdSVFunc,
    recordIdVlanFunc,
    idSV,
    idVlan
  };
}