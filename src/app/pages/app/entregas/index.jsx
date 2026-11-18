import { useNavigate } from 'react-router-dom';
import { ClipboardTextIcon } from '@phosphor-icons/react';

import Header from '@/components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { usuarioEhMestre } from '@/lib/api';
import EntregasSection from './components/entregas-section';

// Página de Entregas de kits e livros: lista de chamada por material
// (protótipo da equipe, aprovado em 18/11).
export default function EntregasPage() {
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={'Entregas'} />
          <main className="flex-1 overflow-y-hidden">
            {/* pb-28: o aviso com "Desfazer" fica no canto de baixo por alguns
                segundos; o espaço extra deixa rolar a paginação para cima dele. */}
            <div className="px-6 pt-6 pb-28 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-xl">Entrega de Kits e Livros</h3>
                  <p className="text-sm line text-muted-foreground">
                    Escolha o material e marque quem recebeu. Cada marcação já registra a entrega
                    e desconta 1 unidade do estoque.
                  </p>
                </div>
                {/* Histórico de alterações: só o Administrador Mestre vê. */}
                {usuarioEhMestre() && (
                  <Button variant="outline" onClick={() => navigate('/usermanagement?aba=logs')}>
                    <ClipboardTextIcon />
                    Logs
                  </Button>
                )}
              </div>
              <EntregasSection />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
