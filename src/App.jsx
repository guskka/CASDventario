import { ThemeProvider } from "./components/theme-provider";
import { AppRoutes } from "./app/routes";
import { TooltipProvider } from "./components/ui/tooltip";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AppRoutes />
      </TooltipProvider>
    </ThemeProvider>
  );
}
