import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Button,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import React from "react";
import { useNavigate } from "react-router-dom";


const Links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Contact", path: "/contact" },
];

const NavLink = ({
  children,
  path,
  navigate,
}: {
  children: React.ReactNode;
  path: string;
  navigate: (path: string) => void;
}) => (
  <Button
    variant="ghost"
    px={2}
    py={1}
    rounded={"md"}
    _hover={{ bg: "gray.200", color: "black" }}
    onClick={() => navigate(path)}
  >
    {children}
  </Button>
);

const Navbar: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  return (
    <Box bg="blue.500" px={4} color="white">
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        <Box fontWeight="bold" cursor="pointer" onClick={() => navigate("/")}>
          MyLogo
        </Box>
        <IconButton
          size={"md"}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack
          spacing={8}
          alignItems={"center"}
          display={{ base: "none", md: "flex" }}
        >
          {Links.map((link) => (
            <NavLink key={link.name} path={link.path} navigate={navigate}>
              {link.name}
            </NavLink>
          ))}
        </HStack>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            {Links.map((link) => (
              <NavLink key={link.name} path={link.path} navigate={navigate}>
                {link.name}
              </NavLink>
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

export default Navbar;
