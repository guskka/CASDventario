import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';

import { Button } from '@/components/ui/button';

// Botão "Mostrar inativos (N)" / "Esconder inativos" das listas.
// Os registros inativos ficam escondidos até o botão ser ligado.
export default function BotaoMostrarInativos({ mostrando, quantidade, onToggle }) {
  return (
    <Button variant="outline" onClick={onToggle}>
      {mostrando ? <EyeSlashIcon /> : <EyeIcon />}
      {mostrando ? 'Esconder inativos' : `Mostrar inativos (${quantidade})`}
    </Button>
  );
}
