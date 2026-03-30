import { Table, Input, Button, VStack, Field, Tooltip } from "@chakra-ui/react";
import { withMask } from "use-mask-input";
import { toaster } from "../ui/toaster";
import { useMacAddress } from "../../hooks/useMacAddress";

interface MacAddressItem {
  name: string,
  value: string,
}

interface MacAddressProps {
  connected: boolean;
  macAddress: MacAddressItem[];
  successMacAddress: boolean;
  onMacAddress: (macAddress: number[]) => Promise<void>;
}

export function MacAddressDevices({connected, macAddress, successMacAddress, onMacAddress}: MacAddressProps) {
  const {
    newMacAddress, 
    isErrorMac, 
    errorMessageMac, 
    validMacAddress, 
    handleChangeMacAddress
  } = useMacAddress();

  // 01:0C:CD:04:00:01
  function macToArray(macString: string): number[] {
    const cleanMac = macString.replace(/[:\-\s]/g, '');

    const macArray = [];
    for (let i = 0; i < cleanMac.length; i+=2) {
      macArray.push(parseInt(cleanMac.slice(i,i+2), 16));
    }

    return macArray;
  }

  const handleSaveMacAddress = async () => {
    const cleanMac = newMacAddress.replace(/[^0-9A-Za-z]/g, '');
    const isValid = validMacAddress(cleanMac);
    if (!isErrorMac && isValid) {
      await onMacAddress(macToArray(newMacAddress));
      if (successMacAddress) {
        toaster.create({
          description: "MAC-адрес успешно записан",
          type: "success",
        });
      } else {
        toaster.create({
          description: "Ошибка при записи MAC-адреса",
          type: "error",
        });
      }
    } else {
      toaster.create({
        description: errorMessageMac || "Неверный MAC-адрес",
        type: "error",
      });
    }

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
            <Table.Cell>
              Новый MAC-адрес подключенного устройства
            </Table.Cell>
            <Table.Cell textAlign="end">
              <Field.Root invalid={isErrorMac}>
              <Input 
                type="text"
                value={newMacAddress}
                onChange={handleChangeMacAddress}
                placeholder="00:00:00:00:00:00"
                maxLength={17}
                ref={withMask("**:**:**:**:**:**")}
              >
              </Input>
              {/* {isErrorMac && <Field.ErrorText>{errorMessageMac}</Field.ErrorText>} */}
              </Field.Root>
            </Table.Cell>
          </Table.Row>
          
        </Table.Body>
      </Table.Root>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <Button onClick={handleSaveMacAddress} disabled={!connected}>
            Записать
          </Button>
        </Tooltip.Trigger>
        {/* <Tooltip.Content>
          MAC-адрес должен быть в формате 01:0C:CD:04:XX:XX для корректной работы
        </Tooltip.Content> */}
      </Tooltip.Root>
    </VStack>
  )
}
