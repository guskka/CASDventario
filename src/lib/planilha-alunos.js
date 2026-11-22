// Leitura da planilha de alunos (.xlsx ou .csv) e o modelo para baixar (item 17a).
// As bibliotecas são carregadas só quando a janela de importação usa elas
// (import dinâmico), para não pesar no carregamento das outras telas.
//
// Quem confere as regras (RM, nome, email, curso, turma) é a API: aqui só se
// acham as colunas pelo título e se manda cada linha como veio.

export const LIMITE_LINHAS = 2000; // o mesmo MAX_LINHAS_IMPORTACAO do backend

// Títulos aceitos para cada coluna (sem acento e em minúsculas).
const TITULOS = {
  rm: ['rm', 'r.m.', 'r.m'],
  nome: ['nome completo', 'nome', 'nome do aluno', 'aluno'],
  email: ['email', 'e-mail', 'email institucional', 'e-mail institucional'],
  curso: ['curso'],
  turma: ['turma'],
};
const OBRIGATORIAS = ['rm', 'nome', 'curso'];

function semAcento(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function celulaVazia(valor) {
  return valor === null || valor === undefined || String(valor).trim() === '';
}

// Texto que vai para a API. Datas (célula formatada como data por engano)
// viram texto também; a API diz o que está errado.
function textoDaCelula(valor) {
  if (celulaVazia(valor)) return '';
  if (valor instanceof Date) return valor.toLocaleDateString('pt-BR');
  return String(valor).trim();
}

// CSV salvo pelo Excel em português costuma vir em "Windows-1252" (acentos
// quebrados se lidos como UTF-8). Tenta UTF-8 e, se falhar, Windows-1252.
function decodificarTexto(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
  } catch {
    return new TextDecoder('windows-1252').decode(buffer);
  }
}

async function lerCsv(arquivo) {
  const { default: Papa } = await import('papaparse');
  const texto = decodificarTexto(await arquivo.arrayBuffer());
  // delimitador automático: o Excel em português usa ";"
  const resultado = Papa.parse(texto, { skipEmptyLines: 'greedy' });
  return resultado.data;
}

async function lerXlsx(arquivo) {
  const { readSheet } = await import('read-excel-file/browser');
  return readSheet(arquivo);
}

// Lê o arquivo e devolve { linhas } (para a API) ou { erro } (mensagem para a tela).
// linhas = [{ linha, rm, nome, email, curso, turma }], com linha = nº na planilha.
export async function lerPlanilhaAlunos(arquivo) {
  const nome = arquivo.name.toLowerCase();
  let tabela;
  try {
    if (nome.endsWith('.xlsx')) {
      tabela = await lerXlsx(arquivo);
    } else if (nome.endsWith('.csv')) {
      tabela = await lerCsv(arquivo);
    } else {
      return {
        erro: 'Formato não aceito. Use um arquivo .xlsx (Excel) ou .csv. Num .xls antigo, use "Salvar como" .xlsx.',
      };
    }
  } catch {
    return { erro: 'Não foi possível ler o arquivo. Confira se ele não está corrompido ou protegido por senha.' };
  }

  // Primeira linha com algo escrito = títulos das colunas.
  const indiceTitulos = tabela.findIndex((linha) => linha.some((celula) => !celulaVazia(celula)));
  if (indiceTitulos === -1) {
    return { erro: 'A planilha está vazia.' };
  }
  const titulos = tabela[indiceTitulos].map(semAcento);
  const coluna = {};
  for (const [campo, aceitos] of Object.entries(TITULOS)) {
    const indice = titulos.findIndex((titulo) => aceitos.includes(titulo));
    if (indice !== -1) coluna[campo] = indice;
  }
  const faltando = OBRIGATORIAS.filter((campo) => coluna[campo] === undefined);
  if (faltando.length) {
    const nomes = { rm: 'RM', nome: 'Nome completo', curso: 'Curso' };
    return {
      erro: `Faltam colunas na planilha: ${faltando.map((c) => nomes[c]).join(', ')}. A primeira linha precisa ter os títulos RM, Nome completo, Email (opcional), Curso e Turma. Use o modelo.`,
    };
  }

  const linhas = [];
  tabela.slice(indiceTitulos + 1).forEach((celulas, i) => {
    if (celulas.every(celulaVazia)) return; // linha em branco: ignora
    const valor = (campo) => (coluna[campo] === undefined ? '' : textoDaCelula(celulas[coluna[campo]]));
    linhas.push({
      linha: indiceTitulos + i + 2, // nº da linha como aparece no Excel (começa em 1)
      rm: valor('rm'),
      nome: valor('nome'),
      email: valor('email'),
      curso: valor('curso'),
      turma: valor('turma'),
    });
  });

  if (linhas.length === 0) {
    return { erro: 'A planilha só tem os títulos: nenhum aluno para importar.' };
  }
  if (linhas.length > LIMITE_LINHAS) {
    return {
      erro: `A planilha tem ${linhas.length} alunos; o limite é ${LIMITE_LINHAS} por vez. Divida em arquivos menores.`,
    };
  }
  return { linhas };
}

// Modelo para baixar: aba "Alunos" com os títulos e aba "Como preencher".
export async function baixarModeloAlunos() {
  const { default: writeExcelFile } = await import('write-excel-file/browser');
  const titulo = (valor) => ({ value: valor, fontWeight: 'bold', backgroundColor: '#E8EEF7' });
  const instrucoes = [
    ['Coluna', 'Como preencher'],
    ['RM', 'Obrigatório. Exatamente 7 números, sem zero na frente. Ex.: 1234567'],
    ['Nome completo', 'Obrigatório, com sobrenome. Ex.: João Pedro Conceição Lima'],
    ['Email', 'Opcional. Se ficar vazio, é montado sozinho: primeiro nome + "." + último nome + RM + @alunos.cursoalbertosantosdumont.org.br. Se preencher, precisa terminar em @alunos.cursoalbertosantosdumont.org.br'],
    ['Curso', 'Obrigatório: Extensivo ou Semi-extensivo'],
    ['Turma', 'Opcional: T1, T2, T3 ou T4 (vazio = sem turma)'],
    ['', ''],
    ['Dica', 'Preencha a aba "Alunos" a partir da linha 2. Alunos que já estão cadastrados (mesmo RM) são ignorados, então dá para enviar o mesmo arquivo de novo depois de corrigir.'],
  ];
  await writeExcelFile([
    {
      sheet: 'Alunos',
      data: [['RM', 'Nome completo', 'Email', 'Curso', 'Turma'].map(titulo)],
      columns: [{ width: 12 }, { width: 40 }, { width: 55 }, { width: 18 }, { width: 10 }],
      stickyRowsCount: 1,
    },
    {
      sheet: 'Como preencher',
      data: instrucoes.map((linha, i) =>
        i === 0 ? linha.map(titulo) : [{ value: linha[0], fontWeight: 'bold' }, { value: linha[1], wrap: true }],
      ),
      columns: [{ width: 16 }, { width: 90 }],
    },
  ]).toFile('modelo-importacao-alunos.xlsx');
}
