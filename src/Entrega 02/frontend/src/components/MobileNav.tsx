import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Brain, Trophy, History, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Detecção IA", path: "/deteccao", icon: Brain },
  { title: "Ranking", path: "/ranking", icon: Trophy },
  { title: "Histórico", path: "/historico", icon: History },
];

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 h-14 bg-primary flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">L</span>
          </div>
          <span className="text-primary-foreground font-bold text-sm">LiderAI</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-primary-foreground">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 bg-primary z-40 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium",
                    active ? "bg-primary-foreground text-primary" : "text-primary-foreground/80"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto pt-8 border-t border-primary-foreground/20 mt-8">
            <div className="flex items-center gap-3 px-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-primary-foreground text-xs font-bold">L</span>
              </div>
              <div>
                <p className="text-primary-foreground text-sm font-medium">lucasabk23</p>
                <p className="text-primary-foreground/60 text-xs">Grupo 1</p>
              </div>
            </div>
            <Link to="/" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 text-primary-foreground/70 text-sm">
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;
