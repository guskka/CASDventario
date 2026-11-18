import { useState } from 'react';
import { ArrowUDownLeftIcon, CheckCircleIcon, WrenchIcon } from '@phosphor-icons/react';

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
import { Field, FieldGroup } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { registrarDevolucao } from '@/lib/api';
import { avisar, EMPRESTIMOS_ALTERADOS, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import ChecklistCampos from './checklist-campos';
import { formatarDataSemHora } from '../../remessas/remessas-textos';
import { checklistParaFormulario, hojeMaisDias, partesComDano } from '../emprestimos-textos';

// Janela "Registrar devolução": checklist de volta (começa igual ao da saída,
// é só mudar o que estiver diferente) e mostra para onde o notebook vai.
export default function DevolucaoDialog({ emprestimo }) {
  const saida = checklistParaFormulario(emprestimo.checklist_saida);

  const [aberta, setAberta] = useState(false);
  const [data, setData] = useState('');
  const [checklist, setChecklist] = useState(saida);
  const [observacoes, setObservacoes] = useState('');
  const [manutencao, setManutencao] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setData(hojeMaisDias(0));
      setChecklist(checklistParaFormulario(emprestimo.checklist_saida));
      setObservacoes('');
      setManutencao(false);
      setErro('');
    }
    setAberta(abrir);
  }

  // Mesma regra do backend (D7): com dano, vai para manutenção.
  const comDano = partesComDano(checklist);
  const vaiParaManutencao = comDano.length > 0 || manutencao;

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    const dados = {
      emprestimoId: emprestimo.id_emprestimo_notebook,
      checklist: { ...checklist, observacoes: observacoes.trim() || null },
      enviarParaManutencao: manutencao,
    };
    // Devolução de outro dia: meio-dia daquela data (evita problemas de fuso).
    if (data && data !== hojeMaisDias(0)) {
      dados.dataDevolucao = `${data}T12:00:00`;
    }

    setSalvando(true);
    try {
      const devolucao = await registrarDevolucao(dados);
      toast.add({
        type: 'success',
        description: devolucao.motivo_manutencao
          ? `Devolução registrada. O notebook foi para manutenção (${devolucao.motivo_manutencao}).`
          : 'Devolução registrada. O notebook voltou a ficar disponível.',
      });
      avisar(EMPRESTIMOS_ALTERADOS);
      avisar(NOTEBOOKS_ALTERADOS);
      setAberta(false);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberta} onOpenChange={abrirOuFechar}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Registrar devolução do empréstimo nº ${emprestimo.id_emprestimo_notebook}`}
          />
        }
      >
        <ArrowUDownLeftIcon />
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar devolução</DialogTitle>
          <DialogDescription>
            {emprestimo.descricao}. Emprestado em{' '}
            {new Date(emprestimo.data_entrega).toLocaleDateString('pt-BR')}, para devolver até{' '}
            {formatarDataSemHora(emprestimo.previsao_devolucao)}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}

            <Field>
              <Label htmlFor="devolucao-data">Data da devolução</Label>
              <Input
                id="devolucao-data"
                type="date"
                max={hojeMaisDias(0)}
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </Field>

            <div className="space-y-2">
              <h4 className="font-semibold">Checklist de devolução</h4>
              <p className="text-sm text-muted-foreground">
                Já vem igual ao checklist de saída: mude só o que estiver diferente agora.
              </p>
              <ChecklistCampos
                prefixo="volta"
                valores={checklist}
                onChange={(chave, valor) => setChecklist((atual) => ({ ...atual, [chave]: valor }))}
                observacoes={observacoes}
                onObservacoes={setObservacoes}
                referencia={saida}
              />
            </div>

            {/* Para onde o notebook vai depois da devolução */}
            <div
              className={`flex items-start gap-3 rounded-md border p-3 ${vaiParaManutencao ? 'border-destructive/50' : ''}`}
            >
              {vaiParaManutencao ? (
                <WrenchIcon className="mt-0.5 shrink-0 text-destructive" />
              ) : (
                <CheckCircleIcon weight="fill" className="mt-0.5 shrink-0 text-primary" />
              )}
              <div className="space-y-2 text-sm">
                <p>
                  O notebook vai ficar:{' '}
                  <strong>{vaiParaManutencao ? 'Em manutenção' : 'Disponível'}</strong>
                  {comDano.length > 0 && ` (com dano: ${comDano.join(', ')})`}
                </p>
                {comDano.length === 0 && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={manutencao}
                      onChange={(e) => setManutencao(e.target.checked)}
                    />
                    Mandar para manutenção mesmo assim (ex: faltou o carregador)
                  </label>
                )}
              </div>
            </div>
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Registrando...' : 'Registrar devolução'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
