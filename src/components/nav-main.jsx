'use client';

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavLink, useLocation } from 'react-router-dom';

export default function NavMain({ items }) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = location.pathname === item.url;

          return (
            <SidebarMenuItem key={item.title}>
              {/* render: o próprio item do menu vira o link (sem um botão dentro do link). */}
              <SidebarMenuButton
                render={<NavLink to={item.url} />}
                tooltip={item.title}
                isActive={isActive}
              >
                {item.icon && <item.icon weight={isActive ? 'bold' : 'regular'} />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
