/**
 * Generate a unique booking code for playbox reservations
 * Format: PB-XXXXX (where X is alphanumeric)
 */
exports.generateBookingCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoiding confusing characters like 0,O,1,I
    const codeLength = 5;
    let result = 'PB-';
  
    for (let i = 0; i < codeLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  
    return result;
  };