import { useNavigate, Link } from "react-router-dom";
import { ArrowRight, Fingerprint, KeyRound } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";
import { GossipMark } from "@gossip/ui";

export function IdentityUnlock() {
  const nav = useNavigate();
  return (
    <div>
      <div className="mb-6 flex flex-col items-center text-center">
        <GossipMark size={56} className="glow-accent" />
        <h2 className="mt-4 font-display text-[26px] font-bold tracking-tight text-text">Welcome back</h2>
        <p className="mt-1 font-mono text-[12px] text-faint">gossip34ngsdf9n…l8dhuj</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/w/w_gossip/c/c_design");
        }}
        className="space-y-4"
      >
        <Field label="Passphrase">
          <Input type="password" placeholder="Enter your recovery passphrase" icon={<KeyRound />} autoFocus />
        </Field>
        <Button block size="lg" type="submit">
          Unlock <ArrowRight className="size-4" />
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[12px] text-faint">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={() => nav("/w/w_gossip/c/c_design")}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface-raised py-3 text-[14px] font-medium text-text transition-colors hover:border-[color:var(--accent)]/40"
      >
        <Fingerprint className="size-5 text-accent" /> Unlock with biometrics
      </button>

      <p className="mt-6 text-center text-[13px] text-muted">
        Use a different identity?{" "}
        <Link to="/welcome" className="font-medium text-accent hover:underline">
          Start over
        </Link>
      </p>
    </div>
  );
}
