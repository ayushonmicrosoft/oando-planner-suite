"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSignature, Grid3X3, Box, Library, FolderOpen, Pencil, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, LogOut, ChevronDown, Map, DraftingCompass, Layers3, Shield, Briefcase, Users, CreditCard } from 'lucide-react';
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
    <SidebarGroup className="py-1">
      {label && (
        <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-sidebar-foreground/25 px-3 mb-0.5 h-6">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} className="h-8">
                <Link href={item.href} className="flex items-center gap-2.5 text-[13px] transition-colors duration-300">
                  <item.icon className="w-[15px] h-[15px] opacity-50 shrink-0" strokeWidth={1.8} />
                  <span className="truncate">{item.label}</span>
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
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border/40 px-3 py-2.5">
            {isLoaded && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2.5 w-full text-left hover:bg-sidebar-accent/50 rounded-lg p-2 -m-1 transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
                  <Avatar className="h-7 w-7 ring-1 ring-sidebar-border/30">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary/15 to-primary/5 text-primary font-semibold">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[13px] truncate leading-tight">{displayName}</div>
                    <div className="text-[10px] text-sidebar-foreground/30 truncate leading-tight mt-0.5">{user.email}</div>
                  </div>
                  <ChevronDown className="w-3 h-3 text-sidebar-foreground/20 shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuItem onClick={() => window.location.href = '/settings/billing'} className="text-[13px]">
                    <CreditCard className="w-3.5 h-3.5 mr-2 opacity-60" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-[13px] text-destructive focus:text-destructive">
                    <LogOut className="w-3.5 h-3.5 mr-2 opacity-60" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2.5 p-1">
                <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-5 w-auto" />
                <span className="text-sidebar-foreground font-semibold text-[15px] tracking-[-0.02em]">One&Only</span>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent className="pt-0.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-sidebar-foreground/10 [&::-webkit-scrollbar-thumb]:rounded-full">
            {renderNavGroup(mainNavItems)}
            {renderNavGroup(toolNavItems, "Tools")}
            {renderNavGroup(managementNavItems, "Management")}
            {renderNavGroup(dataNavItems, "Data")}
            {isAdmin && (
              <SidebarGroup className="py-1">
                <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.12em] font-semibold text-sidebar-foreground/25 px-3 mb-0.5 h-6">
                  Admin
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild isActive={isActive('/admin')} className="h-8">
                        <Link href="/admin" className="flex items-center gap-2.5 text-[13px] transition-colors duration-300">
                          <Shield className="w-[15px] h-[15px] opacity-50 shrink-0" strokeWidth={1.8} />
                          <span>Admin Panel</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border/40 px-4 py-2.5">
            <div className="flex items-center gap-2 text-[10px] text-sidebar-foreground/30 font-medium">
              <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${isError ? 'bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.4)]' : health ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.3)]' : 'bg-sidebar-foreground/20'}`} />
              {isError ? 'Offline' : health ? 'Connected' : 'Checking...'}
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto bg-muted/20">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
