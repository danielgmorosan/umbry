import { Outlet } from "react-router-dom";
import { ShieldCheck, Cpu, Network } from "lucide-react";
import { GossipLogo } from "@gossip/ui";

const pillars = [
  { icon: ShieldCheck, title: "Truly private DMs", desc: "Post-quantum end-to-end encryption. No server can read them." },
  { icon: Cpu, title: "Your own AI", desc: "OpenClaw runs on a local model. Sensitive reasoning never leaves your machines." },
  { icon: Network, title: "No vendor to subpoena", desc: "Self-hostable relay and on-chain resilience on the Massa network." },
];

export function OnboardingLayout() {
  return (
    <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="grain relative hidden flex-col justify-between overflow-hidden border-r border-border bg-surface p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 30rem at 20% 0%, var(--accent-glow), transparent 60%), radial-gradient(36rem 28rem at 90% 100%, rgba(111,141,255,0.08), transparent 60%)",
          }}
        />
        <GossipLogo size={36} subtitle="Workspace" />

        <div className="relative max-w-md">
          <h1 className="font-display text-[44px] font-bold leading-[1.05] tracking-tight text-text">
            Slack, but the messages are <span className="text-accent">actually private.</span>
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            A decentralized, privacy-first workspace built on Gossip's end-to-end encrypted stack —
            with a self-hosted AI assistant you control.
          </p>

          <div className="mt-10 space-y-4">
            {pillars.map((p) => (
              <div key={p.title} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[color:var(--accent-faint)] text-accent">
                  <p.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="text-[14px] font-semibold text-text">{p.title}</div>
                  <div className="text-[13px] text-muted">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative font-mono text-[11px] text-faint">
          net.massa.gossip · no PII · passphrase identity
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] animate-rise">
          <div className="mb-8 lg:hidden">
            <GossipLogo size={32} subtitle="Workspace" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
