import { 
  CPU, 
  AVRIOPort, 
  AVRTimer,
  portBConfig,
  portCConfig,
  portDConfig,
  timer0Config,
  timer1Config,
  timer2Config
} from 'avr8js';

export class AVRRunner {
  program: Uint16Array;
  cpu: CPU;
  timer0: AVRTimer;
  timer1: AVRTimer;
  timer2: AVRTimer;
  portB: AVRIOPort;
  portC: AVRIOPort;
  portD: AVRIOPort;
  
  constructor(program: Uint16Array) {
    this.program = program;
    this.cpu = new CPU(this.program);
    
    // Wire up the ports
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
    
    // Wire up the timers - critical for delay() to work
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
  }
  
  execute(cycles: number) {
    // Execute CPU cycles and tick all peripherals
    for (let i = 0; i < cycles; i++) {
      // Tick the CPU
      this.cpu.tick();
      
      // Tick all timers - critical for delay() to work
      this.timer0.tick();
      this.timer1.tick();
      this.timer2.tick();
      
      // Diagnostic: Log every 1000 cycles
      if (i % 1000 === 0) {
        const pc = this.cpu.pc;
        const portb = this.cpu.data[0x25]; // PORTB address
        const ddrb = this.cpu.data[0x24];  // DDRB address
        console.log(`[AVR8 Diagnostic] Cycle ${i}: PC=${pc.toString(16).padStart(4, '0')} DDRB=0x${ddrb?.toString(16).padStart(2, '0') || '??'} PORTB=0x${portb?.toString(16).padStart(2, '0') || '??'}`);
      }
    }
  }
}
