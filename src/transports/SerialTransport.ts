// Только работа с последовательным портом. Ничего не знает о ТОУ

interface SerialPort {
  readable: ReadableStream;
  writable: WritableStream;
  open(options: { baudRate: number; dataBits: number; stopBits: number; parity: string }): Promise<void>;
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
  private isSending: boolean = false;
  private sendQueue: Array<{
    data: Uint8Array;
    resolve: (value: Uint8Array) => void;
    reject: (reason: Error) => void;
  }> = [];

  public get isConnected(): boolean {
    return this._isConnected;
  }

  public async connect(): Promise<void> {
    if (!navigator.serial) {
      throw new Error("Web Serial API не поддерживается. Используйте Chrome/Edge");
    }
    if (this._isConnected) {
      throw new Error("Порт уже подключен");
    }
    try {
      this.port = await navigator.serial.requestPort();

      if (!this.port) {
        throw new Error("Порт не выбран");
      }

      await this.port.open({
        baudRate: 115200,
        dataBits: 8,
        stopBits: 1,
        parity: "none",
      });

      if (!this.port.readable || !this.port.writable) {
        throw new Error("Порт не поддерживает чтение/запись");
      }

      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this._isConnected = true;
    } catch (err) {
      await this.disconnect();
      const error = err as Error;
    
      if (error.name === 'NotFoundError') {
        throw new Error("Выбор порта отменён пользователем");
      }
      if (error.name === 'NetworkError') {
        throw new Error("Порт уже используется другим приложением или недоступен");
      }
      throw new Error(`Ошибка подключения: ${error.message}`);
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (!this._isConnected) {
        return;
      }

      this.sendQueue = [];
      this.isSending = false;

      if (this.reader) {
        try {
          await this.reader.cancel();
          this.reader.releaseLock();
        } catch (err) {
          throw new Error(`Ошибка при закрытии reader: ${err}`);
        } finally {
          this.reader = null;
        }
      }

      if (this.writer) {
        try {
          await this.writer.close();
          this.writer.releaseLock();
        } catch (err) {
          throw new Error(`Ошибка при закрытии writer: ${err}`);
        } finally {
          this.writer = null;
        }
      }

      if (this.port) {
        try {
          if (this.port.readable || this.port.writable) {
            await this.port.close();
          }
        } catch (err) {
          throw new Error(`Ошибка при закрытии port: ${err}`);
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

  public async flushWriter(): Promise<void> {
    if (!this.writer || !this._isConnected) {
      return;
    }
    
    try {
      await this.writer.close();
      this.writer.releaseLock();
      
      if (this.port && this.port.writable) {
        this.writer = this.port.writable.getWriter();
      }
    } catch (err) {
      throw new Error(`Ошибка при очистке writer: ${err}`);
    }
  }

  public async resetWriter(): Promise<void> {
    if (!this.writer) return;
    
    try {
      await this.writer.close();
    } catch (err) {
      throw new Error(`Ошибка при закрытии writer: ${err}`);
    }
    
    try {
      this.writer.releaseLock();
    } catch (err) {
      throw new Error(`Ошибка при releaseLock: ${err}`);
    }
    
    if (this.port && this.port.writable) {
      this.writer = this.port.writable.getWriter();
    }
  }

  public async flushReader(): Promise<void> {
    if (!this.reader || !this._isConnected) {
      return;
    }
    
    try {
      let readCount = 0;
      let hasData = true;
      
      while (hasData && readCount < 50) {
        const timeoutPromise = new Promise<{ value: Uint8Array | undefined; done: boolean }>((resolve) => {
          setTimeout(() => resolve({ value: undefined, done: true }), 10);
        });
        
        const readPromise = this.reader.read();
        const { value, done } = await Promise.race([readPromise, timeoutPromise]);
        
        if (done) {
          hasData = false;
        }
        
        if (value && value.length > 0) {
          readCount++;
          console.log(`[flushReader] Отброшено ${value.length} байт`);
        }
      }
      
    } catch (err) {
      throw new Error(`Ошибка при очистке: ${err}`);
    }
    
    if (this.port && this.port.readable && this.reader) {
      try {
        this.reader.releaseLock();
      } catch (err) {}
      this.reader = this.port.readable.getReader();
    }
  }

  public async sendReceive(data: Uint8Array): Promise<Uint8Array> {
    // Очередь для последовательной отправки
    if (this.isSending) {
      return new Promise((resolve, reject) => {
        this.sendQueue.push({ data, resolve, reject });
      });
    }
    
    this.isSending = true;
    
    try {
      await this.flushReader();
      await this.flushWriter();
      
      await this.send(data);
      const response = await this.receive();
      
      return response;
    } finally {
      this.isSending = false;
      
      // Обрабатываем следующий запрос из очереди
      const next = this.sendQueue.shift();
      if (next) {
        this.sendReceive(next.data)
          .then(next.resolve)
          .catch(next.reject);
      }
    }
  }

  public async send(data: Uint8Array): Promise<void> {
    if (!this._isConnected || !this.writer) {
      throw new Error("Нет подключения к устройству");
    }

    try {
      await this.writer.write(data);
    } catch (err) {
      // При ошибке отправки сбрасываем writer
      await this.resetWriter();
      throw new Error(`Ошибка при отправки: ${err}`);
    }
  }

  public async receive(): Promise<Uint8Array> {
    if (!this._isConnected || !this.reader) {
      throw new Error("Нет подключения к устройству");
    }
    
    const chunks: Uint8Array[] = [];
    const startTime = Date.now();
    const TIMEOUT_MS = 3000;
    
    try {
      while (true) {
        // Проверка таймаута
        if (Date.now() - startTime > TIMEOUT_MS) {
          if (chunks.length > 0) {
            const partialResponse = this.concatChunks(chunks);
            return partialResponse;
          }
          throw new Error("Таймаут приёма данных");
        }
        
        const { value, done } = await this.reader.read();
        
        if (done) {
          if (chunks.length > 0) {
            const partialResponse = this.concatChunks(chunks);
            console.warn(`[receive] Соединение закрыто, возвращаем частичные данные (${partialResponse.length} байт)`);
            return partialResponse;
          }
          await this.disconnect();
          throw new Error("Соединение потеряно");
        }
        
        if (!value || value.length === 0) {
          continue;
        }
        
        chunks.push(value);
        const fullResponse = this.concatChunks(chunks);
        
        if (fullResponse.length >= 5) {
          const expectedLength = 5 + fullResponse[4];
          
          if (fullResponse.length >= expectedLength) {
            if (fullResponse.length > expectedLength) {
              console.warn(`[receive] Обрезаем лишние ${fullResponse.length - expectedLength} байт`);
              const result = fullResponse.slice(0, expectedLength);
              return result;
            }
            return fullResponse;
          }
        }
      }
    } catch (err) {
      throw new Error(`Ошибка при получении пакета: ${err}`);
    }
  }

  private concatChunks(chunks: Uint8Array[]): Uint8Array {
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    return result;
  }
}