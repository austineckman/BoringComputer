
/**
 * Load Intel HEX format data into AVR8 program memory
 * Intel HEX format: :BBAAAATTDD...DDCC
 * BB = byte count, AAAA = address, TT = record type, DD = data bytes, CC = checksum
 */
export function loadHex(hex: string): Uint16Array {
  const program = new Uint16Array(0x8000); // 32KB program memory for ATmega328
  
  // Split by lines and process each record
  const lines = hex.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (const line of lines) {
    if (!line.startsWith(':')) {
      continue; // Skip non-record lines
    }
    
    // Parse the Intel HEX record
    const byteCount = parseInt(line.substr(1, 2), 16);
    const address = parseInt(line.substr(3, 4), 16);
    const recordType = parseInt(line.substr(7, 2), 16);
    
    // Record type 0x00 = data record (contains program code)
    // Record type 0x01 = end of file record (ignore)
    if (recordType !== 0x00) {
      continue;
    }
    
    // Extract data bytes and load into program memory
    // AVR instructions are 16-bit words, stored little-endian in HEX
    for (let i = 0; i < byteCount; i += 2) {
      const dataIndex = 9 + (i * 2); // Start of data is at position 9
      const lowByte = parseInt(line.substr(dataIndex, 2), 16);
      const highByte = parseInt(line.substr(dataIndex + 2, 2), 16) || 0;
      
      // Combine into 16-bit word (little-endian: low byte first)
      const word = lowByte | (highByte << 8);
      
      // Word address = byte address / 2
      const wordAddress = (address + i) / 2;
      
      if (wordAddress < program.length) {
        program[wordAddress] = word;
      }
    }
  }
  
  console.log('[loadHex] Loaded program into memory');
  console.log('[loadHex] First 10 instructions:', Array.from(program.slice(0, 10)).map(w => '0x' + w.toString(16).padStart(4, '0')).join(', '));
  
  return program;
}
