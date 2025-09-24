// routes/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import {
  Box,
  Button,
  Heading,
  Stack,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Input,
} from "@chakra-ui/react";

import {
  PasswordInput,
  PasswordStrengthMeter,
} from "../component/ui/password-input";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError("All fields are required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    try {
      setLoading(true);
      await signup(name, email, password); 
      navigate("/otp-verification");
      // navigate("/chat");
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, blue.50, gray.100)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Box
        bg="white"
        shadow="xl"
        rounded="2xl"
        p={8}
        w="full"
        maxW="md"
        as="form"
        onSubmit={onSubmit}
      >
        <Stack spacing={4} textAlign="center" mb={6}>
          <Heading size="lg" color="gray.800">
            Create Your Account
          </Heading>
          <Text fontSize="sm" color="gray.500">
            Join us to access your dashboard
          </Text>
        </Stack>

        <Stack spacing={4}>
          <Input
            placeholder="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            placeholder="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordStrengthMeter password={password} />
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
          />
        </Stack>

        {error && (
          <Alert status="error" mt={4} borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Button
          mt={6}
          type="submit"
          colorScheme="blue"
          w="full"
          isDisabled={loading}
        >
          {loading ? <Spinner size="sm" mr={2} /> : null}
          {loading ? "Creating..." : "Sign Up"}
        </Button>

        <Text fontSize="sm" textAlign="center" mt={4} color="gray.600">
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#2B6CB0" }}>
            Log in
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
