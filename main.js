const output = document.getElementById("output");

function disabledBtn(idBtn, turnOff) {
  document.getElementById(idBtn).disabled = turnOff;
}

function log(text) {
  output.innerHTML += text + "\n";
}

function toStringPadStart(num, count, data = "0") {
  return num.toString().padStart(count, data);
}

document
  .getElementById("connectBtn")
  .addEventListener("click", async function () {
    const result = await TOU.connectPort();
    log(result);
    await TOU.readSerialNumber();
  });

document
  .getElementById("disconnectBtn")
  .addEventListener("click", async function () {
    const result = await TOU.disconnectPort();
    log(result);
  });

document
  .getElementById("readSerialBtn")
  .addEventListener("click", async function readSerialFunc() {
    try {
      const { packetResponse, serialNumber } = await TOU.readSerialNumber();

      const bytes = Array.from(packetResponse);
      log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);

      log(
        `Серийный номер hex (LSB - MSB): ${TOU.formatPacket(TOU.deviceAddress)}`,
      );
      log(`Серийный номер: ${toStringPadStart(serialNumber, 6)}`);
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("readDeviceTypeBtn")
  .addEventListener("click", async function () {
    try {
      const { packetResponse, 
        deviceType,
        buildMainSoftware,
        versionMainSoftware,
        buildAddSoftware,
        versionAddSoftware
      } = await TOU.readDeviceType();

      const bytes = Array.from(packetResponse);
      log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);

      log(`Тип устройства: ${deviceType.join(".")}`);
      log(`Основной ПО: ${buildMainSoftware}.${versionMainSoftware}`);
      log(`Дополнительный ПО: ${buildAddSoftware}.${versionAddSoftware}`);
      log(`Серийный номер: ${toStringPadStart(TOU.bytesToInt(TOU.deviceAddress), 6)}`);
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document.getElementById("readOperTimeBtn").addEventListener("click", async function () {
  try {
    const { packetResponse, operTime } = await TOU.readOperTime();

    const bytes = Array.from(packetResponse);
    log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);

    const { dayOperTime, hourOperTime, minuteOperTime, secOperTime } =
      TOU.formatOperTime(operTime);
    log(`Время наработки: ${TOU.bytesToInt(operTime)} секунд`);
    log(
      `Время наработки: ${dayOperTime} дней ${hourOperTime} часов ${minuteOperTime} минут ${secOperTime} секунд `,
    );
    log( 
      `Серийный номер: ${toStringPadStart(TOU.bytesToInt(TOU.deviceAddress), 6)}`,
    );
  } catch (error) {
    log("Не удалось прочитать: " + error.message);
  }
  });

document
  .getElementById("readTimeBtn")
  .addEventListener("click", async function () {
    try {
      const { 
        packetResponse, 
        yearTime,
        monthTime,
        dayTime,
        hourTime,
        minuteTime,
        secTime } = await TOU.readTime();

      const bytes = Array.from(packetResponse);
      log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);
      log(
        `Время в ТОУ: ${toStringPadStart(yearTime, 4, "2000")}.${toStringPadStart(monthTime, 2)}.${toStringPadStart(dayTime, 2)} ${toStringPadStart(hourTime, 2)}:${toStringPadStart(minuteTime, 2)}:${toStringPadStart(secTime, 2)}`,
      );
      log(
        `Серийный номер: ${toStringPadStart(TOU.bytesToInt(TOU.deviceAddress), 6)}`,
      );
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

document
  .getElementById("setTimeBtn")
  .addEventListener("click", async function () {
    try {
      // Простой диалог ввода
      const dateStr = prompt(
        "Введите дату и время (ГГГГ-ММ-ДД ЧЧ:ММ:СС)",
        "2026-02-26 12:35:08",
      );
      if (!dateStr) return;

      const tzStr = prompt(
        "Введите часовой пояс (ЧЧММ, например 300 для +3:00, -500 для -5:00)",
        "700",
      );
      if (!tzStr) return;

      
      const [datePart, timePart] = dateStr.split(" ");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);

      
      const timezone = parseInt(tzStr);

      log(
        `📅 Устанавливаем: ${year}.${month}.${day} ${hour}:${minute}:${second} (UTC ${timezone})`,
      );

      const packetResponse = await TOU.setTime(
        year,
        month,
        day,
        hour,
        minute,
        second,
        timezone,
      );

      //const packetResponse = await TOU.setTime(2026, 2, 25, 10, 10, 23, -800);

      const bytes = Array.from(packetResponse);
      log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);
      log(
        `Серийный номер: ${toStringPadStart(TOU.bytesToInt(TOU.deviceAddress), 6)}`,
      );
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

  // 1. Получить элемент
const dateInput = document.getElementById('datePicker');

// 3. Получить выбранную дату
dateInput.addEventListener('change', (event) => {
    console.log("Выбранная дата:", event.target.value); // Формат YYYY-MM-DD
});

  

if (!navigator.serial) {
  log("Web Serial API не поддерживается! Используйте Chrome/Edge");
}
