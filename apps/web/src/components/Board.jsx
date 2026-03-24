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
import { Flex } from "@chakra-ui/react";

const DEFAULT_COLUMNS = [
  { id: "TODO", title: "Todo" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export default function Board({ tasks, onTaskUpdate, onColumnReorder }) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
              column={col}
              tasks={tasks.filter((t) => t.status === col.id)}
            />
          ))}
        </SortableContext>
      </Flex>
    </DndContext>
  );
}
