"use client";
import { Box, Flex, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const MotionBox = motion.div;

export default function EmptyState({
  icon: IconComp,
  title,
  description,
  actionLabel,
  onAction,
  size = "md",
}) {
  const sizes = {
    sm: { iconBox: 12, iconSize: 20, titleSize: "md", descSize: "sm", py: 10 },
    md: { iconBox: 16, iconSize: 28, titleSize: "lg", descSize: "sm", py: 16 },
    lg: { iconBox: 20, iconSize: 36, titleSize: "xl", descSize: "md", py: 24 },
  };
  const s = sizes[size] || sizes.md;

  return (
    <Flex direction="column" align="center" justify="center" py={s.py} px={6} textAlign="center">
      <MotionBox
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Flex
            w={s.iconBox}
            h={s.iconBox}
            rounded="2xl"
            bg="rgba(99,102,241,0.08)"
            border="1px dashed"
            borderColor="rgba(99,102,241,0.3)"
            align="center"
            justify="center"
            mb={5}
            mx="auto"
          >
            {IconComp && (
              <Icon as={IconComp} boxSize={`${s.iconSize}px`} color="whiteAlpha.300" />
            )}
          </Flex>
        </motion.div>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <VStack spacing={2} mb={onAction ? 6 : 0}>
          <Text
            fontSize={s.titleSize}
            fontWeight="700"
            color="whiteAlpha.800"
            letterSpacing="-0.01em"
          >
            {title}
          </Text>
          {description && (
            <Text fontSize={s.descSize} color="whiteAlpha.400" maxW="320px" lineHeight="1.6">
              {description}
            </Text>
          )}
        </VStack>
      </MotionBox>

      {onAction && (
        <MotionBox
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Button
            leftIcon={<Plus size={16} />}
            colorScheme="brand"
            rounded="xl"
            px={6}
            onClick={onAction}
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
            }}
            transition="all 0.2s"
          >
            {actionLabel}
          </Button>
        </MotionBox>
      )}
    </Flex>
  );
}
