// Opções e textos da página de Alunos (os valores são os do banco: tb_aluno).

export const CURSOS = [
  { label: 'Extensivo', value: 'EXTENSIVO' },
  { label: 'Semi-extensivo', value: 'SEMI_EXTENSIVO' },
];

// O banco aceita aluno sem turma (NULL). Nas caixas de seleção isso vira
// a opção "Sem turma" (valor SEM_TURMA), convertida para null ao salvar.
export const SEM_TURMA = 'SEM_TURMA';
export const TURMAS = [
  { label: 'T1', value: 'T1' },
  { label: 'T2', value: 'T2' },
  { label: 'T3', value: 'T3' },
  { label: 'T4', value: 'T4' },
  { label: 'Sem turma', value: SEM_TURMA },
];

export const STATUS_ALUNO = [
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Inativo', value: 'INATIVO' },
  { label: 'Pendente', value: 'PENDENTE' },
];

export const VARIANTE_STATUS = {
  ATIVO: 'default',
  PENDENTE: 'outline',
  INATIVO: 'muted', // etiqueta cinza
};

export function rotulo(opcoes, valor) {
  return opcoes.find((opcao) => opcao.value === valor)?.label ?? valor ?? '—';
}
