"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, Lock, Mail, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RetailerLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false,
      });

      if (!result?.error) {
        router.push("/retailer/dashboard");
        router.refresh();
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center relative overflow-hidden text-neutral-50 px-4">
      {/* Background Gradient & Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.15),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(21,128,61,0.2),transparent_40%)]" />
      <div className="absolute inset-0 bg-[url('/retailers/Athawade%20Bazaar.jpg')] opacity-5 bg-cover bg-center mix-blend-overlay" />

      {/* Decorative Blur Circles */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/4 w-[28rem] h-[28rem] bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 transition-all duration-500 hover:shadow-green-900/20 transform hover:-translate-y-1">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 transform rotate-3 hover:rotate-6 transition-transform">
            <Leaf className="w-8 h-8 text-neutral-950" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
            Retailer Access
          </h1>
          <p className="text-neutral-400 mt-2 text-sm">
            Login to manage your agricultural marketplace
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-500 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-neutral-950/50 border border-white/5 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 outline-none hover:border-white/10"
                placeholder="Email address"
              />
            </div>

            {/* Password Field */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-500 group-focus-within:text-green-400 transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-neutral-950/50 border border-white/5 rounded-2xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 outline-none hover:border-white/10"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 cursor-pointer group">
              <input type="checkbox" className="form-checkbox h-4 w-4 rounded bg-neutral-950/50 border-white/10 text-green-500 focus:ring-green-500 focus:ring-offset-neutral-950" />
              <span className="text-neutral-400 group-hover:text-neutral-300 transition-colors">Remember me</span>
            </label>
            <a href="#" className="flex hover:text-green-400 text-neutral-400 transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl text-sm font-semibold text-neutral-950 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-neutral-950 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center gap-2">
              {isLoading ? "Authenticating..." : "Sign In"}
              {!isLoading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
            </span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-neutral-400 text-sm">
            New to Krishisetu?{" "}
            <a href="/signup" className="font-semibold text-green-400 hover:text-green-300 transition-colors">
              Register as Retailer
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
