"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const PlaceholdersAndVanishInput = ({
  placeholders,
  onChange,
  onSubmit,
  onKeyDown,
  value,
  className,
  inputClassName,
  ...props
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  value: string;
  className?: string;
  inputClassName?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'onSubmit' | 'onKeyDown' | 'value'>) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  useEffect(() => {
    let interval: any;
  const startAnimation = () => {
      interval = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  };
    startAnimation();
    return () => {
      clearInterval(interval);
    };
  }, [placeholders.length]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const newDataRef = useRef<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [animating, setAnimating] = useState(false);

  const draw = (ctx: CanvasRenderingContext2D, frame: number) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    newDataRef.current.forEach((t) => {
      t.draw(ctx);
    });
  };

  useEffect(() => {
    if (!animating) return;
    let animaterequest: number;
    let frame = 0;
    const render = () => {
      frame++;
      draw(canvasRef.current!.getContext("2d")!, frame);
      animaterequest = requestAnimationFrame(render);
    };
    animaterequest = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animaterequest);
  }, [animating]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value) return;
    setAnimating(true);
    onSubmit(e);
    const valueArr = value.split("");
        const ctx = canvasRef.current?.getContext("2d");
    if (ctx && inputRef.current) {
      ctx.font = "16px Arial";
      const { width } = ctx.measureText(value);

      const x = (ctx.canvas.width - width) / 2;
      const y = ctx.canvas.height / 2;

      valueArr.forEach((t, i) => {
        const x_ = x + ctx.measureText(value.substring(0, i)).width;
        newDataRef.current.push(new VanishingChar(ctx, x_, y, t));
      });
    }

    setTimeout(() => {
          setAnimating(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    }
    
    if (e.key === "Enter" && !animating) {
      handleSubmit(e as any);
    }
  };

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-white dark:bg-zinc-800 h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),_0px_1px_0px_0px_rgba(25,28,33,0.02),_0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200",
        value && "bg-gray-50 dark:bg-zinc-900",
        className
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base h-full w-full",
          !animating ? "visible" : "invisible"
        )}
        ref={canvasRef}
      />
      <input
        {...props}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        type="text"
        className={cn(
          "w-full relative text-sm sm:text-base z-50 border-none dark:text-white bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-4",
          animating && "invisible",
          inputClassName
        )}
          />

      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        <AnimatePresence>
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="w-full text-center text-sm sm:text-base text-zinc-500 dark:text-zinc-400"
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

class VanishingChar {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  char: string;
  progress: number;
  opacity: number;
  y_move: number;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number, char: string) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.char = char;
    this.progress = 0;
    this.opacity = 1;
    this.y_move = y + Math.random() * -10;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.progress += 1;
    this.opacity -= 0.02;
    this.y = this.y_move + Math.sin(this.progress * 0.05) * 5;

    ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`;
    ctx.fillText(this.char, this.x, this.y);
  }
}
