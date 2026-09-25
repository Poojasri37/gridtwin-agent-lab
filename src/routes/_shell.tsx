import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AppShell } from "@/components/shell";

export const Route = createFileRoute("/_shell")({ component: ShellLayout });

function ShellLayout() {
  const { pathname } = useLocation();
  return (
    <AppShell>
      <motion.div key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Outlet />
      </motion.div>
    </AppShell>
  );
}
