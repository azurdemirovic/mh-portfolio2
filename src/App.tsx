import { motion, useMotionValue, useTransform, useSpring, MotionValue } from "framer-motion";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";

const DISCO_KAVA_IMAGES = [
  "_DSC4215.webp", "_DSC1837.webp", "_DSC1856.webp", "_DSC1868.webp", "_DSC1903.webp",
  "_DSC1916.webp", "_DSC1952.webp", "_DSC2022.webp", "_DSC2077.webp", "_DSC2212.webp",
  "_DSC2347.webp", "_DSC2393.webp", "_DSC2426.webp", "_DSC2456.webp", "_DSC2511.webp",
  "_DSC2532.webp", "_DSC2665.webp", "_DSC2721.webp", "_DSC2814.webp", "_DSC2959.webp",
  "_DSC3820.webp", "_DSC3828.webp", "_DSC3939.webp", "_DSC3996.webp", "_DSC4084.webp",
  "_DSC4127.webp", "_DSC4191.webp", "_DSC4196.webp", "_DSC4243.webp", "_DSC4247.webp",
  "_DSC4335.webp", "_DSC4645.webp", "_DSC4702.webp", "_DSC4767.webp", "_DSC4884.webp",
  "_DSC4889.webp", "_DSC4890.webp", "_DSC5317.webp", "_DSC5379.webp", "_DSC5380.webp",
  "_DSC5382.webp", "_DSC5525.webp"
];

const PROJECTS_DATA = DISCO_KAVA_IMAGES.map((img, idx) => ({
  id: (idx + 1).toString().padStart(2, '0'),
  title: idx === 0 ? "DISCO & COFFEE" : `PROJECT ${idx + 1}`,
  image: `/discokava/${img}`
}));

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
const carouselStart = 0.65;

// SCROLL VALUES for non-linear mapping
const INTRO_SCROLL_END = 3000;      // Fast intro
const CAROUSEL_ENTRANCE_END = 8000;  // Slow entrance
const TOTAL_SCROLL_RANGE = 25000;    // Standard browse speed

