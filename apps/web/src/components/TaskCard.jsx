"use client";
import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box, Text, Badge, Flex, Avatar, HStack, Tooltip, Checkbox } from "@chakra-ui/react";
import { Clock, CheckSquare } from "lucide-react";

export default memo(function TaskCard({ task, onOpen, members, selectionMode, isSelected, onToggleSelect }) {
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
    disabled: selectionMode,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    rotate: isDragging ? '2deg' : '0deg',
    scale: isDragging ? 1.05 : 1,
    boxShadow: isDragging 
      ? '0 20px 60px rgba(99,102,241,0.4)' 
      : 'sm'
  };

  const priorityColor = {
    HIGH: "red",
    MEDIUM: "yellow",
    LOW: "green",
  }[task.priority] || "gray";

  const assignee = members?.find(m => m.userId === task.assigneeId)?.user;

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect?.(task.id);
    } else {
      onOpen(task);
    }
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...(selectionMode ? {} : { ...attributes, ...listeners })}
      onClick={handleClick}
      bg={isSelected ? "rgba(99,102,241,0.15)" : "card"}
      p={4}
      rounded="xl"
      borderWidth="1px"
      borderColor={isSelected ? "brand.500" : isDragging ? "brand.500" : "whiteAlpha.100"}
      boxShadow={isSelected ? "0 0 0 2px rgba(99,102,241,0.4)" : "sm"}
      cursor={selectionMode ? "pointer" : "grab"}
      transition="all 0.15s"
      position="relative"
      _hover={{
        transform: selectionMode ? "none" : "translateY(-2px)",
        borderColor: "brand.500",
        boxShadow: isSelected ? "0 0 0 2px rgba(99,102,241,0.6)" : "md",
        bg: isSelected ? "rgba(99,102,241,0.2)" : "rgba(51,65,85,0.9)",
      }}
    >
      {/* Selection checkbox */}
      {selectionMode && (
        <Box position="absolute" top={3} right={3} zIndex={1}>
          <Checkbox
            isChecked={isSelected}
            colorScheme="brand"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onToggleSelect?.(task.id); }}
            onChange={() => {}}
          />
        </Box>
      )}

      <Text fontWeight="600" fontSize="sm" mb={1} color="whiteAlpha.900" noOfLines={2} pr={selectionMode ? 6 : 0}>
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
              bg={new Date(task.dueDate) < new Date() ? "rgba(248,113,113,0.1)" : "transparent"}
              px={1}
              rounded="md"
            >
              <Clock size={11} />
              <Text fontSize="10px" fontWeight="600">
                {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
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
});
