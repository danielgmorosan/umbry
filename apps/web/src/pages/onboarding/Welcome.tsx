import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, KeyRound } from "lucide-react";
import { Button } from "@gossip/ui";

export function Welcome() {
  return (
    <div>
      <h2 className="font-display text-[28px] font-bold tracking-tight text-text">Get started</h2>
      <p className="mt-1.5 text-[14px] text-muted">
        Create a private workspace or join one you've been invited to. No email, no phone number.
      </p>

      <div className="mt-8 space-y-3">
        <Link to="/identity/create?next=create" className="block">
          <div className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-raised p-4 transition-all hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--accent-faint)]">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-ink">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-text">Create a workspace</div>
              <div className="text-[13px] text-muted">Generate an identity and start fresh.</div>
            </div>
            <ArrowRight className="size-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
          </div>
        </Link>

        <Link to="/identity/create?next=join" className="block">
          <div className="group flex items-center gap-4 rounded-2xl border border-border bg-surface-raised p-4 transition-all hover:border-border-strong">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate text-text">
              <KeyRound className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-text">Join with an invite</div>
              <div className="text-[13px] text-muted">Use an invite link or code.</div>
            </div>
            <ArrowRight className="size-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-5 text-[13px]">
        <span className="text-muted">Already have an identity?</span>
        <Link to="/identity/unlock">
          <Button variant="ghost" size="sm">
            Unlock <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
