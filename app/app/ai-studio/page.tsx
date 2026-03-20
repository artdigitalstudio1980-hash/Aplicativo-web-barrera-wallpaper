
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Download, 
  ShoppingCart, 
  Palette, 
  Settings,
  CreditCard,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface GeneratedDesign {
  id: string;
  imageUrl: string;
  prompt: string;
  processingTime: number;
}

interface ProductConfiguration {
  material: string;
  type: string;
  orientation: string;
  width: number;
  height: number;
  numCopies: number;
  borderColor: string;
  customerPrice?: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

interface ShippingAddress {
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  zip: string;
}

const MATERIALS = [
  { value: 'canvas', label: 'Canvas', description: 'Premium canvas prints' },
  { value: 'metal', label: 'Metal', description: 'Durable aluminum prints' },
  { value: 'acrylic', label: 'Acrylic', description: 'Modern acrylic glass' },
  { value: 'paper', label: 'Paper', description: 'High-quality paper prints' }
];

const MATERIAL_TYPES: { [key: string]: { value: string; label: string }[] } = {
  canvas: [
    { value: 'stretched', label: 'Gallery Wrapped' },
    { value: 'roll', label: 'Roll (for custom framing)' }
  ],
  metal: [
    { value: 'al', label: 'Standard Aluminum' },
    { value: 'hd', label: 'HD Aluminum' }
  ],
  acrylic: [
    { value: 'da8', label: '1/8" Thickness' },
    { value: 'da16', label: '1/4" Thickness' }
  ],
  paper: [
    { value: 'poster', label: 'Poster Print' },
    { value: 'art', label: 'Fine Art Print' }
  ]
};

const ORIENTATIONS = [
  { value: 'horizontal', label: 'Landscape' },
  { value: 'vertical', label: 'Portrait' },
  { value: 'square', label: 'Square' }
];

const STYLES = [
  'Modern', 'Classic', 'Abstract', 'Botanical', 'Geometric', 
  'Minimalist', 'Vintage', 'Art Deco', 'Watercolor', 'Marble'
];

const COLORS = [
  'Navy Blue', 'Gold', 'Rose Gold', 'Emerald', 'Burgundy',
  'Charcoal', 'Ivory', 'Blush Pink', 'Forest Green', 'Copper'
];

export default function AIStudioPage() {
  const [step, setStep] = useState(1);
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [generatedDesign, setGeneratedDesign] = useState<GeneratedDesign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPricingLoading, setIsPricingLoading] = useState(false);
  const [isOrderCreating, setIsOrderCreating] = useState(false);

