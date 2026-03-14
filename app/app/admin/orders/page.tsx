
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  isAIGenerated: boolean;
  pictoremOrderId?: string;
  pictoremStatus?: string;
  createdAt: string;
  aiWallpaperOrder?: {
    prompt: string;
    generatedImageUrl: string;
    material: string;
    type: string;
    status: string;
  };
}

const STATUS_COLORS = {
  'PENDING': 'bg-yellow-100 text-yellow-800',
  'CONFIRMED': 'bg-blue-100 text-blue-800',
  'PROCESSING': 'bg-purple-100 text-purple-800',
  'SHIPPED': 'bg-green-100 text-green-800',
  'DELIVERED': 'bg-emerald-100 text-emerald-800',
  'CANCELLED': 'bg-red-100 text-red-800',
  'REFUNDED': 'bg-gray-100 text-gray-800'
};

const AI_STATUS_COLORS = {
  'GENERATING': 'bg-yellow-100 text-yellow-800',
  'GENERATED': 'bg-blue-100 text-blue-800',
  'READY_FOR_PAYMENT': 'bg-green-100 text-green-800',
  'PAID': 'bg-emerald-100 text-emerald-800',
  'SENT_TO_PICTOREM': 'bg-purple-100 text-purple-800',
  'PICTOREM_CONFIRMED': 'bg-indigo-100 text-indigo-800',
  'DELIVERED': 'bg-emerald-100 text-emerald-800',
  'ERROR': 'bg-red-100 text-red-800'
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [aiFilter, setAiFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const retryOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to retry sending this order to Pictorem?')) {
      return;
    }

    try {
      const response = await fetch('/api/pictorem/retry-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Order ${data.data.orderNumber} successfully sent to Pictorem!`);
        fetchOrders(); // Refresh orders
      } else {
        alert(`Failed to retry order: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error retrying order:', error);
      alert('An error occurred while retrying the order');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesAI = aiFilter === 'all' || 
      (aiFilter === 'ai' && order.isAIGenerated) ||
      (aiFilter === 'regular' && !order.isAIGenerated);

    return matchesSearch && matchesStatus && matchesAI;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Order Management</h1>
              <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
            </div>
            <Button onClick={fetchOrders} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={aiFilter} onValueChange={setAiFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Order Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ai">AI Generated</SelectItem>
                    <SelectItem value="regular">Regular Orders</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {filteredOrders.length} of {orders.length} orders
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading orders...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Order Info */}
                      <div className="lg:col-span-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                            {order.isAIGenerated && (
                              <Badge variant="secondary" className="text-xs">
                                AI Generated
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* AI Design Preview */}
                      {order.isAIGenerated && order.aiWallpaperOrder && (
                        <div className="lg:col-span-2">
                          <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={order.aiWallpaperOrder.generatedImageUrl}
                              alt="AI design"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-600">
                              {order.aiWallpaperOrder.material} • {order.aiWallpaperOrder.type}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-32">
                              {order.aiWallpaperOrder.prompt}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order Status */}
                      <div className="lg:col-span-2">
                        <div className="space-y-2">
                          <Badge className={`text-xs ${STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                            {order.status}
                          </Badge>
                          {order.isAIGenerated && order.aiWallpaperOrder && (
                            <Badge variant="outline" className={`text-xs ${AI_STATUS_COLORS[order.aiWallpaperOrder.status as keyof typeof AI_STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                              {order.aiWallpaperOrder.status.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="lg:col-span-2">
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            ${order.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{order.currency}</p>
                        </div>
                      </div>

                      {/* Pictorem Status */}
                      <div className="lg:col-span-2">
                        {order.pictoremOrderId ? (
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-green-600">
                              <Package className="w-4 h-4 mr-1" />
                              <span>Sent to Pictorem</span>
                            </div>
                            <p className="text-xs text-gray-500 font-mono">
                              {order.pictoremOrderId}
                            </p>
                            {order.pictoremStatus && (
                              <Badge variant="outline" className="text-xs">
                                {order.pictoremStatus}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center text-sm text-gray-400">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            <span>Not sent</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1">
                        <div className="flex flex-col space-y-2">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="outline" className="w-full">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          {order.pictoremOrderId && (
                            <Button size="sm" variant="outline" asChild className="w-full">
                              <a 
                                href={`https://pictorem.com/order-status/${order.pictoremOrderId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Pictorem
                              </a>
                            </Button>
                          )}
                          {!order.pictoremOrderId && order.isAIGenerated && order.status === 'CONFIRMED' && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full"
                              onClick={() => retryOrder(order.id)}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No orders found matching your criteria</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
