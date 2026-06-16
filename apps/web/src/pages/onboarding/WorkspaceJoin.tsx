import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Ticket } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";

export function WorkspaceJoin() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  return (
    <div>
      <Link to="/welcome" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <h2 className="font-display text-[28px] font-bold tracking-tight text-text">Join a workspace</h2>
      <p className="mt-1.5 text-[14px] text-muted">
        Paste the invite link or code you were given. You'll need an identity to accept.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          nav("/identity/create");
        }}
        className="mt-7 space-y-5"
      >
        <Field label="Invite link or code" hint="Looks like gossip.work/i/AB12-CD34 or a raw code.">
          <Input
            autoFocus
            mono
            icon={<Ticket />}
            placeholder="AB12-CD34-EF56"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </Field>
        <Button block size="lg" type="submit" disabled={!code.trim()}>
          Continue <ArrowRight className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Don't have an invite?{" "}
        <Link to="/identity/create" className="font-medium text-accent hover:underline">
          Create your own workspace
        </Link>
      </p>
    </div>
  );
}
