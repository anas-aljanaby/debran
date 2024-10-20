import {
  useBlockNoteEditor,
  useComponentsContext,
  useEditorContentOrSelectionChange,
} from "@blocknote/react";
import "@blocknote/mantine/style.css";
import React, { useState, useEffect } from "react";

import { PartialBlock, BlockIdentifier, DefaultBlockSchema, BlockNoteEditor } from "@blocknote/core";

interface PromptButtonProps {
  label: string;
  tooltip: string;
  onClick: () => void;
}

export function PromptButton({
  label,
  tooltip,
  onClick,
}: PromptButtonProps) {
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