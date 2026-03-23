import { Button, Input, Table } from "@chakra-ui/react";
import { useInput } from "../../hooks/useInput";

interface DeviceIdPops {
  idSV: string,
  idVlan: string,
  onIdVlan: (idVlan: number) => void;
  onIdSV: (idSV: string) => void;
}

export function DeviceId({idSV, idVlan, onIdVlan, onIdSV}: DeviceIdPops) {
  const {newIdVlan, newIdSV, handleChangeIdVlan, handleChangeIdSV, resetIdVlan, resetIdSV} = useInput();

  const handleSaveIdVlan = () => {
    onIdVlan(Number(newIdVlan));
    resetIdVlan();
  }

  const handleSaveIdSV = () => {
    onIdSV(newIdSV);
    resetIdSV();
  }

  return (
    <Table.Root size="lg" interactive maxWidth="550px">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader></Table.ColumnHeader>
          <Table.ColumnHeader>Текущий</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="end">Новый</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row key="SVId">
          <Table.Cell>SV ID устройства</Table.Cell>
          <Table.Cell>{idSV || "—"}</Table.Cell>
          <Table.Cell>
            <Input 
              type="text"
              value={newIdSV}
              onChange={handleChangeIdSV}
            />
          </Table.Cell>
          <Table.Cell textAlign="end">
            <Button onClick={handleSaveIdSV}>
              Записать
            </Button>
          </Table.Cell>
        </Table.Row>
        <Table.Row key="VlanId">
          <Table.Cell>Vlan ID устройства</Table.Cell>
          <Table.Cell>{idVlan || "—"}</Table.Cell>
          <Table.Cell>
            <Input 
              type="text"
              value={newIdVlan}
              onChange={handleChangeIdVlan}
              placeholder="0 - 4095" 
              maxLength={4}
            />
          </Table.Cell>
          <Table.Cell textAlign="end">
            <Button onClick={handleSaveIdVlan}>
              Записать
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  )
}