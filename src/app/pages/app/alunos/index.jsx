import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import AlunoDialog from './components/aluno-dialog';
import ImportarAlunosDialog from './components/importar-alunos-dialog';
import AlunosSection from './components/alunos-section';

// Página de Alunos (item 8 do PLAN.md), no mesmo modelo da página de Administradores.
export default function AlunosPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Alunos'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Gerenciamento de Alunos</h3>
                  <p className="text-sm line text-muted-foreground">
                    Cadastre e acompanhe os alunos atendidos pela ONG.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ImportarAlunosDialog />
                  <AlunoDialog />
                </div>
              </div>
              <AlunosSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
