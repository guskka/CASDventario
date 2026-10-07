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

async function fetchUsers() {
  const response = await fetch("http://localhost:4000/users");

  if (!response.ok) {
    throw new Error(`Erro ao buscar usuários: ${response.status}`);
  }

  return response.json();
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

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error("Erro ao carregar administradores:", error);
      });
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
