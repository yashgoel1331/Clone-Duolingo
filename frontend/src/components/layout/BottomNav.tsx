"use client";

import { Dumbbell, House, Shield, Store, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { label: "Learn", href: "/", icon: House, color: "text-gold", available: true },
  {
    label: "Practice",
    href: "/practice",
    icon: Dumbbell,
    color: "text-blue",
    available: false,
  },
  {
    label: "Leagues",
    href: "/leaderboard",
    icon: Shield,
    color: "text-gold",
    available: true,
  },
  { label: "Shop", href: "/shop", icon: Store, color: "text-[#2fd1b4]", available: false },
  {
    label: "Profile",
    href: "/profile",
    icon: UserCircle,
    color: "text-purple",
    available: true,
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t-2 border-border bg-bg px-1 pb-[max(5px,env(safe-area-inset-bottom))] pt-1 lg:hidden"
    >
      {items.map(({ label, href, icon: Icon, color, available }) => {
        const isActive = pathname === href;
        return available ? (
          <Link
            key={label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className="flex min-h-15 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-black uppercase tracking-wide text-text-muted"
          >
            <span
              className={
                isActive
                  ? "rounded-xl border-2 border-blue bg-nav-active px-3 py-1"
                  : "border-2 border-transparent px-3 py-1"
              }
            >
              <Icon aria-hidden size={23} strokeWidth={3} className={color} />
            </span>
            <span className={isActive ? "text-blue" : undefined}>{label}</span>
          </Link>
        ) : (
          <div
            key={label}
            aria-label={`${label} coming soon`}
            className="flex min-h-15 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-black uppercase tracking-wide text-text-muted/90"
          >
            <span className="rounded-xl border-2 border-transparent px-3 py-1">
              <Icon aria-hidden size={23} strokeWidth={3} className={`${color} opacity-65`} />
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}
