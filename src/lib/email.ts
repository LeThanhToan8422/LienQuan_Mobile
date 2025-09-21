import nodemailer from 'nodemailer';

// Define types since Prisma models may not be available yet
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  accountId: string;
  amount: number;
  status: string;
  customerEmail: string;
  customerName: string;
  deliveredAt?: Date | null;
  deliveryMethod?: string;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountForSale {
  id: string;
  rank?: string | null;
  price: number;
  heroesCount: number;
  skinsCount: number;
  status: string;
  description?: string | null;
  images: string[];
  level?: number | null;
  matches?: number | null;
  winRate?: number | null;
  reputation?: number | null;
  characterSkins?: Record<string, unknown> | null;
  gameUsername?: string | null;
  gamePassword?: string | null;
  loginMethod?: string | null;
  additionalInfo?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string | null;
  role: string;
  emailVerifiedAt?: Date | null;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

export interface AccountDeliveryData {
  order: Order & {
    account: AccountForSale;
    user: User;
  };
  gameUsername?: string;
  gamePassword?: string;
  loginMethod?: string;
  additionalInfo?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: config.auth,
    });
  }

  /**
   * Send account information to customer after successful payment
   */
  async sendAccountDelivery(data: AccountDeliveryData): Promise<boolean> {
    try {
      const { order } = data;
      
      const htmlContent = `
        <!DOCTYPE html>
        <html lang=\"vi\">
        <head>
          <meta charset=\"UTF-8\">
          <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
          <title>Thông tin tài khoản game - LQ Shop</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; }
            .account-info { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
            .info-label { font-weight: bold; color: #4a5568; }
            .info-value { color: #2d3748; font-family: monospace; background: #f7fafc; padding: 4px 8px; border-radius: 4px; }
            .warning { background: #fef5e7; border: 1px solid #f6ad55; border-radius: 6px; padding: 15px; margin: 20px 0; color: #744210; }
            .footer { background: #edf2f7; padding: 20px; text-align: center; color: #718096; font-size: 14px; }
            .btn { display: inline-block; background: #4299e1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class=\"container\">
            <div class=\"header\">
              <h1>🎮 Thông tin tài khoản game</h1>
              <p>Đơn hàng #${order.orderNumber}</p>
            </div>
            
            <div class=\"content\">
              <h2>Xin chào ${order.customerName}!</h2>
              <p>Cảm ơn bạn đã mua tài khoản game tại <strong>LQ Shop</strong>. Thanh toán của bạn đã được xử lý thành công.</p>
              
              <div class=\"account-info\">
                <h3>📋 Thông tin tài khoản</h3>
                <div class=\"info-row\">
                  <span class=\"info-label\">Rank:</span>
                  <span class=\"info-value\">${order.account.rank || 'N/A'}</span>
                </div>
                <div class=\"info-row\">
                  <span class=\"info-label\">Số tướng:</span>
                  <span class=\"info-value\">${order.account.heroesCount}</span>
                </div>
                <div class=\"info-row\">
                  <span class=\"info-label\">Số skin:</span>
                  <span class=\"info-value\">${order.account.skinsCount}</span>
                </div>
                ${data.gameUsername ? `
                <div class=\"info-row\">
                  <span class=\"info-label\">Tên đăng nhập:</span>
                  <span class=\"info-value\">${data.gameUsername}</span>
                </div>
                ` : ''}
                ${data.gamePassword ? `
                <div class=\"info-row\">
                  <span class=\"info-label\">Mật khẩu:</span>
                  <span class=\"info-value\">${data.gamePassword}</span>
                </div>
                ` : ''}
                ${data.loginMethod ? `
                <div class=\"info-row\">
                  <span class=\"info-label\">Phương thức đăng nhập:</span>
                  <span class=\"info-value\">${data.loginMethod}</span>
                </div>
                ` : ''}
              </div>
              
              ${data.additionalInfo ? `
              <div class=\"account-info\">
                <h3>📝 Thông tin bổ sung</h3>
                <p>${data.additionalInfo}</p>
              </div>
              ` : ''}
              
              <div class=\"warning\">
                <strong>⚠️ Lưu ý quan trọng:</strong>
                <ul>
                  <li>Vui lòng đổi mật khẩu ngay sau khi nhận tài khoản</li>
                  <li>Không chia sẻ thông tin tài khoản cho người khác</li>
                  <li>Liên hệ hỗ trợ nếu có vấn đề với tài khoản</li>
                  <li>Chúng tôi không chịu trách nhiệm nếu tài khoản bị khóa do vi phạm quy định game</li>
                </ul>
              </div>
              
              <div style=\"text-align: center;\">
                <a href=\"${process.env.NEXTAUTH_URL}/accounts\" class=\"btn\">Xem thêm tài khoản khác</a>
              </div>
            </div>
            
            <div class=\"footer\">
              <p><strong>LQ Shop</strong> - Mua bán tài khoản Liên Quân Mobile uy tín</p>
              <p>Email: support@lqshop.com | Hotline: 0123.456.789</p>
              <p>© ${new Date().getFullYear()} LQ Shop. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: this.config.from,
        to: order.customerEmail,
        subject: `🎮 Thông tin tài khoản game - Đơn hàng #${order.orderNumber}`,
        html: htmlContent,
      });

      return true;
    } catch (error: unknown) {
      console.error('Failed to send account delivery email:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: Order & { account: AccountForSale; user: User }): Promise<boolean> {
    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang=\"vi\">
        <head>
          <meta charset=\"UTF-8\">
          <title>Xác nhận đơn hàng - LQ Shop</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
            .header { background: #4299e1; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #edf2f7; padding: 15px; text-align: center; color: #718096; }
          </style>
        </head>
        <body>
          <div class=\"container\">
            <div class=\"header\">
              <h1>Xác nhận đơn hàng</h1>
              <p>Đơn hàng #${order.orderNumber}</p>
            </div>
            <div class=\"content\">
              <h2>Xin chào ${order.customerName}!</h2>
              <p>Cảm ơn bạn đã đặt hàng tại LQ Shop. Đơn hàng của bạn đang được xử lý.</p>
              <p><strong>Tài khoản:</strong> ${order.account.rank || 'N/A'} - ${order.account.heroesCount} tướng, ${order.account.skinsCount} skin</p>
              <p><strong>Giá:</strong> ${new Intl.NumberFormat('vi-VN').format(order.amount)}₫</p>
              <p>Chúng tôi sẽ gửi thông tin tài khoản sau khi thanh toán được xác nhận.</p>
            </div>
            <div class=\"footer\">
              <p>LQ Shop - Mua bán tài khoản Liên Quân Mobile uy tín</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: this.config.from,
        to: order.customerEmail,
        subject: `Xác nhận đơn hàng #${order.orderNumber} - LQ Shop`,
        html: htmlContent,
      });

      return true;
    } catch (error: unknown) {
      console.error('Failed to send order confirmation email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error: unknown) {
      console.error('Email configuration test failed:', error);
      return false;
    }
  }
}

// Create email service instance
export const emailService = new EmailService({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  from: process.env.SMTP_FROM || 'LQ Shop <noreply@lqshop.com>',
});