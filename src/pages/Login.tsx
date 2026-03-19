import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
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
        if (err.message.includes("Invalid")) {
          setError("Invalid email or password");
        } else if (err.message.includes("fetch") || err.message.includes("network")) {
          setError("Connection failed. Please try again.");
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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl shadow-black/40">
          {/* Logo */}
          <div className="text-center mb-8">
           
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4">

            <img
                className="mx-auto"
                height={100}
                width={100}
                src="/logo.png"
                alt="GOTT WALD"
              />
            </div>
            <h1 className="text-xl font-black tracking-wider text-[#C9A84C] uppercase">
              GOTT WALD
            </h1>
            <p className="text-xs text-zinc-500 mt-1 tracking-widest uppercase">
              Admin Panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block uppercase tracking-wider">
                Email
              </label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@gottwald.com"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-zinc-400 mb-1.5 block uppercase tracking-wider">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500/20 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Inline Error */}
            {error && (
              <div className="rounded-lg bg-red-950/40 border border-red-900/50 px-3.5 py-2.5">
                <p className="text-xs text-red-400 font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Mock hint */}
          {import.meta.env.VITE_DATA_SOURCE === "mock" && (
            <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Mock Mode</p>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                admin@gottwald.com / admin123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
