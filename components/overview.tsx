import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon } from "./icons";
import { LogoPython } from "@/app/icons";

export const Overview = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-2xl mx-auto">
        {/* Logo section with animation */}
        <motion.div
          className="flex flex-row justify-center gap-4 items-center"
          variants={itemVariants}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <LogoPython size={32} />
          </motion.div>
          <span className="text-foreground/50">+</span>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageIcon size={32} />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl md:text-4xl font-bold"
          variants={itemVariants}
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
            Atlas Agent
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p variants={itemVariants} className="text-foreground/80">
          An intelligent data analysis agent powered by{" "}
          <Link
            className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            href="https://fastapi.tiangolo.com"
            target="_blank"
          >
            FastAPI
          </Link>
          {" "}and{" "}
          <Link
            className="font-medium text-cyan-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            href="https://sdk.vercel.ai/docs"
            target="_blank"
          >
            Vercel AI SDK
          </Link>
          . Upload your data files and ask questions to unlock actionable insights.
        </motion.p>

        {/* Features */}
        <motion.div
          className="grid md:grid-cols-3 gap-4 py-6"
          variants={itemVariants}
        >
          {[
            { title: "📊 Data Analysis", desc: "Upload CSV, Excel & PDF files" },
            { title: "🤖 AI Powered", desc: "Advanced analytics engine" },
            { title: "⚡ Real-time", desc: "Instant streaming responses" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:border-cyan-400/50 transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <p className="font-semibold text-sm">{feature.title}</p>
              <p className="text-xs text-foreground/60 mt-1">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.p
          variants={itemVariants}
          className="text-sm text-foreground/60 pt-4"
        >
          Start by uploading a file or asking a question below →
        </motion.p>
      </div>
    </motion.div>
  );
};
