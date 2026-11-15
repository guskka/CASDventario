import { ThemeProvider } from './components/theme-provider';
import { AppRoutes } from './app/routes';

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppRoutes />
    </ThemeProvider>
  );
}
