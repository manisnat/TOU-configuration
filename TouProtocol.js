const TouProtocol = {
  errors: {
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
  },

  getErrorMessage: function (errorCode) {
    return this.errors[errorCode] || `Неизвестная ошибка (код: ${errorCode})`;
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

  makePacket: function (deviceAddress, command, data = []) {
    if (command === 0x01) {
      deviceAddress = [0x00, 0x00, 0x00];
    }

    const packet = [...deviceAddress, command, data.length + 2, ...data];
    const crc = this.calculateCRC(packet);
    packet.push(crc & 0xff);
    packet.push((crc >> 8) & 0xff);

    return packet;
  },

  checkResponseError: function (response, expectedCommand) {
    if (!response || response.length === 0) {
      throw new Error("Получен пустой ответ");
    }

    // Если код функции = ожидаемый + 0x80, значит это ошибка
    if (response[3] === expectedCommand + 0x80) {
      throw new Error(
        `Причина ошибки от ТОУ: ${this.getErrorMessage(response[5])}`,
      );
    }
    return true;
  },

  formatPacket: function (packet) {
    return packet
      .map((b) => "0x" + b.toString(16).toUpperCase().padStart(2, "0"))
      .join(" ");
  },

  // Преобразование массива байт в число (little-endian)
  bytesToInt: function (bytes) {
    let result = 0;
    for (let i = 0; i < bytes.length; i++) {
      result |= bytes[i] << (i * 8);
    }
    return result;
  },

  // Парсинг серийного номера из ответа
  parseSerialNumber: function (response) {
    const deviceAddress = [response[5], response[6], response[7]];
    const serialNumber = this.bytesToInt(deviceAddress);

    return {
      deviceAddress: deviceAddress,
      serialNumber: serialNumber,
      rawResponse: response,
    };
  },

  parseDeviceType: function (response) {
    const deviceType = [response[5], response[6], response[7]];

    return {
      deviceType: deviceType,
      buildMainSoftware: response[8],
      versionMainSoftware: response[9],
      buildAddSoftware: response[10],
      versionAddSoftware: response[11],
      rawResponse: response,
    };
  },

  parseOperTime: function (response) {
    const operTime = [response[5], response[6], response[7], response[8]];

    return {
      operTime: operTime,
      rawResponse: response,
    };
  },

  formatOperTime: function (operTime) {
    const numOperTime = this.bytesToInt(operTime);

    return {
      dayOperTime: Math.floor(numOperTime / 86400),
      hourOperTime: Math.floor((numOperTime % 86400) / 3600),
      minuteOperTime: Math.floor((numOperTime % 3600) / 60),
      secOperTime: numOperTime % 60,
    };
  },

  parseTime: function (response) {
    return {
      yearTime: response[5],
      monthTime: response[6],
      dayTime: response[7],
      hourTime: response[8],
      minuteTime: response[9],
      secTime: response[10],
      rawResponse: response,
    };
  },

};