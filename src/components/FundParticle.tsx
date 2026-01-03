import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout } from "lucide-react";

interface FundParticleProps {
  isActive: boolean;
  onComplete: () => void;
  startPosition?: { x: number; y: number };
}

const FundParticle = ({ isActive, onComplete, startPosition }: FundParticleProps) => {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  useEffect(() => {
    if (isActive) {
      // Create particle from center of screen or provided position
      const startX = startPosition?.x ?? window.innerWidth / 2;
      const startY = startPosition?.y ?? window.innerHeight / 2;
      
      setParticles([{ id: Date.now(), x: startX, y: startY }]);
      
      // Clear after animation completes
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete, startPosition]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed z-[100] pointer-events-none"
          initial={{
            x: particle.x,
            y: particle.y,
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: window.innerWidth - 160, // Move to charity button position
            y: 32, // Top right
            scale: 0.5,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 1.2,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {/* Glowing particle */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-accent/40 rounded-full blur-xl animate-pulse" />
            
            {/* Inner particle */}
            <motion.div
              className="relative w-8 h-8 bg-gradient-to-br from-accent to-accent/70 rounded-full flex items-center justify-center shadow-lg"
              animate={{
                boxShadow: [
                  "0 0 20px hsl(var(--accent))",
                  "0 0 40px hsl(var(--accent))",
                  "0 0 20px hsl(var(--accent))",
                ],
              }}
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            >
              <Sprout className="w-4 h-4 text-accent-foreground" />
            </motion.div>

            {/* Trail effect */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              <div className="w-8 h-8 bg-accent/30 rounded-full" />
            </motion.div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

export default FundParticle;
