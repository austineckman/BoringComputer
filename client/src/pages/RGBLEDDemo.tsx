import React from 'react';
import FullscreenCircuitBuilderApp from '@/components/retro-ui/FullscreenCircuitBuilderApp';

const sampleRGBCode = `#define RED_PIN 9
#define GREEN_PIN 10  
#define BLUE_PIN 11

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RED_PIN, HIGH);
  delay(1000);
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  delay(1000);
  digitalWrite(GREEN_PIN, LOW);
}`;

export default function RGBLEDDemo() {
  const handleClose = () => {
    window.location.href = '/';
  };

  return (
    <FullscreenCircuitBuilderApp 
      onClose={handleClose}
      initialCode={sampleRGBCode}
    />
  );
}