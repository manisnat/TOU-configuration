let port = null;
let reader = null;
let writer = null;

const TOU = {
  deviceAddress: [0x00, 0x00, 0x00],

  connectPort: async function () {
    try {
      if (port) {
        return "Порт уже подключен";
      }

      port = await navigator.serial.requestPort();
      await port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      reader = port.readable.getReader();
      writer = port.writable.getWriter();

      return "Подключились к порту";
    } catch (err) {
      await this.closeTou();
      return "Ошибка подключения: " + err.message;
    }
  },

  disconnectPort: async function () {
    try {
      if (!port) {
        return "Вы не были подключены к порту";
      }

      await this.closeTou();
      return "Отключились от порта";
    } catch (err) {
      return "Ошибка отключения: " + err.message;
    }
  },

  closeTou: async function () {
    if (reader) {
      try {
        await reader.cancel();
        reader.releaseLock();
      } catch (e) {
        console.log("Ошибка при закрытии reader:", e);
      } finally {
        reader = null;
      }
    }

    if (writer) {
      try {
        await writer.close();
        writer.releaseLock();
      } catch (e) {
        console.log("Ошибка при закрытии writer:", e);
      } finally {
        writer = null;
      }
    }

    if (port) {
      try {
        // Проверяем, открыт ли порт перед закрытием
        if (port.readable || port.writable) {
          await port.close();
        }
      } catch (e) {
        console.log("Ошибка при закрытии port:", e);
      } finally {
        port = null;
      }
    }
  },

  readSerialNumber: async function () {
    try {
      if (!port) {
        console.log("Не подключен порт");
        throw new Error("Отстутствие подключенного порта");
      }

      const packet = this.makePacket(0x01);
      await writer.write(new Uint8Array(packet));
      const { value, done } = await reader.read();

      await this.readErrorTou(value, done, 0x81);

      this.deviceAddress = Array.from([value[5], value[6], value[7]]);
      const serial = this.reverseAddress(3, this.deviceAddress);

      return {
        serialNumber: serial,
        packetResponse: value,
      };
    } catch (error) {
      console.error("Ошибка чтения:", error);
      throw error;
    }
  },

  recordSerialNumber: async function () {
    try {
      if (!port) {
        console.log("Не подключен порт");
        throw new Error("Отстутствие подключенного порта");
      }

      const packet = this.makePacket(0x02, [0x62, 0x1e, 0x00]);
      await writer.write(new Uint8Array(packet));
      const { value, done } = await reader.read();

      await this.readErrorTou(value, done, 0x82);

      this.deviceAddress = Array.from([value[0], value[1], value[2]]);
      const serial = this.reverseAddress(3, this.deviceAddress);

      return {
        serialNumber: serial,
        packetResponse: value,
      };
    } catch (error) {
      console.error("Ошибка чтения:", error);
      throw error;
    }
  },

  readDeviceType: async function () {
    try {
      if (!port) {
        console.log("Не подключен порт");
        throw new Error("Отстутствие подключенного порта");
      }
      
      const packet = this.makePacket(0x03);
      await writer.write(new Uint8Array(packet));
      const { value, done } = await reader.read();

      await this.readErrorTou(value, done, 0x83);

      return {
        packetResponse: value,
        deviceType: Array.from([value[5], value[6], value[7]]),
        buildMainSoftware: value[8],
        versionMainSoftware: value[9],
        buildAddSoftware: value[10],
        versionAddSoftware: value[11],
      };
    } catch (error) {
      console.error("Ошибка чтения:", error);
      throw error;
    }
  },

  readErrorTou: async function(value, done, errCop) {
    if (done) {
      console.log("Поток чтения закрыт устройством");
      await TOU.closeTou();
      throw new Error("Соединение потеряно");
    }
    if (!value || value.length === 0) {
      throw new Error("Получен пустой ответ");
    }
    if (value[3] === errCop) {
      throw new Error(
        `Причина ошибки от тоу: ${this.getErrorMessage(value[5])}`,
      );
    }
  },

  formatPacket: function (packet) {
    return packet
      .map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0"))
      .join(" ");
  },

  calculateCRC: function (data) {
    let crc = 0xffff;
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i];
      for (let j = 0; j < 8; j++) {
        if (crc & 1) {
          crc = (crc >> 1) ^ 0xa001;
        } else {
          crc = crc >> 1;
        }
      }
    }
    return crc;
  },

  makePacket: function (command, data = []) {
    if (command === 0x01) {
      this.deviceAddress = [0x00, 0x00, 0x00];
    }
    const packet = [...this.deviceAddress, command, data.length + 2, ...data];
    const crc = this.calculateCRC(packet);
    packet.push(crc & 0xff);
    packet.push((crc >> 8) & 0xff);

    return packet;
  },

  reverseAddress: function (numBytes, address) {
    let result = 0;
    for (let i = 0; i < numBytes; i++) {
      result |= address[i] << (i * 8);
    }
    return result;
  },

  getErrorMessage: function (errorCode) {
    const errors = {
      1: "Неизвестная функция (не поддерживается)",
      2: "Неверная длина запроса",
      3: "Ошибка контрольной суммы",
      4: "Неверные данные в запросе",
      5: "Ошибка записи FLASH памяти",
      6: "Память защищена (отсутствует калибровочная перемычка)",
      7: "Неверный адрес",
      8: "Ответ от КДТН: Неизвестная функция (не поддерживаемая функция)",
      9: "Ответ от КДТН: Неверная длина запроса",
      10: "Ответ от КДТН: Ошибка контрольной суммы",
      11: "Ответ от КДТН: Неверные данные в запросе",
    };
    return errors[errorCode] || `Неизвестная ошибка (код: ${errorCode})`;
  },
};