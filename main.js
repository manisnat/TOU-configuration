const output = document.getElementById("output");

function disabledBtn(idBtn, turnOff) {
  document.getElementById(idBtn).disabled = turnOff;
}

function log(text) {
  output.innerHTML += text + "\n";
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
      const { serialNumber, packetResponse } = await TOU.readSerialNumber();

      const bytes = Array.from(packetResponse);
      log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);

      log(
        `Серийный номер hex (LSB - MSB): ${TOU.formatPacket(TOU.deviceAddress)}`,
      );
      log(`Серийный номер: ${serialNumber.toString().padStart(6, "0")}`);
    } catch (error) {
      log("Не удалось прочитать: " + error.message);
    }
  });

  document
    .getElementById("recordSerialBtn")
    .addEventListener("click", async function () {
      try {
        const { serialNumber, packetResponse } = await TOU.recordSerialNumber();

        const bytes = Array.from(packetResponse);
        log(`Ответ пакетом: ${TOU.formatPacket(bytes)}`);

        log(
          `Серийный номер hex (LSB - MSB): ${TOU.formatPacket(TOU.deviceAddress)}`,
        );
        log(`Серийный номер: ${serialNumber.toString().padStart(6, "0")}`);
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
        log(`Серийный номер: ${TOU.reverseAddress(3, TOU.deviceAddress).toString().padStart(6, "0")}`);
      } catch (error) {
        log("Не удалось прочитать: " + error.message);
      }
    });
  

if (!navigator.serial) {
  log("Web Serial API не поддерживается! Используйте Chrome/Edge");
}
