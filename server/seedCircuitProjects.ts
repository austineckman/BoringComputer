import { db } from "./db";
import { circuitProjects } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seedCircuitProjects() {
  try {
    console.log("Seeding circuit projects...");
    
    // Check if we have at least one user to associate projects with
    const [user] = await db.query.users.findMany({
      limit: 1,
    });
    
    if (!user) {
      console.log("No users found. Unable to seed circuit projects.");
      return;
    }
    
    // Create a sample LED blinking circuit
    const ledBlinkingCircuit = {
      userId: user.id,
      name: "LED Blinking Example",
      description: "A simple Arduino circuit with a blinking LED. Perfect for beginners!",
      circuit: {
        components: [
          {
            id: "arduino_uno",
            type: "board",
            x: 200,
            y: 200,
            properties: {
              name: "Arduino Uno"
            }
          },
          {
            id: "led_1",
            type: "led",
            x: 350,
            y: 150,
            properties: {
              color: "red",
              label: "LED 1",
              pin: 13
            }
          },
          {
            id: "resistor_1",
            type: "resistor",
            x: 350,
            y: 250,
            properties: {
              resistance: "220Ω",
              label: "R1"
            }
          }
        ],
        connections: [
          {
            from: { componentId: "arduino_uno", pin: "13" },
            to: { componentId: "led_1", pin: "anode" }
          },
          {
            from: { componentId: "led_1", pin: "cathode" },
            to: { componentId: "resistor_1", pin: "terminal1" }
          },
          {
            from: { componentId: "resistor_1", pin: "terminal2" },
            to: { componentId: "arduino_uno", pin: "GND" }
          }
        ]
      },
      code: `// Blinking LED Example
const int ledPin = 13;  // Pin connected to the LED

void setup() {
  // Initialize the digital pin as an output
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);   // Turn on the LED
  delay(1000);                  // Wait for 1 second
  digitalWrite(ledPin, LOW);    // Turn off the LED
  delay(1000);                  // Wait for 1 second
}`,
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyZSIvPjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9InJlZCIgZmlsbC1vcGFjaXR5PSIwLjgiLz48cmVjdCB4PSI2MCIgeT0iMTIwIiB3aWR0aD0iODAiIGhlaWdodD0iMjAiIGZpbGw9IiM4ODg4ODgiLz48L3N2Zz4=",
      isPublic: true,
      tags: ["beginner", "led", "blink"]
    };
    
    // Create a button-controlled LED circuit
    const buttonLedCircuit = {
      userId: user.id,
      name: "Button Controlled LED",
      description: "Press the button to turn on the LED. A simple digital input example.",
      circuit: {
        components: [
          {
            id: "arduino_uno",
            type: "board",
            x: 200,
            y: 200,
            properties: {
              name: "Arduino Uno"
            }
          },
          {
            id: "led_1",
            type: "led",
            x: 350,
            y: 150,
            properties: {
              color: "green",
              label: "LED 1",
              pin: 13
            }
          },
          {
            id: "resistor_1",
            type: "resistor",
            x: 350,
            y: 250,
            properties: {
              resistance: "220Ω",
              label: "R1"
            }
          },
          {
            id: "button_1",
            type: "button",
            x: 150,
            y: 150,
            properties: {
              label: "Button 1",
              pin: 2
            }
          },
          {
            id: "resistor_2",
            type: "resistor",
            x: 150,
            y: 250,
            properties: {
              resistance: "10kΩ",
              label: "R2 (Pull-up)"
            }
          }
        ],
        connections: [
          {
            from: { componentId: "arduino_uno", pin: "13" },
            to: { componentId: "led_1", pin: "anode" }
          },
          {
            from: { componentId: "led_1", pin: "cathode" },
            to: { componentId: "resistor_1", pin: "terminal1" }
          },
          {
            from: { componentId: "resistor_1", pin: "terminal2" },
            to: { componentId: "arduino_uno", pin: "GND" }
          },
          {
            from: { componentId: "arduino_uno", pin: "2" },
            to: { componentId: "button_1", pin: "pin1" }
          },
          {
            from: { componentId: "button_1", pin: "pin2" },
            to: { componentId: "arduino_uno", pin: "GND" }
          },
          {
            from: { componentId: "arduino_uno", pin: "5V" },
            to: { componentId: "resistor_2", pin: "terminal1" }
          },
          {
            from: { componentId: "resistor_2", pin: "terminal2" },
            to: { componentId: "button_1", pin: "pin1" }
          }
        ]
      },
      code: `// Button Controlled LED
const int buttonPin = 2;  // Pin connected to the pushbutton
const int ledPin = 13;    // Pin connected to the LED

// Variables will change:
int buttonState = 0;      // Variable for reading the pushbutton status

void setup() {
  // Initialize the LED pin as an output:
  pinMode(ledPin, OUTPUT);
  // Initialize the pushbutton pin as an input with internal pull-up resistor:
  pinMode(buttonPin, INPUT_PULLUP);
}

void loop() {
  // Read the state of the pushbutton:
  buttonState = digitalRead(buttonPin);

  // Check if the pushbutton is pressed (LOW when pressed with pull-up resistor):
  if (buttonState == LOW) {
    // Turn LED on:
    digitalWrite(ledPin, HIGH);
  } else {
    // Turn LED off:
    digitalWrite(ledPin, LOW);
  }
}`,
      thumbnail: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzFhMWEyZSIvPjxjaXJjbGUgY3g9IjE0MCIgY3k9IjEwMCIgcj0iMzAiIGZpbGw9ImdyZWVuIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjxyZWN0IHg9IjYwIiB5PSI4MCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iNSIgZmlsbD0iIzQ0NDQ0NCIvPjxyZWN0IHg9IjcwIiB5PSI5MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iMyIgZmlsbD0iI2RkZGRkZCIvPjwvc3ZnPg==",
      isPublic: true,
      tags: ["beginner", "led", "button", "digital input"]
    };

    // First check if these projects already exist
    const existingBlink = await db.select().from(circuitProjects)
      .where(eq(circuitProjects.name, "LED Blinking Example"))
      .limit(1);
    
    const existingButton = await db.select().from(circuitProjects)
      .where(eq(circuitProjects.name, "Button Controlled LED"))
      .limit(1);

    // Only insert if they don't already exist
    if (existingBlink.length === 0) {
      console.log("Adding LED Blinking Example project");
      await db.insert(circuitProjects).values(ledBlinkingCircuit);
    } else {
      console.log("LED Blinking Example project already exists, skipping");
    }
    
    if (existingButton.length === 0) {
      console.log("Adding Button Controlled LED project");
      await db.insert(circuitProjects).values(buttonLedCircuit);
    } else {
      console.log("Button Controlled LED project already exists, skipping");
    }

    console.log("Successfully seeded circuit projects");
  } catch (error) {
    console.error("Error seeding circuit projects:", error);
    throw error;
  }
}

seedCircuitProjects()
  .then(() => {
    console.log("Circuit projects seeded successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to seed circuit projects:", error);
    process.exit(1);
  });