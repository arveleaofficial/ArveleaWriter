import { WebPlugin } from '@capacitor/core';

import type { CapacitorNativeFilesPlugin } from './definitions';

export class CapacitorNativeFilesWeb extends WebPlugin implements CapacitorNativeFilesPlugin {
  async selectFile() {
    return new Promise<{
      fileContent: string,
      fileName: string,
      fileExtension?: string,
    }>((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';

      input.onchange = () => {
        const file = input.files?.[0]
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const fileContent = reader.result;
            if (typeof fileContent === 'string') {
              const fullFileName = file.name;
              const splitFileName = fullFileName.split('.');
              const fileExtension = splitFileName.length > 1 ? splitFileName[splitFileName.length - 1] : undefined;
              resolve({ 
                fileContent,
                fileName: splitFileName[0],
                fileExtension,
              });
            } else {
              reject();
            }
          };
          reader.readAsText(file);
        } else {
          reject();
        }
      };
      input.click();
    });
  }
}