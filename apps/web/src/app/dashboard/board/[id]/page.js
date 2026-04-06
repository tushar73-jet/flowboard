"use client";
import React, { useState } from "react";
import { useTasks } from "@/hooks/useTasks";
import Board from "@/components/Board";
import { useParams } from "next/navigation";
import { Box, Flex, Spinner, Text, Heading, HStack, Badge, Input, Select, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { useDashboard } from "@/app/dashboard/layout";
import { Search, Filter } from "lucide-react";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id;
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const { data: tasks, isLoading, isError, updateTaskMutation, addTaskMutation } = useTasks(projectId, { search, priority, status });
  const { projects, members, myRole } = useDashboard();

  const project = projects?.find(p => p.id === projectId);
  const canAddTasks = myRole === "OWNER" || myRole === "ADMIN";

  if (isLoading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Flex h="100vh" align="center" justify="center" direction="column" gap={3}>
        <Text color="red.400" fontSize="lg" fontWeight="600">Error loading board</Text>
        <Text color="whiteAlpha.500" fontSize="sm">Check your connection and try refreshing.</Text>
      </Flex>
    );
  }

  const handleAddTask = (status, title) => {
    if (!canAddTasks) return; // Column already hides the button for non-admins
    if (!title?.trim()) return;
    addTaskMutation.mutate({ title: title.trim(), description: "", status, priority: "MEDIUM" });
  };

  return (
    <Box minH="100vh" bg="#0b1120">
      {/* Board Header */}
      <Flex
        as="header"
        px={8}
        py={4}
        borderBottomWidth="1px"
        borderColor="whiteAlpha.100"
        bg="rgba(11, 17, 32, 0.8)"
        backdropFilter="blur(10px)"
        position="sticky"
        top={0}
        zIndex={10}
        align="center"
        justify="space-between"
      >
        <HStack spacing={6} flex="1">
          <Heading size="md" color="white" fontWeight="600" minW="fit-content">
            {project?.name || "Project Board"}
          </Heading>

          <InputGroup maxW="300px" size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={14} color="#64748b" />
            </InputLeftElement>
            <Input
              placeholder="Search tasks..."
              bg="whiteAlpha.50"
              border="1px solid"
              borderColor="whiteAlpha.100"
              _focus={{ borderColor: "brand.500", bg: "whiteAlpha.100" }}
              rounded="lg"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <HStack spacing={3}>
            <Select
              size="sm"
              placeholder="Priority"
              maxW="120px"
              rounded="lg"
              bg="#1e293b"
              borderColor="whiteAlpha.100"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>

            <Select
              size="sm"
              placeholder="Status"
              maxW="120px"
              rounded="lg"
              bg="#1e293b"
              borderColor="whiteAlpha.100"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="TODO">Todo</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </Select>
          </HStack>
        </HStack>

        <HStack spacing={3}>
          <Badge colorScheme="brand" variant="subtle" fontSize="0.65rem" px={2} py={1} rounded="md">
            {(tasks || []).length} tasks
          </Badge>
          {!canAddTasks && (
            <Badge colorScheme="gray" fontSize="xs" px={2} py={1} rounded="md">
              View only
            </Badge>
          )}
        </HStack>
      </Flex>

      <Board
        tasks={tasks || []}
        members={members || []}
        onTaskUpdate={(updatedTask) => updateTaskMutation.mutate(updatedTask)}
        onAddTask={handleAddTask}
        onColumnReorder={(newColumns) => {
          console.log("Saving new column order:", newColumns);
        }}
      />
    </Box>
  );
}
