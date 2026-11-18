import { Link, useNavigate } from "react-router-dom";

import { UserIcon, SignOutIcon, PaintBrushIcon } from "@phosphor-icons/react";

import { usuarioLogado, encerrarSessao } from "@/lib/api";
import SinoNotificacoes from "@/components/sino-notificacoes";
import { urlAvatar } from "@/lib/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
import { Button } from "./button";
import { Separator } from "./separator";
import { SidebarTrigger } from "./sidebar";

const CARGOS = {
  BASICO: "Administrador Básico",
  MESTRE: "Administrador Mestre",
};

export default function Header({ headerTitle, AccountName, AccountPosition }) {
  const navigate = useNavigate();

  // Nome e cargo vêm de quem fez login. Os valores passados pela página
  // só são usados se, por algum motivo, não houver sessão.
  const usuario = usuarioLogado();
  const nome = usuario?.nome_completo ?? AccountName;
  const cargo = usuario ? (CARGOS[usuario.tipo] ?? usuario.tipo) : AccountPosition;

  function sair() {
    encerrarSessao();
    navigate("/signin", { replace: true });
  }

  // Foto de perfil, se a pessoa enviou uma; senão, o avatar automático.
  const avatarUrl = urlAvatar(nome, usuario?.url_foto);

  return (
    <header className="flex items-center justify-between w-full h-24 px-6 border-b">
      <div className="flex gap-4">
        <SidebarTrigger className="-mr-1" />
        <Separator orientation="vertical" />
        <h2 className="font-semibold text-xl">{headerTitle}</h2>
      </div>
      <div className="flex items-center gap-2">
        {/* Notificações: empréstimos atrasados */}
        <SinoNotificacoes />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="lg" className="flex h-12">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src={avatarUrl}
                alt={`Avatar de ${nome}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" />
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{nome}</span>
                    <span>{cargo}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link to={"/profile"}>
                <DropdownMenuItem>
                  <UserIcon />
                  Perfil
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link to={"/appearence"}>
                <DropdownMenuItem>
                  <PaintBrushIcon />
                  Aparência
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={sair}>
                <SignOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
