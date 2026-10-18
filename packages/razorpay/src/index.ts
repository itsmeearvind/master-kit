
import Razorpay from 'razorpay';
import crypto from 'crypto';
const getRzp = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
export const createOrder = async (amount: number, receipt: string) => {
  return getRzp().orders.create({ amount: amount*100, currency: 'INR', receipt });
};
export const verifyPayment = (orderId: string, paymentId: string, signature: string) => {
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!).update(orderId+'|'+paymentId).digest('hex');
  if(expected!==signature) throw new Error('Fraud detected');
  return true;
};
// model Payment { id String @id @default(cuid()); razorpayOrderId String @unique; amount Int; status String; userId String; }
