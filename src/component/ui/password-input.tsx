import { useState } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Progress,
  Box,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export function PasswordInput({
  value,
  onChange,
  placeholder,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);
  const toggleShow = () => setShow(!show);

  return (
    <InputGroup>
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder || "Password"}
        value={value}
        onChange={onChange}
      />
      <InputRightElement>
        <IconButton
          size="sm"
          variant="ghost"
          aria-label={show ? "Hide password" : "Show password"}
          icon={show ? <ViewOffIcon /> : <ViewIcon />}
          onClick={toggleShow}
        />
      </InputRightElement>
    </InputGroup>
  );
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  let score = 0;
  if (password.length > 5) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const value = (score / 4) * 100;

  return (
    <Box mt={1}>
      <Progress
        value={value}
        size="xs"
        colorScheme={value < 50 ? "red" : value < 75 ? "yellow" : "green"}
      />
    </Box>
  );
}
