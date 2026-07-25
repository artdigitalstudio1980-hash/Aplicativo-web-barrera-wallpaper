'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Package, ShoppingBag, TrendingUp, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  recentUsers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/users?stats=true');
      const data = await res.json();
      if (data.success) {
        setStats({
          totalUsers: data.totalUsers,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          recentUsers: data.recentUsers || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'bg-blue-500', href: '/admin/users' },
    { title: 'Products', value: stats?.totalProducts || 0, icon: Package, color: 'bg-green-500', href: '/admin/products' },
    { title: 'Orders', value: stats?.totalOrders || 0, icon: ShoppingBag, color: 'bg-purple-500', href: '/admin/orders' },
    { title: 'New Users (30d)', value: stats?.recentUsers || 0, icon: TrendingUp, color: 'bg-orange-500', href: '/admin/users' },
  ];

  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Welcome to the admin panel</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.href} href={stat.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/users">
              <p className="text-blue-600 hover:underline text-sm cursor-pointer">→ Manage Users</p>
            </Link>
            <Link href="/admin/products">
              <p className="text-blue-600 hover:underline text-sm cursor-pointer">→ Manage Products</p>
            </Link>
            <Link href="/admin/orders">
              <p className="text-blue-600 hover:underline text-sm cursor-pointer">→ View Orders</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            <p>NextAuth JWT authentication</p>
            <p>MySQL via Prisma ORM</p>
            <p>Stripe + PayPal payments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
