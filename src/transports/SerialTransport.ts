// Только работа с последовательным портом. Ничего не знает о ТОУ

interface SerialPort {
  readable: ReadableStream;
  writable: WritableStream;
  open(opttions: {baudRate: number, dataBits: number, stopBits: number, parity: string}): Promise<void>;
  close(): Promise<void>;
}

declare global {
  interface Navigator {
    serial: {
      requestPort(): Promise<SerialPort>;
    };
  }
}

export class SerialTransport {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private _isConnected: boolean = false;

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<void> {
    try {
      if (this._isConnected) {
        throw new Error("Порт уже подключен");
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
      this._isConnected = true;
    } catch (err) {
      await this.disconnect();
      console.error((err as Error).message);
      throw new Error("Ошибка подключения: " + (err as Error).message);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (!this._isConnected) {
        return;
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

      this._isConnected = false;
    } catch (err) {
      console.error((err as Error).message);
      throw new Error("Ошибка отключения: " + (err as Error).message);
    }
  }

  public async sendReceive(data: Uint8Array): Promise<Uint8Array> {
    await this.send(data);
    const response = await this.receive();

    return response;
  }

  public async send(data: Uint8Array): Promise<void> {
    if (!this._isConnected || !this.writer || !this.reader) {
      throw new Error("Нет подключения к устройству");
    }

    await this.writer.write(data);
  }

  public async receive(): Promise<Uint8Array> {
    if (!this._isConnected || !this.reader) {
      throw new Error("Нет подключения к устройству");
    }
    const chunks: Uint8Array[] = [];

    while (true) {
      const { value, done } = await this.reader.read();

      if (done) {
        await this.disconnect();
        throw new Error("Соединение потеряно");
      }

      chunks.push(value);
      const fullResponse = new Uint8Array(chunks.flatMap(chunks=>[...chunks]));

      if (fullResponse.length >= 5) {
        const expectedLength = 5 + fullResponse[4];

        if (fullResponse.length === expectedLength) {
          return fullResponse;
        }
      }
    }
  }
  
}
