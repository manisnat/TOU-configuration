import { Button, DataList, VStack } from "@chakra-ui/react";
import { InfoTip } from "../ui/toggle-tip";

interface StatItem {
  label: string,
  value: string,
  helpText: string;
}

interface DeviceStatsProps {
  connected: boolean;
  stats: StatItem[];
  onRefreshTime: () => Promise<void>;
  onRefreshOperTime: () => Promise<void>;
}

export function DeviceStats({connected, stats, onRefreshTime, onRefreshOperTime}: DeviceStatsProps) {
  const handleRefreshFullTime = async () => {
    await onRefreshTime();
    await onRefreshOperTime();
  }

  return (
    <VStack gap={4}>
      <DataList.Root size={"lg"}>
        {stats.map((item) => (
          <DataList.Item key={item.label}>
            <DataList.ItemLabel>
              {item.label}
            <InfoTip>{item.helpText}</InfoTip>
          </DataList.ItemLabel>
          <DataList.ItemValue>{item.value}</DataList.ItemValue>
        </DataList.Item>
        ))}
      </DataList.Root>
      <Button onClick={handleRefreshFullTime} disabled={!connected}>
        Обновить время
      </Button>
    </VStack>
  )
}