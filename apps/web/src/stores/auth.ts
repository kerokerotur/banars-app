import { create } from "zustand";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setSession: (session: Session | null) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: true,

  setSession: (session) => {
    set({
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      isLoading: false,
    });
  },

  checkSession: async () => {
    try {
      set({ isLoading: true });
      const {
        data: { session },
      } = await supabase.auth.getSession();

      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        isLoading: false,
      });

      // セッション変更を監視
      supabase.auth.onAuthStateChange((_event, session) => {
        set({
          session,
          user: session?.user ?? null,
          isAuthenticated: !!session,
        });
      });
    } catch (error) {
      console.error("セッション確認エラー:", error);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
      });
    } catch (error) {
      console.error("ログアウトエラー:", error);
      throw error;
    }
  },
}));
