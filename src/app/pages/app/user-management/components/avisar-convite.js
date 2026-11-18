import { toast } from '@/components/ui/toast';

// Mostra um aviso com o resultado do envio do convite por email.
// convite = { enviado, modoDesenvolvimento, erroEmail } (resposta da API).
export function avisarResultadoConvite(convite, email) {
  if (convite?.enviado) {
    toast.add({ type: 'success', description: `Convite enviado para ${email}.` });
  } else if (convite?.modoDesenvolvimento) {
    toast.add({
      type: 'warning',
      title: 'Email não configurado',
      description:
        'O convite NÃO foi enviado por email: o link aparece no terminal do backend (modo desenvolvimento).',
    });
  } else {
    toast.add({
      type: 'error',
      description:
        'Não foi possível enviar o email do convite. Tente "Reenviar convite" mais tarde.',
    });
  }
}
