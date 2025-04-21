import { useCallback, useEffect, useState } from "react";
import sounds from "@/lib/sound";

export const useSoundEffects = () => {
  const [muted, setMuted] = useState(() => {
    const savedMute = localStorage.getItem("soundMuted");
    return savedMute ? JSON.parse(savedMute) : false;
  });

  useEffect(() => {
    localStorage.setItem("soundMuted", JSON.stringify(muted));
  }, [muted]);

  const playSound = useCallback(
    (sound: keyof typeof sounds) => {
      if (!muted && sounds[sound]) {
        sounds[sound].play();
      }
    },
    [muted]
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev);
  }, []);

  return {
    muted,
    toggleMute,
    playSound,
  };
};
