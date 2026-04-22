import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect, useMemo } from "react";

// List of all images in the discokava folder - updated to .webp
const DISCO_KAVA_IMAGES = [
  "_DSC4215.webp", "_DSC1837.webp", "_DSC1856.webp", "_DSC1868.webp", "_DSC1903.webp",
  "_DSC1916.webp", "_DSC1952.webp", "_DSC2022.webp", "_DSC2077.webp", "_DSC2212.webp",
  "_DSC2347.webp", "_DSC2393.webp", "_DSC2426.webp", "_DSC2456.webp", "_DSC2511.webp",
  "_DSC2532.webp", "_DSC2665.webp", "_DSC2721.webp", "_DSC2814.webp", "_DSC2959.webp",
  "_DSC3820.webp", "_DSC3828.webp", "_DSC3939.webp", "_DSC3996.webp", "_DSC4084.webp",
  "_DSC4127.webp", "_DSC4191.webp", "_DSC4196.webp", "_DSC4243.webp", "_DSC4247.webp",
  "_DSC4335.webp", "_DSC4645.webp", "_DSC4702.webp", "_DSC4767.webp", "_DSC4884.webp",
  "_DSC4889.webp", "_DSC4890.webp", "_DSC5317.webp", "_DSC5379.webp", "_DSC5380.webp",
  "_DSC5382.webp", "_DSC5525.webp", "Kopija dokumenta _DSC4215.webp"
];

const PROJECTS = DISCO_KAVA_IMAGES.map((img, idx) => ({
  id: (idx + 1).toString().padStart(2, '0'),
  title: idx === 0 ? "DISCO & COFFEE" : `PROJECT ${idx + 1}`,
  image: `/discokava/${img}`
}));

// STABLE TIMINGS
const entranceEnd = 0.08;
const alignEnd = 0.16;
const expandEnd = 0.24;
const nameDisperseStart = 0.28;
const nameDisperseEnd = 0.38;

const titleEnterStart = 0.40;
const titlePeak = 0.50;
const titleDisperseStart = 0.54;
const titleDisperseEnd = 0.64;

const carouselStart = 0.65;
const SCROLL_RANGE = 25000;

interface DispersingLetterProps {
  char: string;
  progress: MotionValue<number>;
  enterRange: [number, number];
  disperseStart: number;
  disperseEnd: number;
  dispersal: { x: number; y: number; rotate: number; delay: number };
}

function DispersingLetter({ char, progress, enterRange, disperseStart, disperseEnd, dispersal }: DispersingLetterProps) {
  const start = disperseStart + (dispersal.delay * (disperseEnd - disperseStart) * 0.5);
  const end = disperseEnd;
  const x = useTransform(progress, [start, end], ["0vw", `${dispersal.x}vw`]);
  const y = useTransform(progress, [start, end], ["0vh", `${dispersal.y}vh`]);
  const rotate = useTransform(progress, [start, end], [0, dispersal.rotate]);
  const opacity = useTransform(progress, [enterRange[0], enterRange[1], start, Math.max(start + 0.01, end - 0.02)], [0, 1, 1, 0]);

  return (
    <motion.span style={{ x, y, rotate, opacity, display: 'inline-block', marginLeft: "0.05em" }}>
      {char}
    </motion.span>
  );
}

