import { Box, VStack, Text, HStack, Button, Spinner, Select, Portal, Group, Progress } from "@chakra-ui/react";
import { useDeviceStore } from "../../store/deviceStore";
import { useState } from "react";
import { createListCollection } from "@chakra-ui/react";

interface LogConsoleProps {
  onReadLog: (numLog: number) => Promise<void>;
  onCleanLogStore: () => void;
}

const logCollection = createListCollection({
  items: [
    { label: "Журнал включений/отключений", value: "1" },
    { label: "Журнал коррекций", value: "2" },
    { label: "Журнал неисправностей", value: "3" },
    { label: "Журнал подключений", value: "4" },
  ]
});

export function LogConsole({ onReadLog, onCleanLogStore }: LogConsoleProps) {
  const log = useDeviceStore((state) => state.log);
  const isConnected = useDeviceStore((state) => state.isConnected);
  const loadingProgressLog = useDeviceStore((state) => state.loadingProgressLog);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<string>("1");

  const handleRefresh = async () => {
    if (!isConnected) return;
    setIsLoading(true);
    onCleanLogStore();
    try {
      await onReadLog(Number(selectedLog));
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const handleClean = async () => {
    if (!isConnected) return;
    onCleanLogStore();
    setIsLoading(false);
  };

  return (
    <Box 
      borderWidth="1px" 
      borderRadius="md" 
      p={4}
      w="100%"
      minW="450px"
      maxW="1300px"
      margin="auto"
    >
      <Text fontWeight="bold" p={2}>Выбрать журнал</Text>
      <HStack justify="space-between" mb={3}>
        <Select.Root
          collection={logCollection}
          size="sm"
          value={[selectedLog]}
          onValueChange={(details) => setSelectedLog(details.value[0])}
          width="300px"
          disabled={!isConnected}
        >
          <Select.HiddenSelect />
          <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Выберите журнал" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {logCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
        </Select.Root>
        <Group attached>
          <Button 
            size="xs" 
            onClick={handleRefresh} 
            disabled={!isConnected}
          >
            {isLoading ? <Spinner size="xs" /> : "Считать"}
          </Button>
          <Button 
            size="xs"
            onClick={handleClean}
            disabled={!isConnected}
          >
            Сбросить
          </Button>
        </Group>
      </HStack>

      {log.timeLast && (
        <HStack justify="space-between" fontSize="xs" color="gray.500" mb={3}>
          <Text>Последняя запись: {log.timeLast}</Text>
          <Text>Всего записей: {log.capacity}</Text>
        </HStack>
      )}

      {/* Прогресс-бар */}
      {isLoading && (
        <Box mb={3}>
          <Progress.Root value={loadingProgressLog} size="sm">
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
          <Text fontSize="xs" color="gray.500" mt={1} textAlign="center">
            Прогресс: {loadingProgressLog}%
          </Text>
        </Box>
      )}
      
      <Box 
        maxH="400px" 
        maxW={{ base: "450px", sm: "500px", md: "700px", lg: "1100px", xl: "1300px" }}
        overflowY="auto"
        overflowX="auto"
        fontFamily="mono"
        fontSize="13px"
      >
        {isLoading && log.entries.length === 0 ? (
          <HStack justify="center" minH="400px" py={4}>
            <Spinner size="sm" />
            <Text>Загрузка...</Text>
          </HStack>
        ) : log.entries.length === 0 ? (
          <Text color="gray.500" textAlign="center" minH="400px" py={4}>
            Нет записей
          </Text>
        ) : (
          <VStack align="stretch" gap={0} minW="max-content">
            {log.entries.map((entry, idx) => (
              <HStack 
                key={idx} 
                gap={3} 
                py={1.5} 
                px={1}
                borderBottomWidth="1px" 
                borderBottomColor="gray.100"
                _hover={{ bg: "gray.50", _dark: { bg: "gray.700" } }}
              >
                <Text minW="45px" color="gray.500">
                  {entry.number}
                </Text>
                <Text minW="180px" fontFamily="mono" fontSize="12px">
                  {entry.date}
                </Text>
                <Text minW="300px">
                  {entry.event}
                </Text>
                <Text minW="200px">
                  {entry.old}
                </Text>
                <Text minW="200px">
                  {entry.new}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}