'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft, Package, User, Truck, CreditCard,
  Trash2, Save, ExternalLink, ImageIcon, Loader2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const STATUS_COLORS: Record<string, string> = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-blue-100 text-blue-800',
  'PROCESSING': 'bg-purple-100 text-purple-800',
  'SHIPPED': 'bg-green-100 text-green-800',
  'DELIVERED': 'bg-emerald-100 text-emerald-800',
  'CANCELLED': 'bg-red-100 text-red-800',
  'REFUNDED': 'bg-gray-100 text-gray-800',
};

const PROVIDER_COLORS: Record<string, string> = {
  'STRIPE': 'bg-indigo-100 text-indigo-800',
  'PAYPAL': 'bg-blue-100 text-blue-800',
};

const STATUS_OPTIONS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

export default function AdminOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setForm({
          status: data.data.status,
          trackingNumber: data.data.trackingNumber || '',
          notes: data.data.notes || '',
          estimatedDelivery: data.data.estimatedDelivery
            ? new Date(data.data.estimatedDelivery).toISOString().split('T')[0]
            : '',
          shippingName: data.data.shipping?.name || '',
          shippingEmail: data.data.shipping?.email || '',
          shippingPhone: data.data.shipping?.phone || '',
          shippingAddress1: data.data.shipping?.address1 || '',
          shippingAddress2: data.data.shipping?.address2 || '',
          shippingCity: data.data.shipping?.city || '',
          shippingState: data.data.shipping?.state || '',
          shippingCountry: data.data.shipping?.country || '',
          shippingZip: data.data.shipping?.zip || '',
        });
      } else {
        setError('Order not found');
      }
    } catch {
      setError('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setEditMode(false);
        fetchOrder();
      } else {
        setError(data.error || 'Failed to update');
      }
    } catch {
      setError('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/admin/orders');
      } else {
        setError(data.error || 'Failed to delete');
        setDeleting(false);
      }
    } catch {
      setError('Failed to delete order');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <Link href="/admin/orders" className="text-blue-600 hover:underline mt-4 inline-block">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const parsedImages = (images: any): string[] => {
    if (!images) return [];
    if (Array.isArray(images)) return images;
    try { return JSON.parse(images); } catch { return []; }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link href="/admin/orders" className="text-sm text-gray-500 hover:text-black flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
            <h1 className="text-2xl font-light text-gray-900 flex items-center gap-3">
              Order {order.orderNumber}
              <Badge className={STATUS_COLORS[order.status]}>{order.status}</Badge>
              {order.isAIGenerated && <Badge variant="secondary">AI Generated</Badge>}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(order.createdAt).toLocaleString()}
              {order.updatedAt !== order.createdAt && ` • Updated ${new Date(order.updatedAt).toLocaleString()}`}
            </p>
          </div>
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button variant="outline" onClick={() => { setEditMode(false); fetchOrder(); }}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(true)}>Edit Order</Button>
                <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
                </Button>
              </>
            )}
          </div>
        </motion.div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5" /> Products</CardTitle></CardHeader>
                <CardContent>
                  {order.orderItems && order.orderItems.length > 0 ? (
                    <div className="space-y-4">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.product && parsedImages(item.product.images).length > 0 ? (
                            <div className="relative w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                              <Image src={parsedImages(item.product.images)[0]} alt="" fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.product?.name || item.product?.nameEs || 'Unknown Product'}</p>
                            {item.product?.sku && <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>}
                            {item.product?.category && <p className="text-xs text-gray-500">Category: {item.product.category.name || item.product.category.nameEs}</p>}
                            {item.product?.dimensions && <p className="text-xs text-gray-500">Dimensions: {item.product.dimensions}</p>}
                            {item.product?.material && <p className="text-xs text-gray-500">Material: {item.product.material}</p>}
                            {item.customization && (
                              <p className="text-xs text-gray-500 mt-1">
                                Custom: {typeof item.customization === 'string' ? item.customization : JSON.stringify(item.customization)}
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">x{item.quantity}</p>
                            <p className="text-sm font-semibold mt-1">${(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No regular products in this order.</p>
                  )}

                  {order.aiWallpaperOrder && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-sm text-purple-800 mb-3">AI Wallpaper Design</h4>
                      <div className="flex items-start gap-4">
                        {order.aiWallpaperOrder.generatedImageUrl && (
                          <div className="relative w-20 h-20 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                            <Image src={order.aiWallpaperOrder.generatedImageUrl} alt="AI Design" fill className="object-cover" />
                          </div>
                        )}
                        <div className="flex-1 text-sm text-purple-900 space-y-1">
                          <p><span className="font-medium">Prompt:</span> {order.aiWallpaperOrder.prompt}</p>
                          <p><span className="font-medium">Material:</span> {order.aiWallpaperOrder.material} | <span className="font-medium">Type:</span> {order.aiWallpaperOrder.type}</p>
                          <p><span className="font-medium">Size:</span> {order.aiWallpaperOrder.width}x{order.aiWallpaperOrder.height}cm | <span className="font-medium">Copies:</span> {order.aiWallpaperOrder.numCopies}</p>
                          <p><span className="font-medium">Orientation:</span> {order.aiWallpaperOrder.orientation} | <span className="font-medium">Border:</span> #{order.aiWallpaperOrder.borderColor}</p>
                          {order.aiWallpaperOrder.customerPrice && (
                            <p><span className="font-medium">Customer Price:</span> ${Number(order.aiWallpaperOrder.customerPrice).toFixed(2)}</p>
                          )}
                          {order.aiWallpaperOrder.pictoremOrderId && (
                            <p><span className="font-medium">Pictorem Order:</span> {order.aiWallpaperOrder.pictoremOrderId}</p>
                          )}
                          {order.aiWallpaperOrder.errorMessage && (
                            <p className="text-red-600"><span className="font-medium">Error:</span> {order.aiWallpaperOrder.errorMessage}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${Number(order.total).toFixed(2)} {order.currency}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Truck className="w-5 h-5" /> Shipping & Status</CardTitle></CardHeader>
                <CardContent>
                  {editMode ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tracking Number</label>
                        <Input value={form.trackingNumber} onChange={(e) => setForm({ ...form, trackingNumber: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Estimated Delivery</label>
                        <Input type="date" value={form.estimatedDelivery} onChange={(e) => setForm({ ...form, estimatedDelivery: e.target.value })} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Notes</label>
                        <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} />
                      </div>
                      <div className="md:col-span-2">
                        <h4 className="text-sm font-medium mb-2">Shipping Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input placeholder="Name" value={form.shippingName} onChange={(e) => setForm({ ...form, shippingName: e.target.value })} />
                          <Input placeholder="Email" value={form.shippingEmail} onChange={(e) => setForm({ ...form, shippingEmail: e.target.value })} />
                          <Input placeholder="Phone" value={form.shippingPhone} onChange={(e) => setForm({ ...form, shippingPhone: e.target.value })} />
                          <Input placeholder="Address 1" value={form.shippingAddress1} onChange={(e) => setForm({ ...form, shippingAddress1: e.target.value })} />
                          <Input placeholder="Address 2" value={form.shippingAddress2} onChange={(e) => setForm({ ...form, shippingAddress2: e.target.value })} />
                          <Input placeholder="City" value={form.shippingCity} onChange={(e) => setForm({ ...form, shippingCity: e.target.value })} />
                          <Input placeholder="State" value={form.shippingState} onChange={(e) => setForm({ ...form, shippingState: e.target.value })} />
                          <Input placeholder="Country" value={form.shippingCountry} onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })} />
                          <Input placeholder="ZIP" value={form.shippingZip} onChange={(e) => setForm({ ...form, shippingZip: e.target.value })} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Status</p>
                        <Badge className={`mt-1 ${STATUS_COLORS[order.status]}`}>{order.status}</Badge>
                      </div>
                      {order.trackingNumber && (
                        <div>
                          <p className="text-gray-500">Tracking Number</p>
                          <p className="font-medium">{order.trackingNumber}</p>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div>
                          <p className="text-gray-500">Estimated Delivery</p>
                          <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                        </div>
                      )}
                      {order.deliveredAt && (
                        <div>
                          <p className="text-gray-500">Delivered At</p>
                          <p className="font-medium">{new Date(order.deliveredAt).toLocaleDateString()}</p>
                        </div>
                      )}
                      {order.notes && (
                        <div className="md:col-span-2">
                          <p className="text-gray-500">Notes</p>
                          <p className="mt-1 p-2 bg-gray-50 rounded text-sm">{order.notes}</p>
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <p className="text-gray-500 mb-1">Shipping Address</p>
                        <div className="p-3 bg-gray-50 rounded text-sm">
                          <p>{order.shipping?.name} {order.shipping?.email && `<${order.shipping.email}>`}</p>
                          {order.shipping?.phone && <p>{order.shipping.phone}</p>}
                          <p>{order.shipping?.address1}</p>
                          {order.shipping?.address2 && <p>{order.shipping.address2}</p>}
                          <p>{order.shipping?.city}, {order.shipping?.state} {order.shipping?.zip}</p>
                          <p>{order.shipping?.country}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {order.installations && order.installations.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card>
                  <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Package className="w-5 h-5" /> Installation</CardTitle></CardHeader>
                  <CardContent>
                    {order.installations.map((inst: any) => (
                      <div key={inst.id} className="text-sm space-y-1">
                        <p><span className="font-medium">Contact:</span> {inst.contactName} ({inst.contactPhone})</p>
                        <p><span className="font-medium">Address:</span> {inst.address1}, {inst.city}, {inst.state}</p>
                        <p><span className="font-medium">Status:</span> {inst.status}</p>
                        {inst.preferredDate && <p><span className="font-medium">Preferred Date:</span> {new Date(inst.preferredDate).toLocaleDateString()}</p>}
                        {inst.notes && <p><span className="font-medium">Notes:</span> {inst.notes}</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><User className="w-5 h-5" /> Customer</CardTitle></CardHeader>
                <CardContent className="text-sm space-y-2">
                  {order.customer ? (
                    <>
                      <p className="font-medium">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-gray-600">{order.customer.email}</p>
                      {order.customer.phone && <p className="text-gray-600">{order.customer.phone}</p>}
                      <hr className="my-2" />
                      {order.customer.address && <p className="text-gray-600">{order.customer.address}</p>}
                      {order.customer.city && <p className="text-gray-600">{order.customer.city}{order.customer.state ? `, ${order.customer.state}` : ''}</p>}
                      <hr className="my-2" />
                      <p className="text-xs text-gray-400">Registered: {new Date(order.customer.registeredAt).toLocaleDateString()}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Guest (no account)</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><CreditCard className="w-5 h-5" /> Payments</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {order.paymentTransactions && order.paymentTransactions.length > 0 ? (
                    order.paymentTransactions.map((tx: any) => (
                      <div key={tx.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <Badge className={PROVIDER_COLORS[tx.provider]}>{tx.provider}</Badge>
                          <Badge variant="outline" className="text-xs">{tx.status}</Badge>
                        </div>
                        <p className="font-medium mt-1">${Number(tx.amount).toFixed(2)} {tx.currency}</p>
                        {tx.transactionId && <p className="text-xs text-gray-500 truncate">ID: {tx.transactionId}</p>}
                        {tx.sessionId && <p className="text-xs text-gray-500 truncate">Session: {tx.sessionId}</p>}
                        {tx.paypalOrderId && <p className="text-xs text-gray-500 truncate">PayPal: {tx.paypalOrderId}</p>}
                        <p className="text-xs text-gray-400 mt-1">{new Date(tx.createdAt).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No payment records</p>
                  )}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${Number(order.subtotal).toFixed(2)}</span>
                    </div>
                    {Number(order.tax) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>${Number(order.tax).toFixed(2)}</span>
                      </div>
                    )}
                    {Number(order.shipping) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>${Number(order.shipping).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-base mt-1 pt-1 border-t">
                      <span>Total</span>
                      <span>${Number(order.total).toFixed(2)} {order.currency}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
