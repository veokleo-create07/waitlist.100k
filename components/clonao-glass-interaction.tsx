"use client";

import { PointerEvent, useEffect, useRef } from "react";

const SCENE_IMAGE = "https://i.postimg.cc/N04PPG0C/Glass-Capsule-Among-the-Clouds.png";
type Point = { x: number; y: number };

export default function ClonaoGlassInteraction() {
  const regionRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<Point>({ x: 0, y: 0 });
  const currentRef = useRef<Point>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => { if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current); };
  }, []);

  const animate = () => {
    const region = regionRef.current;
    const float = floatRef.current;
    if (!region || !float) return;
    const target = targetRef.current;
    const current = currentRef.current;
    current.x += (target.x - current.x) * 0.14;
    current.y += (target.y - current.y) * 0.14;
    region.style.setProperty("--lens-x", `${current.x}px`);
    region.style.setProperty("--lens-y", `${current.y}px`);
    float.style.setProperty("--depth-x", `${current.x * 0.012}px`);
    float.style.setProperty("--depth-y", `${current.y * 0.012}px`);
    const settled = Math.abs(target.x - current.x) < 0.2 && Math.abs(target.y - current.y) < 0.2;
    frameRef.current = activeRef.current || !settled ? window.requestAnimationFrame(animate) : null;
  };

  const startAnimation = () => {
    if (reducedMotionRef.current || frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(animate);
  };

  const pointFromEvent = (event: PointerEvent<HTMLDivElement>) => {
    const region = regionRef.current;
    if (!region) return;
    const rect = region.getBoundingClientRect();
    targetRef.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const createRipple = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotionRef.current || event.pointerType === "mouse" || !regionRef.current) return;
    const region = regionRef.current;
    const rect = region.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "clonao-glass-interaction__ripple";
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    region.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  };

  const handleEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reducedMotionRef.current) return;
    activeRef.current = true;
    regionRef.current?.classList.add("is-active");
    pointFromEvent(event);
    startAnimation();
  };

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reducedMotionRef.current) return;
    pointFromEvent(event);
    startAnimation();
  };

  const handleLeave = () => {
    activeRef.current = false;
    regionRef.current?.classList.remove("is-active");
    const region = regionRef.current;
    if (region) targetRef.current = { x: region.clientWidth / 2, y: region.clientHeight / 2 };
    startAnimation();
  };

  return (
    <div ref={regionRef} className="clonao-glass-interaction" aria-hidden="true" onPointerEnter={handleEnter} onPointerMove={handleMove} onPointerLeave={handleLeave} onPointerDown={createRipple}>
      <div ref={floatRef} className="clonao-glass-interaction__float">
        <div className="clonao-glass-interaction__lens" style={{ backgroundImage: `url(${SCENE_IMAGE})` }} />
        <div className="clonao-glass-interaction__shine" />
      </div>
    </div>
  );
}
