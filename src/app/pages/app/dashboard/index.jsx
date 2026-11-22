import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookIcon,
  ClockIcon,
  HandHeartIcon,
  LaptopIcon,
  UsersIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';

import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DicaTextoCortado from '@/components/dica-texto-cortado';
import { resumoDashboard } from '@/lib/api';
import CartaoResumo from './components/cartao-resumo';
import { BarrasPorMes, MedidorKits, PizzaNotebooks } from './components/graficos';
import ListaEmprestimos from './components/lista-emprestimos';

// Dashboard: página inicial com o resumo do sistema (item 14) e os gráficos
// do protótipo (item 21a, prototipo/dashboard.png). As listas de atenção
// continuam embaixo dos gráficos.
export default function DashboardPage() {
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    resumoDashboard()
      .then(setResumo)
      .catch((err) => setErro(err.message));
  }, []);

  const atrasados = resumo?.emprestimos.atrasados ?? [];

  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Dashboard'} />
          <main className="flex-1 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              <div>
                <h3 className="font-semibold text-xl">Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Visão geral das operações da secretaria.
                </p>
              </div>

              {erro && (
                <p className="text-sm text-destructive">Não foi possível carregar o resumo: {erro}</p>
              )}
              {!resumo && !erro && <p className="text-sm text-muted-foreground">Carregando...</p>}

              {resumo && (
                <>
                  {/* Números principais (modelo do protótipo) */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <CartaoResumo titulo="Alunos ativos" valor={resumo.alunos_ativos} icone={UsersIcon} tom="azul" />
                    <CartaoResumo
                      titulo="Kits disponíveis no estoque"
                      valor={resumo.estoque.itens_disponiveis}
                      icone={BookIcon}
                      tom="laranja"
                    />
                    <CartaoResumo titulo="Notebooks em uso" valor={resumo.notebooks.total} icone={LaptopIcon} tom="verde" />
                  </div>

                  {/* Gráficos */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <MedidorKits kits={resumo.kits_entregues} alunosAtivos={resumo.alunos_ativos} />
                    <PizzaNotebooks notebooks={resumo.notebooks} />
                  </div>
                  <BarrasPorMes porMes={resumo.emprestimos_por_mes} />

                  {/* Empréstimos que pedem atenção */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ListaEmprestimos
                      titulo="Empréstimos atrasados"
                      descricao="Passaram da data de devolução."
                      icone={WarningCircleIcon}
                      emprestimos={atrasados}
                      vazio="Nenhum empréstimo atrasado."
                      destaque
                    />
                    <ListaEmprestimos
                      titulo="Vencem nos próximos 7 dias"
                      descricao="Bom momento para lembrar os alunos."
                      icone={ClockIcon}
                      emprestimos={resumo.emprestimos.vencendo}
                      vazio="Nenhum empréstimo vence nos próximos 7 dias."
                    />
                  </div>

                  {/* Estoque e entregas */}
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookIcon className="size-5" />
                          Materiais esgotados
                          <span className="text-sm font-normal text-muted-foreground">
                            ({resumo.estoque.esgotados.length})
                          </span>
                        </CardTitle>
                        <CardDescription>Sem nenhum item disponível no estoque.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {resumo.estoque.esgotados.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhum material esgotado.</p>
                        ) : (
                          <ul className="divide-y">
                            {resumo.estoque.esgotados.map((nome) => (
                              <li key={nome} className="py-2">
                                {nome}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HandHeartIcon className="size-5" />
                          Últimas entregas
                        </CardTitle>
                        <CardDescription>
                          As 5 mais recentes.{' '}
                          <Link to="/entregas" className="font-medium text-primary hover:underline">
                            Ver todas
                          </Link>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {resumo.ultimas_entregas.length === 0 ? (
                          <p className="text-sm text-muted-foreground">Nenhuma entrega ainda.</p>
                        ) : (
                          <DicaTextoCortado>
                            <ul className="divide-y">
                              {resumo.ultimas_entregas.map((e) => (
                                <li key={e.id_entrega_kit} className="flex justify-between gap-4 py-2">
                                  <span className="min-w-0 truncate">{e.descricao}</span>
                                  <span className="shrink-0 text-sm text-muted-foreground">
                                    {new Date(e.data_entrega_kit).toLocaleDateString('pt-BR')}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </DicaTextoCortado>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
