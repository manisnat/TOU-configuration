import { Button, Field, Input, Table } from "@chakra-ui/react";
import { useInput } from "../../hooks/useInput";

interface DeviceIdPops {
  idSV: string,
  idVlan: string,
  onIdVlan: (idVlan: number) => void;
  onIdSV: (idSV: string) => void;
}

export function DeviceId({idSV, idVlan, onIdVlan, onIdSV}: DeviceIdPops) {
  const { 
    newIdSV, 
    isErrorIdSV,
    errorMessageIdSV,
    validIdSV,
    handleChangeIdSV,  
    newIdVlan, 
    isErrorIdVlan,
    errorMessageIdVlan,
    validIdVlan,
    handleChangeIdVlan
  } = useInput();

  const handleSaveIdSV = () => {
    const cleanIdSV = newIdSV.replace(/\s+/g, '');
    const isValid = validIdSV(cleanIdSV);
    if (!isErrorIdSV && isValid && cleanIdSV.length <= 12) {
      onIdSV(cleanIdSV);
    }
  }

  const handleSaveIdVlan = () => {
    const cleanIdVlan = newIdVlan.replace(/[^0-9]/g, '');
    const isValid = validIdVlan(cleanIdVlan);
    if (!isErrorIdVlan && isValid) {
      onIdVlan(Number(cleanIdVlan));
    }
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
            <Field.Root invalid={isErrorIdSV}>
              <Input 
                type="text"
                value={newIdSV}
                onChange={handleChangeIdSV}
                maxLength={12}
              />
              {isErrorIdSV && <Field.ErrorText>{errorMessageIdSV}</Field.ErrorText>}
            </Field.Root>
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
            <Field.Root invalid={isErrorIdVlan}>
              <Input 
                type="text"
                value={newIdVlan}
                onChange={handleChangeIdVlan}
                placeholder="0 - 4095" 
                maxLength={4}
              />
              {isErrorIdVlan && <Field.ErrorText>{errorMessageIdVlan}</Field.ErrorText>}
            </Field.Root>
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