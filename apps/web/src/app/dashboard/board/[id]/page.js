"use client";
import React from "react";
import { useTasks } from "@/hooks/useTasks";
import Board from "@/components/Board";
import { useParams } from "next/navigation";
import { Box, Flex, Spinner, Text, Heading, HStack, Badge } from "@chakra-ui/react";
import { useDashboard } from "@/app/dashboard/layout";

export default function BoardPage() {
  const params = useParams();
  const projectId = params.id;
  const { data: tasks, isLoading, isError, updateTaskMutation, addTaskMutation } = useTasks(projectId);
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

  const handleAddTask = (status) => {
    if (!canAddTasks) {
      window.alert("Only Owners and Admins can create tasks.");
      return;
    }
    const title = window.prompt("Task Title:");
    if (!title) return;
    addTaskMutation.mutate({ title, description: "", status, priority: "MEDIUM" });
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
        <HStack spacing={3}>
          <Heading size="md" color="white" fontWeight="600">
            {project?.name || "Project Board"}
          </Heading>
          <Badge colorScheme="brand" variant="subtle" fontSize="0.65rem">
            {(tasks || []).length} tasks
          </Badge>
        </HStack>

        <HStack spacing={3}>
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
