import nodemailer from 'nodemailer';

// Se usará el SMTP proporcionado por Hostinger Webmail o cualquier otro SMTP gratuito (Gmail/Brevo)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.hostinger.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOrderConfirmationEmail = async (orderId: string, customerEmail: string, customerName: string, amount: number, items: any[]) => {
  try {
    const itemsListHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.measurements ? `${item.measurements.width}x${item.measurements.height}m` : '1'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">$${item.price}</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Barrera Wallpaper" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: customerEmail,
      subject: `Confirmación de Orden #${orderId} - Barrera Wallpaper`,
      html: `
        <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000; text-align: center;">¡Gracias por tu compra, ${customerName}!</h2>
          <p>Hemos recibido tu pago y tu orden <strong>#${orderId}</strong> está siendo procesada.</p>
          
          <h3>Detalle de Facturación:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Medida/Cant</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Precio</th>
              </tr>
            </thead>
            <tbody>
              ${itemsListHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total Pagado:</td>
                <td style="padding: 10px; font-weight: bold;">$${amount.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
          
          <p>Tu papel tapiz premium entrará a producción pronto. Te notificaremos cuando sea enviado.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888; text-align: center;">Barrera Wallpaper &copy; ${new Date().getFullYear()}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (customerEmail: string, customerName: string) => {
  try {
    const mailOptions = {
      from: `"Barrera Wallpaper" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: customerEmail,
      subject: `Welcome to Barrera Wallpaper, ${customerName}!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background-color: #000; padding: 40px 20px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase;">Barrera Wallpaper</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #000; margin-top: 0;">Welcome to the family, ${customerName}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Your account has been successfully created. You are now part of an exclusive community dedicated to transforming spaces into masterpieces.
            </p>
            <div style="margin: 35px 0; text-align: center;">
              <a href="https://barrerawallpaper.com/login" style="background-color: #000; color: #fff; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; transition: background-color 0.3s ease;">
                ACCESS YOUR ACCOUNT
              </a>
            </div>
            <p style="font-size: 16px; line-height: 1.6; color: #555;">
              Explore our premium collections, use our AI-powered design tools, and get inspired by the latest trends in interior design.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 14px; color: #888; font-style: italic;">
              "Wallpapers that tell a story."
            </p>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="font-size: 12px; color: #999; margin: 0;">
              &copy; ${new Date().getFullYear()} Barrera Wallpaper. All rights reserved.<br>
              Miami, Florida.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const sendContactNotificationEmail = async (formData: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  try {
    const mailOptions = {
      from: `"Barrera Wallpaper System" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: process.env.ADMIN_EMAIL || 'infobarrerawallpaper@gmail.com',
      subject: `New Contact Inquiry: ${formData.subject} - ${formData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f8f9fa; padding: 20px; border-bottom: 1px solid #ddd;">
            <h2 style="margin: 0; color: #000;">New Inquiry Received</h2>
          </div>
          <div style="padding: 20px;">
            <p><strong>Name:</strong> ${formData.name}</p>
            <p><strong>Email:</strong> ${formData.email}</p>
            <p><strong>Phone:</strong> ${formData.phone || 'Not provided'}</p>
            <p><strong>Subject:</strong> ${formData.subject}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${formData.message}</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #777;">
            Sent from Barrera Wallpaper Contact Form
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contact notification email:', error);
    return false;
  }
};

export const sendOrderConfirmationEmailV2 = async (
  orderNumber: string,
  customerEmail: string,
  customerName: string,
  locale: string,
  data: {
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
) => {
  try {
    const isEN = locale === 'en';
    const { renderOrderConfirmationEN } = await import('./email-templates/order-confirmation-en');
    const { renderOrderConfirmationES } = await import('./email-templates/order-confirmation-es');
    const html = isEN
      ? renderOrderConfirmationEN({ ...data, orderNumber, customerName })
      : renderOrderConfirmationES({ ...data, orderNumber, customerName });

    const mailOptions = {
      from: `"Barrera Wallpaper" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: customerEmail,
      subject: isEN
        ? `Order Confirmed #${orderNumber} — Barrera Wallpaper`
        : `Orden Confirmada #${orderNumber} — Barrera Wallpaper`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return false;
  }
};

export const sendAdminNotificationEmail = async (data: {
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
}) => {
  try {
    const { renderAdminNotification } = await import('./email-templates/admin-notification');
    const html = renderAdminNotification(data);

    const mailOptions = {
      from: `"Barrera Wallpaper System" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: process.env.ADMIN_EMAIL || 'infobarrerawallpaper@gmail.com',
      subject: `New Order #${data.orderNumber} — ${data.customerName}`,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
};

export const sendContactConfirmationEmail = async (customerEmail: string, customerName: string) => {
  try {
    const mailOptions = {
      from: `"Barrera Wallpaper" <${process.env.SMTP_USER || 'ventas@barrerawallpaper.com'}>`,
      to: customerEmail,
      subject: `We've received your message - Barrera Wallpaper`,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #000; padding: 30px; text-align: center;">
            <h2 style="color: #fff; margin: 0; letter-spacing: 1px;">BARRERA WALLPAPER</h2>
          </div>
          <div style="padding: 40px 30px; text-align: center;">
            <h3 style="color: #000;">Thank you for reaching out, ${customerName}!</h3>
            <p style="font-size: 16px; color: #666; line-height: 1.6;">
              We have received your inquiry and our team is already reviewing it. 
              We typically respond within 24 business hours.
            </p>
            <p style="font-size: 16px; color: #666; line-height: 1.6; margin-top: 20px;">
              In the meantime, feel free to browse our latest collections.
            </p>
            <div style="margin-top: 30px;">
              <a href="https://barrerawallpaper.com/catalog" style="background-color: #000; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">VIEW CATALOG</a>
            </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} Barrera Wallpaper. All rights reserved.
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending contact confirmation email:', error);
    return false;
  }
};
