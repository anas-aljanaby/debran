import {
  useBlockNoteEditor,
  useComponentsContext,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";

interface PromptButtonProps {
  label: string;
  tooltip: string;
  onClick: () => void;
}

export function PromptButton({ label, tooltip, onClick }: PromptButtonProps) {
  const editor = useBlockNoteEditor();
  const Components = useComponentsContext()!;

  return (
    <Components.FormattingToolbar.Button
      mainTooltip={tooltip}
      onClick={onClick}
    >
      {label}
    </Components.FormattingToolbar.Button>
  );
}
