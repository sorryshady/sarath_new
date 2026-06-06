'use client';

import './copy.css';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { type RefObject, useRef } from 'react';

import { useMedia } from '@/hooks/useMedia';
import {
  ENTER_DURATION,
  ENTER_EASE,
  ENTER_STAGGER,
  PAGE_ENTER_BUFFER_S,
  waitForPageEnter,
} from '@/lib/view-transition';

gsap.registerPlugin(SplitText, ScrollTrigger);

interface CopyProps {
  children: React.ReactNode;
  animateOnScroll?: boolean;
  delay?: number;
  onComplete?: () => void;
  /** When set, scroll reveal is tied to this element instead of the Copy wrapper. */
  triggerRef?: RefObject<Element | null>;
}

async function waitForFonts() {
  try {
    await document.fonts.ready;

    const customFonts = ['Anton', 'Cormorant Garamond'];
    await Promise.all(
      customFonts.map((fontFamily) => document.fonts.load(`16px "${fontFamily}"`)),
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

export default function Copy({
  children,
  animateOnScroll = true,
  delay = 0,
  onComplete,
  triggerRef,
}: CopyProps) {
  const isMobile = useMedia('(max-width: 768px)', false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRefs = useRef<(HTMLDivElement | Element)[]>([]);
  const splitRefs = useRef<SplitText[]>([]);
  const lines = useRef<Element[]>([]);

  useGSAP(
    () => {
      const initializeSplitText = async () => {
        await waitForFonts();

        if (!containerRef.current) return;

        splitRefs.current = [];
        lines.current = [];
        elementRefs.current = [];

        let elements: (HTMLDivElement | Element)[] = [];
        if (containerRef.current.hasAttribute('data-copy-wrapper')) {
          elements = Array.from(containerRef.current.children);
        } else {
          elements = [containerRef.current];
        }

        elements.forEach((element) => {
          if (!element) return;

          elementRefs.current.push(element);

          const split = SplitText.create(element, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'line++',
            lineThreshold: 0.1,
          });

          splitRefs.current.push(split);

          const computedStyle = window.getComputedStyle(element);
          const textIndent = computedStyle.textIndent;

          if (textIndent && textIndent !== '0px') {
            if (split.lines.length > 0 && split.lines[0] instanceof HTMLElement) {
              (split.lines[0] as HTMLElement).style.paddingLeft = textIndent;
            }
            if (element instanceof HTMLElement) {
              element.style.textIndent = '0';
            }
          }

          lines.current.push(...split.lines);
        });

        gsap.set(lines.current, { y: '100%' });

        if (!animateOnScroll && containerRef.current) {
          gsap.set(containerRef.current, { visibility: 'visible' });
        }

        let pageEnterDelay = 0;
        if (!animateOnScroll) {
          await waitForPageEnter();
          pageEnterDelay = PAGE_ENTER_BUFFER_S;
        }

        const animationProps = {
          y: '0%',
          duration: animateOnScroll ? 1 : ENTER_DURATION,
          stagger: animateOnScroll ? 0.1 : ENTER_STAGGER,
          ease: animateOnScroll ? 'power4.out' : ENTER_EASE,
          delay: delay + pageEnterDelay,
          onComplete,
        };

        if (animateOnScroll) {
          const trigger = triggerRef?.current ?? containerRef.current;

          gsap.to(lines.current, {
            ...animationProps,
            scrollTrigger: {
              trigger,
              start: isMobile ? 'top 90%' : 'top 75%',
              once: true,
            },
          });
        } else {
          gsap.to(lines.current, animationProps);
        }
      };

      initializeSplitText();

      return () => {
        splitRefs.current.forEach((split) => {
          split.revert();
        });
      };
    },
    {
      scope: containerRef,
      dependencies: [animateOnScroll, delay, onComplete, triggerRef, isMobile],
    },
  );

  return (
    <div
      ref={containerRef}
      data-copy-wrapper="true"
      {...(!animateOnScroll ? { 'data-animate': 'enter' } : {})}
    >
      {children}
    </div>
  );
}
