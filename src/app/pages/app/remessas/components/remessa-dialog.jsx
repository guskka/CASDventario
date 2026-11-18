import { useState } from 'react';
import { PencilSimpleIcon, PlusIcon, TrashIcon } from '@phosphor-icons/react';

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import CampoSelect from '@/components/campo-select';
import {
  atualizarRemessa,
  cadastrarMaterial,
  cadastrarRemessa,
  listarMateriais,
} from '@/lib/api';
import { avisar, REMESSAS_ALTERADAS } from '@/lib/eventos';
import { ORIGENS, SEM_VOLUME, VOLUMES, hojeCampoData, paraCampoData } from '../remessas-textos';

// Caixa de seleção compacta, sem rótulo (usada em cada linha de material).
function SelectLinha({ opcoes, valor, onChange, placeholder, disabled, rotulo }) {
  return (
    <Select items={opcoes} value={valor} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label={rotulo} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {opcoes.map((opcao) => (
            <SelectItem key={opcao.value} value={opcao.value}>
              {opcao.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

let proximaChave = 1; // identifica cada linha da lista na tela (não vai para a API)

function linhaVazia() {
  return {
    chave: proximaChave++,
    id: null,
    materialId: null,
    volume: SEM_VOLUME,
    anoLetivo: String(new Date().getFullYear()),
    quantidade: '',
    entregue: 0,
  };
}

// Janela de registrar (sem "remessa") ou editar (com "remessa") uma remessa:
// dados da chegada + lista de materiais (tipo, volume, ano, quantidade).
export default function RemessaDialog({ remessa }) {
  const editando = Boolean(remessa);

  const [aberta, setAberta] = useState(false);
  const [materiais, setMateriais] = useState([]);
  const [dataRecebimento, setDataRecebimento] = useState('');
  const [origem, setOrigem] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [itens, setItens] = useState([]);
  const [novoTipo, setNovoTipo] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function carregarMateriais() {
    try {
      setMateriais(await listarMateriais());
    } catch (err) {
      setErro(err.message);
    }
  }

  function abrirOuFechar(abrir) {
    if (abrir) {
      setDataRecebimento(remessa ? paraCampoData(remessa.data_recebimento) : hojeCampoData());
      setOrigem(remessa?.origem ?? null);
      setDescricao(remessa?.descricao ?? '');
      setItens(
        remessa
          ? remessa.itens.map((item) => ({
              chave: proximaChave++,
              id: item.id_estoque,
              materialId: String(item.id_material),
              volume: item.volume_material ?? SEM_VOLUME,
              anoLetivo: String(item.ano_letivo_material),
              quantidade: String(item.qtd_recebida),
              entregue: item.qtd_entregue,
            }))
          : [linhaVazia()],
      );
      setNovoTipo('');
      setErro('');
      carregarMateriais();
    }
    setAberta(abrir);
  }

  // Opções de tipo: os ativos + os que já estão na remessa (caso algum tenha sido desativado).
  const opcoesMaterial = [
    ...materiais.map((m) => ({ label: m.nome, value: String(m.id_material) })),
    ...(remessa?.itens ?? [])
      .filter((item) => !materiais.some((m) => m.id_material === item.id_material))
      .map((item) => ({ label: item.material, value: String(item.id_material) })),
  ];

  function alterarItem(chave, campo, valor) {
    setItens((atuais) =>
      atuais.map((item) => (item.chave === chave ? { ...item, [campo]: valor } : item)),
    );
  }

  async function adicionarTipo() {
    const nome = novoTipo.trim();
    if (!nome) {
      return;
    }
    setErro('');
    try {
      await cadastrarMaterial(nome);
      toast.add({ type: 'success', description: `Tipo "${nome}" cadastrado.` });
      setNovoTipo('');
      await carregarMateriais();
    } catch (err) {
      setErro(err.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!origem) {
      setErro('Escolha a origem da remessa.');
      return;
    }
    if (itens.length === 0) {
      setErro('Adicione pelo menos um material.');
      return;
    }
    for (const [indice, item] of itens.entries()) {
      const quantidade = Number(item.quantidade);
      if (!item.materialId) {
        setErro(`Material ${indice + 1}: escolha o tipo de material.`);
        return;
      }
      if (!Number.isInteger(quantidade) || quantidade < 1) {
        setErro(`Material ${indice + 1}: a quantidade deve ser um número inteiro maior que zero.`);
        return;
      }
      if (!/^\d{4}$/.test(item.anoLetivo)) {
        setErro(`Material ${indice + 1}: informe o ano letivo com 4 dígitos (ex: 2026).`);
        return;
      }
    }

    const dados = {
      dataRecebimento,
      origem,
      descricao: descricao.trim() || null,
      itens: itens.map((item) => ({
        ...(item.id ? { id: item.id } : {}),
        materialId: Number(item.materialId),
        volume: item.volume === SEM_VOLUME ? null : item.volume,
        anoLetivo: Number(item.anoLetivo),
        quantidade: Number(item.quantidade),
      })),
    };

    setSalvando(true);
    try {
      if (editando) {
        await atualizarRemessa(remessa.id_remessa, dados);
      } else {
        await cadastrarRemessa(dados);
      }
      toast.add({
        type: 'success',
        description: editando ? 'Remessa editada com sucesso.' : 'Remessa registrada com sucesso.',
      });
      avisar(REMESSAS_ALTERADAS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      {editando ? (
        <DialogTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Editar remessa nº ${remessa.id_remessa}`}
            />
          }
        >
          <PencilSimpleIcon />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="secondary" size="lg" />}>
          <PlusIcon />
          Registrar Remessa
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editando ? `Editar Remessa nº ${remessa.id_remessa}` : 'Registrar Remessa'}
          </DialogTitle>
          <DialogDescription>
            Informe a chegada e os materiais que vieram nela. O estoque de cada material é criado
            automaticamente.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <Label htmlFor="remessa-data">
                  Data de recebimento<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="remessa-data"
                  type="date"
                  required
                  value={dataRecebimento}
                  onChange={(e) => setDataRecebimento(e.target.value)}
                />
              </Field>
              <CampoSelect
                id="remessa-origem"
                label="Origem"
                obrigatorio
                opcoes={ORIGENS}
                valor={origem}
                onChange={setOrigem}
                placeholder="Selecione"
              />
            </div>
            <Field>
              <Label htmlFor="remessa-descricao">Descrição (opcional)</Label>
              <Input
                id="remessa-descricao"
                maxLength={255}
                placeholder="Ex: Material do 1º semestre"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <Label>
                Materiais<span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-[1fr_8rem_6rem_7rem_2.25rem] gap-2 text-xs text-muted-foreground">
                <span>Tipo de material</span>
                <span>Volume</span>
                <span>Ano letivo</span>
                <span>Quantidade</span>
                <span />
              </div>
              {itens.map((item, indice) => {
                const travado = item.entregue > 0; // já teve entregas: só a quantidade muda
                return (
                  <div key={item.chave} className="space-y-1">
                    <div className="grid grid-cols-[1fr_8rem_6rem_7rem_2.25rem] items-center gap-2">
                      <SelectLinha
                        rotulo={`Tipo do material ${indice + 1}`}
                        opcoes={opcoesMaterial}
                        valor={item.materialId}
                        onChange={(valor) => alterarItem(item.chave, 'materialId', valor)}
                        placeholder="Selecione"
                        disabled={travado}
                      />
                      <SelectLinha
                        rotulo={`Volume do material ${indice + 1}`}
                        opcoes={VOLUMES}
                        valor={item.volume}
                        onChange={(valor) => alterarItem(item.chave, 'volume', valor)}
                        disabled={travado}
                      />
                      <Input
                        aria-label={`Ano letivo do material ${indice + 1}`}
                        type="number"
                        min="1901"
                        max="2155"
                        required
                        disabled={travado}
                        value={item.anoLetivo}
                        onChange={(e) => alterarItem(item.chave, 'anoLetivo', e.target.value)}
                      />
                      <Input
                        aria-label={`Quantidade do material ${indice + 1}`}
                        type="number"
                        min={Math.max(1, item.entregue)}
                        required
                        value={item.quantidade}
                        onChange={(e) => alterarItem(item.chave, 'quantidade', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        aria-label={`Remover material ${indice + 1}`}
                        disabled={travado || itens.length === 1}
                        onClick={() =>
                          setItens((atuais) => atuais.filter((i) => i.chave !== item.chave))
                        }
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                    {travado && (
                      <p className="text-xs text-muted-foreground">
                        {item.entregue} já entregue(s): só a quantidade pode mudar (não menos que{' '}
                        {item.entregue}).
                      </p>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="outline"
                onClick={() => setItens((atuais) => [...atuais, linhaVazia()])}
              >
                <PlusIcon />
                Adicionar material
              </Button>
            </div>

            <div className="space-y-1 rounded-md border border-dashed p-3">
              <Label htmlFor="novo-tipo">Não achou o tipo de material? Cadastre um novo:</Label>
              <div className="flex gap-2">
                <Input
                  id="novo-tipo"
                  maxLength={80}
                  placeholder="Ex: Física"
                  value={novoTipo}
                  onChange={(e) => setNovoTipo(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter aqui cadastra o tipo (e não envia a remessa).
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      adicionarTipo();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={adicionarTipo}>
                  Cadastrar tipo
                </Button>
              </div>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Registrar'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
