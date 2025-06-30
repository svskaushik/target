import { AppState, Platform } from "react-native";

import "react-native-get-random-values";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

class PlatformSecureStore {
	private isNative = Platform.OS === 'ios' || Platform.OS === 'android';
	
	private async _encrypt(key: string, value: string) {
		// Only use encryption on native platforms where SecureStore is available
		if (!this.isNative) {
			return value;
		}
		
		try {
			const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
			const cipher = new aesjs.ModeOfOperation.ctr(
				encryptionKey,
				new aesjs.Counter(1),
			);
			const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
			
			// Store the encryption key securely
			await SecureStore.setItemAsync(
				key,
				aesjs.utils.hex.fromBytes(encryptionKey),
			);
			
			return aesjs.utils.hex.fromBytes(encryptedBytes);
		} catch (error) {
			console.error('Error encrypting data:', error);
			// Fallback to plain text on error
			return value;
		}
	}
	
	private async _decrypt(key: string, value: string) {
		// Only attempt decryption on native platforms
		if (!this.isNative) {
			return value;
		}
		
		try {
			const encryptionKeyHex = await SecureStore.getItemAsync(key);
			if (!encryptionKeyHex) {
				return value; // Return value as-is if no encryption key found
			}
			
			const cipher = new aesjs.ModeOfOperation.ctr(
				aesjs.utils.hex.toBytes(encryptionKeyHex),
				new aesjs.Counter(1),
			);
			const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
			return aesjs.utils.utf8.fromBytes(decryptedBytes);
		} catch (error) {
			console.error('Error decrypting data:', error);
			// Return the value as-is if decryption fails
			return value;
		}
	}
	
	async getItem(key: string) {
		try {
			const stored = await AsyncStorage.getItem(key);
			if (!stored) {
				return stored;
			}
			return await this._decrypt(key, stored);
		} catch (error) {
			console.error('Error getting item from storage:', error);
			return null;
		}
	}
	
	async removeItem(key: string) {
		try {
			await AsyncStorage.removeItem(key);
			// Only attempt SecureStore cleanup on native platforms
			if (this.isNative) {
				await SecureStore.deleteItemAsync(key).catch(() => {
					// Ignore errors - key might not exist in SecureStore
				});
			}
		} catch (error) {
			console.error('Error removing item from storage:', error);
		}
	}
	
	async setItem(key: string, value: string) {
		try {
			const processed = await this._encrypt(key, value);
			await AsyncStorage.setItem(key, processed);
		} catch (error) {
			console.error('Error setting item in storage:', error);
			// Fallback to plain AsyncStorage
			await AsyncStorage.setItem(key, value);
		}
	}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: new PlatformSecureStore(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true, // Enable for automatic OAuth session detection
		flowType: 'pkce', // Use PKCE flow for secure authentication
		debug: process.env.NODE_ENV === 'development',
	},
	global: {
		headers: {
			'X-Client-Info': 'target-sheet-app',
		},
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
