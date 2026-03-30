"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box, Flex, Heading, Text, Grid, GridItem,
  Spinner, Badge, HStack, Button, Icon, Divider,
  VStack, useToast
} from "@chakra-ui/react";
import { FolderKanban, Plus, ArrowRight, Activity } from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import ActivityFeed from "@/components/ActivityFeed";
import api from "@/lib/api";

const ROLE_META = {
  OWNER:  { label: "Owner",  color: "purple" },
  ADMIN:  { label: "Admin",  color: "blue"   },
  MEMBER: { label: "Member", color: "green"  },
};

export default function DashboardPage() {
  const {
    workspaces, selectedWorkspaceId,
    projects, myRole, loadingProjects,
    refreshProjects,
  } = useDashboard();

  const [activities, setActivities] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const toast = useToast();

  const selectedWs = workspaces.find(w => w.id === selectedWorkspaceId);
  const canCreate = myRole === "OWNER" || myRole === "ADMIN";
  const roleMeta = myRole ? ROLE_META[myRole] : null;

  const fetchActivity = async () => {
    if (!selectedWorkspaceId) return;
    setLoadingActivity(true);
    try {
      const { data } = await api.get(`/workspaces/${selectedWorkspaceId}/activity`);
      setActivities(data);
    } catch (e) {
      console.error("Failed to fetch activity", e);
    } finally {
      setLoadingActivity(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [selectedWorkspaceId]);

  const handleNewProject = async () => {
    const name = window.prompt("Project name:");
    if (!name) return;
    try {
      await api.post("/projects", { name, workspaceId: selectedWorkspaceId });
      await refreshProjects();
      fetchActivity(); // Refresh activity after new project
      toast({ title: "Project created", status: "success", duration: 2000 });
    } catch (e) {
      window.alert(e.response?.data?.error || e.message);
    }
  };

  return (
    <Box p={8} minH="100vh" maxW="1400px" mx="auto">
      <Grid templateColumns={{ base: "1fr", lg: "1fr 320px" }} gap={10}>
        
        {/* Main Column: Projects */}
        <GridItem>
          {/* Header */}
          <Flex justify="space-between" align="flex-start" mb={8}>
            <Box>
              <HStack spacing={3} mb={1}>
                <Heading size="lg" color="white" fontWeight="700">
                  {selectedWs?.name || "Dashboard"}
                </Heading>
                {roleMeta && (
                  <Badge colorScheme={roleMeta.color} fontSize="0.65rem" px={2} py={1} rounded="full">
                    {roleMeta.label}
                  </Badge>
                )}
              </HStack>
              <Text color="whiteAlpha.500" fontSize="sm">
                Manage your team's projects and track progress.
              </Text>
            </Box>

            {canCreate && (
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="brand"
                size="sm"
                rounded="xl"
                px={5}
                onClick={handleNewProject}
              >
                New Project
              </Button>
            )}
          </Flex>

          {/* Projects Content */}
          {loadingProjects ? (
            <Flex justify="center" align="center" h="300px">
              <Spinner size="xl" color="brand.500" thickness="3px" />
            </Flex>
          ) : projects.length === 0 ? (
            <EmptyProjects onNew={handleNewProject} canCreate={canCreate} />
          ) : (
            <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={5}>
              {projects.map((proj) => (
                <ProjectCard key={proj.id} proj={proj} />
              ))}
              {canCreate && (
                <GridItem>
                  <NewProjectPlaceholder onClick={handleNewProject} />
                </GridItem>
              )}
            </Grid>
          )}
        </GridItem>

        {/* Sidebar Column: Activity Feed */}
        <GridItem>
          <Box 
            bg="rgba(15, 23, 42, 0.4)" 
            border="1px solid" 
            borderColor="whiteAlpha.100" 
            rounded="2xl" 
            overflow="hidden"
            position="sticky"
            top="8"
          >
            <Box p={4} borderBottom="1px solid" borderColor="whiteAlpha.100" bg="whiteAlpha.50">
              <HStack spacing={2} color="whiteAlpha.800">
                <Activity size={16} />
                <Heading size="xs" textTransform="uppercase" letterSpacing="0.05em">Recent Activity</Heading>
              </HStack>
            </Box>
            
            <Box maxH="calc(100vh - 180px)" overflowY="auto" sx={{
              '&::-webkit-scrollbar': { width: '4px' },
              '&::-webkit-scrollbar-track': { background: 'transparent' },
              '&::-webkit-scrollbar-thumb': { background: 'whiteAlpha.200', borderRadius: '2px' },
            }}>
              <ActivityFeed activities={activities} loading={loadingActivity} />
            </Box>
            
            <Box p={3} borderTop="1px solid" borderColor="whiteAlpha.100" textAlign="center">
              <Text fontSize="10px" color="whiteAlpha.400" fontWeight="600">LATEST 50 EVENTS</Text>
            </Box>
          </Box>
        </GridItem>

      </Grid>
    </Box>
  );
}

function ProjectCard({ proj }) {
  return (
    <Link href={`/dashboard/board/${proj.id}`} style={{ textDecoration: "none" }}>
      <Flex
        direction="column"
        justify="space-between"
        h="160px"
        p={6}
        rounded="2xl"
        bg="rgba(30, 41, 59, 0.6)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        _hover={{
          borderColor: "brand.500",
          transform: "translateY(-4px)",
          bg: "rgba(30, 41, 59, 0.9)",
          boxShadow: "0 10px 40px rgba(99,102,241,0.2)",
        }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Flex
          w={10} h={10} rounded="xl"
          bg="rgba(99,102,241,0.15)"
          align="center" justify="center"
          color="brand.400"
        >
          <FolderKanban size={20} />
        </Flex>

        <Box mt={4}>
          <Text fontWeight="700" color="white" fontSize="md" noOfLines={1} mb={1}>
            {proj.name}
          </Text>
          <HStack justify="space-between" align="center">
            <Text fontSize="xs" color="whiteAlpha.400">Task Board</Text>
            <Icon as={ArrowRight} size={14} color="brand.500" />
          </HStack>
        </Box>
      </Flex>
    </Link>
  );
}

function NewProjectPlaceholder({ onClick }) {
  return (
    <Flex
      as="button"
      onClick={onClick}
      h="160px"
      rounded="2xl"
      border="1px dashed"
      borderColor="whiteAlpha.200"
      align="center"
      justify="center"
      direction="column"
      gap={3}
      color="whiteAlpha.400"
      _hover={{ borderColor: "brand.500", color: "brand.400", bg: "rgba(99,102,241,0.05)" }}
      transition="all 0.2s"
      w="full"
      cursor="pointer"
    >
      <Box p={2} bg="whiteAlpha.50" rounded="full">
        <Plus size={20} />
      </Box>
      <Text fontSize="sm" fontWeight="600">Create New Project</Text>
    </Flex>
  );
}

function EmptyProjects({ onNew, canCreate }) {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      h="400px"
      border="1px dashed"
      borderColor="whiteAlpha.200"
      rounded="3xl"
      gap={6}
      color="whiteAlpha.400"
      bg="rgba(15, 23, 42, 0.2)"
    >
      <Box p={6} bg="rgba(99,102,241,0.05)" rounded="full" color="brand.500">
        <FolderKanban size={48} />
      </Box>
      <VStack spacing={1}>
        <Text fontSize="lg" fontWeight="700" color="whiteAlpha.800">No projects yet</Text>
        <Text fontSize="sm">
          {canCreate
            ? "Get started by creating your very first project board."
            : "No projects have been shared in this workspace yet."}
        </Text>
      </VStack>
      {canCreate && (
        <Button
          size="lg"
          colorScheme="brand"
          leftIcon={<Plus size={20} />}
          rounded="xl"
          onClick={onNew}
          px={8}
        >
          Create First Project
        </Button>
      )}
    </Flex>
  );
}
