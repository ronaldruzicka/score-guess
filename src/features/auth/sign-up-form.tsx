import type { SignupFormValues } from "@/features/auth/schemas";

import { AtIcon, LockPasswordIcon, UserIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";

import { TextField } from "@/components/form/text-field";
import { signupSchema } from "@/features/auth/schemas";
import { authClient } from "@/lib/auth-client";
import { formatFieldError } from "@/lib/format-field-error";
import { Route as DashboardRoute } from "@/routes/_protected/dashboard";
import { Button } from "@/ui/button";
import { FieldGroup } from "@/ui/field";

export function SignUpForm() {
  const navigate = useNavigate();

  const signupForm = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    } satisfies SignupFormValues,
    onSubmit: () => {
      navigate({ to: DashboardRoute.to });
    },
    validators: {
      onChange: signupSchema,
      onSubmitAsync: async ({ value }) => {
        const result = await authClient.signUp.email({
          callbackURL: DashboardRoute.to,
          email: value.email,
          name: value.name,
          password: value.password,
        });

        if (result.error) {
          return {
            form: result.error.message ?? "Could not create account.",
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
        await signupForm.handleSubmit();
      }}
    >
      <signupForm.Subscribe selector={(state) => state.errorMap.onSubmit}>
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
      </signupForm.Subscribe>
      <FieldGroup>
        <signupForm.Field name="name">
          {(field) => (
            <TextField
              autoComplete="name"
              field={field}
              icon={<HugeiconsIcon icon={UserIcon} strokeWidth={2} size={20} />}
              id="signup-name"
              label="Name"
              type="text"
            />
          )}
        </signupForm.Field>
        <signupForm.Field name="email">
          {(field) => (
            <TextField
              autoComplete="email"
              field={field}
              icon={<HugeiconsIcon icon={AtIcon} strokeWidth={2} size={20} />}
              id="signup-email"
              label="Email"
              type="email"
            />
          )}
        </signupForm.Field>
        <signupForm.Field name="password">
          {(field) => (
            <TextField
              autoComplete="new-password"
              field={field}
              icon={
                <HugeiconsIcon
                  icon={LockPasswordIcon}
                  strokeWidth={2}
                  size={20}
                />
              }
              id="signup-password"
              label="Password"
              type="password"
            />
          )}
        </signupForm.Field>
      </FieldGroup>
      <signupForm.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            className="w-full"
            disabled={!canSubmit || isSubmitting}
            size="lg"
            type="submit"
          >
            {isSubmitting ? "Registering…" : "Register"}
          </Button>
        )}
      </signupForm.Subscribe>
    </form>
  );
}
