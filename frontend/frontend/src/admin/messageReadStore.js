// tracks which message IDs the admin has already read — stored in localStorage
// so it persists across reloads. dispatches a window event whenever the read
// set changes, so the sidebar unread badge updates in real time.

const KEY = "matat-admin-read-messages";
const EVENT = "matat-messages-read-changed";

export function getReadIds() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids) {
  // de-dupe and save
  const uniq = Array.from(new Set(ids));
  localStorage.setItem(KEY, JSON.stringify(uniq));
  window.dispatchEvent(new Event(EVENT));
}

export function isRead(id) {
  return getReadIds().includes(id);
}

export function markRead(id) {
  if (!id) return;
  const ids = getReadIds();
  if (ids.includes(id)) return;
  saveReadIds([...ids, id]);
}

export function markUnread(id) {
  const ids = getReadIds().filter((x) => x !== id);
  saveReadIds(ids);
}

export function markAllRead(idsToAdd = []) {
  saveReadIds([...getReadIds(), ...idsToAdd]);
}

// let other components subscribe to changes (sidebar badge, table row, etc)
export function onReadChange(handler) {
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
