// Quick parser test
import { ArduinoCodeParser } from './components/circuit-builder/simulator/ArduinoCodeParser.ts';

const testCode = `// Simple RGB LED Test
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

const parser = new ArduinoCodeParser();
const result = parser.parseCode(testCode);
const setupInstructions = parser.getSetupInstructions();
const loopInstructions = parser.getLoopInstructions();

console.log('Parser Test Results:');
console.log('Setup lines found:', result.setup?.length || 0);
console.log('Loop lines found:', result.loop?.length || 0);
console.log('Setup instructions:', setupInstructions.length);
console.log('Loop instructions:', loopInstructions.length);
console.log('');
console.log('Raw loop lines:');
result.loop?.forEach((line, i) => {
  console.log(`${i}: Line ${line.lineNumber}: "${line.content}"`);
});
console.log('');
console.log('Parsed loop instructions:');
loopInstructions.forEach((inst, i) => {
  console.log(`${i}: Line ${inst.lineNumber}: "${inst.instruction}"`);
});