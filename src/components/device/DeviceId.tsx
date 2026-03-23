import { Button, Field, Input, Table } from "@chakra-ui/react";
import { useInput } from "../../hooks/useInput";
import { toaster } from "../ui/toaster";

interface DeviceIdPops {
  idSV: string,
  idVlan: string,
  successIdSV: boolean;
  successIdVlan: boolean;
  onIdVlan: (idVlan: number) => void;
  onIdSV: (idSV: string) => void;
}

export function DeviceId({idSV, idVlan, successIdSV, successIdVlan, onIdVlan, onIdSV}: DeviceIdPops) {
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

  const handleSaveIdSV = async () => {
    const cleanIdSV = newIdSV.replace(/\s+/g, '');
    const isValid = validIdSV(cleanIdSV);
    if (!isErrorIdSV && isValid && cleanIdSV.length <= 12) {
      await onIdSV(cleanIdSV);
      if (successIdSV) {
        toaster.create({
          description: "SV id успешно записан",
          type: "success",
        });
      }
    }
  }

  const handleSaveIdVlan = async () => {
    const cleanIdVlan = newIdVlan.replace(/[^0-9]/g, '');
    const isValid = validIdVlan(cleanIdVlan);
    if (!isErrorIdVlan && isValid) {
      await onIdVlan(Number(cleanIdVlan));
      if (successIdVlan) {
        toaster.create({
          description: "Vlan id успешно записан",
          type: "success",
        });
      }
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