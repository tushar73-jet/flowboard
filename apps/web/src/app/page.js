"use client";
import Link from "next/link";
import { Flex, Heading, Text, Button } from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      minH="100vh" 
      p={8} 
      gap={8}
      textAlign="center"
    >
      <Heading 
        as="h1" 
        size="4xl" 
        fontWeight="800" 
        bgGradient="linear(to-r, brand.400, purple.400)" 
        bgClip="text"
      >
        Flowboard
      </Heading>
      
      <Text fontSize="xl" color="whiteAlpha.600" maxW="600px">
        A high-performance project management tool with optimistic UI and drag-and-drop workflow.
      </Text>
      
      <Button 
        as={Link} 
        href="/dashboard/board/demo-project"
        size="lg" 
        colorScheme="brand" 
        rounded="xl"
        px={8}
        boxShadow="0 10px 15px -3px rgba(99, 102, 241, 0.4)"
        _hover={{ transform: "scale(1.05)", bg: "brand.400" }}
      >
        Open Board View
      </Button>
    </Flex>
  );
}
