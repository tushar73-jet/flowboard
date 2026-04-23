"use client";
import { Box, VStack, HStack, Skeleton, SkeletonCircle } from "@chakra-ui/react";

function TaskCardSkeleton() {
  return (
    <Box
      bg="rgba(30,41,59,0.7)"
      p={4}
      rounded="xl"
      border="1px solid"
      borderColor="whiteAlpha.80"
    >
      {/* Labels row */}
      <HStack spacing={1} mb={3}>
        <Skeleton h="5px" w="20px" rounded="full" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
        <Skeleton h="5px" w="14px" rounded="full" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
      </HStack>
      {/* Title */}
      <Skeleton h="14px" mb={2} rounded="md" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
      <Skeleton h="14px" w="70%" mb={4} rounded="md" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
      {/* Description */}
      <Skeleton h="11px" mb={1} rounded="md" startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
      <Skeleton h="11px" w="55%" mb={4} rounded="md" startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
      {/* Footer row */}
      <HStack justify="space-between">
        <HStack spacing={2}>
          <Skeleton h="18px" w="48px" rounded="md" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
          <Skeleton h="18px" w="36px" rounded="md" startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
        </HStack>
        <SkeletonCircle size="5" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
      </HStack>
    </Box>
  );
}

export function ColumnSkeleton({ count = 3 }) {
  return (
    <HStack
      align="flex-start"
      spacing={6}
      p={8}
      overflowX="auto"
      minH="calc(100vh - 130px)"
    >
      {Array.from({ length: count }).map((_, colIdx) => (
        <Box
          key={colIdx}
          w="300px"
          minW="300px"
          bg="rgba(15,23,42,0.6)"
          rounded="2xl"
          border="1px solid"
          borderColor="whiteAlpha.80"
          p={4}
        >
          {/* Column header */}
          <HStack justify="space-between" mb={4} px={2}>
            <HStack>
              <Skeleton h="8px" w="8px" rounded="full" startColor="whiteAlpha.200" endColor="whiteAlpha.100" />
              <Skeleton h="12px" w="80px" rounded="md" startColor="whiteAlpha.150" endColor="whiteAlpha.80" />
              <Skeleton h="18px" w="24px" rounded="full" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
            </HStack>
          </HStack>
          {/* Cards */}
          <VStack spacing={3} align="stretch">
            {Array.from({ length: 3 - colIdx }).map((_, i) => (
              <TaskCardSkeleton key={i} />
            ))}
          </VStack>
        </Box>
      ))}
    </HStack>
  );
}

export function MemberCardSkeleton({ count = 6 }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))"
      gap={4}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box
          key={i}
          p={5}
          rounded="2xl"
          bg="rgba(15,23,42,0.7)"
          border="1px solid"
          borderColor="whiteAlpha.80"
        >
          <HStack spacing={4} mb={4}>
            <SkeletonCircle size="10" startColor="whiteAlpha.150" endColor="whiteAlpha.80" />
            <VStack align="start" spacing={1} flex="1">
              <Skeleton h="12px" w="120px" rounded="md" startColor="whiteAlpha.150" endColor="whiteAlpha.80" />
              <Skeleton h="10px" w="160px" rounded="md" startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
            </VStack>
          </HStack>
          <Skeleton h="1px" mb={3} startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
          <HStack justify="space-between">
            <Skeleton h="18px" w="60px" rounded="full" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
            <Skeleton h="12px" w="80px" rounded="md" startColor="whiteAlpha.80" endColor="whiteAlpha.40" />
          </HStack>
        </Box>
      ))}
    </Box>
  );
}

export function SidebarProjectsSkeleton({ count = 4 }) {
  return (
    <VStack spacing={1} align="stretch" px={4}>
      {Array.from({ length: count }).map((_, i) => (
        <HStack key={i} px={3} py={2} spacing={3}>
          <Skeleton h="8px" w="8px" rounded="full" startColor="whiteAlpha.150" endColor="whiteAlpha.80" />
          <Skeleton h="12px" w={`${60 + i * 15}px`} rounded="md" startColor="whiteAlpha.100" endColor="whiteAlpha.50" />
        </HStack>
      ))}
    </VStack>
  );
}

export default TaskCardSkeleton;
