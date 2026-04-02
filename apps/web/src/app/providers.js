"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, extendTheme, theme as baseTheme } from "@chakra-ui/react";
import { useState } from "react";

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
  },
  components: {
    Button: {
      variants: {
        solid: (props) => {
          if (props.colorScheme === 'brand') {
            return {
              bg: 'white',
              color: 'black',
              _hover: { bg: 'gray.200' },
              _active: { bg: 'gray.300' },
            };
          }
          return typeof baseTheme.components.Button.variants.solid === 'function' 
            ? baseTheme.components.Button.variants.solid(props) 
            : baseTheme.components.Button.variants.solid;
        }
      }
    }
  }
});

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import api from "@/lib/api";

function AxiosClerkSync() {
  const { getToken } = useAuth();

  useEffect(() => {
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Failed to get Clerk token", e);
      }
      return config;
    });

    return () => api.interceptors.request.eject(interceptor);
  }, [getToken]);

  return null;
}

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <AxiosClerkSync />
        {children}
      </ChakraProvider>
    </QueryClientProvider>
  );
}
