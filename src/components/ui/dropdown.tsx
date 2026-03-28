import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDropdown } from "./DropdownContext";

interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  isDivider?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  id: string;
}

export function Dropdown({
  trigger,
  items,
  align = "left",
  id,
}: DropdownProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const { openDropdown, setOpenDropdown } = useDropdown();
  const isOpen = openDropdown === id;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const inDropdown = dropdownRef.current?.contains(target);
      const inPortal = portalRef.current?.contains(target);
      if (!inDropdown && !inPortal) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [setOpenDropdown]);

  const handleToggle = () => {
    if (isOpen) {
      setOpenDropdown(null);
    } else {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const dropdownWidth = 180;
        let left = rect.left;
        if (left + dropdownWidth > window.innerWidth - 8) {
          left = window.innerWidth - dropdownWidth - 8;
        }
        if (left < 8) left = 8;
        setPosition({
          top: rect.bottom + 4,
          left: left,
        });
      }
      setOpenDropdown(id);
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
    }
    setOpenDropdown(null);
  };

  const renderMenuContent = () =>
    items.map((item, index) => {
      if (item.isDivider) {
        return <div key={index} className="h-px bg-border my-1" />;
      }
      return (
        <button
          key={index}
          onClick={(e) => {
            e.stopPropagation();
            handleItemClick(item);
          }}
          disabled={item.disabled}
          className={`text-sm text-left transition-all whitespace-nowrap w-full flex items-center gap-2 ${
            item.disabled
              ? "text-muted-foreground cursor-not-allowed opacity-50"
              : item.active
                ? "text-foreground bg-accent cursor-pointer"
                : "text-foreground hover:bg-accent cursor-pointer"
          }`}
          style={{
            display: "flex",
            width: "100%",
            padding: "10px 14px",
            border: "none",
          }}
        >
          {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      );
    });

  if (isMobile && isOpen) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div
          ref={triggerRef}
          onClick={(e) => {
            e.stopPropagation();
            handleToggle();
          }}
        >
          {trigger}
        </div>
        {typeof document !== "undefined" &&
          createPortal(
            <div
              ref={portalRef}
              className="bg-background border border-border rounded-lg shadow-lg py-1"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                minWidth: 180,
                zIndex: 9998,
              }}
            >
              {renderMenuContent()}
            </div>,
            document.body,
          )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        ref={triggerRef}
        onClick={(e) => {
          e.stopPropagation();
          handleToggle();
        }}
      >
        {trigger}
      </div>
      {isOpen && !isMobile && (
        <div
          className={`absolute z-[99999] min-w-[160px] rounded-lg border border-border bg-background shadow-lg py-1 mt-1 ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {renderMenuContent()}
        </div>
      )}
    </div>
  );
}
