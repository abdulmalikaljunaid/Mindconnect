import { useState, useEffect } from "react"
import { supabaseClient } from "@/lib/supabase-client"

export interface Specialty {
  id: string
  name: string
  slug: string
  description: string | null
}

export function useSpecialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabaseClient
        .from("specialties")
        .select("*")
        .order("name")

      if (error) throw error

      setSpecialties(data || [])
    } catch (err: any) {
      console.error("Error fetching specialties:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const addCustomSpecialty = async (name: string, description?: string): Promise<Specialty | null> => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      
      const { data, error } = await supabaseClient
        .from("specialties")
        .insert({
          name,
          slug,
          description: description || null
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setSpecialties(prev => [...prev, data])
        return data
      }
      
      return null
    } catch (err: any) {
      console.error("Error adding specialty:", err)
      return null
    }
  }

  return {
    specialties,
    isLoading,
    error,
    addCustomSpecialty,
    refetch: fetchSpecialties
  }
}

