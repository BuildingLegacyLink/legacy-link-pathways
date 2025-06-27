
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
    <div className="text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
        Welcome to
      </h1>
      <div className="relative h-[1.2em] mb-2">
        {titles.map((title, index) => (
          <motion.h1
            key={index}
            className="absolute inset-0 text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight flex items-center justify-center"
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
          </motion.h1>
        ))}
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
        financial planning.
      </h1>
    </div>
  );
}

export { AnimatedHero };
