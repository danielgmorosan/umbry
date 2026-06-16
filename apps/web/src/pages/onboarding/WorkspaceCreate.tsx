import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Server, ChevronDown } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";
import { cn } from "@/lib/utils";

export function WorkspaceCreate() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [advanced, setAdvanced] = useState(false);

  return (
    <div>
      <Link to="/identity/create" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint">Step 2 of 2 · Workspace</div>
      <h2 className="mt-1 font-display text-[28px] font-bold tracking-tight text-text">Name your workspace</h2>
      <p className="mt-1.5 text-[14px] text-muted">You can change this anytime in settings.</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/w/w_gossip/c/c_design");
        }}
        className="mt-7 space-y-5"
      >
        <Field label="Workspace name">
          <Input
            autoFocus
            placeholder="e.g. Gossip Labs"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <div>
          <button
            type="button"
            onClick={() => setAdvanced((v) => !v)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-text"
          >
            <ChevronDown className={cn("size-4 transition-transform", !advanced && "-rotate-90")} />
            Advanced · message relay
          </button>
          {advanced && (
            <div className="mt-3 rounded-xl border border-border bg-surface-inset p-4">
              <Field
                label="Relay base URL"
                hint="Where channel transport is routed. Self-host this for full data control — E2E DMs are unaffected by where the relay lives."
              >
                <Input mono icon={<Server />} defaultValue="https://api.usegossip.com" />
              </Field>
            </div>
          )}
        </div>

        <Button block size="lg" type="submit" disabled={!name.trim()}>
          Create workspace <ArrowRight className="size-4" />
        </Button>
      </form>
    </div>
  );
}
