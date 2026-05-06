import { Box, VStack, Text, HStack, Button, Spinner } from "@chakra-ui/react";
import { useDeviceStore } from "../../store/deviceStore";
import { useState } from "react";

interface LogConsoleProps {
  onReadLog: (numLog: number) => Promise<void>;
}

export function LogConsole({ onReadLog }: LogConsoleProps) {
  const log = useDeviceStore((state) => state.log);
  const isConnected = useDeviceStore((state) => state.isConnected);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    if (!isConnected) return;
    setIsLoading(true);
    try {
      await onReadLog(1); // 1 - журнал включений/отключений
    } finally {
      setIsLoading(false);
    }
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
      <HStack justify="space-between" mb={3}>
        <Text fontWeight="bold">Журнал включений/отключений</Text>
        <Button 
          size="xs" 
          onClick={handleRefresh} 
          disabled={!isConnected}
        >
          {isLoading ? <Spinner size="xs" /> : "Обновить"}
        </Button>
      </HStack>

      {log.timeLast && (
        <HStack justify="space-between" fontSize="xs" color="gray.500" mb={3}>
          <Text>Последняя запись: {log.timeLast}</Text>
          <Text>Всего записей: {log.capacity}</Text>
        </HStack>
      )}
      
      <Box 
        maxH="400px" 
        overflowY="auto"
        fontFamily="mono"
        fontSize="13px"
      >
        {isLoading && log.entries.length === 0 ? (
          <HStack justify="center" py={4}>
            <Spinner size="sm" />
            <Text>Загрузка...</Text>
          </HStack>
        ) : log.entries.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={4}>
            Нет записей
          </Text>
        ) : (
          <VStack align="stretch" gap={0}>
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
                <Text>
                  {entry.event}
                </Text>
              </HStack>
            ))}
          </VStack>
        )}
      </Box>
    </Box>
  );
}