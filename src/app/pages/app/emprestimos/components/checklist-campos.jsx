import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CampoSelect from '@/components/campo-select';
import { PARTES_CHECKLIST, rotuloEstado } from '../emprestimos-textos';

// Campos do checklist do notebook (as 10 partes + observações).
// Usado no empréstimo (checklist de saída) e na devolução (checklist de volta).
// valores = { carcaca: 'OTIMO', tela: ... }; onChange(chave, valor).
// referencia (opcional) = valores da saída: na devolução, mostra embaixo de
// cada parte que mudou como ela estava quando saiu.
export default function ChecklistCampos({
  prefixo,
  valores,
  onChange,
  observacoes,
  onObservacoes,
  referencia,
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {PARTES_CHECKLIST.map((parte) => {
          const antes = referencia?.[parte.chave];
          const mudou = antes !== undefined && antes !== valores[parte.chave];
          return (
            <div key={parte.chave} className="space-y-1">
              <CampoSelect
                id={`${prefixo}-${parte.chave}`}
                label={parte.label}
                opcoes={parte.opcoes}
                valor={valores[parte.chave]}
                onChange={(valor) => onChange(parte.chave, valor)}
              />
              {mudou && (
                <p className="text-xs text-muted-foreground">
                  Na saída: {rotuloEstado(antes)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <Field>
        <Label htmlFor={`${prefixo}-observacoes`}>Observações (opcional)</Label>
        <Textarea
          id={`${prefixo}-observacoes`}
          placeholder="Ex: risco na tampa, tecla F5 falhando..."
          value={observacoes}
          onChange={(e) => onObservacoes(e.target.value)}
        />
      </Field>
    </div>
  );
}
