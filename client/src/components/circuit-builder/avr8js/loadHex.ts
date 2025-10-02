export function loadHex(source: string): Uint16Array {
  const program = new Uint16Array(16384);
  
  for (const line of source.split('\n')) {
    if (line[0] === ':' && line.substr(7, 2) === '00') {
      const bytes = parseInt(line.substr(1, 2), 16);
      const addr = parseInt(line.substr(3, 4), 16);
      for (let i = 0; i < bytes; i++) {
        const byte = parseInt(line.substr(9 + i * 2, 2), 16);
        const wordAddr = Math.floor(addr / 2) + Math.floor(i / 2);
        if (i % 2 === 0) {
          program[wordAddr] = (program[wordAddr] & 0xff00) | byte;
        } else {
          program[wordAddr] = (program[wordAddr] & 0x00ff) | (byte << 8);
        }
      }
    }
  }
  return program;
}
