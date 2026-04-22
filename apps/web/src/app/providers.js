"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChakraProvider, extendTheme, theme as baseTheme } from "@chakra-ui/react";
import { useState } from "react";

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false
  },
  
  colors: {
    brand: {
      50: '#eef2ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Primary
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81'
    },
    slate: {
      300: '#cbd5e1',
      800: '#1e293b'
    },
    // Semantic tokens
    background: {
      app: '#0b1120',
      surface: '#0f172a',
      card: '#1e293b',
      hover: 'rgba(255,255,255,0.05)'
    },
    
    text: {
      primary: 'rgba(255,255,255,0.95)',
      secondary: 'rgba(255,255,255,0.75)',
      tertiary: 'rgba(255,255,255,0.60)',
      disabled: 'rgba(255,255,255,0.40)'
    },
    
    border: {
      default: 'rgba(255,255,255,0.10)',
      hover: 'rgba(255,255,255,0.20)',
      active: '#6366f1'
    },
    canvas: '#0b1120',
    surface: '#0f172a',
    card: '#1e293b',
  },
  
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.2)',
    md: '0 4px 12px rgba(0,0,0,0.3)',
    lg: '0 10px 40px rgba(0,0,0,0.4)',
    xl: '0 20px 60px rgba(0,0,0,0.5)',
    brand: '0 10px 40px rgba(99,102,241,0.3)'
  },
  
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  },
  
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        variant: 'solid'
      },
      sizes: {
        sm: {
          h: '36px',
          minW: '36px',
          fontSize: 'sm',
          px: 4
        },
        md: {
          h: '44px',  // Touch-friendly
          minW: '44px',
          fontSize: 'md',
          px: 6
        },
        lg: {
          h: '52px',
          minW: '52px',
          fontSize: 'lg',
          px: 8
        }
      },
      variants: {
        solid: {
          bg: 'white',
          color: 'gray.900',
          _hover: { bg: 'gray.100' },
          _active: { bg: 'gray.200' }
        },
        ghost: {
          _hover: { bg: 'background.hover' }
        }
      }
    },
    
    Card: {
      baseStyle: {
        container: {
          bg: 'background.card',
          border: '1px solid',
          borderColor: 'border.default',
          rounded: 'xl',
          overflow: 'hidden',
          transition: 'all 0.2s',
          _hover: {
            borderColor: 'border.hover',
            transform: 'translateY(-2px)',
            boxShadow: 'md'
          }
        }
      }
    },
    
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'background.hover',
            border: '1px solid',
            borderColor: 'border.default',
            _hover: {
              bg: 'background.hover',
              borderColor: 'border.hover'
            },
            _focus: {
              bg: 'background.card',
              borderColor: 'brand.500'
            }
          }
        }
      }
    },
    Modal: {
      baseStyle: {
        overlay: {
          backdropFilter: 'blur(8px)',
          bg: 'blackAlpha.700'
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
