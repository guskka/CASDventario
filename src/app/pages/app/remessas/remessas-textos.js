// Opções e textos de Remessas e Estoque (valores do banco: tb_remessa, tb_estoque).

export const ORIGENS = [
  { label: 'Poliedro', value: 'POLIEDRO' },
  { label: 'CASD', value: 'CASD' },
];

// Só alguns materiais têm volume (ex: Kit Poliedro). "Sem volume" vira null ao salvar.
export const SEM_VOLUME = 'SEM_VOLUME';
export const VOLUMES = [
  { label: 'Sem volume', value: SEM_VOLUME },
  { label: 'Vol. 1', value: 'VOL1' },
  { label: 'Vol. 2', value: 'VOL2' },
  { label: 'Vol. 3', value: 'VOL3' },
  { label: 'Vol. 4', value: 'VOL4' },
];

export function rotuloOrigem(valor) {
  return ORIGENS.find((o) => o.value === valor)?.label ?? valor;
}

export function rotuloVolume(valor) {
  return valor ? (VOLUMES.find((v) => v.value === valor)?.label ?? valor) : '—';
}

// Datas sem hora (data de recebimento) chegam como meia-noite em UTC: formatar
// em UTC evita mostrar o dia anterior no fuso de Brasília.
export function formatarDataSemHora(valor) {
  return valor ? new Date(valor).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '—';
}

// "2026-03-10T00:00:00.000Z" -> "2026-03-10" (formato do campo de data do formulário)
export function paraCampoData(valor) {
  return valor ? String(valor).slice(0, 10) : '';
}

export function hojeCampoData() {
  return new Date().toLocaleDateString('sv-SE'); // "AAAA-MM-DD" no fuso local
}
