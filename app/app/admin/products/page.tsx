'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  nameEs: string;
  description?: string;
  descriptionEs?: string;
  slug: string;
  sku: string;
  price: number;
  salePrice?: number;
  images: string[];
  cloudStoragePath?: string;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  category: {
    id: string;
    name: string;
    nameEs: string;
  };
  imageUrl?: string;
}

interface Category {
  id: string;
  name: string;
  nameEs: string;
  slug: string;
}

export default function ProductsAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nameEs: '',
    description: '',
    descriptionEs: '',
    slug: '',
    sku: '',
    price: '',
    salePrice: '',
    cloudStoragePath: '',
    categoryId: '',
    isActive: true,
    isFeatured: false,
    stock: '0'
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (!(session.user as any)?.isAdmin) {
        router.push('/');
      } else {
        fetchProducts();
        fetchCategories();
      }
    }
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      toast.error('Error loading categories');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // 1. Get presigned URL
      const urlRes = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type
        })
      });

      const urlData = await urlRes.json();

      if (!urlData.success) {
        throw new Error(urlData.error || 'Failed to get upload URL');
      }

      // 2. Upload file to S3
      const uploadRes = await fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file');
      }

      // 3. Update form data
      setFormData(prev => ({
        ...prev,
        cloudStoragePath: urlData.cloudStoragePath
      }));

      setImagePreview(urlData.fileUrl);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products';

      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: parseInt(formData.stock),
        images: formData.cloudStoragePath ? [imagePreview] : []
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save product');
      }

      toast.success(editingProduct ? 'Product updated successfully' : 'Product created successfully');
      setShowDialog(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameEs: product.nameEs,
      description: product.description || '',
      descriptionEs: product.descriptionEs || '',
      slug: product.slug,
      sku: product.sku,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      cloudStoragePath: product.cloudStoragePath || '',
      categoryId: product.category.id,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stock: product.stock.toString()
    });
    // Handle Json type safely - images can be null or array
    const imagesArray = Array.isArray(product.images) ? product.images : [];
    setImagePreview(product.imageUrl || imagesArray[0] || '');
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameEs: '',
      description: '',
      descriptionEs: '',
      slug: '',
      sku: '',
      price: '',
      salePrice: '',
      cloudStoragePath: '',
      categoryId: '',
      isActive: true,
      isFeatured: false,
      stock: '0'
    });
    setImagePreview('');
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your wallpaper products and images
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowDialog(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          // Handle Json type safely - images can be null or array
          const imagesArray = Array.isArray(product.images) ? product.images : [];
          const imageUrl = product.imageUrl || imagesArray[0] || '';
          
          return (
          <Card key={product.id}>
            <CardHeader>
              <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{product.nameEs}</p>
                </div>
                <div className="flex gap-2">
                  {product.isActive && (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      Active
                    </Badge>
                  )}
                  {product.isFeatured && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">{product.category.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-medium">{product.sku}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price:</span>
                  <span className="font-bold text-lg">${product.price}</span>
                </div>
                {product.salePrice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sale Price:</span>
                    <span className="font-bold text-lg text-red-600">${product.salePrice}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-medium">{product.stock}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(product)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No products yet</h3>
          <p className="text-muted-foreground mb-4">
            Get started by creating your first product
          </p>
          <Button
            onClick={() => {
              resetForm();
              setShowDialog(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Product
          </Button>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Create New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the product information below'
                : 'Fill in the product details to create a new wallpaper product'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Product Image</Label>
              <div className="flex flex-col gap-4">
                {imagePreview && (
                  <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="flex-1"
                  />
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a high-quality image (max 5MB, JPG/PNG)
                </p>
              </div>
            </div>

            {/* Name (English) */}
            <div className="space-y-2">
              <Label htmlFor="name">Name (English) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    name: e.target.value,
                    slug: !editingProduct ? generateSlug(e.target.value) : prev.slug
                  }));
                }}
                required
                placeholder="Modern Geometric Wallpaper"
              />
            </div>

            {/* Name (Spanish) */}
            <div className="space-y-2">
              <Label htmlFor="nameEs">Name (Spanish) *</Label>
              <Input
                id="nameEs"
                value={formData.nameEs}
                onChange={(e) => setFormData(prev => ({ ...prev, nameEs: e.target.value }))}
                required
                placeholder="Papel Tapiz Geométrico Moderno"
              />
            </div>

            {/* Slug & SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  placeholder="modern-geometric-wallpaper"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  required
                  placeholder="WP-001"
                />
              </div>
            </div>

            {/* Description (English) */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (English)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Beautiful modern geometric pattern..."
              />
            </div>

            {/* Description (Spanish) */}
            <div className="space-y-2">
              <Label htmlFor="descriptionEs">Description (Spanish)</Label>
              <Textarea
                id="descriptionEs"
                value={formData.descriptionEs}
                onChange={(e) => setFormData(prev => ({ ...prev, descriptionEs: e.target.value }))}
                rows={3}
                placeholder="Hermoso patrón geométrico moderno..."
              />
            </div>

            {/* Price & Sale Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  required
                  placeholder="89.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salePrice">Sale Price (USD)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                  placeholder="69.99"
                />
              </div>
            </div>

            {/* Category & Stock */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="10"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Active</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm">Featured</span>
              </label>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
