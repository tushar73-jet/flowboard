"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Text, Badge, Flex, Icon, Avatar, HStack, Tooltip } from "@chakra-ui/react";
import { Clock } from "lucide-react";

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
      
      <Flex justify="space-between" align="center">
        <HStack spacing={2}>
          <Badge colorScheme={priorityColor} fontSize="9px" variant="subtle" rounded="md" px={2} py={0.5}>
            {task.priority}
          </Badge>
          {assignee && (
            <Tooltip label={assignee.name} hasArrow>
              <Avatar size="2xs" name={assignee.name} src={assignee.avatarUrl} />
            </Tooltip>
          )}
        </HStack>
        
        <Flex align="center" gap={1} color="whiteAlpha.500" fontSize="10px">
          <Icon as={Clock} boxSize={3} />
          {new Date(task.updatedAt).toLocaleDateString()}
        </Flex>
      </Flex>
    </Box>
  );
}
