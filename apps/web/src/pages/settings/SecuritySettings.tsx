import { useState } from "react";
import { Fingerprint, KeyRound, ShieldCheck, Lock, RotateCw } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Badge, Button, Toggle } from "@gossip/ui";

export function SecuritySettings() {
  const [bio, setBio] = useState(true);
  const [autolock, setAutolock] = useState(true);
  return (
    <SettingsPage title="Security" desc="Your keys, your sessions, your device locks.">
      <SettingGroup title="Encryption">
        <SettingRow
          label={
            <span className="flex items-center gap-2">
              Post-quantum E2E <Badge tone="accent" dot>active</Badge>
            </span>
          }
          desc="DMs use post-quantum key exchange with ephemeral per-message keys (forward secrecy). This is sealed — not configurable."
          control={<ShieldCheck className="size-6 text-accent" />}
        />
        <SettingRow
          label="Key fingerprint"
          desc="Compare out-of-band with a contact to verify there's no machine-in-the-middle."
        >
          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-surface-inset px-3 py-2 font-mono text-[12px] text-text">
            <Lock className="size-3.5 text-accent" /> 7F2A · 9C41 · B0D8 · E532 · 14AC · 6B90
          </div>
        </SettingRow>
      </SettingGroup>

      <SettingGroup title="Access">
        <SettingRow
          label="Passphrase"
          desc="Rotating issues a new identity-protecting passphrase. Your handle stays the same."
          control={
            <Button variant="secondary" size="sm">
              <RotateCw className="size-4" /> Rotate
            </Button>
          }
        />
        <SettingRow
          label={
            <span className="flex items-center gap-2">
              <Fingerprint className="size-4 text-accent" /> Biometric unlock
            </span>
          }
          desc="Use Touch ID / Face ID to unlock on this device (Capacitor / Tauri)."
          control={<Toggle checked={bio} onChange={setBio} />}
        />
        <SettingRow
          label={
            <span className="flex items-center gap-2">
              <Lock className="size-4 text-accent" /> Auto-lock when idle
            </span>
          }
          desc="Require unlock after 15 minutes of inactivity."
          control={<Toggle checked={autolock} onChange={setAutolock} />}
        />
      </SettingGroup>

      <SettingGroup title="Sessions">
        <SettingRow
          label="Sign out everywhere"
          desc="Revoke every active session and device. You'll re-unlock with your passphrase."
          control={
            <Button variant="danger" size="sm">
              <KeyRound className="size-4" /> Revoke all
            </Button>
          }
        />
      </SettingGroup>
    </SettingsPage>
  );
}
