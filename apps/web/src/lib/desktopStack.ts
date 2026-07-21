/**
 * Bridge to the desktop shell's local self-host stack (relay + LiveKit + Ollama).
 *
 * Desktop-only: starting containers needs a real process, so in the browser
 * build every call resolves to "unsupported" and the UI falls back to showing
 * the manual `docker compose up` instructions.
 */

export interface StackService {
  name: string;
  state: string;
  running: boolean;
}

export interface StackStatus {
  dockerAvailable: boolean;
  daemonRunning: boolean;
  services: StackService[];
  running: boolean;
  relayUrl: string;
  error?: string;
}

interface StackBridge {
  status: () => Promise<StackStatus>;
  up: () => Promise<StackStatus>;
  down: () => Promise<StackStatus>;
}

function bridge(): StackBridge | null {
  const d = (window as unknown as { umbryDesktop?: { stack?: StackBridge } }).umbryDesktop;
  return d?.stack ?? null;
}

/** True when this build can actually drive the stack (desktop shell, 0.4.2+). */
export function canControlStack(): boolean {
  return bridge() != null;
}

export async function stackStatus(): Promise<StackStatus | null> {
  return (await bridge()?.status()) ?? null;
}

/** Bring the stack up. Slow on first run (image pulls) — poll status after. */
export async function stackUp(): Promise<StackStatus | null> {
  return (await bridge()?.up()) ?? null;
}

export async function stackDown(): Promise<StackStatus | null> {
  return (await bridge()?.down()) ?? null;
}

/** Human label for a compose service. */
export const SERVICE_LABELS: Record<string, string> = {
  relay: "Relay — channels, files, calls",
  livekit: "LiveKit — voice & video",
  ollama: "Ollama — local AI model",
};
