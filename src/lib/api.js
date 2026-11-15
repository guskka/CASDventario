// URL base da sua API. Trocar aqui se a porta/endereço do backend mudar.
const API_URL = "http://127.0.0.1:3333";

// Função genérica que todas as chamadas usam por baixo dos panos.
// Ela já lida com JSON e com erros vindos da API.

async function request(caminho, opcoes = {}) {
  // 1. Prepara os cabeçalhos da requisição.
  const headers = new Headers(opcoes.headers ?? {});

  // 2. Adiciona o tipo JSON quando existe corpo na requisição.
  if (opcoes.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // 3. Recupera o usuário autenticado.
  // A rota de login não precisa de token.
  const usuario = caminho === "/login" ? null : usuarioLogado();

  // 4. Envia o JWT quando estiver disponível.
  if (usuario?.token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${usuario.token}`);
  }

  // 5. Realiza a requisição.
  const resposta = await fetch(`${API_URL}${caminho}`, {
    ...opcoes,
    headers,
  });

  // Se uma rota protegida retornar HTTP 401,
  // a sessão não é mais aceita pelo backend.
  if (resposta.status === 401 && caminho !== "/login") {
    // Remove os dados e o JWT armazenados no navegador.
    sessionStorage.removeItem("usuario");

    // Redireciona o usuário para a tela de login.
    window.location.replace("/signin");

    throw new Error("Sessão inválida ou expirada. Faça login novamente.");
  }

  // 6. Trata respostas sem conteúdo, como HTTP 204.
  const dados = resposta.status !== 204 ? await resposta.json() : null;

  // 7. Trata os erros enviados pelo backend.
  if (!resposta.ok) {
    throw new Error(dados?.erro ?? "Erro inesperado na API.");
  }

  // 8. Retorna os dados para a função que fez a chamada.
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

export function listarUsuarios(nome) {
  // Permite filtrar usuários pelo nome, quando informado.
  const query = nome ? `?nome=${encodeURIComponent(nome)}` : "";

  // Utiliza a função request(), que já envia o JWT.
  return request(`/usuarios${query}`);
}

export function cadastrarUsuario({ nome, email, senha, apelido, status, tipo }) {
  return request("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, senha, apelido, status, tipo }),
  });
}

export function atualizarUsuario(id, dados) {
  // Envia uma requisição para atualizar o usuário.
  return request(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

// Lê o usuário salvo no login. Retorna null se não houver ninguém logado.
export function usuarioLogado() {
  const bruto = sessionStorage.getItem("usuario");
  return bruto ? JSON.parse(bruto) : null;
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

// ============================================================
//  NOTEBOOKS
// ============================================================

export function listarNotebooks(status) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
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
