import { Plugin } from "@capacitor/core";

export interface CapacitorNativeFilesPlugin extends Plugin {
  selectFile?: (params?: {
    tintColor?: string,
    modalTransitionStyle?: "crossDissolve" | "coverVertical" | "flipHorizontal" | "partialCurl",
    hideDismissButton?: boolean,
  }) => Promise<{
    filePath?: string,
    fileContent: string,
    fileName: string,
    fileExtension?: string,
  }>,
  writeToFile?: (data: {
    filePath: string,
    fileContent: string,
  }) => Promise<void>,
  closeSelectFile?: () => Promise<void>,
};