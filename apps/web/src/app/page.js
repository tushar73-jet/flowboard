"use client";
import Link from "next/link";
import { Flex, Heading, Text, Button, VStack, Box, Spinner, HStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import api from "@/lib/api";

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const { data } = await api.get('/projects');
        setProjects(data);
      } catch (e) {
        console.error("Failed to load projects", e);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

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
      <Box position="absolute" top={6} right={8}>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Box>

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

      <SignedOut>
        <HStack spacing={4} mt={8}>
          <SignInButton mode="modal">
            <Button size="lg" colorScheme="brand" px={8} rounded="xl">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button size="lg" variant="outline" borderColor="brand.500" color="brand.400" _hover={{ bg: "whiteAlpha.200" }} px={8} rounded="xl">
              Sign Up
            </Button>
          </SignUpButton>
        </HStack>
      </SignedOut>

      <SignedIn>
        <Box mt={8} w="full" maxW="md">
          <Heading size="md" mb={6} color="whiteAlpha.800">Your Projects</Heading>
          {loading ? (
            <Spinner color="brand.500" />
          ) : projects.length === 0 ? (
            <Text color="whiteAlpha.500">No projects found. Please run the seed script!</Text>
          ) : (
            <VStack spacing={4} align="stretch">
              {projects.map((proj) => (
                <Button 
                  key={proj.id}
                  as={Link} 
                  href={`/dashboard/board/${proj.id}`}
                  size="lg" 
                  colorScheme="brand" 
                  variant="outline"
                  rounded="xl"
                  justifyContent="space-between"
                  _hover={{ transform: "translateY(-2px)", bg: "brand.900", color: "white" }}
                >
                  <span>{proj.name}</span>
                  <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>Open Board →</span>
                </Button>
              ))}
            </VStack>
          )}
        </Box>
      </SignedIn>
    </Flex>
  );
}
