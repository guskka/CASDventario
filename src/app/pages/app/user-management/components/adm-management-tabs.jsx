import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableSection from '@/components/table-section';
import LogsSection from './logs-section';

// /usermanagement?aba=logs abre direto na aba Logs (usado pelo botão "Logs" da
// tela de Entregas).
export default function AdmManagementTabs() {
  const [params] = useSearchParams();
  const abaInicial = params.get('aba') === 'logs' ? 'administratorsLog' : 'administrators';

  return (
    <Tabs defaultValue={abaInicial}>
      <TabsList variant="line">
        <TabsTrigger value="administrators">Administradores</TabsTrigger>
        <TabsTrigger value="administratorsLog">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="administrators">
        <TableSection title="Administradores" />
      </TabsContent>
      <TabsContent value="administratorsLog">
        <LogsSection />
      </TabsContent>
    </Tabs>
  );
}
