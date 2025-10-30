"use client"

import { useState } from "react"
import { Check, Plus, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useSpecialties, type Specialty } from "@/hooks/use-specialties"
import { Spinner } from "@/components/ui/spinner"

interface SpecialtySelectorProps {
  selectedSpecialties: Specialty[]
  onSpecialtiesChange: (specialties: Specialty[]) => void
  maxSelection?: number
}

export function SpecialtySelector({
  selectedSpecialties,
  onSpecialtiesChange,
  maxSelection = 3
}: SpecialtySelectorProps) {
  const { specialties, isLoading, addCustomSpecialty } = useSpecialties()
  const [open, setOpen] = useState(false)
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customDescription, setCustomDescription] = useState("")
  const [isAddingCustom, setIsAddingCustom] = useState(false)

  const handleSelect = (specialty: Specialty) => {
    const isSelected = selectedSpecialties.some(s => s.id === specialty.id)
    
    if (isSelected) {
      onSpecialtiesChange(selectedSpecialties.filter(s => s.id !== specialty.id))
    } else {
      if (selectedSpecialties.length < maxSelection) {
        onSpecialtiesChange([...selectedSpecialties, specialty])
      }
    }
  }

  const handleRemove = (specialtyId: string) => {
    onSpecialtiesChange(selectedSpecialties.filter(s => s.id !== specialtyId))
  }

  const handleAddCustom = async () => {
    if (!customName.trim()) return

    setIsAddingCustom(true)
    const newSpecialty = await addCustomSpecialty(customName.trim(), customDescription.trim())
    
    if (newSpecialty && selectedSpecialties.length < maxSelection) {
      onSpecialtiesChange([...selectedSpecialties, newSpecialty])
    }
    
    setShowCustomDialog(false)
    setCustomName("")
    setCustomDescription("")
    setIsAddingCustom(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>التخصصات (اختر حتى {maxSelection})</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowCustomDialog(true)}
          disabled={selectedSpecialties.length >= maxSelection}
        >
          <Plus className="h-4 w-4 ml-1" />
          إضافة تخصص مخصص
        </Button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={selectedSpecialties.length >= maxSelection}
            type="button"
          >
            {selectedSpecialties.length > 0
              ? `تم اختيار ${selectedSpecialties.length} تخصص`
              : "اختر التخصصات..."}
            <Plus className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="ابحث عن تخصص..." />
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Spinner className="h-4 w-4" />
                  <span className="mr-2">جاري التحميل...</span>
                </div>
              ) : (
                "لا توجد نتائج"
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {specialties.map((specialty) => {
                const isSelected = selectedSpecialties.some(s => s.id === specialty.id)
                return (
                  <CommandItem
                    key={specialty.id}
                    onSelect={() => {
                      handleSelect(specialty)
                      if (!isSelected && selectedSpecialties.length + 1 >= maxSelection) {
                        setOpen(false)
                      }
                    }}
                  >
                    <Check
                      className={`ml-2 h-4 w-4 ${
                        isSelected ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{specialty.name}</div>
                      {specialty.description && (
                        <div className="text-xs text-muted-foreground">
                          {specialty.description}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedSpecialties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedSpecialties.map((specialty) => (
            <Badge
              key={specialty.id}
              variant="secondary"
              className="px-3 py-1.5 text-sm"
            >
              {specialty.name}
              <button
                type="button"
                onClick={() => handleRemove(specialty.id)}
                className="mr-1 rounded-full hover:bg-secondary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Custom Specialty Dialog */}
      <Dialog open={showCustomDialog} onOpenChange={setShowCustomDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إضافة تخصص مخصص</DialogTitle>
            <DialogDescription>
              أضف تخصصاً جديداً إذا لم تجده في القائمة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-name">اسم التخصص *</Label>
              <Input
                id="custom-name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="مثال: علم النفس الإيجابي"
              />
            </div>
            <div>
              <Label htmlFor="custom-description">الوصف (اختياري)</Label>
              <Textarea
                id="custom-description"
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="وصف مختصر للتخصص..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCustomDialog(false)
                setCustomName("")
                setCustomDescription("")
              }}
              disabled={isAddingCustom}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddCustom}
              disabled={!customName.trim() || isAddingCustom}
            >
              {isAddingCustom && <Spinner className="ml-2 h-4 w-4" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

