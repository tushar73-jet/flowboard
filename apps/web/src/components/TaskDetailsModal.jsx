"use client";
import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  VStack, HStack, Text, Box, Input, Textarea, Select, Button,
  Divider, Avatar, Menu, MenuButton, MenuList, MenuItem,
  useToast, Flex, Badge, Popover, PopoverTrigger, PopoverContent, PopoverBody, PopoverHeader, IconButton, Checkbox, Tooltip, Tag, TagLabel, TagRightIcon, SimpleGrid
} from "@chakra-ui/react";
import {
  ChevronDown,
  Trash2, MessageSquare, CheckCircle2, Plus, Calendar, Tag as TagIcon, X, Check
} from "lucide-react";
import api from "@/lib/api";
import { useLabels } from "@/hooks/useLabels";
import { useDashboard } from "@/app/dashboard/layout";

export default function TaskDetailsModal({
  isOpen, onClose, task, members, onUpdate, onDelete
}) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "TODO");
  const [priority, setPriority] = useState(task?.priority || "MEDIUM");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || "");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.split("T")[0] : "");
  const [selectedLabels, setSelectedLabels] = useState(task?.labels || []);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const { selectedWorkspaceId } = useDashboard();
  const { data: workspaceLabels = [], createLabelMutation } = useLabels(selectedWorkspaceId);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#6366f1");

  const toast = useToast();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assigneeId || "");
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
      setSelectedLabels(task.labels || []);
      setSubtasks(task.subtasks || []);
      // Fetch comments when task opens
      api.get(`/comments?taskId=${task.id}`).then(({ data }) => setComments(data)).catch(() => {});
    }
  }, [task]);

  const handleUpdate = async () => {
    try {
      onUpdate({
        ...task,
        title,
        description,
        status,
        priority,
        dueDate: dueDate || null,
        assigneeId: assigneeId || null
      });

      await api.put(`/tasks/${task.id}/labels`, { labelIds: selectedLabels.map(l => l.id) });

      toast({
        title: "Task updated",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Failed to save changes",
        description: err?.response?.data?.error || err.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const toggleLabel = (label) => {
    setSelectedLabels(prev => 
      prev.find(l => l.id === label.id) 
        ? prev.filter(l => l.id !== label.id)
        : [...prev, label]
    );
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    const res = await createLabelMutation.mutateAsync({ name: newLabelName.trim(), color: newLabelColor });
    setNewLabelName("");
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

  const handleAddComment = async (e) => {
    if (e.key !== "Enter" || !newComment.trim()) return;
    const { data } = await api.post("/comments", { taskId: task.id, content: newComment.trim() });
    setComments((prev) => [...prev, data]);
    setNewComment("");
  };

  const handleDeleteComment = async (id) => {
    await api.delete(`/comments/${id}`);
    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  const selectedAssignee = members.find(m => m.userId === assigneeId)?.user;

  const priorityColors = {
    HIGH: "red",
    MEDIUM: "yellow",
    LOW: "green"
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" key={task?.id}>
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

              {/* Comments */}
              <Box>
                <HStack mb={2} spacing={2} color="whiteAlpha.500">
                  <MessageSquare size={14} />
                  <Text fontSize="xs" fontWeight="700" textTransform="uppercase">Comments</Text>
                </HStack>

                <VStack align="stretch" spacing={2} mb={2} maxH="160px" overflowY="auto">
                  {comments.map((c) => (
                    <HStack key={c.id} align="flex-start" spacing={2} px={2} py={1} rounded="lg" _hover={{ bg: "whiteAlpha.50" }}>
                      <Avatar size="xs" name={c.user?.name} mt="2px" />
                      <Box flex="1">
                        <HStack spacing={2} mb={0.5}>
                          <Text fontSize="xs" fontWeight="600" color="whiteAlpha.800">{c.user?.name}</Text>
                          <Text fontSize="10px" color="whiteAlpha.400">{new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Text>
                        </HStack>
                        <Text fontSize="sm" color="whiteAlpha.700">{c.content}</Text>
                      </Box>
                      <IconButton icon={<Trash2 size={12} />} size="xs" variant="ghost" colorScheme="red" aria-label="delete" onClick={() => handleDeleteComment(c.id)} />
                    </HStack>
                  ))}
                  {comments.length === 0 && <Text fontSize="xs" color="whiteAlpha.400" px={2}>No comments yet</Text>}
                </VStack>

                <HStack bg="whiteAlpha.50" px={3} py={1} rounded="lg">
                  <MessageSquare size={13} color="#64748b" />
                  <Input
                    variant="unstyled"
                    fontSize="sm"
                    placeholder="Add comment, press Enter"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={handleAddComment}
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
                  <MenuButton as={Button} size="sm" variant="outline" w="full" borderColor="whiteAlpha.100" fontSize="xs" textAlign="left" px={2} _active={{bg: "whiteAlpha.100"}} _hover={{bg: "whiteAlpha.50"}}>
                    <HStack spacing={2}>
                      <Avatar size="xs" name={selectedAssignee?.name} src={selectedAssignee?.avatarUrl} />
                      <Text noOfLines={1}>{selectedAssignee?.name || "Unassigned"}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList bg="#1e293b" borderColor="whiteAlpha.100" maxH="200px" overflowY="auto" zIndex={100}>
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

              <PropertyItem label="Due Date">
                <HStack bg="whiteAlpha.50" rounded="lg" px={3} py={1.5} border="1px solid" borderColor="whiteAlpha.100">
                  <Calendar size={14} color="#94a3b8" />
                  <Input
                    type="date"
                    size="xs"
                    variant="unstyled"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    color="whiteAlpha.800"
                    sx={{
                      '&::-webkit-calendar-picker-indicator': {
                        filter: 'invert(1)',
                        opacity: 0.5,
                        cursor: 'pointer'
                      }
                    }}
                  />
                </HStack>
              </PropertyItem>

              <PropertyItem label="Labels">
                <Flex flexWrap="wrap" gap={1} mb={2}>
                  {selectedLabels.map(l => (
                    <Tag key={l.id} size="sm" bg={l.color} color="white" rounded="md" variant="subtle">
                      <TagLabel fontSize="10px" fontWeight="700">{l.name}</TagLabel>
                      <TagRightIcon as={X} size={10} cursor="pointer" onClick={() => toggleLabel(l)} />
                    </Tag>
                  ))}
                </Flex>
                
                <Popover placement="bottom-start">
                  <PopoverTrigger>
                    <Button size="xs" variant="outline" leftIcon={<Plus size={12} />} w="full" borderColor="whiteAlpha.100" _hover={{bg:"whiteAlpha.50"}}>
                      Add Labels
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent bg="#1e293b" borderColor="whiteAlpha.100" p={2} zIndex={100} w="220px">
                    <PopoverHeader border="none" pb={2} px={1}>
                      <Text fontSize="xs" fontWeight="700" color="whiteAlpha.600">Labels</Text>
                    </PopoverHeader>
                    <PopoverBody px={1}>
                      <VStack align="stretch" spacing={1} maxH="150px" overflowY="auto" mb={3}>
                        {workspaceLabels.map(l => (
                          <HStack 
                            key={l.id} 
                            px={2} py={1.5} rounded="md" 
                            cursor="pointer" 
                            bg={selectedLabels.find(sl => sl.id === l.id) ? "brand.500" : "transparent"}
                            _hover={{bg: selectedLabels.find(sl => sl.id === l.id) ? "brand.600" : "whiteAlpha.100"}}
                            onClick={() => toggleLabel(l)}
                            justify="space-between"
                          >
                            <HStack>
                              <Box w={3} h={3} rounded="full" bg={l.color} />
                              <Text fontSize="xs" color="white">{l.name}</Text>
                            </HStack>
                            {selectedLabels.find(sl => sl.id === l.id) && <Check size={12} color="white" />}
                          </HStack>
                        ))}
                      </VStack>
                      
                      <Divider borderColor="whiteAlpha.100" mb={3} />
                      
                      <VStack spacing={2}>
                        <Input 
                          placeholder="New label..." size="xs" bg="whiteAlpha.50" 
                          borderColor="whiteAlpha.100" value={newLabelName} 
                          onChange={(e) => setNewLabelName(e.target.value)}
                        />
                        <HStack w="full">
                           <Input 
                            type="color" size="xs" w="40px" p={0} bg="transparent" border="none" 
                            value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)}
                           />
                           <Button size="xs" colorScheme="brand" w="full" onClick={handleCreateLabel}>Create</Button>
                        </HStack>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </PropertyItem>

              <Divider borderColor="whiteAlpha.100" />

              <Box>
                <Text fontSize="10px" color="whiteAlpha.400" mb={1} textTransform="uppercase" letterSpacing="0.05em">Created At</Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {task?.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
                </Text>
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
