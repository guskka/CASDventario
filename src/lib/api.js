// URL base da API. Padrão: o backend local (porta 3333). Para apontar para outro
// endereço (outro computador, servidor de produção, backend de teste), crie um
// arquivo .env na pasta do frontend com: VITE_API_URL=http://endereco:porta
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3333";

// Função genérica que todas as chamadas usam por baixo dos panos.
// Ela já lida com JSON e com erros vindos da API.
async function request(caminho, opcoes = {}) {
  const headers = { ...opcoes.headers };

  // Só avisa que está mandando JSON quando realmente há um corpo
  // (a API recusa DELETE/GET com "Content-Type: application/json" e corpo vazio).
  // Arquivos (FormData) não: o navegador monta o cabeçalho certo sozinho.
  if (opcoes.body !== undefined && !(opcoes.body instanceof FormData)) {
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

// Envia (ou troca) a própria foto de perfil. arquivo = File do <input type="file">.
// A API aceita JPG, PNG ou WebP até 2 MB e devolve o usuário com url_foto.
export function enviarFoto(id, arquivo) {
  const formulario = new FormData();
  formulario.append("foto", arquivo);
  return request(`/usuarios/${id}/foto`, { method: "PUT", body: formulario });
}

// Remove a própria foto (volta o avatar automático).
export function removerFoto(id) {
  return request(`/usuarios/${id}/foto`, { method: "DELETE" });
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

// turma pode ser null (aluno sem turma); status padrão ATIVO.
export function cadastrarAluno({ rm, nome, email, turma, curso, status }) {
  return request("/alunos", {
    method: "POST",
    body: JSON.stringify({ rm, nome, email, turma, curso, status }),
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

// Empréstimos de um aluno (todos; os em aberto têm situacao diferente de DEVOLVIDO).
export function emprestimosDoAluno(rm) {
  return request(`/emprestimos?alunoRm=${encodeURIComponent(rm)}`);
}

// ============================================================
//  DASHBOARD (página inicial)
// ============================================================

// Resumo: estoque, notebooks, empréstimos atrasados e vencendo, alunos ativos
// e as últimas entregas.
export function resumoDashboard() {
  return request("/dashboard");
}

// ============================================================
//  TIPOS DE MATERIAL, REMESSAS E ESTOQUE
// ============================================================

// Tipos de material ativos (Kit Poliedro, Português...), em ordem alfabética.
export function listarMateriais() {
  return request("/materiais");
}

export function cadastrarMaterial(nome) {
  return request("/materiais", {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

// Remessas com os materiais (itens) e os totais, mais recentes primeiro.
export function listarRemessas() {
  return request("/remessas");
}

// dados: { dataRecebimento: "AAAA-MM-DD", origem, descricao,
//          itens: [{ id?, materialId, volume, anoLetivo, quantidade }] }
// Na edição, "itens" é a lista completa (veja as regras no backend).
export function cadastrarRemessa(dados) {
  return request("/remessas", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export function atualizarRemessa(id, dados) {
  return request(`/remessas/${id}`, {
    method: "PUT",
    body: JSON.stringify(dados),
  });
}

export function deletarRemessa(id) {
  return request(`/remessas/${id}`, { method: "DELETE" });
}

// Tela Estoque: um total por material (tipo + volume + ano), somando as remessas.
export function resumoEstoque() {
  return request("/estoques/resumo");
}

// Cada material de cada remessa. somenteDisponivel = só o que ainda tem saldo.
export function listarEstoque(somenteDisponivel = false) {
  return request(somenteDisponivel ? "/estoques?disponivel=1" : "/estoques");
}

// ============================================================
//  ENTREGAS DE KITS
// ============================================================

// Mais recentes primeiro, com aluno, material e quem registrou.
export function listarEntregas() {
  return request("/entregas-kit");
}

// dados: { estoqueId, alunoRm, qtdEntregue, dataEntrega? }
// Desconta do estoque; a API recusa se não houver saldo suficiente.
export function registrarEntrega(dados) {
  return request("/entregas-kit", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Desfaz uma entrega: a quantidade volta para o estoque.
export function desfazerEntrega(id) {
  return request(`/entregas-kit/${id}`, { method: "DELETE" });
}

// "Material" = um item de resumoEstoque(): { id_material, volume_material, ano_letivo_material }.
function parametrosMaterial(material) {
  const params = new URLSearchParams({
    materialId: material.id_material,
    ano: material.ano_letivo_material,
  });
  if (material.volume_material) {
    params.set("volume", material.volume_material);
  }
  return params.toString();
}

// Tela de entregas: todos os alunos ativos, quem já recebeu o material e o saldo.
export function situacaoEntregas(material) {
  return request(`/entregas-kit/situacao?${parametrosMaterial(material)}`);
}

// Entrega 1 unidade do material a cada aluno (um só, ou vários do mesmo curso).
// Ou entrega para todos, ou para ninguém. A resposta traz "entregas" com os ids.
export function entregarMaterial(material, alunosRm) {
  return request("/entregas-kit/lote", {
    method: "POST",
    body: JSON.stringify({
      materialId: material.id_material,
      volume: material.volume_material ?? null,
      anoLetivo: material.ano_letivo_material,
      alunosRm,
    }),
  });
}

// Desfaz várias entregas de uma vez (o "Desfazer" depois de marcar vários).
export function desfazerEntregas(ids) {
  return request("/entregas-kit/desfazer", {
    method: "POST",
    body: JSON.stringify({ ids }),
  });
}

// ============================================================
//  EMPRÉSTIMOS DE NOTEBOOK
// ============================================================

// Mais recentes primeiro. situacao (opcional): EM_ANDAMENTO, ATRASADO ou DEVOLVIDO.
export function listarEmprestimos(situacao) {
  const query = situacao ? `?situacao=${encodeURIComponent(situacao)}` : "";
  return request(`/emprestimos${query}`);
}

// dados: { notebookId, alunoRm, previsaoDevolucao: "AAAA-MM-DD", checklist: {...} }
// O notebook passa a "emprestado" sozinho; a API recusa se não estiver disponível.
export function registrarEmprestimo(dados) {
  return request("/emprestimos", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Só a previsão de devolução pode mudar (mais prazo).
export function alterarPrevisaoEmprestimo(id, previsaoDevolucao) {
  return request(`/emprestimos/${id}`, {
    method: "PUT",
    body: JSON.stringify({ previsaoDevolucao }),
  });
}

// Desfaz um empréstimo registrado por engano (o notebook volta a ficar disponível).
export function desfazerEmprestimo(id) {
  return request(`/emprestimos/${id}`, { method: "DELETE" });
}

// dados: { emprestimoId, checklist: {...}, dataDevolucao?, enviarParaManutencao? }
// O notebook volta a ficar disponível, ou vai para manutenção se voltou com dano.
export function registrarDevolucao(dados) {
  return request("/devolucoes", {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

// Desfaz uma devolução registrada por engano (o empréstimo volta a ficar em aberto).
export function desfazerDevolucao(id) {
  return request(`/devolucoes/${id}`, { method: "DELETE" });
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

// Tira o notebook de uso. motivo: QUEBRADO | PERDIDO_ROUBADO | DOADO_DEVOLVIDO | OUTRO
export function inativarNotebook(id, { motivo, observacao }) {
  return request(`/notebooks/${id}/inativar`, {
    method: "PATCH",
    body: JSON.stringify({ motivo, observacao }),
  });
}

// Notebook inativo volta a ficar Disponível.
export function reativarNotebook(id) {
  return request(`/notebooks/${id}/reativar`, { method: "PATCH" });
}
