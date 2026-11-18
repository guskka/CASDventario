import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

// Caixinha de marcar no estilo dos outros componentes (shadcn "base-nova").
// Uso: <Checkbox checked={...} onCheckedChange={(marcado) => ...} />
function Checkbox({ className, ...props }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border border-input transition-colors outline-none',
        'after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        'data-disabled:cursor-not-allowed data-disabled:opacity-40 dark:bg-input/30',
        'data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon weight="bold" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
