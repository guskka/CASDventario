import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, WarningIcon } from '@phosphor-icons/react';

import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import CampoSelect from '@/components/campo-select';
import FiltroSelect from '@/components/filtro-select';
import { desfazerEntrega, entregarMaterial, resumoEstoque, situacaoEntregas } from '@/lib/api';
import { avisar, ENTREGAS_ALTERADAS } from '@/lib/eventos';
import { CURSOS, TURMAS, rotulo } from '../../alunos/alunos-textos';
import EntregasDataTable from '../columns';
import DesfazerEntregaDialog from './desfazer-entrega-dialog';
import EntregarPendentesDialog from './entregar-pendentes-dialog';

// Tela de entregas = lista de chamada de UM material (tipo + volume + ano):
// todos os alunos ativos, marcados (recebeu) ou não (pendente).

const TODOS = 'TODOS';
const FILTRO_TURMA = [{ label: 'Todas as turmas', value: TODOS }, ...TURMAS];
const FILTRO_CURSO = [{ label: 'Todos os cursos', value: TODOS }, ...CURSOS];
const MEMORIA_MATERIAL = 'entregas-material'; // último material escolhido (só neste navegador)

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const semAcento = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

function lerMaterialLembrado() {
  try {
    return localStorage.getItem(MEMORIA_MATERIAL);
  } catch {
    return null;
  }
}

function lembrarMaterial(chave) {
  try {
    localStorage.setItem(MEMORIA_MATERIAL, chave);
  } catch {
    // sem memória: na próxima visita começa pelo primeiro material com saldo
  }
}

// "id|volume|ano" (chave do resumo do estoque) -> material para a API.
function materialDaChave(chave) {
  const [id, volume, ano] = chave.split('|');
  return {
    id_material: Number(id),
    volume_material: volume || null,
    ano_letivo_material: Number(ano),
  };
}

