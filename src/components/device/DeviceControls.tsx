import { Button, Group, HStack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";

interface DeviceControlsProps {
  connected: boolean;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function DeviceControls({ 
  connected,
  onConnect, 
  onDisconnect, 
}: DeviceControlsProps) {
  return (
    <HStack>
      <Group attached>
        <Button onClick={onConnect} disabled={connected}>
          Подключиться
        </Button>
        <Button onClick={onDisconnect} disabled={!connected}>
          Отключиться
        </Button>
      </Group>
      <ColorModeButton bg={"bg.emphasized"} />
    </HStack>
  );
}