// Regras do cadastro de aluno. São as MESMAS do backend (rmValido em
// CASDventario-Backend/server.js): se mudar aqui, mude lá também.

// RM de aluno novo: exatamente 7 números, sem zero na frente.
// Os alunos já cadastrados mantêm o RM que têm (o RM não muda na edição).
export const TAMANHO_RM = 7;
export const MENSAGEM_RM = 'O RM precisa ter exatamente 7 números, sem zero na frente.';

export function rmValido(rm) {
  return /^[1-9]\d{6}$/.test(String(rm));
}

// Deixa só os números digitados (ou colados), até 7. O campo não usa maxLength:
// ele cortaria um RM colado com pontos ("990.000-3") antes de os pontos saírem.
export function limparRm(texto) {
  return texto.replace(/\D/g, '').slice(0, TAMANHO_RM);
}

// Dica que aparece embaixo do campo RM enquanto a pessoa digita.
export function dicaRm(rm) {
  if (rm.startsWith('0')) {
    return { erro: true, texto: 'O RM não pode começar com zero.' };
  }
  const faltam = TAMANHO_RM - rm.length;
  if (rm.length > 0 && faltam > 0) {
    return {
      erro: false,
      texto: faltam === 1 ? 'Falta 1 número (o RM tem 7).' : `Faltam ${faltam} números (o RM tem 7).`,
    };
  }
  return { erro: false, texto: '7 números, sem zero na frente.' };
}
