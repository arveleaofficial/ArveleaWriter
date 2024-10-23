import { useIonToast } from "@ionic/react";

export const usePresentErrorToast = () => {
  const [presentIonToast] = useIonToast();
  //params: Parameters<typeof presentIonToast>[0]
  //color?: Parameters<typeof presentIonToast>[0]["color"]
  //TODO: Consider adding ability to change color, with the objective to make certain messages less alarming as of writing TODO.
  return (message: unknown) => {
    if (typeof message === "string") {
      presentIonToast({
        color: "danger",
        swipeGesture: "vertical",
        translucent: true,
        duration: Math.min(message.length * 240, 8000),
        message,
      });
    }
  };
}