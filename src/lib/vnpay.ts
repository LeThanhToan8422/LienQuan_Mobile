import crypto from 'crypto';
import qs from 'qs';

export interface VNPayConfig {
  vnp_TmnCode: string;
  vnp_HashSecret: string;
  vnp_Url: string;
  vnp_ReturnUrl: string;
  vnp_IpnUrl: string;
}

export interface VNPayCreatePaymentRequest {
  amount: number; // Amount in VND
  orderInfo: string; // Order description
  orderType: string; // Order type
  returnUrl: string; // Return URL after payment
  ipAddr: string; // Client IP address
  orderId: string; // Order ID
  locale?: string; // Language (vn or en)
}

export class VNPayService {
  private config: VNPayConfig;

  constructor(config: VNPayConfig) {
    this.config = config;
  }

  /**
   * Create payment URL for VNPay
   */
  createPaymentUrl(paymentData: VNPayCreatePaymentRequest): string {
    const vnp_Params: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.config.vnp_TmnCode,
      vnp_Locale: paymentData.locale || 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: paymentData.orderId,
      vnp_OrderInfo: paymentData.orderInfo,
      vnp_OrderType: paymentData.orderType,
      vnp_Amount: (paymentData.amount * 100).toString(), // VNPay requires amount in xu (multiply by 100)
      vnp_ReturnUrl: paymentData.returnUrl,
      vnp_IpAddr: paymentData.ipAddr,
      vnp_CreateDate: this.formatDate(new Date()),
    };

    // Sort parameters by key
    const sortedParams = this.sortObject(vnp_Params);
    
    // Create query string
    const signData = qs.stringify(sortedParams, { encode: false });
    
    // Create secure hash
    const secureHash = crypto
      .createHmac('sha512', this.config.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    // Add secure hash to parameters
    sortedParams.vnp_SecureHash = secureHash;

    // Create final payment URL
    return this.config.vnp_Url + '?' + qs.stringify(sortedParams, { encode: false });
  }

  /**
   * Verify payment response from VNPay
   */
  verifyPaymentResponse(vnpParams: Record<string, string>): boolean {
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHashType;

    // Sort parameters
    const sortedParams = this.sortObject(vnpParams);
    
    // Create signature
    const signData = qs.stringify(sortedParams, { encode: false });
    const checkSum = crypto
      .createHmac('sha512', this.config.vnp_HashSecret)
      .update(Buffer.from(signData, 'utf-8'))
      .digest('hex');

    return secureHash === checkSum;
  }

  /**
   * Get payment status from response code
   */
  getPaymentStatus(responseCode: string): 'SUCCESS' | 'FAILED' | 'PENDING' {
    switch (responseCode) {
      case '00':
        return 'SUCCESS';
      case '24':
        return 'PENDING';
      default:
        return 'FAILED';
    }
  }

  /**
   * Sort object by keys
   */
  private sortObject(obj: Record<string, string>): Record<string, string> {
    const sorted: Record<string, string> = {};
    Object.keys(obj)
      .sort()
      .forEach((key) => {
        sorted[key] = obj[key];
      });
    return sorted;
  }

  /**
   * Format date for VNPay (yyyyMMddHHmmss)
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }
}

// Create VNPay service instance
export const vnpayService = new VNPayService({
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay/return',
  vnp_IpnUrl: process.env.VNPAY_IPN_URL || 'http://localhost:3000/api/payment/vnpay/ipn',
});