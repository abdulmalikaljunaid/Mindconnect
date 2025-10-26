export type UserRole = "patient" | "doctor" | "companion" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  approved?: boolean
  createdAt: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

// Mock auth functions - replace with real backend integration
export const authService = {
  async signUp(email: string, password: string, name: string, role: UserRole): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name,
      role,
      approved: role !== "doctor", // Doctors need approval
      createdAt: new Date().toISOString(),
    }

    // Store in localStorage for demo
    localStorage.setItem("user", JSON.stringify(user))
    return user
  },

  async signIn(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock user lookup
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      return JSON.parse(storedUser)
    }

    // Create a demo user if none exists
    const user: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name: email.split("@")[0],
      role: "patient",
      approved: true,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem("user", JSON.stringify(user))
    return user
  },

  async signOut(): Promise<void> {
    localStorage.removeItem("user")
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("user")
    return storedUser ? JSON.parse(storedUser) : null
  },
}
