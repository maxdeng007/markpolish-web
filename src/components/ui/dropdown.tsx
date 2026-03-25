import React, { useState, useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div ref={triggerRef} onClick={handleToggle}>
        {trigger}
      </div>
      {isOpen && (
        <div
          className={`absolute z-[99999] min-w-[160px] rounded-lg border border-border bg-background shadow-lg py-1 mt-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  setIsOpen(false);
                }
              }}
              disabled={item.disabled}
              style={{
                display: "flex",
                width: "100%",
                padding: "10px 14px",
                alignItems: "center",
                gap: "10px",
              }}
              className={`text-sm text-left transition-all whitespace-nowrap ${
                item.disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : item.active
                    ? "text-foreground bg-accent/10 cursor-pointer"
                    : "text-foreground hover:bg-accent/5 cursor-pointer"
              }`}
            >
              {item.icon && (
                <span className="w-4 h-4 shrink-0">{item.icon}</span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
