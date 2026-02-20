"use client" 

import { motion } from "motion/react";
 
export function ShiningText({ text }: { text: string }) {
  return (
    <motion.div
      className="text-base font-medium inline-block"
      style={{
        // 404040 is dark gray, fff is white
        backgroundImage: 'linear-gradient(110deg, #404040 45%, #fff 55%, #404040)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: "200% 0" }}
      animate={{ backgroundPosition: "-200% 0" }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: "linear",
      }}
    >
      {text}
    </motion.div>
  );
}
