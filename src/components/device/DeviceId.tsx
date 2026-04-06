import { Button, Field, Input, Table } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const svIdSchema = z.object({
  svId: z
    .string()
    .min(1, "SV ID не может быть пустым")
    .max(12, "SV ID не должен превышать 12 символов"),
});

const vlanIdSchema = z.object({
  vlanId: z
    .string()
    .min(1, "Vlan ID не может быть пустым")
    .regex(/^\d+$/, "Vlan ID должен содержать только цифры")
});

type SvIdForm = z.infer<typeof svIdSchema>;
type VlanIdForm = z.infer<typeof vlanIdSchema>;

interface DeviceIdPops {
  connected: boolean;
  idSV: string;
  idVlan: string;
  successIdSV: boolean;
  successIdVlan: boolean;
  onIdVlan: (idVlan: number) => Promise<void>;
  onIdSV: (idSV: string) => Promise<void>;
}

export function DeviceId({
  connected,
  idSV,
  idVlan,
  successIdSV,
  successIdVlan,
  onIdVlan,
  onIdSV,
}: DeviceIdPops) {

  const {
    register: registerSV,
    handleSubmit: handleSubmitSV,
    formState: { errors: svErrors },
  } = useForm<SvIdForm>({
    resolver: zodResolver(svIdSchema),
    mode: "onChange",
    defaultValues: {
      svId: "", 
    },
  });

  const {
    register: registerVlan,
    handleSubmit: handleSubmitVlan,
    formState: { errors: vlanErrors },
  } = useForm<VlanIdForm>({
    resolver: zodResolver(vlanIdSchema),
    mode: "onChange",
    defaultValues: {
      vlanId: "", 
    },
  });

  // Обработчик отправки SV ID через react-hook-form
  const onSVSubmit = async (data: SvIdForm) => {
    const cleanIdSV = data.svId.replace(/\s+/g, "");

    try {
      await onIdSV(cleanIdSV);
      if (successIdSV) {
        toaster.create({
          description: `SV ID ${cleanIdSV} успешно записан`,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        description: "Ошибка при записи SV id",
        type: "error",
      });
    }
  };


  // Обработчик отправки VLAN через react-hook-form
  const onVlanSubmit = async (data: VlanIdForm) => {
    const vlanNumber = Number(data.vlanId);

    if (vlanNumber < 0 || vlanNumber > 4095) {
      toaster.create({
        description: "Vlan ID должен быть от 0 до 4095",
        type: "error",
      });
      return;
    }

    try {
      await onIdVlan(vlanNumber);
      if (successIdVlan) {
        toaster.create({
          description: `Vlan ID ${vlanNumber} успешно записан`,
          type: "success",
        });
      }
    } catch (error) {
      toaster.create({
        description: "Ошибка при записи Vlan id",
        type: "error",
      });
    }
  };

  return (
    <Table.Root size="md" interactive maxWidth="550px">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeader></Table.ColumnHeader>
          <Table.ColumnHeader>Текущий</Table.ColumnHeader>
          <Table.ColumnHeader textAlign="end">Новый</Table.ColumnHeader>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {/* SV ID */}
        <Table.Row key="SVId">
          <Table.Cell>SV ID устройства</Table.Cell>
          <Table.Cell>{idSV || "—"}</Table.Cell>
          <Table.Cell>
            <Field.Root invalid={!!svErrors.svId}>
              <Input
                type="text"
                {...registerSV("svId")}
                maxLength={12}
              />
              {svErrors.svId && (
                <Field.ErrorText>{svErrors.svId.message}</Field.ErrorText>
              )}
            </Field.Root>
          </Table.Cell>
          <Table.Cell textAlign="end">
            <Button 
              onClick={handleSubmitSV(onSVSubmit)} 
              disabled={!connected || !!svErrors.svId}
            >
              Записать
            </Button>
          </Table.Cell>
        </Table.Row>

        {/* VLAN ID */}
        <Table.Row key="VlanId">
          <Table.Cell>Vlan ID устройства</Table.Cell>
          <Table.Cell>{idVlan || "—"}</Table.Cell>
          <Table.Cell>
            <Field.Root invalid={!!vlanErrors.vlanId}>
              <Input
                type="text"
                {...registerVlan("vlanId")}
                placeholder="0 - 4095"
                maxLength={4}
              />
              {vlanErrors.vlanId && (
                <Field.ErrorText>{vlanErrors.vlanId.message}</Field.ErrorText>
              )}
            </Field.Root>
          </Table.Cell>
          <Table.Cell textAlign="end">
            <Button
              onClick={handleSubmitVlan(onVlanSubmit)}
              disabled={!connected || !!vlanErrors.vlanId}
            >
              Записать
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}