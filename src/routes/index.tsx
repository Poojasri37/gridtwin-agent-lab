import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import hero from "@/assets/transformer-hero.jpg";
import { Logo } from "@/components/shell";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Sign in", "Enter the GridTwin AI command center — agentic intelligence for predictive power-grid maintenance."),
  component: Login,
});

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@gridtwin.ai");
  const [pw, setPw] = useState("demo123");
  const [err, setErr] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "admin@gridtwin.ai" && pw === "demo123") nav({ to: "/dashboard" });
    else setErr("Invalid demo credentials. Use admin@gridtwin.ai / demo123.");
  };
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4">
      <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/90" />
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="glass relative w-full max-w-md space-y-5 p-8">
        <Logo />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agentic Intelligence for Predictive Power Maintenance</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to the operations command center.</p>
        </div>
        <label className="block text-sm"><span className="text-muted-foreground">Email</span>
          <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-lg border border-input bg-surface/70 py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-ring" /></div>
        </label>
        <label className="block text-sm"><span className="text-muted-foreground">Password</span>
          <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} className="w-full rounded-lg border border-input bg-surface/70 py-2.5 pl-9 pr-3 outline-none focus:ring-2 focus:ring-ring" /></div>
        </label>
        {err && <p role="alert" className="text-xs text-critical">{err}</p>}
        <button className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground shadow-[0_0_30px_-8px_var(--primary)] hover:bg-primary/90">Enter Command Center</button>
        <p className="flex items-center gap-2 rounded-md bg-warning/10 p-2 text-[11px] text-warning"><ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Demo: admin@gridtwin.ai / demo123 · Synthetic data only</p>
      </motion.form>
    </div>
  );
}
