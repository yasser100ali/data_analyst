"use client";

import { Button } from "./ui/button";
import { GitIcon } from "./icons";
import Link from "next/link";
import { motion } from "framer-motion";

export const Navbar = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="px-4 py-3 flex flex-row gap-2 justify-between items-center bg-background border-b border-cyan-900/20">
      {/* Left: Logo with refresh */}
      <motion.button
        onClick={handleRefresh}
        className="flex items-center gap-1 font-mono font-bold text-sm tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
        whileTap={{ scale: 0.98 }}
      >
        <span className="text-foreground/40">&lt;</span>
        <span>ATLAS</span>
        <span className="text-foreground/40">/&gt;</span>
      </motion.button>

      {/* Right: About + View Source */}
      <div className="relative flex items-center gap-2">
        <Link href="/about">
          <Button variant="outline" className="text-xs font-mono">
            ABOUT
          </Button>
        </Link>

        <Link href="https://github.com/yasser100ali/data_analyst">
          <Button variant="outline" className="text-xs font-mono">
            <GitIcon /> SOURCE
          </Button>
        </Link>
      </div>
    </div>
  );
};
