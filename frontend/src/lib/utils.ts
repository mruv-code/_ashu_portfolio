import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely converts a File, Blob, or string to a usable image/media URL
 * @param source - Can be a string URL, File, Blob, or any other value
 * @returns A valid URL string, or null if source is invalid
 */
export function toMediaUrl(source: any): string | null {
  // If it's a string, assume it's already a URL
  if (typeof source === 'string' && source.trim()) {
    return source;
  }

  // If it's a File or Blob, create an object URL
  if (source instanceof File || source instanceof Blob) {
    try {
      return URL.createObjectURL(source);
    } catch (error) {
      console.error('Error creating object URL:', error);
      return null;
    }
  }

  // For anything else (null, undefined, etc.), return null
  return null;
}
