
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
      <div className="flex items-center justify-center mb-2">
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mr-4">
          Welcome to
        </h1>
        <div className="relative flex items-center w-80 justify-start">
          {titles.map((title, index) => (
            <motion.h1
              key={index}
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent leading-tight whitespace-nowrap"
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
              style={{
                position: titleNumber === index ? 'static' : 'absolute',
                top: titleNumber === index ? 'auto' : 0,
                left: titleNumber === index ? 'auto' : 0,
              }}
            >
              {title}
            </motion.h1>
          ))}
        </div>
      </div>
      <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
        financial planning.
      </h1>
    </div>
  );
}

export { AnimatedHero };
