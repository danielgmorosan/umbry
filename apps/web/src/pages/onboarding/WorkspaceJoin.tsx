import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Ticket, Loader2 } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";
import { useSession } from "@/stores/useSession";
import { useRelay } from "@/stores/useRelay";

export function WorkspaceJoin() {
  const nav = useNavigate();
  const status = useSession((s) => s.status);
  const joinWorkspace = useRelay((s) => s.joinWorkspace);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "open") {
      // need an identity first; create one, then come back to join
      nav("/identity/create?next=join");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await joinWorkspace(code.trim());
    setBusy(false);
    if (res.ok) nav(`/w/${res.workspace.id}`);
    else setError(res.error);
  };

  return (
    <div>
      <Link to="/welcome" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <h2 className="font-display text-[28px] font-bold tracking-tight text-text">Join a workspace</h2>
      <p className="mt-1.5 text-[14px] text-muted">Enter the invite code a workspace member shared with you.</p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <Field label="Invite code" hint="A 6-character code like AB12CD.">
          <Input
            autoFocus
            mono
            icon={<Ticket />}
            placeholder="AB12CD"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
        </Field>
        {error && <p className="text-[13px] text-danger">{error}</p>}
        <Button block size="lg" type="submit" disabled={!code.trim() || busy}>
          {busy ? <><Loader2 className="size-4 animate-spin" /> Joining…</> : <>Join <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Don't have a code?{" "}
        <Link to="/workspace/create" className="font-medium text-accent hover:underline">
          Create your own workspace
        </Link>
      </p>
    </div>
  );
}
