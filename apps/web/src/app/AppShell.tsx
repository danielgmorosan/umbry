import { Outlet } from "react-router-dom";
import { WorkspaceRail } from "./WorkspaceRail";
import { ChannelSidebar } from "./ChannelSidebar";

export function AppShell() {
  return (
    <div className="relative z-10 flex h-screen w-screen overflow-hidden">
      <WorkspaceRail />
      <ChannelSidebar />
      <main className="flex min-w-0 flex-1 flex-col bg-canvas">
        <Outlet />
      </main>
    </div>
  );
}
