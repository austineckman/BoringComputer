import { useState, useEffect } from 'react';

export interface ComponentKit {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  category: string;
  difficulty: string;
}

// Hardcoded component kits
const HARDCODED_KITS: ComponentKit[] = [
  {
    id: "arduino-basic",
    name: "Arduino Starter",
    description: "Basic Arduino kit with LEDs, resistors, and sensors for beginners.",
    imagePath: "/uploads/kits/arduino-basic.jpg",
    category: "Electronics",
    difficulty: "Beginner"
  },
  {
    id: "raspberry-pi",
    name: "Raspberry Pi",
    description: "Complete Raspberry Pi setup with accessories for building mini computers.",
    imagePath: "/uploads/kits/raspberry-pi.jpg",
    category: "Computing",
    difficulty: "Intermediate"
  },
  {
    id: "robotics-kit",
    name: "Robotics Kit",
    description: "Robot building kit with motors, chassis, and control components.",
    imagePath: "/uploads/kits/robotics.jpg",
    category: "Robotics",
    difficulty: "Advanced"
  },
  {
    id: "circuit-playground",
    name: "Circuit Playground",
    description: "All-in-one development board with sensors and LEDs built-in.",
    imagePath: "/uploads/kits/circuit-playground.jpg",
    category: "Electronics",
    difficulty: "Beginner"
  },
  {
    id: "microbit",
    name: "Micro:bit",
    description: "Pocket-sized computer for learning coding and electronics.",
    imagePath: "/uploads/kits/microbit.jpg",
    category: "Computing",
    difficulty: "Beginner"
  }
];

export function useComponentKits() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [kits, setKits] = useState<ComponentKit[]>([]);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setKits(HARDCODED_KITS);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    kits,
    loading,
    error
  };
}