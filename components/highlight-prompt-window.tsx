import {
    useBlockNoteEditor,
    useComponentsContext,
    useEditorContentOrSelectionChange,
  } from "@blocknote/react";
  import "@blocknote/mantine/style.css";
  import { useState, useEffect } from "react";
  import PromptWindow from "./promptWindow"; // Assuming you have a PromptWindow component
  
  export function PromptButton() {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext()!;
  
    // State to track whether the prompt window is shown
    const [showPromptWindow, setShowPromptWindow] = useState(false);
    const [userInput, setUserInput] = useState(""); // For handling user input in the prompt
    const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number }>({
      top: 0,
      left: 0,
    });
    const [savedSelection, setSavedSelection] = useState<Range | null>(null);
  
    // Handle showing the prompt window and positioning it near the highlighted text
    useEffect(() => {
      const handleSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().trim() !== "") {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
  
          // Save the selection for later use
          setSavedSelection(range);
  
          // Position the prompt window near the selected text
          setHighlightPosition({
            top: rect.top + window.scrollY + rect.height + 10, // Below the text
            left: rect.left + window.scrollX,
          });
  
          // Show the prompt window
          setShowPromptWindow(true);
        } else {
          setShowPromptWindow(false);
        }
      };
  
      document.addEventListener("mouseup", handleSelection);
  
      return () => {
        document.removeEventListener("mouseup", handleSelection);
      };
    }, []);
  
    // Restore the text selection when the prompt window is shown
    useEffect(() => {
      if (showPromptWindow && savedSelection) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedSelection); // Restore saved selection
        }
      }
    }, [showPromptWindow, savedSelection]);
  
    // Function to handle key down in the prompt window
    const handleKeyDown = (e: React.KeyboardEvent, closeWindow: () => void, action: () => void) => {
      if (e.key === "Enter") {
        action(); // Trigger any action you want on "Enter"
        closeWindow(); // Close the prompt window
      }
    };
  
    // Handle the user's action after entering text in the prompt
    const handleContinueWritingWrapper = () => {
      // You can implement the logic you want to happen when the user interacts with the prompt
      console.log("User input:", userInput);
    };
  
    return (
      <>
        <Components.FormattingToolbar.Button
          mainTooltip={"Open Prompt"}
          onClick={() => {
            if (savedSelection) {
              // Show the prompt window (already handled by selection detection)
              setShowPromptWindow(true);
            }
          }}
          isSelected={showPromptWindow}
        >
          Open Prompt
        </Components.FormattingToolbar.Button>
  
        {/* Render the prompt window near the selected text */}
        {showPromptWindow && (
          <PromptWindow
            showWindow={showPromptWindow}
            position={highlightPosition} // Position near the highlighted text
            userInput={userInput}
            setUserInput={setUserInput}
            onKeyDown={(e) =>
              handleKeyDown(e, () => setShowPromptWindow(false), handleContinueWritingWrapper)
            }
            onClickOutside={() => setShowPromptWindow(false)} // Close the prompt window when clicking outside
          />
        )}
      </>
    );
  }
  