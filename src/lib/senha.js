// Regras da senha. São as MESMAS do backend (função problemasSenha em
// CASDventario-Backend/server.js): se mudar aqui, mude lá também.

export const REGRAS_SENHA = [
  { texto: 'Pelo menos 8 caracteres', ok: (senha) => senha.length >= 8 },
  { texto: 'Pelo menos 1 número', ok: (senha) => /\d/.test(senha) },
  // \p{Lu} = qualquer letra maiúscula, inclusive com acento (É, Ç, Á...).
  { texto: 'Pelo menos 1 letra maiúscula', ok: (senha) => /\p{Lu}/u.test(senha) },
];

// Mensagem dizendo exatamente o que falta, ou '' se a senha está ok.
// Ex: "A senha ainda precisa ter: pelo menos 1 letra maiúscula."
export function mensagemSenha(senha) {
  const faltando = REGRAS_SENHA.filter((regra) => !regra.ok(senha)).map((regra) =>
    regra.texto.toLowerCase(),
  );

  if (faltando.length === 0) {
    return '';
  }

  const lista =
    faltando.length === 1
      ? faltando[0]
      : `${faltando.slice(0, -1).join(', ')} e ${faltando.at(-1)}`;

  return `A senha ainda precisa ter: ${lista}.`;
}
