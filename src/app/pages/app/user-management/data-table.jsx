'use client';

import * as React from 'react';
import { useTable } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { features } from './data-table-features';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';

const OPCOES_LINHAS = [10, 20, 50, 100].map((n) => ({ label: String(n), value: n }));
const PREFIXO_LINHAS = 'casd-linhas-por-pagina:';

// A escolha de "Linhas por página" fica guardada neste navegador, uma por lista.
// Se o navegador bloquear o armazenamento (ex.: janela anônima), a lista
// continua funcionando, só não lembra a escolha.
function lerLinhasSalvas(chave) {
  if (!chave) return null;
  try {
    const n = Number(localStorage.getItem(PREFIXO_LINHAS + chave));
    return OPCOES_LINHAS.some((opcao) => opcao.value === n) ? n : null;
  } catch {
    return null;
  }
}

function salvarLinhas(chave, n) {
  if (!chave) return;
  try {
    localStorage.setItem(PREFIXO_LINHAS + chave, String(n));
  } catch {
    // sem armazenamento: só não lembra a escolha
  }
}

// filterColumn: id da coluna usada pela busca (padrão "name").
// onRowClick (opcional): função chamada com os dados da linha clicada.
// manterPagina (opcional): não volta para a página 1 quando os dados recarregam
// (ex.: marcar um aluno na página 3 da tela de entregas).
// pageSize: linhas por página até a pessoa escolher outra quantidade.
// chaveLinhas: nome da lista, para lembrar a escolha de "Linhas por página".
export function DataTable({
  columns,
  data,
  pageSize = 20,
  chaveLinhas,
  filterValue = '',
  filterColumn = 'name',
  sorting,
  onSortingChange,
  onRowClick,
  manterPagina = false,
}) {
  const [linhasIniciais] = React.useState(() => lerLinhasSalvas(chaveLinhas) ?? pageSize);

  const table = useTable({
    features,
    data,
    columns,
    // A busca sempre procura o texto digitado dentro da coluna (sem diferenciar
    // maiúsculas). Fixar isso evita o aviso "filterFn ... is not registered"
    // que aparecia enquanto a tabela ainda estava vazia (carregando).
    defaultColumn: { filterFn: 'includesString' },
    autoResetPageIndex: manterPagina ? false : undefined,
    initialState: {
      pagination: {
        pageSize: linhasIniciais,
      },
    },
    state: {
      sorting,
    },
    onSortingChange,
  });

  React.useEffect(() => {
    table.getColumn(filterColumn)?.setFilterValue(filterValue);
  }, [filterValue, filterColumn, table]);

  // Se a página atual deixou de existir (a lista diminuiu), vai para a última.
  const totalPaginas = table.getPageCount();
  const paginaAtual = table.state.pagination.pageIndex;
  React.useEffect(() => {
    if (totalPaginas > 0 && paginaAtual >= totalPaginas) {
      table.setPageIndex(totalPaginas - 1);
    }
  }, [totalPaginas, paginaAtual, table]);

  const linhasPorPagina = table.state.pagination.pageSize;
  function mudarLinhas(n) {
    // setPageSize mantém à vista a linha que estava no topo da página.
    table.setPageSize(n);
    salvarLinhas(chaveLinhas, n);
  }

  return (
    <div className='flex flex-col gap-4'>
      <div className="overflow-hidden rounded-md border">
        <Table className="table-fixed w-full">
          <TableHeader className="bg-card">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const customClass =
                    header.column.columnDef.meta?.className || '';
                  return (
                    <TableHead
                      className={`font-bold select-none ${customClass}`}
                      key={header.id}
                    >
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={onRowClick ? 'cursor-pointer' : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => {
                    const customClass =
                      cell.column.columnDef.meta?.className || '';
                    return (
                      <TableCell
                        className={`truncate min-w-0 ${customClass}`}
                        key={cell.id}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Linhas por página</span>
          <Select items={OPCOES_LINHAS} value={linhasPorPagina} onValueChange={mudarLinhas}>
            <SelectTrigger size="sm" aria-label="Linhas por página">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {OPCOES_LINHAS.map((opcao) => (
                  <SelectItem key={opcao.value} value={opcao.value}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size='icon'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <CaretLeftIcon />
          </Button>
          <p>
            Página {table.state.pagination.pageIndex + 1} de{' '}
            {Math.max(1, table.getPageCount())}
          </p>
          <Button
            variant="ghost"
            size='icon'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <CaretRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
