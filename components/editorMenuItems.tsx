import React from 'react';
import { BlockNoteEditor } from "@blocknote/core";
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { HiOutlineGlobeAlt } from "react-icons/hi";

// Define the type for the function that sets the text window
type SetTextWindowFunction = (block: BlockNoteEditor['content'][number]) => void;

export const continueWritingItem = (
  editor: BlockNoteEditor,
  setTextWindowBlock: SetTextWindowFunction,
  setTextWindowPosition: (position: { top: number; left: number }) => void,
  setShowTextWindow: (show: boolean) => void,
  setDynamicPosition: (block: BlockNoteEditor['content'][number], setPosition: (position: { top: number; left: number }) => void) => void
) => ({
  title: "Continue Writing",
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    console.log(editor.getTextCursorPosition());
    setTextWindowBlock(currentBlock);
    setDynamicPosition(currentBlock, setTextWindowPosition);
    setShowTextWindow(true);
  },
  aliases: ["continue"],
  group: "AI",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "Let an AI continue writing for you.",
});

export const getCustomSlashMenuItems = (
  editor: BlockNoteEditor,
  context: string,
  setTextWindowBlock: SetTextWindowFunction,
  setTextWindowPosition: (position: { top: number; left: number }) => void,
  setShowTextWindow: (show: boolean) => void,
  setDynamicPosition: (block: BlockNoteEditor['content'][number], setPosition: (position: { top: number; left: number }) => void) => void
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  continueWritingItem(editor, setTextWindowBlock, setTextWindowPosition, setShowTextWindow, setDynamicPosition),
];