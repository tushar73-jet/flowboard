"use client";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Box, Flex, Heading, Badge, IconButton, Button, VStack, Input, HStack } from "@chakra-ui/react";
import { MoreHorizontal, Plus, X } from "lucide-react";

export default function Column({ column, tasks }) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
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
      <Flex {...attributes} {...listeners} justify="space-between" align="center" mb={4} px={2} cursor="grab">
        <Flex align="center" gap={2}>
          <Heading size="sm" textTransform="uppercase" letterSpacing="wide" color="whiteAlpha.700">
            {column.title}
          </Heading>
          <Badge bg="whiteAlpha.200" color="whiteAlpha.800" rounded="full" px={2}>
            {tasks.length}
          </Badge>
        </Flex>
        <IconButton
          icon={<MoreHorizontal size={18} />}
          variant="ghost"
          size="sm"
          color="whiteAlpha.600"
          _hover={{ bg: "whiteAlpha.100" }}
          aria-label="Column options"
        />
      </Flex>

      <VStack flex={1} spacing={3} align="stretch" minH="100px">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onOpen={column.onTaskOpen}
              members={column.members}
            />
          ))}
        </SortableContext>
      </VStack>

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
