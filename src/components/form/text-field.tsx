import type { AnyFieldApi } from "@tanstack/react-form";

import { cn } from "@/lib/utils";
import { Field, FieldError, FieldLabel } from "@/ui/field";
import { Input } from "@/ui/input";

type FieldProps = Readonly<
  Pick<AnyFieldApi, "state" | "name" | "handleBlur" | "handleChange">
>;

type Props = Readonly<{
  autoComplete?: string;
  field: FieldProps;
  icon?: React.ReactNode;
  id: string;
  label: string;
  placeholder?: string;
  type: React.ComponentProps<typeof Input>["type"];
}>;

export function TextField({
  autoComplete,
  field,
  icon,
  id,
  label,
  placeholder,
  type,
}: Readonly<Props>) {
  const hasError = !field.state.meta.isValid && field.state.meta.isBlurred;

  return (
    <Field data-invalid={hasError || undefined}>
      {label ? (
        <FieldLabel
          className="ml-1 text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
          htmlFor={id}
        >
          {label}
        </FieldLabel>
      ) : null}
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        ) : null}
        <Input
          aria-invalid={hasError || undefined}
          autoComplete={autoComplete}
          className={cn(
            "h-11 py-3.5 text-sm placeholder:text-muted-foreground/60",
            icon && "pl-10",
          )}
          id={id}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => field.handleChange(event.target.value)}
          placeholder={placeholder}
          type={type}
          value={field.state.value}
        />
      </div>
      {hasError ? <FieldError errors={field.state.meta.errors} /> : null}
    </Field>
  );
}
