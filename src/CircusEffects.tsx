import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function Spotlights() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Luz da Esquerda (Dourada) */}
      <motion.div
        animate={{ 
          rotate: [-15, 10, -15],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-60 -left-60 w-[1200px] h-[1200px] blur-[120px] origin-top-left mix-blend-screen rounded-full"
        style={{ 
          backgroundImage: 'radial-gradient(ellipse at center, rgba(255,224,102,0.18) 0%, transparent 70%)',
          transform: 'rotate(-15deg)' 
        }}
      />
      {/* Luz da Direita (Vermelha) */}
      <motion.div
        animate={{ 
          rotate: [15, -10, 15],
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.3, 1]
        }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-60 -right-60 w-[1200px] h-[1200px] blur-[120px] origin-top-right mix-blend-screen rounded-full"
        style={{ 
          backgroundImage: 'radial-gradient(ellipse at center, rgba(214,40,40,0.22) 0%, transparent 70%)',
          transform: 'rotate(15deg)' 
        }}
      />
    </div>
  );
}

export function Sparkles() {
  const [sparkles, setSparkles] = useState<{id: number, top: string, left: string, size: number, delay: number, duration: number}[]>([]);

  useEffect(() => {
    // Cria 80 estrelas mágicas espalhadas por toda a tela (Viewport)
    const newSparkles = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 14 + 6, // 6px a 20px
      delay: Math.random() * 8,
      duration: Math.random() * 5 + 3, // 3s a 8s
    }));
    setSparkles(newSparkles);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-[1]">
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 0, y: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 1, 0], 
            scale: [0, 1.4, 0],
            y: [-10, -100],
            rotate: [0, 270]
          }}
          transition={{ 
            duration: s.duration, 
            repeat: Infinity, 
            delay: s.delay,
            ease: "linear"
          }}
          className="absolute text-[#ffe066] drop-shadow-[0_0_15px_rgba(255,224,102,1)]"
          style={{ top: s.top, left: s.left, fontSize: s.size }}
        >
          ✦
        </motion.div>
      ))}
    </div>
  );
}
