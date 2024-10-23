import { IonButton, IonButtons, IonCheckbox, IonContent, IonFooter, IonHeader, IonPage, IonPopover, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
import './Editor.scss';
import { Milkdown, useEditor, useInstance } from '@milkdown/react';
import { Editor as milkdownEditor, defaultValueCtx, rootCtx } from '@milkdown/core';
import { gfm, toggleStrikethroughCommand } from '@milkdown/preset-gfm';
import { commonmark,  toggleEmphasisCommand, toggleStrongCommand, wrapInBulletListCommand, wrapInOrderedListCommand, listItemSchema } from '@milkdown/preset-commonmark';
import { ProsemirrorAdapterProvider, useNodeViewContext, useNodeViewFactory } from '@prosemirror-adapter/react';
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { useState, useRef, useEffect, FC, useCallback, useImperativeHandle, forwardRef, createContext, useContext, MutableRefObject, Dispatch, SetStateAction, ComponentProps } from "react";
import { CapacitorNativeFiles } from 'capacitor-native-files'; 
import { Ctx } from '@milkdown/ctx';
import { Bold, Italic, List, ListOrdered, Strikethrough, ListChecks, Undo2 as Undo, Redo2 as Redo } from 'lucide-react';
import { callCommand, $view, $command } from "@milkdown/utils";
import { Keyboard } from '@capacitor/keyboard';
import { history, undoCommand, redoCommand } from '@milkdown/plugin-history';
import { math } from '@milkdown/plugin-math';
import { diagram } from '@milkdown/plugin-diagram';
import { prism, prismConfig} from '@milkdown/plugin-prism';
import markdown from 'refractor/lang/markdown';
import css from 'refractor/lang/css';
import javascript from 'refractor/lang/javascript';
import typescript from 'refractor/lang/typescript';
import jsx from 'refractor/lang/jsx';
import tsx from 'refractor/lang/tsx';
import 'prism-themes/themes/prism-nord.css';
import type { Refractor } from 'refractor/lib/core';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { IonIcon } from '@ionic/react';
import { chevronBackOutline, ellipsisHorizontalCircle, informationCircleOutline } from 'ionicons/icons';
import { replaceAll } from '@milkdown/utils';
import { wrapIn } from '@milkdown/prose/commands';
import { usePlatforms } from '../../hooks/usePlatforms';
import { ProductContext } from '../../context/ProductContext';
import { useHistory } from 'react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { AboutModal } from '../../components/AboutModal';
//import { licenses } from './licenses';

type SetPlaintextValue = (value?: string, options?: {
  doNotUpdateHistory?: boolean,
}) => void;

//TODO: Consider testing .current for context
const EditorContext = createContext<{
  fileLoaded?: boolean,
  saveFile?: MutableRefObject<() => Promise<void>>,
  fileName?: string,
  setFileName?: Dispatch<SetStateAction<string | undefined>>,
  fileExtension?: string,
  filePath?: MutableRefObject<string | undefined>,
  fileIsMarkdown?: boolean,
  plaintextValue?: string,
  plaintextHistory?: MutableRefObject<string[]>,
  plaintextHistoryPos?: MutableRefObject<number | null>,
  pushPlaintextHistory?: (customValue?: string) => void,
  selectFile?: MutableRefObject<() => Promise<void>>,
  setPlaintextValue?: SetPlaintextValue,
  plaintextHistoryTimeout?: MutableRefObject<NodeJS.Timeout | undefined>,
}>({});

const EditorMetaTools = () => {
  const {
    fileName,
    fileLoaded,
    saveFile,
    selectFile,
    fileExtension,
  } = useContext(EditorContext);

  const [displayFileName, setDisplayFileName] = useState<string>();

  useEffect(() => {
    setDisplayFileName(fileName !== undefined ? fileName?.replace(/:/g, "/") : undefined);
  }, [fileName]);

  return (
    <>
      <IonButtons
        slot="start"
      >
        <IonButton
          onClick={() => {
            if (fileLoaded) {
              saveFile?.current();
            }
            selectFile?.current();
          }}
        >
          <IonIcon 
            icon={chevronBackOutline}
          />
        </IonButton>
      </IonButtons>
      <IonTitle
        id="file-popover-trigger"
        //className="sm:ps-27 sm:w-[initial]"
      >
        {displayFileName + (!fileExtension ? "" : "." + fileExtension)}
      </IonTitle>
    </>
  );
};

const EditorTools = ({
  slot = "",
  ...props
}: Pick<ComponentProps<typeof IonButtons>, "slot" | "style" | "className">) => {
  const [editorLoading, getMilkdownInstance] = useInstance();

  const {
    fileIsMarkdown,
    plaintextHistory,
    plaintextHistoryPos,
    plaintextValue,
    pushPlaintextHistory,
    setPlaintextValue,
    plaintextHistoryTimeout
  } = useContext(EditorContext);

  const [showCloseButton, setShowCloseButton] = useState(false);

  const {
    isIphone,
  } = usePlatforms();

  const closeButtonTimeout = useRef<NodeJS.Timeout>();

  const activateShowCloseButtonTimeout = useRef(() => {
    closeButtonTimeout.current = setTimeout(() => {
      setShowCloseButton(true);
    }, 100);
  });

  useEffect(() => {
    Keyboard.addListener('keyboardWillShow', info => {
      activateShowCloseButtonTimeout.current();
    });
    
    Keyboard.addListener("keyboardWillHide", () => {
      if (closeButtonTimeout.current) {
        clearTimeout(closeButtonTimeout.current);
      }
      setShowCloseButton(false);
    });
  }, []);

  return (
    <IonButtons
      slot={slot}
      className={`${props.className || ""} `}
    >
      {
        fileIsMarkdown && (
            <div
              className="flex overflow-x-scroll"
            >
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(toggleStrongCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <Bold />
              </IonButton>
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(toggleEmphasisCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <Italic />
              </IonButton>
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(toggleStrikethroughCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <Strikethrough />
              </IonButton>
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(wrapInTaskListCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <ListChecks />
              </IonButton>
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(wrapInBulletListCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <List />
              </IonButton>
              <IonButton
                onMouseDown={event => {
                  const editorGetResult = getMilkdownInstance();
                  if (editorGetResult) {
                    editorGetResult.action(callCommand(wrapInOrderedListCommand.key));
                  }
                  event.preventDefault();
                }}
              >
                <ListOrdered />
              </IonButton>
          </div>
        )
      }
      <div
        className="flex relative ml-auto"
      >
        <div 
          className="min-w-[18px] h-full absolute left-[-8px]"
          style={{
            background: "linear-gradient(270deg, var(--background) 62%, transparent)",
          }}
        />
        <IonButton
          onMouseDown={event => {
            if (fileIsMarkdown) {
              const editorGetResult = getMilkdownInstance();
              if (editorGetResult) {
                editorGetResult.action(callCommand(undoCommand.key));
              }
            } else if (pushPlaintextHistory !== undefined && !!setPlaintextValue && !!plaintextHistory && !!plaintextHistoryPos && plaintextHistoryPos.current !== 0) {
              if (plaintextHistory.current[plaintextHistory.current.length - 1] !== plaintextValue && plaintextHistoryPos.current === null) {
                clearTimeout(plaintextHistoryTimeout?.current);
                pushPlaintextHistory();
              }
              if (plaintextHistoryPos.current === null) {
                plaintextHistoryPos.current = plaintextHistory.current.length - 1;
              }
              plaintextHistoryPos.current--;
              setPlaintextValue(plaintextHistory.current[plaintextHistoryPos.current], {
                doNotUpdateHistory: true,
              });
            }
            event.preventDefault();
          }}
        >
          <Undo />
        </IonButton>
        <IonButton
          onMouseDown={event => {
            if (fileIsMarkdown) {
              const editorGetResult = getMilkdownInstance();
              if (editorGetResult) {
                editorGetResult.action(callCommand(redoCommand.key));
              }
              event.preventDefault();
            } else if (!!setPlaintextValue && !!plaintextHistory && !!plaintextHistoryPos && plaintextHistoryPos.current !== null && plaintextHistoryPos.current !== plaintextHistory.current.length - 1) {
              plaintextHistoryPos.current++;
              setPlaintextValue(plaintextHistory.current[plaintextHistoryPos.current], {
                doNotUpdateHistory: true,
              });
            }
          }}
        >
          <Redo />
        </IonButton>
        {
          (!!isIphone && !!showCloseButton) && (
            <IonButton
              onClick={() => {
                Keyboard.hide();
              }}
            >
              Done
            </IonButton>
          )
        }
      </div>
    </IonButtons>
  );
};

const MilkdownListItem: FC = () => {
  const nodeViewContext = useNodeViewContext();
  const {
    node: {
      attrs: {
        checked,
      },
    },
    contentRef,
  } = nodeViewContext;

  return (
    <>
      {
        checked !== null ? (
          <div
            className="milkdown-list-item"
          >
            <IonCheckbox
              onIonChange={() => {
                nodeViewContext.setAttrs({
                  checked: !checked,
                });
              }}
              checked={checked}
            />
            <div 
              ref={contentRef}
            />
          </div>
        ) : (
          <li>
            <div 
              ref={contentRef} 
            />
          </li>
        )
      }
    </>
  );
};

const wrapInTaskListCommand = $command('WrapInTaskList', ctx => () => wrapIn(listItemSchema.type(ctx), {
  checked: false,
}));

type MilkdownEditorRef = {
  replaceAll: (params?: {
    content?: string,
  }) => void,
};

const MilkdownEditor = forwardRef<MilkdownEditorRef, {
  initialContent?: string,
  onChange?: (ctx: Ctx, markdown: string, prevMarkdown: string | null) => void,
  onFocus?: (ctx: Ctx) => void,
  onBlur?: (ctx: Ctx) => void,
}>(({
  initialContent = "",
  ...props
}, ref) => {
  const nodeViewFactory = useNodeViewFactory();

  //TODO: See if logic added to fix clear history can be improved (simply check commit).
  useEffect(() => {
    return () => {
      editor.get()?.destroy();
    };
  }, []);

  const editor = useEditor(
    (root) => {
      return milkdownEditor
        .make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, initialContent);
          if (!!props.onChange) {
            ctx.get(listenerCtx).markdownUpdated(props.onChange);
          }
          if (!!props.onFocus) {
            ctx.get(listenerCtx).focus(props.onFocus);
          }
          if (!!props.onBlur) {
            ctx.get(listenerCtx).blur(props.onBlur);
          }
          ctx.set(prismConfig.key, {
            configureRefractor: (refractor: Refractor) => {
              refractor.register(markdown);
              refractor.register(css);
              refractor.register(javascript);
              refractor.register(typescript);
              refractor.register(jsx);
              refractor.register(tsx);
            },
          });
        })
        .use(
          $view(listItemSchema.node, () =>
            nodeViewFactory({ 
              component: MilkdownListItem,
            })
          )
        )
        .use(commonmark)
        .use(gfm)
        .use(listener)
        .use(diagram)
        .use(history)
        .use(math)
        .use(prism)
        .use(clipboard)
        .use(cursor)
        .use(wrapInTaskListCommand)
      ;
    }
  );

  useImperativeHandle(ref, () => ({
    //Note: The current replaceAll logic will probably always reset undo/redo history as long as the main Editor IonContent key is changed (this ref replaceAll method has not been tested without the IonContent key change logic). Things use to be different but logic had to be changed in questionable ways in order to workaround `RangeError: Can not convert <> to a Fragment (looks like multiple versions of prosemirror-model were loaded)` Milkdown issue.
    replaceAll: (params) => {
      const editorGet = editor.get();
      if (editorGet) {
        editorGet.action(replaceAll(params?.content || "", false));
        editorGet.destroy();
      }
    }
  }), []);

  return (
    <>
      <Milkdown />
    </>
  );
});

const Editor: React.FC = () => {
  const history = useHistory();

  const {
    productActive,
  } = useContext(ProductContext);

  useEffect(() => {
    if (!productActive) {
      history.replace("/");
      CapacitorNativeFiles.closeSelectFile?.();
    }
  }, [productActive]);

  const [initialContent, setInitialContent] = useState<string>();

  const filePath = useRef<string>();

  const saveTimeout = useRef<NodeJS.Timeout>();

  const [fileName, setFileName] = useState<string>();

  const [fileLoaded, setFileLoaded] = useState<boolean>(false);

  const [fileExtension, setFileExtension] = useState<string>();

  const firstFileSelected = useRef(false);

  const ionContent = useRef<HTMLIonContentElement>(null);

  const markCurrentlySavedContent = useRef((content?: string) => {
    recentlySavedContent.current = content;
  });

  const milkdownEditorRef = useRef<MilkdownEditorRef>(null);

  const [plaintextValue, setPlaintextValueState] = useState<string>();

  const bypassNextPlaintextHistoryCycle = useRef(false);

  const setPlaintextValue: SetPlaintextValue = (value, options) => {
    if (options?.doNotUpdateHistory) {
      bypassNextPlaintextHistoryCycle.current = true;
    }
    setPlaintextValueState(value);
  };

  const currentContent = useRef<string>();

  const recentlySavedContent = useRef<string>();

  const [fileIsMarkdown, setFileIsMarkdown] = useState<boolean>();

  useEffect(() => {
    switch (fileExtension) {
      case "md":
      case "markdown":
      case "mdown":
      case "mdwn":
      case "mkdn":
      case "mkd":
      case "mdtxt":
      case "mdtext":
        setFileIsMarkdown(true);
        break;
      default:
        setFileIsMarkdown(false);
    }
  }, [fileExtension]);

  const amountOfFileOpens = useRef(0);

  const loadFile = useRef((file: {
    filePath?: string,
    fileContent?: string,
    fileName: string,
    fileExtension?: string,
  }) => {
    if (file.filePath) {
      filePath.current = file.filePath;
    }
    const {
      fileContent,
    } = file;
    currentContent.current = fileContent;
    markCurrentlySavedContent.current(fileContent);
    setFileExtension(file.fileExtension);
    if (!!milkdownEditorRef.current) {
      milkdownEditorRef.current?.replaceAll({
        content: fileContent,
      });
    }
    amountOfFileOpens.current++;
    setInitialContent(fileContent);
    plaintextEditorRef.current?.scrollTo(0,0);
    setFileName(file.fileName);
    setFileLoaded(true);
    firstFileSelected.current = true;
    
    SplashScreen.hide();
  });

  const selectFile = useRef(async () => {
    try {
      if (productActive) {
        const firstPresentedListener = await CapacitorNativeFiles.addListener("fileBrowserPresented", () => {
          SplashScreen.show();
          firstPresentedListener.remove();
        });

        const fileBrowserAboutToDismissListener = await CapacitorNativeFiles.addListener("fileBrowserAboutToDismiss", () => {
          SplashScreen.hide();
          fileBrowserAboutToDismissListener.remove();
        });
      
        const selectedFile = await CapacitorNativeFiles.selectFile?.({
          tintColor: getComputedStyle(document.documentElement).getPropertyValue("--ion-color-primary"),
          modalTransitionStyle: firstFileSelected.current ? "coverVertical" : "crossDissolve",
          hideDismissButton: !firstFileSelected.current,
        });
        if (selectedFile) {
          if (filePath.current !== selectedFile.filePath) {
            if (ionContent.current?.getScrollElement) {
              const scrollElement = await ionContent.current.getScrollElement();
              scrollElement.scrollTo({
                top: 0,
                left: 0,
              });
            }
          }
          loadFile.current(selectedFile);
        } else {
          throw new Error("selectedFile not returned.");
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  const initiateAutosaveCycle = useRef((newContent: string) => {
    currentContent.current = newContent;
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    saveTimeout.current = setTimeout(() => {
      saveFile.current();
    }, 1000);
  });
  
  const saveFile = useRef(async () => {
    try {
      if (!!filePath.current && currentContent.current !== undefined) {
        await CapacitorNativeFiles.writeToFile?.({
          filePath: filePath.current,
          fileContent: currentContent.current,
        });
        markCurrentlySavedContent.current(currentContent.current);
      } else {
        throw new Error("Couldn't save file.");
      }
    } catch (error) {
      console.error(error);
    }
  });

  useEffect(() => {
    selectFile.current();
  }, []);

  const resetPlaintextHistoryPos = useRef(() => {
    plaintextHistoryPos.current = null;
  });
  
  useEffect(() => {
    plaintextHistory.current = [];
    resetPlaintextHistoryPos.current();
    if (!fileIsMarkdown) {
      setPlaintextValue(initialContent);
    }
  }, [initialContent, fileIsMarkdown]);

  const plaintextHistoryTimeout = useRef<NodeJS.Timeout>();

  const initiatePlaintextHistoryCycle = () => {
    if (plaintextHistoryTimeout.current) {
      clearTimeout(plaintextHistoryTimeout.current);
    }
    if (!bypassNextPlaintextHistoryCycle.current) {
      if (!fileIsMarkdown) {
        plaintextHistoryTimeout.current = setTimeout(() => {
          pushPlaintextHistory();
        }, 250);
      }
    } else {
      bypassNextPlaintextHistoryCycle.current = false;
    }
  };

  const plaintextHistory = useRef<string[]>([]);

  const plaintextHistoryPos = useRef<number | null>(null);
  
  const pushPlaintextHistory = useCallback((customValue?: string) => {
    const newValue = customValue || plaintextValue || "";
    if (newValue !== plaintextHistory.current[plaintextHistory.current.length - 1]) {
      plaintextHistory.current.push(customValue || plaintextValue || "");
    }
  }, [plaintextValue]);
  
  useEffect(() => {
    if (plaintextValue !== undefined && fileLoaded) {
      initiatePlaintextHistoryCycle();
      initiateAutosaveCycle.current(plaintextValue);
    }
  }, [plaintextValue]);

  const {
    isIphone
  } = usePlatforms();

  const plaintextEditorRef = useRef<HTMLTextAreaElement>(null);

  const [presentAlert] = useIonAlert();

  return (
    <EditorContext.Provider
      value={{
        fileLoaded,
        saveFile,
        fileName,
        setFileName,
        fileExtension,
        filePath,
        fileIsMarkdown,
        plaintextValue,
        plaintextHistory,
        plaintextHistoryPos,
        pushPlaintextHistory,
        setPlaintextValue,
        plaintextHistoryTimeout,
        selectFile,
      }}
    >
      <IonPage>
        <IonHeader>
          <IonToolbar>
            {
              fileLoaded ? (
                <EditorMetaTools />
              ) : (
                <IonTitle>
                  ArveleaWriter
                </IonTitle>
              )
            }
            <IonButtons
              slot="end"
            >
              <IonButton
                id="expanded-meta"
              >
                <IonIcon 
                  icon={ellipsisHorizontalCircle}
                />
              </IonButton>
            </IonButtons>
            <IonPopover 
              trigger="expanded-meta" 
              triggerAction="click"
            >
              <IonButton
                expand="full"
                fill="clear"
                color="dark"
                id="editor-about-modal"
                style={{
                  whiteSpace: "nowrap",
                }}
              >
                About ArveleaWriter
                <IonIcon 
                  icon={informationCircleOutline}
                  slot="end"
                  style={{
                    marginLeft: "auto",
                    paddingLeft: 3,
                  }}
                />
              </IonButton>
              <AboutModal 
                trigger="editor-about-modal"
              />
            </IonPopover>
          </IonToolbar>
          {
            (fileLoaded && !isIphone) && (
              <IonToolbar>
                <EditorTools />
              </IonToolbar>
            )
          }
        </IonHeader>
        {
          fileLoaded ? (
            <>
              <IonContent
                ref={ionContent}
                key={amountOfFileOpens.current}
                scrollX={!!fileIsMarkdown}
                scrollY={!!fileIsMarkdown}
              > 
                {
                  fileIsMarkdown ? (
                    <ProsemirrorAdapterProvider>
                      <MilkdownEditor
                        ref={milkdownEditorRef}
                        initialContent={initialContent!}
                        onChange={(ctx, markdown) => {
                          initiateAutosaveCycle.current(markdown);
                        }}
                      />
                    </ProsemirrorAdapterProvider>
                  ) : (
                    <textarea 
                      value={plaintextValue}
                      ref={plaintextEditorRef}
                      onChange={event => {
                        if (plaintextHistoryPos.current !== null) {
                          plaintextHistory.current.length = plaintextHistoryPos.current + 1;
                        }
                        resetPlaintextHistoryPos.current();
                        setPlaintextValue(event.target.value);
                      }}
                    />
                  )
                } 
              </IonContent>
              {
                isIphone && (
                  <IonFooter>
                    <IonToolbar>
                      <EditorTools />
                    </IonToolbar>
                  </IonFooter>
                )
              }
            </>
          ) : (
            <div
              className="h-full w-full flex justify-center items-center bg-white dark:bg-black"
            >
              <IonButton 
                fill="clear"
                onClick={selectFile.current}
              >
                Open File...
              </IonButton>
            </div>
          )
        }
      </IonPage>
    </EditorContext.Provider>
  );
};

export default Editor;
