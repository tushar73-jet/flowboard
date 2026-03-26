"use client";
import Link from "next/link";
import { Flex, Heading, Text, Button, VStack, Box, Spinner, HStack, Select } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { SignInButton, SignUpButton, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import api from "@/lib/api";

export default function Home() {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch workspaces
  useEffect(() => {
    async function loadWorkspaces() {
      try {
        const { data } = await api.get('/workspaces');
        setWorkspaces(data);
        if (data && data.length > 0) {
          setSelectedWorkspace(data[0].id);
        } else {
          setLoading(false); // If no workspaces, stop loading
        }
      } catch (e) {
        console.error("Failed to load workspaces", e);
        setLoading(false);
      }
    }
    loadWorkspaces();
  }, []);

  // 2. Fetch projects for selected workspace
  useEffect(() => {
    if (!selectedWorkspace) return;
    async function loadProjects() {
      setLoading(true);
      try {
        const { data } = await api.get(`/projects?workspaceId=${selectedWorkspace}`);
        setProjects(data);
      } catch (e) {
        console.error("Failed to load projects", e);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, [selectedWorkspace]);

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
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm" color="whiteAlpha.800">Workspace</Heading>
            <Button size="xs" variant="ghost" colorScheme="brand" onClick={async () => {
              const name = window.prompt("Workspace Name:");
              if (name) {
                await api.post('/workspaces', { name });
                const { data } = await api.get('/workspaces');
                setWorkspaces(data);
                if (data.length > 0) setSelectedWorkspace(data[data.length - 1].id);
              }
            }}>+ New Workspace</Button>
          </Flex>

          {workspaces.length > 0 ? (
            <Select 
              mb={6} 
              variant="filled" 
              bg="whiteAlpha.100" 
              _hover={{ bg: "whiteAlpha.200" }}
              value={selectedWorkspace || ""}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id} style={{ background: '#1a202c' }}>
                  {ws.name}
                </option>
              ))}
            </Select>
          ) : (
            <Text mb={6} fontSize="sm" color="whiteAlpha.500">No workspaces yet.</Text>
          )}

          <Flex justify="space-between" align="center" mb={6}>
            <Heading size="md" color="whiteAlpha.800">Your Projects</Heading>
            {selectedWorkspace && (
              <Button size="sm" colorScheme="brand" variant="outline" onClick={async () => {
                const name = window.prompt("Project Name:");
                if (name) {
                  await api.post('/projects', { name, workspaceId: selectedWorkspace });
                  const { data } = await api.get(`/projects?workspaceId=${selectedWorkspace}`);
                  setProjects(data);
                }
              }}>+ New Project</Button>
            )}
          </Flex>
          {loading ? (
            <Spinner color="brand.500" />
          ) : projects.length === 0 ? (
            <Text color="whiteAlpha.500">No projects found in this workspace. Run the seed script!</Text>
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
