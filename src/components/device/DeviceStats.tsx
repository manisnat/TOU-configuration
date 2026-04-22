import { Button, DataList, VStack } from "@chakra-ui/react";
import { InfoTip } from "../ui/toggle-tip";
import { useDeviceStore } from "../../store/deviceStore";

interface StatItem {
  label: string,
  value: string,
  helpText: string;
}

interface DeviceStatsProps {
  onRefreshTime: () => Promise<void>;
  onRefreshOperTime: () => Promise<void>;
}

export function DeviceStats({onRefreshTime, onRefreshOperTime}: DeviceStatsProps) {
  const isConnected = useDeviceStore((state) => state.isConnected);
  const stats = useDeviceStore((state) => state.stats);

  const listStats: StatItem[] = [
    { label: "Серийный номер", value: `${stats.serialNumber || "—"}`, helpText: "Уникальный идентификатор устройства" },
    { label: "Тип устройства", value: stats.deviceType ? `РиМ ТОУ ${stats.deviceType}` : "—", helpText: "Код модели" },
    { label: "Версия ПО", value: `${stats.mainSoftware || "—"}`, helpText: "Основное программное обеспечение" },
    { label: "Доп ПО", value: `${stats.additionalSoftware || "—"}`, helpText: "Дополнительное программное обеспечение"},
    { label: "Время наработки", value: `${stats.operTime || "—"}`, helpText: "С момента запуска" },
    { label: "Текущее время", value: `${stats.currentTime || "—"}`, helpText: "Время в устройстве" },
  ];

  const handleRefreshFullTime = async () => {
    await onRefreshTime();
    await onRefreshOperTime();
  }

  return (
    <VStack gap={4}>
      <DataList.Root size="lg">
        {listStats.map((item) => (
          <DataList.Item key={item.label}>
            <DataList.ItemLabel>
              {item.label}
            <InfoTip>{item.helpText}</InfoTip>
          </DataList.ItemLabel>
          <DataList.ItemValue>{item.value}</DataList.ItemValue>
        </DataList.Item>
        ))}
      </DataList.Root>
      <Button onClick={handleRefreshFullTime} disabled={!isConnected}>
        Обновить время
      </Button>
    </VStack>
  )
}