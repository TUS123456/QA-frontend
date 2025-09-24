import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  HStack,
  PinInput,
  PinInputField,
  Alert,
  AlertIcon,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import { validateOtpRequest } from "../service/api.Service";

export default function OtpVerification() {
  const { user , setUser } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      if (user?.id) {
        const result = await validateOtpRequest({ otp, user });

        if (result.success) {
          // 🔹 Save token + user
          localStorage.setItem("app_token", result.token);
          localStorage.setItem("app_user", JSON.stringify(result.user));

          // optional update context
          setUser(result.user);

          toast({
            // Chakra toast
            title: "Success",
            description: "OTP verified successfully"
        });

          navigate("/chat");
        }
      }
    } catch (err: any) {
      setError(err?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.50"
    >
      <Box bg="white" p={8} rounded="xl" shadow="lg" w="full" maxW="sm">
        <Stack spacing={6} textAlign="center">
          <Heading size="lg">Verify OTP</Heading>
          <Text fontSize="sm" color="gray.500">
            Enter the OTP sent to your email
          </Text>

          {/* OTP fields arranged horizontally */}
          <HStack justify="center" spacing={4}>
            <PinInput otp onChange={(value) => setOtp(value)}>
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>

          {/* show error */}
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Button
            colorScheme="blue"
            onClick={handleVerify}
            w="full"
            isLoading={loading}
          >
            Verify
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
