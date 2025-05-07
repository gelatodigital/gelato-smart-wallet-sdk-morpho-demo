"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isFirstMount, setIsFirstMount] = useState(true);

  useEffect(() => {
    setIsFirstMount(false);
  }, []);

  if (isFirstMount) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0.99 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0.99 }}
        transition={{
          duration: 0.2,
          ease: "linear",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
