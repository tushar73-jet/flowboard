"use client";
import React, { useState } from "react";
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
import { Flex, useDisclosure } from "@chakra-ui/react";
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    onOpen();
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      onClose();
      // On real-time projects, the deletion will be synced via Socket.IO
    } catch (e) {
      window.alert("Failed to delete task: " + e.message);
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
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}
