import { motion } from "framer-motion";

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
            Upload data, ask questions, and get answers from a coder agent that runs Python safely for real-time analysis.
          </p>
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
