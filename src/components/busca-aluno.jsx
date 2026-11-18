import { useState } from 'react';
import { XIcon } from '@phosphor-icons/react';

import { Field, FieldDescription } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MAXIMO_SUGESTOES = 6;

// Campo para escolher um aluno digitando o nome ou o RM (mostra até 6 sugestões).
// alunos = lista onde procurar; aluno = escolhido (ou null); onChange(aluno | null).
// Usado nas janelas de Entrega de kits e de Empréstimo de notebook.
export default function BuscaAluno({ id, alunos, aluno, onChange, label = 'Aluno' }) {
  const [busca, setBusca] = useState('');

  const termo = busca.trim().toLowerCase();
  const sugestoes = termo
    ? alunos
        .filter(
          (a) =>
            a.nome_completo.toLowerCase().includes(termo) || String(a.rm_aluno).includes(termo),
        )
        .slice(0, MAXIMO_SUGESTOES)
    : [];

  return (
    <Field>
      <Label htmlFor={id}>
        {label}
        <span className="text-destructive">*</span>
      </Label>
      {aluno ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <span>
            {aluno.nome_completo}{' '}
            <span className="text-muted-foreground">(RM {aluno.rm_aluno})</span>
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Trocar aluno"
            onClick={() => onChange(null)}
          >
            <XIcon />
          </Button>
        </div>
      ) : (
        <>
          <Input
            id={id}
            autoComplete="off"
            placeholder="Digite o nome ou o RM do aluno"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          {sugestoes.length > 0 && (
            <ul className="rounded-md border" aria-label="Alunos encontrados">
              {sugestoes.map((a) => (
                <li key={a.rm_aluno}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-accent"
                    onClick={() => {
                      onChange(a);
                      setBusca('');
                    }}
                  >
                    {a.nome_completo}{' '}
                    <span className="text-muted-foreground">(RM {a.rm_aluno})</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {termo && sugestoes.length === 0 && (
            <FieldDescription>Nenhum aluno ativo encontrado.</FieldDescription>
          )}
        </>
      )}
    </Field>
  );
}
