// Opções e textos de Empréstimos de notebook (valores do banco:
// tb_emprestimo_notebook e tb_checklist_notebook).

export const SITUACOES = [
  { label: 'Em andamento', value: 'EM_ANDAMENTO', variant: 'default' },
  { label: 'Atrasado', value: 'ATRASADO', variant: 'destructive' },
  { label: 'Devolvido', value: 'DEVOLVIDO', variant: 'outline' },
];

export function situacao(valor) {
  return SITUACOES.find((s) => s.value === valor) ?? { label: valor, variant: 'outline' };
}

const ESTADO = [
  { label: 'Ótimo', value: 'OTIMO' },
  { label: 'Regular', value: 'REGULAR' },
  { label: 'Danificado', value: 'DANIFICADO' },
];
const ESTADO_OU_NAO_POSSUI = [...ESTADO, { label: 'Não possui', value: 'NAO_POSSUI' }];
const PORTAS = [
  { label: 'Todas funcionando', value: 'TODAS_FUNCIONANDO' },
  { label: 'Algumas danificadas', value: 'ALGUMAS_DANIFICADAS' },
  { label: 'Nenhuma funciona', value: 'NENHUMA_FUNCIONA' },
  { label: 'Não possui', value: 'NAO_POSSUI' },
];

// As 10 partes do checklist. chave = nome enviado para a API (camelCase);
// coluna = nome que volta da API (snake_case).
export const PARTES_CHECKLIST = [
  { chave: 'carcaca', coluna: 'carcaca', label: 'Carcaça', opcoes: ESTADO },
  { chave: 'tela', coluna: 'tela', label: 'Tela', opcoes: ESTADO },
  { chave: 'teclado', coluna: 'teclado', label: 'Teclado', opcoes: ESTADO },
  { chave: 'trackpad', coluna: 'trackpad', label: 'Trackpad', opcoes: ESTADO },
  { chave: 'bateria', coluna: 'bateria', label: 'Bateria', opcoes: ESTADO },
  {
    chave: 'conectorAlimentacao',
    coluna: 'conector_alimentacao',
    label: 'Conector de alimentação',
    opcoes: ESTADO,
  },
  { chave: 'carregador', coluna: 'carregador', label: 'Carregador', opcoes: ESTADO_OU_NAO_POSSUI },
  {
    chave: 'portaRj45',
    coluna: 'porta_rj45',
    label: 'Porta de rede (RJ45)',
    opcoes: ESTADO_OU_NAO_POSSUI,
  },
  { chave: 'portasUsbA', coluna: 'portas_usb_a', label: 'Portas USB-A', opcoes: PORTAS },
  { chave: 'portasUsbC', coluna: 'portas_usb_c', label: 'Portas USB-C', opcoes: PORTAS },
];

// Checklist novo começa com tudo em ordem (Ótimo / Todas funcionando).
export function checklistPadrao() {
  return Object.fromEntries(PARTES_CHECKLIST.map((parte) => [parte.chave, parte.opcoes[0].value]));
}

const TODAS_AS_OPCOES = [...ESTADO_OU_NAO_POSSUI, ...PORTAS];
export function rotuloEstado(valor) {
  return TODAS_AS_OPCOES.find((o) => o.value === valor)?.label ?? valor ?? '—';
}

// true se o valor indica algum problema (usado para destacar na tela).
export function temProblema(valor) {
  return !['OTIMO', 'TODAS_FUNCIONANDO'].includes(valor);
}

// Data de hoje + N dias, no formato do campo de data ("AAAA-MM-DD").
export function hojeMaisDias(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toLocaleDateString('sv-SE');
}

export const PRAZO_PADRAO_DIAS = 30;

// Dias de hoje até a data de devolução (negativo = atrasado).
// previsao chega como "AAAA-MM-DDT00:00:00.000Z" (data sem hora, em UTC).
export function diasParaDevolver(previsao) {
  const hoje = Date.parse(hojeMaisDias(0));
  return Math.round((Date.parse(String(previsao).slice(0, 10)) - hoje) / 86400000);
}

// "atrasado há 5 dias", "vence hoje", "vence em 3 dias"
export function textoPrazo(dias) {
  if (dias < 0) {
    return `atrasado há ${-dias} dia${dias === -1 ? '' : 's'}`;
  }
  if (dias === 0) {
    return 'vence hoje';
  }
  return `vence em ${dias} dia${dias === 1 ? '' : 's'}`;
}

// Mesma regra do backend (decisão D7): estes estados contam como dano e mandam
// o notebook para manutenção na devolução.
const ESTADOS_COM_DANO = ['DANIFICADO', 'ALGUMAS_DANIFICADAS', 'NENHUMA_FUNCIONA'];

// valores = { carcaca: 'OTIMO', ... } (chaves camelCase). Retorna os nomes das partes com dano.
export function partesComDano(valores) {
  return PARTES_CHECKLIST.filter((parte) => ESTADOS_COM_DANO.includes(valores[parte.chave])).map(
    (parte) => parte.label,
  );
}

// Checklist que veio da API (colunas snake_case) -> valores do formulário (camelCase).
export function checklistParaFormulario(checklist) {
  if (!checklist) {
    return checklistPadrao();
  }
  return Object.fromEntries(PARTES_CHECKLIST.map((parte) => [parte.chave, checklist[parte.coluna]]));
}
