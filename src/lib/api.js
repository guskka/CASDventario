// URL base da sua API. Trocar aqui se a porta/endereço do backend mudar.
const API_URL = "http://127.0.0.1:3333";

// Função genérica que todas as chamadas usam por baixo dos panos.
// Ela já lida com JSON e com erros vindos da API.
async function request(caminho, opcoes = {}) {
  const headers = { ...opcoes.headers };

  // Só avisa que está mandando JSON quando realmente há um corpo
  // (a API recusa DELETE/GET com "Content-Type: application/json" e corpo vazio).
  if (opcoes.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Envia o token recebido no login: sem ele, a API recusa a requisição.
  const token = usuarioLogado()?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${caminho}`, { ...opcoes, headers });

  // Respostas 204 (delete, por exemplo) não têm corpo — não dá pra chamar .json() nelas.
  const dados = resposta.status !== 204 ? await resposta.json() : null;

  // Token vencido ou conta desativada: encerra a sessão e volta ao login.
  // (No próprio /login, 401 significa só "email ou senha inválidos".)
  if (resposta.status === 401 && caminho !== "/login") {
    encerrarSessao();
    window.location.assign("/signin");
  }

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

// "Esqueci minha senha": a API manda um link por email (resposta sempre igual,
// exista o email ou não).
export function esqueciSenha(email) {
  return request("/auth/esqueci-senha", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// Cria a senha pelo link do email (convite ou "esqueci minha senha").
export function definirSenha(token, senha) {
  return request("/auth/definir-senha", {
    method: "POST",
    body: JSON.stringify({ token, senha }),
  });
}

// ============================================================
//  USUÁRIOS (administradores)
// ============================================================

export function listarUsuarios(nome) {
  const query = nome ? `?nome=${encodeURIComponent(nome)}` : "";
  return request(`/usuarios${query}`);
}

export function buscarUsuario(id) {
  return request(`/usuarios/${id}`);
}

// dados: { nome, apelido, email, status, tipo, senha } — envie só o que mudou.
export function atualizarUsuario(id, dados) {
  return request(`/usuarios/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

// Cadastra um administrador (só Mestre). A conta nasce PENDENTE e a pessoa
// recebe um email para criar a própria senha. A resposta traz
// convite: { enviado, modoDesenvolvimento, erroEmail }.
export function cadastrarUsuario({ nome, email, apelido, tipo }) {
  return request("/usuarios", {
    method: "POST",
    body: JSON.stringify({ nome, email, apelido, tipo }),
  });
}

// Histórico de alterações (aba Logs, só Mestre). Os mais recentes primeiro.
export function listarLogs() {
  return request("/logs");
}

// Reenvia o convite de uma conta PENDENTE (o link anterior deixa de valer).
export function reenviarConvite(id) {
  return request(`/usuarios/${id}/reenviar-convite`, { method: "POST" });
}

// Lê o usuário salvo no login. Retorna null se não houver ninguém logado
// (ou se o dado salvo estiver corrompido).
export function usuarioLogado() {
  try {
    const bruto = sessionStorage.getItem('usuario');
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

// true se existe um login com token ainda dentro da validade (8h).
// Lê a data de expiração que vem dentro do próprio token (campo "exp").
export function sessaoValida() {
  const token = usuarioLogado()?.token;
  if (typeof token !== 'string') {
    return false;
  }

  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(base64));
    return typeof exp === 'number' && exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// true se quem está logado é Administrador Mestre.
export function usuarioEhMestre() {
  return usuarioLogado()?.tipo === 'MESTRE';
}

// Atualiza os dados guardados da sessão (ex: depois de editar o próprio nome),
// mantendo o token.
export function atualizarSessao(dados) {
  const atual = usuarioLogado();
  if (atual) {
    sessionStorage.setItem('usuario', JSON.stringify({ ...atual, ...dados }));
  }
}

// Encerra a sessão (botão "Sair").
export function encerrarSessao() {
  sessionStorage.removeItem('usuario');
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
