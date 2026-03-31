"use client";
import { 
  Box, VStack, HStack, Text, Flex, Badge, Spinner, 
  Avatar, Divider, Heading 
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

  if (activities.length === 0) {
    return (
      <Box py={10} textAlign="center">
        <Text color="whiteAlpha.400" fontSize="sm">No recent activity found.</Text>
      </Box>
    );
  }

  return (
    <VStack align="stretch" spacing={0} divider={<Divider borderColor="whiteAlpha.50" />}>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </VStack>
  );
}

function ActivityItem({ activity }) {
  const { action, entityType, entityName, user, createdAt, metadata } = activity;
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
    <Flex py={3} px={4} gap={4} align="flex-start" _hover={{ bg: "whiteAlpha.50" }} transition="bg 0.2s">
      <Flex 
        w={7} h={7} rounded="full" mt={0.5}
        bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.100"
        align="center" justify="center" color={config.color}
      >
        {config.icon}
      </Flex>
      
      <Box flex="1">
        <HStack justify="space-between" mb={0.5}>
          <Text fontSize="xs" fontWeight="700" color="whiteAlpha.900">
            {user?.name || "Someone"}
          </Text>
          <Text fontSize="10px" color="whiteAlpha.400">
            {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </HStack>
        
        <Text fontSize="xs" color="whiteAlpha.600" lineHeight="1.4">
          {getActionText()}
        </Text>
      </Box>
    </Flex>
  );
}
