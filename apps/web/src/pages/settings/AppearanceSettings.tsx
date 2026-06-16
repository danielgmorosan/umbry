import { Moon, Sun, Check } from "lucide-react";
import { SettingsPage } from "./SettingsLayout";
import { SettingGroup, SettingRow } from "./parts";
import { Toggle } from "@gossip/ui";
import { useTheme } from "@/stores/useTheme";
import { cn } from "@/lib/utils";

export function AppearanceSettings() {
  const { theme, set } = useTheme();

  return (
    <SettingsPage title="Appearance" desc="Make the workspace yours. Dark is the Gossip default.">
      <SettingGroup title="Theme">
        <div className="grid grid-cols-2 gap-3 p-4">
          {(["dark", "light"] as const).map((t) => {
            const active = theme === t;
            const dark = t === "dark";
            return (
              <button
                key={t}
                onClick={() => set(t)}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 p-1 text-left transition-colors",
                  active ? "border-[color:var(--accent)]" : "border-border hover:border-border-strong",
                )}
              >
                <div
                  className="flex h-28 flex-col gap-2 rounded-lg p-3"
                  style={{ background: dark ? "#0F1115" : "#F5F7F6" }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="size-3 rounded-full" style={{ background: dark ? "#7FE9C3" : "#16B886" }} />
                    <span className="h-2 w-16 rounded-full" style={{ background: dark ? "#2B333B" : "#E2E7E5" }} />
                  </div>
                  <span className="h-2 w-24 rounded-full" style={{ background: dark ? "#1C2127" : "#E2E7E5" }} />
                  <span className="mt-auto h-6 w-20 self-end rounded-lg" style={{ background: dark ? "#7FE9C3" : "#16B886" }} />
                </div>
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-text capitalize">
                    {dark ? <Moon className="size-4" /> : <Sun className="size-4" />} {t}
                  </span>
                  {active && (
                    <span className="grid size-5 place-items-center rounded-full bg-accent text-accent-ink">
                      <Check className="size-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </SettingGroup>

      <SettingGroup title="Display">
        <SettingRow label="Compact message density" desc="Tighter spacing in channel feeds." control={<Toggle checked={false} onChange={() => {}} />} />
        <SettingRow label="Show avatars in channel list" control={<Toggle checked onChange={() => {}} />} />
        <SettingRow label="Reduce motion" desc="Minimize animations and transitions." control={<Toggle checked={false} onChange={() => {}} />} />
      </SettingGroup>
    </SettingsPage>
  );
}
