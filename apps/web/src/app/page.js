"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Flex, Heading, Text, Button, HStack, Box, VStack,
  SimpleGrid, Icon, Collapse
} from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
  ArrowRight, Zap, Users, Shield, BarChart3, GitBranch,
  Bell, ChevronDown, CheckCircle2, Star
} from "lucide-react";

const MotionBox = motion.div;
const MotionFlex = motion.div;

const FEATURES = [
  {
    icon: Shield,
    title: "Role-Based Access",
    desc: "Owner, Admin, and Member roles with granular workspace-level permissions.",
    color: "#6366f1",
    glow: "rgba(99,102,241,0.2)",
  },
  {
    icon: Zap,
    title: "Optimistic Real-Time UI",
    desc: "Changes appear instantly with Socket.IO sync — no page refresh needed.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
  },
  {
    icon: Users,
    title: "Multi-Tenant Workspaces",
    desc: "Manage multiple teams and projects under separate, isolated workspaces.",
    color: "#10b981",
    glow: "rgba(16,185,129,0.2)",
  },
  {
    icon: BarChart3,
    title: "Activity Feed",
    desc: "Full audit log of every action across your workspace in real-time.",
    color: "#3b82f6",
    glow: "rgba(59,130,246,0.2)",
  },
  {
    icon: GitBranch,
    title: "Drag & Drop Board",
    desc: "Kanban-style board with smooth DnD, bulk actions, and keyboard nav.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    desc: "In-app toasts for task moves, member changes, and project updates.",
    color: "#ec4899",
    glow: "rgba(236,72,153,0.2)",
  },
];

const STATS = [
  { value: "10k+", label: "Tasks Created" },
  { value: "500+", label: "Teams Onboarded" },
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<50ms", label: "Real-time Sync" },
];

const FAQ = [
  {
    q: "Is Flowboard free to use?",
    a: "Yes — Flowboard is completely free. Create your account, set up your workspace, and invite your team in minutes.",
  },
  {
    q: "How does real-time sync work?",
    a: "Flowboard uses Socket.IO WebSockets. Every task update, comment, and status change propagates to all active clients within milliseconds.",
  },
  {
    q: "What is RBAC?",
    a: "Role-Based Access Control lets Owners control what Admins and Members can see and do. Owners can delete workspaces, Admins can manage members, and Members can manage tasks.",
  },
  {
    q: "Can I have multiple workspaces?",
    a: "Absolutely. Each workspace is fully isolated with its own projects, members, roles, and activity feed.",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      border="1px solid"
      borderColor={open ? "brand.500" : "whiteAlpha.100"}
      rounded="xl"
      overflow="hidden"
      transition="border-color 0.2s"
      bg="rgba(15,23,42,0.6)"
    >
      <Flex
        as="button"
        w="full"
        px={6}
        py={5}
        align="center"
        justify="space-between"
        onClick={() => setOpen(o => !o)}
        _hover={{ bg: "whiteAlpha.50" }}
        transition="background 0.15s"
      >
        <Text fontWeight="600" color="whiteAlpha.900" textAlign="left" fontSize="sm">{q}</Text>
        <Icon
          as={ChevronDown}
          color="brand.400"
          transition="transform 0.2s"
          transform={open ? "rotate(180deg)" : "rotate(0deg)"}
          flexShrink={0}
          ml={4}
        />
      </Flex>
      <Collapse in={open} animateOpacity>
        <Box px={6} pb={5}>
          <Text fontSize="sm" color="whiteAlpha.600" lineHeight="1.7">{a}</Text>
        </Box>
      </Collapse>
    </Box>
  );
}

