/**
 * Gossip Workspace — relay (v1).
 *
 * Source of truth for workspaces, channels, membership, and channel messages
 * (the "workspace-confidential", non-E2E group transport from the spec — TLS in transit,
 * persisted to disk here, NOT end-to-end encrypted; that's the deliberate v1 tradeoff
 * until group-E2E (fan-out → MLS) lands). DMs stay E2E via the gossip-sdk, untouched.
 *
 * Run: node services/relay/server.mjs   (PORT env, default 8788)
 */
import { WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const PORT = Number(process.env.PORT ?? 8788);
const HISTORY_CAP = 500;
const DATA_FILE = join(dirname(fileURLToPath(import.meta.url)), ".data.json");

/** Persistent state. */
let db = { workspaces: {}, messages: {} }; // workspaces[id], messages[`${wsId}/${chId}`] = []
if (existsSync(DATA_FILE)) {
  try {
    db = JSON.parse(readFileSync(DATA_FILE, "utf8"));
    db.workspaces ??= {};
    db.messages ??= {};
  } catch {
    /* start fresh */
  }
}
let saveTimer = null;
function save() {
  if (saveTimer) return;
  saveTimer = setTimeout(() => {
    saveTimer = null;
    try {
      writeFileSync(DATA_FILE, JSON.stringify(db));
    } catch (e) {
      console.error("[relay] save failed", e);
    }
  }, 400);
}

const clients = new Set(); // { ws, userId, name, wsSubs:Set, chSubs:Set }

const shortId = (p) => p + randomUUID().replace(/-/g, "").slice(0, 8);
const genCode = () =>
  Array.from({ length: 6 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("");

function serializeWorkspace(ws) {
  return {
    id: ws.id,
    name: ws.name,
    code: ws.code,
    createdBy: ws.createdBy,
    channels: Object.values(ws.channels),
    members: Object.values(ws.members),
  };
}

function findWorkspace(key) {
  if (!key) return null;
  if (db.workspaces[key]) return db.workspaces[key];
  const up = String(key).toUpperCase();
  return Object.values(db.workspaces).find((w) => w.code === up) ?? null;
}

const send = (ws, obj) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(obj));
function broadcastWorkspace(wsId, obj) {
  const data = JSON.stringify(obj);
  for (const c of clients) if (c.wsSubs.has(wsId) && c.ws.readyState === c.ws.OPEN) c.ws.send(data);
}
function broadcastChannel(chKey, obj) {
  const data = JSON.stringify(obj);
  for (const c of clients) if (c.chSubs.has(chKey) && c.ws.readyState === c.ws.OPEN) c.ws.send(data);
}
function presence(wsId, chId) {
  const chKey = `${wsId}/${chId}`;
  const ids = new Set();
  for (const c of clients) if (c.chSubs.has(chKey) && c.userId) ids.add(c.userId);
  broadcastChannel(chKey, { type: "presence", workspaceId: wsId, channelId: chId, count: ids.size });
}

function addChannel(ws, { name, type, topic, createdBy }) {
  const id = shortId("ch_");
  ws.channels[id] = {
    id,
    name: String(name).replace(/[^a-z0-9-_ ]/gi, "").trim().slice(0, 40) || "channel",
    type: type === "private" ? "private" : "public",
    topic: String(topic ?? "").slice(0, 200),
    createdBy,
    createdAt: Date.now(),
  };
  return ws.channels[id];
}

const wss = new WebSocketServer({ port: PORT });
console.log(`[relay] listening on ws://localhost:${PORT}  (${Object.keys(db.workspaces).length} workspaces loaded)`);

wss.on("connection", (ws) => {
  const client = { ws, userId: null, name: "Someone", wsSubs: new Set(), chSubs: new Set() };
  clients.add(client);

  ws.on("message", (raw) => {
    let m;
    try {
      m = JSON.parse(raw.toString());
    } catch {
      return;
    }
    switch (m.type) {
      case "hello":
        client.userId = String(m.userId ?? "").slice(0, 80) || `anon-${randomUUID().slice(0, 6)}`;
        client.name = String(m.name ?? "Someone").slice(0, 40);
        break;

      case "createWorkspace": {
        const id = shortId("ws_");
        const workspace = {
          id,
          name: String(m.name ?? "Workspace").slice(0, 60) || "Workspace",
          code: genCode(),
          createdBy: client.userId,
          createdAt: Date.now(),
          channels: {},
          members: {},
        };
        addChannel(workspace, { name: "general", type: "public", topic: "Company-wide chatter.", createdBy: client.userId });
        workspace.members[client.userId] = { userId: client.userId, name: client.name, role: "owner", joinedAt: Date.now() };
        db.workspaces[id] = workspace;
        client.wsSubs.add(id);
        save();
        send(ws, { type: "workspaceCreated", ref: m.ref, workspace: serializeWorkspace(workspace) });
        break;
      }

      case "joinWorkspace": {
        const workspace = findWorkspace(m.key);
        if (!workspace) {
          send(ws, { type: "error", ref: m.ref, message: "Workspace not found. Check the code." });
          break;
        }
        workspace.members[client.userId] = workspace.members[client.userId] ?? {
          userId: client.userId,
          name: client.name,
          role: "member",
          joinedAt: Date.now(),
        };
        client.wsSubs.add(workspace.id);
        save();
        send(ws, { type: "workspace", ref: m.ref, workspace: serializeWorkspace(workspace) });
        broadcastWorkspace(workspace.id, { type: "memberJoined", workspaceId: workspace.id, member: workspace.members[client.userId] });
        break;
      }

      case "openWorkspace": {
        const workspace = db.workspaces[m.workspaceId];
        if (!workspace) {
          send(ws, { type: "error", ref: m.ref, message: "Workspace not found." });
          break;
        }
        client.wsSubs.add(workspace.id);
        // ensure membership (e.g. creator returning) — keep if present
        if (client.userId && !workspace.members[client.userId]) {
          workspace.members[client.userId] = { userId: client.userId, name: client.name, role: "member", joinedAt: Date.now() };
          save();
        }
        send(ws, { type: "workspace", ref: m.ref, workspace: serializeWorkspace(workspace) });
        break;
      }

      case "createChannel": {
        const workspace = db.workspaces[m.workspaceId];
        if (!workspace) {
          send(ws, { type: "error", ref: m.ref, message: "Workspace not found." });
          break;
        }
        const channel = addChannel(workspace, { name: m.name, type: m.channelType, topic: m.topic, createdBy: client.userId });
        save();
        broadcastWorkspace(workspace.id, { type: "channelCreated", workspaceId: workspace.id, channel });
        send(ws, { type: "channelCreated", ref: m.ref, workspaceId: workspace.id, channel });
        break;
      }

      case "joinChannel": {
        const chKey = `${m.workspaceId}/${m.channelId}`;
        client.chSubs.add(chKey);
        send(ws, { type: "history", workspaceId: m.workspaceId, channelId: m.channelId, messages: db.messages[chKey] ?? [] });
        presence(m.workspaceId, m.channelId);
        break;
      }

      case "post": {
        const chKey = `${m.workspaceId}/${m.channelId}`;
        const body = String(m.body ?? "").slice(0, 4000);
        if (!body.trim()) break;
        const msg = {
          id: randomUUID(),
          workspaceId: m.workspaceId,
          channelId: m.channelId,
          senderId: client.userId ?? "anon",
          senderName: client.name,
          body,
          ts: Date.now(),
          clientMsgId: m.clientMsgId ?? null,
        };
        const arr = db.messages[chKey] ?? [];
        arr.push(msg);
        while (arr.length > HISTORY_CAP) arr.shift();
        db.messages[chKey] = arr;
        save();
        broadcastChannel(chKey, { type: "message", workspaceId: m.workspaceId, channelId: m.channelId, message: msg });
        break;
      }
    }
  });

  ws.on("close", () => {
    const subs = [...client.chSubs];
    clients.delete(client);
    for (const chKey of subs) {
      const [wsId, chId] = chKey.split("/");
      presence(wsId, chId);
    }
  });
  ws.on("error", () => {});
});
