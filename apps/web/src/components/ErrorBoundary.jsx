"use client";
import { Component } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box minH="100vh" display="flex" alignItems="center" justifyContent="center" bg="#0b1120">
          <VStack spacing={6} maxW="500px" textAlign="center" p={8}>
            <Box color="red.400" fontSize="4xl">
              <AlertTriangle size={64} />
            </Box>
            <Heading size="lg" color="white">Something went wrong</Heading>
            <Text color="whiteAlpha.600">
              {this.state.error?.message || "An unexpected error occurred"}
            </Text>
            <Button 
              colorScheme="brand" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Return to Dashboard
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
