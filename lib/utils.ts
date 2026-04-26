/**
 * Shared utility functions for the Barrera Wallpaper application.
 * All common helpers should live here to avoid duplication.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── CSS UTILITY ───
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── IMAGE PARSING ───
/**
 * Extracts the primary display image URL from a product's image data.
 * Handles all inconsistent formats found in the database:
 * - `imageUrl` field (preferred)
 * - JSON array string: `'["/img1.jpg","/img2.jpg"]'`
 * - Plain path string: `'/catalogo/image.png'`
 * - Array: `["/img1.jpg", "/img2.jpg"]`
 * - null/undefined
 */
export function parseProductImage(product: {
  imageUrl?: string | null;
  images?: string | string[] | null;
}): string {
  // Priority 1: imageUrl field
  if (product.imageUrl) return product.imageUrl;

  const images = product.images;

  // Priority 2: Already an array
  if (Array.isArray(images) && images.length > 0) {
    return images[0];
  }

  // Priority 3: String processing
  if (typeof images === 'string') {
    // Direct path
    if (images.startsWith('/') || images.startsWith('http')) {
      return images;
    }

    // JSON array string
    if (images.startsWith('[')) {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed[0];
        }
      } catch {
        // Invalid JSON, fall through to placeholder
      }
    }
  }

  // Fallback
  return '/images/placeholder.png';
}

// ─── API RESPONSE TYPES ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function apiError(error: string, status = 500, details?: string): Response {
  const body: ApiResponse = { success: false, error };
  if (details && process.env.NODE_ENV !== 'production') {
    body.details = details;
  }
  return Response.json(body, { status });
}

// ─── SANITIZATION ───
/**
 * Strips HTML tags from user input to prevent XSS.
 * Use on any user-provided string before storing or displaying.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '')
    .trim();
}

/**
 * Validates an email format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}