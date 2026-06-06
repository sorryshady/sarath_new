import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useTransitionStore } from '../store/transitionStore';
import { seriesData } from '../data/series';

gsap.registerPlugin(ScrollTrigger, Flip);

const gridTransforms = [
  { rotate: -2.5, mt: 0 },
  { rotate: 1.8, mt: 16 },
  { rotate: -1.2, mt: 0 },
  { rotate: 3, mt: -8 },
  { rotate: -2, mt: 12 },
  { rotate: 1.4, mt: -4 },
];

const SplitText = ({ text }: { text: string }) => {
  return (
    <span className="inline-block whitespace-nowrap">
      {text.split('').map((char, index) => (
        <span key={index} className="char inline-block opacity-0">
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default function PhotographySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const scrollLabelRef = useRef<HTMLDivElement>(null);
  const polaroidRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const titleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const metaRefs = useRef<(HTMLDivElement | null)[]>([]);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [isSettled, setIsSettled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const stripRef = useRef<HTMLDivElement>(null);

  const { isTransitioning, setTransition } = useTransitionStore();

  const getAnimationMode = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return 'reduced';
    }
    if (navigator.hardwareConcurrency < 4) {
      return 'reduced';
    }
    return 'full';
  };

  useLayoutEffect(() => {
    const mobileCheck = window.innerWidth < 768;
    setIsMobile(mobileCheck);
    const animationMode = getAnimationMode();
    const isReduced = animationMode === 'reduced';

    const ctx = gsap.context(() => {
      // Set grid transforms initially (for desktop)
      if (!mobileCheck) {
        polaroidRefs.current.forEach((el, i) => {
          if (el) {
            gsap.set(el, {
              rotation: gridTransforms[i]?.rotate || 0,
              marginTop: gridTransforms[i]?.mt || 0,
            });
          }
        });
      }

      if (mobileCheck) {
        // Mobile Auto-Play timeline (No Pinning)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top center+=20%',
          }
        });

        polaroidRefs.current.forEach((el, i) => {
          if (innerRefs.current[i] && !isReduced) {
            tl.to(innerRefs.current[i], {
              rotateY: 180,
              duration: 0.6,
              ease: 'power2.inOut',
            }, 0.2 + i * 0.08);
          } else if (innerRefs.current[i]) {
            tl.from(innerRefs.current[i], {
              scale: 0.9, opacity: 0, duration: 0.6
            }, 0.2 + i * 0.08);
          }
          const chars = el?.querySelectorAll('.char');
          if (chars && chars.length > 0) {
            tl.to(chars, { opacity: 1, duration: 0.05, stagger: 0.02 }, 0.8 + i * 0.08);
          }
          if (metaRefs.current[i]) {
            tl.to(metaRefs.current[i], { opacity: 1, duration: 0.2 }, 1.0 + i * 0.08);
          }
        });
        
        tl.to(viewAllRef.current, { 
          opacity: 1, 
          duration: 0.2, 
          onComplete: () => setIsSettled(true) 
        }, "+=0.2");

        return;
      }

      // Desktop / Tablet Sequence using Flip
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=250%',
          pin: true,
          scrub: 1,
          onLeave: () => setIsSettled(true),
          onEnterBack: () => setIsSettled(false),
        }
      });

      // Ensure natural grid positions are set before measuring
      polaroidRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.set(el, { clearProps: 'all' });
        gsap.set(el, {
          rotation: gridTransforms[i]?.rotate || 0,
          marginTop: gridTransforms[i]?.mt || 0
        });
      });

      // Recalculate dx/dy accurately relative to section
      const pRect = sectionRef.current!.getBoundingClientRect();
      const targetCx = pRect.width / 2;
      const targetCy = window.innerHeight / 2;

      polaroidRefs.current.forEach((el, i) => {
        if (!el) return;
        
        const rect = el.getBoundingClientRect();
        // Calculate original center coordinate local to the section container
        const elCx = (rect.left - pRect.left) + rect.width / 2;
        const elCy = (rect.top - pRect.top) + rect.height / 2;

        const dx = targetCx - elCx;
        const dy = targetCy - elCy;

        const startRot = -8 + Math.random() * 16;
        
        // Let it start at dx, dy (stack center) and animate to 0, 0 (natural grid)
        tl.fromTo(el, {
          x: dx,
          y: dy,
          rotation: startRot,
        }, {
          x: 0,
          y: 0,
          rotation: gridTransforms[i]?.rotate || 0,
          duration: 0.8,
          ease: 'power2.out',
        }, 0);
      });

      tl.to(headingRef.current, { opacity: 1, duration: 0.5 }, 0);
      tl.to(scrollLabelRef.current, { opacity: 0, duration: 0.1 }, 0);

      // Flip 3D
      if (!isReduced) {
        tl.to(innerRefs.current, {
          rotateY: 180,
          duration: 0.6,
          ease: 'power2.inOut',
          stagger: 0.08
        }, 0.5);
      } else {
        tl.from(innerRefs.current, {
          scale: 0.9,
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.08
        }, 0.5);
      }

      // Title & Meta Type in
      polaroidRefs.current.forEach((el, i) => {
        const chars = el?.querySelectorAll('.char');
        if (chars && chars.length > 0) {
          tl.to(chars, { opacity: 1, duration: 0.02, stagger: 0.04 }, 0.75 + i * 0.08);
        }
        if (metaRefs.current[i]) {
          tl.to(metaRefs.current[i], { opacity: 1, duration: 0.05 }, 0.8 + i * 0.08);
        }
      });

      // Settle
      tl.to(viewAllRef.current, { opacity: 1, duration: 0.05 }, 0.95);

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleMouseEnter = (e: React.MouseEvent, i: number) => {
    if (!isSettled) return;
    const el = e.currentTarget;
    gsap.to(el, {
      rotation: 0,
      y: -6,
      duration: 0.3,
      ease: 'power2.out'
    });
    // Deepen shadow on inner
    if (innerRefs.current[i]) {
      const faces = innerRefs.current[i]!.querySelectorAll('.face-shadow');
      gsap.to(faces, { boxShadow: '4px 10px 32px rgba(0,0,0,0.28)', duration: 0.3 });
    }
    const overlay = el.querySelector('.hover-overlay');
    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.3 });
  };

  const handleMouseLeave = (e: React.MouseEvent, i: number) => {
    if (!isSettled) return;
    const el = e.currentTarget;
    const isDesktop = window.innerWidth >= 1024;
    gsap.to(el, {
      rotation: isDesktop ? gridTransforms[i]?.rotate || 0 : 0,
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
    if (innerRefs.current[i]) {
      const faces = innerRefs.current[i]!.querySelectorAll('.face-shadow');
      gsap.to(faces, { boxShadow: '3px 6px 20px rgba(0,0,0,0.18)', duration: 0.3 });
    }
    const overlay = el.querySelector('.hover-overlay');
    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
  };

  const handleSeriesClick = (e: React.MouseEvent, slug: string, index: number) => {
    if (!isSettled && !isMobile) return;
    
    window.sessionStorage.setItem('scrollPos', window.scrollY.toString());
    const cardRef = polaroidRefs.current[index];
    if (!cardRef) return;

    const imageEl = cardRef.querySelector('.polaroid-image') as HTMLElement;
    if (!imageEl) return;

    const rect = imageEl.getBoundingClientRect();

    // 1. Create a portal image on document.body — outside React tree
    const portal = document.createElement('img');
    portal.src = seriesData[index].coverImage;
    portal.setAttribute('data-transition-portal', 'true');
    portal.style.cssText = `
      position: fixed;
      top: ${rect.top}px;
      left: ${rect.left}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      object-fit: cover;
      z-index: 9995;
      pointer-events: none;
      margin: 0;
      padding: 0;
      border: none;
    `;
    document.body.appendChild(portal);

    // 2. Fade out polaroid chrome instantly
    gsap.to(cardRef.querySelector('.face-shadow'), { boxShadow: 'none', duration: 0.12 });
    gsap.to(cardRef.querySelector('.polaroid-caption-container'), { opacity: 0, duration: 0.12 });

    // 3. Fade out other polaroids
    polaroidRefs.current.forEach((el) => {
      if (el !== cardRef) gsap.to(el, { opacity: 0, duration: 0.25 });
    });

    // Fade out original image so it doesn't double up
    gsap.set(imageEl, { opacity: 0 });

    // 4. Store transition state in Zustand
    setTransition(seriesData[index].coverImage, rect);

    // 5. Expand portal image to fill viewport area
    gsap.to(portal, {
      top: 0,
      left: 0,
      width: '100vw',
      height: '75vh',
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        window.history.pushState({}, '', '/work/' + slug);
        window.dispatchEvent(new Event('popstate'));
      }
    });
  };

  const handleScrollStripEvent = () => {
    if (!stripRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = stripRef.current;
    
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  const handleTouchStart = () => {
    if (!hasSwiped) {
      setHasSwiped(true);
    }
  };

  const manuallyScrollStrip = (direction: 'left' | 'right') => {
    if (!stripRef.current) return;
    const scrollAmount = 224; // 200px width + 24px gap
    stripRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <section 
      ref={sectionRef} 
      data-nav-theme="light" 
      className="relative w-full min-h-screen bg-[#F9F6F0] overflow-hidden flex flex-col items-center pt-8 md:pt-16"
    >
      {/* Background Heading */}
      <div 
        ref={headingRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontWeight: 300,
          fontSize: 'clamp(80px, 14vw, 160px)',
          color: '#111',
          opacity: isMobile ? 1 : 0.06,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        Frames
      </div>

      {/* Header Row */}
      <div className="w-full flex justify-between items-end pb-4 border-b border-[#111]/10 px-8 lg:px-16 z-10 relative">
        <h2 className="font-serif font-semibold text-[24px] md:text-[32px] text-[#111] leading-none">Selected Work</h2>
        <span className="font-mono text-[9px] tracking-[0.14em] text-[#aaa]">
          {seriesData.length < 10 ? `0${seriesData.length}` : seriesData.length} SERIES
        </span>
      </div>

      <div 
        ref={scrollLabelRef}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[200px] md:translate-y-[240px] font-mono text-[9px] text-[#111]/40 tracking-widest z-10"
      >
        ↓ SCROLL TO OPEN
      </div>

      {isMobile && (
        <>
          <button
            className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 z-[4] p-2 hover:opacity-100 transition-opacity"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '18px',
              color: '#111',
              opacity: !canScrollLeft ? 0 : hasSwiped ? 0 : 0.35,
              pointerEvents: !canScrollLeft ? 'none' : 'auto',
            }}
            onClick={() => manuallyScrollStrip('left')}
          >
            ←
          </button>
          <button
            className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 z-[4] p-2 hover:opacity-100 transition-opacity"
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '18px',
              color: '#111',
              opacity: !canScrollRight ? 0 : hasSwiped ? 0 : 0.35,
              pointerEvents: !canScrollRight ? 'none' : 'auto',
            }}
            onClick={() => manuallyScrollStrip('right')}
          >
            →
          </button>
        </>
      )}

      {/* Grid Container */}
      <div 
        ref={stripRef}
        onScroll={isMobile ? handleScrollStripEvent : undefined}
        onTouchStart={isMobile ? handleTouchStart : undefined}
        className={`mx-auto w-fit ${isMobile ? 'flex flex-row overflow-x-auto w-full px-[50%] md:px-8 pb-8 gap-[24px] snap-x snap-mandatory hide-scrollbars -mx-[calc(50vw-100px)]' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-[32px] md:gap-[24px] lg:gap-x-[32px] lg:gap-y-[48px] px-4'} mt-16 md:mt-24 z-[2] relative max-w-[1200px] mb-32`}
      >
        {seriesData.map((series, i) => (
          <div 
            key={series.slug}
            ref={(el) => polaroidRefs.current[i] = el}
            onMouseEnter={(e) => handleMouseEnter(e, i)}
            onMouseLeave={(e) => handleMouseLeave(e, i)}
            onClick={(e) => handleSeriesClick(e, series.slug, i)}
            className={`polaroid-wrapper ${isMobile ? 'w-[200px] flex-shrink-0 snap-center' : 'w-[200px] md:w-[140px] lg:w-[180px]'} aspect-[3/4] cursor-pointer`}
            style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          >
            <div 
              ref={(el) => innerRefs.current[i] = el}
              className="w-full h-full relative preserve-3d"
            >
              {/* BACKFACE */}
              <div 
                className="face-shadow absolute inset-0 bg-[#F5F0E8] border border-[#111] border-opacity-5 flex items-center justify-center shadow-[3px_6px_20px_rgba(0,0,0,0.18)]"
                style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(0deg)' }}
              >
                <span className="font-serif font-semibold text-[28px] text-[#111] opacity-10 tracking-[0.04em]">SM</span>
                <span className="absolute bottom-[20px] right-[20px] font-mono text-[9px] text-[#111] opacity-20 tracking-[0.1em]">
                  0{i + 1}
                </span>
              </div>

              {/* FRONTFACE */}
              <div 
                className="face-shadow polaroid-front absolute inset-0 bg-white p-[6px] pb-[20px] flex flex-col pointer-events-none shadow-[3px_6px_20px_rgba(0,0,0,0.18)]"
                style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              >
                <div className="flex-1 w-full relative overflow-hidden bg-zinc-200">
                  <img 
                    src={series.coverImage} 
                    alt={series.title}
                    className="polaroid-image absolute inset-0 w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="hover-overlay absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-[10px] pt-[24px] pb-[8px] opacity-0 flex flex-col justify-end">
                    <span className="font-serif italic text-white text-[13px] leading-tight">{series.title}</span>
                    <span className="font-mono text-[8px] text-white/60 tracking-[0.1em] uppercase mt-[2px]">
                      {series.frameCount} FRAMES
                    </span>
                  </div>
                </div>

                <div className="polaroid-caption-container h-[40px] flex flex-col justify-end mt-[6px]">
                  <div 
                    ref={(el) => titleRefs.current[i] = el}
                    className="font-serif font-semibold text-[13px] text-[#111] tracking-[0.01em] leading-tight"
                  >
                    <SplitText text={series.title} />
                  </div>
                  <div 
                    ref={(el) => metaRefs.current[i] = el}
                    className="font-mono text-[8px] text-[#aaa] tracking-[0.1em] uppercase mt-[2px] opacity-0"
                  >
                    {series.category} · {series.year}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        ref={viewAllRef}
        className="absolute bottom-[32px] right-[32px] flex items-center gap-[10px] opacity-0 cursor-pointer z-[4]"
      >
        <span className="font-mono text-[10px] tracking-[0.14em] text-[#8B1E1E] uppercase">View all works</span>
        <span className="font-mono text-[10px] text-[#8B1E1E]">→</span>
      </div>
    </section>
  );
}
