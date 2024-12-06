import { IonIcon } from "@ionic/react";
import logo from "../../assets/logo.svg"; 
import './Logo.scss';

export const Logo = (props: {
  id?: string,
  className?: string,
}) => {
  return (
    <IonIcon 
      icon={logo}
      aria-label="ArveleaWriter Logo"
      id={props.id}
      className={`logo ${props.className}`}
    />
  );
};