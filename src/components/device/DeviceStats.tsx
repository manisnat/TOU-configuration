import { DataList } from "@chakra-ui/react";
import { InfoTip } from "../ui/toggle-tip";

interface StatItem {
  label: string,
  value: string,
  helpText: string;
}

interface DeviceStatsProps {
  stats: StatItem[];
}

export function DeviceStats({stats}: DeviceStatsProps) {
  return (
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
  )
}