export default function EntregasSection() {
  const [materiais, setMateriais] = useState([]);
  const [chave, setChave] = useState(null);
  const [situacao, setSituacao] = useState(null);
  const [aba, setAba] = useState('todos');
  const [busca, setBusca] = useState('');
  const [turma, setTurma] = useState(TODOS);
  const [curso, setCurso] = useState(TODOS);
  const [salvando, setSalvando] = useState(() => new Set());
  const [desmarcando, setDesmarcando] = useState(null); // aluno da janela "Desfazer a entrega?"
  const [erro, setErro] = useState('');
  const [carregouMateriais, setCarregouMateriais] = useState(false);

  // Materiais do estoque (com o saldo), para o seletor do topo.
  const carregarMateriais = useCallback(() => {
    resumoEstoque()
      .then((lista) => {
        setMateriais(lista);
        setCarregouMateriais(true);
        setChave((atual) => {
          if (atual && lista.some((m) => m.chave === atual)) {
            return atual;
          }
          const lembrado = lerMaterialLembrado();
          if (lembrado && lista.some((m) => m.chave === lembrado)) {
            return lembrado;
          }
          return (lista.find((m) => m.qtd_disponivel > 0) ?? lista[0])?.chave ?? null;
        });
      })
      .catch((err) => setErro(err.message));
  }, []);

  // Alunos ativos + quem já recebeu o material escolhido.
  const carregarSituacao = useCallback(() => {
    if (!chave) {
      return;
    }
    situacaoEntregas(materialDaChave(chave))
      .then((dados) => {
        setSituacao(dados);
        setErro('');
      })
      .catch((err) => setErro(err.message));
  }, [chave]);

  useEffect(() => {
    carregarMateriais();
  }, [carregarMateriais]);

  useEffect(() => {
    if (chave) {
      lembrarMaterial(chave);
    }
    carregarSituacao();
  }, [chave, carregarSituacao]);

  // Depois de qualquer entrega (ou desfazer), recarrega a lista e os saldos.
  useEffect(() => {
    function recarregar() {
      carregarMateriais();
      carregarSituacao();
    }
    window.addEventListener(ENTREGAS_ALTERADAS, recarregar);
    return () => window.removeEventListener(ENTREGAS_ALTERADAS, recarregar);
  }, [carregarMateriais, carregarSituacao]);

  function trocarMaterial(nova) {
    if (nova && nova !== chave) {
      setSituacao(null);
      setChave(nova);
    }
  }

  // ----- listas e números da tela -----
  const alunos = useMemo(() => situacao?.alunos ?? [], [situacao]);
  const material = situacao?.material ?? null;
  const disponivel = material?.qtd_disponivel ?? 0;
  const esgotado = Boolean(material) && disponivel === 0;

  const totalRecebidos = alunos.filter((a) => a.entrega).length;
  const totalPendentes = alunos.length - totalRecebidos;

  const filtrados = useMemo(() => {
    const termo = semAcento(busca.trim());
    return alunos.filter(
      (a) =>
        (turma === TODOS || a.turma === turma) &&
        (curso === TODOS || a.curso === curso) &&
        (!termo || semAcento(`${a.nome_completo} ${a.rm_aluno} ${a.email}`).includes(termo)),
    );
  }, [alunos, turma, curso, busca]);
  const pendentes = filtrados.filter((a) => !a.entrega);
  const recebidos = filtrados.filter((a) => a.entrega);
  const visiveis = aba === 'pendentes' ? pendentes : aba === 'recebidos' ? recebidos : filtrados;

  const opcoesMaterial = materiais.map((m) => ({
    value: m.chave,
    label: `${m.nome} · ${plural(m.qtd_disponivel, 'disponível', 'disponíveis')}`,
  }));

  // ----- marcar / desmarcar -----
  const marcarSalvando = useCallback((rm, ativo) => {
    setSalvando((atual) => {
      const novo = new Set(atual);
      if (ativo) {
        novo.add(rm);
      } else {
        novo.delete(rm);
      }
      return novo;
    });
  }, []);

  // Marcar = registrar a entrega na hora, com "Desfazer" no aviso.
  const aoMarcar = useCallback(
    async (aluno) => {
      marcarSalvando(aluno.rm_aluno, true);
      try {
        const resposta = await entregarMaterial(materialDaChave(chave), [aluno.rm_aluno]);
        const idEntrega = resposta.entregas[0].id_entrega_kit;
        const idAviso = toast.add({
          type: 'success',
          description: `Entrega registrada: ${aluno.nome_completo} recebeu ${resposta.material}.`,
          timeout: 8000,
          actionProps: {
            children: 'Desfazer',
            onClick: async () => {
              toast.close(idAviso);
              try {
                await desfazerEntrega(idEntrega);
                toast.add({
                  type: 'success',
                  description: `Entrega desfeita: 1 unidade de ${resposta.material} voltou para o estoque.`,
                });
              } catch (err) {
                toast.add({ type: 'error', description: err.message });
              } finally {
                avisar(ENTREGAS_ALTERADAS);
              }
            },
          },
        });
      } catch (err) {
        toast.add({ type: 'error', description: err.message });
      } finally {
        marcarSalvando(aluno.rm_aluno, false);
        avisar(ENTREGAS_ALTERADAS);
      }
    },
    [chave, marcarSalvando],
  );

  // Desmarcar = pedir confirmação antes de desfazer.
  const aoDesmarcar = useCallback((aluno) => setDesmarcando(aluno), []);

  // ----- tela -----
  if (carregouMateriais && !materiais.length) {
    return (
      <div className="rounded-md border-2 p-6 text-sm text-muted-foreground">
        Ainda não há materiais no estoque. Registre uma remessa em{' '}
        <Link to="/remessas" className="text-primary underline underline-offset-4">
          Remessas
        </Link>{' '}
        para começar a entregar.
      </div>
    );
  }

  const rotuloCurso = curso === TODOS ? null : rotulo(CURSOS, curso);

  return (
    <div className="space-y-6">
      {/* Material escolhido + saldo */}
      <section
        aria-label="Material sendo entregue"
        className="flex flex-wrap items-end gap-x-10 gap-y-4 rounded-md border-2 p-4"
      >
        <div className="w-full max-w-sm">
          <CampoSelect
            id="entrega-material"
            label="Material sendo entregue"
            opcoes={opcoesMaterial}
            valor={chave}
            onChange={trocarMaterial}
            placeholder="Carregando materiais..."
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Disponível no estoque</p>
          <p className="tabular-nums">
            <span className="text-3xl font-semibold">{material ? disponivel : '—'}</span>{' '}
            {material && (
              <span className="text-sm text-muted-foreground">
                de {material.qtd_recebida} recebidos
              </span>
            )}
          </p>
          <div className="h-1.5 w-52 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full bg-primary"
              style={{
                width: material?.qtd_recebida
                  ? `${(disponivel / material.qtd_recebida) * 100}%`
                  : '0%',
              }}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm text-muted-foreground">Alunos ativos</p>
          <p className="text-sm tabular-nums">
            <strong>{alunos.length}</strong> no total · <strong>{totalRecebidos}</strong>{' '}
            {totalRecebidos === 1 ? 'recebeu' : 'receberam'} · <strong>{totalPendentes}</strong>{' '}
            {totalPendentes === 1 ? 'pendente' : 'pendentes'}
          </p>
          {esgotado && totalPendentes > 0 ? (
            <span className="inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
              Esgotado
            </span>
          ) : (
            material &&
            disponivel < totalPendentes && (
              <span className="inline-flex rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                Faltam {totalPendentes - disponivel} para atender todos os pendentes
              </span>
            )
          )}
        </div>
      </section>

      {/* Lista de chamada */}
      <div className="rounded-md border-2">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-md bg-card px-4 py-3">
          <Tabs value={aba} onValueChange={setAba}>
            <TabsList>
              <TabsTrigger value="todos">
                Todos <span className="tabular-nums opacity-70">{filtrados.length}</span>
              </TabsTrigger>
              <TabsTrigger value="pendentes">
                Pendentes <span className="tabular-nums opacity-70">{pendentes.length}</span>
              </TabsTrigger>
              <TabsTrigger value="recebidos">
                Recebidos <span className="tabular-nums opacity-70">{recebidos.length}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <InputGroup className="w-full max-w-xs">
            <InputGroupInput
              placeholder="Buscar por nome, RM ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              aria-label="Buscar aluno"
            />
            <InputGroupAddon>
              <MagnifyingGlassIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="w-full space-y-4 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtrar:</span>
            <FiltroSelect items={FILTRO_CURSO} value={curso} onValueChange={setCurso} dica="Curso" />
            <FiltroSelect items={FILTRO_TURMA} value={turma} onValueChange={setTurma} dica="Turma" />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
              {!rotuloCurso && (
                <span className="text-sm text-muted-foreground">
                  Escolha um curso para marcar vários de uma vez.
                </span>
              )}
              <EntregarPendentesDialog
                material={material}
                pendentes={pendentes}
                rotuloCurso={rotuloCurso}
                turma={turma === TODOS ? null : rotulo(TURMAS, turma)}
              />
            </div>
          </div>

          {esgotado && totalPendentes > 0 && (
            <p
              role="status"
              className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              <WarningIcon className="shrink-0" />
              Material esgotado: as caixinhas dos pendentes ficam travadas até chegar uma nova
              remessa.
            </p>
          )}
          {erro && (
            <p className="text-sm text-destructive">Não foi possível carregar as entregas: {erro}</p>
          )}

          <EntregasDataTable
            key={`${chave}|${aba}|${turma}|${curso}|${busca}`}
            alunos={visiveis}
            salvando={salvando}
            esgotado={esgotado}
            aoMarcar={aoMarcar}
            aoDesmarcar={aoDesmarcar}
          />
        </div>
      </div>

      <DesfazerEntregaDialog
        aluno={desmarcando}
        nomeMaterial={material?.nome}
        onFechar={() => setDesmarcando(null)}
      />
    </div>
  );
}
