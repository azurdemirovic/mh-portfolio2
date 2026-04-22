import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect, useMemo } from "react";

const PROJECTS = [
  { id: "01", title: "Project Alpha", color: "#111" },
  { id: "02", title: "Project Beta", color: "#222" },
  { id: "03", title: "Project Gamma", color: "#333" },
  { id: "04", title: "Project Delta", color: "#444" },
];

// STABLE TIMINGS (Normalized 0.0 to 1.0)
const entranceEnd = 0.08;
const alignEnd = 0.16;
const expandEnd = 0.24;
const nameDisperseStart = 0.28;
const nameDisperseEnd = 0.38;

const titleEnterStart = 0.40;
const titlePeak = 0.50;
const titleDisperseStart = 0.54;
const titleDisperseEnd = 0.64;

const carouselStart = 0.68;

interface DispersingLetterProps {
  char: string;
  progress: MotionValue<number>;
  enterRange: [number, number]; // [Start appearing, Fully appeared]
  disperseStart: number;
  disperseEnd: number;
  dispersal: { x: number; y: number; rotate: number; delay: number };
}

function DispersingLetter({ char, progress, enterRange, disperseStart, disperseEnd, dispersal }: DispersingLetterProps) {
  // Ensure we have a strictly increasing timeline for dispersal
  // disperseStart is the global trigger, we add the individual delay
  const start = disperseStart + (dispersal.delay * (disperseEnd - disperseStart) * 0.5);
  const end = disperseEnd;

  // Single source of truth for all transforms
  const x = useTransform(progress, [start, end], ["0vw", `${dispersal.x}vw`]);
  const y = useTransform(progress, [start, end], ["0vh", `${dispersal.y}vh`]);
  const rotate = useTransform(progress, [start, end], [0, dispersal.rotate]);

  // Opacity: 0 -> 1 (Enter) -> 1 -> 0 (Disperse)
  // We use 4 points to ensure a stable 1.0 plateau
  const opacity = useTransform(
    progress, 
    [enterRange[0], enterRange[1], start, Math.max(start + 0.01, end - 0.02)], 
    [0, 1, 1, 0]
  );

  return (
    <motion.span
      style={{
        x, y, rotate, opacity,
        display: 'inline-block',
        marginLeft: "0.05em"
      }}
    >
      {char}
    </motion.span>
  );
}

