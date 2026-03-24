"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Text, Badge, Flex, Icon } from "@chakra-ui/react";
import { Clock } from "lucide-react";

export default function TaskCard({ task }) {
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

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      bg="card"
      p={4}
      rounded="xl"
      borderWidth="1px"
      borderColor={isDragging ? "brand.500" : "whiteAlpha.100"}
      boxShadow="sm"
      cursor="grab"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        borderColor: "brand.500",
        boxShadow: "md",
        bg: "slate.700"
      }}
    >
      <Text fontWeight="medium" fontSize="md" mb={2} color="whiteAlpha.900">
        {task.title}
      </Text>
      <Text fontSize="sm" color="whiteAlpha.600" noOfLines={2} mb={4}>
        {task.description}
      </Text>
      
      <Flex justify="space-between" align="center">
        <Badge colorScheme={priorityColor} fontSize="xs" variant="subtle" rounded="md" px={2}>
          {task.priority}
        </Badge>
        
        <Flex align="center" gap={1} color="whiteAlpha.500" fontSize="xs">
          <Icon as={Clock} boxSize={3} />
          {new Date(task.updatedAt).toLocaleDateString()}
        </Flex>
      </Flex>
    </Box>
  );
}
