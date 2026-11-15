import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
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
} from '@phosphor-icons/react';
import NavMain from './nav-main';
import NavSecondary from './nav-secondary';
import { NavLink } from 'react-router-dom';
import LogotypeBlue from '../assets/brand/casdventario-blue-logotype.svg';
import LogoBlue from '../assets/brand/casdventario-blue-logo.svg';
import ThemeSwitcher from './theme-switcher';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: CirclesFourIcon,
    },
    {
      title: 'Administradores',
      url: '/usermanagement',
      icon: UserGearIcon,
    },
    {
      title: 'Alunos',
      url: '/alunos',
      icon: StudentIcon,
    },
    {
      title: 'Remessas',
      url: '/',
      icon: PackageIcon,
    },
    {
      title: 'Livros',
      url: '/',
      icon: BookIcon,
    },
    {
      title: 'Notebooks',
      url: '/',
      icon: LaptopIcon,
    },
  ],
  navSecondary: [
    {
      title: 'Perfil',
      url: '/',
      icon: UserIcon,
    },
    {
      title: 'Notificações',
      url: '/',
      icon: BellIcon,
    },
    {
      title: 'Configurações',
      url: '/',
      icon: GearIcon,
    },
  ],
};

export function AppSidebar() {
  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to={'/dashboard'}>
              <SidebarMenuButton
                size="lg"
                className="flex items-center justify-center"
              >
                <img
                  src={LogoBlue}
                  alt=""
                  className="w-42 hidden group-data-[collapsible=icon]:block group-data-[collapsible=icon]:p-1"
                />
                <img
                  src={LogotypeBlue}
                  alt=""
                  className="w-42 group-data-[collapsible=icon]:hidden"
                />
              </SidebarMenuButton>
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
