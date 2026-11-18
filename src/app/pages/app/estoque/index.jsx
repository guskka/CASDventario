import { Link } from 'react-router-dom';

import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { buttonVariants } from '@/components/ui/button';
import EstoqueSection from './components/estoque-section';

// Página Estoque (item 10 do PLAN.md): quanto há de cada livro ou kit.
// Antigo item "Livros" do menu (decisão D9).
export default function EstoquePage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Estoque'} />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-xl">Estoque de livros e kits</h3>
                  <p className="text-sm line text-muted-foreground">
                    Quanto chegou, quanto já foi entregue e quanto ainda há de cada material,
                    somando todas as remessas.
                  </p>
                </div>
                <Link to="/remessas" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                  Ver remessas
                </Link>
              </div>
              <EstoqueSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
