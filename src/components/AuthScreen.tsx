import React, { useState } from "react";
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from "../services/authService.ts";
import { LogIn, Mail, ArrowRight } from "lucide-react";

export const AuthScreen: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<"choose" | "email">("choose");
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithGoogle();
      onAuthSuccess();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Could not sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onAuthSuccess();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border border-slate-100">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
          <LogIn className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-slate-900">Sign in to continue</h1>
        <p className="mb-8 text-slate-500">Create a secure account to join rooms and save your language settings.</p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {mode === "choose" && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl border-2 border-slate-200 bg-white py-4 font-bold text-slate-800 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <svg className="h-5 w-5 mr-1" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.95l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" fill="#EA4335"/>
              </svg>
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <button
              onClick={() => setMode("email")}
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Mail className="h-5 w-5" />
              <span>Continue with Email</span>
            </button>
          </div>
        )}

        {mode === "email" && (
          <form onSubmit={handleEmailAuth} className="text-left">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-4 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <span>{loading ? "Please wait..." : (isLogin ? "Log In" : "Sign Up")}</span>
            </button>

            <div className="mt-4 text-center">
              <button 
                type="button" 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                {isLogin ? "Need an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <button 
                type="button" 
                onClick={() => setMode("choose")} 
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Back to options
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