function App() {
  const scrollValue = useMotionValue(0);
  const smoothProgress = useSpring(scrollValue, { damping: 60, stiffness: 200 });
  const progress = useTransform(smoothProgress, [0, SCROLL_RANGE], [0, 1]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const sensitivity = 1.5;
      const newValue = scrollValue.get() + e.deltaY * sensitivity;
      scrollValue.set(Math.min(Math.max(newValue, 0), SCROLL_RANGE));
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
    delay: Math.random()
  });

  const dispMatej = useMemo(() => lettersMatej.map(() => getRandomDispersal('left')), [lettersMatej]);
  const dispHanzel = useMemo(() => lettersHanzel.map(() => getRandomDispersal('left')), [lettersHanzel]);
  const dispSelected = useMemo(() => lettersSelected.map(() => getRandomDispersal('bottom')), [lettersSelected]);
  const dispWorks = useMemo(() => lettersWorks.map(() => getRandomDispersal('bottom')), [lettersWorks]);

  const step = (1 - carouselStart) / (PROJECTS.length);
  const carouselInput = [carouselStart, ...PROJECTS.map((_, i) => carouselStart + (i + 1) * step)];
  const carouselOutput = ["100vw", ...PROJECTS.map((_, i) => `${-10 - (i * 75)}vw`)];
  const carouselX = useTransform(progress, carouselInput, carouselOutput);

  return (
    <div className="fixed inset-0 bg-black text-white font-univers overflow-hidden flex items-center justify-center">
      
      {/* PHASE 1: NAMES */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[8vw] font-bold uppercase tracking-tighter">
        <motion.div className="absolute top-1/2 left-1/2 flex items-center" style={{ transform: 'translate(-50%, -50%)', x: useTransform(progress, [0, entranceEnd, alignEnd], ["100vw", "5vw", "-15vw"]), y: useTransform(progress, [0, entranceEnd, alignEnd], ["-10vh", "-10vh", "-6vh"]) }}>
          {lettersMatej.map((char, i) => <DispersingLetter key={`m-${i}`} char={char} progress={progress} dispersal={dispMatej[i]} enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]} disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd} />)}
        </motion.div>
        <motion.div className="absolute top-1/2 left-1/2 flex items-center" style={{ transform: 'translate(-50%, -50%)', x: useTransform(progress, [0, entranceEnd, alignEnd], ["10vw", "10vw", "-15vw"]), y: useTransform(progress, [0, entranceEnd, alignEnd], ["100vh", "10vh", "6vh"]) }}>
          {lettersHanzel.map((char, i) => <DispersingLetter key={`h-${i}`} char={char} progress={progress} dispersal={dispHanzel[i]} enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]} disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd} />)}
        </motion.div>
      </div>

      {/* PHASE 2: SELECTED WORKS */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40">
        <motion.div className="flex text-[12vw] font-normal lowercase tracking-tight leading-none" style={{ y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]) }}>
          {lettersSelected.map((char, i) => <DispersingLetter key={`s-${i}`} char={char} progress={progress} dispersal={dispSelected[i]} enterRange={[titleEnterStart, titlePeak]} disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd} />)}
        </motion.div>
        <motion.div className="flex text-[12vw] font-bold uppercase tracking-[0.2em] outline-text text-transparent leading-none mt-[-2vw]" style={{ y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]), WebkitTextStroke: '1px white' }}>
          {lettersWorks.map((char, i) => <DispersingLetter key={`w-${i}`} char={char} progress={progress} dispersal={dispWorks[i]} enterRange={[titleEnterStart, titlePeak]} disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd} />)}
        </motion.div>
      </div>

      {/* PHASE 3: CAROUSEL */}
      <motion.div style={{ x: carouselX }} className="absolute inset-0 flex items-center pl-[30vw] z-30">
        <div className="flex gap-[15vw]">
          {PROJECTS.map((project, idx) => {
            const pPeak = carouselStart + ((idx + 1) * step);
            const pStart = pPeak - (step * 0.4);
            const pEnd = pPeak + (step * 0.4);
            return (
              <div key={project.id} className="relative flex-shrink-0 w-[60vw] h-[70vh] flex flex-col justify-end">
                <div className="w-full h-full bg-zinc-900 overflow-hidden border border-white/10 grayscale hover:grayscale-0 transition-all duration-700">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover" loading={idx < 5 ? "eager" : "lazy"} />
                </div>
                <motion.div className="fixed top-12 left-12 text-white z-50 pointer-events-none" style={{ opacity: useTransform(progress, [pStart, pPeak, pEnd], [0, 1, 0]) }}>
                  <span className="text-xl font-light block opacity-50 mb-1">{project.id} /</span>
                  <h3 className="text-4xl font-bold uppercase tracking-widest leading-tight">{project.title}</h3>
                </motion.div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div style={{ opacity: useTransform(progress, [0, 0.02], [1, 0]) }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] opacity-40 uppercase">
        Scroll to begin
      </motion.div>
    </div>
  );
}

export default App;
