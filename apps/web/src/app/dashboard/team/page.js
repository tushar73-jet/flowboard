"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box, Flex, Heading, Text, Table, Tbody, Tr, Td, Th, Thead,
  Button, Input, Select, Badge, IconButton, useToast, Spinner,
  HStack, Card, CardBody, Avatar,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import { Trash2, UserPlus, Mail } from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import api from "@/lib/api";

const ROLE_COLORS = { OWNER: "purple", ADMIN: "blue", MEMBER: "green" };

export default function TeamPage() {
  const { selectedWorkspaceId, myRole } = useDashboard();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const cancelRef = useRef();

  const toast = useToast();

  const canManageMembers = myRole === "OWNER" || myRole === "ADMIN";

  const fetchMembers = async () => {
    if (!selectedWorkspaceId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/workspaces/${selectedWorkspaceId}/members`);
      setMembers(data);
    } catch (e) {
      console.error("Failed to fetch members", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedWorkspaceId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    try {
      await api.post(`/workspaces/${selectedWorkspaceId}/members`, {
        email: inviteEmail,
        role: inviteRole
      });
      setInviteEmail("");
      fetchMembers();
      toast({
        title: "Member added",
        description: "The user has been added to the workspace.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to add member",
        description: err.response?.data?.error || err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setInviting(false);
    }
  };

  const confirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await api.delete(`/workspaces/${selectedWorkspaceId}/members/${memberToRemove.userId}`);
      setMembers(members.filter(m => m.userId !== memberToRemove.userId));
      toast({
        title: "Member removed",
        status: "info",
        duration: 2000,
      });
      setMemberToRemove(null);
    } catch (err) {
      toast({
        title: "Failed to remove member",
        description: err.response?.data?.error || err.message,
        status: "error",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!selectedWorkspaceId) {
    return (
      <Box p={8} maxW="1000px" mx="auto">
        <Flex justify="center" align="center" h="400px">
          <Text color="whiteAlpha.500" fontSize="lg">Add a workspace to manage and view team members.</Text>
        </Flex>
      </Box>
    );
  }

  return (
    <Box p={8} maxW="1000px" mx="auto">
      <Flex direction="column" gap={8}>
        {/* Header */}
        <Box>
          <Heading size="lg" color="white" mb={2}>Team Management</Heading>
          <Text color="whiteAlpha.600">Manage who has access to this workspace and their roles.</Text>
        </Box>

        {/* Invite Member Card */}
        {canManageMembers && (
          <Card bg="rgba(30, 41, 59, 0.4)" border="1px solid" borderColor="whiteAlpha.100" rounded="2xl" overflow="hidden">
            <CardBody p={6}>
              <Heading size="sm" color="white" mb={4}>Add New Member</Heading>
              <form onSubmit={handleInvite}>
                <Flex gap={4} direction={{ base: "column", md: "row" }}>
                  <Box flex="1">
                    <HStack px={3} h="44px" bg="whiteAlpha.50" rounded="xl" border="1px solid" borderColor="whiteAlpha.100">
                      <Mail size={18} color="rgba(255,255,255,0.4)" />
                      <Input
                        variant="unstyled"
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        type="email"
                        color="white"
                        fontSize="sm"
                      />
                    </HStack>
                  </Box>
                  <Select
                    w={{ base: "full", md: "150px" }}
                    h="44px"
                    bg="whiteAlpha.50"
                    borderColor="whiteAlpha.100"
                    rounded="xl"
                    color="white"
                    fontSize="sm"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    sx={{ "& option": { background: "#1e293b" } }}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </Select>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    h="44px"
                    px={8}
                    rounded="xl"
                    leftIcon={<UserPlus size={18} />}
                    isLoading={inviting}
                  >
                    Add Member
                  </Button>
                </Flex>
                <Text mt={3} fontSize="xs" color="whiteAlpha.400">
                  Note: Users must have signed in to Flowboard at least once before they can be added to a workspace.
                </Text>
              </form>
            </CardBody>
          </Card>
        )}

        {/* Members List */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="sm" color="white">All Members ({members.length})</Heading>
            {loading && <Spinner size="sm" color="brand.500" />}
          </HStack>

          <Box overflowX="auto" rounded="2xl" border="1px solid" borderColor="whiteAlpha.100" bg="rgba(15, 23, 42, 0.5)">
            <Table variant="simple">
              <Thead bg="whiteAlpha.50">
                <Tr>
                  <Th color="whiteAlpha.400" borderBottom="1px solid" borderColor="whiteAlpha.100">User</Th>
                  <Th color="whiteAlpha.400" borderBottom="1px solid" borderColor="whiteAlpha.100">Email</Th>
                  <Th color="whiteAlpha.400" borderBottom="1px solid" borderColor="whiteAlpha.100">Role</Th>
                  {canManageMembers && <Th color="whiteAlpha.400" borderBottom="1px solid" borderColor="whiteAlpha.100" textAlign="right">Actions</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {members.map((m) => (
                  <Tr key={m.userId} _hover={{ bg: "whiteAlpha.50" }}>
                    <Td borderBottom="1px solid" borderColor="whiteAlpha.50">
                      <HStack spacing={3}>
                        <Avatar size="xs" name={m.user.name} src={m.user.avatarUrl} />
                        <Text color="white" fontWeight="500">{m.user.name || "Unknown User"}</Text>
                      </HStack>
                    </Td>
                    <Td color="whiteAlpha.600" borderBottom="1px solid" borderColor="whiteAlpha.50" fontSize="sm">
                      {m.user.email}
                    </Td>
                    <Td borderBottom="1px solid" borderColor="whiteAlpha.50">
                      <Badge colorScheme={ROLE_COLORS[m.role]} variant="subtle" px={2} py={0.5} rounded="full" fontSize="xs">
                        {m.role}
                      </Badge>
                    </Td>
                    {canManageMembers && (
                      <Td borderBottom="1px solid" borderColor="whiteAlpha.50" textAlign="right">
                        <IconButton
                          icon={<Trash2 size={16} />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          aria-label="Remove member"
                          onClick={() => setMemberToRemove(m)}
                          isDisabled={m.role === "OWNER"}
                        />
                      </Td>
                    )}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Flex>

      {/* Remove Member Dialog */}
      <AlertDialog isOpen={!!memberToRemove} leastDestructiveRef={cancelRef} onClose={() => setMemberToRemove(null)} isCentered blockScrollOnMount={false}>
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <AlertDialogContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Remove Member</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to remove "{memberToRemove?.user?.name || memberToRemove?.user?.email}" from the workspace?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setMemberToRemove(null)} variant="ghost" _hover={{ bg: "whiteAlpha.100" }}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmRemove} isLoading={isRemoving} ml={3}>Remove</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </Box>
  );
}
