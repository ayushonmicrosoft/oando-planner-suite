"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileSignature, Grid3X3, Box, Library, FolderOpen, Activity, Pencil, LayoutGrid, Shapes, ImagePlus, LayoutTemplate, LogOut, Settings, ChevronDown, Map, DraftingCompass, Layers3 } from 'lucide-react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarFooter } from '@/components/ui/sidebar';
import { useHealthCheck, getHealthCheckQueryKey } from '@workspace/api-client-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = usePathname();
  const { data: health, isError } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), refetchInterval: 30000 } });
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

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

  const dataNavItems = [
    { href: '/templates', icon: LayoutTemplate, label: 'Templates' },
    { href: '/catalog', icon: Library, label: 'Furniture Catalog' },
    { href: '/plans', icon: FolderOpen, label: 'Saved Plans' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location === href || location.startsWith(href + '/') || location.startsWith(href + '?');
  };

  const displayName = user?.fullName || user?.firstName || user?.emailAddresses?.[0]?.emailAddress || 'User';
  const initials = (user?.firstName?.[0] || '') + (user?.lastName?.[0] || '') || displayName[0]?.toUpperCase() || 'U';

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-background w-full">
        <Sidebar>
          <SidebarHeader className="border-b px-4 py-3 border-border">
            {isLoaded && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 w-full text-left hover:bg-muted/50 rounded-md p-1 -m-1 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.imageUrl} alt={displayName} />
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.emailAddresses?.[0]?.emailAddress}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem disabled>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ redirectUrl: window.location.origin + "/" })}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
                <img src={"/logo-v2-white.webp"} alt="One&Only" className="h-6 w-auto" />
                <span className="text-sidebar-foreground">One&Only</span>
              </div>
            )}
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-3">Drawing Tools</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {toolNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider font-semibold text-muted-foreground px-3">Data</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {dataNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive(item.href)}>
                        <Link href={item.href} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="w-4 h-4" />
              API Status:
              {isError ? (
                <span className="text-destructive font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive"></span> Offline</span>
              ) : health ? (
                <span className="text-green-500 font-medium flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> {health.status}</span>
              ) : (
                <span>Checking...</span>
              )}
            </div>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-auto bg-muted/30">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
