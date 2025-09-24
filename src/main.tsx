import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Login from "./routes/Login.tsx";
import Signup from "./routes/Signup.tsx";
import Chat from "./routes/Chat.tsx";
import { AuthProvider } from "./state/AuthContext.tsx";
import ProtectedRoute from "./routes/ProtectedRoutes.tsx";
import OtpVerification from "./routes/OtpVerification.tsx";

const theme = extendTheme({
  colors: {
    brand: {
      100: "#f7c1c1",
      500: "#f56565",
      900: "#742a2a",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
});


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App/>} />
            <Route path="/chat" element={<ProtectedRoute><Chat/></ProtectedRoute>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/otp-verification" element={<OtpVerification/>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  </StrictMode>
);