function DispersingLetter({ char, progress, enterRange, disperseStart, disperseEnd, dispersal }: any) {
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

function ProjectCard({ project, idx, progress, pStart, pPeak, pEnd, CARD_WIDTH_VW, onHoverChange }: any) {
  const localScale = useMotionValue(1);
  const smoothScale = useSpring(localScale, { damping: 30, stiffness: 200 });
  const originX = useMotionValue(0.5);
  const originY = useMotionValue(0.5);
  const smoothOriginX = useSpring(originX, { damping: 40, stiffness: 300 });
  const smoothOriginY = useSpring(originY, { damping: 40, stiffness: 300 });
  const [isZoomed, setIsZoomed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((e: WheelEvent) => {
    const zoomSensitivity = 0.0015;
    const currentScale = localScale.get();
    const newScale = Math.min(Math.max(currentScale - e.deltaY * zoomSensitivity, 1), 4);
    localScale.set(newScale);
    setIsZoomed(newScale > 1.05);
  }, [localScale]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    originX.set((e.clientX - rect.left) / rect.width);
    originY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <div 
      ref={cardRef}
      className="relative flex-shrink-0 flex items-center justify-center pointer-events-none" 
      style={{ width: `${CARD_WIDTH_VW}vw`, height: '75vh' }}
    >
      <div className="w-full h-full flex items-center justify-center overflow-hidden">
        <motion.img 
          src={project.image} 
          alt={project.title} 
          className={`max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl pointer-events-auto ${isZoomed ? 'cursor-zoom-out' : 'cursor-crosshair'}`} 
          style={{ 
            scale: smoothScale,
            originX: smoothOriginX,
            originY: smoothOriginY
          }}
          onMouseEnter={() => onHoverChange(idx, handleWheel)}
          onMouseLeave={() => {
            onHoverChange(null, null);
            localScale.set(1);
            setIsZoomed(false);
          }}
          onMouseMove={handleMouseMove}
          loading={idx < 5 ? "eager" : "lazy"} 
        />
      </div>
      
      <motion.div 
        className="fixed top-12 left-12 text-white z-50 pointer-events-none" 
        style={{ opacity: useTransform(progress, [pStart, pPeak, pEnd], [0, 1, 0]) }}
      >
        <span className="text-xl font-light block opacity-50 mb-1">{project.id} /</span>
        <h3 className="text-4xl font-bold uppercase tracking-widest leading-tight">{project.title}</h3>
      </motion.div>
    </div>
  );
}

function App() {
  const scrollValue = useMotionValue(0);
  const smoothProgress = useSpring(scrollValue, { damping: 60, stiffness: 200 });

  // NON-LINEAR MAPPING
  // 0 -> 3000: Fast Intro (Phases 1 & 2 cover 0.65 progress)
  // 3000 -> 8000: Slow Carousel Entrance (0.65 -> 0.75)
  // 8000 -> 25000: Browsing (0.75 -> 1.0)
  const progress = useTransform(
    smoothProgress, 
    [0, INTRO_SCROLL_END, CAROUSEL_ENTRANCE_END, TOTAL_SCROLL_RANGE], 
    [0, carouselStart, 0.75, 1]
  );

  const [activeZoomHandler, setActiveZoomHandler] = useState<{idx: number, handler: (e: WheelEvent) => void} | null>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (activeZoomHandler) {
        activeZoomHandler.handler(e);
      } else {
        const sensitivity = 1.0;
        const newValue = scrollValue.get() + e.deltaY * sensitivity;
        scrollValue.set(Math.min(Math.max(newValue, 0), TOTAL_SCROLL_RANGE));
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [scrollValue, activeZoomHandler]);

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

  const CARD_WIDTH_VW = 60;
  const GAP_VW = 5;
  const STEP_VW = CARD_WIDTH_VW + GAP_VW;
  const INITIAL_OFFSET_VW = (100 - CARD_WIDTH_VW) / 2;

  const totalItems = PROJECTS_DATA.length + 1;
  const step = (1 - carouselStart) / totalItems;
  const carouselInput = [carouselStart, ...Array.from({length: totalItems}).map((_, i) => carouselStart + (i + 1) * step)];
  const carouselOutput = ["100vw", ...Array.from({length: totalItems}).map((_, i) => `${INITIAL_OFFSET_VW - (i * STEP_VW)}vw`)];
  const carouselX = useTransform(progress, carouselInput, carouselOutput);

  const handleHoverChange = useCallback((idx: number | null, handler: any) => {
    if (idx === null) setActiveZoomHandler(null);
    else setActiveZoomHandler({ idx, handler });
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white font-univers overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[8vw] font-bold uppercase tracking-tighter">
        <motion.div className="absolute top-1/2 left-1/2 flex items-center" style={{ transform: 'translate(-50%, -50%)', x: useTransform(progress, [0, entranceEnd, alignEnd], ["100vw", "5vw", "-15vw"]), y: useTransform(progress, [0, entranceEnd, alignEnd], ["-10vh", "-10vh", "-6vh"]) }}>
          {lettersMatej.map((char, i) => <DispersingLetter key={`m-${i}`} char={char} progress={progress} dispersal={dispMatej[i]} enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]} disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd} />)}
        </motion.div>
        <motion.div className="absolute top-1/2 left-1/2 flex items-center" style={{ transform: 'translate(-50%, -50%)', x: useTransform(progress, [0, entranceEnd, alignEnd], ["10vw", "10vw", "-15vw"]), y: useTransform(progress, [0, entranceEnd, alignEnd], ["100vh", "10vh", "6vh"]) }}>
          {lettersHanzel.map((char, i) => <DispersingLetter key={`h-${i}`} char={char} progress={progress} dispersal={dispHanzel[i]} enterRange={i === 0 ? [0, 0] : [alignEnd, expandEnd]} disperseStart={nameDisperseStart} disperseEnd={nameDisperseEnd} />)}
        </motion.div>
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-40">
        <motion.div className="flex text-[12vw] font-normal lowercase tracking-tight leading-none" style={{ y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]) }}>
          {lettersSelected.map((char, i) => <DispersingLetter key={`s-${i}`} char={char} progress={progress} dispersal={dispSelected[i]} enterRange={[titleEnterStart, titlePeak]} disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd} />)}
        </motion.div>
        <motion.div className="flex text-[12vw] font-bold uppercase tracking-[0.2em] outline-text text-transparent leading-none mt-[-2vw]" style={{ y: useTransform(progress, [titleEnterStart, titlePeak], ["-50vh", "0vh"]), WebkitTextStroke: '1px white' }}>
          {lettersWorks.map((char, i) => <DispersingLetter key={`w-${i}`} char={char} progress={progress} dispersal={dispWorks[i]} enterRange={[titleEnterStart, titlePeak]} disperseStart={titleDisperseStart} disperseEnd={titleDisperseEnd} />)}
        </motion.div>
      </div>

      <motion.div style={{ x: carouselX }} className="absolute inset-0 flex items-center z-30 pointer-events-none">
        <div className="flex items-center" style={{ gap: `${GAP_VW}vw` }}>
          {PROJECTS_DATA.map((project, idx) => (
            <ProjectCard 
              key={project.id} project={project} idx={idx} progress={progress}
              pPeak={carouselStart + ((idx + 1) * step)}
              pStart={carouselStart + ((idx + 1) * step) - (step * 0.4)}
              pEnd={carouselStart + ((idx + 1) * step) + (step * 0.4)}
              CARD_WIDTH_VW={CARD_WIDTH_VW}
              onHoverChange={handleHoverChange}
            />
          ))}
          
          <div 
            className="relative flex-shrink-0 flex items-center justify-center cursor-pointer pointer-events-auto group" 
            style={{ width: `${CARD_WIDTH_VW}vw`, height: '75vh' }}
            onClick={() => {
              // Return to title screen
              scrollValue.set(INTRO_SCROLL_END * (titlePeak / carouselStart));
            }}
          >
            <div className="flex items-center gap-6">
              <div 
                className="text-6xl text-transparent transition-all duration-500 group-hover:-translate-x-2"
                style={{ WebkitTextStroke: '1px white' }}
              >
                ←
              </div>
              <span 
                className="text-[4vw] font-normal lowercase tracking-tight text-transparent transition-all duration-500"
                style={{ WebkitTextStroke: '1px white' }}
              >
                back to start
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div style={{ opacity: useTransform(progress, [0, 0.02], [1, 0]) }} className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.5em] opacity-40 uppercase">
        Scroll to begin
      </motion.div>
    </div>
  );
}

export default App;
