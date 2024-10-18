import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import React, { useState, useEffect } from "react";

import { PartialBlock, BlockIdentifier } from "@blocknote/core";



interface PromptButtonProps {
  label: string;
  tooltip: string;
  setHighlightPosition: (position: { top: number; left: number }) => void;
  setShowHighlightWindow: (value: boolean) => void;
  showHighlightWindow: boolean; // State to track if the highlight window is visible
}

// Handle selection remains the same
export function handleSelection(
  setHighlightPosition: (position: { top: number; left: number }) => void,
  setShowHighlightWindow: (value: boolean) => void
) {
  setShowHighlightWindow(true);
  const selection = window.getSelection();
  if (selection && selection.toString().trim() !== "") {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setHighlightPosition({
      top: rect.top + window.scrollY + rect.height + 30, // Position below the selected text
      left: rect.left + window.scrollX,
    });
  }
}

export function PromptButton({
  label,
  tooltip,
  setHighlightPosition,
  setShowHighlightWindow,
  showHighlightWindow,
}: PromptButtonProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;
  const [selectedBlockId, setSelectedBlockId] = useState<BlockIdentifier | null>(null);
  const [originalBlock, setOriginalBlock] = useState<PartialBlock | null>(null);
  const [isSelected, setIsSelected] = useState<boolean>(
    editor.getActiveStyles().textColor === "blue"
  );

  const handleClick = () => {
    handleSelection(setHighlightPosition, setShowHighlightWindow);
  }

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={tooltip}
      onClick={handleClick}
    >
      {label}
    </Components.FormattingToolbar.Button>
  );
}