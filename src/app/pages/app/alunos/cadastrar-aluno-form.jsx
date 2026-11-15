import { useState } from "react";
import { cadastrarAluno } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CadastrarAlunoForm({ onCadastrado }) {
  const [rm, setRm] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [curso, setCurso] = useState("");
  const [turma, setTurma] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const numeroRm = Number(rm);

    if (!Number.isInteger(numeroRm) || numeroRm < 1 || numeroRm > 4294967295) {
      setErro("Informe um RM numérico válido.");
      return;
    }

    setEnviando(true);

    try {
      const novoAluno = await cadastrarAluno({
        rm: numeroRm,
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        curso,
        turma: turma || undefined,
      });

      // Comunica à página que um aluno foi cadastrado.
      onCadastrado?.(novoAluno);

      setSucesso("Aluno cadastrado com sucesso!");

      // Limpa o formulário.
      setRm("");
      setNome("");
      setEmail("");
      setCurso("");
      setTurma("");
    } catch (error) {
      setErro(error.message || "Erro ao cadastrar aluno.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section className="rounded-md border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">Cadastrar aluno</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="aluno-rm">RM *</label>
            <Input
              id="aluno-rm"
              type="number"
              min="1"
              max="4294967295"
              required
              value={rm}
              onChange={(e) => setRm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="aluno-nome">Nome completo *</label>
            <Input
              id="aluno-nome"
              required
              maxLength={80}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="aluno-email">E-mail *</label>
            <Input
              id="aluno-email"
              type="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="aluno-curso">Curso *</label>
            <select
              id="aluno-curso"
              required
              value={curso}
              onChange={(e) => setCurso(e.target.value)}
              className="h-9 w-full rounded-md border bg-background px-3"
            >
              <option value="">Selecione</option>
              <option value="EXTENSIVO">Extensivo</option>
              <option value="SEMI_EXTENSIVO">Semi-extensivo</option>
            </select>
          </div>

          <div>
            <label htmlFor="aluno-turma">Turma</label>
            <select
              id="aluno-turma"
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
        </div>

        {erro && <p className="text-sm text-destructive">{erro}</p>}

        {sucesso && <p className="text-sm text-green-600">{sucesso}</p>}

        <Button type="submit" disabled={enviando}>
          {enviando ? "Cadastrando..." : "Cadastrar aluno"}
        </Button>
      </form>
    </section>
  );
}
