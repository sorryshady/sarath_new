'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ── Iris geometry ─────────────────────────────────────────
   A real camera aperture. N blades fan around the lens; the
   opening is a regular polygon. Each blade is bounded by two
   straight seams that run from a polygon vertex out to a rim
   point rotated by SWEEP — so every blade leans the same way
   (the giveaway of a mechanical iris) and the union leaves the
   central polygon clear. */

const N = 6;
const CX = 50;
const CY = 50;
const OUTER = 50; // rim radius
const HOLE = 21; // aperture polygon circumradius
const SWEEP = 40; // blade lean, degrees — rim seam offset from vertex

const rad = (d: number) => (d * Math.PI) / 180;
const x = (a: number, r: number) => CX + r * Math.cos(rad(a));
const y = (a: number, r: number) => CY + r * Math.sin(rad(a));
const f = (n: number) => n.toFixed(2);

const vAngle = (i: number) => -90 + i * (360 / N); // polygon vertex angle

// Blade i: vertex_i → vertex_i+1 (polygon edge) → rim_i+1 → arc → rim_i.
// rim points are the vertex angle + SWEEP, giving the leaning seam.
const blades = Array.from({ length: N }, (_, i) => {
  const a0 = vAngle(i);
  const a1 = vAngle(i + 1);
  const P0 = `${f(x(a0, HOLE))} ${f(y(a0, HOLE))}`;
  const P1 = `${f(x(a1, HOLE))} ${f(y(a1, HOLE))}`;
  const R0 = `${f(x(a0 + SWEEP, OUTER))} ${f(y(a0 + SWEEP, OUTER))}`;
  const R1 = `${f(x(a1 + SWEEP, OUTER))} ${f(y(a1 + SWEEP, OUTER))}`;
  return `M ${P0} L ${P1} L ${R1} A ${OUTER} ${OUTER} 0 0 0 ${R0} Z`;
});

type ApertureMarkProps = {
  /** Section whose scroll position drives the shutter. Falls back to the mark. */
  triggerRef?: React.RefObject<HTMLElement | null>;
  className?: string;
};

export function ApertureMark({ triggerRef, className }: ApertureMarkProps) {
  const ref = useRef<HTMLDivElement>(null);
  const bladesRef = useRef<SVGGElement>(null);
  const shutterRef = useRef<SVGCircleElement>(null);

  useGSAP(
    () => {
      const wrap = ref.current;
      const bladeGroup = bladesRef.current;
      const shutter = shutterRef.current;
      if (!wrap || !bladeGroup || !shutter) return;

      const trigger = triggerRef?.current ?? wrap;

      // Reduced motion: skip the scrubbed iris entirely — settle the shutter to
      // a calm half-closed rest state so the mark still reads as an aperture.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(shutter, { attr: { r: HOLE * 0.5 } });
        return;
      }

      // Mechanical iris: the blade ring rotates while a dark shutter grows from
      // the centre to close the opening as the end-card scrolls into view. It
      // settles shut — the lens stays in frame, never vanishes.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: 'top 80%',
          end: 'bottom bottom',
          scrub: 1.2,
        },
      });

      tl.fromTo(
        bladeGroup,
        { rotation: 0, transformOrigin: '50% 50%' },
        { rotation: 40, ease: 'none' },
        0,
      );
      tl.fromTo(
        shutter,
        { attr: { r: 0 } },
        { attr: { r: HOLE + 1.5 }, ease: 'power1.in' },
        0,
      );
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="aperture-svg">
        {/* Lens behind the blades (shows through the opening) */}
        <circle cx={CX} cy={CY} r={HOLE + 1} className="aperture-lens" />

        {/* Iris blades */}
        <g ref={bladesRef} className="aperture-blades">
          {blades.map((d, i) => (
            <path key={i} d={d} className="aperture-blade" />
          ))}
        </g>

        {/* Shutter disc — grows on scroll to iris shut */}
        <circle ref={shutterRef} cx={CX} cy={CY} r={0} className="aperture-shutter" />

        {/* Lens barrel ring + f-stop ticks, on top */}
        <circle cx={CX} cy={CY} r={OUTER - 1} className="aperture-barrel" fill="none" />
        <g className="aperture-ticks">
          {Array.from({ length: 12 }, (_, i) => {
            const a = i * 30;
            return (
              <line
                key={i}
                x1={f(x(a, OUTER - 1))}
                y1={f(y(a, OUTER - 1))}
                x2={f(x(a, OUTER - 4))}
                y2={f(y(a, OUTER - 4))}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}
