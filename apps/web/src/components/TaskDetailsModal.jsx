"use client";
import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Text, Box, Input, Textarea, Select, Badge, Button,
  Divider, FormControl, FormLabel, Avatar, Menu, MenuButton, MenuList, MenuItem,
  useToast
} from "@chakra-ui/react";
import {
  ChevronDown, Calendar, Signal, User,
  Trash2, MessageSquare, CheckCircle2, Plus
} from "lucide-react";
import { Checkbox, IconButton } from "@chakra-ui/react";
import api from "@/lib/api";

export default function TaskDetailsModal({
  isOpen, onClose, task, members, onUpdate, onDelete
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "TODO");
  const [priority, setPriority] = useState(task?.priority || "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || "");
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");

  const toast = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || "");
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  const handleUpdate = () => {
    onUpdate({
      ...task,
      title,
      description,
      status,
      priority,
      assigneeId: assigneeId || null
    });
    toast({
      title: "Task updated",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleAddSubtask = async (e) => {
    if (e.key !== "Enter" || !newSubtask.trim()) return;
    const { data } = await api.post("/subtasks", { taskId: task.id, title: newSubtask.trim() });
    setSubtasks((prev) => [...prev, data]);
    setNewSubtask("");
  };

  const handleToggle = async (st) => {
    const { data } = await api.patch(`/subtasks/${st.id}`, { isCompleted: !st.isCompleted });
    setSubtasks((prev) => prev.map((s) => (s.id === st.id ? data : s)));
  };

  const handleDeleteSubtask = async (id) => {
    await api.delete(`/subtasks/${id}`);
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const selectedAssignee = members.find(m => m.userId === assigneeId)?.user;

  const priorityColors = {
    HIGH: "red",
    MEDIUM: "yellow",
    LOW: "green"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.700" />
      <ModalContent bg="#0f172a" border="1px solid" borderColor="whiteAlpha.100" rounded="2xl" color="white">
        <ModalHeader borderBottom="1px solid" borderColor="whiteAlpha.50" pt={6}>
          <HStack spacing={4}>
            <IconBadge icon={<CheckCircle2 size={18} />} color="brand.500" />
            <Input
              variant="unstyled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fontWeight="700"
              fontSize="xl"
              placeholder="Task title"
              _placeholder={{ color: "whiteAlpha.300" }}
            />
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={6}>
          <Flex direction={{ base: "column", md: "row" }} gap={8}>
            {/* Main Content */}
            <VStack flex="1" align="stretch" spacing={6}>
              <Box>
                <HStack mb={2} spacing={2} color="whiteAlpha.500">
                  <MessageSquare size={14} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase">Description</Text>
                </HStack>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Review the project goals and define the next steps..."
                  bg="whiteAlpha.50"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  _focus={{ borderColor: "brand.500", bg: "whiteAlpha.100" }}
                  rounded="xl"
                  minH="150px"
                  fontSize="sm"
                  pt={3}
                />
              </Box>

              {/* Subtasks */}
              <Box>
                <HStack mb={2} spacing={2} color="whiteAlpha.500" justify="space-between">
                  <HStack spacing={2}>
                    <CheckCircle2 size={14} />
                    <Text fontSize="xs" fontWeight="700" textTransform="uppercase">Subtasks</Text>
                  </HStack>
                  <Text fontSize="xs" color="whiteAlpha.400">
                    {subtasks.filter(s => s.isCompleted).length}/{subtasks.length}
                  </Text>
                </HStack>

                <VStack align="stretch" spacing={1} mb={2}>
                  {subtasks.map((st) => (
                    <HStack key={st.id} px={2} py={1} rounded="lg" _hover={{ bg: "whiteAlpha.50" }}>
                      <Checkbox
                        isChecked={st.isCompleted}
                        onChange={() => handleToggle(st)}
                        colorScheme="brand"
                        size="sm"
                      />
                      <Text
                        flex="1"
                        fontSize="sm"
                        color={st.isCompleted ? "whiteAlpha.400" : "white"}
                        textDecoration={st.isCompleted ? "line-through" : "none"}
                      >
                        {st.title}
                      </Text>
                      <IconButton
                        icon={<Trash2 size={12} />}
                        size="xs"
                        variant="ghost"
                        colorScheme="red"
                        aria-label="delete"
                        onClick={() => handleDeleteSubtask(st.id)}
                      />
                    </HStack>
                  ))}
                </VStack>

                <HStack bg="whiteAlpha.50" px={3} py={1} rounded="lg">
                  <Plus size={13} color="#64748b" />
                  <Input
                    variant="unstyled"
                    fontSize="sm"
                    placeholder="Add subtask, press Enter"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleAddSubtask}
                  />
                </HStack>
              </Box>

              <HStack pt={4} justify="flex-end">
                <Button variant="ghost" colorScheme="red" size="sm" leftIcon={<Trash2 size={16} />} onClick={() => onDelete(task.id)}>
                  Delete Task
                </Button>
                <Button colorScheme="brand" size="sm" onClick={handleUpdate}>
                  Save Changes
                </Button>
              </HStack>
            </VStack>

            {/* Sidebar properties */}
            <VStack w={{ base: "full", md: "200px" }} align="stretch" spacing={5}>
              <PropertyItem label="Status">
                <Select
                  size="sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  bg="whiteAlpha.50"
                  borderColor="whiteAlpha.100"
                  rounded="lg"
                  fontSize="xs"
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </Select>
              </PropertyItem>

              <PropertyItem label="Priority">
                <Menu>
                  <MenuButton as={Button} size="sm" variant="outline" w="full" borderColor="whiteAlpha.100" fontSize="xs" rightIcon={<ChevronDown size={14} />}>
                    <HStack>
                      <Box w={2} h={2} rounded="full" bg={`${priorityColors[priority]}.400`} />
                      <Text>{priority}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList bg="#1e293b" borderColor="whiteAlpha.100">
                    <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => setPriority("HIGH")}>High</MenuItem>
                    <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => setPriority("MEDIUM")}>Medium</MenuItem>
                    <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => setPriority("LOW")}>Low</MenuItem>
                  </MenuList>
                </Menu>
              </PropertyItem>

              <PropertyItem label="Assignee">
                <Menu>
                  <MenuButton as={Button} size="sm" variant="outline" w="full" borderColor="whiteAlpha.100" fontSize="xs" textAlign="left" px={2}>
                    <HStack spacing={2}>
                      <Avatar size="xs" name={selectedAssignee?.name} src={selectedAssignee?.avatarUrl} />
                      <Text noOfLines={1}>{selectedAssignee?.name || "Unassigned"}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList bg="#1e293b" borderColor="whiteAlpha.100" maxH="200px" overflowY="auto">
                    <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => setAssigneeId("")}>Unassigned</MenuItem>
                    {members.map((m) => (
                      <MenuItem
                        key={m.userId}
                        bg="transparent"
                        _hover={{ bg: "whiteAlpha.100" }}
                        onClick={() => setAssigneeId(m.userId)}
                      >
                        <HStack spacing={2}>
                          <Avatar size="xs" name={m.user.name} src={m.user.avatarUrl} />
                          <Text fontSize="sm">{m.user.name}</Text>
                        </HStack>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </PropertyItem>

              <Divider borderColor="whiteAlpha.100" />

              <Box>
                <Text fontSize="10px" color="whiteAlpha.400" mb={1} textTransform="uppercase" letterSpacing="0.05em">Created At</Text>
                <Text fontSize="xs" color="whiteAlpha.700">{new Date(task?.createdAt).toLocaleString()}</Text>
              </Box>
            </VStack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function PropertyItem({ label, children }) {
  return (
    <Box>
      <Text fontSize="10px" color="whiteAlpha.400" mb={1.5} textTransform="uppercase" letterSpacing="0.05em" fontWeight="700">
        {label}
      </Text>
      {children}
    </Box>
  );
}

function IconBadge({ icon, color }) {
  return (
    <Flex w={8} h={8} rounded="lg" bg="whiteAlpha.50" align="center" justify="center" color={color}>
      {icon}
    </Flex>
  );
}

import { Flex as Flex_ } from "@chakra-ui/react";
const Flex = Flex_;
