import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';
import { PencilSimpleIcon } from '@phosphor-icons/react';

export default function EditAdminDialog() {
  // REMOVER ISTO AQUI DEPOIS NA HORA DE FAZER COM A API
  // APENAS PARA MOCK
  const [cargo, setCargo] = useState('');
  const [status, setStatus] = useState('');

  const ADM_ROLES = [
    { label: 'Administrador Básico', value: 'normalAdm' },
    { label: 'Administrador Mestre', value: 'masterAdm' },
  ];
  const ADM_STATUS = [
    {
      label: 'Ativo',
      value: 'active',
    },
    {
      label: 'Inativo',
      value: 'inactive',
    },
  ];
  // REMOVER ATE AQUI

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <PencilSimpleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Nome</Label>
              <Input required id="name" />
            </Field>
            <Field>
              <Label htmlFor="username">Apelido</Label>
              <Input required id="username" />
            </Field>
            <Field>
              <Label htmlFor="status">Status</Label>
              <Select
                required
                id="status"
                items={ADM_STATUS}
                value={status}
                onValueChange={setStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ADM_STATUS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="role">Tipo</Label>
              <Select
                required
                id="role"
                items={ADM_ROLES}
                value={cargo}
                onValueChange={setCargo}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ADM_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <Label htmlFor="email" className="opacity-50">
                Email
              </Label>
              <Input disabled id="email" />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit" variant="default">
              Editar
            </Button>
            <DialogClose>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
