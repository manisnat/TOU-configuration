import { Table } from "@chakra-ui/react";

interface MacAddressItem {
  name: string,
  value: string,
}

interface MacAddressProps {
  macAddress: MacAddressItem[];
}

export function MacAddressDevices({macAddress}: MacAddressProps) {
  return (
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
      </Table.Body>
    </Table.Root>
  )
}
