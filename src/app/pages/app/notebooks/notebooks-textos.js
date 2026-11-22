// Opções e textos da página de Notebooks (valores do banco: tb_notebook).

// INDISPONIVEL = emprestado. Ele é definido sozinho pelos empréstimos e
// devoluções. INATIVO = fora de uso, só pelos botões Inativar e Reativar.
// Na janela de cadastro/edição só aparecem Disponível e Em manutenção.
export const STATUS_NOTEBOOK = [
  { label: 'Disponível', value: 'DISPONIVEL' },
  { label: 'Indisponível (emprestado)', value: 'INDISPONIVEL' },
  { label: 'Em manutenção', value: 'MANUTENCAO' },
  { label: 'Inativo (fora de uso)', value: 'INATIVO' },
];
export const STATUS_EDITAVEIS = STATUS_NOTEBOOK.filter(
  (s) => s.value === 'DISPONIVEL' || s.value === 'MANUTENCAO',
);

export const VARIANTE_STATUS = {
  DISPONIVEL: 'default',
  INDISPONIVEL: 'secondary',
  MANUTENCAO: 'destructive',
  INATIVO: 'muted', // etiqueta cinza
};

// Por que o notebook saiu de uso (obrigatório ao inativar).
export const MOTIVOS_INATIVACAO = [
  { label: 'Quebrado sem conserto', value: 'QUEBRADO' },
  { label: 'Perdido ou roubado', value: 'PERDIDO_ROUBADO' },
  { label: 'Doado ou devolvido', value: 'DOADO_DEVOLVIDO' },
  { label: 'Outro', value: 'OUTRO' },
];

export function rotuloMotivo(valor) {
  return MOTIVOS_INATIVACAO.find((m) => m.value === valor)?.label ?? valor ?? '';
}

export const GB_MAXIMO = 65535; // limite das colunas SMALLINT UNSIGNED do banco

export function rotuloStatus(valor) {
  return STATUS_NOTEBOOK.find((s) => s.value === valor)?.label ?? valor;
}

// "Intel Iris Xe (integrada)" ou "RTX 3050 · 4 GB"
export function descreverVideo(notebook) {
  return notebook.vram_gb > 0
    ? `${notebook.placa_grafica} · ${notebook.vram_gb} GB`
    : `${notebook.placa_grafica} (integrada)`;
}
