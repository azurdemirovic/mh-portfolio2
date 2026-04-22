import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect } from "react";

function App() {
  // Virtual scroll progress (0 to 1000 for granularity)
  const scrollValue = useMotionValue(0);
  
  // Smooth out the manual scroll input
  const smoothProgress = useSpring(scrollValue, {
    damping: 50,
    stiffness: 300,
    restDelta: 0.001
  });

  // Map 0-1000 to 0-1 progress
  const progress = useTransform(smoothProgress, [0, 1000], [0, 1]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Prevent actual page scrolling
      e.preventDefault();
      
      const sensitivity = 0.5;
      const newValue = scrollValue.get() + e.deltaY * sensitivity;
      
      // Clamp between 0 and 1000
      scrollValue.set(Math.min(Math.max(newValue, 0), 1000));
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollValue]);

  // M POSITIONING
  const mX = useTransform(progress, [0, 0.33, 0.66], ["100vw", "5vw", "-15vw"]);
  const mY = useTransform(progress, [0, 0.33, 0.66], ["-10vh", "-10vh", "-6vh"]);

  // H POSITIONING
  const hX = useTransform(progress, [0, 0.33, 0.66], ["10vw", "10vw", "-15vw"]);
  const hY = useTransform(progress, [0, 0.33, 0.66], ["100vh", "10vh", "6vh"]);

  // TEXT EXPANSION
  const expansionOpacity = useTransform(progress, [0.75, 0.95], [0, 1]);
  const expansionXOffset = useTransform(progress, [0.75, 0.95], ["-3vw", "0vw"]);
  
  return (
    <div className="fixed inset-0 bg-black text-white font-univers overflow-hidden flex items-center justify-center">
      
      {/* Central Viewport */}
      <div className="relative text-[8vw] leading-none font-bold uppercase tracking-tighter w-full h-full flex items-center justify-center">
        
        {/* MATEJ ROW */}
        <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
          <motion.div style={{ x: mX, y: mY }} className="flex items-center">
            <span>M</span>
            <motion.span 
              style={{ 
                opacity: expansionOpacity, 
                x: expansionXOffset,
              }}
            >
              ATEJ
            </motion.span>
          </motion.div>
        </div>

        {/* HANŽEL ROW */}
        <div className="absolute top-1/2 left-1/2" style={{ transform: 'translate(-50%, -50%)' }}>
          <motion.div style={{ x: hX, y: hY }} className="flex items-center">
            <span>H</span>
            <motion.span 
              style={{ 
                opacity: expansionOpacity, 
                x: expansionXOffset,
              }}
            >
              ANŽEL
            </motion.span>
          </motion.div>
        </div>

      </div>

      {/* Instructions */}
      <motion.div 
        style={{ opacity: useTransform(progress, [0, 0.05], [1, 0]) }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] opacity-40 uppercase"
      >
        Use Wheel to explore
      </motion.div>
    </div>
  );
}

export default App;
