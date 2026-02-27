class TouController {
  constructor(protocol) {
    this.protocol = protocol;
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.deviceAddress = [0x00, 0x00, 0x00];
    this.isConnected = false;
  }

  getDeviceAddress() {
    return this.deviceAddress;
  }

  async connect() {
    try {
      if (this.isConnected) {
        return "Порт уже подключен";
      }

      this.port = await navigator.serial.requestPort();
      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;

      return "Подключились к порту";
    } catch (err) {
      await this.disconnect();
      throw new Error("Ошибка подключения: " + err.message);
    }
  }

  async disconnect() {
    try {
      if (!this.isConnected) {
        return "Вы не были подключены к порту";
      }

      if (this.reader) {
        try {
          await this.reader.cancel();
          this.reader.releaseLock();
        } catch (e) {
          console.log("Ошибка при закрытии reader:", e);
        } finally {
          this.reader = null;
        }
      }

      if (this.writer) {
        try {
          await this.writer.close();
          this.writer.releaseLock();
        } catch (e) {
          console.log("Ошибка при закрытии writer:", e);
        } finally {
          this.writer = null;
        }
      }

      if (this.port) {
        try {
          if (this.port.readable || this.port.writable) {
            await this.port.close();
          }
        } catch (e) {
          console.log("Ошибка при закрытии port:", e);
        } finally {
          this.port = null;
        }
      }

      this.isConnected = false;
      return "Отключились от порта";
    } catch (err) {
      throw new Error("Ошибка отключения: " + err.message);
    }
  }

  async sendCommand(command, data = []) {
    if (!this.isConnected) {
      throw new Error("Отсутствие подключенного порта");
    }

    const packet = this.protocol.makePacket(
      command === 0x01 ? [0x00, 0x00, 0x00] : this.deviceAddress,
      command,
      data,
    );

    await this.writer.write(new Uint8Array(packet));
    const { value, done } = await this.reader.read();

    if (done) {
      await this.disconnect();
      throw new Error("Соединение потеряно");
    }

    this.protocol.checkResponseError(value, command);

    return value;
  }

  async readSerialNumber() {
    const response = await this.sendCommand(0x01);
    const parsed = this.protocol.parseSerialNumber(response);

    this.deviceAddress = parsed.deviceAddress;

    return parsed;
  }

  async readDeviceType() {
    const response = await this.sendCommand(0x03);
    const parsed = this.protocol.parseDeviceType(response);

    return parsed;
  }

  async readOperTime() {
    const response = await this.sendCommand(0x4);
    const parsed = this.protocol.parseOperTime(response);

    return parsed;
  }

  async setTime(year, month, day, hour, minute, second, timezone) {
    let tzValue = timezone;
    if (tzValue < 0) {
      tzValue = 65536 + tzValue; // для отрицательных значений
    }

    const tzBytes = [tzValue & 0xff, (tzValue >> 8) & 0xff];
    const data = [year - 2000, month, day, hour, minute, second, ...tzBytes];

    const response = await this.sendCommand(0x5, data);

    return response;
  }

  async readTime() {
    const response = await this.sendCommand(0x6);
    const parsed = this.protocol.parseTime(response);

    return parsed;
  }
}