import { LayoutDashboard, Users, GraduationCap, Layers, ClipboardList, Settings, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

const adminItems = [
  { title: 'Boshqaruv Paneli', url: '/', icon: LayoutDashboard },
  { title: 'Talabalar Bazasi', url: '/students', icon: Users },
  { title: "O'qituvchilar", url: '/teachers', icon: GraduationCap },
  { title: 'Guruhlar', url: '/groups', icon: Layers },
  { title: 'Ustozlar Davomati', url: '/teacher-attendance', icon: ClipboardList },
  { title: 'Sozlamalar', url: '/settings', icon: Settings },
];

const teacherItems = [
  { title: 'Guruhlar', url: '/groups', icon: Layers },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const items = user?.role === 'admin' ? adminItems : teacherItems;

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="p-4 border-b border-border">
        {!collapsed && (
          <div>
            <h1 className="text-lg font-bold text-foreground">EDU CRM</h1>
            <p className="text-xs text-muted-foreground">O'quv markazi boshqaruvi</p>
          </div>
        )}
        {collapsed && <h1 className="text-lg font-bold text-primary text-center">E</h1>}
      </div>
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === '/'} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors" activeClassName="bg-accent text-accent-foreground font-medium">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3 border-t border-border">
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full">
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Chiqish</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
