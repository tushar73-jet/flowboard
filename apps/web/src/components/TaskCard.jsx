"use client";
import React, { memo } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Box, Text, Badge, Flex, Avatar, HStack, Tooltip, Checkbox,
  VStack, Icon
} from "@chakra-ui/react";
import { Clock, CheckSquare, MessageSquare, AlertTriangle, ArrowRight } from "lucide-react";

const PRIORITY_CONFIG = {
  HIGH: {
    color: "red",
    glow: "rgba(248,113,113,0.25)",
    border: "rgba(248,113,113,0.4)",
    icon: <AlertTriangle size={9} />,
    pulse: true,
  },
  MEDIUM: {
    color: "yellow",
    glow: "rgba(251,191,36,0.15)",
    border: "rgba(251,191,36,0.3)",
    icon: null,
    pulse: false,
  },
  LOW: {
    color: "green",
    glow: null,
    border: null,
    icon: null,
    pulse: false,
  },
};

export default memo(function TaskCard({ task, onOpen, members, selectionMode, isSelected, onToggleSelect }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
    disabled: selectionMode,
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityConf = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.LOW;
  const assignee = members?.find(m => m.userId === task.assigneeId)?.user;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const commentCount = task.comments?.length || 0;
  const subtaskDone = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const subtaskTotal = task.subtasks?.length || 0;

  const handleClick = () => {
    if (selectionMode) onToggleSelect?.(task.id);
    else onOpen(task);
  };

  return (
    <Tooltip
      isDisabled={selectionMode}
      placement="right"
      hasArrow
      openDelay={600}
      bg="#0f172a"
      border="1px solid"
      borderColor="whiteAlpha.100"
      rounded="xl"
      p={3}
      maxW="240px"
      label={
        <VStack align="start" spacing={2}>
          <Text fontSize="xs" fontWeight="700" color="white" noOfLines={2}>{task.title}</Text>
          {task.description && (
            <Text fontSize="xs" color="whiteAlpha.600" noOfLines={2} lineHeight="1.6">{task.description}</Text>
          )}
          <HStack spacing={3}>
            {subtaskTotal > 0 && (
              <HStack spacing={1} color="whiteAlpha.500">
                <CheckSquare size={10} />
                <Text fontSize="10px">{subtaskDone}/{subtaskTotal} subtasks</Text>
              </HStack>
            )}
            {commentCount > 0 && (
              <HStack spacing={1} color="whiteAlpha.500">
                <MessageSquare size={10} />
                <Text fontSize="10px">{commentCount} comments</Text>
              </HStack>
            )}
          </HStack>
          <HStack spacing={1} color="brand.400">
            <Text fontSize="10px" fontWeight="600">Click to open</Text>
            <ArrowRight size={9} />
          </HStack>
        </VStack>
      }
    >
      <Box
        ref={setNodeRef}
        style={style}
        {...(selectionMode ? {} : { ...attributes, ...listeners })}
        onClick={handleClick}
        bg={isSelected ? "rgba(99,102,241,0.15)" : isDragging ? "rgba(99,102,241,0.12)" : "rgba(30,41,59,0.85)"}
        p={4}
        rounded="xl"
        borderWidth="1px"
        borderColor={
          isSelected ? "brand.500"
            : isDragging ? "brand.500"
              : priorityConf.border && task.priority === "HIGH"
                ? "rgba(248,113,113,0.25)"
                : "whiteAlpha.100"
        }
        boxShadow={
          isDragging ? "0 24px 60px rgba(99,102,241,0.5)"
            : isSelected ? "0 0 0 2px rgba(99,102,241,0.5)"
              : task.priority === "HIGH" ? `0 0 16px ${priorityConf.glow}`
                : "sm"
        }
        cursor={selectionMode ? "pointer" : "grab"}
        transition="all 0.18s"
        position="relative"
        opacity={isDragging ? 0.6 : 1}
        transform={isDragging ? "rotate(2deg) scale(1.04)" : "none"}
        role="group"
        _hover={!selectionMode ? {
          transform: "translateY(-3px)",
          borderColor: task.priority === "HIGH" ? "red.400" : "brand.500",
          boxShadow: task.priority === "HIGH"
            ? `0 8px 32px ${priorityConf.glow}`
            : "0 8px 32px rgba(99,102,241,0.2)",
          bg: "rgba(30,41,59,0.98)",
        } : {}}
      >
        {/* Priority HIGH pulse dot */}
        {task.priority === "HIGH" && !selectionMode && (
          <Box
            position="absolute"
            top={3}
            right={3}
            w={2}
            h={2}
            rounded="full"
            bg="red.400"
            sx={{
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1, transform: "scale(1)" },
                "50%": { opacity: 0.5, transform: "scale(1.6)" },
              },
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
        )}

        {/* Selection checkbox */}
        {selectionMode && (
          <Box position="absolute" top={3} right={3} zIndex={1}>
            <Checkbox
              isChecked={isSelected}
              colorScheme="brand"
              size="sm"
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(task.id); }}
              onChange={() => { }}
            />
          </Box>
        )}

        {/* Labels row */}
        {task.labels?.length > 0 && (
          <Flex wrap="wrap" gap={1} mb={3}>
            {task.labels.map(label => (
              <Tooltip key={label.id} label={label.name} hasArrow placement="top">
                <Box h="5px" w="20px" bg={label.color} rounded="full" />
              </Tooltip>
            ))}
          </Flex>
        )}

        <Text fontWeight="700" fontSize="sm" mb={1} color="whiteAlpha.950" noOfLines={2} pr={task.priority === "HIGH" ? 6 : 0} lineHeight="1.4">
          {task.title}
        </Text>
        {task.description && (
          <Text fontSize="xs" color="whiteAlpha.500" noOfLines={2} mb={3} lineHeight="1.6">
            {task.description}
          </Text>
        )}

        <Flex justify="space-between" align="center" mt={3}>
          <HStack spacing={2} flexWrap="wrap">
            <Badge
              colorScheme={priorityConf.color}
              fontSize="9px"
              variant="subtle"
              rounded="md"
              px={2}
              py={0.5}
              display="flex"
              alignItems="center"
              gap="4px"
            >
              {priorityConf.icon}
              {task.priority}
            </Badge>

            {task.dueDate && (
              <HStack
                spacing={1}
                color={isOverdue ? "red.400" : "whiteAlpha.500"}
                bg={isOverdue ? "rgba(248,113,113,0.1)" : "transparent"}
                px={1.5}
                py={0.5}
                rounded="md"
              >
                <Clock size={10} />
                <Text fontSize="10px" fontWeight="600">
                  {new Date(task.dueDate).toLocaleDateString([], { month: "short", day: "numeric" })}
                </Text>
              </HStack>
            )}

            {subtaskTotal > 0 && (
              <HStack
                spacing={1}
                color={subtaskDone === subtaskTotal ? "green.400" : "whiteAlpha.400"}
              >
                <CheckSquare size={10} />
                <Text fontSize="10px" fontWeight="600">{subtaskDone}/{subtaskTotal}</Text>
              </HStack>
            )}

            {commentCount > 0 && (
              <HStack spacing={1} color="whiteAlpha.400">
                <MessageSquare size={10} />
                <Text fontSize="10px" fontWeight="500">{commentCount}</Text>
              </HStack>
            )}
          </HStack>

          <Tooltip label={assignee?.name || "Unassigned"} hasArrow placement="top">
            <Avatar
              size="2xs"
              name={assignee?.name}
              src={assignee?.avatarUrl}
              borderWidth="2px"
              borderColor={isOverdue ? "red.400" : "transparent"}
            />
          </Tooltip>
        </Flex>
      </Box>
    </Tooltip>
  );
});
