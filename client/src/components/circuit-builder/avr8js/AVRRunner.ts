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
  timer1: any;
  timer2: AVRTimer;
  portB: AVRIOPort;
  portC: AVRIOPort;
  portD: AVRIOPort;
  
  constructor(program: Uint16Array) {
    this.program = program;
    this.cpu = new CPU(this.program);
    
    this.timer0 = new AVRTimer(this.cpu, timer0Config);
    this.timer1 = new AVRTimer(this.cpu, timer1Config);
    this.timer2 = new AVRTimer(this.cpu, timer2Config);
    
    this.portB = new AVRIOPort(this.cpu, portBConfig);
    this.portC = new AVRIOPort(this.cpu, portCConfig);
    this.portD = new AVRIOPort(this.cpu, portDConfig);
  }
  
  execute(cycles: number) {
    for (let i = 0; i < cycles; i++) {
      this.cpu.tick();
    }
  }
}
