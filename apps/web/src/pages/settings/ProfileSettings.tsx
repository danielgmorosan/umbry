import { useState } from "react";
import { Copy, Check, Smartphone, Laptop, Monitor } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Avatar, Badge, Button, Field, Input } from "@gossip/ui";
import { me } from "@/data/mock";

const devices = [
  { icon: Laptop, name: "MacBook Pro", meta: "This device · last active now", current: true },
  { icon: Smartphone, name: "iPhone 16", meta: "Capacitor · 2 hours ago" },
  { icon: Monitor, name: "Studio Desktop", meta: "Tauri · yesterday" },
];

export function ProfileSettings() {
  const [copied, setCopied] = useState(false);
  return (
    <SettingsPage title="Profile" desc="How you appear across the workspace. Your identity carries no PII.">
      <SettingGroup title="Identity">
        <SettingRow
          label={
            <div className="flex items-center gap-3">
              <Avatar name="Daniel M" id={me.id} size={48} presence="online" />
              <div>
                <div className="text-[15px] font-semibold text-text">Daniel M</div>
                <div className="font-mono text-[11px] text-faint">{me.handle}</div>
              </div>
            </div>
          }
          control={
            <Button variant="secondary" size="sm">
              Change avatar
            </Button>
          }
        />
        <SettingRow
          label="Pseudonymous handle"
          desc="Derived from your passphrase. This is your canonical, server-blind identity."
          control={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                navigator.clipboard?.writeText(me.handle);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-4 text-accent" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          }
        />
      </SettingGroup>

      <SettingGroup title="Display">
        <div className="space-y-4 px-4 py-4">
          <Field label="Display name" hint="Shown to other members. Separate from your handle.">
            <Input defaultValue="Daniel M" />
          </Field>
          <Field label="Title">
            <Input defaultValue="Founder" placeholder="What you do" />
          </Field>
          <Field label="Status">
            <Input defaultValue="🛡 Building privacy-first software" />
          </Field>
        </div>
      </SettingGroup>

      <SettingGroup title="Devices">
        {devices.map((d) => (
          <SettingRow
            key={d.name}
            label={
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-surface-inset text-muted">
                  <d.icon className="size-[18px]" />
                </span>
                <div>
                  <div className="flex items-center gap-2 text-[14px] font-medium text-text">
                    {d.name}
                    {d.current && <Badge tone="accent">current</Badge>}
                  </div>
                  <div className="text-[12px] text-muted">{d.meta}</div>
                </div>
              </div>
            }
            control={!d.current ? <Button variant="danger" size="sm">Revoke</Button> : undefined}
          />
        ))}
      </SettingGroup>
    </SettingsPage>
  );
}
