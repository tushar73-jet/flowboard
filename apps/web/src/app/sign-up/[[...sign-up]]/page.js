import { SignUp } from "@clerk/nextjs";
import { Flex } from "@chakra-ui/react";

export default function SignUpPage() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="#0f172a">
      <SignUp />
    </Flex>
  );
}
