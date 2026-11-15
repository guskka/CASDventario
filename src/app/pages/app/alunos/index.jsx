import { useEffect, useState } from "react";

import Header from "@/components/ui/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { listarAlunos } from "@/lib/api";
import CadastrarAlunoForm from "./cadastrar-aluno-form";
import EditarAlunoForm from "./editar-aluno-form";
import { Input } from "@/components/ui/input";

export default function AlunosPage() {
  // Armazena os alunos recebidos do backend.
  const [alunos, setAlunos] = useState([]);

  // Armazena o texto digitado na pesquisa.
  const [busca, setBusca] = useState("");

  // Armazena o curso escolhido no filtro.
  const [filtroCurso, setFiltroCurso] = useState("");

  // Armazena a turma selecionada.
  const [filtroTurma, setFiltroTurma] = useState("");

  // Armazena o status selecionado.
  const [filtroStatus, setFiltroStatus] = useState("");

  // Indica se a consulta ainda está em andamento.
  const [carregando, setCarregando] = useState(true);

  // Armazena possíveis mensagens de erro.
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    // Consulta os alunos cadastrados no banco.
    listarAlunos()
      .then((dados) => {
        if (!Array.isArray(dados)) {
          throw new Error("Resposta inesperada da API.");
        }

        if (ativo) {
          setAlunos(dados);
        }
      })
      .catch((error) => {
        if (ativo) {
          setErro(error.message);
        }
      })
      .finally(() => {
        if (ativo) {
          setCarregando(false);
        }
      });

    return () => {
      ativo = false;
    };
  }, []);

  // Filtra os alunos pelo nome ou RM digitado.

  const alunosFiltrados = alunos.filter((aluno) => {
    const termo = busca.trim().toLowerCase();

    const rm = String(aluno.rm_aluno ?? "");
    const nome = String(aluno.nome_completo ?? "").toLowerCase();

    // Pesquisa por nome ou RM.
    const correspondeBusca = rm.includes(termo) || nome.includes(termo);

    // Filtro por curso.
    const correspondeCurso = filtroCurso === "" || aluno.curso === filtroCurso;

    // Filtro por turma.
    const correspondeTurma = filtroTurma === "" || aluno.turma === filtroTurma;

    // Filtro por status.
    const correspondeStatus = filtroStatus === "" || aluno.status === filtroStatus;

    // Todos os critérios devem ser atendidos.
    return correspondeBusca && correspondeCurso && correspondeTurma && correspondeStatus;
  });

  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />

        <div className="flex flex-1 flex-col min-w-0">
          <Header
            headerTitle="Alunos"
            AccountName="Administrador"
            AccountPosition="Administrador"
          />

          <main className="flex-1 p-6">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold">Gerenciamento de Alunos</h1>

                <p className="text-muted-foreground">Consulte os alunos cadastrados no sistema.</p>
              </div>

              <CadastrarAlunoForm
                onCadastrado={(novoAluno) => {
                  setAlunos((atuais) => [...atuais, novoAluno]);
                }}
              />

              {/* Pesquisa por nome ou RM */}
              <div className="space-y-2">
                <label htmlFor="buscar-aluno" className="text-sm font-medium">
                  Pesquisar alunos
                </label>

                <Input
                  id="buscar-aluno"
                  type="search"
                  placeholder="Digite o nome ou RM do aluno..."
                  value={busca}
                  onChange={(event) => setBusca(event.target.value)}
                />
              </div>

              {/* Filtros organizados lado a lado */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {/* Filtro por curso */}
                <div className="space-y-2">
                  <label htmlFor="filtro-curso" className="text-sm font-medium">
                    Filtrar por curso
                  </label>

                  <select
                    id="filtro-curso"
                    value={filtroCurso}
                    onChange={(event) => setFiltroCurso(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3"
                  >
                    <option value="">Todos os cursos</option>
                    <option value="EXTENSIVO">Extensivo</option>
                    <option value="SEMI_EXTENSIVO">Semi-extensivo</option>
                  </select>
                </div>

                {/* Filtro por turma */}
                <div className="space-y-2">
                  <label htmlFor="filtro-turma" className="text-sm font-medium">
                    Filtrar por turma
                  </label>

                  <select
                    id="filtro-turma"
                    value={filtroTurma}
                    onChange={(event) => setFiltroTurma(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3"
                  >
                    <option value="">Todas as turmas</option>
                    <option value="T1">T1</option>
                    <option value="T2">T2</option>
                    <option value="T3">T3</option>
                    <option value="T4">T4</option>
                  </select>
                </div>

                {/* Filtro por status */}
                <div className="space-y-2">
                  <label htmlFor="filtro-status" className="text-sm font-medium">
                    Filtrar por status
                  </label>

                  <select
                    id="filtro-status"
                    value={filtroStatus}
                    onChange={(event) => setFiltroStatus(event.target.value)}
                    className="h-9 w-full rounded-md border bg-background px-3"
                  >
                    <option value="">Todos os status</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="PENDENTE">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="rounded-md border bg-card">
                <div className="border-b p-4">
                  <h2 className="font-semibold">Alunos cadastrados</h2>
                </div>

                {carregando ? (
                  <p className="p-4">Carregando alunos...</p>
                ) : erro ? (
                  <p className="p-4 text-destructive">Erro: {erro}</p>
                ) : alunos.length === 0 ? (
                  <p className="p-4 text-muted-foreground">Nenhum aluno cadastrado.</p>
                ) : alunosFiltrados.length === 0 ? (
                  <p className="p-4 text-muted-foreground">
                    Nenhum aluno encontrado para essa pesquisa.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-muted/50">
                        <tr className="text-left">
                          <th className="p-4">RM</th>
                          <th className="p-4">Nome</th>
                          <th className="p-4">E-mail</th>
                          <th className="p-4">Curso</th>
                          <th className="p-4">Turma</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Ações</th>
                        </tr>
                      </thead>

                      <tbody>
                        {alunosFiltrados.map((aluno) => (
                          <tr key={aluno.rm_aluno} className="border-b">
                            <td className="p-4">{aluno.rm_aluno}</td>
                            <td className="p-4">{aluno.nome_completo}</td>
                            <td className="p-4">{aluno.email}</td>
                            <td className="p-4">{aluno.curso}</td>
                            <td className="p-4">{aluno.turma ?? "Não informada"}</td>
                            <td className="p-4">{aluno.status}</td>
                            <td className="p-4">
                              <EditarAlunoForm
                                aluno={aluno}
                                onAtualizado={(alunoAtualizado) => {
                                  setAlunos((atuais) =>
                                    atuais.map((item) =>
                                      item.rm_aluno === alunoAtualizado.rm_aluno
                                        ? alunoAtualizado
                                        : item,
                                    ),
                                  );
                                }}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
