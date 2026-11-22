import { useRef, useState } from 'react';
import { DownloadSimpleIcon, FileArrowUpIcon, MicrosoftExcelLogoIcon } from '@phosphor-icons/react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { importarAlunos, previaImportacaoAlunos } from '@/lib/api';
import { avisar, ALUNOS_ALTERADOS } from '@/lib/eventos';
import { baixarModeloAlunos, lerPlanilhaAlunos } from '@/lib/planilha-alunos';
import { CURSOS, STATUS_ALUNO, rotulo } from '../alunos-textos';

function plural(n, um, varios) {
  return `${n} ${n === 1 ? um : varios}`;
}

// Tabelinha da prévia: textos podem quebrar linha (nada fica escondido).
function TabelaPrevia({ colunas, linhas, vazio }) {
  if (linhas.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">{vazio}</p>;
  }
  return (
    <div className="max-h-72 overflow-auto rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 bg-card">
          <TableRow>
            {colunas.map((c) => (
              <TableHead key={c.titulo} className={`font-bold ${c.classe ?? ''}`}>
                {c.titulo}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {linhas.map((linha) => (
            <TableRow key={linha.linha}>
              {colunas.map((c) => (
                <TableCell key={c.titulo} className={`align-top whitespace-normal ${c.classe ?? 'break-words'}`}>
                  {c.valor(linha)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const COLUNA_LINHA = { titulo: 'Linha', classe: 'w-16 text-muted-foreground', valor: (l) => l.linha };

// "Importar planilha" (item 17a): escolher o arquivo, ver a prévia e confirmar.
// Nada é salvo antes de clicar em "Importar N alunos"; a API confere tudo de novo.
export default function ImportarAlunosDialog() {
  const entrada = useRef(null);
  const [aberta, setAberta] = useState(false);
  const [arquivo, setArquivo] = useState('');
  const [linhas, setLinhas] = useState(null);
  const [previa, setPrevia] = useState(null);
  const [aba, setAba] = useState('novos');
  const [erro, setErro] = useState('');
  const [lendo, setLendo] = useState(false);
  const [importando, setImportando] = useState(false);
  const [baixando, setBaixando] = useState(false);

  function recomecar() {
    setArquivo('');
    setLinhas(null);
    setPrevia(null);
    setErro('');
  }

  function abrirOuFechar(abrir) {
    if (abrir) recomecar();
    setAberta(abrir);
  }

  async function baixarModelo() {
    setBaixando(true);
    try {
      await baixarModeloAlunos();
    } catch {
      toast.add({ type: 'error', description: 'Não foi possível gerar o modelo.' });
    } finally {
      setBaixando(false);
    }
  }

  async function escolherArquivo(event) {
    const escolhido = event.target.files?.[0];
    // Limpa o campo: assim dá para escolher o MESMO arquivo de novo depois de corrigi-lo.
    event.target.value = '';
    if (!escolhido) return;

    recomecar();
    setArquivo(escolhido.name);
    setLendo(true);
    try {
      const lido = await lerPlanilhaAlunos(escolhido);
      if (lido.erro) {
        setErro(lido.erro);
        return;
      }
      const resultado = await previaImportacaoAlunos(lido.linhas);
      setLinhas(lido.linhas);
      setPrevia(resultado);
      setAba(resultado.problemas.length ? 'problemas' : 'novos');
    } catch (err) {
      setErro(err.message);
    } finally {
      setLendo(false);
    }
  }

  async function importar() {
    setErro('');
    setImportando(true);
    try {
      const resultado = await importarAlunos(linhas);
      toast.add({
        type: 'success',
        description:
          `${plural(resultado.importados, 'aluno importado', 'alunos importados')}.` +
          (resultado.com_problema
            ? ` ${plural(resultado.com_problema, 'linha com problema ficou', 'linhas com problema ficaram')} de fora.`
            : ''),
      });
      avisar(ALUNOS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setImportando(false);
    }
  }

  const novos = previa?.novos ?? [];
  const problemas = previa?.problemas ?? [];
  const existentes = previa?.existentes ?? [];

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger render={<Button variant="outline" size="lg" />}>
        <FileArrowUpIcon />
        Importar planilha
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Importar alunos por planilha</DialogTitle>
          <DialogDescription>
            Aceita Excel (.xlsx) ou .csv. Antes de salvar, você vê quem será cadastrado e o que
            precisa ser corrigido. Os alunos novos entram como Ativos.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={entrada}
          type="file"
          accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={escolherArquivo}
        />

        {!previa && (
          <ol className="space-y-3 text-sm">
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <span>
                <strong>1.</strong> Baixe o modelo (colunas RM, Nome completo, Email, Curso e
                Turma). O email pode ficar vazio: ele é montado sozinho.
              </span>
              <Button variant="outline" onClick={baixarModelo} disabled={baixando}>
                <DownloadSimpleIcon />
                {baixando ? 'Gerando...' : 'Baixar modelo'}
              </Button>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
              <span>
                <strong>2.</strong> Preencha e escolha o arquivo. Alunos já cadastrados (mesmo RM)
                são ignorados.
              </span>
              <Button onClick={() => entrada.current?.click()} disabled={lendo}>
                <MicrosoftExcelLogoIcon />
                {lendo ? 'Lendo a planilha...' : 'Escolher arquivo'}
              </Button>
            </li>
          </ol>
        )}

        {previa && (
          // min-w-0: sem isso, as abas e tabelas alargariam a janela no celular
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">
                Arquivo: <span className="text-foreground">{arquivo}</span>
              </span>
              <Button
                variant="link"
                className="h-auto p-0"
                onClick={() => entrada.current?.click()}
                disabled={lendo || importando}
              >
                {lendo ? 'Lendo a planilha...' : 'Escolher outro arquivo'}
              </Button>
            </div>

            <Tabs value={aba} onValueChange={setAba}>
              {/* em tela estreita, as abas quebram em duas linhas */}
              <TabsList variant="line" className="flex-wrap justify-start gap-y-2 group-data-horizontal/tabs:h-auto">
                <TabsTrigger value="novos">Novos ({novos.length})</TabsTrigger>
                <TabsTrigger value="problemas">Com problema ({problemas.length})</TabsTrigger>
                <TabsTrigger value="existentes">Já cadastrados ({existentes.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="novos">
                <p className="mb-2 text-sm text-muted-foreground">
                  Serão cadastrados como Ativos.
                </p>
                <TabelaPrevia
                  vazio="Nenhum aluno novo nesta planilha."
                  linhas={novos}
                  colunas={[
                    COLUNA_LINHA,
                    { titulo: 'RM', classe: 'w-24', valor: (l) => l.rm_aluno },
                    { titulo: 'Nome', valor: (l) => l.nome_completo },
                    {
                      titulo: 'Email',
                      // email longo quebra linha em qualquer ponto, para a tabela caber
                      classe: '[overflow-wrap:anywhere]',
                      valor: (l) => (
                        <>
                          {l.email}
                          {l.email_montado && (
                            <span className="block text-xs text-muted-foreground">
                              montado pelo padrão
                            </span>
                          )}
                        </>
                      ),
                    },
                    { titulo: 'Curso', classe: 'w-32', valor: (l) => rotulo(CURSOS, l.curso) },
                    { titulo: 'Turma', classe: 'w-20', valor: (l) => l.turma ?? '—' },
                  ]}
                />
              </TabsContent>
              <TabsContent value="problemas">
                <p className="mb-2 text-sm text-muted-foreground">
                  Estas linhas ficam de fora. Corrija na planilha e envie o arquivo de novo:
                  quem já foi importado não se repete.
                </p>
                <TabelaPrevia
                  vazio="Nenhuma linha com problema."
                  linhas={problemas}
                  colunas={[
                    COLUNA_LINHA,
                    { titulo: 'RM', classe: 'w-24', valor: (l) => l.rm || '—' },
                    { titulo: 'Nome', valor: (l) => l.nome || '—' },
                    {
                      titulo: 'O que corrigir',
                      valor: (l) => <span className="text-destructive">{l.motivos.join('; ')}</span>,
                    },
                  ]}
                />
              </TabsContent>
              <TabsContent value="existentes">
                <p className="mb-2 text-sm text-muted-foreground">
                  Já estão cadastrados (mesmo RM) e não serão alterados.
                </p>
                <TabelaPrevia
                  vazio="Nenhum aluno desta planilha já estava cadastrado."
                  linhas={existentes}
                  colunas={[
                    COLUNA_LINHA,
                    { titulo: 'RM', classe: 'w-24', valor: (l) => l.rm },
                    { titulo: 'Nome no sistema', valor: (l) => l.nome_cadastrado },
                    {
                      titulo: 'Status',
                      classe: 'w-24',
                      valor: (l) => rotulo(STATUS_ALUNO, l.status_cadastrado),
                    },
                  ]}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {erro && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {erro}
          </p>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          {previa && (
            <Button onClick={importar} disabled={importando || lendo || novos.length === 0}>
              {importando
                ? 'Importando...'
                : `Importar ${plural(novos.length, 'aluno', 'alunos')}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
