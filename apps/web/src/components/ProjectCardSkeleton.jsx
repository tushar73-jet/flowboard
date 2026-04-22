import { Flex, Skeleton, SkeletonCircle } from '@chakra-ui/react';

export function ProjectCardSkeleton() {
  return (
    <Flex
      direction="column"
      h="160px"
      p={6}
      rounded="2xl"
      bg="rgba(30, 41, 59, 0.6)"
      border="1px solid"
      borderColor="whiteAlpha.100"
    >
      <SkeletonCircle size="10" />
      <Skeleton height="20px" mt={4} width="60%" />
      <Skeleton height="14px" mt={2} width="40%" />
    </Flex>
  );
}
