import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin, useRegister } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "login") {
        await loginMutation.mutateAsync({ email, password });
        navigate("/projects");
      } else {
        await registerMutation.mutateAsync({ email, name, password });
        await loginMutation.mutateAsync({ email, password });
        navigate("/projects");
      }
    } catch {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  const isPending = loginMutation.isPending || registerMutation.isPending;

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", padding: 24 }}>
      <h1>{mode === "login" ? "Sign In" : "Create Account"}</h1>
      <form onSubmit={handleSubmit}>
        {mode === "register" && (
          <div>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" disabled={isPending}>
          {isPending ? "…" : mode === "login" ? "Sign In" : "Register"}
        </button>
      </form>
      <p>
        {mode === "login" ? "No account? " : "Already have an account? "}
        <button onClick={() => setMode(mode === "login" ? "register" : "login")}>
          {mode === "login" ? "Register" : "Sign In"}
        </button>
      </p>
    </div>
  );
}
