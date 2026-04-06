"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Text, Badge, Flex, Icon, Avatar, HStack, Tooltip } from "@chakra-ui/react";
import { Clock, CheckSquare } from "lucide-react";

export default function TaskCard({ task, onOpen, members }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
  };

  const priorityColor = {
    HIGH: "red",
    MEDIUM: "yellow",
    LOW: "green",
  }[task.priority] || "gray";

  const assignee = members?.find(m => m.userId === task.assigneeId)?.user;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onOpen(task)}
      bg="card"
      p={4}
      rounded="xl"
      borderWidth="1px"
      borderColor={isDragging ? "brand.500" : "whiteAlpha.100"}
      boxShadow="sm"
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        borderColor: "brand.500",
        boxShadow: "md",
        bg: "slate.700"
      }}
    >
      <Text fontWeight="600" fontSize="sm" mb={1} color="whiteAlpha.900" noOfLines={2}>
        {task.title}
      </Text>
      <Text fontSize="xs" color="whiteAlpha.600" noOfLines={2} mb={4}>
        {task.description || "No description provided."}
      </Text>
      
        <Flex wrap="wrap" gap={1} mb={3}>
          {task.labels?.map(label => (
            <Box 
              key={label.id} 
              h="6px" 
              w="24px" 
              bg={label.color} 
              rounded="full" 
              title={label.name}
            />
          ))}
        </Flex>

        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Badge colorScheme={priorityColor} fontSize="9px" variant="subtle" rounded="md" px={2} py={0.5}>
              {task.priority}
            </Badge>
            {task.dueDate && (
              <HStack 
                spacing={1} 
                color={new Date(task.dueDate) < new Date() ? "red.400" : "whiteAlpha.600"}
                bg={new Date(task.dueDate) < new Date() ? "red.400/10" : "transparent"}
                px={1}
                rounded="md"
              >
                <Clock size={11} />
                <Text fontSize="10px" fontWeight="600">
                  {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </HStack>
            )}
            {task.subtasks?.length > 0 && (
              <HStack spacing={1} color={task.subtasks.every(s => s.isCompleted) ? "green.400" : "whiteAlpha.500"}>
                <CheckSquare size={11} />
                <Text fontSize="10px" fontWeight="600">
                  {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}
                </Text>
              </HStack>
            )}
          </HStack>
          
          <Tooltip label={assignee?.name || "Unassigned"} hasArrow>
            <Avatar size="2xs" name={assignee?.name} src={assignee?.avatarUrl} />
          </Tooltip>
        </Flex>
    </Box>
  );
}
