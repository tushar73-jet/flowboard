"use client";
import React, { useState, useRef } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import Column from "./Column";
import TaskDetailsModal from "./TaskDetailsModal";
import { Flex, useDisclosure, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react";
import api from "@/lib/api";

const DEFAULT_COLUMNS = [
  { id: "TODO", title: "Todo" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export default function Board({ tasks, members, onTaskUpdate, onColumnReorder, onAddTask }) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [selectedTask, setSelectedTask] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      onClose();
      setTaskToDelete(null);
      // On real-time projects, the deletion will be synced via Socket.IO
    } catch (e) {
      toast({ title: "Failed to delete task", description: e.message, status: "error", duration: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const onDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      if (active.data.current?.type === "Column") {
        setColumns((cols) => {
          const oldIndex = cols.findIndex((c) => c.id === active.id);
          const newIndex = cols.findIndex((c) => c.id === over.id);
          const newOrder = arrayMove(cols, oldIndex, newIndex);
          if (onColumnReorder) onColumnReorder(newOrder);
          return newOrder;
        });
      } else if (active.data.current?.type === "Task") {
        const activeTask = active.data.current.task;
        const overId = over.id;

        const overData = over.data.current;
        let newStatus = activeTask.status;

        if (overData?.type === "Column") {
          newStatus = overId;
        } else if (overData?.type === "Task") {
          newStatus = overData.task.status;
        }

        if (newStatus !== activeTask.status) {
          onTaskUpdate({ ...activeTask, status: newStatus });
        }
      }
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <Flex
          gap={6}
          p={8}
          overflowX="auto"
          minH="calc(100vh - 80px)"
          alignItems="flex-start"
          sx={{
            '&::-webkit-scrollbar': { height: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: 'whiteAlpha.300', borderRadius: '4px' },
          }}
        >
          <SortableContext
            items={columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {columns.map((col) => (
              <Column
                key={col.id}
                column={{ ...col, onAddTask, onTaskOpen: handleOpenTask, members }}
                tasks={tasks.filter((t) => t.status === col.id)}
              />
            ))}
          </SortableContext>
        </Flex>
      </DndContext>

      {selectedTask && (
        <TaskDetailsModal
          isOpen={isOpen}
          onClose={onClose}
          task={selectedTask}
          members={members || []}
          onUpdate={onTaskUpdate}
          onDelete={setTaskToDelete}
        />
      )}

      {/* Delete Task Dialog */}
      <AlertDialog isOpen={!!taskToDelete} leastDestructiveRef={cancelRef} onClose={() => setTaskToDelete(null)} isCentered blockScrollOnMount={false}>
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <AlertDialogContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Task</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure you want to delete this task? This action cannot be undone.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={() => setTaskToDelete(null)} variant="ghost" _hover={{ bg: "whiteAlpha.100" }}>Cancel</Button>
            <Button colorScheme="red" onClick={handleDeleteTask} isLoading={isDeleting} ml={3}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
