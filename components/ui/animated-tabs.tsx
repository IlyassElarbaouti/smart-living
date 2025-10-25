"use client" 

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
 
export interface AnimatedTabsProps {
  tabs: { label: string; value?: string }[];
  variant: "default" | "underlined";
  value?: string;
  onChange?: (value: string) => void;
}
 
export function AnimatedTabs({ tabs, variant, value, onChange }: AnimatedTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(tabs[0]?.label || "");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Use controlled value if provided, otherwise use internal state
  const activeTab = value !== undefined ? value : internalActiveTab;

  const handleTabChange = (tabValue: string) => {
    if (value === undefined) {
      setInternalActiveTab(tabValue);
    }
    onChange?.(tabValue);
  };
 
  useEffect(() => {
    const container = containerRef.current;
 
    if (container && activeTab) {
      const activeTabElement = activeTabRef.current;
 
      if (activeTabElement) {
        const { offsetLeft, offsetWidth } = activeTabElement;
 
        if (variant === "default") {
          const clipLeft = offsetLeft + 16;
          const clipRight = offsetLeft + offsetWidth + 16;
 
          container.style.clipPath = `inset(0 ${Number(
            100 - (clipRight / container.offsetWidth) * 100,
          ).toFixed()}% 0 ${Number(
            (clipLeft / container.offsetWidth) * 100,
          ).toFixed()}% round 17px)`;
        } else {
          // For underlined variant, position the underline directly
          container.style.left = `${offsetLeft}px`;
          container.style.width = `${offsetWidth}px`;
        }
      }
    }
  }, [activeTab, variant]);
 
  return (
    <div className={cn(
      "relative flex w-fit flex-col items-center",
      variant === "default" 
        ? "bg-secondary/50 border border-primary/10 rounded-full py-2 px-4"
        : "border-b border-border"
    )}>
      <div
        ref={containerRef}
        className={cn(
          "z-10",
          variant === "default" 
            ? "absolute w-full overflow-hidden [clip-path:inset(0px_75%_0px_0%_round_17px)] [transition:clip-path_0.25s_ease]"
            : "absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-out"
        )}
      >
        {variant === "default" && (
          <div className="relative flex w-full justify-center bg-primary">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => handleTabChange(tab.value || tab.label)}
                className="flex h-8 items-center rounded-full p-3 text-sm font-medium text-primary-foreground"
                tabIndex={-1}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
 
      <div className="relative flex w-full justify-center">
        {tabs.map(({ label, value: tabValue }, index) => {
          const actualValue = tabValue || label;
          const isActive = activeTab === actualValue;
 
          return (
            <button
              key={index}
              ref={isActive ? activeTabRef : null}
              onClick={() => handleTabChange(actualValue)}
              className={cn(
                "flex items-center cursor-pointer text-sm font-medium transition-colors",
                variant === "default" 
                  ? "h-8 rounded-full p-3 text-muted-foreground"
                  : cn(
                      "px-6 py-3 relative",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}