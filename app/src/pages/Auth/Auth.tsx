import { IonButton, IonContent, IonLoading, IonPage, IonSkeletonText, IonText, useIonRouter } from '@ionic/react';
import './Auth.scss';
import { useContext, useEffect, useState } from 'react';
import { ProductContext } from '../../context/ProductContext';
import { useHistory } from 'react-router';
import { useSetTouchMove } from '../../hooks/useSetTouchMove';
import { usePresentErrorToast } from '../../hooks/usePresentErrorToast';
import { Purchases } from '@revenuecat/purchases-capacitor';
import { Logo } from '../../components/Logo/Logo';
import { AboutLink } from '../../components/AboutLink/AboutLink';

export const Auth: React.FC = () => {
  const ionRouter = useIonRouter();

  const history = useHistory();

  const {
    loadingProduct,
    freeTrialExists,
    monthlyPrice,
    productActive,
    product,
    setProductActive,
    freeTrialKnownNotUsed,
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

  const [freeTrialKnownAsAvailable, setFreeTrialKnownAsAvailable] = useState<boolean>();

  useEffect(() => {
    setFreeTrialKnownAsAvailable(!!freeTrialExists && !!freeTrialKnownNotUsed);
  }, [freeTrialExists, freeTrialKnownNotUsed]);

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
            <Logo 
              id="logo"
            />
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
              style={{
                height: 200,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              {
                //TODO: Consider replacing with a "smoother" loader.
                ((loadingProduct || !product || freeTrialKnownNotUsed === undefined || freeTrialExists === undefined || freeTrialKnownAsAvailable === undefined)) ? (
                  <IonSkeletonText
                    animated
                    style={{
                      borderRadius: 10,
                    }}
                  />
                ) : (
                  <>
                    <IonText
                      color="medium"
                    >
                      <p
                        className="copy"
                        style={{
                          marginTop: 0,
                        }}
                      >
                        1-Week Free Trial for New Users, Then {monthlyPrice} per Month
                      </p>
                    </IonText>
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
                      {freeTrialKnownAsAvailable ? "Start Free Trial" : "Get Started"}
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
          <AboutLink />
        </div>
      </IonContent>     
    </IonPage>
  );
};