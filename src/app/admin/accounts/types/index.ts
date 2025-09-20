/**
 * Type definitions for admin accounts functionality
 * Contains all TypeScript interfaces and types used across the admin accounts module
 */

/**
 * Individual skin structure
 * Represents a single skin of a character
 */
export type Skin = {
  name: string; // Skin name (Thiên Tướng - Độ Ách, Lôi vệ...)
  rarity: string; // Rarity level (SS+ HỮU HẠN, A HỮU HẠN, S+, etc.)
  avatar: string; // Skin avatar image URL
  background: string; // Skin background image URL
};

/**
 * Character with skins structure
 * Represents a character and all their skins
 */
export type CharacterWithSkins = {
  name: string; // Character name (Goverra, Heino, Billow...)
  skins: Skin[]; // Array of skins for this character
};

/**
 * Character skins data structure
 * Main structure for storing all character skins
 */
export type CharacterSkinsData = CharacterWithSkins[];

/**
 * Selected skin structure for form
 * Represents a skin selected by user from the data
 * Field names must match the form field names
 */
export type SelectedSkin = {
  character: string; // Selected character name (matches form field name)
  skin: string; // Selected skin name (matches form field name)
  rarity: string; // Auto-filled rarity
  avatar: string; // Auto-filled avatar URL
  background: string; // Auto-filled background URL
};

/**
 * Form values for the account modal
 * Represents the data structure used in the admin account creation/update form
 */
export type ModalValues = {
  rank?: string; // Optional game rank
  price: number; // Account price in VND
  heroesCount: number; // Number of heroes owned
  skinsCount: number; // Number of skins owned
  status: "available" | "reserved" | "sold" | "hidden"; // Account status
  description?: string; // Optional account description
  imagesText?: string; // Hidden field for image URLs (comma-separated)

  // Additional metadata fields - now required
  level: number; // Account level (V, VI, VII, etc.) - now required
  matches: number; // Total number of matches played - now required
  winRate: number; // Win rate percentage (0-100) - now required
  reputation: number; // Account reputation score (0-100) - now required

  // Account credentials
  gameUsername?: string; // Game account username
  gamePassword?: string; // Game account password
  loginMethod?: string; // Login method (Facebook, Google, etc.)
  additionalInfo?: string; // Additional account information

  // Character skins - array of selected skins
  characterSkins?: SelectedSkin[];
};

/**
 * API submission payload type
 * Represents the data structure sent to the API
 */
export type SubmitPayload = {
  rank?: string;
  price: number;
  heroesCount: number;
  skinsCount: number;
  status: "available" | "reserved" | "sold" | "hidden";
  description?: string;
  images: string[];
  level: number;
  matches: number;
  winRate: number;
  reputation: number;
  gameUsername?: string; // Game account username
  gamePassword?: string; // Game account password
  loginMethod?: string; // Login method
  additionalInfo?: string; // Additional account information
  characterSkins: string | null; // JSON string or null
};

/**
 * Image item structure for image management
 * Represents a single image in the image management system
 */
export type ImageItem = {
  url: string; // Image URL (blob URL for preview or Cloudinary URL)
  file?: File; // Original file object (for new images)
  isNew: boolean; // Whether this is a newly uploaded image
};

/**
 * Cloudinary upload result
 * Structure returned by Cloudinary API after successful upload
 */
export type UploadResult = {
  url: string; // Cloudinary public ID
  name: string; // Original filename
};

/**
 * Admin account type for the accounts page
 * Represents account data structure used in admin interface
 */
export type AdminAccount = {
  id: string; // Unique account identifier
  rank?: string; // Optional game rank
  price: number; // Account price in VND
  heroesCount: number; // Number of heroes owned
  skinsCount: number; // Number of skins owned
  status: "available" | "reserved" | "sold" | "hidden"; // Account status
  description?: string; // Optional account description
  images: string[]; // Array of image URLs
  createdAt: string; // Account creation timestamp
  updatedAt: string; // Last update timestamp

  // Additional metadata fields
  level?: number; // Account level
  matches?: number; // Total number of matches played
  winRate?: number; // Win rate percentage
  reputation?: number; // Account reputation score
  characterSkins?: string; // JSON string containing character skins data
  
  // Account credentials
  gameUsername?: string; // Game account username
  gamePassword?: string; // Game account password (encrypted)
  loginMethod?: string; // Login method (Facebook, Google, etc.)
  additionalInfo?: string; // Additional account information
};
