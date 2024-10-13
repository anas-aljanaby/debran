import { PartialBlock } from "@blocknote/core";

export const extractTextFromBlock = (block: PartialBlock): string => {
  let extractedText = '';
  if (block?.content && Array.isArray(block.content)) {
    block.content.forEach(item => {
      if (item.text) {
        extractedText += item.text + ' ';
      }
    });
  }
  return extractedText.trim();
};

interface Position {
    top: number;
    left: number;
  }

export const setDynamicPosition = (
block: PartialBlock, 
setTextWindowPosition: (position: Position) => void
) => {
const blockElement = document.querySelector(`[data-id="${block.id}"]`);
if (blockElement) {
    const rect = blockElement.getBoundingClientRect();
    setTextWindowPosition({
    top: rect.bottom,
    left: rect.left
    });
}
};

