"use client";

import { Button } from "./ui/button";
import { GitIcon } from "./icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

export const Navbar = () => {
  const [isSpinning, setIsSpinning] = useState(false);

  const handleRefresh = () => {
    setIsSpinning(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="relative px-4 py-4 flex flex-row gap-2 justify-between items-center bg-background border-b border-border/40">
      {/* Left: Logo with refresh */}
      <motion.button
        onClick={handleRefresh}
        className="flex items-center gap-2 font-bold text-lg tracking-tighter hover:opacity-70 transition-opacity"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={isSpinning ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          onAnimationComplete={() => setIsSpinning(false)}
          className="flex items-center gap-1"
        >
          <span className="text-foreground/80">[</span>
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Atlas
          </span>
          <span className="text-foreground/80">]</span>
        </motion.div>
      </motion.button>

      {/* Right: View Source Code */}
      <Link href="https://github.com/yasser100ali/data_analyst">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button variant="outline" className="text-sm">
            <GitIcon /> View Source Code
          </Button>
        </motion.div>
      </Link>
    </div>
  );
};
