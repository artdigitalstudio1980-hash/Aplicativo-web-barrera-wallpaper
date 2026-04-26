
export const paypal = {
  async getAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';
    
    const base = environment === 'sandbox' 
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';

    const authResponse = await fetch(`${base}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    const authData = await authResponse.json();
    return { accessToken: authData.access_token, base };
  },

  async createOrder(order: any) {
    const { accessToken, base } = await this.getAccessToken();

    // Prepare description and items
    let description = `Barrera Wallpaper Order ${order.orderNumber}`;
    const items = [];

    if (order.isAIGenerated && order.aiWallpaperOrders.length > 0) {
      const aiOrder = order.aiWallpaperOrders[0];
      items.push({
        name: `Custom AI Wallpaper - ${aiOrder.material}`,
        unit_amount: {
          currency_code: order.currency,
          value: (order.total / aiOrder.numCopies).toFixed(2)
        },
        quantity: aiOrder.numCopies.toString()
      });
    } else {
      items.push({
        name: description,
        unit_amount: {
          currency_code: order.currency,
          value: order.total.toFixed(2)
        },
        quantity: '1'
      });
    }

    const orderResponse = await fetch(`${base}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: order.id,
          amount: {
            currency_code: order.currency,
            value: order.total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: order.currency,
                value: order.total.toFixed(2)
              }
            }
          },
          items
        }],
        application_context: {
          brand_name: 'Barrera Wallpaper',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXTAUTH_URL}/checkout/success`,
          cancel_url: `${process.env.NEXTAUTH_URL}/cart`
        }
      })
    });

    return await orderResponse.json();
  },

  async captureOrder(paypalOrderId: string) {
    const { accessToken, base } = await this.getAccessToken();

    const response = await fetch(`${base}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      }
    });

    return await response.json();
  }
};
