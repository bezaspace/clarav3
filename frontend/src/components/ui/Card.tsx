import { ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/src/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface CardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export function Card({ children, className, delay = 0, ...props }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "bg-card-bg rounded-2xl p-4 shadow-sm border border-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
