import { useState } from "react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Segmented, Toggle } from "@gossip/ui";

export function NotificationsSettings() {
  const [level, setLevel] = useState<"all" | "mentions" | "none">("mentions");
  const [t, setT] = useState({ dm: true, threads: true, ai: false, sound: true, preview: false });
  const set = (k: keyof typeof t) => (v: boolean) => setT((s) => ({ ...s, [k]: v }));

  return (
    <SettingsPage title="Notifications" desc="Tune what reaches you. Message previews stay on-device.">
      <SettingGroup title="Default">
        <SettingRow
          label="Notify me about"
          desc="Applies to channels unless overridden per channel."
          control={
            <Segmented
              value={level}
              onChange={setLevel}
              size="sm"
              options={[
                { value: "all", label: "All" },
                { value: "mentions", label: "Mentions" },
                { value: "none", label: "Nothing" },
              ]}
            />
          }
        />
      </SettingGroup>

      <SettingGroup title="Channels">
        <SettingRow label="Direct messages" desc="Always notify for E2E DMs." control={<Toggle checked={t.dm} onChange={set("dm")} />} />
        <SettingRow label="Thread replies" desc="Threads you follow." control={<Toggle checked={t.threads} onChange={set("threads")} />} />
        <SettingRow label="OpenClaw mentions" desc="When the AI @-mentions you in a recap." control={<Toggle checked={t.ai} onChange={set("ai")} />} />
      </SettingGroup>

      <SettingGroup title="Delivery">
        <SettingRow label="Play sound" control={<Toggle checked={t.sound} onChange={set("sound")} />} />
        <SettingRow
          label="Show message preview"
          desc="Include message text in OS notifications. Off keeps content fully private."
          control={<Toggle checked={t.preview} onChange={set("preview")} />}
        />
      </SettingGroup>
    </SettingsPage>
  );
}
