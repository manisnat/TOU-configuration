import { Button, Group } from "@chakra-ui/react";
import { useDeviceStore } from "../../store/deviceStore";

interface DeviceControlsProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function DeviceControls({ 
  onConnect, 
  onDisconnect, 
}: DeviceControlsProps) {

  const isConnected = useDeviceStore((state) => state.isConnected);

  return (
    <Group attached>
      <Button onClick={onConnect} disabled={isConnected}>
        Подключиться
      </Button>
      <Button onClick={onDisconnect} disabled={!isConnected}>
        Отключиться
      </Button>
    </Group>
  );
}