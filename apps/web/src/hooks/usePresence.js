import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth, useUser } from "@clerk/nextjs";

const PRESENCE_INTERVAL_MS = 20_000; // re-announce every 20s
const STALE_TIMEOUT_MS = 25_000;     // remove user after 25s of silence

export function usePresence(projectId, members) {
  const [presentUsers, setPresentUsers] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();
  // Map of userId -> stale-removal timer
  const staleTimers = useRef({});

  useEffect(() => {
    if (!projectId || !user) return;

    let socket;
    let heartbeatInterval;

    async function setup() {
      const token = await getToken();
      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: { token },
      });

      socket.emit("join_project", projectId);

      // Announce own presence immediately, then every 20s
      const announce = () =>
        socket.emit("user_presence", { projectId, userId: user.id });
      announce();
      heartbeatInterval = setInterval(announce, PRESENCE_INTERVAL_MS);

      socket.on("user_presence", ({ userId }) => {
        if (userId === user.id) return;
        const member = members?.find(m => m.userId === userId);
        if (!member) return;

        // Add user if not present
        setPresentUsers(prev =>
          prev.find(u => u.userId === userId) ? prev : [...prev, member]
        );

        // Reset stale timer for this user
        clearTimeout(staleTimers.current[userId]);
        staleTimers.current[userId] = setTimeout(() => {
          setPresentUsers(prev => prev.filter(u => u.userId !== userId));
          delete staleTimers.current[userId];
        }, STALE_TIMEOUT_MS);
      });

      socket.on("disconnect", () => {
        setPresentUsers([]);
      });
    }

    setup();

    return () => {
      clearInterval(heartbeatInterval);
      Object.values(staleTimers.current).forEach(clearTimeout);
      staleTimers.current = {};
      if (socket) {
        socket.emit("leave_project", projectId);
        socket.disconnect();
      }
      setPresentUsers([]);
    };
  }, [projectId, user?.id]);

  return presentUsers;
}
