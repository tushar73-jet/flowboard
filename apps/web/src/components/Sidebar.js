"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Box, Flex, Text, VStack, HStack, Select, Spinner,
  IconButton, Tooltip, Badge, Divider, Button, Textarea,
  useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, useToast,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Kbd
} from "@chakra-ui/react";
import { UserButton } from "@clerk/nextjs";
import { LayoutDashboard, FolderKanban, Plus, Trash2, ChevronRight, Users, Keyboard, HelpCircle, MessageSquare } from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import api from "@/lib/api";
import { SidebarProjectsSkeleton } from "@/components/Skeletons";

const ROLE_META = {
  OWNER: { label: "Owner", color: "purple" },
  ADMIN: { label: "Admin", color: "blue" },
  MEMBER: { label: "Member", color: "green" },
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
  const { isOpen: isWsOpen, onOpen: onWsOpen, onClose: onWsClose } = useDisclosure();
  const { isOpen: isProjOpen, onOpen: onProjOpen, onClose: onProjClose } = useDisclosure();
  const { isOpen: isDelOpen, onOpen: onDelOpen, onClose: onDelClose } = useDisclosure();
  const cancelRef = useRef();

  const [newWsName, setNewWsName] = useState("");
  const [newProjName, setNewProjName] = useState("");
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState("");
  const toast = useToast();

  const canCreate = myRole === "OWNER" || myRole === "ADMIN";
  const canDelete = myRole === "OWNER";
  const canEdit = myRole === "OWNER" || myRole === "ADMIN";
  const roleMeta = myRole ? ROLE_META[myRole] : null;
  const selectedWs = workspaces.find(w => w.id === selectedWorkspaceId);

  const handleSaveDesc = async () => {
    setEditingDesc(false);
    if (descValue === (selectedWs?.description || "")) return;
    try {
      await api.patch(`/workspaces/${selectedWorkspaceId}`, { description: descValue });
      await refreshWorkspaces();
      toast({ title: "Description updated", status: "success", duration: 2000 });
    } catch (e) {
      toast({ title: "Failed to update description", status: "error", duration: 3000 });
    }
  };

  const handleCreateWorkspace = async () => {
    if (!newWsName.trim()) return;
    setCreating(true);
    try {
      await api.post("/workspaces", { name: newWsName });
      const data = await refreshWorkspaces();
      if (data.length > 0) setSelectedWorkspaceId(data[data.length - 1].id);
      onWsClose();
      setNewWsName("");
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.error || e.message, status: "error", duration: 4000 });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateProject = async () => {
    if (!canCreate || !newProjName.trim()) return;
    setCreating(true);
    try {
      const { data: proj } = await api.post("/projects", { name: newProjName, workspaceId: selectedWorkspaceId });
      await refreshProjects();
      router.push(`/dashboard/board/${proj.id}`);
      onProjClose();
      setNewProjName("");
    } catch (e) {
      toast({ title: "Error", description: e.response?.data?.error || e.message, status: "error", duration: 4000 });
    } finally {
      setCreating(false);
    }
  };

  const [isDeletingWs, setIsDeletingWs] = useState(false);

  const confirmDeleteWorkspace = async () => {
    setIsDeletingWs(true);
    try {
      await api.delete(`/workspaces/${selectedWorkspaceId}`);
      const data = await refreshWorkspaces();
      setSelectedWorkspaceId(data.length > 0 ? data[0].id : null);
      router.push("/dashboard");
    } catch (e) {
      toast({ title: "Failed to delete", description: e.response?.data?.error || e.message, status: "error", duration: 4000 });
    } finally {
      setIsDeletingWs(false);
      onDelClose();
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
      bg="rgba(30, 41, 59, 0.7)"
      borderRightWidth="1px"
      borderColor="whiteAlpha.100"
      backdropFilter="blur(20px)"
      zIndex={20}
      overflow="hidden"
    >
      <Flex as={Link} href="/" style={{ textDecoration: 'none' }} px={5} py={5} align="center" gap={3} borderBottomWidth="1px" borderColor="whiteAlpha.50" _hover={{ bg: "whiteAlpha.100" }} cursor="pointer">
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
              onClick={onWsOpen}
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
                  onClick={onDelOpen}
                />
              </Tooltip>
            )}
          </HStack>
        )}

        {/* Workspace description */}
        <Box mt={2}>
          {editingDesc ? (
            <Textarea
              value={descValue}
              onChange={(e) => setDescValue(e.target.value)}
              onBlur={handleSaveDesc}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveDesc(); } if (e.key === "Escape") setEditingDesc(false); }}
              autoFocus
              size="xs"
              rows={2}
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="brand.500"
              rounded="md"
              fontSize="xs"
              color="whiteAlpha.800"
              resize="none"
              placeholder="Add workspace description..."
              _focus={{ boxShadow: "none" }}
            />
          ) : (
            <Text
              fontSize="xs"
              color={selectedWs?.description ? "whiteAlpha.500" : "whiteAlpha.300"}
              px={1}
              py={0.5}
              rounded="md"
              cursor={canEdit ? "pointer" : "default"}
              noOfLines={2}
              _hover={canEdit ? { bg: "whiteAlpha.50", color: "whiteAlpha.700" } : {}}
              onClick={() => { if (!canEdit) return; setDescValue(selectedWs?.description || ""); setEditingDesc(true); }}
              transition="all 0.15s"
            >
              {selectedWs?.description || (canEdit ? "Add description..." : "")}
            </Text>
          )}
        </Box>
      </Box>

      <Divider borderColor="whiteAlpha.50" />

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
                onClick={onProjOpen}
                isLoading={creating}
              />
            </Tooltip>
          )}
        </Flex>

        {loadingProjects ? (
          <SidebarProjectsSkeleton count={4} />
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

      {/* Footer */}
      <Box p={4} borderTopWidth="1px" borderColor="whiteAlpha.50">
        <Flex align="center" gap={3} mb={3}>
          <UserButton afterSignOutUrl="/" />
          <Box flex="1" minW={0}>
            <Text fontSize="xs" color="whiteAlpha.800" fontWeight="600" noOfLines={1}>My Account</Text>
            <Text fontSize="0.6rem" color="whiteAlpha.400">Manage profile</Text>
          </Box>
        </Flex>
        <Divider borderColor="whiteAlpha.50" mb={3} />
        <VStack spacing={1} align="stretch">
          <Flex
            as={Link}
            href="/dashboard"
            align="center" gap={2} px={2} py={1.5} rounded="md"
            color="whiteAlpha.400" fontSize="xs"
            _hover={{ color: "whiteAlpha.700", bg: "whiteAlpha.50" }}
            transition="all 0.15s"
            style={{ textDecoration: "none" }}
          >
            <Keyboard size={11} />
            <Text>Keyboard shortcuts</Text>
            <Box ml="auto" display="flex" gap={0.5}>
              <Kbd fontSize="9px" bg="whiteAlpha.100" color="whiteAlpha.400" border="none">Shift</Kbd>
              <Kbd fontSize="9px" bg="whiteAlpha.100" color="whiteAlpha.400" border="none">?</Kbd>
            </Box>
          </Flex>
          <Flex
            align="center" gap={2} px={2} py={1.5} rounded="md"
            color="whiteAlpha.400" fontSize="xs"
            _hover={{ color: "whiteAlpha.700", bg: "whiteAlpha.50" }}
            transition="all 0.15s"
            cursor="default"
          >
            <HelpCircle size={11} />
            <Text>Help & support</Text>
          </Flex>
          <Flex
            align="center" gap={2} px={2} py={1.5} rounded="md"
            color="brand.500" fontSize="xs" fontWeight="600"
            bg="rgba(99,102,241,0.08)"
            _hover={{ bg: "rgba(99,102,241,0.15)" }}
            transition="all 0.15s"
            cursor="default"
            rounded="md"
          >
            <MessageSquare size={11} />
            <Text>Send feedback</Text>
          </Flex>
        </VStack>
      </Box>

      <Modal isOpen={isWsOpen} onClose={onWsClose} isCentered blockScrollOnMount={false}>
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <ModalHeader>Create Workspace</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Workspace name (e.g. Acme Corp)"
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              bg="whiteAlpha.100"
              border="none"
              _focus={{ bg: "whiteAlpha.200" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" _hover={{ bg: "whiteAlpha.100" }} onClick={onWsClose} mr={3}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleCreateWorkspace} isLoading={creating}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isProjOpen} onClose={onProjClose} isCentered blockScrollOnMount={false}>
        <ModalOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <ModalContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <ModalHeader>Create Project</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Project name (e.g. Beta Launch)"
              value={newProjName}
              onChange={(e) => setNewProjName(e.target.value)}
              bg="whiteAlpha.100"
              border="none"
              _focus={{ bg: "whiteAlpha.200" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" _hover={{ bg: "whiteAlpha.100" }} onClick={onProjClose} mr={3}>Cancel</Button>
            <Button colorScheme="brand" onClick={handleCreateProject} isLoading={creating}>Create</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog isOpen={isDelOpen} leastDestructiveRef={cancelRef} onClose={onDelClose} isCentered blockScrollOnMount={false}>
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <AlertDialogContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Workspace</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete this workspace and ALL its projects? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onDelClose} variant="ghost" _hover={{ bg: "whiteAlpha.100" }}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmDeleteWorkspace} isLoading={isDeletingWs} ml={3}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        py={2.5}
        rounded="lg"
        cursor="pointer"
        bg={active ? "rgba(99,102,241,0.15)" : "transparent"}
        color={active ? "brand.300" : "whiteAlpha.600"}
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        transition="all 0.15s"
        fontSize="sm"
        fontWeight={active ? "700" : "500"}
        position="relative"
      >
        {active && (
          <Box
            position="absolute"
            left={0} top="50%" transform="translateY(-50%)"
            w="2px" h="60%" bg="brand.500" rounded="full"
          />
        )}
        <Box color={active ? "brand.400" : "whiteAlpha.500"}>{icon}</Box>
        <Text flex="1">{label}</Text>
        {active && <ChevronRight size={12} />}
      </Flex>
    </Link>
  );
}

function ProjectItem({ proj, active }) {
  // Subtle color dot cycling through brand colors per project name hash
  const hue = (proj.name.charCodeAt(0) * 37 + proj.name.charCodeAt(1 % proj.name.length) * 13) % 360;
  const dotColor = `hsl(${hue}, 70%, 60%)`;

  return (
    <Link href={`/dashboard/board/${proj.id}`} style={{ textDecoration: "none" }}>
      <Flex
        align="center"
        gap={3}
        px={3}
        py={2}
        rounded="lg"
        cursor="pointer"
        bg={active ? "rgba(99,102,241,0.18)" : "transparent"}
        color={active ? "white" : "whiteAlpha.600"}
        _hover={{ bg: "whiteAlpha.100", color: "white" }}
        transition="all 0.15s"
        fontSize="sm"
        fontWeight={active ? "700" : "400"}
        borderLeftWidth="2px"
        borderLeftColor={active ? "brand.500" : "transparent"}
        role="group"
      >
        <Box
          w={2}
          h={2}
          rounded="full"
          bg={dotColor}
          flexShrink={0}
          boxShadow={active ? `0 0 6px ${dotColor}` : "none"}
        />
        <Text flex="1" noOfLines={1}>{proj.name}</Text>
      </Flex>
    </Link>
  );
}
