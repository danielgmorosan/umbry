import { NavLink, Outlet, Link } from "react-router-dom";
import { User, Building2, Plug, Cpu, ShieldCheck, Bell, Palette, ArrowLeft } from "lucide-react";
import { GossipMark } from "@gossip/ui";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Account",
    items: [
      { to: "profile", icon: User, label: "Profile" },
      { to: "security", icon: ShieldCheck, label: "Security" },
      { to: "notifications", icon: Bell, label: "Notifications" },
      { to: "appearance", icon: Palette, label: "Appearance" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { to: "workspace", icon: Building2, label: "Workspace" },
      { to: "integrations", icon: Plug, label: "Integrations" },
      { to: "ai-engine", icon: Cpu, label: "AI Engine" },
    ],
  },
];

export function SettingsLayout() {
  return (
    <div className="relative z-10 flex h-screen w-screen overflow-hidden">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-2.5 border-b border-border px-4 py-4">
          <GossipMark size={32} />
          <div>
            <div className="font-display text-[15px] font-bold text-text">Settings</div>
            <div className="text-[11px] text-faint">Gossip Labs</div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((g) => (
            <div key={g.label} className="mb-5">
              <div className="px-2 pb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-faint">
                {g.label}
              </div>
              <div className="space-y-0.5">
                {g.items.map((it) => (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[14px] transition-colors",
                        isActive
                          ? "bg-[color:var(--accent-faint)] font-medium text-text"
                          : "text-muted hover:bg-surface-raised hover:text-text",
                      )
                    }
                  >
                    <it.icon className="size-4" />
                    {it.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <Link
          to="/w/w_gossip/c/c_design"
          className="m-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-[13.5px] text-muted hover:bg-surface-raised hover:text-text"
        >
          <ArrowLeft className="size-4" /> Back to workspace
        </Link>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-canvas">
        <div className="mx-auto max-w-3xl px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export function SettingsPage({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-rise">
      <h1 className="font-display text-[26px] font-bold tracking-tight text-text">{title}</h1>
      {desc && <p className="mt-1 text-[14px] text-muted">{desc}</p>}
      <div className="mt-8 space-y-6">{children}</div>
    </div>
  );
}
