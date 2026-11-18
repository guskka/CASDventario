import { useState } from 'react';
import { PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react';

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
import { atualizarNotebook, cadastrarNotebook } from '@/lib/api';
import { avisar, NOTEBOOKS_ALTERADOS } from '@/lib/eventos';
import { GB_MAXIMO, STATUS_EDITAVEIS } from '../notebooks-textos';

function CampoTexto({ id, label, valor, onChange, maxLength, tipo = 'text', min, dica }) {
  return (
    <Field>
      <Label htmlFor={id}>
        {label}
        <span className="text-destructive">*</span>
      </Label>
      <Input
        id={id}
        type={tipo}
        required
        min={min}
        max={tipo === 'number' ? GB_MAXIMO : undefined}
        maxLength={maxLength}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
      />
      {dica && <FieldDescription>{dica}</FieldDescription>}
    </Field>
  );
}

// Janela de cadastrar (sem "notebook") ou editar (com "notebook") um notebook.
// Mesmo modelo das janelas de Alunos e Administradores.
export default function NotebookDialog({ notebook }) {
  const editando = Boolean(notebook);
  const emprestado = notebook?.status === 'INDISPONIVEL';

  const [aberta, setAberta] = useState(false);
  const [modelo, setModelo] = useState('');
  const [processador, setProcessador] = useState('');
  const [memoriaRam, setMemoriaRam] = useState('');
  const [armazenamento, setArmazenamento] = useState('');
  const [placaGrafica, setPlacaGrafica] = useState('');
  const [vram, setVram] = useState('0');
  const [sistemaOperacional, setSistemaOperacional] = useState('');
  const [status, setStatus] = useState('DISPONIVEL');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrirOuFechar(abrir) {
    if (abrir) {
      setModelo(notebook?.modelo ?? '');
      setProcessador(notebook?.processador ?? '');
      setMemoriaRam(notebook ? String(notebook.memoria_ram_gb) : '');
      setArmazenamento(notebook ? String(notebook.armazenamento_gb) : '');
      setPlacaGrafica(notebook?.placa_grafica ?? '');
      setVram(notebook ? String(notebook.vram_gb) : '0');
      setSistemaOperacional(notebook?.sistema_operacional ?? '');
      setStatus(notebook?.status ?? 'DISPONIVEL');
      setErro('');
    }
    setAberta(abrir);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    const numero = (texto) => Number(texto);
    const inteiroEntre = (texto, min) =>
      Number.isInteger(numero(texto)) && numero(texto) >= min && numero(texto) <= GB_MAXIMO;
    if (!inteiroEntre(memoriaRam, 1) || !inteiroEntre(armazenamento, 1)) {
      setErro('Memória RAM e armazenamento devem ser números inteiros maiores que zero (em GB).');
      return;
    }
    if (!inteiroEntre(vram, 0)) {
      setErro('A memória de vídeo deve ser um número inteiro (0 se a placa for integrada).');
      return;
    }

    const dados = {
      modelo: modelo.trim(),
      processador: processador.trim(),
      memoriaRam: numero(memoriaRam),
      armazenamento: numero(armazenamento),
      placaGrafica: placaGrafica.trim(),
      ramPlacaGrafica: numero(vram),
      sistemaOperacional: sistemaOperacional.trim(),
    };
    // Notebook emprestado: o status não é enviado (muda sozinho na devolução).
    if (!emprestado) {
      dados.status = status;
    }

    setSalvando(true);
    try {
      if (editando) {
        await atualizarNotebook(notebook.id_notebook, dados);
      } else {
        await cadastrarNotebook(dados);
      }
      toast.add({
        type: 'success',
        description: editando ? 'Notebook editado com sucesso.' : 'Notebook cadastrado com sucesso.',
      });
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
      {editando ? (
        <DialogTrigger
          render={<Button variant="ghost" size="icon" aria-label={`Editar ${notebook.modelo}`} />}
        >
          <PencilSimpleIcon />
        </DialogTrigger>
      ) : (
        <DialogTrigger render={<Button variant="secondary" size="lg" />}>
          <PlusIcon />
          Adicionar Notebook
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editando ? `Editar Notebook nº ${notebook.id_notebook}` : 'Adicionar Notebook'}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? 'Altere a configuração ou o status do notebook.'
              : 'Preencha a configuração do notebook. Ele começa como Disponível.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {erro && <p className="text-sm text-destructive">{erro}</p>}
            <CampoTexto id="nb-modelo" label="Modelo" valor={modelo} onChange={setModelo} maxLength={150} />
            <CampoTexto
              id="nb-processador"
              label="Processador"
              valor={processador}
              onChange={setProcessador}
              maxLength={100}
            />
            <div className="grid grid-cols-2 gap-3">
              <CampoTexto
                id="nb-ram"
                label="Memória RAM (GB)"
                tipo="number"
                min="1"
                valor={memoriaRam}
                onChange={setMemoriaRam}
              />
              <CampoTexto
                id="nb-armazenamento"
                label="Armazenamento (GB)"
                tipo="number"
                min="1"
                valor={armazenamento}
                onChange={setArmazenamento}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <CampoTexto
                id="nb-placa"
                label="Placa de vídeo"
                valor={placaGrafica}
                onChange={setPlacaGrafica}
                maxLength={100}
              />
              <CampoTexto
                id="nb-vram"
                label="Memória de vídeo (GB)"
                tipo="number"
                min="0"
                valor={vram}
                onChange={setVram}
                dica="Use 0 se a placa for integrada."
              />
            </div>
            <CampoTexto
              id="nb-so"
              label="Sistema operacional"
              valor={sistemaOperacional}
              onChange={setSistemaOperacional}
              maxLength={100}
            />
            {emprestado ? (
              <p className="text-sm text-muted-foreground">
                Status: <strong>Indisponível (emprestado)</strong>. Ele volta a ficar disponível
                sozinho quando a devolução for registrada.
              </p>
            ) : (
              <CampoSelect
                id="nb-status"
                label="Status"
                opcoes={STATUS_EDITAVEIS}
                valor={status}
                onChange={setStatus}
              />
            )}
          </FieldGroup>
          <DialogFooter className="mt-4">
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando...' : editando ? 'Salvar' : 'Cadastrar'}
            </Button>
            <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
