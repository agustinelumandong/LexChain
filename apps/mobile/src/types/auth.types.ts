export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
};

export type SupabaseUserMetadata = {
  f_name?: string;
  l_name?: string;
};

export type SupabaseUser = {
  id: string;
  email?: string;
  role?: string;
  user_metadata?: SupabaseUserMetadata;
};
