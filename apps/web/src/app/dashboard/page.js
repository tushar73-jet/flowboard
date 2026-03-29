"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner } from "@chakra-ui/react";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return (
    <Flex h="100vh" align="center" justify="center" bg="#0f172a">
      <Spinner size="xl" color="brand.500" thickness="4px" />
    </Flex>
  );
}
