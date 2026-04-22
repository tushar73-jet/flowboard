"use client";
import {
  Box, VStack, HStack, Text, Flex, Spinner,
  Divider
} from "@chakra-ui/react";
import {
  PlusCircle, ArrowRightLeft, UserPlus, UserMinus,
  Trash2, FolderPlus, CheckCircle
} from "lucide-react";
import { useDashboard } from "@/app/dashboard/layout";

const ACTION_ICONS = {
  TASK_CREATED: { icon: <PlusCircle size={14} />, color: "green.400" },
  TASK_MOVED: { icon: <ArrowRightLeft size={14} />, color: "blue.400" },
  TASK_DELETED: { icon: <Trash2 size={14} />, color: "red.400" },
  MEMBER_ADDED: { icon: <UserPlus size={14} />, color: "purple.400" },
  MEMBER_REMOVED: { icon: <UserMinus size={14} />, color: "orange.400" },
  PROJECT_CREATED: { icon: <FolderPlus size={14} />, color: "cyan.400" },
};

import { formatDistanceToNow } from 'date-fns';
import { Avatar, Tooltip } from '@chakra-ui/react';

export default function ActivityFeed({ activities, loading }) {
  const { selectedWorkspaceId } = useDashboard();

  if (!selectedWorkspaceId) {
    return (
      <Box py={10} textAlign="center" px={4}>
        <Text color="whiteAlpha.500" fontSize="sm">
          No workspace found. Please add one to view activity.
        </Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Flex py={10} justify="center">
        <Spinner color="brand.500" />
      </Flex>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Box py={10} textAlign="center">
        <Text color="whiteAlpha.400" fontSize="sm">No recent activity found.</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {activities.map((activity, index) => (
        <Box key={activity.id || index} borderBottom="1px solid" borderColor="whiteAlpha.50">
          <ActivityItem activity={activity} />
        </Box>
      ))}
    </VStack>
  );
}

function ActivityItem({ activity }) {
  const { action, entityName, user, createdAt, metadata } = activity;
  const config = ACTION_ICONS[action] || { icon: <CheckCircle size={14} />, color: "gray.400" };

  const getActionText = () => {
    switch (action) {
      case 'TASK_CREATED': return `created task "${entityName}"`;
      case 'TASK_MOVED': return `moved task "${entityName}" from ${metadata?.from} to ${metadata?.to}`;
      case 'TASK_DELETED': return `deleted task "${entityName}"`;
      case 'MEMBER_ADDED': return `added ${entityName} to the team`;
      case 'MEMBER_REMOVED': return `removed ${entityName} from the team`;
      case 'PROJECT_CREATED': return `created project "${entityName}"`;
      default: return `performed action ${action} on ${entityName}`;
    }
  };

  return (
    <Flex py={3} px={4} gap={3} align="flex-start">
      <Avatar size="sm" name={user?.name} src={user?.avatar} />
      
      <Box flex="1">
        <HStack justify="space-between" mb={1}>
          <Text fontSize="sm" fontWeight="600" color="white">
            {user?.name || "Someone"}
          </Text>
          
          <Tooltip label={new Date(createdAt).toLocaleString()}>
            <Text fontSize="xs" color="whiteAlpha.500">
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </Text>
          </Tooltip>
        </HStack>
        
        <HStack spacing={2}>
          <Flex 
            w={5} h={5} rounded="md"
            bg="whiteAlpha.100" 
            align="center" justify="center" 
            color={config.color}
          >
            {config.icon}
          </Flex>
          
          <Text fontSize="sm" color="whiteAlpha.700">
            {getActionText()}
          </Text>
        </HStack>
      </Box>
    </Flex>
  );
}
