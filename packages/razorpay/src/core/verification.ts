
import crypto from 'crypto';

// Verify payment signature from frontend after checkout
export const verifyPaymentSignature = (params: { orderId: string; paymentId: string; signature: string }, secret: string): boolean => {
  const body = `${params.orderId}|${params.paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.signature));
};

// Verify bank account with penny drop result
export const isBankAccountValid = (validationResult: any): boolean => {
  return validationResult?.result?.active === true || validationResult?.status === 'completed';
};

export const isUPIValid = (validationResult: any): boolean => {
  return validationResult?.result?.active === true || validationResult?.status === 'completed' || validationResult?.results?.vpa?.active === true;
};
