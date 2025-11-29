"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";

export function NewsletterInline() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1500);
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-8 text-center backdrop-blur-sm animate-in fade-in zoom-in duration-300">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
           <Mail className="w-6 h-6 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-emerald-100 mb-2">Welcome to the Flock!</h3>
        <p className="text-emerald-200/70">You'll receive the next critical briefing in your inbox.</p>
        <Button 
            variant="ghost" 
            className="mt-4 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            onClick={() => setStatus("idle")}
        >
            Add another email
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-xl p-8 md:p-10 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-md text-center md:text-left">
          <h3 className="text-2xl font-bold text-white mb-2 font-heading">
            Don't get bitten by the wolves.
          </h3>
          <p className="text-zinc-400">
            Get a weekly summary of critical vulnerabilities affecting your specific tech stack. No spam, just signal.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
                type="email" 
                placeholder="security@company.com" 
                className="pl-10 bg-zinc-950/50 border-zinc-700 focus-visible:ring-emerald-500 h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
          </div>
          <Button 
            type="submit" 
            className="bg-emerald-600 hover:bg-emerald-500 text-white h-11 px-6 font-medium"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Joining..." : "Subscribe"}
          </Button>
        </form>
      </div>
    </div>
  );
}

