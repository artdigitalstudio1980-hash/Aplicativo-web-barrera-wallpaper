
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Package, 
  Truck, 
  Mail, 
  Download,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shippingEmail: string;
  aiWallpaperOrder?: {
    generatedImageUrl: string;
    prompt: string;
    material: string;
    type: string;
    width: number;
    height: number;
    numCopies: number;
  };
}

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        router.push('/ai-studio');
        return;
      }

      try {
        const qs = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : '';
        const response = await fetch(`/api/orders/${orderId}${qs}`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.success) {
          setOrderDetails(data.data);
        } else {
          console.error('Failed to fetch order details');
        }
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, router, sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link href="/ai-studio">
            <Button>Return to AI Studio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-lg text-gray-600">
            Thank you for your order. Your custom wallpaper is being processed.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2" />
                  Order Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Number</span>
                  <span className="font-mono text-sm">{orderDetails.orderNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {orderDetails.status}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Amount</span>
                  <span className="text-lg font-semibold">${orderDetails.total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Confirmation Email</span>
                  <span className="text-sm">{orderDetails.shippingEmail}</span>
                </div>

                {orderDetails.aiWallpaperOrder && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium mb-2">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Material</span>
                          <span className="capitalize">{orderDetails.aiWallpaperOrder.material}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type</span>
                          <span className="capitalize">{orderDetails.aiWallpaperOrder.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Dimensions</span>
                          <span>{orderDetails.aiWallpaperOrder.width}" × {orderDetails.aiWallpaperOrder.height}"</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Quantity</span>
                          <span>{orderDetails.aiWallpaperOrder.numCopies}</span>
                        </div>
                      </div>
                    </div>


                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Design Preview */}
          {orderDetails.aiWallpaperOrder && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Your Custom Design</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                    <Image
                      src={orderDetails.aiWallpaperOrder.generatedImageUrl}
                      alt="Your custom wallpaper design"
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-4">
                    <strong>Design Prompt:</strong><br />
                    {orderDetails.aiWallpaperOrder.prompt}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a 
                      href={orderDetails.aiWallpaperOrder.generatedImageUrl}
                      download="custom-wallpaper-design.jpg"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download High-Res Image
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">Processing</h3>
                  <p className="text-sm text-gray-600">
                    Your order has been sent to our printing partner for production.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Truck className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h3 className="font-medium mb-2">Printing & Shipping</h3>
                  <p className="text-sm text-gray-600">
                    Your wallpaper will be professionally printed and shipped within 7-10 business days.
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Tracking Info</h3>
                  <p className="text-sm text-gray-600">
                    You'll receive tracking information via email once your order ships.
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Important Notes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• A confirmation email has been sent to {orderDetails.shippingEmail}</li>
                  <li>• Production time: 5-7 business days</li>
                  <li>• Shipping time: 3-7 business days (depending on location)</li>
                  <li>• You can track your order status in your account dashboard</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/ai-studio">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Another Design
            </Button>
          </Link>
          
          <Link href="/catalog">
            <Button size="lg" className="bg-black hover:bg-gray-800">
              Explore Our Catalog
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
