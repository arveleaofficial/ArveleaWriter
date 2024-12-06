import { createContext, Dispatch, SetStateAction } from "react";

export const AboutModalContext = createContext<{
  isOpen?: boolean,
  setIsOpen?: Dispatch<SetStateAction<boolean>>,
}>({});