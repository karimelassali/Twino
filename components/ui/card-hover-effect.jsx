import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export const HoverEffect = ({
  items,
  className
}) => {
  let [hoveredIndex, setHoveredIndex] = useState(null);
  let mouseX = useMotionValue(0);
  let mouseY = useMotionValue(0);

  function handleMouseMove({ clientX, clientY, currentTarget }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-10", className)}
      onMouseMove={handleMouseMove}>
      {items.map((item, idx) => (
        <motion.a
          href={item?.link}
          key={item?.link}
          className="relative group block p-2 h-full w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}>
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-700 dark:to-purple-800 block rounded-3xl opacity-90"
                layoutId="hoverBackground"
                initial={{ opacity: 0, borderRadius: "1rem" }}
                animate={{
                  opacity: 1,
                  borderRadius: "1.5rem",
                  transition: { duration: 0.2 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.2, delay: 0.1 },
                }} />
            )}
          </AnimatePresence>
          <Card 
            className={cn(
              'bg-white/90 border border-slate-200 shadow-lg backdrop-blur-sm transition-all duration-300',
              'dark:bg-slate-900/80 dark:border-slate-700',
              'group-hover:shadow-xl group-hover:border-slate-300 dark:group-hover:border-slate-600'
            )}
            mouseX={mouseX}
            mouseY={mouseY}
            isHovered={hoveredIndex === idx}>
            <CardTitle className="text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {item.generated_title || item.title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200">
              {item.description}
            </CardDescription>
            <motion.div 
              className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700"
              initial={{ scale: 1 }}
              animate={hoveredIndex === idx ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
              } : {}}
            >
              <Sparkles className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </motion.div>
          </Card>
        </motion.a>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
  mouseX,
  mouseY,
  isHovered
}) => {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const transform = useMotionTemplate`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const shine = useMotionTemplate`radial-gradient(circle at ${mouseX}px ${mouseY}px, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%)`;
  
  useEffect(() => {
    if (!cardRef.current || !isHovered) {
      setRotateX(0);
      setRotateY(0);
      return;
    }
    
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { left, top, width, height } = cardRef.current.getBoundingClientRect();
      
      const x = (clientX - left - width / 2) / (width / 2) * 5;
      const y = (clientY - top - height / 2) / (height / 2) * -5;
      
      setRotateX(y);
      setRotateY(x);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isHovered]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden relative z-20 transition-all duration-300",
        className
      )}
      style={{ transform }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}>
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
      {isHovered && (
        <motion.div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: shine }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.div>
  );
};

export const CardTitle = ({
  className,
  children
}) => {
  return (
    <motion.h4 
      className={cn("font-bold first-letter:uppercase tracking-wide mt-4 text-lg", className)}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}>
      {children}
    </motion.h4>
  );
};

export const CardDescription = ({
  className,
  children
}) => {
  return (
    <motion.p
      className={cn("mt-6 tracking-wide leading-relaxed text-sm", className)}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}>
      {children}
    </motion.p>
  );
};
