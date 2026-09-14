// URL base da sua API. Trocar aqui se a porta/endereço do backend mudar.
const API_URL = "http://127.0.0.1:3333";

// Função genérica que todas as chamadas usam por baixo dos panos.
// Ela já lida com JSON e com erros vindos da API.
async function request(caminho, opcoes = {}) {
  const resposta = await fetch(`${API_URL}${caminho}`, {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  });

  // Respostas 204 (delete, por exemplo) não têm corpo — não dá pra chamar .json() nelas.
  const dados = resposta.status !== 204 ? await resposta.json() : null;

  if (!resposta.ok) {
    // Lança um erro com a mensagem que a API mandou (ex: "Email ou senha inválidos.")
    // pra quem chamou a função conseguir mostrar isso na tela.
    throw new Error(dados?.erro ?? "Erro inesperado na API.");
  }

  return dados;
}

// ============================================================
//  AUTENTICAÇÃO
// ============================================================

export function login(email, senha) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  });
}

export function cadastrarUsuario({ nome, email, senha, apelidos, estado, tipo }) {
  return request("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, apelidos, estado, tipo }),
  });
}

// ============================================================
//  ALUNOS
// ============================================================

export function listarAlunos(nome) {
  const query = nome ? `?nome=${encodeURIComponent(nome)}` : "";
  return request(`/alunos${query}`);
}

export function buscarAluno(rm) {
  return request(`/alunos/${rm}`);
}

export function cadastrarAluno({ rm, nome, email, turma, curso }) {
  return request("/alunos", {
    method: "POST",
    body: JSON.stringify({ rm, nome, email, turma, curso }),
  });
}

export function atualizarAluno(rm, dados) {
  return request(`/alunos/${rm}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function deletarAluno(rm) {
  return request(`/alunos/${rm}`, { method: "DELETE" });
}

// ============================================================
//  NOTEBOOKS
// ============================================================

export function listarNotebooks(estado) {
  const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  return request(`/notebooks${query}`);
}

export function buscarNotebook(id) {
  return request(`/notebooks/${id}`);
}

export function cadastrarNotebook(dados) {
  return request("/notebooks", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarNotebook(id, dados) {
  return request(`/notebooks/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function deletarNotebook(id) {
  return request(`/notebooks/${id}`, { method: "DELETE" });
}
