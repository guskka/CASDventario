import { useEffect, useState } from "react";

import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";

import UsersDataTable from "../app/pages/app/user-management/columns";
import { listarUsuarios } from "@/lib/api";
import { USUARIOS_ALTERADOS } from "@/lib/eventos";

// Busca os administradores na API e converte os nomes dos campos do banco
// para os nomes usados pelas colunas da tabela.
async function fetchUsers() {
  const usuarios = await listarUsuarios();

  return usuarios.map((u) => ({
    id: u.id_usuario,
    name: u.nome_completo,
    username: u.apelido ?? "",
    email: u.email,
    status: u.status,
    role: u.tipo,
  }));
}

export default function TableSection({ title }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [sorted, getSorted] = useState([{ id: "status", desc: false }]);

  const ORDER_BY = [
    { label: "ID", value: "id" },
    { label: "Nome", value: "name" },
    { label: "Status", value: "status" },
    { label: "Cargo", value: "role" },
  ];

  const handleOrderByChange = (columnId) => {
    if (!columnId) {
      return;
    }

    getSorted([{ id: columnId, desc: sorted[0]?.desc }]);
  };

  const [erro, setErro] = useState("");

  useEffect(() => {
    function carregar() {
      fetchUsers()
        .then((data) => {
          setUsers(data);
          setErro("");
        })
        .catch((error) => {
          setErro(error.message);
        });
    }

    carregar();

    // Recarrega a lista quando um administrador é editado ou cadastrado.
    window.addEventListener(USUARIOS_ALTERADOS, carregar);
    return () => window.removeEventListener(USUARIOS_ALTERADOS, carregar);
  }, []);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">{title}</h4>

        <div className="flex gap-4">
          <div className="flex gap-2">
            <Select
              items={ORDER_BY}
              value={sorted[0]?.id}
              onValueChange={handleOrderByChange}
              defaultValue="order_status"
            >
              <Tooltip>
                <TooltipTrigger render={<SelectTrigger />}>
                  <SelectValue />
                </TooltipTrigger>
                <TooltipContent side="bottom">Ordenar por</TooltipContent>
              </Tooltip>
              <SelectContent>
                <SelectGroup>
                  {ORDER_BY.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2 transition-all ease-in-out">
            <InputGroup>
              <InputGroupInput
                placeholder={`Buscar ${title.toLowerCase()}...`}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
              />

              <InputGroupAddon>
                <MagnifyingGlassIcon />
              </InputGroupAddon>
            </InputGroup>
          </div>
        </div>
      </div>

      <div className="p-4 w-full transition-all ease-in-out">
        {erro && (
          <p className="mb-4 text-sm text-destructive">
            Não foi possível carregar os administradores: {erro}
          </p>
        )}
        <UsersDataTable
          users={users}
          filterValue={globalFilter}
          sorting={sorted}
          onSortingChange={getSorted}
        />
      </div>
    </div>
  );
}
