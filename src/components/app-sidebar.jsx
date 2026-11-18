import { NavLink } from "react-router-dom";

import NavMain from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  CirclesFourIcon,
  UserIcon,
  PackageIcon,
  BookIcon,
  LaptopIcon,
  UserGearIcon,
  StudentIcon,
  BellIcon,
  GearIcon,
} from "@phosphor-icons/react";
import LogoBlue from "../assets/brand/casdventario-blue-logo.svg";
import { usuarioEhMestre } from "@/lib/api";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: CirclesFourIcon,
    },
    {
      title: "Administradores",
      url: "/usermanagement",
      icon: UserGearIcon,
      apenasMestre: true,
    },
    {
      title: "Alunos",
      url: "/alunos",
      icon: StudentIcon,
    },
    {
      title: "Remessas",
      url: "/remessas",
      icon: PackageIcon,
    },
    {
      title: "Estoque",
      url: "/estoque",
      icon: BookIcon,
    },
    {
      title: "Notebooks",
      url: "/notebooks",
      icon: LaptopIcon,
    },
  ],
  navSecondary: [
    {
      title: "Perfil",
      url: "/",
      icon: UserIcon,
    },
    {
      title: "Notificações",
      url: "/",
      icon: BellIcon,
    },
    {
      title: "Configurações",
      url: "/",
      icon: GearIcon,
    },
  ],
};

export function AppSidebar() {
  // Itens marcados com apenasMestre só aparecem para Administrador Mestre.
  const mestre = usuarioEhMestre();
  const itensMenu = data.navMain.filter((item) => !item.apenasMestre || mestre);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to={"/dashboard"}>
              <SidebarMenuButton
                size="lg"
                className="data-[slot=sidebar-menu-button]:p-0.5! hover:bg-transparent"
              >
                <img src={LogoBlue} alt="Logo CASDventário" className="w-8" />
                <span className="text-lg font-bold text-primary">CASDventário</span>
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={itensMenu} />
      </SidebarContent>
    </Sidebar>
  );
}
