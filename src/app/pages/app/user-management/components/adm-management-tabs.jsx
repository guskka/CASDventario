import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TableSection from '@/components/table-section';

export default function AdmManagementTabs() {
  return (
    <Tabs>
      <TabsList variant="line">
        <TabsTrigger value="administrators">Administradores</TabsTrigger>
        <TabsTrigger value="administratorsLog">Logs</TabsTrigger>
      </TabsList>
      <TabsContent value="administrators">
        <TableSection title="Administradores" />
      </TabsContent>
      <TabsContent value="administratorsLog">
        <TableSection title="Logs" />
      </TabsContent>
    </Tabs>
  );
}
