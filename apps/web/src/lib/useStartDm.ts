import { useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useContacts } from "@/stores/useContacts";
import { useSession } from "@/stores/useSession";

/**
 * Start (or open) a 1:1 E2E DM with someone by their gossip userId — e.g. from a
 * channel message or the members list. Navigates immediately; if they aren't a
 * contact yet, kicks off the discussion in the background (RealDmView shows pending).
 */
export function useStartDm() {
  const nav = useNavigate();
  const { workspaceId } = useParams();

  return useCallback(
    (userId?: string, name?: string) => {
      if (!userId || !workspaceId) return;
      const myId = useSession.getState().userId;
      if (userId === myId) {
        nav(`/w/${workspaceId}/dm/dm_self`);
        return;
      }
      if (!userId.startsWith("gossip1")) return; // not a real identity (shouldn't happen)
      const known = useContacts.getState().contacts.some((c) => c.userId === userId);
      if (!known) void useContacts.getState().add(userId, name ?? userId.slice(0, 12));
      nav(`/w/${workspaceId}/dm/${encodeURIComponent(userId)}`);
    },
    [nav, workspaceId],
  );
}
