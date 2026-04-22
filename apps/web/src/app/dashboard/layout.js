"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Sidebar from "@/components/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import api from "@/lib/api";

// Share workspace/project state across dashboard pages
export const DashboardContext = createContext({});
export const useDashboard = () => useContext(DashboardContext);

export default function DashboardLayout({ children }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
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

  // Load projects + members + role when workspace changes
  useEffect(() => {
    if (!selectedWorkspaceId) return;
    setLoadingProjects(true);
    setMyRole(null);
    Promise.all([
      api.get(`/projects?workspaceId=${selectedWorkspaceId}`),
      api.get(`/workspaces/${selectedWorkspaceId}/my-role`),
      api.get(`/workspaces/${selectedWorkspaceId}/members`),
    ])
      .then(([projRes, roleRes, memRes]) => {
        setProjects(projRes.data);
        setMyRole(roleRes.data.role);
        setMembers(memRes.data);
      })
      .catch(console.error)
      .finally(() => setLoadingProjects(false));
  }, [selectedWorkspaceId]);

  const refreshProjects = async () => {
    if (!selectedWorkspaceId) return;
    const { data } = await api.get(`/projects?workspaceId=${selectedWorkspaceId}`);
    setProjects(data);
  };

  const refreshMembers = async () => {
    if (!selectedWorkspaceId) return;
    const { data } = await api.get(`/workspaces/${selectedWorkspaceId}/members`);
    setMembers(data);
  };

  const refreshWorkspaces = async () => {
    const { data } = await api.get("/workspaces");
    setWorkspaces(data);
    return data;
  };

  const ctx = {
    workspaces, selectedWorkspaceId, setSelectedWorkspaceId,
    projects, members, myRole, loadingProjects, loadingWorkspaces,
    refreshProjects, refreshMembers, refreshWorkspaces,
  };

  return (
    <DashboardContext.Provider value={ctx}>
      <ErrorBoundary>
        <Flex minH="100vh" bg="#0b1120">
          <Sidebar />
          <Box flex="1" overflow="auto">
            {children}
          </Box>
        </Flex>
      </ErrorBoundary>
    </DashboardContext.Provider>
  );
}
