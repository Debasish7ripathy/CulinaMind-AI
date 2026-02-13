/**
 * RevenueCat Service — CulinaMind AI
 * Handles SDK configuration, purchases, entitlements & offerings.
 * No native UI dependency — uses custom PaywallScreen instead.
 */

import Purchases, {
  LOG_LEVEL,
  PurchasesOffering,
  CustomerInfo,
  PurchasesPackage,
} from 'react-native-purchases';
import { Alert } from 'react-native';
import { config } from '../config/env';

const { apiKey, entitlementId } = config.revenueCat;

// ─── Initialisation ─────────────────────────────────────────────────

/**
 * Call once at app startup (inside App.tsx useEffect).
 * Must be called before any other RevenueCat APIs.
 */
export async function configureRevenueCat(appUserId?: string): Promise<void> {
  try {
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({
      apiKey,
      appUserID: appUserId || undefined,
    });

    console.log('[RevenueCat] Configured successfully');
  } catch (error) {
    console.error('[RevenueCat] Configuration error:', error);
  }
}

// ─── Customer Info ──────────────────────────────────────────────────

/**
 * Fetch the latest customer info from RevenueCat.
 */
export async function getCustomerInfo(): Promise<CustomerInfo> {
  return Purchases.getCustomerInfo();
}

/**
 * Check if the user has the "AIF Pro" entitlement.
 */
export async function checkProEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return typeof info.entitlements.active[entitlementId] !== 'undefined';
  } catch (error) {
    console.error('[RevenueCat] Entitlement check error:', error);
    return false;
  }
}

/**
 * Log in / identify a user (e.g. after sign-up or sign-in).
 */
export async function loginRevenueCat(userId: string): Promise<CustomerInfo> {
  const { customerInfo } = await Purchases.logIn(userId);
  return customerInfo;
}

/**
 * Log out / reset to anonymous user (e.g. after sign-out).
 */
export async function logoutRevenueCat(): Promise<CustomerInfo> {
  return Purchases.logOut();
}

// ─── Offerings & Products ───────────────────────────────────────────

/**
 * Get the current offering (contains packages: monthly, yearly, lifetime).
 */
export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch (error) {
    console.error('[RevenueCat] Get offerings error:', error);
    return null;
  }
}

/**
 * Get all available offerings.
 */
export async function getAllOfferings(): Promise<Record<string, PurchasesOffering>> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.all;
  } catch (error) {
    console.error('[RevenueCat] Get all offerings error:', error);
    return {};
  }
}

// ─── Purchases ──────────────────────────────────────────────────────

/**
 * Purchase a specific package.
 * Returns the updated CustomerInfo if successful, null if cancelled.
 */
export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<CustomerInfo | null> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo;
  } catch (error: any) {
    if (error.userCancelled) {
      console.log('[RevenueCat] User cancelled purchase');
      return null;
    }
    console.error('[RevenueCat] Purchase error:', error);
    throw error;
  }
}

/**
 * Restore previous purchases (e.g. new device).
 */
export async function restorePurchases(): Promise<CustomerInfo | null> {
  try {
    const info = await Purchases.restorePurchases();
    console.log('[RevenueCat] Purchases restored');
    return info;
  } catch (error) {
    console.error('[RevenueCat] Restore error:', error);
    Alert.alert('Restore Failed', 'Something went wrong. Please try again.');
    return null;
  }
}

// ─── Listener for real-time updates ─────────────────────────────────

/**
 * Register a listener for customer info changes.
 * Call this once at app startup to keep subscription state in sync.
 * Returns a remove function to unsubscribe.
 */
export function onCustomerInfoUpdated(
  callback: (info: CustomerInfo) => void,
): () => void {
  const listener = Purchases.addCustomerInfoUpdateListener(callback);
  return () => {
    if (listener && typeof listener === 'function') {
      (listener as () => void)();
    }
  };
}
