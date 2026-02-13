// Gemini API Configuration
// --------------------------------------------------
// API keys are loaded from environment variables.
// For local dev:  create a .env file with EXPO_PUBLIC_GEMINI_API_KEY=your_key
// For EAS builds: run  eas secret:create --name EXPO_PUBLIC_GEMINI_API_KEY --value your_key
// Get your key at: https://aistudio.google.com/apikey
// --------------------------------------------------

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || '';

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
    apiKey: REVENUECAT_API_KEY,
    entitlementId: 'AIF Pro',
    products: {
      monthly: 'monthly',
      yearly: 'yearly',
      lifetime: 'lifetime',
    },
  },
} as const;
