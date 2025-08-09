"use client";
import { useState, useEffect, useRef } from "react";

const LagIndicator = () => {
  const [fps, setFps] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId;

    const calculateFps = (now) => {
      frameCount.current++;
      if (now - lastTime.current >= 1000) {
        setFps(frameCount.current);
        frameCount.current = 0;
        lastTime.current = now;
      }
      animationFrameId = requestAnimationFrame(calculateFps);
    };

    animationFrameId = requestAnimationFrame(calculateFps);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getFpsColor = () => {
    if (fps >= 50) return "text-green-500";
    if (fps >= 30) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div
      className="fixed bottom-4 right-4 bg-gray-900 bg-opacity-70 text-white p-2 rounded-lg shadow-lg z-[9999]"
      style={{ backdropFilter: "blur(5px)" }}
    >
      <span className={`font-bold text-lg ${getFpsColor()}`}>{fps}</span>
      <span className="text-sm ml-1">FPS</span>
    </div>
  );
};

export default LagIndicator;
