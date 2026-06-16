import { Server, ShieldAlert, Users, Crown } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Avatar, Badge, Button, Field, Input, Toggle } from "@gossip/ui";
import { members } from "@/data/mock";

export function WorkspaceSettings() {
  return (
    <SettingsPage title="Workspace" desc="Manage your workspace identity, transport, and membership.">
      <SettingGroup title="General">
        <div className="space-y-4 px-4 py-4">
          <Field label="Workspace name">
            <Input defaultValue="Gossip Labs" />
          </Field>
          <Field label="URL slug" hint="Used in invite links.">
            <Input mono defaultValue="gossip-labs" />
          </Field>
        </div>
      </SettingGroup>

      <SettingGroup title="Message transport">
        <SettingRow
          label="Relay base URL"
          desc="Channel transport routes through here. Point it at a self-hosted relay for full data control — E2E DMs are unaffected."
        >
          <div className="mt-3 max-w-md">
            <Input mono icon={<Server />} defaultValue="https://api.usegossip.com" />
          </div>
        </SettingRow>
        <SettingRow
          label="Self-hosted relay"
          desc="Run services/relay so the org owns message transport and the channel store."
          control={<Toggle checked={false} onChange={() => {}} />}
        />
      </SettingGroup>

      <SettingGroup title="Channel privacy">
        <div className="flex items-start gap-3 px-4 py-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning" />
          <p className="text-[13px] leading-relaxed text-muted">
            <span className="font-medium text-text">Channels are workspace-confidential, not E2E in v1.</span>{" "}
            Transport is TLS and contents persist to the relay store. DMs remain end-to-end
            encrypted. A group-E2E upgrade (fan-out → MLS) is on the roadmap.
          </p>
        </div>
      </SettingGroup>

      <SettingGroup title={`Members · ${members.length}`}>
        {members.slice(0, 4).map((m) => (
          <SettingRow
            key={m.id}
            label={
              <div className="flex items-center gap-3">
                <Avatar name={m.displayName} id={m.id} size={32} presence={m.presence} />
                <div>
                  <div className="flex items-center gap-1.5 text-[14px] font-medium text-text">
                    {m.displayName}
                    {m.role === "owner" && <Crown className="size-3.5 text-accent" />}
                  </div>
                  <div className="font-mono text-[11px] text-faint">{m.handle.slice(0, 18)}…</div>
                </div>
              </div>
            }
            control={<Badge tone="neutral" className="capitalize">{m.role}</Badge>}
          />
        ))}
        <div className="px-4 py-3">
          <Button variant="secondary" size="sm">
            <Users className="size-4" /> Manage all members
          </Button>
        </div>
      </SettingGroup>
    </SettingsPage>
  );
}
