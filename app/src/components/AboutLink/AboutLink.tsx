import { IonText } from "@ionic/react";
import { AboutModal } from "../AboutModal/AboutModal";
import './AboutLink.scss';
import { useContext } from "react";
import { AboutModalContext } from "../../context/AboutModalContext";

export const AboutLink = () => {
  const aboutModalContext = useContext(AboutModalContext);

  return (
    <>
      {/*TODO: Add actual about UI from Editor*/}
      <IonText
        color="medium"
        id="auth-about-modal"
        className="mb-[var(--ion-safe-area-bottom)]"
        onClick={() => {
          aboutModalContext.setIsOpen?.(true);
        }}
      >
        <p>
          About
        </p>
      </IonText>
    </>
  );
};