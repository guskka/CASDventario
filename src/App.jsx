import { ThemeProvider } from "./components/theme-provider";
import { AppRoutes } from "./app/routes";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "./components/ui/toast";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        {/* Toaster mostra os avisos (ex: "salvo com sucesso") chamados com toast.add() */}
        <Toaster>
          <AppRoutes />
        </Toaster>
      </TooltipProvider>
    </ThemeProvider>
  );
}
