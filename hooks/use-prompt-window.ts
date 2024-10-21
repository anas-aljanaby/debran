import { useState } from 'react';

interface UsePromptWindowProps {
  onSlashMenuSubmit: (input: string) => void;
  onHighlightSubmit: (input: string) => void;
  onHighlightCancel: () => void;
}

export const usePromptWindow = ({
  onSlashMenuSubmit,
  onHighlightSubmit,
  onHighlightCancel,
}: UsePromptWindowProps) => {
  const [showPromptWindow, setShowPromptWindow] = useState(false);
  const [promptWindowPosition, setPromptWindowPosition] = useState({ top: 0, left: 0 });
  const [promptWindowType, setPromptWindowType] = useState<'slashMenu' | 'highlight'>('slashMenu');
  const [userInput, setUserInput] = useState('');

  const openPromptWindow = (type: 'slashMenu' | 'highlight', position: { top: number; left: number }) => {
    setPromptWindowType(type);
    setPromptWindowPosition(position);
    setShowPromptWindow(true);
  };

  const closePromptWindow = () => {
    setShowPromptWindow(false);
    setUserInput('');
    if (promptWindowType === 'highlight') {
      onHighlightCancel();
    }
  };

  const handlePromptSubmit = () => {
    if (promptWindowType === 'slashMenu') {
      onSlashMenuSubmit(userInput);
    } else {
      onHighlightSubmit(userInput);
    }
    setUserInput('');
    setShowPromptWindow(false);
  };

  return {
    showPromptWindow,
    promptWindowPosition,
    promptWindowType,
    userInput,
    setUserInput,
    openPromptWindow,
    closePromptWindow,
    handlePromptSubmit,
  };
};