// routes/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import {
  useToast
} from "@chakra-ui/react";

export default function Login() {
  const { login } = useAuth(); // <-- from context
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await login(email, password);

      navigate("/chat"); 

       toast({
         title: "Login successful",
         description: "You’re being redirected to chat",
         status: "success",
         duration: 3000,
         isClosable: true,
       });

    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <form
        onSubmit={onSubmit}
        className="bg-white shadow rounded p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="text-sm text-slate-600">
          No account?{" "}
          <Link to="/signup" className="text-blue-700">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
