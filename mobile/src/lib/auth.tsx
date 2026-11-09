import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as api from "./api";
import { clearToken, readToken, saveToken } from "./session";
import { setProgressOwner } from "./storage";
import { resetTopics } from "./topics";

type AuthState = {
  user: api.User | null;
  loading: boolean; // true enquanto verifica se já existe um login salvo
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, serie: api.Serie) => Promise<void>;
  updateProfile: (changes: { serie?: api.Serie; name?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateToken: (token: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<api.User | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (token: string | null, u: api.User | null) => {
    api.setAuthToken(token);
    setProgressOwner(u?.id ?? null);
    resetTopics();
    setUser(u);
    if (token) await saveToken(token);
    else await clearToken();
  }, []);

  const signOut = useCallback(async () => {
    api.logout().catch(() => {});
    await applySession(null, null);
  }, [applySession]);

  // Ao abrir o app: recupera o login salvo e confere no servidor.
  useEffect(() => {
    api.setUnauthorizedHandler(() => applySession(null, null));
    (async () => {
      const token = await readToken();
      if (token) {
        api.setAuthToken(token);
        try {
          const { user: u } = await api.me();
          await applySession(token, u);
        } catch (e) {
          // Sem internet: mantém o token para tentar depois, mas pede login.
          if ((e as api.ApiError).status === 401) await applySession(null, null);
          else api.setAuthToken(null);
        }
      }
      setLoading(false);
    })();
    return () => api.setUnauthorizedHandler(null);
  }, [applySession]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const { token, user: u } = await api.login(email.trim(), password);
        await applySession(token, u);
      },
      signUp: async (name, email, password, serie) => {
        const { token, user: u } = await api.register(name.trim(), email.trim(), password, serie);
        await applySession(token, u);
      },
      signOut,
      updateProfile: async (changes) => {
        const { user: u } = await api.updateMe(changes);
        setUser(u);
      },
      updateToken: async (token) => {
        api.setAuthToken(token);
        await saveToken(token);
      },
    }),
    [user, loading, applySession, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
