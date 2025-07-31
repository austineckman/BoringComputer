import { db } from './db';
import { circuitProjects } from '@shared/schema';

// Sample circuit examples for the system
const sampleExamples = [
  {
    name: "Basic LED Blink",
    description: "Classic Arduino blink example with a single LED",
    category: "beginner",
    code: `// Basic LED Blink Example
const int ledPin = 13;  // Built-in LED on pin 13

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn on the LED
  delay(1000);                  // Wait for a second
  digitalWrite(ledPin, LOW);    // Turn off the LED
  delay(1000);                  // Wait for a second
}`,
    circuit: {
      components: [
        {
          id: "hero-1",
          type: "heroboard",
          attrs: { left: 200, top: 100, rotate: 0 }
        },
        {
          id: "led-1", 
          type: "led",
          attrs: { left: 350, top: 150, rotate: 0 }
        }
      ],
      wires: [
        {
          id: "wire-1",
          startPin: { id: "hero-1-pin-13", x: 250, y: 120 },
          endPin: { id: "led-1-pin-anode", x: 370, y: 160 },
          color: "red"
        },
        {
          id: "wire-2", 
          startPin: { id: "hero-1-pin-gnd", x: 250, y: 140 },
          endPin: { id: "led-1-pin-cathode", x: 370, y: 180 },
          color: "black"
        }
      ]
    },
    isExample: true,
    isPublic: true
  },
  {
    name: "RGB LED Color Mixing",
    description: "Control RGB LED colors using PWM on multiple pins",
    category: "intermediate", 
    code: `// RGB LED Color Mixing
const int redPin = 9;
const int greenPin = 10; 
const int bluePin = 11;

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);
}

void loop() {
  // Red
  analogWrite(redPin, 255);
  analogWrite(greenPin, 0);
  analogWrite(bluePin, 0);
  delay(1000);
  
  // Green
  analogWrite(redPin, 0);
  analogWrite(greenPin, 255);
  analogWrite(bluePin, 0);
  delay(1000);
  
  // Blue
  analogWrite(redPin, 0);
  analogWrite(greenPin, 0);
  analogWrite(bluePin, 255);
  delay(1000);
  
  // Purple (Red + Blue)
  analogWrite(redPin, 255);
  analogWrite(greenPin, 0);
  analogWrite(bluePin, 255);
  delay(1000);
}`,
    circuit: {
      components: [
        {
          id: "hero-1",
          type: "heroboard", 
          attrs: { left: 150, top: 100, rotate: 0 }
        },
        {
          id: "rgbled-1",
          type: "rgbled",
          attrs: { left: 400, top: 150, rotate: 0 }
        }
      ],
      wires: [
        {
          id: "wire-1",
          startPin: { id: "hero-1-pin-9", x: 200, y: 120 },
          endPin: { id: "rgbled-1-pin-red", x: 420, y: 160 },
          color: "red"
        },
        {
          id: "wire-2",
          startPin: { id: "hero-1-pin-10", x: 200, y: 140 },
          endPin: { id: "rgbled-1-pin-green", x: 420, y: 170 },
          color: "green"
        },
        {
          id: "wire-3",
          startPin: { id: "hero-1-pin-11", x: 200, y: 160 },
          endPin: { id: "rgbled-1-pin-blue", x: 420, y: 180 },
          color: "blue"
        },
        {
          id: "wire-4",
          startPin: { id: "hero-1-pin-gnd", x: 200, y: 180 },
          endPin: { id: "rgbled-1-pin-common", x: 420, y: 190 },
          color: "black"
        }
      ]
    },
    isExample: true,
    isPublic: true
  },
  {
    name: "Push Button LED Control",
    description: "Use a push button to control an LED with digitalRead",
    category: "beginner",
    code: `// Button Controlled LED
const int buttonPin = 2;
const int ledPin = 13;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
}

void loop() {
  // Read button state (LOW when pressed due to pullup)
  int buttonState = digitalRead(buttonPin);
  
  if (buttonState == LOW) {
    digitalWrite(ledPin, HIGH);  // Turn LED on when button pressed
  } else {
    digitalWrite(ledPin, LOW);   // Turn LED off when button released
  }
}`,
    circuit: {
      components: [
        {
          id: "hero-1",
          type: "heroboard",
          attrs: { left: 150, top: 100, rotate: 0 }
        },
        {
          id: "button-1",
          type: "pushbutton", 
          attrs: { left: 300, top: 120, rotate: 0 }
        },
        {
          id: "led-1",
          type: "led",
          attrs: { left: 450, top: 150, rotate: 0 }
        }
      ],
      wires: [
        {
          id: "wire-1",
          startPin: { id: "hero-1-pin-2", x: 200, y: 120 },
          endPin: { id: "button-1-pin-1", x: 320, y: 130 },
          color: "blue"
        },
        {
          id: "wire-2",
          startPin: { id: "button-1-pin-2", x: 320, y: 150 },
          endPin: { id: "hero-1-pin-gnd", x: 200, y: 180 },
          color: "black"
        },
        {
          id: "wire-3",
          startPin: { id: "hero-1-pin-13", x: 200, y: 140 },
          endPin: { id: "led-1-pin-anode", x: 470, y: 160 },
          color: "red"
        },
        {
          id: "wire-4",
          startPin: { id: "led-1-pin-cathode", x: 470, y: 180 },
          endPin: { id: "hero-1-pin-gnd", x: 200, y: 180 },
          color: "black"
        }
      ]
    },
    isExample: true,
    isPublic: true
  },
  {
    name: "Buzzer Alarm System", 
    description: "Create alarm tones using a buzzer with tone() function",
    category: "intermediate",
    code: `// Buzzer Alarm System
const int buzzerPin = 8;
const int buttonPin = 2;

void setup() {
  pinMode(buzzerPin, OUTPUT);
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  int buttonState = digitalRead(buttonPin);
  
  if (buttonState == LOW) {
    // Alarm sequence
    tone(buzzerPin, 1000, 500);  // 1kHz for 500ms
    delay(600);
    tone(buzzerPin, 800, 500);   // 800Hz for 500ms  
    delay(600);
    tone(buzzerPin, 1200, 500);  // 1.2kHz for 500ms
    delay(600);
  } else {
    noTone(buzzerPin);
  }
}`,
    circuit: {
      components: [
        {
          id: "hero-1",
          type: "heroboard",
          attrs: { left: 150, top: 100, rotate: 0 }
        },
        {
          id: "buzzer-1",
          type: "buzzer",
          attrs: { left: 350, top: 120, rotate: 0 }
        },
        {
          id: "button-1", 
          type: "pushbutton",
          attrs: { left: 350, top: 200, rotate: 0 }
        }
      ],
      wires: [
        {
          id: "wire-1",
          startPin: { id: "hero-1-pin-8", x: 200, y: 120 },
          endPin: { id: "buzzer-1-pin-positive", x: 370, y: 130 },
          color: "red"
        },
        {
          id: "wire-2",
          startPin: { id: "buzzer-1-pin-negative", x: 370, y: 150 },
          endPin: { id: "hero-1-pin-gnd", x: 200, y: 180 },
          color: "black"
        },
        {
          id: "wire-3",
          startPin: { id: "hero-1-pin-2", x: 200, y: 100 },
          endPin: { id: "button-1-pin-1", x: 370, y: 210 },
          color: "blue"
        },
        {
          id: "wire-4",
          startPin: { id: "button-1-pin-2", x: 370, y: 230 },
          endPin: { id: "hero-1-pin-gnd", x: 200, y: 180 },
          color: "black"
        }
      ]
    },
    isExample: true,
    isPublic: true
  }
];

export async function seedCircuitExamples() {
  try {
    console.log('Seeding circuit examples...');
    
    // Find a user with Founder role to assign as creator
    const users = await db.select().from({ users }).limit(1);
    
    if (users.length === 0) {
      console.log('No users found - skipping circuit examples seeding');
      return;
    }
    
    const creatorUserId = users[0].id;
    
    // Insert sample examples
    for (const example of sampleExamples) {
      await db.insert(circuitProjects).values({
        ...example,
        userId: creatorUserId,
        circuit: example.circuit as any,
        tags: []
      });
    }
    
    console.log(`Created ${sampleExamples.length} circuit examples`);
  } catch (error) {
    console.error('Error seeding circuit examples:', error);
  }
}

// Run if called directly
if (require.main === module) {
  seedCircuitExamples().then(() => {
    console.log('Circuit examples seeding completed');
    process.exit(0);
  }).catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
}