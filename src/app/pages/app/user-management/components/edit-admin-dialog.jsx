import { useState } from "react";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";

import { toast } from "@/components/ui/toast";
import { PencilSimpleIcon } from "@phosphor-icons/react";

// Função que adicionamos na Correção 4A.
import { atualizarUsuario } from "@/lib/api";

export default function EditAdminDialog({ user, onUpdated }) {
  const [openDialog, setOpenDialog] = useState(false);

  // Utilizamos os nomes de campos reais do backend.
  const [name, setName] = useState(user.nome_completo ?? "");
  const [username, setUsername] = useState(user.apelido ?? "");
  const [status, setStatus] = useState(user.status ?? "ATIVO");
  const [role, setRole] = useState(user.tipo ?? "BASICO");

  // Controlam erros e o estado do envio.
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ADM_ROLES = [
    { label: "Administrador Básico", value: "BASICO" },
    { label: "Administrador Mestre", value: "MESTRE" },
  ];

  const ADM_STATUS = [
    { label: "Ativo", value: "ATIVO" },
    { label: "Inativo", value: "INATIVO" },
  ];

  // Atualiza os campos quando a janela é aberta.
  function handleOpenChange(open) {
    if (open) {
      setName(user.nome_completo ?? "");
      setUsername(user.apelido ?? "");
      setStatus(user.status ?? "ATIVO");
      setRole(user.tipo ?? "BASICO");
      setErro("");
    }

    setOpenDialog(open);
  }

  // Envia as alterações ao backend.
  async function handleSubmit(event) {
    event.preventDefault();

    if (enviando) return;

    if (!name.trim()) {
      setErro("O nome é obrigatório.");
      return;
    }

    setErro("");
    setEnviando(true);

    try {
      await atualizarUsuario(user.id_usuario, {
        nome: name.trim(),
        apelido: username.trim() || null,
        status: status,
        tipo: role,
      });

      // Avisa à tabela que o usuário foi atualizado.
      onUpdated?.();

      // Só exibe sucesso depois da resposta da API.
      toast.add({
        type: "success",
        description: "Administrador editado com sucesso.",
      });

      setOpenDialog(false);
    } catch (error) {
      // Mantém o formulário aberto quando ocorre um erro.
      setErro(error.message || "Erro ao atualizar usuário.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Dialog open={openDialog} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <PencilSimpleIcon />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Usuário</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Field>
              <Label htmlFor="name">Nome</Label>
              <Input required id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>

            <Field>
              <Label htmlFor="username">Apelido</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Field>

            <Field>
              <Label htmlFor="status">Status</Label>
              <Select required items={ADM_STATUS} value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {ADM_STATUS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <Label htmlFor="role">Tipo</Label>
              <Select required items={ADM_ROLES} value={role} onValueChange={setRole}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione um cargo" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    {ADM_ROLES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit" variant="default" disabled={enviando}>
              {enviando ? "Salvando..." : "Editar"}
            </Button>

            <DialogClose>
              <Button type="button" variant="outline" disabled={enviando}>
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
