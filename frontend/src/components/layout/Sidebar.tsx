"use client";

import {
  Dumbbell,
  Gift,
  House,
  Settings2,
  Shield,
  Store,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

const navigation = [
  { label: "Learn", href: "/", icon: House, color: "text-gold", available: true },
  {
    label: "Practice",
    href: "/practice",
    icon: Dumbbell,
    color: "text-blue",
    available: false,
  },
  {
    label: "Leaderboards",
    href: "/leaderboard",
    icon: Shield,
    color: "text-gold",
    available: true,
  },
  { label: "Quests", href: "/quests", icon: Gift, color: "text-gold", available: false },
  { label: "Shop", href: "/shop", icon: Store, color: "text-[#2fd1b4]", available: false },
  {
    label: "Profile",
    href: "/profile",
    icon: UserCircle,
    color: "text-purple",
    available: true,
  },
  { label: "Settings", href: "/settings", icon: Settings2, color: "text-blue", available: true },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[176px] shrink-0 flex-col border-r-2 border-border/90 bg-bg px-3 py-5 lg:flex xl:w-[186px]">
      <Link href="/" className="mb-6 inline-flex px-2" aria-label="Duolingo learn home">
        <Image
          src="/duolingo-logo.png"
          alt="Duolingo logo"
          width={192}
          height={85}
          priority
          className="h-auto w-[104px] xl:w-[112px]"
        />
      </Link>

      <nav aria-label="Primary navigation" className="flex flex-col gap-1.5">
        {navigation.map(({ label, href, icon: Icon, color, available }) => {
          const isActive = pathname === href;
          return available ? (
            <Link
              key={label}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-2xl border-2 px-3 text-[12px] font-extrabold uppercase tracking-[0.9px] transition-colors xl:text-[13px]",
                isActive
                  ? "border-blue bg-nav-active text-blue"
                  : "border-transparent text-[#d6e1e6] hover:bg-bg-secondary",
              )}
            >
              <Icon aria-hidden size={22} strokeWidth={3} className={color} />
              {label}
            </Link>
          ) : (
            <div
              key={label}
              aria-label={`${label} coming soon`}
              className="flex min-h-12 items-center gap-3 rounded-2xl border-2 border-transparent px-3 text-[12px] font-extrabold uppercase tracking-[0.9px] text-[#8ea0a8] xl:text-[13px]"
            >
              <Icon aria-hidden size={22} strokeWidth={3} className={color} />
              <span className="flex-1">{label}</span>
              <span className="text-[9px] tracking-[0.9px] text-text-muted">Soon</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border-2 border-border bg-card px-3 py-2.5">
        <p className="text-xs font-black uppercase tracking-[1px] text-text-muted">Step 6 note</p>
        <p className="mt-1 text-[12px] font-extrabold leading-4 text-[#c8d8de]">
          Practice, leagues, and shop stay read-only until backend routes are connected.
        </p>
      </div>
    </aside>
  );
}
