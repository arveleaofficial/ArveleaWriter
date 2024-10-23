const preventDefault = (event: Event) => {
  event.preventDefault();
};
const eventListenerType = "touchmove";

export const useSetTouchMove = () => {
  return {
    setTouchMove: (value: boolean) => {
      const {
        body,
      } = document;
      if (!value) {
        body.addEventListener(eventListenerType, preventDefault, {
          passive: false,
        });
      } else {
        body.removeEventListener(eventListenerType, preventDefault);
      }
    },
  }
};