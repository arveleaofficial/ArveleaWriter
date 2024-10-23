import { PurchasesPackage } from "@revenuecat/purchases-capacitor";
import { createContext, Dispatch, MutableRefObject, SetStateAction } from "react";

export const ProductContext = createContext<{
  loadingProduct?: boolean,
  freeTrialAvailable?: boolean,
  monthlyPrice?: string,
  productId?: MutableRefObject<string | undefined>,
  productActive?: boolean,
  setProductActive?: Dispatch<SetStateAction<boolean>>,
  product?: PurchasesPackage,
  csd?: any,
  rco?: any,
  freeTrialUsed?: boolean,
}>({});