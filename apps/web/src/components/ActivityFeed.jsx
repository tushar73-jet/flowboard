"use client";
import {
  Box, VStack, HStack, Text, Flex, Spinner, Badge
} from "@chakra-ui/react";
import {
  PlusCircle, ArrowRightLeft, UserPlus, UserMinus,
  Trash2, FolderPlus, CheckCircle, Activity
} from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";
import { formatDistanceToNow, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Avatar, Tooltip } from '@chakra-ui/react';

const ACTION_CONFIG = {
  TASK_CREATED: { icon: PlusCircle, color: "#34d399", bg: "rgba(52,211,153,0.12)", label: "Created" },
  TASK_MOVED: { icon: ArrowRightLeft, color: "#60a5fa", bg: "rgba(96,165,250,0.12)", label: "Moved" },
  TASK_DELETED: { icon: Trash2, color: "#f87171", bg: "rgba(248,113,113,0.12)", label: "Deleted" },
  MEMBER_ADDED: { icon: UserPlus, color: "#a78bfa", bg: "rgba(167,139,250,0.12)", label: "Joined" },
  MEMBER_REMOVED: { icon: UserMinus, color: "#fb923c", bg: "rgba(251,146,60,0.12)", label: "Left" },
  PROJECT_CREATED: { icon: FolderPlus, color: "#22d3ee", bg: "rgba(34,211,238,0.12)", label: "Project" },
};

function getGroupLabel(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (isThisWeek(d)) return "This week";
  return "Earlier";
}

function groupActivities(activities) {
  const groups = {};
  const order = [];
  for (const a of activities) {
    const label = getGroupLabel(a.createdAt);
    if (!groups[label]) { groups[label] = []; order.push(label); }
    groups[label].push(a);
  }
  return order.map(label => ({ label, items: groups[label] }));
}

export default function ActivityFeed({ activities, loading }) {
  const { selectedWorkspaceId } = useDashboard();

  if (!selectedWorkspaceId) {
    return (
      <Flex py={10} direction="column" align="center" gap={3} px={4}>
        <Activity size={24} color="rgba(255,255,255,0.15)" />
        <Text color="whiteAlpha.400" fontSize="sm" textAlign="center">
          Select a workspace to see activity.
        </Text>
      </Flex>
    );
  }

  if (loading) {
    return (
      <Flex py={10} justify="center">
        <Spinner color="brand.500" size="sm" />
      </Flex>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Flex py={10} direction="column" align="center" gap={3} px={4}>
        <Activity size={24} color="rgba(255,255,255,0.15)" />
        <Text color="whiteAlpha.400" fontSize="sm" textAlign="center">
          No activity yet. Start by creating a task!
        </Text>
      </Flex>
    );
  }

  const groups = groupActivities(activities);

  return (
    <VStack align="stretch" spacing={0}>
      {groups.map(({ label, items }) => (
        <Box key={label}>
          {/* Group header */}
          <Flex align="center" gap={2} px={4} py={2}>
            <Box h="1px" flex="1" bg="whiteAlpha.50" />
            <Text fontSize="9px" fontWeight="700" color="whiteAlpha.300" letterSpacing="0.1em" textTransform="uppercase">
              {label}
            </Text>
            <Box h="1px" flex="1" bg="whiteAlpha.50" />
          </Flex>

          {items.map((activity, i) => (
            <ActivityItem key={activity.id || i} activity={activity} />
          ))}
        </Box>
      ))}
    </VStack>
  );
}

function ActivityItem({ activity }) {
  const { action, entityName, user, createdAt, metadata } = activity;
  const conf = ACTION_CONFIG[action] || { icon: CheckCircle, color: "#94a3b8", bg: "rgba(148,163,184,0.1)", label: "Action" };
  const IconComp = conf.icon;

  const getActionText = () => {
    switch (action) {
      case 'TASK_CREATED': return <>created <Text as="span" color="white" fontWeight="600">"{entityName}"</Text></>;
      case 'TASK_MOVED': return <>moved <Text as="span" color="white" fontWeight="600">"{entityName}"</Text> to <Text as="span" color="blue.300" fontWeight="600">{metadata?.to}</Text></>;
      case 'TASK_DELETED': return <>deleted <Text as="span" color="red.300" fontWeight="600">"{entityName}"</Text></>;
      case 'MEMBER_ADDED': return <>added <Text as="span" color="white" fontWeight="600">{entityName}</Text></>;
      case 'MEMBER_REMOVED': return <>removed <Text as="span" color="white" fontWeight="600">{entityName}</Text></>;
      case 'PROJECT_CREATED': return <>created project <Text as="span" color="cyan.300" fontWeight="600">"{entityName}"</Text></>;
      default: return <>{action.toLowerCase().replace(/_/g, " ")} on {entityName}</>;
    }
  };

  return (
    <Flex
      py={3} px={4} gap={3} align="flex-start"
      _hover={{ bg: "whiteAlpha.100" }}
      transition="background 0.12s"
      role="group"
      position="relative"
    >
      {/* Colored left border */}
      <Box
        position="absolute"
        left={0} top="20%" bottom="20%"
        w="2px"
        bg={conf.color}
        rounded="full"
        opacity={0}
        _groupHover={{ opacity: 0.8 }}
        transition="opacity 0.15s"
      />

      <Avatar size="xs" name={user?.name} src={user?.avatar} flexShrink={0} mt={0.5} />

      <Box flex="1" minW={0}>
        <HStack justify="space-between" mb={1} spacing={2}>
          <Text fontSize="xs" fontWeight="700" color="white" noOfLines={1}>
            {user?.name || "Someone"}
          </Text>
          <Tooltip label={new Date(createdAt).toLocaleString()} hasArrow placement="left">
            <Text fontSize="9px" color="whiteAlpha.400" whiteSpace="nowrap" flexShrink={0}>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </Text>
          </Tooltip>
        </HStack>

        <HStack spacing={2} align="center">
          <Flex
            w={5} h={5} rounded="md"
            bg={conf.bg}
            align="center" justify="center"
            flexShrink={0}
          >
            <IconComp size={11} color={conf.color} />
          </Flex>
          <Text fontSize="xs" color="whiteAlpha.600" noOfLines={2} lineHeight="1.5">
            {getActionText()}
          </Text>
        </HStack>
      </Box>
    </Flex>
  );
}
