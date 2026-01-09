import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { BrainCircuit, Layers } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Generator", icon: BrainCircuit },
    // { href: "/history", label: "History", icon: Layers }, // Future feature
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                <BrainCircuit className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                MediFlash<span className="text-primary">.ai</span>
              </span>
            </Link>

            <div className="hidden md:flex gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">v1.0.0 Beta</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
