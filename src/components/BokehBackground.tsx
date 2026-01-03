import { motion } from "framer-motion";

const BokehBackground = () => {
  const bokehCircles = [
    { size: 120, x: "10%", y: "20%", duration: 25, delay: 0 },
    { size: 80, x: "85%", y: "15%", duration: 30, delay: 2 },
    { size: 150, x: "70%", y: "60%", duration: 35, delay: 4 },
    { size: 60, x: "25%", y: "70%", duration: 28, delay: 1 },
    { size: 100, x: "50%", y: "30%", duration: 32, delay: 3 },
    { size: 90, x: "15%", y: "50%", duration: 27, delay: 5 },
    { size: 70, x: "80%", y: "80%", duration: 29, delay: 2.5 },
    { size: 110, x: "40%", y: "85%", duration: 33, delay: 1.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bokehCircles.map((circle, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            width: circle.size,
            height: circle.size,
            left: circle.x,
            top: circle.y,
            background: `radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, hsl(var(--accent) / 0.02) 50%, transparent 70%)`,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [0.8, 1.1, 0.8],
            x: [0, 20, -10, 0],
            y: [0, -15, 10, 0],
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Extra subtle floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full bg-accent/10"
          style={{
            left: `${10 + (i * 7) % 80}%`,
            top: `${15 + (i * 11) % 70}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 8 + (i % 4) * 2,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default BokehBackground;