function App() {
  const scrollValue = useMotionValue(0);
  const smoothProgress = useSpring(scrollValue, { damping: 50, stiffness: 300 });
  const progress = useTransform(smoothProgress, [0, 5000], [0, 1]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 0.8;
      const newValue = scrollValue.get() + e.deltaY * sensitivity;
      scrollValue.set(Math.min(Math.max(newValue, 0), 5000));
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollValue]);

  const lettersMatej = useMemo(() => "MATEJ".split(""), []);
  const lettersHanzel = useMemo(() => "HANŽEL".split(""), []);
  const lettersSelected = useMemo(() => "selected".split(""), []);
  const lettersWorks = useMemo(() => "WORKS".split(""), []);

  const getRandomDispersal = (dir: 'left' | 'bottom') => ({
    x: dir === 'left' ? -120 : (Math.random() - 0.5) * 80,
    y: dir === 'bottom' ? 120 : (Math.random() - 0.5) * 120,
    rotate: (Math.random() - 0.5) * 720,
    delay: Math.random() // Normalized 0-1 within the window
  });

  const dispMatej = useMemo(() => lettersMatej.map(() => getRandomDispersal('left')), [lettersMatej]);
  const dispHanzel = useMemo(() => lettersHanzel.map(() => getRandomDispersal('left')), [lettersHanzel]);
  const dispSelected = useMemo(() => lettersSelected.map(() => getRandomDispersal('bottom')), [lettersSelected]);
  const dispWorks = useMemo(() => lettersWorks.map(() => getRandomDispersal('bottom')), [lettersWorks]);

  return (
    <div className="fixed inset-0 bg-black text-white font-univers overflow-hidden flex items-center justify-center">
      
      {/* PHASE 1: NAMES */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[8vw] font-bold uppercase tracking-tighter">
        <motion.div 
          className="absolute top-1/2 left-1/2 flex items-center" 
          style={{ 
            transform: 'translate(-50%, -50%)', 
            x: useTransform(progress, [0, entranceEnd, alignEnd], ["100vw", "5vw", "-15vw"]), 
            y: useTransform(progress, [0, entranceEnd, alignEnd], ["-10vh", "-10vh", "-6vh"]) 
          }}
        >
          {lettersMatej.map((char, i) => (
            <DispersingLetter 
              key={`m-${i}`} char={char} progress={progress} dispersal={dispMatej[i]}
              enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]}
              disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="absolute top-1/2 left-1/2 flex items-center" 
          style={{ 
            transform: 'translate(-50%, -50%)', 
            x: useTransform(progress, [0, entranceEnd, alignEnd], ["10vw", "10vw", "-15vw"]), 
            y: useTransform(progress, [0, entranceEnd, alignEnd], ["100vh", "10vh", "6vh"]) 
          }}
        >
          {lettersHanzel.map((char, i) => (
            <DispersingLetter 
              key={`h-${i}`} char={char} progress={progress} dispersal={dispHanzel[i]}
              enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]}
              disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd}
            />
          ))}
        </motion.div>
      </div>

      {/* PHASE 2: SELECTED WORKS */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40">
        <motion.div 
          className="flex text-[12vw] font-normal lowercase tracking-tight leading-none"
          style={{ y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]) }}
        >
          {lettersSelected.map((char, i) => (
            <DispersingLetter 
              key={`s-${i}`} char={char} progress={progress} dispersal={dispSelected[i]}
              enterRange={[titleEnterStart, titlePeak]}
              disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd}
            />
          ))}
        </motion.div>
        
        <motion.div 
          className="flex text-[12vw] font-bold uppercase tracking-[0.2em] outline-text text-transparent leading-none mt-[-2vw]"
          style={{ 
            y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]),
            WebkitTextStroke: '1px white' 
          }}
        >
          {lettersWorks.map((char, i) => (
            <DispersingLetter 
              key={`w-${i}`} char={char} progress={progress} dispersal={dispWorks[i]}
              enterRange={[titleEnterStart, titlePeak]}
              disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd}
            />
          ))}
        </motion.div>
      </div>

      {/* PHASE 3: CAROUSEL */}
      <motion.div
        style={{ x: useTransform(progress, [carouselStart, 1], ["100vw", "-220vw"]) }}
        className="absolute inset-0 flex items-center pl-[30vw] z-30"
      >
        <div className="flex gap-[15vw]">
          {PROJECTS.map((project, idx) => {
            const pStart = carouselStart + (idx * 0.08);
            const pEnd = pStart + 0.08;
            return (
              <div key={project.id} className="relative flex-shrink-0 w-[60vw] h-[70vh] flex flex-col justify-end">
                <div className="w-full h-full bg-zinc-900 border border-white/10" style={{ backgroundColor: project.color }} />
                <motion.div 
                  className="fixed top-12 left-12 text-white z-50 pointer-events-none"
                  style={{ opacity: useTransform(progress, [pStart, pStart + 0.02, pEnd - 0.02, pEnd], [0, 1, 1, 0]) }}
                >
                  <span className="text-xl font-light block opacity-50 mb-1">{project.id} /</span>
                  <h3 className="text-4xl font-bold uppercase tracking-widest">{project.title}</h3>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        style={{ opacity: useTransform(progress, [0, 0.02], [1, 0]) }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] opacity-40 uppercase"
      >
        Scroll to begin
      </motion.div>
    </div>
  );
}

export default App;
