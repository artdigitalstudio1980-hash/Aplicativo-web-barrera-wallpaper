export interface AdminNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  currency: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  shippingAddress: string;
  needsInstallation: boolean;
  isGuest: boolean;
  createdAt: string;
}

export const renderAdminNotification = (data: AdminNotificationData): string => {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;">${item.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">$${item.price.toFixed(2)}</td>
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
            <td style="background-color:#000;padding:30px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:20px;letter-spacing:2px;text-transform:uppercase;font-weight:300;">NUEVA ORDEN</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:30px;">
              <p style="font-size:18px;color:#000;margin:0 0 4px 0;"><strong>#${data.orderNumber}</strong></p>
              <p style="font-size:13px;color:#888;margin:0 0 20px 0;">${data.createdAt}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background-color:#fff5f5;border-radius:8px;padding:16px;">
                <tr>
                  <td style="font-size:13px;color:#c00;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Cliente</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#333;">
                    ${data.customerName}<br>
                    ${data.customerEmail}<br>
                    ${data.isGuest ? '<span style="color:#c00;font-weight:bold;">Guest checkout</span>' : 'Registered user'}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;">Shipping</td>
                </tr>
                <tr>
                  <td style="font-size:14px;color:#333;">${data.shippingAddress}</td>
                </tr>
                ${data.needsInstallation ? `
                <tr>
                  <td style="padding-top:12px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;padding-bottom:4px;">+ Installation requested</td>
                </tr>` : ''}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background-color:#f8f9fa;padding:8px;border-bottom:2px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;">Product</td>
                  <td style="background-color:#f8f9fa;padding:8px;border-bottom:2px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:center;">Qty</td>
                  <td style="background-color:#f8f9fa;padding:8px;border-bottom:2px solid #ddd;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;text-align:right;">Price</td>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding:12px 8px 4px;text-align:right;font-size:16px;font-weight:bold;">Total:</td>
                  <td style="padding:12px 8px 4px;text-align:right;font-size:16px;font-weight:bold;">$${data.total.toFixed(2)} ${data.currency}</td>
                </tr>
              </table>

              <div style="text-align:center;margin-top:20px;">
                <a href="${process.env.NEXTAUTH_URL || 'https://barrerawallpaper.com'}/admin/orders" style="background-color:#000;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;font-size:13px;display:inline-block;">VIEW IN ADMIN</a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
