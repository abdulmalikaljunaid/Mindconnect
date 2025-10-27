import { useEffect, useState } from "react"
import { supabaseClient } from "@/lib/supabase-client"
import type { Tables } from "@/lib/database.types"

export interface UserListItem {
  id: string
  name: string
  email: string | null
  role: Tables<"profiles">["role"]
  status: "active" | "pending" | "suspended"
  joinedDate: string | null
}

interface UsersResult {
  users: UserListItem[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useUsers(): UsersResult {
  const [users, setUsers] = useState<UserListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    const { data, error } = await supabaseClient
      .from("profiles")
      .select("id, name, role, is_approved, created_at, email")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
      setUsers([])
    } else {
      setUsers(
        (data ?? []).map((profile) => ({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          status: profile.is_approved ? "active" : "pending",
          joinedDate: profile.created_at,
        })),
      )
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    isLoading,
    error,
    refresh: fetchUsers,
  }
}
