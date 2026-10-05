import { useEffect, useState } from 'react';

import { MagnifyingGlassIcon } from '@phosphor-icons/react';

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';

import UsersDataTable from '../app/pages/app/user-management/columns';

async function fetchUsers() {
  const response = await fetch('http://localhost:4000/users');

  if (!response.ok) {
    throw new Error(`Erro ao buscar usuários: ${response.status}`);
  }

  return response.json();
}

export default function TableSection({ title }) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((error) => {
        console.error('Erro ao carregar administradores:', error);
      });
  }, []);

  return (
    <div className="rounded-md border-2">
      <div className="flex items-center justify-between rounded-t-md px-4 w-full h-16 bg-card">
        <h4 className="font-semibold text-lg">{title}</h4>

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

      <div className="p-4 w-full transition-all ease-in-out">
        <UsersDataTable
          users={users}
          filterValue={globalFilter}
        />
      </div>
    </div>
  );
}
