import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/ui/header";
import CardThemes from "./card-themes";

export default function AppearancePage() {
  return (
    <SidebarProvider>
      <div className="flex w-full font-geist">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0 w-full h-full">
          <Header headerTitle={"Aparência"} AccountName={"Administrador"} AccountPosition={"CEO"} />
          <main className="flex-1 px-6 pt-6">
            <div className="space-y-6">
              <div className="flex flex-col">
                <h3 className="font-semibold text-xl">Preferência de tema</h3>
                <p className="text-sm line text-muted-foreground">
                  Escolha a aparência que mais combina com você. Selecione entre o modo
                  claro ou escuro.
                </p>
                <p className="text-sm line text-muted-foreground">
                  Após selecionar, a alteração é aplicada na hora e salva automaticamente.
                </p>
              </div>
              <div className="flex flex-col">
                <h3 className="font-semibold text-md">Temas</h3>
              </div>
              <CardThemes />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
