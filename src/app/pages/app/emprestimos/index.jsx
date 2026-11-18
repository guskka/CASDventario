import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import EmprestimoDialog from './components/emprestimo-dialog';
import EmprestimosSection from './components/emprestimos-section';

// Página de Empréstimos de notebook (item 12 do PLAN.md), no mesmo modelo das outras.
export default function EmprestimosPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Empréstimos'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Empréstimos de notebook</h3>
                  <p className="text-sm line text-muted-foreground">
                    Registre o empréstimo com o checklist de saída. O status do notebook muda
                    automaticamente.
                  </p>
                </div>
                <EmprestimoDialog />
              </div>
              <EmprestimosSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
