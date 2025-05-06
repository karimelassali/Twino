"use client";
import React from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration = 5000,
  className,
  colorMode = "rainbow",
  isDarkMode = true,
  ...otherProps
}) {
  const colors = {
    rainbow: "bg-[radial-gradient(var(--tw-gradient-stops))] from-purple-500 via-pink-500 to-blue-500",
    blue: "bg-[radial-gradient(#0ea5e9_40%,#3b82f6_70%,transparent_90%)]",
    purple: "bg-[radial-gradient(#8b5cf6_40%,#a855f7_70%,transparent_90%)]",
    green: "bg-[radial-gradient(#22c55e_40%,#10b981_70%,transparent_90%)]",
    orange: "bg-[radial-gradient(#f97316_40%,#ea580c_70%,transparent_90%)]",
    pink: "bg-[radial-gradient(#ec4899_40%,#be185d_70%,transparent_90%)]",
  };
  
  const colorClass = colors[colorMode] || colors.rainbow;
  
  return (
    <Component
      className={cn(
        "relative h-12 w-40 overflow-hidden bg-transparent p-[1px] text-xl hover:scale-105 transition-transform duration-300",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}>
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}>
        <MovingBorder duration={duration} rx="30%" ry="30%" isDarkMode={isDarkMode}>
          <div
            className={cn(
              "h-20 w-20 opacity-[0.9] animate-pulse",
              colorClass,
              borderClassName
            )} />
        </MovingBorder>
      </div>
      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border-2 text-sm antialiased backdrop-blur-xl transition-all duration-300 hover:shadow-lg",
          isDarkMode 
            ? "border-slate-700/50 bg-black/80 text-white hover:bg-black/70" 
            : "border-slate-300/70 bg-white/90 text-slate-800 hover:bg-white/95",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}>
        {children}
      </div>
    </Component>
  );
}

export const MovingBorder = ({
  children,
  duration = 3000,
  rx,
  ry,
  isDarkMode = true,
  ...otherProps
}) => {
  const pathRef = useRef();
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMillisecond = length / duration;
      progress.set((time * pxPerMillisecond) % length);
    }
  });

  const x = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).x);
  const y = useTransform(progress, (val) => pathRef.current?.getPointAtLength(val).y);

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}>
        <rect fill="none" width="100%" height="100%" rx={rx} ry={ry} ref={pathRef} />
        <rect
          className="animate-pulse"
          fill="none"
          stroke={isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(30,64,175,0.3)"}
          strokeWidth="2"
          width="100%"
          height="100%"
          rx={rx}
          ry={ry} />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
          filter: "blur(1px)",
        }}
        whileHover={{ filter: "blur(0px)", scale: 1.05 }}
        transition={{ duration: 0.2 }}>
        {children}
      </motion.div>
    </>
  );
};
