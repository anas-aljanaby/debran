import { PartialBlock, BlockNoteEditor, BlockIdentifier } from "@blocknote/core";

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

export const resetHighlightedText = (
  editor: BlockNoteEditor, 
  selectedBlockId: BlockIdentifier | null
) => {
  console.log("resetting highlighted text", selectedBlockId);
  if (selectedBlockId) {
    const selectedBlock = editor.getBlock(selectedBlockId);
    if (selectedBlock) {
      const updatedContent = selectedBlock.content.map(item => {
        if (typeof item === 'object' && item.styles && item.styles.backgroundColor === 'blue') {
          return {
            ...item,
            styles: { ...item.styles, backgroundColor: 'default' }
          };
        }
        return item;
      });
      editor.updateBlock(selectedBlock, { content: updatedContent });
    }
  }
};