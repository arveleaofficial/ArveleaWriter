import { useRef, ComponentProps, useContext } from "react";
import { IonButton, IonButtons, IonContent, IonHeader, IonModal, IonNav, IonTitle, IonToolbar, useIonAlert } from '@ionic/react';
import { ProductContext } from "../context/ProductContext";

const establishedYear = 2024;

const currentYear = (new Date()).getFullYear();

//TODO: See if this implementation can be replaced with maybe context & useIonModal. This didn't happen due to issues that were being experienced with context + useIonModal.
export const AboutModal = (props: Pick<ComponentProps<typeof IonModal>, "trigger">) => {
  const selfRef = useRef<HTMLIonModalElement>(null);

  const {
    csd,
    rco,
  } = useContext(ProductContext);

  const [presentAlert] = useIonAlert();

  return (
    <IonModal
      trigger={props.trigger}
      ref={selfRef}
    >
      <IonNav
        root={() => {
          return (
            <>
              <IonHeader>
                <IonToolbar>
                  <IonButtons 
                    slot="end"
                  >
                    <IonButton 
                      onClick={() => {
                        selfRef.current?.dismiss();
                      }}
                    >
                      Close
                    </IonButton>
                  </IonButtons>
                  <IonTitle>
                    About ArveleaWriter
                  </IonTitle>
                </IonToolbar>
              </IonHeader>
              <IonContent
                className="ion-padding"
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p
                    style={{
                      textAlign: "center",
                      margin: 0,
                      marginBottom: 10,
                    }}
                  >
                    ArveleaWriter™ Copyright &copy;{establishedYear + (establishedYear < currentYear ? (" - " + currentYear) : "")} Isovia LLC. All Rights Reserved.
                  </p>
                  <hr className="bg-[var(--ion-color-light-shade)] w-full"/>
                  <p
                    style={{
                      margin: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {import.meta.env.VITE_CREDITS}
                  </p>
                  <a
                    onClick={() => {
                      presentAlert({
                        message: `csd: ${JSON.stringify(csd)} | rco: ${JSON.stringify(rco)}`,
                      });
                    }}
                    style={{
                      textDecoration: "underline",
                      textAlign: "center",
                      marginTop: 26,
                    }}
                    className="mb-[var(--ion-safe-area-bottom)]"
                  >
                    Open Testing Popup
                  </a>
                </div>
              </IonContent>
            </>
          );
        }}
      />
    </IonModal>
  );
};