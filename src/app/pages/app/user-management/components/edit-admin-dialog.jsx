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
import { toast } from '@/components/ui/toast';
import { PencilSimpleIcon } from '@phosphor-icons/react';

export default function EditAdminDialog({ user }) {
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [status] = useState(user.status);
  const [role] = useState(user.role);

  const ADM_ROLES = [
    { label: 'Administrador Básico', value: 'BASICO' },
    { label: 'Administrador Mestre', value: 'MESTRE' },
  ];
  const ADM_STATUS = [
    { label: 'Ativo', value: 'ATIVO' },
    { label: 'Inativo', value: 'INATIVO' },
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={(open) => setOpenDialog(open)}>
      <DialogTrigger>
        <Button variant="ghost" size="icon" onClick={() => setOpenDialog(true)}>
          <PencilSimpleIcon />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <Label htmlFor="name">Nome</Label>
              <Input
                required
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="username">Apelido</Label>
              <Input
                required
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="status">Status</Label>
              <Select required id="status" items={ADM_STATUS} defaultValue={status === "PENDENTE" ? "ATIVO" : status}>
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
              <Label htmlFor="role">Cargo</Label>
              <Select required id="role" items={ADM_ROLES} defaultValue={role}>
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
          </FieldGroup>
          <DialogFooter>
            <Button
              type="submit"
              variant="default"
              onClick={() =>
                toast.add({
                  type: 'success',
                  description: 'Administrador editado com sucesso.',
                })
              }
            >
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
