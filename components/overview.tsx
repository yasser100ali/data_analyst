import { motion } from "framer-motion";
import Link from "next/link";

export const Overview = () => {
  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      key="overview"
      className="max-w-4xl mx-auto md:mt-20 px-4"
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
    >
      <div className="flex flex-col gap-12">
        {/* Title Section */}
        <motion.div variants={itemVariants} className="text-center">
          <h1 className="text-5xl md:text-6xl font-mono font-bold tracking-wider">
            <span className="text-cyan-400">&lt;</span>
            <span className="text-foreground">ATLAS</span>
            <span className="text-cyan-400">/&gt;</span>
          </h1>
          <p className="text-cyan-400 font-mono text-xs mt-4 tracking-widest">ADVANCED DATA INTELLIGENCE</p>
        </motion.div>

        {/* Description */}
        <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
          <p className="text-foreground/80 leading-relaxed text-center">
            Enterprise-grade data analysis powered by{" "}
            <Link
              className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
              href="https://fastapi.tiangolo.com"
              target="_blank"
            >
              FastAPI
            </Link>
            {" "}and{" "}
            <Link
              className="text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
              href="https://sdk.vercel.ai/docs"
              target="_blank"
            >
              Vercel AI SDK
            </Link>
            . Upload structured data and deploy intelligent queries in production environments.
          </p>
        </motion.div>

        {/* Specs Grid */}
        <motion.div
          variants={itemVariants}
          className="grid md:grid-cols-3 gap-px bg-gradient-to-br from-cyan-900/30 to-blue-900/30 p-px rounded-none"
        >
          {[
            { label: "DATA FORMATS", value: "CSV / EXCEL / PDF" },
            { label: "PROCESSING", value: "REAL-TIME STREAMING" },
            { label: "INFERENCE", value: "ADVANCED AI ENGINE" },
          ].map((spec, idx) => (
            <div
              key={idx}
              className="bg-background border border-cyan-900/40 p-6 hover:border-cyan-400/40 transition-colors"
            >
              <p className="text-cyan-400 font-mono text-xs tracking-wider mb-2">{spec.label}</p>
              <p className="text-foreground text-sm font-mono">{spec.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Instructions */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-foreground/60 font-mono text-xs tracking-wider uppercase">
            → Upload a file or submit a query to initialize analysis
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};
