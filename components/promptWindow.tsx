import React, { useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";


//TODO: add x button to close the prompt window
//TODO: Style the prompt window for clear visibility, for dark and light mode

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
      className="absolute z-[1000] p-4 bg-white
      dark:bg-[#1F1F1F] border border-gray-500
      dark:border-gray-200 rounded-lg shadow-lg w-2/5"
      style={{
        top: position.top,
        left: position.left,
        height: "80px",
      }}
    >
      <Input
        ref={inputRef}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        placeholder="Give instructions to the AI how to continue..."
        className="w-full text-md border-none focus:ring-0 focus:outline-none
        bg-transparent text-gray-400 placeholder:text-gray-400"

        style={{
            boxShadow: "none",
            height: "30px",
        }}
        onKeyDown={onKeyDown}
      />
      <div className="mt-2 text-sm text-gray-400 dark:text-gray-400">
        Enter to confirm, Esc to close
      </div>
    </div>
  );
};

export default PromptWindow;
