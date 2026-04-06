import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";

export function usePresence(projectId, members) {
  const [presentUsers, setPresentUsers] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (!projectId || !user) return;

    let socket;

    async function setup() {
      const token = await getToken();
      socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000", {
        auth: { token },
      });

      socket.emit("join_project", projectId);

      // Announce own presence after joining
      setTimeout(() => {
        socket.emit("user_presence", { projectId, userId: user.id });
      }, 500);

      socket.on("user_presence", ({ userId }) => {
        if (userId === user.id) return;
        const member = members?.find(m => m.userId === userId);
        if (!member) return;
        setPresentUsers(prev =>
          prev.find(u => u.userId === userId) ? prev : [...prev, member]
        );
      });

      socket.on("disconnect", () => {
        setPresentUsers([]);
      });
    }

    setup();

    return () => {
      if (socket) {
        socket.emit("leave_project", projectId);
        socket.disconnect();
      }
      setPresentUsers([]);
    };
  }, [projectId, user?.id]);

  return presentUsers;
}
