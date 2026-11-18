// Opções e textos da página de Notebooks (valores do banco: tb_notebook).

// INDISPONIVEL = emprestado. Ele é definido sozinho pelos empréstimos e
// devoluções; na janela de cadastro/edição só aparecem as outras duas opções.
export const STATUS_NOTEBOOK = [
  { label: 'Disponível', value: 'DISPONIVEL' },
  { label: 'Indisponível (emprestado)', value: 'INDISPONIVEL' },
  { label: 'Em manutenção', value: 'MANUTENCAO' },
];
export const STATUS_EDITAVEIS = STATUS_NOTEBOOK.filter((s) => s.value !== 'INDISPONIVEL');

export const VARIANTE_STATUS = {
  DISPONIVEL: 'default',
  INDISPONIVEL: 'secondary',
  MANUTENCAO: 'destructive',
};

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
