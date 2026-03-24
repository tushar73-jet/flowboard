"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { useState } from "react";

// Modern dark theme config
const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      500: '#6366f1',
      600: '#4f46e5',
      900: '#312e81',
    },
    canvas: '#0f172a',
    surface: 'rgba(30, 41, 59, 0.7)',
    card: 'rgba(51, 65, 85, 0.8)',
  },
  styles: {
    global: {
      body: {
        bg: 'canvas',
        color: 'white',
      }
    }
  }
});

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  );
}
