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
