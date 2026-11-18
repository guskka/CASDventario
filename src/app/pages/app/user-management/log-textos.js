// Textos usados na aba "Logs" (lista e janela de detalhes).

export const ACOES = {
  CRIOU: { label: 'Criou', variant: 'default' },
  EDITOU: { label: 'Editou', variant: 'secondary' },
  EXCLUIU: { label: 'Excluiu', variant: 'destructive' },
  REENVIOU_CONVITE: { label: 'Reenviou convite', variant: 'outline' },
};

export const ENTIDADES = {
  usuario: 'Administrador',
  material: 'Tipo de material',
  aluno: 'Aluno',
  notebook: 'Notebook',
  remessa: 'Remessa',
  estoque: 'Estoque',
  entrega_kit: 'Entrega de kit',
  emprestimo: 'Empréstimo',
  devolucao: 'Devolução',
  checklist_notebook: 'Checklist de notebook',
};

// Nome de cada campo do banco como aparece na tela.
const CAMPOS = {
  id_usuario: 'ID',
  nome_completo: 'Nome',
  apelido: 'Apelido',
  email: 'Email',
  status: 'Status',
  tipo: 'Cargo',
  senha: 'Senha',
  data_cadastro: 'Data de cadastro',
  rm_aluno: 'RM',
  turma: 'Turma',
  curso: 'Curso',
  id_notebook: 'ID',
  modelo: 'Modelo',
  memoria_ram_gb: 'Memória RAM (GB)',
  vram_gb: 'Memória de vídeo (GB)',
  armazenamento_gb: 'Armazenamento (GB)',
  processador: 'Processador',
  placa_grafica: 'Placa de vídeo',
  sistema_operacional: 'Sistema operacional',
  id_remessa: 'ID',
  descricao: 'Descrição',
  materiais_resumo: 'Materiais',
  total_recebido: 'Total recebido',
  total_disponivel: 'Total disponível',
  id_material: 'ID',
  nome: 'Nome',
  ativo: 'Ativo',
  fk_id_material: 'Tipo de material (ID)',
  qtd_recebida: 'Quantidade recebida',
  qtd_disponivel: 'Quantidade disponível',
  total_kits: 'Total de kits',
  ano_letivo_material: 'Ano letivo',
  volume_material: 'Volume',
  tipo_material: 'Tipo de material',
  origem: 'Origem',
  data_recebimento: 'Data de recebimento',
  id_estoque: 'ID',
  fk_id_remessa: 'Remessa (ID)',
  qtd_kits: 'Quantidade de kits',
  id_entrega_kit: 'ID',
  fk_id_estoque: 'Estoque (ID)',
  fk_rm_aluno: 'Aluno (RM)',
  fk_id_usuario: 'Registrado por (ID)',
  qtd_entregue: 'Quantidade entregue',
  notebook: 'Notebook',
  aluno: 'Aluno',
  material: 'Material',
  registrado_por: 'Registrado por',
  situacao: 'Situação',
  estado_saida: 'Estado na saída',
  estado_devolucao: 'Estado na devolução',
  status_notebook: 'Status do notebook',
  id_devolucao: 'Devolução (ID)',
  motivo_manutencao: 'Motivo da manutenção',
  data_entrega_kit: 'Data da entrega',
  data_registro: 'Data do registro',
  id_emprestimo_notebook: 'ID',
  fk_id_notebook: 'Notebook (ID)',
  data_entrega: 'Data de entrega',
  previsao_devolucao: 'Previsão de devolução',
  id_devolucao_notebook: 'ID',
  fk_id_emprestimo_notebook: 'Empréstimo (ID)',
  data_devolucao: 'Data de devolução',
  id_checklist_notebook: 'ID',
  tipo_checklist: 'Tipo de checklist',
  carcaca: 'Carcaça',
  tela: 'Tela',
  teclado: 'Teclado',
  trackpad: 'Trackpad',
  carregador: 'Carregador',
  bateria: 'Bateria',
  conector_alimentacao: 'Conector de alimentação',
  porta_rj45: 'Porta de rede (RJ45)',
  portas_usb_a: 'Portas USB-A',
  portas_usb_c: 'Portas USB-C',
  observacoes: 'Observações',
  url_foto: 'Foto',
};

export function rotuloCampo(campo) {
  if (CAMPOS[campo]) {
    return CAMPOS[campo];
  }
  // Campo sem nome cadastrado: "algum_campo" -> "Algum campo"
  const texto = campo.replace(/_/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

// Valores do banco que precisam de acento (os outros viram "Primeira maiúscula").
const VALORES_COM_ACENTO = {
  OTIMO: 'Ótimo',
  NAO_POSSUI: 'Não possui',
  DISPONIVEL: 'Disponível',
  INDISPONIVEL: 'Indisponível (emprestado)',
  MANUTENCAO: 'Em manutenção',
  EMPRESTIMO: 'Empréstimo',
  DEVOLUCAO: 'Devolução',
  BASICO: 'Básico',
};

const DATA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
// Datas sem hora (colunas DATE, como "data de recebimento") chegam como meia-noite em UTC.
const SO_DATA = /T00:00:00(\.000)?Z$/;

// Valor como aparece na tela: datas no formato brasileiro, "ATIVO" -> "Ativo".
export function formatarValor(valor) {
  if (valor === undefined) {
    return '—';
  }
  if (valor === null || valor === '') {
    return 'vazio';
  }
  if (typeof valor === 'boolean') {
    return valor ? 'Sim' : 'Não';
  }
  if (typeof valor === 'string' && DATA_ISO.test(valor)) {
    // Sem isto, uma data como 10/03 apareceria como 09/03 (fuso de Brasília).
    return SO_DATA.test(valor)
      ? new Date(valor).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
      : new Date(valor).toLocaleString('pt-BR');
  }
  if (VALORES_COM_ACENTO[valor]) {
    return VALORES_COM_ACENTO[valor];
  }
  if (typeof valor === 'string' && /^[A-Z][A-Z_]+$/.test(valor)) {
    const texto = valor.replace(/_/g, ' ').toLowerCase();
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  return String(valor);
}
