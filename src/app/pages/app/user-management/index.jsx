import Header from '../../../../components/ui/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import AddAdminDialog from './components/add-admin-dialog';
import AdmManagementTabs from './components/adm-management-tabs';

export default function AdmUserManagement() {
  const user = "Adminstrador";
  const roles = [
    { label: "Administrador Básico", value: "BASICO" },
    { label: "Administrador Mestre", value: "MESTRE" },
  ];
  
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header
            headerTitle={'Administradores'}
            AccountName={user}
            AccountPosition={roles[0].label}
          />
          <main className="flex-1 overflow-y-hidden">
            <div className="px-6 pt-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xl">
                      Gerenciamento de Administradores
                    </h3>
                    <p className="text-sm line text-muted-foreground">
                      Administre e supervisione contas e privilégios de
                      administradores no sistema.
                    </p>
                  </div>
                  <div>
                    <AddAdminDialog />
                  </div>
                </div>
                <AdmManagementTabs />
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
