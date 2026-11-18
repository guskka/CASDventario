import { useState } from 'react';
import { PlusIcon, XIcon } from '@phosphor-icons/react';

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
import { Field, FieldDescription, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import CampoSelect from '@/components/campo-select';
import { listarAlunos, listarEstoque, registrarEntrega } from '@/lib/api';
import { avisar, ENTREGAS_ALTERADAS } from '@/lib/eventos';
import {
  formatarDataSemHora,
  hojeCampoData,
  rotuloOrigem,
} from '../../remessas/remessas-textos';

const MAXIMO_SUGESTOES = 6;

// Janela "Registrar entrega": escolhe o aluno (busca por nome ou RM), o
// material do estoque (só os que têm saldo) e a quantidade.
export default function EntregaDialog() {
  const [aberta, setAberta] = useState(false);
  const [alunos, setAlunos] = useState([]);
  const [estoque, setEstoque] = useState([]);
  const [buscaAluno, setBuscaAluno] = useState('');
  const [aluno, setAluno] = useState(null);
  const [estoqueId, setEstoqueId] = useState(null);
  const [quantidade, setQuantidade] = useState('1');
  const [data, setData] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setBuscaAluno('');
      setAluno(null);
      setEstoqueId(null);
      setQuantidade('1');
      setData(hojeCampoData());
      setErro('');
      // Só alunos que podem receber (não inativos) e só material com saldo.
      Promise.all([listarAlunos(), listarEstoque(true)])
        .then(([listaAlunos, itensEstoque]) => {
          setAlunos(listaAlunos.filter((a) => a.status !== 'INATIVO'));
          setEstoque(itensEstoque);
        })
        .catch((err) => setErro(err.message));
    }
    setAberta(abrir);
  }

  const termo = buscaAluno.trim().toLowerCase();
  const sugestoes = termo
    ? alunos
        .filter(
          (a) =>
            a.nome_completo.toLowerCase().includes(termo) || String(a.rm_aluno).includes(termo),
        )
        .slice(0, MAXIMO_SUGESTOES)
    : [];

  const opcoesEstoque = estoque.map((item) => ({
    value: String(item.id_estoque),
    label: `${item.nome} · remessa nº ${item.id_remessa} de ${formatarDataSemHora(item.data_recebimento)} (${rotuloOrigem(item.origem)}) · ${item.qtd_disponivel} disponível(is)`,
  }));
  const itemEscolhido = estoque.find((item) => String(item.id_estoque) === estoqueId);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    const qtd = Number(quantidade);
    if (!aluno) {
      setErro('Escolha o aluno.');
      return;
    }
    if (!itemEscolhido) {
      setErro('Escolha o material.');
      return;
    }
    if (!Number.isInteger(qtd) || qtd < 1) {
      setErro('A quantidade deve ser um número inteiro maior que zero.');
      return;
    }

    const dados = { estoqueId: itemEscolhido.id_estoque, alunoRm: aluno.rm_aluno, qtdEntregue: qtd };
    // Entrega de outro dia: meio-dia daquela data (evita problemas de fuso).
    if (data && data !== hojeCampoData()) {
      dados.dataEntrega = `${data}T12:00:00`;
    }

    setSalvando(true);
    try {
      const entrega = await registrarEntrega(dados);
      toast.add({ type: 'success', description: `Entrega registrada: ${entrega.descricao}.` });
      avisar(ENTREGAS_ALTERADAS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger render={<Button variant="secondary" size="lg" />}>
        <PlusIcon />
        Registrar Entrega
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Registrar Entrega</DialogTitle>
          <DialogDescription>
            A quantidade entregue é descontada automaticamente do estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Field>
              <Label htmlFor="entrega-aluno">
                Aluno<span className="text-destructive">*</span>
              </Label>
              {aluno ? (
                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                  <span>
                    {aluno.nome_completo}{' '}
                    <span className="text-muted-foreground">(RM {aluno.rm_aluno})</span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Trocar aluno"
                    onClick={() => setAluno(null)}
                  >
                    <XIcon />
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    id="entrega-aluno"
                    autoComplete="off"
                    placeholder="Digite o nome ou o RM do aluno"
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                  />
                  {sugestoes.length > 0 && (
                    <ul className="rounded-md border" aria-label="Alunos encontrados">
                      {sugestoes.map((a) => (
                        <li key={a.rm_aluno}>
                          <button
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-accent"
                            onClick={() => setAluno(a)}
                          >
                            {a.nome_completo}{' '}
                            <span className="text-muted-foreground">(RM {a.rm_aluno})</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  {termo && sugestoes.length === 0 && (
                    <FieldDescription>Nenhum aluno ativo encontrado.</FieldDescription>
                  )}
                </>
              )}
            </Field>

            {estoque.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Não há material com saldo no estoque. Registre uma remessa primeiro.
              </p>
            ) : (
              <CampoSelect
                id="entrega-material"
                label="Material (do estoque)"
                obrigatorio
                opcoes={opcoesEstoque}
                valor={estoqueId}
                onChange={setEstoqueId}
                placeholder="Selecione o material"
              />
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="entrega-quantidade">
                  Quantidade<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="entrega-quantidade"
                  type="number"
                  min="1"
                  max={itemEscolhido?.qtd_disponivel}
                  required
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                />
                {itemEscolhido && (
                  <FieldDescription>
                    Disponível: {itemEscolhido.qtd_disponivel}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Label htmlFor="entrega-data">Data da entrega</Label>
                <Input
                  id="entrega-data"
                  type="date"
                  max={hojeCampoData()}
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </Field>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando || estoque.length === 0}>
              {salvando ? 'Registrando...' : 'Registrar'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
