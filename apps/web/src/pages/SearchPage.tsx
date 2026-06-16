import { useState } from "react";
import { Search, Hash, ShieldCheck } from "lucide-react";
import { PaneHeader } from "@/components/chat/PaneHeader";
import { Avatar, Badge, Input } from "@gossip/ui";
import { memberById } from "@/data/mock";

const results = [
  { id: "r1", channel: "design", author: "u_mara", body: "Locked the dark theme tokens — near-black canvas with the mint accent reads really premium.", ts: "09:02" },
  { id: "r2", channel: "engineering", author: "u_kev", body: "Relay seam is in. services/relay is optional — defaults to api.usegossip.com.", ts: "11:20" },
  { id: "r3", channel: "general", author: "u_me", body: "The AI assistant only reads channels it's added to. It never sees DMs.", ts: "08:41" },
];

export function SearchPage() {
  const [q, setQ] = useState("relay");
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PaneHeader title="Search" subtitle="Across channels you can access" />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Input
            icon={<Search />}
            placeholder="Search messages, files, and people…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-12 text-[15px]"
          />
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-[color:var(--accent-faint)] px-3 py-2 text-[12.5px] text-muted">
            <ShieldCheck className="size-4 shrink-0 text-accent" />
            Search never includes your end-to-end encrypted DMs — only channel content you already
            have access to.
          </div>

          <div className="mt-5 space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-faint">
              {results.length} results
            </div>
            {results.map((r) => {
              const m = memberById(r.author);
              return (
                <div key={r.id} className="rounded-xl border border-border bg-surface p-4 hover:border-border-strong">
                  <div className="mb-1.5 flex items-center gap-2 text-[12.5px] text-muted">
                    <Badge tone="neutral">
                      <Hash className="size-3" />
                      {r.channel}
                    </Badge>
                    <span className="text-faint">{r.ts}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Avatar name={m.displayName} id={m.id} size={28} />
                    <div>
                      <span className="font-medium text-text">{m.displayName}</span>
                      <p className="text-[14px] text-text/80">{r.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
