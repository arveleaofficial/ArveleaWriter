import { getPlatforms } from "@ionic/react";
import { useEffect, useState } from "react";

type Platforms = ReturnType<typeof getPlatforms>;

let retrievedPlatforms: Platforms;

export const usePlatforms = () => {
  const [platforms, setPlatforms] = useState<Platforms>();

  useEffect(() => {
    if (retrievedPlatforms === undefined) {
      retrievedPlatforms = getPlatforms();
    }
    setPlatforms(retrievedPlatforms);
  }, []);

  const [isIphone, setIsIphone] = useState(false);

  useEffect(() => {
    setIsIphone(platforms?.[0] === "iphone");
  }, [platforms?.[0]])

  return {
    isIphone,
    platforms,
  };
};