// Regras do cadastro de aluno. São as MESMAS do backend (rmValido,
// palavrasDoNome, emailInstitucional e emailAlunoValido em
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

// ---------- Email institucional ----------
// Padrão: primeiro nome + "." + último nome + RM + @alunos.cursoalbertosantosdumont.org.br,
// em minúsculas e sem acento. Ex.: "João Pedro Conceição Lima", RM 1234567 →
// joao.lima1234567@alunos.cursoalbertosantosdumont.org.br
export const DOMINIO_EMAIL_ALUNO = 'alunos.cursoalbertosantosdumont.org.br';
export const MENSAGEM_SOBRENOME = 'Digite o nome completo do aluno, com sobrenome.';
export const MENSAGEM_INICIO_EMAIL =
  'Antes do @, o email só pode ter letras sem acento, números, ponto, hífen ou sublinhado.';

// Palavras do nome prontas para o email: sem acento, em minúsculas, só a
// primeira parte de um nome com hífen ("Ana-Clara" → "ana") e sem apóstrofo
// ("D'Ávila" → "davila").
export function palavrasDoNome(nome) {
  return String(nome ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/\s+/)
    .map((palavra) => palavra.split('-')[0].replace(/[^a-z]/g, ''))
    .filter(Boolean);
}

export function temSobrenome(nome) {
  return palavrasDoNome(nome).length >= 2;
}

// Parte antes do @ pelo padrão, ou '' se o nome ainda não tem sobrenome.
// O último nome conta mesmo se for Filho, Júnior ou Neto.
export function inicioEmailEsperado(nome, rm) {
  const palavras = palavrasDoNome(nome);
  if (palavras.length < 2) return '';
  return `${palavras[0]}.${palavras.at(-1)}${rm ?? ''}`;
}

export function inicioEmailValido(inicio) {
  return inicio.length <= 64 && /^[a-z0-9]+([._-][a-z0-9]+)*$/.test(inicio);
}

// O que a pessoa digita (ou cola) antes do @: se colar o email inteiro, fica só
// a parte antes do @; acentos e espaços saem, e tudo vira minúscula.
export function limparInicioEmail(texto) {
  return texto
    .split('@')[0]
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '');
}

// Separa um email salvo: a parte antes do @ e se ele é institucional.
export function separarEmailAluno(email) {
  const [inicio, dominio] = String(email ?? '').split('@');
  return { inicio, institucional: dominio === DOMINIO_EMAIL_ALUNO };
}
