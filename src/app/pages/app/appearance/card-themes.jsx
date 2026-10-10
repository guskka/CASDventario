import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { useTheme } from "@/components/theme-provider";

export default function CardThemes() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-8 w-full">
      <button className="w-full" onClick={() => setTheme("light")}>
        <Card
          className={`border-2 hover:border-primary transition-all ${theme === "light" ? "border-primary" : "border-transparent"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? <SunIcon weight="fill" /> : <SunIcon weight="regular" />}
              Tema Claro
            </CardTitle>
            <CardDescription className="flex">
              Tema claro do CASDventário, possui contraste com fundo branco.
            </CardDescription>
            {theme === "light" ? (
              <CardAction>
                <Badge>Ativo</Badge>
              </CardAction>
            ) : (
              ""
            )}
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="flex flex-col justify-center gap-8 w-full p-6 bg-[oklch(1_0_0)] rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-24 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
                  <div className="w-24 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
                </div>
                <div className="w-24 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="w-24 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
                  <div className="w-52 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
                  <div className="w-52 h-6 bg-[oklch(0.145_0_0/0.2)] rounded-full"></div>
                </div>
                <div className="w-24 h-6 bg-[oklch(0.852_0.199_91.936)] rounded-md"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-52 h-6 bg-[oklch(0.5_0.134_242.749)] rounded-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
      <button className="w-full" onClick={() => setTheme("dark")}>
        <Card
          className={`border-2 hover:border-primary transition-all ${theme === "dark" ? "border-primary" : "border-transparent"}`}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "dark" ? <MoonIcon weight="fill" /> : <MoonIcon weight="regular" />}
              Tema Escuro
            </CardTitle>
            <CardDescription className="flex">
              Tema padrão do CASDventário, possui contraste com fundo preto.
            </CardDescription>
            {theme === "dark" ? (
              <CardAction>
                <Badge>Ativo</Badge>
              </CardAction>
            ) : (
              ""
            )}
          </CardHeader>
          <Separator />
          <CardContent>
            <div className="flex flex-col justify-center gap-8 w-full p-6 bg-[oklch(0.205_0_0)] rounded-md">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="w-24 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
                  <div className="w-24 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
                </div>
                <div className="w-24 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <div className="w-24 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
                  <div className="w-52 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
                  <div className="w-52 h-6 bg-[oklch(0.985_0_0/0.2)] rounded-full"></div>
                </div>
                <div className="w-24 h-6 bg-[oklch(0.795_0.184_86.047)] rounded-md"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-52 h-6 bg-[oklch(0.5_0.134_242.749)] rounded-md"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
    </div>
  );
}
