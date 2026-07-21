// Umbry AI client. The frontend only ever talks to the gateway (relay) over HTTP -
// the model runs locally (Ollama) and only sees channel data, never DMs.
import { relayUrl } from "./relayBase";
import { relayAuthHeader } from "@/stores/useRelay";

export interface AiCitation {
  channelId: string;
  messageId: string;
  ts: string;
}
export interface AiResult {
  id: string;
  type: "recap" | "notes" | "qa";
  route: "local" | "cloud";
  model: string;
  text: string;
  citations: AiCitation[];
  createdAt: string;
}
export interface AiHealth {
  ok: boolean;
  route: "local" | "cloud";
  model: string;
  ollama: boolean;
  hasModel: boolean;
}

export async function aiHealth(): Promise<AiHealth> {
  return fetch(relayUrl("/openclaw/health")).then((r) => r.json());
}

export interface InstalledModel {
  name: string;
  size: number;
  modified: string | null;
}

/** Models already downloaded on whichever machine the relay runs on. */
export async function listModels(): Promise<{ models: InstalledModel[]; active: string }> {
  const res = await fetch(relayUrl("/openclaw/models"));
  if (!res.ok) throw new Error("Ollama unreachable");
  return res.json();
}

export interface PullProgress {
  status: string;
  /** 0-1, or null while the server hasn't reported sizes yet. */
  percent: number | null;
}

/**
 * Download a model, reporting progress as it streams.
 *
 * The model lands wherever the RELAY runs, not on the user's machine — which is
 * exactly why this exists instead of telling people to run `ollama pull`
 * locally: that would have put the weights on the wrong box entirely.
 */
export async function pullModel(
  model: string,
  onProgress: (p: PullProgress) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(relayUrl("/openclaw/pull"), {
    method: "POST",
    headers: { "content-type": "application/json", ...relayAuthHeader() },
    body: JSON.stringify({ model }),
    signal,
  });
  if (!res.ok || !res.body) {
    const msg = await res.json().catch(() => ({ error: `pull failed (${res.status})` }));
    throw new Error(msg.error ?? "pull failed");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    // NDJSON: a chunk can split mid-line, so keep the tail for the next round.
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const j = JSON.parse(line) as { status?: string; completed?: number; total?: number; error?: string };
        if (j.error) throw new Error(j.error);
        onProgress({
          status: j.status ?? "working",
          percent: j.total ? Math.min(1, (j.completed ?? 0) / j.total) : null,
        });
      } catch (e) {
        if (e instanceof Error && e.message && !/JSON/.test(e.message)) throw e;
      }
    }
  }
}

export async function runAiJob(req: {
  workspaceId: string;
  channelScope: string[];
  type: "recap" | "notes" | "qa";
  prompt?: string;
}): Promise<AiResult> {
  const res = await fetch(relayUrl("/openclaw/jobs"), {
    method: "POST",
    headers: { "content-type": "application/json", ...relayAuthHeader() },
    body: JSON.stringify(req),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "AI request failed");
  return data as AiResult;
}
