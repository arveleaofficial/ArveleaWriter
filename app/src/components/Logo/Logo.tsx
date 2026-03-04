import { IonIcon } from "@ionic/react";
import logo from "../../assets/logo.svg"; 
import './Logo.scss';
import { ComponentProps } from "react";

export const Logo = (props: Pick<ComponentProps<typeof IonIcon>, "className" | "id" | "style">) => {
  return (
    <IonIcon 
      icon={logo}
      aria-label="ArveleaWriter Logo"
      id={props.id}
      className={`logo ${props.className}`}
      style={props.style}
    />
  );
};