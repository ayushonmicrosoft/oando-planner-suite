"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSignature, Grid3X3, Box, Library, FolderOpen, Pencil, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, LogOut, Settings, ChevronDown, Map, DraftingCompass, Layers3, Shield, Briefcase, Users, CreditCard } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarFooter } from '@/components/ui/sidebar';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = usePathname();
  const { data: health, isError } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const { user, isLoaded, isAdmin, signOut } = useAuth();

  const mainNavItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/planner/studio', icon: DraftingCompass, label: 'Live Planner' },
    { href: '/planners', icon: Layers3, label: 'All Planners' },
    { href: '/planner/canvas', icon: Grid3X3, label: '2D Canvas' },
    { href: '/planner/blueprint', icon: FileSignature, label: 'Blueprint Wizard' },
    { href: '/viewer/3d', icon: Box, label: '3D Viewer' },
  ];

  const toolNavItems = [
    { href: '/tools/cad', icon: Pencil, label: 'CAD Drawing' },
    { href: '/tools/floor-plan', icon: LayoutGrid, label: 'Floor Plan Creator' },
    { href: '/tools/shapes', icon: Shapes, label: 'Custom Shapes' },
    { href: '/tools/site-plan', icon: Map, label: 'Site Plan' },
    { href: '/tools/import', icon: ImagePlus, label: 'Import & Scale' },
  ];

  const managementNavItems = [
    { href: '/projects', icon: Briefcase, label: 'Projects' },
    { href: '/clients', icon: Users, label: 'Clients' },
  ];

  const dataNavItems = [
    { href: '/templates', icon: LayoutTemplate, label: 'Templates' },
    { href: '/catalog', icon: Library, label: 'Furniture Catalog' },
    { href: '/plans', icon: FolderOpen, label: 'Saved Plans' },
    { href: '/settings/billing', icon: CreditCard, label: 'Billing' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location === href || location.startsWith(href + '/') || location.startsWith(href + '?');
  };

  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const renderNavGroup = (items: typeof mainNavItems, label?: string) => (
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-white/15 px-3 mb-0.5">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)}>
                <Link href={item.href} className="flex items-center gap-2.5 text-[13px] text-white/45 hover:text-white/80 transition-colors">
                  <item.icon className="w-[15px] h-[15px] opacity-50" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#070D12] w-full">
        <Sidebar className="!bg-[#0A0F15] !border-r !border-white/[0.04]">
          <SidebarHeader className="border-b border-white/[0.04] px-4 py-3">
            {isLoaded && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 w-full text-left hover:bg-white/[0.04] rounded-lg p-1.5 -m-1.5 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-[#5488B6] to-[#77A2C9] text-white font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] text-white/80 truncate">{displayName}</div>
                    <div className="text-[11px] text-white/20 truncate">{user.email}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-white/15 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52 bg-[#0F1520] border-white/[0.08]">
                  <DropdownMenuItem onClick={() => window.location.href = '/settings/billing'} className="text-[13px] text-white/60 hover:text-white">
                    <CreditCard className="w-3.5 h-3.5 mr-2 opacity-50" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/[0.06]" />
                  <DropdownMenuItem onClick={() => signOut()} className="text-[13px] text-white/60 hover:text-white">
                    <LogOut className="w-3.5 h-3.5 mr-2 opacity-50" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2.5">
                <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-5 w-auto" />
                <span className="text-white/80 font-semibold text-[15px] tracking-[-0.02em]">One&Only</span>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent className="pt-1">
            {renderNavGroup(mainNavItems)}
            {renderNavGroup(toolNavItems, "Tools")}
            {renderNavGroup(managementNavItems, "Management")}
            {renderNavGroup(dataNavItems, "Data")}
            {isAdmin && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-white/15 px-3 mb-0.5">
                  Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/admin')}>
                        <Link href="/admin" className="flex items-center gap-2.5 text-[13px] text-white/45 hover:text-white/80 transition-colors">
                          <Shield className="w-[15px] h-[15px] opacity-50" strokeWidth={1.8} />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t border-white/[0.04] p-3">
            <div className="flex items-center gap-2 text-[11px] text-white/20">
              <div className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-red-400' : health ? 'bg-emerald-400' : 'bg-white/15'}`} />
              {isError ? 'API Offline' : health ? 'Connected' : 'Checking...'}
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
