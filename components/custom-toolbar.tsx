import {
    BasicTextStyleButton,
    BlockTypeSelect,
    ColorStyleButton,
    CreateLinkButton,
    FileCaptionButton,
    FileReplaceButton,
    FormattingToolbar,
    NestBlockButton,
    TextAlignButton,
    UnnestBlockButton,
  } from "@blocknote/react";
  
  // Modify the toolbar to accept a button as a prop
  export const CustomToolbar = ({ customButton }: { customButton: JSX.Element }) => (
    <FormattingToolbar>
      <BlockTypeSelect key={"blockTypeSelect"} />
  
      {/* Use the custom button passed as a prop */}
      {customButton}
  
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
  