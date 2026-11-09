import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Guarda o token de login: no celular usa o armazenamento seguro (Keychain/Keystore);
// na web, que não tem SecureStore, usa o armazenamento local do navegador.
const KEY = "estudeai.token";

export async function saveToken(token: string) {
  try {
    if (Platform.OS === "web") await AsyncStorage.setItem(KEY, token);
    else await SecureStore.setItemAsync(KEY, token);
  } catch {
    // sem armazenamento: o login vale só enquanto o app estiver aberto
  }
}

export async function readToken(): Promise<string | null> {
  try {
    return Platform.OS === "web" ? await AsyncStorage.getItem(KEY) : await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function clearToken() {
  try {
    if (Platform.OS === "web") await AsyncStorage.removeItem(KEY);
    else await SecureStore.deleteItemAsync(KEY);
  } catch {
    // nada a fazer
  }
}
