"use client";
import { useState, useEffect, useRef } from "react";
import {
  Box, Flex, Heading, Text, Button, Input, Select, Badge,
  IconButton, useToast, Spinner, HStack, VStack, Avatar,
  SimpleGrid, Tooltip, Divider, Tag, TagLabel,
  AlertDialog, AlertDialogOverlay, AlertDialogContent,
  AlertDialogHeader, AlertDialogBody, AlertDialogFooter
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  Trash2, UserPlus, Mail, Shield, Users, Crown,
  Clock, Calendar
} from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import api from "@/lib/api";
import { MemberCardSkeleton } from "@/components/Skeletons";
import { useCustomToast } from "@/hooks/useCustomToast";


const ROLE_CONFIG = {
  OWNER: { label: "Owner", color: "purple", icon: Crown, desc: "Full access · Can delete workspace" },
  ADMIN: { label: "Admin", color: "blue", icon: Shield, desc: "Manage members & projects" },
  MEMBER: { label: "Member", color: "green", icon: Users, desc: "Create & edit tasks" },
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function TeamPage() {
  const { selectedWorkspaceId, myRole } = useDashboard();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("MEMBER");
  const [inviting, setInviting] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const cancelRef = useRef();
  const toast = useCustomToast();

  const canManageMembers = myRole === "OWNER" || myRole === "ADMIN";
  const canRemoveMembers = myRole === "OWNER";

  const fetchMembers = async () => {
    if (!selectedWorkspaceId) { setLoading(false); return; }
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

  useEffect(() => { fetchMembers(); }, [selectedWorkspaceId]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await api.post(`/workspaces/${selectedWorkspaceId}/members`, {
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => setInviteSuccess(false), 3000);
      fetchMembers();
      toast.success({ title: "Member added", description: "The user has been added to the workspace." });
    } catch (err) {
      toast.error({
        title: "Failed to add member",
        description: err.response?.data?.error || err.message,
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
      toast.info({ title: "Member removed" });
      setMemberToRemove(null);
    } catch (err) {
      toast.error({
        title: "Failed to remove member",
        description: err.response?.data?.error || err.message,
      });
    } finally {
      setIsRemoving(false);
    }
  };

  if (!selectedWorkspaceId) {
    return (
      <Flex h="60vh" align="center" justify="center" direction="column" gap={4}>
        <Box p={5} bg="whiteAlpha.50" rounded="2xl" border="1px dashed" borderColor="whiteAlpha.200">
          <Users size={32} color="rgba(255,255,255,0.2)" />
        </Box>
        <Text color="whiteAlpha.400" fontSize="sm">Select a workspace to manage your team.</Text>
      </Flex>
    );
  }

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1100px" mx="auto">
      <Flex direction="column" gap={10}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={4}>
            <Box>
              <Heading size="lg" color="white" mb={1} fontWeight="800" letterSpacing="-0.02em">
                Team Management
              </Heading>
              <Text color="whiteAlpha.500" fontSize="sm">
                Manage access and roles for your workspace.
              </Text>
            </Box>
            <Tag colorScheme="brand" size="md" rounded="full" px={4}>
              <TagLabel fontWeight="700">{members.length} member{members.length !== 1 ? "s" : ""}</TagLabel>
            </Tag>
          </HStack>
        </motion.div>

        {/* Role Guide */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
            {Object.entries(ROLE_CONFIG).map(([role, conf]) => (
              <HStack
                key={role}
                p={4}
                rounded="xl"
                bg="rgba(15,23,42,0.6)"
                border="1px solid"
                borderColor="whiteAlpha.80"
                spacing={4}
              >
                <Flex
                  w={10} h={10} rounded="lg"
                  bg={`${conf.color}.500`}
                  opacity={0.15}
                  align="center" justify="center"
                  flexShrink={0}
                  position="relative"
                >
                  <Box position="absolute" inset={0} display="flex" alignItems="center" justifyContent="center" opacity={7}>
                    <conf.icon size={18} color={conf.color === "purple" ? "#a855f7" : conf.color === "blue" ? "#60a5fa" : "#34d399"} />
                  </Box>
                </Flex>
                <Box>
                  <Badge colorScheme={conf.color} fontSize="9px" mb={1} rounded="md">{conf.label}</Badge>
                  <Text fontSize="xs" color="whiteAlpha.400">{conf.desc}</Text>
                </Box>
              </HStack>
            ))}
          </SimpleGrid>
        </motion.div>

        {canManageMembers && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            <Box
              p={6}
              rounded="2xl"
              bg="rgba(15,23,42,0.7)"
              border="1px solid"
              borderColor="whiteAlpha.100"
              backdropFilter="blur(12px)"
            >
              <HStack mb={5} spacing={2}>
                <UserPlus size={16} color="#6366f1" />
                <Heading size="sm" color="white" fontWeight="700">Invite a new member</Heading>
              </HStack>
              <form onSubmit={handleInvite}>
                <Flex gap={3} direction={{ base: "column", md: "row" }}>
                  <HStack flex="1" px={4} h="44px" bg="whiteAlpha.50" rounded="xl" border="1px solid" borderColor="whiteAlpha.100" _focusWithin={{ borderColor: "brand.500" }} transition="border-color 0.15s">
                    <Mail size={15} color="rgba(255,255,255,0.3)" />
                    <Input
                      variant="unstyled"
                      placeholder="colleague@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      type="email"
                      color="white"
                      fontSize="sm"
                      _placeholder={{ color: "whiteAlpha.300" }}
                    />
                  </HStack>
                  <Select
                    w={{ base: "full", md: "140px" }}
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
                    colorScheme={inviteSuccess ? "green" : "brand"}
                    h="44px"
                    px={6}
                    rounded="xl"
                    leftIcon={<UserPlus size={16} />}
                    isLoading={inviting}
                    transition="all 0.2s"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
                  >
                    {inviteSuccess ? "Added!" : "Add Member"}
                  </Button>
                </Flex>
                <Text mt={3} fontSize="xs" color="whiteAlpha.300">
                  Users must have signed in to Flowboard at least once before being added.
                </Text>
              </form>
            </Box>
          </motion.div>
        )}

        {/* Members Grid */}
        <Box>
          <HStack justify="space-between" mb={5}>
            <Heading size="sm" color="white" fontWeight="700">
              All Members
            </Heading>
            {loading && <Spinner size="sm" color="brand.500" />}
          </HStack>

          {loading ? (
            <MemberCardSkeleton count={6} />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
                {members.map((m) => {
                  const conf = ROLE_CONFIG[m.role] || ROLE_CONFIG.MEMBER;
                  return (
                    <motion.div key={m.userId} variants={cardVariants}>
                      <Box
                        p={5}
                        rounded="2xl"
                        bg="rgba(15,23,42,0.7)"
                        border="1px solid"
                        borderColor="whiteAlpha.100"
                        backdropFilter="blur(8px)"
                        position="relative"
                        role="group"
                        _hover={{ borderColor: `${conf.color}.500`, transform: "translateY(-2px)", boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}
                        transition="all 0.2s"
                      >
                        {/* Remove button on hover */}
                        {canRemoveMembers && m.role !== "OWNER" && (
                          <Tooltip label="Remove member" hasArrow>
                            <IconButton
                              icon={<Trash2 size={13} />}
                              size="xs"
                              colorScheme="red"
                              variant="ghost"
                              position="absolute"
                              top={3}
                              right={3}
                              opacity={0}
                              _groupHover={{ opacity: 1 }}
                              transition="opacity 0.15s"
                              onClick={() => setMemberToRemove(m)}
                              aria-label="Remove member"
                            />
                          </Tooltip>
                        )}

                        <HStack spacing={4} mb={4}>
                          <Box position="relative">
                            <Avatar
                              size="md"
                              name={m.user.name}
                              src={m.user.avatarUrl}
                              border="2px solid"
                              borderColor={`${conf.color}.500`}
                            />
                            <Box
                              position="absolute"
                              bottom={0}
                              right={0}
                              w={3}
                              h={3}
                              rounded="full"
                              bg="green.400"
                              border="2px solid"
                              borderColor="#0f172a"
                            />
                          </Box>
                          <Box flex="1" minW={0}>
                            <Text fontWeight="700" color="white" noOfLines={1} fontSize="sm">
                              {m.user.name || "Unknown User"}
                            </Text>
                            <Text fontSize="xs" color="whiteAlpha.400" noOfLines={1}>
                              {m.user.email}
                            </Text>
                          </Box>
                        </HStack>

                        <Divider borderColor="whiteAlpha.50" mb={3} />

                        <HStack justify="space-between">
                          <Badge
                            colorScheme={conf.color}
                            fontSize="9px"
                            px={2.5}
                            py={0.5}
                            rounded="full"
                            display="flex"
                            alignItems="center"
                            gap="4px"
                          >
                            <conf.icon size={8} />
                            {conf.label}
                          </Badge>
                          <HStack spacing={1} color="whiteAlpha.300">
                            <Calendar size={10} />
                            <Text fontSize="10px">Member</Text>
                          </HStack>
                        </HStack>
                      </Box>
                    </motion.div>
                  );
                })}
              </SimpleGrid>
            </motion.div>
          )}

          {!loading && members.length === 0 && (
            <Flex direction="column" align="center" justify="center" py={16} gap={4}>
              <Box p={5} bg="whiteAlpha.50" rounded="2xl" border="1px dashed" borderColor="whiteAlpha.200">
                <Users size={28} color="rgba(255,255,255,0.2)" />
              </Box>
              <Text color="whiteAlpha.400" fontSize="sm">No members yet. Invite your first teammate above.</Text>
            </Flex>
          )}
        </Box>
      </Flex>

      {/* Remove dialog */}
      <AlertDialog isOpen={!!memberToRemove} leastDestructiveRef={cancelRef} onClose={() => setMemberToRemove(null)} isCentered blockScrollOnMount={false}>
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.500" />
        <AlertDialogContent bg="#1e293b" color="white" rounded="2xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="800">Remove Member</AlertDialogHeader>
          <AlertDialogBody color="whiteAlpha.600" fontSize="sm">
            Are you sure you want to remove{" "}
            <Text as="span" color="white" fontWeight="700">{memberToRemove?.user?.name || memberToRemove?.user?.email}</Text>{" "}
            from this workspace?
          </AlertDialogBody>
          <AlertDialogFooter gap={3}>
            <Button ref={cancelRef} onClick={() => setMemberToRemove(null)} variant="ghost" _hover={{ bg: "whiteAlpha.100" }}>Cancel</Button>
            <Button colorScheme="red" onClick={confirmRemove} isLoading={isRemoving}>Remove</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
