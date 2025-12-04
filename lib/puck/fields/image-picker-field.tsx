'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MediaPickerModal } from '@/components/media/media-picker-modal'
import { ImageIcon, X } from 'lucide-react'

interface ImagePickerFieldProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function ImagePickerField({ value, onChange, label }: ImagePickerFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelect = (files: any[]) => {
    if (files.length > 0) {
      onChange(files[0].url)
    }
  }

  const handleClear = () => {
    onChange('')
  }

  const isValidUrl = value && value.length > 0

  return (
    <div className="space-y-2">
      {/* Preview */}
      {isValidUrl && (
        <div className="relative rounded-md overflow-hidden border bg-muted">
          <img
            src={value}
            alt="Preview"
            className="w-full h-32 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* URL Input with browse button */}
      <div className="flex gap-2">
        <Input
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter image URL or browse library"
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          title="Browse Media Library"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleSelect}
        accept="image/*"
        multiple={false}
      />
    </div>
  )
}
