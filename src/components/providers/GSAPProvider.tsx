'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { SplitText } from 'gsap/SplitText';

let registered = false;

export function GSAPProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (registered) return;
    gsap.registerPlugin(ScrollTrigger, Flip, SplitText);
    registered = true;
  }, []);

  return children;
}
