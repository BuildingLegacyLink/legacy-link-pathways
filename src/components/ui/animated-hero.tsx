
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["modern", "automated", "tailored", "AI-powered", "human-first"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight text-center">
      Welcome to{' '}
      <span className="relative inline-block h-[1.2em] w-[280px] md:w-[400px]">
        {titles.map((title, index) => (
          <motion.span
            key={index}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent font-bold flex items-center justify-center"
            initial={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 50 }}
            animate={
              titleNumber === index
                ? {
                    y: 0,
                    opacity: 1,
                  }
                : {
                    y: titleNumber > index ? "-100%" : "100%",
                    opacity: 0,
                  }
            }
          >
            {title}
          </motion.span>
        ))}
      </span>
      {' '}financial planning.
    </h1>
  );
}

export { AnimatedHero };
