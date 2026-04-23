"use client";
import React, { useState, useRef, useCallback } from "react";
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
import TaskCard from "./TaskCard";
import TaskDetailsModal from "./TaskDetailsModal";
import {
  Flex, useDisclosure,
  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter,
  Button, Icon, Box, VStack, Heading, Text, HStack,
  Menu, MenuButton, MenuList, MenuItem,
  Tabs, TabList, TabPanels, Tab, TabPanel, Badge, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Kbd
} from "@chakra-ui/react";
import { Box as BoxIcon, Plus, CheckSquare, ChevronDown, X, Trash2 } from "lucide-react";
import { useHotkeys } from 'react-hotkeys-hook';
import { KeyboardShortcutsModal } from "./KeyboardShortcutsModal";
import api from "@/lib/api";
import { useCustomToast } from "@/hooks/useCustomToast";
import { ColumnSkeleton } from "@/components/Skeletons";
import EmptyState from "./EmptyState";

const DEFAULT_COLUMNS = [
  { id: "TODO", title: "Todo" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export default function Board({ tasks, members, onTaskUpdate, onTaskDelete, onColumnReorder, onAddTask }) {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [selectedTask, setSelectedTask] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useCustomToast();
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const cancelRef = useRef();

  const [selectedTaskIndex, setSelectedTaskIndex] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useHotkeys('up', () => {
    setSelectedTaskIndex(prev => Math.max(0, prev - 1));
  }, [tasks]);

  useHotkeys('down', () => {
    setSelectedTaskIndex(prev => Math.min(tasks.length - 1, prev + 1));
  }, [tasks]);

  useHotkeys('enter', () => {
    if (tasks[selectedTaskIndex]) {
      handleOpenTask(tasks[selectedTaskIndex]);
    }
  }, [tasks, selectedTaskIndex]);

  useHotkeys('n', () => {
    onAddTask('TODO', '');
  });

  useHotkeys('shift+?', () => setShowShortcuts(true));

  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const bulkCancelRef = useRef();

  const toggleSelectTask = useCallback((taskId) => {
    setSelectedTaskIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }, []);

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedTaskIds(new Set());
  };

  const selectAll = () => {
    setSelectedTaskIds(new Set(tasks.map(t => t.id)));
  };

  const handleBulkMove = async (status) => {
    const tasksToMove = tasks.filter(t => selectedTaskIds.has(t.id) && t.status !== status);
    await Promise.all(tasksToMove.map(t => onTaskUpdate({ ...t, status })));
    toast({ title: `Moved ${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? "s" : ""} to ${status.replace("_", " ")}`, status: "success", duration: 2500 });
    exitSelectionMode();
  };

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true);
    try {
      await Promise.all([...selectedTaskIds].map(id => onTaskDelete(id)));
      toast.deleted(`Deleted ${selectedTaskIds.size} task${selectedTaskIds.size > 1 ? "s" : ""}`);
      exitSelectionMode();
      setBulkDeleteConfirm(false);
    } catch (e) {
      toast.error({ title: "Failed to delete tasks", description: e.message });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleOpenTask = useCallback((task) => {
    setSelectedTask(task);
    onOpen();
  }, [onOpen]);

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await onTaskDelete(taskToDelete);
      onClose();
      setTaskToDelete(null);
      toast.deleted("Task deleted");
    } catch (e) {
      toast.error({ title: "Failed to delete task", description: e.message });
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
      {/* Selection mode toolbar */}
      <Flex
        px={8} py={2.5}
        align="center"
        justify="space-between"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
        bg="rgba(30,41,59,0.6)"
        minH="44px"
      >
        <HStack spacing={3}>
          <Button
            size="xs"
            variant={selectionMode ? "solid" : "ghost"}
            colorScheme={selectionMode ? "brand" : "whiteAlpha"}
            color={selectionMode ? "white" : "whiteAlpha.500"}
            leftIcon={<CheckSquare size={12} />}
            onClick={() => { setSelectionMode(s => !s); setSelectedTaskIds(new Set()); }}
            _hover={{ bg: selectionMode ? "brand.600" : "whiteAlpha.100", color: "white" }}
          >
            {selectionMode ? "Exit Select" : "Select Tasks"}
          </Button>
          {selectionMode && (
            <HStack spacing={2}>
              <Text fontSize="xs" color="brand.300" fontWeight="600">
                {selectedTaskIds.size} selected
              </Text>
              <Button size="xs" variant="ghost" color="whiteAlpha.400" onClick={selectAll} _hover={{ color: "white" }}>
                Select all
              </Button>
            </HStack>
          )}
        </HStack>

        {selectionMode && tasks.length > 0 && (
          <Text fontSize="10px" color="whiteAlpha.300">
            Click tasks to select · drag disabled
          </Text>
        )}
      </Flex>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragEnd={onDragEnd}
      >
        <Box w="full">
          {/* Desktop View */}
          <Flex
            display={{ base: "none", lg: "flex" }}
            gap={6}
            p={8}
            overflowX="auto"
            minH="calc(100vh - 130px)"
            alignItems="flex-start"
            sx={{
              "&::-webkit-scrollbar": { height: "8px" },
              "&::-webkit-scrollbar-track": { background: "transparent" },
              "&::-webkit-scrollbar-thumb": { background: "whiteAlpha.300", borderRadius: "4px" },
            }}
          >
            {tasks.length === 0 ? (
              <Box w="full" py={20}>
                <EmptyState
                  icon={BoxIcon}
                  title="No tasks found"
                  description="Try adjusting your filters or create a new task to get started."
                  actionLabel="Create New Task"
                  onAction={() => onAddTask("TODO", "New Task")}
                  size="lg"
                />
              </Box>
            ) : (
              <SortableContext
                items={columns.map((c) => c.id)}
                strategy={horizontalListSortingStrategy}
              >
                {columns.map((col) => (
                  <Column
                    key={col.id}
                    column={{ ...col, onAddTask, onTaskOpen: handleOpenTask, members }}
                    tasks={tasks.filter((t) => t.status === col.id)}
                    selectionMode={selectionMode}
                    selectedTaskIds={selectedTaskIds}
                    onToggleSelect={toggleSelectTask}
                    globalTasks={tasks}
                    selectedTaskIndex={selectedTaskIndex}
                  />
                ))}
              </SortableContext>
            )}
          </Flex>

          {/* Mobile View */}
          <Box display={{ base: "block", lg: "none" }} w="full">
            <Tabs variant="soft-rounded" colorScheme="brand" w="full">
              <TabList px={4} pt={4} overflowX="auto" sx={{ '&::-webkit-scrollbar': { display: 'none' } }}>
                {columns.map(col => (
                  <Tab key={col.id} minW="fit-content">
                    {col.title}
                    <Badge ml={2} colorScheme="brand">{tasks.filter(t => t.status === col.id).length}</Badge>
                  </Tab>
                ))}
              </TabList>

              <TabPanels>
                {columns.map(col => (
                  <TabPanel key={col.id} px={4} py={4}>
                    <VStack spacing={3} align="stretch">
                      {tasks
                        .filter(t => t.status === col.id)
                        .map((task) => {
                          const isSelectedHotKey = tasks[selectedTaskIndex]?.id === task.id;
                          return (
                            <Box
                              key={task.id}
                              tabIndex={0}
                              outline={isSelectedHotKey ? '2px solid' : 'none'}
                              outlineColor="brand.500"
                              outlineOffset={2}
                              rounded="xl"
                            >
                              <TaskCard
                                task={task}
                                onOpen={handleOpenTask}
                                members={members}
                                selectionMode={selectionMode}
                                isSelected={selectedTaskIds.has(task.id)}
                                onToggleSelect={toggleSelectTask}
                              />
                            </Box>
                          );
                        })}
                      {tasks.filter(t => t.status === col.id).length === 0 && (
                        <Text textAlign="center" color="whiteAlpha.500" py={8} fontSize="sm">
                          No tasks in this column.
                        </Text>
                      )}
                      <Button
                        variant="outline"
                        borderStyle="dashed"
                        borderColor="whiteAlpha.300"
                        color="whiteAlpha.600"
                        _hover={{ bg: "whiteAlpha.100", color: "white" }}
                        leftIcon={<Plus size={16} />}
                        size="sm"
                        w="full"
                        onClick={() => onAddTask(col.id, "New Task")}
                      >
                        New Task
                      </Button>
                    </VStack>
                  </TabPanel>
                ))}
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </DndContext>

      {/* Bulk action floating bar */}
      {selectionMode && selectedTaskIds.size > 0 && (
        <Box
          position="fixed"
          bottom={6}
          left="50%"
          transform="translateX(-50%)"
          bg="#1a2235"
          border="1px solid"
          borderColor="brand.500"
          boxShadow="0 8px 32px rgba(99,102,241,0.35)"
          rounded="2xl"
          px={5}
          py={3}
          zIndex={200}
        >
          <HStack spacing={4}>
            <Text fontSize="sm" color="whiteAlpha.700" fontWeight="600" whiteSpace="nowrap">
              {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? "s" : ""} selected
            </Text>
            <HStack spacing={2}>
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  borderColor="whiteAlpha.200"
                  color="white"
                  _hover={{ bg: "whiteAlpha.100" }}
                  rightIcon={<ChevronDown size={13} />}
                >
                  Move to…
                </MenuButton>
                <MenuList bg="#1e293b" borderColor="whiteAlpha.100" zIndex={300}>
                  <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => handleBulkMove("TODO")}>
                    Todo
                  </MenuItem>
                  <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => handleBulkMove("IN_PROGRESS")}>
                    In Progress
                  </MenuItem>
                  <MenuItem bg="transparent" _hover={{ bg: "whiteAlpha.100" }} onClick={() => handleBulkMove("DONE")}>
                    Done
                  </MenuItem>
                </MenuList>
              </Menu>
              <Button
                size="sm"
                colorScheme="red"
                variant="ghost"
                leftIcon={<Trash2 size={14} />}
                onClick={() => setBulkDeleteConfirm(true)}
                _hover={{ bg: "red.500/20" }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                variant="ghost"
                color="whiteAlpha.500"
                leftIcon={<X size={14} />}
                onClick={exitSelectionMode}
                _hover={{ bg: "whiteAlpha.100", color: "white" }}
              >
                Cancel
              </Button>
            </HStack>
          </HStack>
        </Box>
      )}

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

      {/* Single task delete dialog */}
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

      {/* Bulk delete confirmation dialog */}
      <AlertDialog isOpen={bulkDeleteConfirm} leastDestructiveRef={bulkCancelRef} onClose={() => setBulkDeleteConfirm(false)} isCentered blockScrollOnMount={false}>
        <AlertDialogOverlay backdropFilter="blur(4px)" bg="blackAlpha.300" />
        <AlertDialogContent bg="#1e293b" color="white" rounded="xl" mx={4}>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete {selectedTaskIds.size} Tasks</AlertDialogHeader>
          <AlertDialogBody>
            Are you sure? This will permanently delete {selectedTaskIds.size} task{selectedTaskIds.size > 1 ? "s" : ""} and all their subtasks and comments.
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={bulkCancelRef} onClick={() => setBulkDeleteConfirm(false)} variant="ghost" _hover={{ bg: "whiteAlpha.100" }}>Cancel</Button>
            <Button colorScheme="red" onClick={handleBulkDelete} isLoading={isBulkDeleting} ml={3}>
              Delete All
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <KeyboardShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </>
  );
}
