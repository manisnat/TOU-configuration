import { Button, Group, HStack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";

interface DeviceControlsProps {
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  // onSetTime: () => Promise<void>;
  onRefreshTime: () => Promise<void>;
}

export function DeviceControls({ 
  onConnect, 
  onDisconnect, 
  // onSetTime, 
  onRefreshTime,
}: DeviceControlsProps) {
  return (
    <HStack>
      <Group attached>
        <Button onClick={onConnect}>Подключиться</Button>
        <Button onClick={onDisconnect}>Отключиться</Button>
        {/* <Button onClick={onSetTime}>Настроить время</Button> */}
        <Button onClick={onRefreshTime}>Обновить время</Button>
      </Group>
      <ColorModeButton bg={"bg.emphasized"} />
    </HStack>
  );
}