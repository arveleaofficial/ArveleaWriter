import { Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, useIonAlert } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Editor from './pages/Editor/Editor';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

import './global.css';
import { MilkdownProvider } from '@milkdown/react';
import { Auth } from './pages/Auth/Auth';
import { Keyboard } from '@capacitor/keyboard';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { ProductContext } from './context/ProductContext';
import { SplashScreen } from '@capacitor/splash-screen';
import 'cordova-plugin-purchase';
import { Purchases, LOG_LEVEL, PurchasesPackage, PURCHASES_ERROR_CODE, ENTITLEMENT_VERIFICATION_MODE } from '@revenuecat/purchases-capacitor';

setupIonicReact({
  swipeBackEnabled: false,
});

const App: React.FC = () => {
  const [capturedKeyboardHeight, setCapturedKeyboardHeight] = useState(0);

  useEffect(() => {
    SplashScreen.show({
      autoHide: false,
    });

    Keyboard.addListener("keyboardWillShow", info => {
      setCapturedKeyboardHeight(info.keyboardHeight);
    });
    
    Keyboard.addListener("keyboardDidHide", () => {
      setCapturedKeyboardHeight(0);
    });

    Keyboard.setAccessoryBarVisible({
      isVisible: false,
    });
  }, []);

  const [csd, setCsd] = useState<any[]>([]);
  const [rco, setRco] = useState<any[]>([]);

  const [productActive, setProductActive] = useState(localStorage.getItem("productActive") === "true" ? true : false);

  useEffect(() => {
    localStorage.setItem("productActive", productActive ? "true" : "false");
  }, [productActive]);

  const [product, setProduct] = useState<PurchasesPackage>();

  const [freeTrialUsed, setFreeTrialUsed] = useState<boolean>();

  useEffect(() => {
    //setProductActive(true);
    (async function () {
      try {
        //TODO: Consider removing or reconsidering this setLogLevel instance.
        await Purchases.setLogLevel({ 
          level: LOG_LEVEL.DEBUG,
        });
        await Purchases.configure({
          apiKey: import.meta.env.VITE_REVENUE_CAT_API_KEY,
          appUserID: import.meta.env.VITE_REVENUE_CAT_APP_USER_ID,
          entitlementVerificationMode: ENTITLEMENT_VERIFICATION_MODE.INFORMATIONAL,
        });
        await Purchases.addCustomerInfoUpdateListener((customerInfo) => {
          console.log("addCustomerInfoUpdateListener:");
          console.log(customerInfo);
          console.log(csd);
          setCsd([...csd, customerInfo]);
          console.log(csd);
          setFreeTrialUsed(!!customerInfo.entitlements.active["aluminum0.1"]?.originalPurchaseDate);
          if(typeof customerInfo.entitlements.active["aluminum0.1"] !== "undefined") {
            setProductActive(true);
          } else {
            setProductActive(false);
          }
        });
        const offerings = await Purchases.getOfferings();
        console.log("offerings:");
        console.log(offerings);
        console.log(rco);
        setRco([...rco, offerings]);
        console.log(rco);
        const targetProduct = offerings.all["aluminum0.1"]["monthly"];
        if (targetProduct) {
          setProduct(targetProduct);
          setFreeTrialAvailable(targetProduct.product.introPrice?.price === 0);
          setMonthlyPrice(targetProduct.product.pricePerMonthString);
          setLoadingProduct(false);
          SplashScreen.hide();
        }
      } catch (error) {
        setProductActive(false);
      } /*finally {
        setProductActive(true);
      }*/
    })();
    //setProductActive(true);
  }, []);


  const [loadingProduct, setLoadingProduct] = useState(true);

  const [freeTrialAvailable, setFreeTrialAvailable] = useState<boolean>();

  const [monthlyPrice, setMonthlyPrice] = useState<string | undefined>();

  return (
    <ProductContext.Provider
      value={{
        loadingProduct,
        freeTrialAvailable,
        monthlyPrice,
        productActive,
        product,
        setProductActive,
        csd,
        rco,
        freeTrialUsed,
      }}
    >
      <IonApp
        style={{
          //TODO: Consider finding a way to not have to hardcode the border style here.
          borderBottom: capturedKeyboardHeight < 100 ? "0.55px solid" : undefined,
        }}
      >
        <MilkdownProvider>
          <IonReactRouter>
            <IonRouterOutlet>
              <Route exact path="/editor">
                <Editor />
              </Route>
              <Route exact path="/">
                <Auth />
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </MilkdownProvider>
      </IonApp>
    </ProductContext.Provider>
  );
};

export default App;
