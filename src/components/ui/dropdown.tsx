import React, { useState, useRef, useEffect } from "react";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}

export function Dropdown({ trigger, items, align = "left" }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

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
    if (!isOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 4,
        left: align === "right" ? rect.right : rect.left,
      });
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={handleToggle}>{trigger}</div>
      {isOpen && position && (
        <div
          className={`fixed z-[99999] min-w-[180px] rounded-xl border border-border bg-white dark:bg-gray-950 shadow-2xl py-1 ${
            align === "right" ? "right-2" : "left-0"
          }`}
          style={{
            top: `${position.top}px`,
            left: align === "right" ? undefined : `${position.left}px`,
          }}
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
                padding: "10px 16px",
                alignItems: "center",
                gap: "12px",
              }}
              className={`text-sm text-left transition-all whitespace-nowrap ${
                item.disabled
                  ? "text-muted-foreground/50 cursor-not-allowed"
                  : "text-foreground hover:bg-blue-50 active:bg-blue-100 cursor-pointer"
              }`}
            >
              {item.icon && (
                <span className="w-4 h-4 text-muted-foreground shrink-0">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
