"use client";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, VStack, HStack, Text, Kbd, Divider } from "@chakra-ui/react";

export function KeyboardShortcutsModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent bg="#1e293b" color="white" rounded="xl" border="1px solid" borderColor="whiteAlpha.200">
        <ModalHeader>Keyboard Shortcuts</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <ShortcutRow keys={['↑', '↓']} description="Navigate tasks" />
            <Divider borderColor="whiteAlpha.200" />
            <ShortcutRow keys={['Enter']} description="Open selected task" />
            <Divider borderColor="whiteAlpha.200" />
            <ShortcutRow keys={['N']} description="Create new task" />
            <Divider borderColor="whiteAlpha.200" />
            <ShortcutRow keys={['Shift', '?']} description="Show this menu" />
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

function ShortcutRow({ keys, description }) {
  return (
    <HStack justify="space-between">
      <Text color="whiteAlpha.800" fontSize="sm">{description}</Text>
      <HStack spacing={1}>
        {keys.map(k => (
          <Kbd key={k} bg="whiteAlpha.200" color="white" borderColor="whiteAlpha.300">{k}</Kbd>
        ))}
      </HStack>
    </HStack>
  );
}
