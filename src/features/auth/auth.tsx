import { Image } from "@unpic/react";

import { Card, CardContent, CardFooter, CardHeader } from "@/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";

import { AuthSocial } from "./auth-social";
import { LoginForm } from "./login-form";
import { SignUpForm } from "./sign-up-form";
import wcLogo from "./wc26-logo.png";

export function Auth() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 md:p-12">
      <div
        className="fixed inset-0 -z-1 h-full w-full bg-[url(/stadium.png)] bg-cover bg-center opacity-40 blur-xs contrast-200 grayscale"
        aria-hidden
      />

      <Card className="w-full max-w-96 opacity-80 backdrop-blur-sm" size="lg">
        <CardHeader className="justify-items-center gap-4">
          <Image
            src={wcLogo}
            alt="FIFA Cup 2026"
            layout="constrained"
            width={56}
            height={84}
          />
          <h1 className="font-heading text-3xl font-black tracking-tight">
            FIFA CUP 2026
          </h1>
        </CardHeader>

        <CardContent>
          <Tabs className="w-full" defaultValue="login">
            <TabsList className="w-full border border-border/50 bg-transparent">
              <TabsTrigger
                className="flex-1 text-xs font-semibold uppercase"
                value="login"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 text-xs font-semibold uppercase"
                value="signup"
              >
                Sign up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="-mt-6 flex-col gap-4 border-t-0">
          <div className="flex w-full items-center justify-center gap-4 text-center text-[9px] leading-none font-bold tracking-[0.3em] text-muted-foreground uppercase before:h-px before:flex-1 before:bg-muted-foreground before:content-[''] after:h-px after:flex-1 after:bg-muted-foreground after:content-['']">
            Or sign in with
          </div>

          <AuthSocial />

          <p className="col-span-2 text-center text-[9px] leading-relaxed tracking-widest text-muted-foreground uppercase">
            copyright © ronald ruzicka 2026
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
