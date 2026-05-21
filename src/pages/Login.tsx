import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { login } from "../lib/api/auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated → redirect immediately
  useEffect(() => {
    if (isAuthenticated) navigate("/projects", { replace: true });
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await login(data);
      setAuth(response.token, response.user, response.refreshToken);
      navigate("/projects", { replace: true });
    } catch (err) {
      if (err instanceof Error) {
        if (
          err.message.toLowerCase().includes("invalid") ||
          err.message.toLowerCase().includes("credentials") ||
          err.message.toLowerCase().includes("unauthorized")
        ) {
          setError("Invalid email or password. Please try again.");
        } else if (
          err.message.toLowerCase().includes("fetch") ||
          err.message.toLowerCase().includes("network") ||
          err.message.toLowerCase().includes("failed to fetch")
        ) {
          setError("Cannot reach the server. Check your connection.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-zinc-950 flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(201,168,76,0.35), transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 inline-flex items-center justify-center">
              <img
                height={72}
                width={72}
                src="/logo.png"
                alt="GOTT WALD"
                className="rounded-full ring-1 ring-gold/40 shadow-lg shadow-black/40"
              />
            </div>
            <h1 className="font-brand text-2xl text-gold uppercase">
              Gott Wald
            </h1>
            <div className="mx-auto mt-3 h-px w-12 bg-gold/40" />
            <p className="text-[10px] text-zinc-500 mt-3 tracking-[0.3em] uppercase">
              Admin Panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="text-[10px] font-medium text-zinc-400 mb-1.5 block uppercase tracking-[0.2em]"
              >
                Email
              </label>
              <input
                id="login-email"
                {...register("email")}
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="admin@gottwald.com"
                className={`w-full px-3.5 py-2.5 rounded-lg bg-zinc-950/60 border text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                  errors.email
                    ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                    : "border-zinc-800 focus:border-gold/60 focus:ring-gold/20"
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="text-[10px] font-medium text-zinc-400 mb-1.5 block uppercase tracking-[0.2em]"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 pr-11 rounded-lg bg-zinc-950/60 border text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${
                    errors.password
                      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/20"
                      : "border-zinc-800 focus:border-gold/60 focus:ring-gold/20"
                  }`}
                />
                {/* Show / Hide toggle */}
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-gold transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Server-side / network error banner */}
            {error && (
              <div className="rounded-lg bg-red-950/40 border border-red-900/50 px-3.5 py-2.5">
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gold text-zinc-950 text-sm font-semibold uppercase tracking-[0.15em] hover:bg-gold-hover focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-gold/10"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Mock hint */}
          {import.meta.env.VITE_DATA_SOURCE === "mock" && (
            <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
              <p className="text-[10px] text-zinc-600 uppercase tracking-[0.25em]">
                Mock Mode
              </p>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                admin@gottwald.com / admin123
              </p>
            </div>
          )}
        </div>

        {/* Footer mark */}
        <p className="mt-6 text-center text-[10px] text-zinc-700 uppercase tracking-[0.3em]">
          GOTT WALD Holding LLC
        </p>
      </div>
    </div>
  );
}
