import React from 'react';
import FullscreenCircuitBuilderApp from '@/components/retro-ui/FullscreenCircuitBuilderApp';

const sampleRGBCode = `// Simple RGB LED Test
#define RED_PIN 9
#define GREEN_PIN 10  
#define BLUE_PIN 11

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(BLUE_PIN, LOW);
}

void loop() {
  digitalWrite(RED_PIN, HIGH);
  delay(1000);
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  delay(1000);
  digitalWrite(GREEN_PIN, LOW);
  digitalWrite(BLUE_PIN, HIGH);
  delay(1000);
  digitalWrite(BLUE_PIN, LOW);
  delay(1000);
}`;

export default function RGBLEDDemo() {
  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <FullscreenCircuitBuilderApp 
      onClose={handleClose}
    />
  );
}