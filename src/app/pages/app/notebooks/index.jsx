import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import NotebookDialog from './components/notebook-dialog';
import NotebooksSection from './components/notebooks-section';

// Página de Notebooks (item 9 do PLAN.md), no mesmo modelo da página de Alunos.
export default function NotebooksPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Notebooks'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Gerenciamento de Notebooks</h3>
                  <p className="text-sm line text-muted-foreground">
                    Cadastre os notebooks da ONG e acompanhe quais estão disponíveis, emprestados ou
                    em manutenção.
                  </p>
                </div>
                <NotebookDialog />
              </div>
              <NotebooksSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
