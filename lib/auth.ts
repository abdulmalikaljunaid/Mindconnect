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

    // Store user in users collection
    const users = this.getAllUsers()
    users[user.id] = user
    localStorage.setItem("users", JSON.stringify(users))
    
    // Set as current user
    localStorage.setItem("currentUser", JSON.stringify(user))
    return user
  },

  async signIn(email: string, password: string, userType: "user" | "doctor"): Promise<User> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Get all users
    const users = this.getAllUsers()
    
    // Find user by email
    const user = Object.values(users).find(u => u.email === email)
    
    if (user) {
      // Check if user type matches
      const isDoctor = user.role === "doctor" || user.role === "admin"
      const isUser = user.role === "patient" || user.role === "companion"
      
      if ((userType === "doctor" && !isDoctor) || (userType === "user" && !isUser)) {
        throw new Error("نوع الحساب غير صحيح")
      }
      
      // Set as current user
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }

    // If no user found, create a demo user based on type
    const role = userType === "doctor" ? "doctor" : "patient"
    const newUser: User = {
      id: Math.random().toString(36).substring(7),
      email,
      name: email.split("@")[0],
      role,
      approved: role !== "doctor",
      createdAt: new Date().toISOString(),
    }

    // Store in users collection
    users[newUser.id] = newUser
    localStorage.setItem("users", JSON.stringify(users))
    localStorage.setItem("currentUser", JSON.stringify(newUser))
    return newUser
  },

  async signOut(): Promise<void> {
    localStorage.removeItem("currentUser")
  },

  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null
    const storedUser = localStorage.getItem("currentUser")
    return storedUser ? JSON.parse(storedUser) : null
  },

  getAllUsers(): Record<string, User> {
    if (typeof window === "undefined") return {}
    const storedUsers = localStorage.getItem("users")
    return storedUsers ? JSON.parse(storedUsers) : {}
  },

  // Helper method to check if user exists
  async checkUserExists(email: string): Promise<boolean> {
    const users = this.getAllUsers()
    return Object.values(users).some(u => u.email === email)
  },
}
