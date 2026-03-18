import { Table, Input, Button, VStack } from "@chakra-ui/react";
import { useInput } from "../../hooks/useInput";

interface MacAddressItem {
  name: string,
  value: string,
}

interface MacAddressProps {
  macAddress: MacAddressItem[];
  onMacAddress: () => void;
}

export function MacAddressDevices({macAddress, onMacAddress}: MacAddressProps) {
  const {newMacAddress, handleChangeMacAddress, resetMacAddress} = useInput();

  const handleSaveMacAddress = () => {
    alert(newMacAddress);
    onMacAddress(); // нужна функция преобразования строки в массив [0x01, 0x0C, 0xCD, 0x04, 0x00, 0x01]
    resetMacAddress();
  }

  return (
    <VStack>
      <Table.Root size="lg" interactive maxWidth="400px">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Устройство</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">MAC-адрес</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {macAddress.map((address) => (
            <Table.Row key={address.name}>
              <Table.Cell>{address.name}</Table.Cell>
              <Table.Cell textAlign="end">{address.value}</Table.Cell>
            </Table.Row>
          ))}
          <Table.Row>
            <Table.Cell>Новый MAC-адрес подключенного устройства</Table.Cell>
            <Table.Cell textAlign="end">
              <Input 
                type="text"
                value={newMacAddress}
                onChange={handleChangeMacAddress}
                placeholder="00:00:00:00:00:00"
              >
              </Input>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
      <Button onClick={handleSaveMacAddress}>
        Записать
      </Button>
    </VStack>
  )
}
