"use client";
import React from "react";
import { useTasks } from "@/hooks/useTasks";
import Board from "@/components/Board";
import { useParams } from "next/navigation";
import { Box, Flex, Spinner, Text, Heading, Button } from "@chakra-ui/react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BoardPage() {
    const params = useParams();
    const projectId = params.id;
    const { data: tasks, isLoading, isError, updateTaskMutation, addTaskMutation } = useTasks(projectId);

    if (isLoading) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="canvas">
                <Spinner size="xl" color="brand.500" thickness="4px" />
            </Flex>
        );
    }

    if (isError) {
        return (
            <Flex h="100vh" align="center" justify="center" bg="canvas">
                <Text color="red.400" fontSize="lg">
                    Error loading board tasks. Please check your connection.
                </Text>
            </Flex>
        );
    }

    const handleAddTask = (status) => {
        const title = window.prompt("Task Title:");
        if (!title) return;
        addTaskMutation.mutate({ 
            title, 
            description: "", 
            status, 
            priority: "MEDIUM" 
        });
    };

    return (
        <Box minH="100vh" bg="#0f172a">
            <Flex
                as="header"
                p={4}
                px={8}
                borderBottomWidth="1px"
                borderColor="whiteAlpha.100"
                bg="rgba(15, 23, 42, 0.9)"
                backdropFilter="blur(10px)"
                position="sticky"
                top={0}
                zIndex={10}
                justify="space-between"
                align="center"
            >
                <Flex align="center" gap={4}>
                    <Button 
                        as={Link} 
                        href="/" 
                        variant="ghost" 
                        size="sm" 
                        color="whiteAlpha.600"
                        _hover={{ color: "white", bg: "whiteAlpha.100" }}
                        leftIcon={<ArrowLeft size={16} />}
                    >
                        Back
                    </Button>
                    <Box>
                        <Heading size="md" color="whiteAlpha.900">Project Board</Heading>
                        <Text color="whiteAlpha.500" fontSize="xs">ID: {projectId}</Text>
                    </Box>
                </Flex>
            </Flex>

            <Board
                tasks={tasks || []}
                onTaskUpdate={(updatedTask) => updateTaskMutation.mutate(updatedTask)}
                onAddTask={handleAddTask}
                onColumnReorder={(newColumns) => {
                    console.log("Saving new column order:", newColumns);
                }}
            />
        </Box>
    );
}
