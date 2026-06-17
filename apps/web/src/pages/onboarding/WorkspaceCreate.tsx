import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button, Field, Input } from "@gossip/ui";
import { useSession } from "@/stores/useSession";
import { useRelay } from "@/stores/useRelay";

export function WorkspaceCreate() {
  const nav = useNavigate();
  const status = useSession((s) => s.status);
  const createWorkspace = useRelay((s) => s.createWorkspace);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "open") {
      nav("/identity/unlock");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await createWorkspace(name.trim());
    setBusy(false);
    if (res.ok) nav(`/w/${res.workspace.id}`);
    else setError(res.error);
  };

  return (
    <div>
      <Link to="/welcome" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-text">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <h2 className="font-display text-[28px] font-bold tracking-tight text-text">Name your workspace</h2>
      <p className="mt-1.5 text-[14px] text-muted">A workspace holds your channels and members. You can create more later.</p>

      <form onSubmit={submit} className="mt-7 space-y-5">
        <Field label="Workspace name">
          <Input autoFocus placeholder="e.g. Gossip Labs" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>

        {error && <p className="text-[13px] text-danger">{error}</p>}

        <Button block size="lg" type="submit" disabled={!name.trim() || busy}>
          {busy ? <><Loader2 className="size-4 animate-spin" /> Creating…</> : <>Create workspace <ArrowRight className="size-4" /></>}
        </Button>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted">
        Have an invite code?{" "}
        <Link to="/workspace/join" className="font-medium text-accent hover:underline">
          Join a workspace
        </Link>
      </p>
    </div>
  );
}
