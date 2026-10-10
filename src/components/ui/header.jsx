import { Link } from "react-router-dom";

import { BellIcon, UserIcon, GearIcon, SignOutIcon, PaintBrushIcon } from "@phosphor-icons/react";

import ThemeSwitcher from "../theme-switcher";
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

export default function Header({ headerTitle, AccountName, AccountPosition }) {
  const avatarUrl = `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(AccountName)}`;

  return (
    <header className="flex items-center justify-between w-full h-24 px-6 border-b">
      <div className="flex gap-4">
        <SidebarTrigger className="-mr-1" />
        <Separator orientation="vertical" />
        <h2 className="font-semibold text-xl">{headerTitle}</h2>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <BellIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <p>notificação1</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <p>notificação1</p>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="lg" className="flex h-12">
              <img
                className="w-8 h-8 rounded-full"
                src={avatarUrl}
                alt={`Avatar de ${AccountName}`}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex items-center gap-2">
                  <img src={avatarUrl} className="w-8 h-8 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-sm text-foreground">{AccountName}</span>
                    <span>{AccountPosition}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <UserIcon />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <GearIcon />
                Configurações
              </DropdownMenuItem>
              <Link to={"/appearence"}>
                <DropdownMenuItem>
                  <PaintBrushIcon />
                  Aparência
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <SignOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeSwitcher />
      </div>
    </header>
  );
}
