// frontend/src/context/NotificationContext.jsx
//
// ─────────────────────────────────────────────────────────────────────
// WHAT THIS DOES:
//   Provides a global notification system accessible from anywhere.
//
// STORAGE STRATEGY:
//   Notifications are stored in localStorage under key "notifications"
//   so they survive page refreshes. Each notification is a JS object:
//     { id, message, type, timestamp, read: bool }
//
// RED DOT LOGIC:
//   hasUnread = any notification where read === false
//   The Navbar reads hasUnread to show/hide the red dot.
//   When the user OPENS the panel → markAllRead() sets all read=true
//   → dot disappears immediately (optimistic UI, no flicker).
//
// HOW TO ADD NOTIFICATIONS FROM ANYWHERE:
//   const { addNotification } = useContext(NotificationContext);
//   addNotification("Your order #1234 has been placed!", "success");
//   type can be: "success" | "info" | "warning" | "order"
//
// EXAMPLE USAGE (in Orders.jsx after placing an order):
//   addNotification(`Order #${order.id} placed! COD ₹${total}`, "order");
// ─────────────────────────────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback } from "react";

export const NotificationContext = createContext();

const STORAGE_KEY = "app_notifications";
const MAX_NOTIFICATIONS = 20;  // keep the last 20, drop older ones

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(notifications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    // storage full or private mode — gracefully ignore
  }
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => loadFromStorage());

  // Sync to localStorage whenever the list changes
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  // ── True when at least one notification is unread ──────────────
  const hasUnread = notifications.some(n => !n.read);
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Add a new notification ─────────────────────────────────────
  const addNotification = useCallback((message, type = "info") => {
    const newNotif = {
      id:        Date.now(),          // unique enough for our purposes
      message,
      type,                           // "success" | "info" | "warning" | "order"
      timestamp: new Date().toISOString(),
      read:      false,
    };

    setNotifications(prev => {
      const updated = [newNotif, ...prev];  // newest first
      // Keep only the last MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });
  }, []);

  // ── Mark all as read (call when panel opens) ───────────────────
  const markAllRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => n.read ? n : { ...n, read: true })
    );
  }, []);

  // ── Remove a single notification ──────────────────────────────
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // ── Clear all notifications ────────────────────────────────────
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      hasUnread,
      unreadCount,
      addNotification,
      markAllRead,
      removeNotification,
      clearAll,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}