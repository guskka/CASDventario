import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import EntregaDialog from './components/entrega-dialog';
import EntregasSection from './components/entregas-section';

// Página de Entregas de kits (item 11 do PLAN.md), no mesmo modelo das outras.
export default function EntregasPage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Entregas de kits'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Entregas de kits e livros</h3>
                  <p className="text-sm line text-muted-foreground">
                    Registre o que foi entregue a cada aluno. O estoque é descontado
                    automaticamente.
                  </p>
                </div>
                <EntregaDialog />
              </div>
              <EntregasSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
