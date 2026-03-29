"use client";
import Link from "next/link";
import {
  Box, Flex, Heading, Text, Grid, GridItem,
  Spinner, Badge, HStack, Button, Icon,
} from "@chakra-ui/react";
import { FolderKanban, Plus, ArrowRight } from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
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

  const selectedWs = workspaces.find(w => w.id === selectedWorkspaceId);
  const canCreate = myRole === "OWNER" || myRole === "ADMIN";
  const roleMeta = myRole ? ROLE_META[myRole] : null;

  const handleNewProject = async () => {
    const name = window.prompt("Project name:");
    if (!name) return;
    try {
      await api.post("/projects", { name, workspaceId: selectedWorkspaceId });
      await refreshProjects();
    } catch (e) {
      window.alert(e.response?.data?.error || e.message);
    }
  };

  return (
    <Box p={8} minH="100vh">
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
            {projects.length} project{projects.length !== 1 ? "s" : ""} in this workspace
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

      {/* Projects Grid */}
      {loadingProjects ? (
        <Flex justify="center" align="center" h="200px">
          <Spinner size="xl" color="brand.500" thickness="3px" />
        </Flex>
      ) : projects.length === 0 ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          h="300px"
          border="1px dashed"
          borderColor="whiteAlpha.200"
          rounded="2xl"
          gap={4}
          color="whiteAlpha.400"
        >
          <FolderKanban size={40} />
          <Text fontSize="sm">
            {canCreate
              ? "No projects yet. Create your first project!"
              : "No projects in this workspace."}
          </Text>
          {canCreate && (
            <Button
              size="sm"
              variant="outline"
              colorScheme="brand"
              leftIcon={<Plus size={14} />}
              onClick={handleNewProject}
            >
              Create Project
            </Button>
          )}
        </Flex>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(240px, 1fr))" gap={4}>
          {projects.map((proj) => (
            <ProjectCard key={proj.id} proj={proj} />
          ))}
          {canCreate && (
            <GridItem>
              <Flex
                as="button"
                onClick={handleNewProject}
                h="140px"
                rounded="2xl"
                border="1px dashed"
                borderColor="whiteAlpha.200"
                align="center"
                justify="center"
                direction="column"
                gap={2}
                color="whiteAlpha.400"
                _hover={{ borderColor: "brand.500", color: "brand.400", bg: "rgba(99,102,241,0.05)" }}
                transition="all 0.2s"
                w="full"
                cursor="pointer"
              >
                <Plus size={24} />
                <Text fontSize="sm" fontWeight="500">New Project</Text>
              </Flex>
            </GridItem>
          )}
        </Grid>
      )}
    </Box>
  );
}

function ProjectCard({ proj }) {
  return (
    <Link href={`/dashboard/board/${proj.id}`} style={{ textDecoration: "none" }}>
      <Flex
        direction="column"
        justify="space-between"
        h="140px"
        p={5}
        rounded="2xl"
        bg="rgba(30, 41, 59, 0.6)"
        border="1px solid"
        borderColor="whiteAlpha.100"
        _hover={{
          borderColor: "brand.500",
          transform: "translateY(-3px)",
          bg: "rgba(30, 41, 59, 0.9)",
          boxShadow: "0 8px 32px rgba(99,102,241,0.2)",
        }}
        transition="all 0.2s"
        cursor="pointer"
      >
        <Flex
          w={9} h={9} rounded="lg"
          bg="rgba(99,102,241,0.2)"
          align="center" justify="center"
          color="brand.400"
        >
          <FolderKanban size={18} />
        </Flex>

        <Box>
          <Text fontWeight="600" color="white" fontSize="sm" noOfLines={1}>
            {proj.name}
          </Text>
          <HStack mt={1} spacing={1} color="whiteAlpha.500">
            <Text fontSize="xs">Open Board</Text>
            <ArrowRight size={11} />
          </HStack>
        </Box>
      </Flex>
    </Link>
  );
}
