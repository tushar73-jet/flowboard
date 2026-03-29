"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box, Flex, Text, VStack, HStack, Select, Spinner,
  IconButton, Tooltip, Badge, Divider, Button,
} from "@chakra-ui/react";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FolderKanban, Plus, Trash2, ChevronRight, Settings, Users } from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import api from "@/lib/api";

const ROLE_META = {
  OWNER:  { label: "Owner",  color: "purple" },
  ADMIN:  { label: "Admin",  color: "blue"   },
  MEMBER: { label: "Member", color: "green"  },
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    workspaces, selectedWorkspaceId, setSelectedWorkspaceId,
    projects, myRole, loadingProjects,
    refreshProjects, refreshWorkspaces,
  } = useDashboard();

  const [creating, setCreating] = useState(false);

  const canCreate = myRole === "OWNER" || myRole === "ADMIN";
  const canDelete = myRole === "OWNER";
  const roleMeta = myRole ? ROLE_META[myRole] : null;

  const handleNewWorkspace = async () => {
    const name = window.prompt("Workspace name:");
    if (!name) return;
    await api.post("/workspaces", { name });
    const data = await refreshWorkspaces();
    if (data.length > 0) setSelectedWorkspaceId(data[data.length - 1].id);
  };

  const handleNewProject = async () => {
    if (!canCreate) return;
    const name = window.prompt("Project name:");
    if (!name) return;
    setCreating(true);
    try {
      const { data: proj } = await api.post("/projects", { name, workspaceId: selectedWorkspaceId });
      await refreshProjects();
      router.push(`/dashboard/board/${proj.id}`);
    } catch (e) {
      window.alert(e.response?.data?.error || e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!window.confirm("Delete this workspace and ALL its projects? This cannot be undone.")) return;
    try {
      await api.delete(`/workspaces/${selectedWorkspaceId}`);
      const data = await refreshWorkspaces();
      setSelectedWorkspaceId(data.length > 0 ? data[0].id : null);
      router.push("/dashboard");
    } catch (e) {
      window.alert(e.response?.data?.error || e.message);
    }
  };

  return (
    <Flex
      direction="column"
      w="260px"
      minW="260px"
      h="100vh"
      position="sticky"
      top={0}
      bg="rgba(15, 23, 42, 0.95)"
      borderRightWidth="1px"
      borderColor="whiteAlpha.100"
      backdropFilter="blur(20px)"
      zIndex={20}
      overflow="hidden"
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <Flex px={5} py={5} align="center" gap={3} borderBottomWidth="1px" borderColor="whiteAlpha.50">
        <Box
          w={8} h={8} rounded="lg"
          bgGradient="linear(135deg, #6366f1, #8b5cf6)"
          display="flex" alignItems="center" justifyContent="center"
          fontSize="sm" fontWeight="bold" color="white"
        >
          F
        </Box>
        <Text fontWeight="700" fontSize="lg" color="white" letterSpacing="-0.02em">
          Flowboard
        </Text>
      </Flex>

      {/* ── Workspace Selector ─────────────────────────── */}
      <Box px={4} pt={5} pb={3}>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="0.65rem" fontWeight="700" color="whiteAlpha.400" letterSpacing="0.1em" textTransform="uppercase">
            Workspace
          </Text>
          <Tooltip label="New Workspace" placement="right" hasArrow>
            <IconButton
              icon={<Plus size={12} />}
              size="xs"
              variant="ghost"
              color="whiteAlpha.500"
              _hover={{ color: "white", bg: "whiteAlpha.100" }}
              aria-label="New workspace"
              onClick={handleNewWorkspace}
            />
          </Tooltip>
        </Flex>

        <Select
          size="sm"
          variant="filled"
          bg="whiteAlpha.100"
          _hover={{ bg: "whiteAlpha.150" }}
          border="1px solid"
          borderColor="whiteAlpha.100"
          rounded="lg"
          color="whiteAlpha.900"
          fontSize="sm"
          value={selectedWorkspaceId || ""}
          onChange={(e) => setSelectedWorkspaceId(e.target.value)}
          sx={{ "& option": { background: "#1e293b" } }}
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </Select>

        {/* Role Badge */}
        {roleMeta && (
          <HStack mt={2} spacing={2}>
            <Badge
              colorScheme={roleMeta.color}
              fontSize="0.6rem"
              px={2} py={0.5}
              rounded="full"
              textTransform="uppercase"
              letterSpacing="0.05em"
            >
              {roleMeta.label}
            </Badge>
            {canDelete && (
              <Tooltip label="Delete workspace" placement="right" hasArrow>
                <IconButton
                  icon={<Trash2 size={11} />}
                  size="xs"
                  variant="ghost"
                  colorScheme="red"
                  color="red.400"
                  aria-label="Delete workspace"
                  onClick={handleDeleteWorkspace}
                />
              </Tooltip>
            )}
          </HStack>
        )}
      </Box>

      <Divider borderColor="whiteAlpha.50" />

      {/* ── Nav items ──────────────────────────────────── */}
      <Box px={3} pt={4} pb={2}>
        <NavItem
          icon={<LayoutDashboard size={15} />}
          label="Dashboard"
          href="/dashboard"
          active={pathname === "/dashboard"}
        />
        <NavItem
          icon={<Users size={15} />}
          label="Team"
          href="/dashboard/team"
          active={pathname === "/dashboard/team"}
        />
      </Box>

      <Divider borderColor="whiteAlpha.50" />

      {/* ── Projects ───────────────────────────────────── */}
      <Box px={4} pt={4} flex="1" overflow="auto">
        <Flex justify="space-between" align="center" mb={3}>
          <Text fontSize="0.65rem" fontWeight="700" color="whiteAlpha.400" letterSpacing="0.1em" textTransform="uppercase">
            Projects
          </Text>
          {canCreate && (
            <Tooltip label="New Project" placement="right" hasArrow>
              <IconButton
                icon={creating ? <Spinner size="xs" /> : <Plus size={12} />}
                size="xs"
                variant="ghost"
                color="whiteAlpha.500"
                _hover={{ color: "white", bg: "whiteAlpha.100" }}
                aria-label="New project"
                onClick={handleNewProject}
                isLoading={creating}
              />
            </Tooltip>
          )}
        </Flex>

        {loadingProjects ? (
          <Flex justify="center" py={4}>
            <Spinner size="sm" color="brand.500" />
          </Flex>
        ) : projects.length === 0 ? (
          <Text fontSize="xs" color="whiteAlpha.300" px={2} py={2}>
            {canCreate ? "No projects yet. Click + to create one." : "No projects in this workspace."}
          </Text>
        ) : (
          <VStack spacing={1} align="stretch">
            {projects.map((proj) => (
              <ProjectItem
                key={proj.id}
                proj={proj}
                active={pathname === `/dashboard/board/${proj.id}`}
              />
            ))}
          </VStack>
        )}
      </Box>

      {/* ── Bottom: User ───────────────────────────────── */}
      <Box p={4} borderTopWidth="1px" borderColor="whiteAlpha.50">
        <Flex align="center" gap={3}>
          <UserButton afterSignOutUrl="/" />
          <Box>
            <Text fontSize="xs" color="whiteAlpha.700" fontWeight="500">My Account</Text>
            <Text fontSize="0.6rem" color="whiteAlpha.400">Manage profile</Text>
          </Box>
        </Flex>
      </Box>
    </Flex>
  );
}

function NavItem({ icon, label, href, active }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        gap={3}
        px={3}
        py={2}
        rounded="lg"
        cursor="pointer"
        bg={active ? "whiteAlpha.150" : "transparent"}
        color={active ? "white" : "whiteAlpha.600"}
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        transition="all 0.15s"
        fontSize="sm"
        fontWeight={active ? "600" : "400"}
      >
        {icon}
        <Text flex="1">{label}</Text>
        {active && <ChevronRight size={12} />}
      </Flex>
    </Link>
  );
}

function ProjectItem({ proj, active }) {
  return (
    <Link href={`/dashboard/board/${proj.id}`} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        gap={3}
        px={3}
        py={2}
        rounded="lg"
        cursor="pointer"
        bg={active ? "rgba(99,102,241,0.2)" : "transparent"}
        color={active ? "brand.300" : "whiteAlpha.600"}
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        transition="all 0.15s"
        fontSize="sm"
        borderLeftWidth={active ? "2px" : "2px"}
        borderLeftColor={active ? "brand.500" : "transparent"}
      >
        <FolderKanban size={14} />
        <Text flex="1" noOfLines={1}>{proj.name}</Text>
      </Flex>
    </Link>
  );
}
