/**
 * Intel HEX file format parser for loading Arduino compiled code
 * Converts a string in Intel HEX format to a Uint8Array that can be loaded into AVR8js emulator
 */

export function loadHex(hexStr: string): Uint8Array {
  // Parse Intel HEX format
  const lines = hexStr.split(/\r?\n/);
  const memory = new Uint8Array(0x10000); // 64KB address space
  
  let minAddress = 0x10000;
  let maxAddress = 0;
  let currentAddress = 0;
  let endOfFile = false;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue; // Skip empty lines
    
    if (line[0] !== ':') {
      throw new Error(`Invalid HEX record format: ${line}`);
    }
    
    // Extract the record data
    const byteCount = parseInt(line.substr(1, 2), 16);
    const address = parseInt(line.substr(3, 4), 16);
    const recordType = parseInt(line.substr(7, 2), 16);
    
    // Update the current address
    if (recordType === 0) { // Data record
      currentAddress = address;
      
      // Extract data bytes
      for (let i = 0; i < byteCount; i++) {
        const byteValue = parseInt(line.substr(9 + i * 2, 2), 16);
        memory[currentAddress + i] = byteValue;
      }
      
      // Update address range
      minAddress = Math.min(minAddress, currentAddress);
      maxAddress = Math.max(maxAddress, currentAddress + byteCount - 1);
    } else if (recordType === 1) { // End of file
      endOfFile = true;
      break;
    } else if (recordType === 2) { // Extended segment address
      const offset = parseInt(line.substr(9, 4), 16) << 4;
      currentAddress = offset;
    } else if (recordType === 3) { // Start segment address
      // Ignored for now
    } else if (recordType === 4) { // Extended linear address
      const highAddress = parseInt(line.substr(9, 4), 16) << 16;
      currentAddress = highAddress;
    } else if (recordType === 5) { // Start linear address
      // Ignored for now
    } else {
      throw new Error(`Unsupported HEX record type: ${recordType}`);
    }
  }
  
  if (!endOfFile) {
    console.warn('HEX file did not contain an End Of File record');
  }
  
  // Create a new buffer with just the used memory range
  const size = maxAddress - minAddress + 1;
  const program = new Uint8Array(size);
  
  for (let i = 0; i < size; i++) {
    program[i] = memory[minAddress + i];
  }
  
  return program;
}