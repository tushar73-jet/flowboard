"use client";
import Link from "next/link";
import { Flex, Heading, Text, Button, HStack, Box, VStack } from "@chakra-ui/react";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ArrowRight, Zap, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="#0b1120"
      bgImage="radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 60%)"
    >
      {/* Nav */}
      <Flex as="nav" px={8} py={5} justify="space-between" align="center">
        <HStack spacing={3}>
          <Box
            w={8} h={8} rounded="lg"
            bgGradient="linear(135deg, #6366f1, #8b5cf6)"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="sm" fontWeight="bold" color="white"
          >
            F
          </Box>
          <Text fontWeight="700" fontSize="lg" color="white" letterSpacing="-0.02em">
            Flowboard
          </Text>
        </HStack>

        <HStack spacing={3}>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost" color="whiteAlpha.700" _hover={{ color: "white" }}>
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" colorScheme="brand" rounded="xl" px={5}>
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button as={Link} href="/dashboard" size="sm" colorScheme="brand" rounded="xl" px={5} rightIcon={<ArrowRight size={14} />}>
              Open Dashboard
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </HStack>
      </Flex>

      {/* Hero */}
      <Flex flex="1" direction="column" align="center" justify="center" px={8} textAlign="center" gap={8}>
        <Box
          px={4} py={1.5}
          border="1px solid"
          borderColor="brand.500"
          rounded="full"
          bg="rgba(99,102,241,0.1)"
        >
          <Text fontSize="xs" color="brand.400" fontWeight="600" letterSpacing="0.05em">
            ✦ MULTI-TENANT RBAC · REAL-TIME SYNC · OPTIMISTIC UI
          </Text>
        </Box>

        <Heading
          as="h1"
          fontSize={{ base: "4xl", md: "6xl" }}
          fontWeight="800"
          lineHeight="1.1"
          letterSpacing="-0.03em"
          color="white"
          maxW="700px"
        >
          Ship faster with{" "}
          <Text
            as="span"
            bgGradient="linear(to-r, #6366f1, #8b5cf6, #a78bfa)"
            bgClip="text"
          >
            smarter workflows
          </Text>
        </Heading>

        <Text fontSize="xl" color="whiteAlpha.500" maxW="500px" lineHeight="1.7">
          A high-performance project management tool built for teams — with workspace roles, drag-and-drop boards, and real-time collaboration.
        </Text>

        <SignedOut>
          <HStack spacing={4}>
            <SignUpButton mode="modal">
              <Button
                size="lg"
                colorScheme="brand"
                px={8}
                rounded="xl"
                rightIcon={<ArrowRight size={16} />}
                h="52px"
                fontSize="md"
              >
                Start for free
              </Button>
            </SignUpButton>
            <SignInButton mode="modal">
              <Button
                size="lg"
                variant="outline"
                borderColor="whiteAlpha.200"
                color="whiteAlpha.700"
                _hover={{ borderColor: "brand.500", color: "white" }}
                px={8}
                rounded="xl"
                h="52px"
                fontSize="md"
              >
                Sign In
              </Button>
            </SignInButton>
          </HStack>
        </SignedOut>

        <SignedIn>
          <Button
            as={Link}
            href="/dashboard"
            size="lg"
            colorScheme="brand"
            px={10}
            rounded="xl"
            rightIcon={<ArrowRight size={16} />}
            h="52px"
            fontSize="md"
          >
            Open Dashboard
          </Button>
        </SignedIn>

        {/* Features */}
        <HStack
          spacing={6}
          mt={6}
          flexWrap="wrap"
          justify="center"
        >
          {[
            { icon: <Shield size={16} />, text: "Role-Based Access Control" },
            { icon: <Users size={16} />, text: "Multi-Tenant Workspaces" },
            { icon: <Zap size={16} />, text: "Optimistic Real-Time UI" },
          ].map(({ icon, text }) => (
            <HStack
              key={text}
              spacing={2}
              px={4}
              py={2.5}
              rounded="xl"
              bg="rgba(255,255,255,0.04)"
              border="1px solid"
              borderColor="whiteAlpha.100"
              color="whiteAlpha.600"
              fontSize="sm"
            >
              {icon}
              <Text>{text}</Text>
            </HStack>
          ))}
        </HStack>
      </Flex>
    </Flex>
  );
}
