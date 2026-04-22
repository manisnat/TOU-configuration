import { Container, VStack, Heading, Text, Icon } from "@chakra-ui/react";
import { FaExclamationTriangle } from "react-icons/fa";

interface WebSerialCheckerProps {
  children: React.ReactNode;
}

export function WebSerialChecker({ children }: WebSerialCheckerProps) {
  const isSerialSupported = typeof navigator !== 'undefined' && !!navigator.serial;

  if (!isSerialSupported) {
    return (
      <Container maxW="container.md">
        <VStack gap={5} padding={100} textAlign="center">
          <Icon as={FaExclamationTriangle} boxSize={20} 
            color="red.700" 
          />
          <Heading size="2xl">Web Serial API не поддерживается!</Heading>
          <Text>Пожалуйста, используйте браузер Chrome или Edge для работы с устройством.</Text>
        </VStack>
      </Container>
    );
  }

  return <>{children}</>;
}