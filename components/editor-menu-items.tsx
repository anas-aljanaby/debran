import React from 'react';
import { BlockNoteEditor } from "@blocknote/core";
import { DefaultReactSuggestionItem, getDefaultReactSlashMenuItems } from "@blocknote/react";
import { HiOutlineGlobeAlt } from "react-icons/hi";

// Define the type for the function that opens the prompt window
type OpenPromptWindowFunction = (type: 'slashMenu' | 'highlight', position: { top: number; left: number }) => void;

export const continueWritingItem = (
  editor: BlockNoteEditor,
  setTextWindowBlock: (block: BlockNoteEditor['content'][number]) => void,
  openPromptWindow: OpenPromptWindowFunction,
  setDynamicPosition: (block: BlockNoteEditor['content'][number], setPosition: (position: { top: number; left: number }) => void) => void
) => ({
  title: "Continue Writing",
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    console.log(editor.getTextCursorPosition());
    setTextWindowBlock(currentBlock);
    setDynamicPosition(currentBlock, (position) => openPromptWindow('slashMenu', position));
  },
  aliases: ["continue"],
  group: "AI",
  icon: <HiOutlineGlobeAlt size={18} />,
  subtext: "Let an AI continue writing for you.",
});

export const getCustomSlashMenuItems = (
  editor: BlockNoteEditor,
  context: string,
  setTextWindowBlock: (block: BlockNoteEditor['content'][number]) => void,
  openPromptWindow: OpenPromptWindowFunction,
  setDynamicPosition: (block: BlockNoteEditor['content'][number], setPosition: (position: { top: number; left: number }) => void) => void
): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  continueWritingItem(editor, setTextWindowBlock, openPromptWindow, setDynamicPosition),
];
