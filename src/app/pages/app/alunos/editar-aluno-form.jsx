import { useState } from "react";

import { atualizarAluno } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export default function EditarAlunoForm({ aluno, onAtualizado }) {
  const [aberto, setAberto] = useState(false);

  const [nome, setNome] = useState(aluno.nome_completo ?? "");
  const [email, setEmail] = useState(aluno.email ?? "");
  const [curso, setCurso] = useState(aluno.curso ?? "");
  const [turma, setTurma] = useState(aluno.turma ?? "");
  const [status, setStatus] = useState(aluno.status ?? "ATIVO");

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  function handleOpenChange(open) {
    if (open) {
      // Recarrega os dados atuais ao abrir.
      setNome(aluno.nome_completo ?? "");
      setEmail(aluno.email ?? "");
      setCurso(aluno.curso ?? "");
      setTurma(aluno.turma ?? "");
      setStatus(aluno.status ?? "ATIVO");
      setErro("");
    }

    setAberto(open);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (salvando) return;

    setErro("");
    setSalvando(true);

    try {
      // O RM identifica o aluno, portanto não será alterado.
      const atualizado = await atualizarAluno(aluno.rm_aluno, {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        curso,
        turma: turma || null,
        status,
      });

      // Atualiza a tabela somente após o backend confirmar.
      onAtualizado?.(atualizado);

      setAberto(false);
    } catch (error) {
      setErro(error.message || "Erro ao atualizar aluno.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button variant="outline" size="sm">
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar aluno</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>RM</label>
            <Input value={aluno.rm_aluno} disabled />
          </div>

          <div>
            <label htmlFor={`nome-${aluno.rm_aluno}`}>Nome completo</label>
            <Input
              id={`nome-${aluno.rm_aluno}`}
              required
              maxLength={80}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`email-${aluno.rm_aluno}`}>E-mail</label>
            <Input
              id={`email-${aluno.rm_aluno}`}
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor={`curso-${aluno.rm_aluno}`}>Curso</label>
            <select
              id={`curso-${aluno.rm_aluno}`}
              required
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="EXTENSIVO">Extensivo</option>
              <option value="SEMI_EXTENSIVO">Semi-extensivo</option>
            </select>
          </div>

          <div>
            <label htmlFor={`turma-${aluno.rm_aluno}`}>Turma</label>
            <select
              id={`turma-${aluno.rm_aluno}`}
              value={turma}
              onChange={(e) => setTurma(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="">Não informada</option>
              <option value="T1">T1</option>
              <option value="T2">T2</option>
              <option value="T3">T3</option>
              <option value="T4">T4</option>
            </select>
          </div>

          <div>
            <label htmlFor={`status-${aluno.rm_aluno}`}>Status</label>
            <select
              id={`status-${aluno.rm_aluno}`}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}

          <DialogFooter>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={salvando}
              onClick={() => setAberto(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
