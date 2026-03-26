"use client";
import React, { useMemo } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Box, Flex, Heading, Badge, IconButton, Button, VStack } from "@chakra-ui/react";
import { MoreHorizontal, Plus } from "lucide-react";

export default function Column({ column, tasks }) {
  const taskIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "Column", column },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
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
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </VStack>

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
        onClick={() => {
          if (column.onAddTask) column.onAddTask(column.id);
        }}
      >
        New Task
      </Button>
    </Box>
  );
}
