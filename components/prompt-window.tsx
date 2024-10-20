import React, { useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";


//TODO: add x button to close the prompt window
//TODO: Style the prompt window for clear visibility, for dark and light mode

interface PromptWindowProps {
  showWindow: boolean;
  position: { top: number; left: number };
  userInput: string;
  setUserInput: (input: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
}

const PromptWindow: React.FC<PromptWindowProps> = ({
  showWindow,
  position,
  userInput,
  setUserInput,
  onCancel,
  onSubmit,
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
        onCancel();
      }
    };

    if (showWindow) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWindow, onCancel]);

  if (!showWindow) return null;

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onCancel();
    }
    if (e.key === "Enter") {
      onSubmit();
    }
  }

  return (
    <div
      ref={windowRef}
      className="absolute z-[1000] p-4 bg-white 
      dark:bg-[#1F1F1F] border  border-gray-500 backdrop-blur-md
      dark:border-gray-300 rounded-lg shadow-2xl dark:shadow-2xl w-2/5"
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
        bg-transparent text-gray-600 dark:text-[#CFCFCF] placeholder:text-gray-400 dark:placeholder:text-[#575757]"

        style={{
            boxShadow: "none",
            height: "30px",
        }}
        onKeyDown={onKeyDown}
      />
      <div className="mt-2 text-sm text-gray-400 dark:text-[#575757]">
        Enter to confirm, Esc to close
      </div>
    </div>
  );
};

export default PromptWindow;
