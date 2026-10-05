"use client";

import type { Variants } from "motion/react";
import { LazyMotion, domMin, m, useAnimation, useReducedMotion } from "motion/react";
import { forwardRef, useImperativeHandle } from "react";

export interface SendIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface SendIconProps {
  size?: number;
  duration?: number;
  className?: string;
  color?: string;
}

const SendIcon = forwardRef<SendIconHandle, SendIconProps>(function SendIcon(
  { size = 20, duration = 1, className, color = "currentColor" },
  ref,
) {
  const controls = useAnimation();
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => ({
    startAnimation: () => { void controls.start(reduced ? "normal" : "animate"); },
    stopAnimation: () => { void controls.start("normal"); },
  }), [controls, reduced]);

  const variants: Variants = {
    normal: { x: 0, y: 0, scale: 1, opacity: 1 },
    animate: {
      scale: [1, 0.85, 0, 0, 1],
      x: [0, 4, 12, -12, 0],
      y: [0, -3, -12, 12, 0],
      opacity: [1, 1, 0, 0, 1],
      transition: { duration: 1.4 * duration, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 1] },
    },
  };

  return (
    <LazyMotion features={domMin} strict>
      <m.svg
        className={className}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={controls}
        initial="normal"
        variants={variants}
        aria-hidden="true"
      >
        <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
        <path d="m21.854 2.147-10.94 10.939" />
      </m.svg>
    </LazyMotion>
  );
});

SendIcon.displayName = "SendIcon";
export { SendIcon };
