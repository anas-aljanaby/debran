import {
    useBlockNoteEditor,
    useComponentsContext,
    useEditorContentOrSelectionChange,
  } from "@blocknote/react";
  import "@blocknote/mantine/style.css";
  import { useState } from "react";
  import PromptWindow from "./promptWindow"; // Assuming you have a PromptWindow component
  
  export function PromptButton() {
    const editor = useBlockNoteEditor();
    const Components = useComponentsContext()!;
  
    // State for tracking whether the prompt window is visible
    const [showPromptWindow, setShowPromptWindow] = useState(false);
    const [userInput, setUserInput] = useState(""); // State for managing user input in the prompt window
    const [isSelected, setIsSelected] = useState<boolean>(
      editor.getActiveStyles().textColor === "blue" &&
        editor.getActiveStyles().backgroundColor === "blue"
    );
  
    // Updates state on content or selection change.
    useEditorContentOrSelectionChange(() => {
      setIsSelected(
        editor.getActiveStyles().textColor === "blue" &&
          editor.getActiveStyles().backgroundColor === "blue"
      );
    }, editor);
  
    // Function to handle key down event inside the prompt window
    const handleKeyDown = (e: React.KeyboardEvent, closeWindow: () => void, action: () => void) => {
      if (e.key === "Enter") {
        action(); // Trigger any specific action
        closeWindow(); // Close the prompt window
      }
    };
  
    // Function that will trigger when the user submits the prompt
    const handleContinueWritingWrapper = () => {
      editor.toggleStyles({
        textColor: "blue",
        backgroundColor: "blue",
      });
    };
  
    return (
      <>
        <Components.FormattingToolbar.Button
          mainTooltip={"Open Prompt"}
          onClick={() => setShowPromptWindow(true)} // Show the prompt window on click
          isSelected={isSelected}
        >
          Open Prompt
        </Components.FormattingToolbar.Button>
  
        {/* Render the prompt window conditionally based on the state */}
        {showPromptWindow && (
          <PromptWindow
            showWindow={showPromptWindow}
            position={{ top: 100, left: 100 }} // Adjust the position as needed
            userInput={userInput}
            setUserInput={setUserInput}
            onKeyDown={(e) =>
              handleKeyDown(e, () => setShowPromptWindow(false), handleContinueWritingWrapper)
            }
            onClickOutside={() => setShowPromptWindow(false)} // Close the window when clicking outside
          />
        )}
      </>
    );
  }
  