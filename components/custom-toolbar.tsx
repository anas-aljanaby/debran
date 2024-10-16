import React from "react";
import {
  FormattingToolbar,
  BlockTypeSelect,
  BasicTextStyleButton,
  TextAlignButton,
  ColorStyleButton,
  NestBlockButton,
  UnnestBlockButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
} from "@blocknote/react";
import { PromptButton } from "./prompt-button";

interface CustomToolbarProps {
  handleSelection: () => void;
}

const CustomToolbar: React.FC<CustomToolbarProps> = ({ handleSelection }) => {
  return (
    <FormattingToolbar>
      <BlockTypeSelect key={"blockTypeSelect"} />
      <PromptButton
        label="Blue"
        tooltip="Apply Blue Color"
        onClick={handleSelection}
      />
      <FileCaptionButton key={"fileCaptionButton"} />
      <FileReplaceButton key={"replaceFileButton"} />
      <BasicTextStyleButton basicTextStyle={"bold"} key={"boldStyleButton"} />
      <BasicTextStyleButton basicTextStyle={"italic"} key={"italicStyleButton"} />
      <BasicTextStyleButton basicTextStyle={"underline"} key={"underlineStyleButton"} />
      <BasicTextStyleButton basicTextStyle={"strike"} key={"strikeStyleButton"} />
      <BasicTextStyleButton key={"codeStyleButton"} basicTextStyle={"code"} />
      <TextAlignButton textAlignment={"left"} key={"textAlignLeftButton"} />
      <TextAlignButton textAlignment={"center"} key={"textAlignCenterButton"} />
      <TextAlignButton textAlignment={"right"} key={"textAlignRightButton"} />
      <ColorStyleButton key={"colorStyleButton"} />
      <NestBlockButton key={"nestBlockButton"} />
      <UnnestBlockButton key={"unnestBlockButton"} />
      <CreateLinkButton key={"createLinkButton"} />
    </FormattingToolbar>
  );
};

export default CustomToolbar;
