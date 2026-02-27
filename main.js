const tou = new TouController(TouProtocol);
const output = document.getElementById("output");

function log(text) {
  output.innerHTML += text + "\n";
}

function toStringPadStart(num, count, data = "0") {
  return num.toString().padStart(count, data);
}

function logAddress() {
  log(
    `Серийный номер: ${toStringPadStart(TouProtocol.bytesToInt(tou.getDeviceAddress()), 6)}`,
  );
}

document
  .getElementById("connectBtn")
  .addEventListener("click", async function () {
    try {
      const result = await tou.connect();
      log(result);

      const dataSerial = await tou.readSerialNumber();
      log(`Серийный номер: ${toStringPadStart(dataSerial.serialNumber, 6)}`);
    } catch (error) {
      log("Ошибка: " + error.message);
    }
  });

document
  .getElementById("disconnectBtn")
  .addEventListener("click", async function () {
    try {
      const result = await tou.disconnect();
      log(result);
    } catch (error) {
      log("Ошибка: " + error.message);
    }
  });
 
document
  .getElementById("readSerialBtn")
  .addEventListener("click", async function readSerialFunc() {
    try {
      const dataSerial = await tou.readSerialNumber();

      const bytes = Array.from(dataSerial.rawResponse);
      log(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      log(`Серийный номер hex: ${TouProtocol.formatPacket(dataSerial.deviceAddress)}`);
      log(`Серийный номер: ${toStringPadStart(dataSerial.serialNumber, 6)}`);
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("readDeviceTypeBtn")
  .addEventListener("click", async function readDeviceTypeFunc() {
    try {
      const dataDevice = await tou.readDeviceType();

      const bytes = Array.from(dataDevice.rawResponse);
      log(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      log(`Тип устройства: ${dataDevice.deviceType.join(".")}`);
      log(
        `Основной ПО: ${dataDevice.buildMainSoftware}.${dataDevice.versionMainSoftware}`,
      );
      log(
        `Дополнительный ПО: ${dataDevice.buildAddSoftware}.${dataDevice.versionAddSoftware}`,
      );

      logAddress();
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("readOperTimeBtn")
  .addEventListener("click", async function readOperTimeFunc() {
    try {
      const dataOperTime = await tou.readOperTime();

      const bytes = Array.from(dataOperTime.rawResponse);
      log(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);

      const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
        TouProtocol.formatOperTime(dataOperTime.operTime);
      log(`Время наработки: ${TouProtocol.bytesToInt(dataOperTime.operTime)} секунд`);
      log(
        `Время наработки: ${dayOperTime} дней ${hourOperTime} часов ${minuteOperTime} минут ${secOperTime} секунд `,
      );
      logAddress();
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("readTimeBtn")
  .addEventListener("click", async function readTimeFunc() {
    try {
      const dataTime = await tou.readTime();

      const bytes = Array.from(dataTime.rawResponse);
      log(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);
      log(
        `Время в ТОУ: ${toStringPadStart(dataTime.yearTime, 4, "2000")}.${toStringPadStart(dataTime.monthTime, 2)}.${toStringPadStart(dataTime.dayTime, 2)} ${toStringPadStart(dataTime.hourTime, 2)}:${toStringPadStart(dataTime.minuteTime, 2)}:${toStringPadStart(dataTime.secTime, 2)}`,
      );
      logAddress();
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("setTimeBtn")
  .addEventListener("click", async function setTimeFunc() {
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
      log(`Ответ пакетом: ${TouProtocol.formatPacket(bytes)}`);
      logAddress();
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });


if (!navigator.serial) {
  log("Web Serial API не поддерживается! Используйте Chrome/Edge");
}
