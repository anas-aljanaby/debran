import React, { useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";

interface PromptWindowProps {
  showWindow: boolean;
  position: { top: number; left: number };
  userInput: string;
  setUserInput: (input: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClickOutside: () => void;
}

const PromptWindow: React.FC<PromptWindowProps> = ({
  showWindow,
  position,
  userInput,
  setUserInput,
  onKeyDown,
  onClickOutside,
}) => {
  const windowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showWindow && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showWindow]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (windowRef.current && !windowRef.current.contains(event.target as Node)) {
        onClickOutside();
      }
    };

    if (showWindow) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWindow, onClickOutside]);

  if (!showWindow) return null;

  return (
    <div
      ref={windowRef}
      className="absolute z-[1000] p-4 bg-white dark:bg-[#1F1F1F] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-80 sm:w-96 md:w-112 lg:w-128"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <Input
        ref={inputRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Give instructions to the AI how to continue..."
        className="w-full text-sm border-none focus:ring-0 outline-none"
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

export default PromptWindow;