export default function Home() {
  return (
    <Flex
      direction="column"
      minH="100vh"
      bg="#0f172a"
      bgImage="radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 60%)"
      overflowX="hidden"
    >
      {/* Nav */}
      <Flex
        as="nav"
        px={{ base: 5, md: 10 }}
        py={5}
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderColor="whiteAlpha.50"
        backdropFilter="blur(12px)"
        position="sticky"
        top={0}
        zIndex={50}
        bg="rgba(11,17,32,0.8)"
      >
        <HStack spacing={3}>
          <Box
            w={8} h={8} rounded="lg"
            bgGradient="linear(135deg, #6366f1, #8b5cf6)"
            display="flex" alignItems="center" justifyContent="center"
            fontSize="sm" fontWeight="bold" color="white"
            boxShadow="0 0 20px rgba(99,102,241,0.5)"
          >
            F
          </Box>
          <Text fontWeight="800" fontSize="lg" color="white" letterSpacing="-0.02em">Flowboard</Text>
        </HStack>

        <HStack spacing={3}>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="sm" variant="ghost" color="whiteAlpha.700" _hover={{ color: "white", bg: "whiteAlpha.100" }}>
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                size="sm" colorScheme="brand" rounded="xl" px={5}
                _hover={{ transform: "translateY(-1px)", boxShadow: "0 8px 24px rgba(99,102,241,0.4)" }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Button
              as={Link} href="/dashboard" size="sm" colorScheme="brand" rounded="xl" px={5}
              rightIcon={<ArrowRight size={14} />}
            >
              Dashboard
            </Button>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </HStack>
      </Flex>

      {/* Hero */}
      <Flex flex="1" direction="column" align="center" justify="center" px={{ base: 5, md: 8 }} textAlign="center" pt={24} pb={16}>
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            display="inline-flex"
            px={4} py={1.5}
            border="1px solid"
            borderColor="brand.500"
            rounded="full"
            bg="rgba(99,102,241,0.1)"
            mb={6}
          >
            <HStack spacing={2}>
              <Star size={12} color="#818cf8" fill="#818cf8" />
              <Text fontSize="xs" color="brand.400" fontWeight="700" letterSpacing="0.08em">
                RBAC · REAL-TIME · OPTIMISTIC UI · OPEN SOURCE
              </Text>
            </HStack>
          </Box>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
            fontWeight="900"
            lineHeight="1.05"
            letterSpacing="-0.04em"
            color="white"
            maxW="820px"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Text
            fontSize={{ base: "lg", md: "xl" }}
            color="whiteAlpha.500"
            maxW="520px"
            lineHeight="1.75"
            mt={6}
          >
            A high-performance project management tool for teams — with workspace roles, drag-and-drop boards, and live collaboration.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <HStack spacing={4} mt={10}>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg" colorScheme="brand" px={10} rounded="xl"
                  rightIcon={<ArrowRight size={18} />} h="56px" fontSize="md" fontWeight="700"
                  position="relative"
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 16px 40px rgba(99,102,241,0.5)" }}
                  transition="all 0.2s"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    inset: '-2px',
                    rounded: 'xl',
                    bgGradient: 'linear(135deg, #6366f1, #8b5cf6)',
                    zIndex: -1,
                    filter: 'blur(8px)',
                    opacity: 0.6,
                  }}
                >
                  Start for free
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  size="lg" variant="outline" borderColor="whiteAlpha.200" color="whiteAlpha.700"
                  px={8} rounded="xl" h="56px"
                  _hover={{ borderColor: "brand.500", color: "white", bg: "whiteAlpha.50" }}
                  transition="all 0.2s"
                >
                  Sign in
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Button
                as={Link} href="/dashboard" size="lg" colorScheme="brand" px={10} rounded="xl"
                rightIcon={<ArrowRight size={18} />} h="56px" fontSize="md"
                _hover={{ transform: "translateY(-2px)", boxShadow: "0 16px 40px rgba(99,102,241,0.5)" }}
                transition="all 0.2s"
              >
                Open Dashboard
              </Button>
            </SignedIn>
          </HStack>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Text mt={5} fontSize="xs" color="whiteAlpha.300">
            No credit card required · Free forever · Set up in 60 seconds
          </Text>
        </motion.div>
      </Flex>

      {/* Stats strip */}
      <Box borderY="1px solid" borderColor="whiteAlpha.50" bg="rgba(15,23,42,0.6)" py={8} px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={6} maxW="800px" mx="auto">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <VStack spacing={1}>
                <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="800" color="white" letterSpacing="-0.03em">
                  {s.value}
                </Text>
                <Text fontSize="sm" color="whiteAlpha.400" fontWeight="500">{s.label}</Text>
              </VStack>
            </motion.div>
          ))}
        </SimpleGrid>
      </Box>

      {/* Features */}
      <Box py={24} px={{ base: 5, md: 8 }} maxW="1200px" mx="auto" w="full">
        <VStack spacing={4} mb={16} textAlign="center">
          <Box px={4} py={1.5} border="1px solid" borderColor="whiteAlpha.100" rounded="full" bg="whiteAlpha.50">
            <Text fontSize="xs" color="whiteAlpha.600" fontWeight="700" letterSpacing="0.08em">EVERYTHING YOU NEED</Text>
          </Box>
          <Heading fontSize={{ base: "3xl", md: "4xl" }} color="white" fontWeight="800" letterSpacing="-0.03em">
            Built for how teams actually work
          </Heading>
          <Text color="whiteAlpha.500" maxW="480px" lineHeight="1.7">
            Every feature is designed around real workflows — not a feature checklist.
          </Text>
        </VStack>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
            {FEATURES.map((f) => (
              <motion.div key={f.title} variants={itemVariants}>
                <Box
                  p={6}
                  rounded="2xl"
                  border="1px solid"
                  borderColor="whiteAlpha.100"
                  bg="rgba(15,23,42,0.7)"
                  backdropFilter="blur(12px)"
                  position="relative"
                  overflow="hidden"
                  _hover={{
                    borderColor: f.color,
                    transform: "translateY(-4px)",
                    boxShadow: `0 16px 48px ${f.glow}`,
                  }}
                  transition="all 0.25s"
                  cursor="default"
                  h="full"
                >
                  <Box
                    position="absolute"
                    top={0} left={0} right={0}
                    h="1px"
                    bgGradient={`linear(to-r, transparent, ${f.color}, transparent)`}
                    opacity={0.6}
                  />
                  <Flex
                    w={12} h={12} rounded="xl"
                    bg={f.glow}
                    border="1px solid"
                    borderColor={`${f.color}40`}
                    align="center" justify="center"
                    mb={5}
                  >
                    <Icon as={f.icon} color={f.color} boxSize={5} />
                  </Flex>
                  <Text fontWeight="700" color="white" mb={2} fontSize="md">{f.title}</Text>
                  <Text fontSize="sm" color="whiteAlpha.500" lineHeight="1.7">{f.desc}</Text>
                </Box>
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </Box>

      {/* Social proof strip */}
      <Box py={12} px={{ base: 5, md: 8 }} borderY="1px solid" borderColor="whiteAlpha.50" bg="rgba(15,23,42,0.4)">
        <VStack spacing={6}>
          <Text fontSize="xs" color="whiteAlpha.300" fontWeight="700" letterSpacing="0.12em" textAlign="center">
            WHAT TEAMS ARE SAYING
          </Text>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6} maxW="1000px" mx="auto" w="full">
            {[
              { quote: "Finally a kanban tool that doesn't feel like a spreadsheet.", name: "Riya M.", role: "Product Lead" },
              { quote: "The real-time sync is ridiculously smooth. Zero lag.", name: "Alex T.", role: "Engineering Manager" },
              { quote: "RBAC done right. We set up 5 workspaces in an afternoon.", name: "Jordan K.", role: "Ops Director" },
            ].map((t) => (
              <Box
                key={t.name}
                p={6} rounded="2xl"
                bg="rgba(15,23,42,0.8)"
                border="1px solid" borderColor="whiteAlpha.100"
              >
                <HStack mb={3} spacing={1}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} color="#f59e0b" fill="#f59e0b" />)}
                </HStack>
                <Text fontSize="sm" color="whiteAlpha.700" lineHeight="1.7" mb={4}>"{t.quote}"</Text>
                <HStack>
                  <Box w={8} h={8} rounded="full" bg="brand.500" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="xs" fontWeight="700" color="white">{t.name[0]}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" fontWeight="700" color="white">{t.name}</Text>
                    <Text fontSize="xs" color="whiteAlpha.400">{t.role}</Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Box>

      {/* FAQ */}
      <Box py={24} px={{ base: 5, md: 8 }} maxW="700px" mx="auto" w="full">
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="800" letterSpacing="-0.03em">
            Frequently asked questions
          </Heading>
          <Text color="whiteAlpha.500" fontSize="sm">Everything you need to know before you start.</Text>
        </VStack>
        <VStack spacing={3} align="stretch">
          {FAQ.map((f) => <FaqItem key={f.q} {...f} />)}
        </VStack>
      </Box>

      {/* Final CTA */}
      <Box py={20} px={{ base: 5, md: 8 }} textAlign="center">
        <Box
          maxW="600px" mx="auto"
          p={12}
          rounded="3xl"
          bg="rgba(99,102,241,0.08)"
          border="1px solid"
          borderColor="brand.500"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute" top={0} left={0} right={0} bottom={0}
            bgGradient="radial(circle at 50% 0%, rgba(99,102,241,0.15), transparent 70%)"
            pointerEvents="none"
          />
          <VStack spacing={6} position="relative">
            <HStack>
              <CheckCircle2 size={20} color="#6366f1" />
              <Text fontSize="sm" color="brand.400" fontWeight="700">Free · No credit card · Instant setup</Text>
            </HStack>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} color="white" fontWeight="800" letterSpacing="-0.03em">
              Ready to ship faster?
            </Heading>
            <Text color="whiteAlpha.500" fontSize="sm" lineHeight="1.7">
              Join thousands of teams already using Flowboard to move faster, together.
            </Text>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg" colorScheme="brand" px={10} rounded="xl" h="52px"
                  rightIcon={<ArrowRight size={18} />}
                  _hover={{ transform: "translateY(-2px)", boxShadow: "0 16px 40px rgba(99,102,241,0.5)" }}
                  transition="all 0.2s"
                >
                  Create free account
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Button
                as={Link} href="/dashboard" size="lg" colorScheme="brand" px={10} rounded="xl" h="52px"
                rightIcon={<ArrowRight size={18} />}
              >
                Open Dashboard
              </Button>
            </SignedIn>
          </VStack>
        </Box>
      </Box>

      {/* Footer */}
      <Box borderTop="1px solid" borderColor="whiteAlpha.50" py={8} px={{ base: 5, md: 10 }}>
        <Flex justify="space-between" align="center" flexWrap="wrap" gap={4}>
          <HStack spacing={2}>
            <Box w={6} h={6} rounded="md" bgGradient="linear(135deg,#6366f1,#8b5cf6)" display="flex" alignItems="center" justifyContent="center">
              <Text fontSize="10px" fontWeight="800" color="white">F</Text>
            </Box>
            <Text fontSize="sm" color="whiteAlpha.400" fontWeight="500">Flowboard</Text>
          </HStack>
          <Text fontSize="xs" color="whiteAlpha.300">© 2025 Flowboard. Built with Next.js & Chakra UI.</Text>
        </Flex>
      </Box>
    </Flex>
  );
}
