import type { LoginFormValues } from "@/features/auth/schemas";

import { AtIcon, SquareUnlock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";

import { TextField } from "@/components/form/text-field";
import { loginSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";
import { formatFieldError } from "@/lib/format-field-error";
import { Route as DashboardRoute } from "@/routes/_protected/dashboard";
import { Button } from "@/ui/button";
import { FieldGroup, FieldLabel } from "@/ui/field";

export function LoginForm() {
  const navigate = useNavigate();

  const loginForm = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies LoginFormValues,
    onSubmit: () => {
      navigate({ to: DashboardRoute.to });
    },
    validators: {
      onChange: loginSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await authClient.signIn.email({
          callbackURL: DashboardRoute.to,
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          return {
            form: result.error.message ?? "Could not sign in.",
          };
        }

        return null;
      },
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        event.stopPropagation();
        await loginForm.handleSubmit();
      }}
    >
      <loginForm.Subscribe selector={(state) => state.errorMap.onSubmit}>
        {(formError) => {
          const message = formError ? formatFieldError(formError) : null;

          return message ? (
            <p
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive"
              role="alert"
            >
              {message}
            </p>
          ) : null;
        }}
      </loginForm.Subscribe>
      <FieldGroup>
        <loginForm.Field name="email">
          {(field) => (
            <TextField
              autoComplete="email"
              field={field}
              icon={
                <HugeiconsIcon
                  icon={AtIcon}
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                />
              }
              id="login-email"
              label="Email"
              type="email"
            />
          )}
        </loginForm.Field>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <FieldLabel
              className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase"
              htmlFor="login-password"
            >
              Password
            </FieldLabel>
            <a
              className="text-[10px] tracking-tighter text-primary uppercase hover:text-primary/80"
              href="#recover"
            >
              Recover?
            </a>
          </div>
          <loginForm.Field name="password">
            {(field) => (
              <TextField
                autoComplete="current-password"
                field={field}
                icon={
                  <HugeiconsIcon
                    icon={SquareUnlock01Icon}
                    className="h-[18px] w-[18px]"
                    strokeWidth={2}
                  />
                }
                id="login-password"
                label=""
                type="password"
              />
            )}
          </loginForm.Field>
        </div>
      </FieldGroup>
      <loginForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            className="w-full"
            disabled={!canSubmit || isSubmitting}
            size="lg"
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        )}
      </loginForm.Subscribe>
    </form>
  );
}
