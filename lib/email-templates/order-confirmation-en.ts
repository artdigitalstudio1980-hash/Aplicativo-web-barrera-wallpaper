export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  total: number;
  currency: string;
  items: Array<{ name: string; price: number; quantity: number; measurements?: any }>;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  shippingCountry: string;
  needsInstallation: boolean;
  installationAddress?: string;
}

export const renderOrderConfirmationEN = (data: OrderConfirmationData): string => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px;">${item.name}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">$${item.price.toFixed(2)}</td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 14px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background-color:#000;padding:40px 30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:3px;text-transform:uppercase;font-weight:300;">BARRERA WALLPAPER</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#000;margin:0 0 6px 0;font-size:22px;font-weight:300;">Thank you, ${data.customerName}!</h2>
              <p style="color:#666;font-size:15px;line-height:1.5;margin:0 0 4px 0;">Your order <strong>#${data.orderNumber}</strong> has been confirmed.</p>
              <p style="color:#888;font-size:13px;margin:0 0 25px 0;">We'll send you a notification when your wallpaper ships.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;">
                <tr>
                  <td style="background-color:#f8f9fa;padding:12px 8px;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;">Product</td>
                  <td style="background-color:#f8f9fa;padding:12px 8px;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:center;">Qty</td>
                  <td style="background-color:#f8f9fa;padding:12px 8px;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:right;">Price</td>
                  <td style="background-color:#f8f9fa;padding:12px 8px;border-bottom:2px solid #ddd;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:right;">Total</td>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="3" style="padding:16px 8px 4px;text-align:right;font-size:16px;font-weight:bold;">Total Paid:</td>
                  <td style="padding:16px 8px 4px;text-align:right;font-size:16px;font-weight:bold;">$${data.total.toFixed(2)} ${data.currency}</td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:25px;background-color:#f8f9fa;border-radius:8px;padding:20px;">
                <tr>
                  <td style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Shipping Address</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#333;line-height:1.5;">
                    ${data.shippingName}<br>
                    ${data.shippingAddress}<br>
                    ${data.shippingCity}, ${data.shippingState} ${data.shippingZip}<br>
                    ${data.shippingCountry}
                  </td>
                </tr>
                ${data.needsInstallation ? `
                <tr><td style="padding-top:16px;border-top:1px solid #ddd;margin-top:16px;"></td></tr>
                <tr>
                  <td style="font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Installation Service</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#333;">Professional installation requested. We'll contact you to schedule a pre-installation visit.</td>
                </tr>
                ${data.installationAddress ? `
                <tr>
                  <td style="font-size:14px;color:#333;padding-top:8px;">
                    Installation address: ${data.installationAddress}
                  </td>
                </tr>` : ''}
                ` : ''}
              </table>

              <div style="text-align:center;margin-top:30px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://barrerawallpaper.com'}/account" style="background-color:#000;color:#fff;padding:14px 32px;text-decoration:none;border-radius:6px;font-size:14px;display:inline-block;">VIEW YOUR ORDER</a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9f9f9;padding:25px 30px;text-align:center;border-top:1px solid #eee;">
              <p style="font-size:12px;color:#999;margin:0 0 6px 0;">Barrera Wallpaper &mdash; Miami, Florida</p>
              <p style="font-size:12px;color:#999;margin:0;">
                <a href="https://instagram.com/barrerawallpaper" style="color:#999;text-decoration:underline;">Instagram</a>
                &nbsp;|&nbsp;
                <a href="https://facebook.com/barrerawallpaper" style="color:#999;text-decoration:underline;">Facebook</a>
                &nbsp;|&nbsp;
                <a href="mailto:infobarrerawallpaper@gmail.com" style="color:#999;text-decoration:underline;">Contact</a>
              </p>
              <p style="font-size:11px;color:#bbb;margin:10px 0 0 0;">&copy; ${new Date().getFullYear()} Barrera Wallpaper. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
