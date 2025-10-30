"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "mindconnect_saved_emails"
const MAX_SAVED_EMAILS = 5

export function useEmailSuggestions() {
  const [savedEmails, setSavedEmails] = useState<string[]>([])

  useEffect(() => {
    // Load saved emails from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const emails = JSON.parse(stored) as string[]
        setSavedEmails(emails)
      }
    } catch (error) {
      console.error("Error loading saved emails:", error)
    }
  }, [])

  const saveEmail = (email: string) => {
    if (!email || !email.includes("@")) return

    try {
      const emails = savedEmails.filter((e) => e !== email)
      const updated = [email, ...emails].slice(0, MAX_SAVED_EMAILS)
      setSavedEmails(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving email:", error)
    }
  }

  const removeEmail = (email: string) => {
    try {
      const updated = savedEmails.filter((e) => e !== email)
      setSavedEmails(updated)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.error("Error removing email:", error)
    }
  }

  return {
    savedEmails,
    saveEmail,
    removeEmail,
  }
}