  const [productConfig, setProductConfig] = useState<ProductConfiguration>({
    material: 'canvas',
    type: 'stretched',
    orientation: 'horizontal',
    width: 24,
    height: 16,
    numCopies: 1,
    borderColor: 'ffffff'
  });

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: ''
  });

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: 'US',
    zip: ''
  });

  const [orderId, setOrderId] = useState<string | null>(null);

  const generateWallpaper = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a design prompt');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai-wallpaper/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          style: selectedStyle,
          colors: selectedColors,
          width: 1024,
          height: 1024
        })
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedDesign(data.data);
        setStep(2);
        toast.success('Wallpaper design generated successfully!');
      } else {
        toast.error(data.error || 'Failed to generate design');
      }
    } catch (error) {
      toast.error('Failed to generate wallpaper design');
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatePricing = async () => {
    // Only calculate if we have all required fields
    if (!productConfig.material || !productConfig.type || !productConfig.width || !productConfig.height) {
      return;
    }

    setIsPricingLoading(true);
    try {
      const response = await fetch('/api/ai-wallpaper/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productConfig)
      });

      const data = await response.json();

      if (data.success) {
        setProductConfig(prev => ({
          ...prev,
          customerPrice: data.data.customerPrice
        }));
        toast.success(`Price calculated: $${data.data.customerPrice.toFixed(2)}`);
      } else {
        toast.error('Failed to calculate pricing: ' + (data.error || 'Unknown error'));
        console.error('Pricing error:', data);
      }
    } catch (error) {
      console.error('Calculate pricing error:', error);
      toast.error('Failed to calculate pricing. Please try again.');
    } finally {
      setIsPricingLoading(false);
    }
  };

  // Auto-calculate pricing when product configuration changes
  useEffect(() => {
    if (step === 2 && productConfig.material && productConfig.type && productConfig.width && productConfig.height) {
      const timeoutId = setTimeout(() => {
        calculatePricing();
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [step, productConfig.material, productConfig.type, productConfig.width, productConfig.height, productConfig.numCopies]);

  const createOrder = async () => {
    if (!generatedDesign || !customerInfo.name || !customerInfo.email || !shippingAddress.address1) {
      toast.error('Please fill in all required information');
      return;
    }

    setIsOrderCreating(true);
    try {
      const response = await fetch('/api/ai-wallpaper/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generatedImageUrl: generatedDesign.imageUrl,
          prompt: generatedDesign.prompt,
          ...productConfig,
          customerInfo,
          shippingAddress
        })
      });

      const data = await response.json();

      if (data.success) {
        setOrderId(data.data.orderId);
        setStep(4);
        toast.success('Order created successfully!');
      } else {
        toast.error(data.error || 'Failed to create order');
      }
    } catch (error) {
      toast.error('Failed to create order');
    } finally {
      setIsOrderCreating(false);
    }
  };

  const initiateStripePayment = async () => {
    if (!orderId) return;

    try {
      const response = await fetch('/api/payments/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          successUrl: `${window.location.origin}/ai-studio/success`,
          cancelUrl: `${window.location.origin}/ai-studio?step=4`
        })
      });

      const data = await response.json();

      if (data.success && data.data.url) {
        window.location.href = data.data.url;
      } else {
        toast.error('Failed to initiate payment');
      }
    } catch (error) {
      toast.error('Failed to initiate payment');
    }
  };

  const initiatePayPalPayment = async () => {
    if (!orderId) return;

    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.success && data.data.approvalUrl) {
        window.location.href = data.data.approvalUrl;
      } else {
        toast.error('Failed to initiate PayPal payment');
      }
    } catch (error) {
      toast.error('Failed to initiate PayPal payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            AI WALLPAPER STUDIO
          </h1>
          <div className="w-24 h-px bg-black mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Create unique wallpaper designs with artificial intelligence. 
            Describe your vision and watch it come to life.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center space-x-8">
            {[
              { number: 1, title: 'Design', icon: Sparkles },
              { number: 2, title: 'Configure', icon: Settings },
              { number: 3, title: 'Details', icon: Palette },
              { number: 4, title: 'Payment', icon: CreditCard }
            ].map((stepItem) => {
              const Icon = stepItem.icon;
              const isActive = step === stepItem.number;
              const isCompleted = step > stepItem.number;
              
              return (
                <div key={stepItem.number} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'border-black bg-black text-white' : 
                      isCompleted ? 'border-green-500 bg-green-500 text-white' : 
                      'border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Design Generation */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-6 h-6 mr-2" />
                    Describe Your Wallpaper Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="prompt" className="text-sm font-medium">
                      Design Prompt *
                    </Label>
                    <Textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe your ideal wallpaper design... (e.g., 'Modern geometric pattern with gold accents and navy blue background, luxury hotel style')"
                      className="mt-1 min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium">Style (Optional)</Label>
                      <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a style" />
                        </SelectTrigger>
                        <SelectContent>
                          {STYLES.map((style) => (
                            <SelectItem key={style} value={style.toLowerCase()}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Preferred Colors</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {COLORS.map((color) => (
                          <Badge
                            key={color}
                            variant={selectedColors.includes(color.toLowerCase()) ? "default" : "outline"}
                            className="cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              const colorLower = color.toLowerCase();
                              setSelectedColors(prev =>
                                prev.includes(colorLower)
                                  ? prev.filter(c => c !== colorLower)
                                  : [...prev, colorLower]
                              );
                            }}
                          >
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={generateWallpaper}
                    disabled={isGenerating || !prompt.trim()}
                    size="lg"
                    className="w-full bg-black hover:bg-gray-800"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Design...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Wallpaper Design
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Product Configuration */}
          {step === 2 && generatedDesign && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generated Design Preview */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Generated Design</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <Image
                        src={generatedDesign.imageUrl}
                        alt="Generated wallpaper design"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Prompt:</strong> {generatedDesign.prompt}
                    </p>
                    <p className="text-sm text-gray-500">
                      Generated in {generatedDesign.processingTime}s
                    </p>
                    
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={() => setStep(1)}>
                        Generate New Design
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Product Configuration */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Configure Your Product</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Material *</Label>
                        <Select 
                          value={productConfig.material} 
                          onValueChange={(value) => setProductConfig(prev => ({ ...prev, material: value, type: '' }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIALS.map((material) => (
                              <SelectItem key={material.value} value={material.value}>
                                <div>
                                  <div className="font-medium">{material.label}</div>
                                  <div className="text-sm text-gray-500">{material.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Type *</Label>
                        <Select 
                          value={productConfig.type} 
                          onValueChange={(value) => setProductConfig(prev => ({ ...prev, type: value }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {MATERIAL_TYPES[productConfig.material]?.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Orientation *</Label>
                      <Select 
                        value={productConfig.orientation} 
                        onValueChange={(value) => setProductConfig(prev => ({ ...prev, orientation: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORIENTATIONS.map((orientation) => (
                            <SelectItem key={orientation.value} value={orientation.value}>
                              {orientation.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="width" className="text-sm font-medium">Width (inches) *</Label>
                        <Input
                          id="width"
                          type="number"
                          min="8"
                          max="60"
                          value={productConfig.width}
                          onChange={(e) => setProductConfig(prev => ({ ...prev, width: parseInt(e.target.value) || 8 }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="height" className="text-sm font-medium">Height (inches) *</Label>
                        <Input
                          id="height"
                          type="number"
                          min="8"
                          max="60"
                          value={productConfig.height}
                          onChange={(e) => setProductConfig(prev => ({ ...prev, height: parseInt(e.target.value) || 8 }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="copies" className="text-sm font-medium">Number of Copies</Label>
                      <Input
                        id="copies"
                        type="number"
                        min="1"
                        max="10"
                        value={productConfig.numCopies}
                        onChange={(e) => setProductConfig(prev => ({ ...prev, numCopies: parseInt(e.target.value) || 1 }))}
                        className="mt-1"
                      />
                    </div>

                    {/* Price Display */}
                    <div className="mt-4">
                      {isPricingLoading ? (
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                            <span className="text-blue-700">Calculating price...</span>
                          </div>
                        </div>
                      ) : productConfig.customerPrice ? (
                        <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
                          <div className="text-center mb-4">
                            <div className="text-sm text-gray-600 mb-1">Total Price</div>
                            <div className="text-3xl font-bold text-green-600">
                              ${productConfig.customerPrice.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              for {productConfig.numCopies} {productConfig.numCopies === 1 ? 'copy' : 'copies'}
                            </div>
                          </div>
                          <Button
                            onClick={() => setStep(3)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            size="lg"
                          >
                            Continue to Customer Details
                            <ShoppingCart className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                          <div className="text-center text-gray-600">
                            <p className="text-sm">
                              {!productConfig.material || !productConfig.type 
                                ? 'Select material and type to see pricing' 
                                : 'Adjust dimensions to see pricing'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customer & Shipping Details */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Customer & Shipping Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="customer" className="space-y-6">
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="customer">Customer Info</TabsTrigger>
                      <TabsTrigger value="shipping">Shipping Address</TabsTrigger>
                    </TabsList>

                    <TabsContent value="customer" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                          <Input
                            id="name"
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          value={customerInfo.phone}
                          onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="shipping" className="space-y-4">
                      <div>
                        <Label htmlFor="address1" className="text-sm font-medium">Address Line 1 *</Label>
                        <Input
                          id="address1"
                          value={shippingAddress.address1}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, address1: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="address2" className="text-sm font-medium">Address Line 2</Label>
                        <Input
                          id="address2"
                          value={shippingAddress.address2}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, address2: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city" className="text-sm font-medium">City *</Label>
                          <Input
                            id="city"
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state" className="text-sm font-medium">State *</Label>
                          <Input
                            id="state"
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zip" className="text-sm font-medium">ZIP Code *</Label>
                          <Input
                            id="zip"
                            value={shippingAddress.zip}
                            onChange={(e) => setShippingAddress(prev => ({ ...prev, zip: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Order Summary */}
                  <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="font-medium text-lg mb-4">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Custom AI Wallpaper ({productConfig.material} {productConfig.type})</span>
                        <span>${productConfig.customerPrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimensions: {productConfig.width}" × {productConfig.height}"</span>
                        <span>{productConfig.numCopies} {productConfig.numCopies === 1 ? 'copy' : 'copies'}</span>
                      </div>
                      <div className="border-t pt-2 mt-4">
                        <div className="flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span>${productConfig.customerPrice?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={createOrder}
                    disabled={isOrderCreating || !customerInfo.name || !customerInfo.email || !shippingAddress.address1}
                    className="w-full mt-6 bg-black hover:bg-gray-800"
                    size="lg"
                  >
                    {isOrderCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : (
                      'Continue to Payment'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Payment */}
          {step === 4 && orderId && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto"
            >
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-6 h-6 mr-2" />
                    Choose Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center p-6 bg-green-50 rounded-lg">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-800 mb-2">Order Created Successfully!</h3>
                    <p className="text-green-600">
                      Your custom wallpaper order is ready for payment. 
                      Choose your preferred payment method below.
                    </p>
                    <div className="mt-4 text-2xl font-bold text-green-800">
                      ${productConfig.customerPrice?.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Button
                      onClick={initiateStripePayment}
                      size="lg"
                      className="h-16 bg-blue-600 hover:bg-blue-700"
                    >
                      <CreditCard className="w-6 h-6 mr-3" />
                      Pay with Credit Card (Stripe)
                    </Button>

                    <Button
                      onClick={initiatePayPalPayment}
                      size="lg"
                      variant="outline"
                      className="h-16 border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
                    >
                      <div className="font-bold text-lg">PayPal</div>
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-500 space-y-2">
                    <p>🔒 Your payment information is secure and encrypted</p>
                    <p>📦 Tu wallpaper personalizado será impreso y enviado por nuestro equipo</p>
                    <p>🚚 Estimated delivery: 7-14 business days</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
