const API_URL = import.meta.env.VITE_BACKEND_URL; 


export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export async function signupUser(data: SignupData) {
    console.log("SignUp data API_URL", data, import.meta.env);
  const res = await fetch(`${API_URL}/signup-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "Signup failed");
  }
  return res.json();
}

export async function loginUser(data: LoginData) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.message || "Login failed");
  }
  return res.json();
}


export async function validateOtpRequest(data: any) {
  console.log("data=====>", data);
  const res = await fetch(`${API_URL}/auth/otp-validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json(); 
}