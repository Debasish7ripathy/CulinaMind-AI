// Gemini API Configuration
// --------------------------------------------------
// Copy this file to env.ts and add your own API keys.
// Get your Gemini key at: https://aistudio.google.com/apikey
// --------------------------------------------------

const GEMINI_API_KEY =
  process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

export const config = {
  gemini: {
    apiKey: GEMINI_API_KEY,
    models: {
      flash: 'gemini-3-flash-preview',
      pro: 'gemini-3-pro-preview',
      image: 'gemini-3-pro-image-preview',
    },
  },
  revenueCat: {
    apiKey: 'YOUR_REVENUECAT_API_KEY_HERE',
    entitlementId: 'AIF Pro',
    products: {
      monthly: 'monthly',
      yearly: 'yearly',
      lifetime: 'lifetime',
    },
  },
} as const;
