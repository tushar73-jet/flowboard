"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import api from "@/lib/api";

// Share workspace/project state across dashboard pages
export const DashboardContext = createContext({});
export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [myRole, setMyRole] = useState(null);
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // Load workspaces on mount
  useEffect(() => {
    api.get("/workspaces")
      .then(({ data }) => {
        setWorkspaces(data);
        if (data.length > 0) setSelectedWorkspaceId(data[0].id);
      })
      .catch(console.error)
      .finally(() => setLoadingWorkspaces(false));
  }, []);

  // Load projects + role when workspace changes
  useEffect(() => {
    if (!selectedWorkspaceId) return;
    setLoadingProjects(true);
    setMyRole(null);
    Promise.all([
      api.get(`/projects?workspaceId=${selectedWorkspaceId}`),
      api.get(`/workspaces/${selectedWorkspaceId}/my-role`),
    ])
      .then(([projRes, roleRes]) => {
        setProjects(projRes.data);
        setMyRole(roleRes.data.role);
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, [selectedWorkspaceId]);

  const refreshProjects = async () => {
    if (!selectedWorkspaceId) return;
    const { data } = await api.get(`/projects?workspaceId=${selectedWorkspaceId}`);
    setProjects(data);
  };

  const refreshWorkspaces = async () => {
    const { data } = await api.get("/workspaces");
    setWorkspaces(data);
    return data;
  };

  const ctx = {
    workspaces, selectedWorkspaceId, setSelectedWorkspaceId,
    projects, myRole, loadingProjects, loadingWorkspaces,
    refreshProjects, refreshWorkspaces,
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <Flex minH="100vh" bg="#0b1120">
        <Sidebar />
        <Box flex="1" overflow="auto">
          {children}
        </Box>
      </Flex>
    </DashboardContext.Provider>
  );
}
