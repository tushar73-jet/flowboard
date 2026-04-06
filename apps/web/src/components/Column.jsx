"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Box, Flex, Heading, Badge, IconButton, Button, VStack, Input, HStack, Tooltip, Text } from "@chakra-ui/react";
import { MoreHorizontal, Plus, X, ArrowUpDown } from "lucide-react";

const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

const COLUMN_ACCENT = {
  TODO: "whiteAlpha.500",
  IN_PROGRESS: "blue.400",
  DONE: "green.400",
};

export default function Column({ column, tasks, selectionMode, selectedTaskIds, onToggleSelect }) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [sortByPriority, setSortByPriority] = useState(false);
  const inputRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  const handleSubmit = () => {
    if (title.trim() && column.onAddTask) {
      column.onAddTask(column.id, title.trim());
    }
    setTitle("");
    setAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") { setAdding(false); setTitle(""); }
  };

  const displayTasks = sortByPriority
    ? [...tasks].sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99))
    : tasks;

  const highCount = tasks.filter(t => t.priority === "HIGH").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;
  const accentColor = COLUMN_ACCENT[column.id] || "whiteAlpha.500";

  return (
    <Box
      ref={setNodeRef}
      style={style}
      bg="surface"
      backdropFilter="blur(8px)"
      w="300px"
      minW="300px"
      display="flex"
      flexDirection="column"
      p={4}
      rounded="2xl"
      borderWidth="1px"
      borderColor="whiteAlpha.100"
      boxShadow="xl"
    >
      {/* Column header */}
      <Flex {...attributes} {...listeners} justify="space-between" align="center" mb={1} px={2} cursor="grab">
        <Flex align="center" gap={2}>
          <Box w={2} h={2} rounded="full" bg={accentColor} flexShrink={0} />
          <Heading size="sm" textTransform="uppercase" letterSpacing="wide" color="whiteAlpha.700">
            {column.title}
          </Heading>
          <Badge bg="whiteAlpha.200" color="whiteAlpha.800" rounded="full" px={2} fontSize="xs">
            {tasks.length}
          </Badge>
        </Flex>
        <HStack spacing={0}>
          <Tooltip label={sortByPriority ? "Clear priority sort" : "Sort by priority"} hasArrow placement="top">
            <IconButton
              icon={<ArrowUpDown size={13} />}
              variant="ghost"
              size="xs"
              color={sortByPriority ? "brand.400" : "whiteAlpha.400"}
              bg={sortByPriority ? "rgba(99,102,241,0.1)" : "transparent"}
              _hover={{ bg: "whiteAlpha.100", color: "white" }}
              aria-label="Sort by priority"
              onClick={() => setSortByPriority(p => !p)}
            />
          </Tooltip>
          <IconButton
            icon={<MoreHorizontal size={16} />}
            variant="ghost"
            size="xs"
            color="whiteAlpha.400"
            _hover={{ bg: "whiteAlpha.100" }}
            aria-label="Column options"
          />
        </HStack>
      </Flex>

      {/* Per-column breakdown stats */}
      {tasks.length > 0 && (
        <HStack px={2} mb={3} spacing={3} h="14px">
          {highCount > 0 && (
            <HStack spacing={1}>
              <Box w={1.5} h={1.5} rounded="full" bg="red.400" />
              <Text fontSize="10px" color="red.400" fontWeight="600">{highCount} high</Text>
            </HStack>
          )}
          {column.id === "IN_PROGRESS" && tasks.length > 0 && (
            <Text fontSize="10px" color="blue.400" fontWeight="600">{tasks.length} active</Text>
          )}
          {column.id === "DONE" && (
            <HStack spacing={1}>
              <Box w={1.5} h={1.5} rounded="full" bg="green.400" />
              <Text fontSize="10px" color="green.400" fontWeight="600">all done</Text>
            </HStack>
          )}
          {sortByPriority && (
            <Text fontSize="10px" color="brand.400" fontWeight="600">↑ priority</Text>
          )}
        </HStack>
      )}

      {/* Task list */}
      <VStack flex={1} spacing={3} align="stretch" minH="100px">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {displayTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={column.onTaskOpen}
              members={column.members}
              selectionMode={selectionMode}
              isSelected={selectedTaskIds?.has(task.id)}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </SortableContext>
      </VStack>

      {/* Add task input */}
      {adding ? (
        <Box mt={4} p={2} bg="whiteAlpha.50" rounded="xl" border="1px solid" borderColor="brand.500">
          <Input
            ref={inputRef}
            variant="unstyled"
            placeholder="Task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            fontSize="sm"
            color="white"
            px={1}
            mb={2}
          />
          <HStack spacing={2}>
            <Button size="xs" colorScheme="brand" onClick={handleSubmit} isDisabled={!title.trim()}>
              Add
            </Button>
            <IconButton
              icon={<X size={14} />}
              size="xs"
              variant="ghost"
              colorScheme="whiteAlpha"
              aria-label="Cancel"
              onClick={() => { setAdding(false); setTitle(""); }}
            />
          </HStack>
        </Box>
      ) : (
        <Button
          mt={4}
          variant="outline"
          borderStyle="dashed"
          borderColor="whiteAlpha.300"
          color="whiteAlpha.600"
          _hover={{ bg: "whiteAlpha.100", color: "white" }}
          leftIcon={<Plus size={16} />}
          size="sm"
          w="full"
          onClick={() => setAdding(true)}
        >
          New Task
        </Button>
      )}
    </Box>
  );
}
