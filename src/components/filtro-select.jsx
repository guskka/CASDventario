import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
  SelectGroup,
} from '@/components/ui/select';

// Caixa de seleção do topo das listas ("Ordenar por" e filtros), com uma dica
// ao passar o mouse. items = [{ label, value }].
export default function FiltroSelect({ items, value, onValueChange, dica }) {
  return (
    <Select items={items} value={value} onValueChange={onValueChange}>
      <Tooltip>
        <TooltipTrigger render={<SelectTrigger />}>
          <SelectValue />
        </TooltipTrigger>
        <TooltipContent side="bottom">{dica}</TooltipContent>
      </Tooltip>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
