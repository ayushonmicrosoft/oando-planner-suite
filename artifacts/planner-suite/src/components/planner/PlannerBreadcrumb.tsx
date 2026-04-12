"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PlannerBreadcrumbProps {
  items: BreadcrumbItem[];
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PlannerBreadcrumb({ items, icon, actions }: PlannerBreadcrumbProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b bg-card/80 backdrop-blur-sm shrink-0">
      <nav className="flex items-center gap-1 text-sm min-w-0">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-xs font-medium">Home</span>
        </button>
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-1 min-w-0">
            <ChevronRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
            {item.href ? (
              <button
                onClick={() => router.push(item.href!)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors truncate"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                {icon && i === items.length - 1 && icon}
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
      {actions && (
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
}
