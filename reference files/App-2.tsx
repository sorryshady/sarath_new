import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Preloader from './components/Preloader';
import PhotographySection from './components/PhotographySection';
import WorkPage from './components/WorkPage';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useLayoutEffect(() => {
    // When returning to home, instantly restore scroll before paint
    if (currentPath === '/') {
      const t = setTimeout(() => {
        const savedScroll = window.sessionStorage.getItem('scrollPos');
        if (savedScroll) {
          window.scrollTo(0, parseInt(savedScroll, 10));
          window.sessionStorage.removeItem('scrollPos');
        } else {
          window.scrollTo(0, 0);
        }
        ScrollTrigger.refresh();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [currentPath, preloaderDone]);


  if (!preloaderDone) {
    return (
      <div className="fixed inset-0 bg-[#8b1e1e] z-50">
        <Preloader onComplete={() => setPreloaderDone(true)} />
      </div>
    );
  }

  if (currentPath.startsWith('/work/')) {
    const slug = currentPath.split('/work/')[1];
    return (
      <>
        <WorkPage slug={slug} />
        <div className="paper z-[9998] pointer-events-none"> </div>
      </>
    );
  }

  return (
    <div className="bg-[#F9F6F0] w-full relative overflow-x-hidden">
      <HeroScene />
      <PhotographySection />
      <div className="h-screen flex items-center justify-center bg-[#F9F6F0] text-black border-t border-[#111]/10">
        <h2 className="font-anton text-4xl sm:text-6xl uppercase tracking-widest text-[#111]/20">
          The Beyond
        </h2>
      </div>
      <div className="paper z-[9998] pointer-events-none"> </div>
    </div>
  );
}

function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const maskRectRef = useRef<SVGRectElement>(null);
  const visibleRectRef = useRef<SVGRectElement>(null);
  const leftTextRef = useRef<SVGTextElement>(null);
  const rightTextRef = useRef<SVGTextElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bgOverlayRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: true,
        },
      });

      // Step 1: Fade out UI decorations
      tl.to(headerRef.current, {
        opacity: 0,
        duration: 0.2,
      }, 0);

      // Step 2 & 3: Drop and Text Creep (concurrently)
      tl.to([maskRectRef.current, visibleRectRef.current], {
        attr: { height: '100%' },
        duration: 0.8,
        ease: 'power2.inOut',
      }, 0.2);

      tl.to([leftTextRef.current, rightTextRef.current], {
        attr: { y: '65%' },
        duration: 0.8,
        ease: 'power2.inOut',
      }, 0.2);

      tl.to(circleRef.current, {
        attr: { cy: '65%' },
        duration: 0.8,
        ease: 'power2.inOut',
      }, 0.2);

      // Step 4: The Massive Zoom
      tl.to(svgRef.current, {
        scale: 250,
        transformOrigin: '50% 65%',
        ease: 'power3.in',
        duration: 1.5,
      }, 0.8);

      // Step 5: The Hand-off
      tl.to(svgRef.current, {
        opacity: 0,
        duration: 0.4,
      }, 1.9);

      tl.to(bgOverlayRef.current, {
        opacity: 0,
        duration: 0.4,
      }, 1.9);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[#8B1E1E] text-black w-full relative">

      <div ref={containerRef} className="h-screen w-full overflow-hidden relative font-anton">
        {/* Background Layer */}
      
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat will-change-transform"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2940&q=80')" }}
          />
          <div
            ref={bgOverlayRef}
            className="absolute inset-0 w-full h-full will-change-transform"
            style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), radial-gradient(circle at 20% 30%, rgba(58,58,58,0.8) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(26,26,26,0.8) 0%, transparent 50%), repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 4px)" }}
          />
        </div>
 

        {/* UI Decorations Layer */}
        <div ref={headerRef} className="absolute top-0 left-0 w-full z-20 flex justify-between p-8 text-white uppercase tracking-widest text-xs font-sans font-bold">
          <div>O7.2 - ARCHIVE</div>
          <div>EST. 2026</div>
        </div>

        {/* SVG Overlay Layer */}
        <svg ref={svgRef} className="absolute inset-0 z-10 w-full h-full pointer-events-none">
          <defs>
            <mask id="cutout-mask">
              {/* Act 1: The white base */}
              <rect ref={maskRectRef} width="100%" height="50%" fill="white" />
              
              {/* Act 2: The transparent (black) cutouts */}
              <text 
                ref={leftTextRef} 
                x="46%" 
                y="50%" 
                textAnchor="end" 
                dominantBaseline="alphabetic" 
                dy="0.25em" 
                fill="black"
                style={{ fontSize: '10vw' }}
              >
                SARATH
              </text>
              <circle 
                ref={circleRef} 
                cx="50%" 
                cy="50%" 
                r="2.2vw" 
                fill="black" 
              />
              <text 
                ref={rightTextRef} 
                x="54%" 
                y="50%" 
                textAnchor="start" 
                dominantBaseline="alphabetic" 
                dy="0.25em" 
                fill="black"
                style={{ fontSize: '10vw' }}
              >
                MENON
              </text>
            </mask>
          </defs>

          {/* Act 3: The visual block */}
          <rect 
            ref={visibleRectRef} 
            width="100%" 
            height="50%" 
            fill="#8b1e1e" 
            mask="url(#cutout-mask)" 
          />
        </svg>
      </div>

    </div>
  );
}
