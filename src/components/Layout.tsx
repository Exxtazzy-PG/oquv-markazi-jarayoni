import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { User } from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b border-border bg-card px-4">
            <SidebarTrigger className="text-muted-foreground" />
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">{user?.name}</span>
              <span className="text-xs text-muted-foreground">{user?.role === 'admin' ? 'Administrator' : "O'qituvchi"}</span>
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
          <footer className="text-center py-4 text-xs text-muted-foreground border-t border-border">
            © 2024 IT SAF CENTER. Barcha huquqlar himoyalangan.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
