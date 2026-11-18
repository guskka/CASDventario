import { Field } from '@/components/ui/field';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Campo de formulário com rótulo + caixa de seleção, para as janelas de
// cadastro/edição. opcoes = [{ label, value }].
export default function CampoSelect({
  id,
  label,
  obrigatorio,
  opcoes,
  valor,
  onChange,
  placeholder,
  disabled,
}) {
  return (
    <Field>
      <Label htmlFor={id}>
        {label}
        {obrigatorio && <span className="text-destructive">*</span>}
      </Label>
      <Select id={id} items={opcoes} value={valor} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {opcoes.map((opcao) => (
              <SelectItem key={opcao.value} value={opcao.value}>
                {opcao.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}
