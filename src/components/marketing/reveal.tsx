"use client";

import { useRef, useState, useEffect } from "react";

type AnimationVariant = "fade-up" | "fade" | "zoom" | "fade-up-sm";

const variantClasses: Record<AnimationVariant, string> = {
  "fade-up": "animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards",
  "fade-up-sm": "animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards",
  "fade": "animate-in fade-in fill-mode-backwards",
  "zoom": "animate-in fade-in zoom-in-95 fill-mode-backwards",
};

interface RevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "span";
}

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 500,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={
        visible
          ? `${variantClasses[variant]} ${className}`
          : `opacity-0 ${className}`
      }
      style={{
        animationDuration: visible ? `${duration}ms` : undefined,
        animationDelay: visible ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </Tag>
  );
}
