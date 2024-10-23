import { IonButton, IonContent, IonIcon, IonLoading, IonPage, IonSkeletonText, IonText, useIonRouter } from '@ionic/react';
import './Auth.scss';
import logoIcon from "../../assets/logo-icon.svg"; 
import { useContext, useEffect, useState } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { useHistory } from 'react-router';
import { useSetTouchMove } from '../../hooks/useSetTouchMove';
import { usePresentErrorToast } from '../../hooks/usePresentErrorToast';
import { AboutModal } from '../../components/AboutModal';
import { Purchases, LOG_LEVEL, PurchasesPackage, PURCHASES_ERROR_CODE } from '@revenuecat/purchases-capacitor';
import { SplashScreen } from '@capacitor/splash-screen';

export const Auth: React.FC = () => {
  const ionRouter = useIonRouter();

  const history = useHistory();

  const {
    loadingProduct,
    freeTrialAvailable,
    monthlyPrice,
    productActive,
    product,
    setProductActive,
    freeTrialUsed,
  } = useContext(ProductContext);
  
  useEffect(() => {
    if (productActive) {
      ionRouter.push("/editor", "none");
    }
  }, [productActive]);

  const {
    setTouchMove,
  } = useSetTouchMove();

  useEffect(() => {
    setTouchMove(false);
    return history.listen(() => {
      setTouchMove(true);
    });
  }, []);

  const presentErrorToast = usePresentErrorToast();

  const [ionLoadingOpen, setIonLoadingOpen] = useState(false);

  return (
    <IonPage>
      <IonContent>
        <IonLoading 
          isOpen={ionLoadingOpen}
        />
        <div
          className="ion-padding auth-content"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            height: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              textAlign: "center",
              margin: "auto",
            }}
          >
            {/*
            <button
              onClick={() => {
                setLoadingProduct(!loadingProduct);
              }}
            >
              loadingProduct
            </button>
            */}
            <div
              className="logo"
            >
              <IonIcon icon={logoIcon} /><span>ArveleaWriter<span>™</span></span>
            </div>
            <p
              style={{
                marginTop: 11.7,
              }}
              className="copy"
            >
              Markdown & text editor. Open & edit markdown or text files stored in the Files app.
            </p>
            <div
              //TODO: Consider "Tailwind cleanup"
              className="w-full"
              style={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {
                //TODO: Consider replacing with a "smoother" loader.
                (loadingProduct || !product || freeTrialUsed === undefined) ? (
                  <IonSkeletonText
                    animated
                    style={{
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <>
                    {
                      (!!freeTrialAvailable && !freeTrialUsed) && (
                        <IonText
                          color="medium"
                        >
                          <p
                            className="copy"
                            style={{
                              marginTop: 0,
                            }}
                          >
                            1-Week Free Trial, Then {monthlyPrice} per Month
                          </p>
                        </IonText>
                      )
                    }
                    <IonButton
                      size="large"
                      color="primary"
                      onClick={async () => {
                        setIonLoadingOpen(true);
                        try {
                          const purchaseResult = await Purchases.purchasePackage({ 
                            aPackage: product 
                          });
                          console.log(purchaseResult);
                          if (typeof purchaseResult.customerInfo.entitlements.active["aluminum0.1"] !== "undefined") {
                            if (setProductActive) {
                              setProductActive(true);
                            }
                          }
                        } catch (error) {
                          console.log(error);
                          if (setProductActive) {
                            setProductActive(false);
                          }
                        } finally {
                          setIonLoadingOpen(false);
                        }
                      }}
                    >
                      {/*TODO: DRY*/(!!freeTrialAvailable && !freeTrialUsed) ? "Start Free Trial" : monthlyPrice + " per Month"}
                    </IonButton>
                    <IonText
                      color="medium"
                    >
                      <p
                        onClick={async () => {
                          setIonLoadingOpen(true);
                          try {
                            const customerInfo = await Purchases.restorePurchases();
                            if (customerInfo.customerInfo.entitlements.active["aluminum0.1"].isActive) {
                              if (setProductActive) {
                                setProductActive(true);
                              }
                            } else {
                              if (setProductActive) {
                                setProductActive(false);
                              }
                            }
                          } catch (error) {
                            console.error(error);
                          } finally {
                            setIonLoadingOpen(false);
                          }
                        }}
                      >
                        Restore Purchase
                      </p>
                    </IonText>
                    <IonText
                      color="medium"
                      className="[&>*]:text-inherit"
                      style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-around",
                        marginTop: 30,
                      }}
                    >
                      <a
                        href="https://arvelea.com/writer/privacy-policy"
                        target="_blank"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                        target="_blank"
                      >
                        Terms of Use
                      </a>
                    </IonText>
                  </>
                )
              }
            </div>
          </div>
          {/*TODO: Add actual about UI from Editor*/}
          <IonText
            color="medium"
            id="auth-about-modal"
            className="mb-[var(--ion-safe-area-bottom)]"
          >
            <p>
              About
            </p>
          </IonText>  
          <AboutModal 
            trigger="auth-about-modal"
          />
        </div>
      </IonContent>     
    </IonPage>
  );
};