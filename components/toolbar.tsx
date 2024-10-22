"use client";

import { ElementRef, useRef, useState, useEffect } from "react";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";

import { useCoverImage } from "@/hooks/use-cover-image";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import TextareaAutosize from "react-textarea-autosize";
import { IconPicker } from "./icon-picker";
import { Smile, X, MessageSquare } from "lucide-react";

interface ToolbarProps {
  initialData: Doc<"documents">;
  preview?: boolean;
  onLlmContextChange: (context: string) => void;
  llmContext: string;
}

export const Toolbar = ({ initialData, preview, onLlmContextChange, llmContext }: ToolbarProps) => {
  const inputRef = useRef<ElementRef<"textarea">>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(initialData.title);
  const [showLlmContext, setShowLlmContext] = useState(false);
  const [localLlmContext, setLocalLlmContext] = useState(llmContext);

  const update = useMutation(api.documents.update);
  const removeIcon = useMutation(api.documents.removeIcon);
  const coverImage = useCoverImage();

  const enableInput = () => {
    if (preview) return;

    setIsEditing(true);
    setTimeout(() => {
      setValue(initialData.title);
      inputRef.current?.focus();
    }, 0);
  };

  const disableInput = () => setIsEditing(false);

  const onInput = (value: string) => {
    setValue(value);
    update({
      id: initialData._id,
      title: value || "Untitled",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      disableInput();
    }
  };

  const onIconSelect = (icon: string) => {
    update({
      id: initialData._id,
      icon,
    });
  };

  const onRemoveIcon = () => {
    removeIcon({
      id: initialData._id,
    });
  };

  const toggleLlmContext = () => {
    setShowLlmContext(!showLlmContext);
  };

  const onLlmContextInput = (value: string) => {
    setLocalLlmContext(value);
  };

  const onLlmContextBlur = () => {
    if (localLlmContext !== llmContext) {
      onLlmContextChange(localLlmContext);
      update({
        id: initialData._id,
        llmContext: localLlmContext,
      });
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setLocalLlmContext(llmContext);
  }, [llmContext]);

  return (
    <div className="group relative pl-12">
      {!!initialData.icon && !preview && (
        <div className="group/icon flex items-center gap-x-2 pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl transition hover:opacity-75">
              {initialData.icon}
            </p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            className="rounded-full text-xs text-muted-foreground opacity-0 transition group-hover/icon:opacity-100"
            variant="outline"
            size="icon"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && (
        <p className="pt-6 text-6xl">{initialData.icon}</p>
      )}
      <div className="flex items-center gap-x-1 py-2 group-hover:opacity-100 md:opacity-0">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button
              className="text-xs text-muted-foreground"
              variant="outline"
              size="sm"
            >
              <Smile className="mr-2 h-4 w-4" />
              Add icon
            </Button>
          </IconPicker>
        )}
        {!preview && (
          <Button
            onClick={toggleLlmContext}
            className="text-xs text-muted-foreground"
            variant="outline"
            size="sm"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            {showLlmContext ? "Hide LLM Context" : (llmContext ? "Show LLM Context" : "Add LLM Context")}
          </Button>
        )}
      </div>
      {showLlmContext && !preview && (
        <TextareaAutosize
          value={localLlmContext}
          onChange={(e) => onLlmContextInput(e.target.value)}
          onBlur={onLlmContextBlur}
          placeholder="Enter context for the LLM..."
          className="w-4/5 resize-none rounded-lg dark:border-neutral-600
           bg-transparent px-3 py-2 text-md border border-neutral-300
           placeholder:text-muted-foreground focus-visible:outline-none
           disabled:cursor-not-allowed disabled:opacity-50
           backdrop-blur-md shadow-md"
          minRows={3}
        />
      )}
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          spellCheck="false"
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(e) => onInput(e.target.value)}
          className="resize-none break-words bg-transparent text-5xl 
           font-bold text-[#3F3F3F] outline-none dark:text-[#CFCFCF]"
        />
      ) : (
        <div
          onClick={enableInput}
          className="break-words pb-[.7188rem] text-5xl font-bold  text-[#3F3F3F] outline-none dark:text-[#CFCFCF]"
        >
          {initialData.title}
        </div>
      )}

    </div>
  );
};
