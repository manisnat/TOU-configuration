import { Button, Group } from "@chakra-ui/react";
import { useDeviceStore } from "../../store/deviceStore";
import { toaster } from "../ui/toaster";

interface DeviceControlsProps {
  onConnect: () => Promise<boolean>;
  onDisconnect: () => Promise<boolean>;
}

export function DeviceControls({ 
  onConnect, 
  onDisconnect, 
}: DeviceControlsProps) {
  const isConnected = useDeviceStore((state) => state.isConnected);

  const handleConnect = async () => {
    const success = await onConnect();
    const currentError = useDeviceStore.getState().error;
    
    toaster.create({
      description: success
        ? "Успешно подключились к Serial Port"
        : `Ошибка при подключении к Serial Port: ${currentError || "Неизвестная ошибка"}`,
      type: success ? "success" : "error",
    });
  }

  const handleDisconnect = async () => {
    const success = await onDisconnect();
    const currentError = useDeviceStore.getState().error;
    
    toaster.create({
      description: success
        ? "Успешно отключились от Serial Port"
        : `Ошибка при отключении от Serial Port: ${currentError || "Неизвестная ошибка"}`,
      type: success ? "success" : "error",
    });
  }

  return (
    <Group attached>
      <Button onClick={handleConnect} disabled={isConnected}>
        Подключиться
      </Button>
      <Button onClick={handleDisconnect} disabled={!isConnected}>
        Отключиться
      </Button>
    </Group>
  );
}