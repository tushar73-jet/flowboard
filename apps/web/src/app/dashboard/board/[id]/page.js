"use client";
import React from "react";
import { useTasks } from "@/hooks/useTasks";
import Board from "@/components/Board";
import { useParams } from "next/navigation";
import { Box, Flex, Spinner, Text, Heading } from "@chakra-ui/react";

export default function BoardPage() {
    const params = useParams();
    const projectId = params.id;
    const { data: tasks, isLoading, isError, updateTaskMutation } = useTasks(projectId);

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

    return (
        <Box minH="100vh" bg="canvas">
            <Flex
                as="header"
                p={6}
                borderBottomWidth="1px"
                borderColor="whiteAlpha.100"
                bg="rgba(15, 23, 42, 0.9)"
                backdropFilter="blur(10px)"
                position="sticky"
                top={0}
                zIndex={10}
                direction="column"
                gap={1}
            >
                <Heading size="md" color="whiteAlpha.900">Project Board</Heading>
                <Text color="whiteAlpha.500" fontSize="sm">Project ID: {projectId}</Text>
            </Flex>

            <Board
                tasks={tasks || []}
                onTaskUpdate={(updatedTask) => updateTaskMutation.mutate(updatedTask)}
                onColumnReorder={(newColumns) => {
                    console.log("Saving new column order:", newColumns);
                }}
            />
        </Box>
    );
}
