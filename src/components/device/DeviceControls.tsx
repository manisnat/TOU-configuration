import { Button, Group, HStack } from "@chakra-ui/react";
import { ColorModeButton } from "../ui/color-mode";

interface DeviceControlsProps {
  onConnect: () => void;
  onDisconnect: () => void;
  onSetTime: () => void;
  onRefreshTime: () => void;
  onRecordIdVlan: () => void;
}

export function DeviceControls({ 
  onConnect, 
  onDisconnect, 
  onSetTime, 
  onRefreshTime,
  onRecordIdVlan,
}: DeviceControlsProps) {
  return (
    <HStack>
      <Group attached>
        <Button onClick={onConnect}>Подключиться</Button>
        <Button onClick={onDisconnect}>Отключиться</Button>
        <Button onClick={onSetTime}>Настроить время</Button>
        <Button onClick={onRefreshTime}>Обновить время</Button>
        <Button onClick={onRecordIdVlan}>Записать id vlan</Button>
      </Group>
      <ColorModeButton bg={"bg.emphasized"} />
    </HStack>
  );
}