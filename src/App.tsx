import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useMemo } from "react";

function App() {
  // Increased range to 2000 to accommodate more phases
  const scrollValue = useMotionValue(0);
  const smoothProgress = useSpring(scrollValue, { damping: 50, stiffness: 300 });
  const progress = useTransform(smoothProgress, [0, 2000], [0, 1]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 0.5;
      const newValue = scrollValue.get() + e.deltaY * sensitivity;
      scrollValue.set(Math.min(Math.max(newValue, 0), 2000));
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollValue]);

  // Define random dispersal values for each letter
  const lettersMatej = useMemo(() => "MATEJ".split(""), []);
  const lettersHanzel = useMemo(() => "HANŽEL".split(""), []);

  const getRandomDispersal = () => ({
    y: (Math.random() - 0.5) * 100, // Random Y drift
    rotate: (Math.random() - 0.5) * 720, // Random rotation
    delay: Math.random() * 0.1 // Stagger
  });

  const dispersalMatej = useMemo(() => lettersMatej.map(getRandomDispersal), [lettersMatej]);
  const dispersalHanzel = useMemo(() => lettersHanzel.map(getRandomDispersal), [lettersHanzel]);

  // Animation Ranges
  const entranceEnd = 0.2;
  const alignEnd = 0.4;
  const expandEnd = 0.6;
  const disperseStart = 0.65;
  const disperseEnd = 0.8;
  const titleStart = 0.85;

  // Base M/H positions (shared by all letters in the word during expansion)
  const mBaseX = useTransform(progress, [0, entranceEnd, alignEnd], ["100vw", "5vw", "-15vw"]);
  const mBaseY = useTransform(progress, [0, entranceEnd, alignEnd], ["-10vh", "-10vh", "-6vh"]);
  
  const hBaseX = useTransform(progress, [0, entranceEnd, alignEnd], ["10vw", "10vw", "-15vw"]);
  const hBaseY = useTransform(progress, [0, entranceEnd, alignEnd], ["100vh", "10vh", "6vh"]);

  // Expansion
  const expansionOpacity = useTransform(progress, [alignEnd, expandEnd], [0, 1]);
  const expansionXOffset = useTransform(progress, [alignEnd, expandEnd], ["-3vw", "0vw"]);

  // Title Animation
  const titleY = useTransform(progress, [titleStart, 1], ["-100vh", "0vh"]);
  const titleOpacity = useTransform(progress, [titleStart, titleStart + 0.05], [0, 1]);

  const renderLetter = (char: string, index: number, isMatej: boolean, dispersal: any) => {
    const isMain = index === 0;
    
    // Position
    const baseX = isMatej ? mBaseX : hBaseX;
    const baseY = isMatej ? mBaseY : hBaseY;

    // Dispersal transforms
    const dispX = useTransform(progress, [disperseStart + dispersal.delay, disperseEnd], ["0vw", "-120vw"]);
    const dispY = useTransform(progress, [disperseStart + dispersal.delay, disperseEnd], ["0vh", `${dispersal.y}vh`]);
    const dispRotate = useTransform(progress, [disperseStart + dispersal.delay, disperseEnd], [0, dispersal.rotate]);
    const dispOpacity = useTransform(progress, [disperseStart + dispersal.delay, disperseEnd - 0.05], [1, 0]);

    return (
      <motion.span
        key={index}
        style={{
          x: dispX,
          y: dispY,
          rotate: dispRotate,
          opacity: isMain ? dispOpacity : useTransform(progress, [alignEnd, expandEnd, disperseStart + dispersal.delay, disperseEnd - 0.05], [0, 1, 1, 0]),
          display: 'inline-block',
          marginLeft: isMain ? 0 : "0.1em"
        }}
      >
        {char}
      </motion.span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-white font-univers overflow-hidden flex items-center justify-center">
      
      {/* Name Viewport */}
      <div className="relative text-[8vw] leading-none font-bold uppercase tracking-tighter w-full h-full flex items-center justify-center pointer-events-none">
        
        {/* MATEJ ROW */}
        <motion.div 
          className="absolute top-1/2 left-1/2 flex items-center" 
          style={{ transform: 'translate(-50%, -50%)', x: mBaseX, y: mBaseY }}
        >
          {lettersMatej.map((char, i) => renderLetter(char, i, true, dispersalMatej[i]))}
        </motion.div>

        {/* HANŽEL ROW */}
        <motion.div 
          className="absolute top-1/2 left-1/2 flex items-center" 
          style={{ transform: 'translate(-50%, -50%)', x: hBaseX, y: hBaseY }}
        >
          {lettersHanzel.map((char, i) => renderLetter(char, i, false, dispersalHanzel[i]))}
        </motion.div>

      </div>

      {/* Title Placeholder */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
      >
        <h2 className="text-[12vw] font-bold uppercase tracking-[0.2em]">SELECTED</h2>
        <h2 className="text-[12vw] font-bold uppercase tracking-[0.2em] outline-text text-transparent" style={{ WebkitTextStroke: '1px white' }}>WORKS</h2>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: useTransform(progress, [0, 0.05], [1, 0]) }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] opacity-40 uppercase"
      >
        Scroll to begin
      </motion.div>
    </div>
  );
}

export default App;
