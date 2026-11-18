import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import RemessaDialog from './components/remessa-dialog';
import RemessasSection from './components/remessas-section';

// Página de Remessas (item 10 do PLAN.md), no mesmo modelo da página de Alunos.
export default function RemessasPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Remessas'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Gerenciamento de Remessas</h3>
                  <p className="text-sm line text-muted-foreground">
                    Registre cada chegada de materiais (livros e kits). O estoque é atualizado
                    automaticamente.
                  </p>
                </div>
                <RemessaDialog />
              </div>
              <RemessasSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
