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
    // The CPU.tick() method automatically ticks connected peripherals
    // based on memory hooks, so we just need to tick the CPU
    for (let i = 0; i < cycles; i++) {
      this.cpu.tick();
    }
  }
}
