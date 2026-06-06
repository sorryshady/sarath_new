'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

const SESSION_KEY = 'sm_preloader_seen';
const MIN_DURATION_MS = 2000;

const GRAIN_BG = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='1'/></svg>`,
)}")`;

export type PreloaderProps = {
  isVideoReady: boolean;
  onComplete: () => void;
};

function useSprocketCount() {
  const [count, setCount] = useState(8);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 480) setCount(3);
      else if (w < 768) setCount(4);
      else if (w < 1024) setCount(6);
      else setCount(8);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

function useIsMobileMeta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setHidden(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return hidden;
}

export function Preloader({ isVideoReady, onComplete }: PreloaderProps) {
  const [skipped] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  const [visible, setVisible] = useState(!skipped);
  const [counterDisplay, setCounterDisplay] = useState('00');
  const [progressWidth, setProgressWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const preloaderRef = useRef<HTMLDivElement>(null);
  const filmFrameRef = useRef<HTMLDivElement>(null);
  const metaTopRef = useRef<HTMLDivElement>(null);
  const metaBottomRef = useRef<HTMLDivElement>(null);
  const grainRef = useRef<HTMLDivElement>(null);
  const counterTlRef = useRef<gsap.core.Timeline | null>(null);

  const isVideoReadyRef = useRef(isVideoReady);
  const minimumDurationMetRef = useRef(false);
  const waitingAt99Ref = useRef(false);
  const onCompleteRef = useRef(onComplete);

  const sprocketCount = useSprocketCount();
  const hideMetaBars = useIsMobileMeta();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    isVideoReadyRef.current = isVideoReady;
  }, [isVideoReady]);

  const tryResumeCounter = useCallback(() => {
    const tl = counterTlRef.current;
    if (
      !tl ||
      !waitingAt99Ref.current ||
      !minimumDurationMetRef.current ||
      !isVideoReadyRef.current
    ) {
      return;
    }

    waitingAt99Ref.current = false;
    tl.resume();
  }, []);

  useEffect(() => {
    if (skipped) {
      onCompleteRef.current();
      return;
    }

    const prevOverflow = document.body.style.overflow;
    const prevBackground = document.body.style.backgroundColor;

    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = 'var(--color-crimson)';

    const timer = window.setTimeout(() => {
      minimumDurationMetRef.current = true;
      tryResumeCounter();
    }, MIN_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = prevOverflow;
      document.body.style.backgroundColor = prevBackground;
    };
  }, [skipped, tryResumeCounter]);

  useEffect(() => {
    tryResumeCounter();
  }, [isVideoReady, tryResumeCounter]);

  useGSAP(
    () => {
      if (skipped || !preloaderRef.current) return;

      const counterObj = { value: 0 };

      const updateCounter = (val: number) => {
        const display = Math.floor(val);
        const padded =
          display < 100 ? String(display).padStart(2, '0') : '100';
        setCounterDisplay(padded);
        setProgressWidth(Math.min(display, 100));
      };

      const triggerExit = () => {
        setIsReady(true);

        const exitTl = gsap.timeline({
          onComplete: () => {
            sessionStorage.setItem(SESSION_KEY, 'true');
            document.body.style.overflow = '';
            document.body.style.backgroundColor = '';
            setVisible(false);
            onCompleteRef.current();
          },
        });

        exitTl.to({}, { duration: 0.4 });

        exitTl.to(filmFrameRef.current, {
          scale: 1.08,
          opacity: 0,
          duration: 0.5,
          ease: 'power2.in',
        });
        exitTl.to(
          metaTopRef.current,
          { opacity: 0, duration: 0.3 },
          '<',
        );
        exitTl.to(
          metaBottomRef.current,
          { opacity: 0, duration: 0.3 },
          '<',
        );
        exitTl.to(
          grainRef.current,
          { opacity: 0.18, duration: 0.15, yoyo: true, repeat: 1 },
          '<',
        );

        exitTl.to(preloaderRef.current, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power3.inOut',
        });
      };

      const startCounterTimeline = () => {
        const tl = gsap.timeline();
        counterTlRef.current = tl;

        tl.to(counterObj, {
          value: 72,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => updateCounter(counterObj.value),
        });

        tl.to(counterObj, {
          value: 92,
          duration: 0.8,
          ease: 'power1.out',
          onUpdate: () => updateCounter(counterObj.value),
        });

        tl.to(counterObj, {
          value: 99,
          duration: 0.6,
          ease: 'power1.out',
          onUpdate: () => updateCounter(counterObj.value),
          onComplete: () => {
            tl.pause();
            waitingAt99Ref.current = true;
            tryResumeCounter();
          },
        });

        tl.to(counterObj, {
          value: 100,
          duration: 0.3,
          ease: 'none',
          onUpdate: () => updateCounter(counterObj.value),
          onComplete: triggerExit,
        });
      };

      // Panel stays fully opaque — flicker only inner content so hero never bleeds through
      gsap.set(preloaderRef.current, { opacity: 1 });

      const entryTargets = [
        filmFrameRef.current,
        metaTopRef.current,
        metaBottomRef.current,
      ].filter((el): el is HTMLDivElement => el !== null);

      gsap.fromTo(
        entryTargets,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.05,
          ease: 'none',
          onComplete: () => {
            gsap.to(entryTargets, {
              opacity: 0.6,
              duration: 0.05,
              yoyo: true,
              repeat: 1,
              onComplete: startCounterTimeline,
            });
          },
        },
      );

      const grain = grainRef.current;
      if (grain) {
        const tick = () => {
          gsap.set(grain, {
            x: gsap.utils.random(-2, 2),
            y: gsap.utils.random(-2, 2),
          });
        };

        gsap.ticker.add(tick);
        return () => gsap.ticker.remove(tick);
      }
    },
    { scope: preloaderRef, dependencies: [skipped, tryResumeCounter] },
  );

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes preloader-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.15; }
        }
        .preloader-blink {
          animation: preloader-blink 1s step-end infinite;
        }
        .preloader-counter-slot {
          position: relative;
          display: inline-block;
        }
        .preloader-counter-sizer {
          visibility: hidden;
          pointer-events: none;
          user-select: none;
        }
        .preloader-counter-value {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .preloader-entry-target {
          opacity: 0;
        }
        .preloader-meta {
          font-family: var(--font-data);
          font-size: var(--size-preloader-meta);
          font-weight: var(--weight-bold);
          letter-spacing: 0.14em;
          color: var(--color-parchment-60);
          -webkit-font-smoothing: antialiased;
        }
        .preloader-corner {
          font-family: var(--font-data);
          font-size: var(--size-preloader-corner);
          font-weight: var(--weight-bold);
          color: var(--color-parchment-50);
        }
        .preloader-status {
          font-family: var(--font-data);
          font-size: var(--size-preloader-status);
          font-weight: var(--weight-bold);
          letter-spacing: 0.18em;
          color: var(--color-parchment-70);
        }
        .preloader-frame {
          padding: 36px 64px;
          border-width: var(--preloader-frame-border);
          border-style: solid;
          border-color: var(--color-parchment-50);
        }
        @media (max-width: 1024px) {
          .preloader-frame {
            padding: 28px 48px;
          }
        }
        @media (max-width: 767px) {
          .preloader-frame {
            padding: 20px 24px;
          }
        }
        @media (max-width: 479px) {
          .preloader-frame {
            padding: 16px 18px;
          }
        }
      `}</style>

      <div
        ref={preloaderRef}
        className="fixed inset-0 will-change-transform"
        style={{
          zIndex: 'var(--z-preloader)',
          backgroundColor: 'var(--color-crimson)',
          opacity: 1,
        }}
        aria-hidden={skipped}
        aria-live="polite"
      >
        <div
          ref={grainRef}
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: 0.07,
            mixBlendMode: 'overlay',
            backgroundImage: GRAIN_BG,
            backgroundRepeat: 'repeat',
          }}
          aria-hidden="true"
        />

        {!hideMetaBars && (
          <div
            ref={metaTopRef}
            className="preloader-entry-target preloader-meta absolute flex items-center justify-between uppercase"
            style={{
              top: 'var(--space-lg)',
              left: '28px',
              right: '28px',
            }}
          >
            <span>KODAK VISION3 500T</span>
            <span>35MM · 1.85:1</span>
            <span>SM · MMXIX</span>
          </div>
        )}

        <div
          ref={filmFrameRef}
          className="preloader-entry-target preloader-frame absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <div
            className="absolute flex items-center justify-between"
            style={{
              top: 0,
              left: '10px',
              right: '10px',
              transform: 'translateY(-50%)',
            }}
            aria-hidden="true"
          >
            {Array.from({ length: sprocketCount }).map((_, i) => (
              <div
                key={`top-${i}`}
                style={{
                  width: '15px',
                  height: '11px',
                  background: 'var(--color-crimson)',
                  border: '2px solid var(--color-parchment-50)',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>

          <div
            className="absolute flex items-center justify-between"
            style={{
              bottom: 0,
              left: '10px',
              right: '10px',
              transform: 'translateY(50%)',
            }}
            aria-hidden="true"
          >
            {Array.from({ length: sprocketCount }).map((_, i) => (
              <div
                key={`bottom-${i}`}
                style={{
                  width: '15px',
                  height: '11px',
                  background: 'var(--color-crimson)',
                  border: '2px solid var(--color-parchment-50)',
                  borderRadius: '2px',
                }}
              />
            ))}
          </div>

          <div className="preloader-corner absolute left-0 top-0">
            ▲ 01
          </div>

          <div className="preloader-corner absolute right-0 top-0 text-right">
            T 1.3 ▲
          </div>

          <div className="flex flex-col items-center">
            <span
              className="preloader-counter-slot"
              style={{
                fontFamily: 'var(--font-editorial)',
                fontSize: 'var(--size-preloader-counter)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-cream)',
                letterSpacing: 'var(--tracking-tight)',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1,
              }}
            >
              <span className="preloader-counter-sizer" aria-hidden="true">
                100
              </span>
              <span className="preloader-counter-value">{counterDisplay}</span>
            </span>

            <div
              style={{
                width: 'var(--preloader-divider-width)',
                height: 'var(--preloader-divider-height)',
                background: 'var(--color-parchment-60)',
                margin: '14px auto',
              }}
              aria-hidden="true"
            />

            <p className="preloader-status uppercase">
              {isReady ? (
                'READY'
              ) : (
                <>
                  DEVELOPING{' '}
                  <span className="preloader-blink" aria-hidden="true">
                    ●
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0"
          role="progressbar"
          aria-valuenow={progressWidth}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Loading progress"
        >
          <div
            style={{
              height: 'var(--preloader-progress-height)',
              background: 'var(--color-parchment-20)',
            }}
          >
            <div
              style={{
                height: 'var(--preloader-progress-height)',
                width: `${progressWidth}%`,
                background: 'var(--color-parchment-70)',
              }}
            />
          </div>
        </div>

        {!hideMetaBars && (
          <div
            ref={metaBottomRef}
            className="preloader-entry-target preloader-meta absolute flex items-center justify-between uppercase"
            style={{
              bottom: 'var(--space-md)',
              left: '28px',
              right: '28px',
            }}
          >
            <span>PHOTOGRAPHER · FILMMAKER · POET</span>
            <span>LONDON</span>
          </div>
        )}
      </div>
    </>
  );
}
