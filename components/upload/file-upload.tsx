"use client"

import { useState, useRef, DragEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>
  accept?: string
  maxSize?: number // in MB
  disabled?: boolean
}

export function FileUpload({ onUpload, accept = ".csv,.xlsx,.xls", maxSize = 10, disabled }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()
    const allowedExtensions = accept.split(",").map((ext) => ext.replace(".", "").trim())

    if (!allowedExtensions.includes(fileExtension || "")) {
      setErrorMessage(`Invalid file type. Allowed types: ${accept}`)
      setUploadStatus("error")
      return
    }

    // Validate file size
    const fileSizeMB = selectedFile.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      setErrorMessage(`File too large. Maximum size is ${maxSize}MB`)
      setUploadStatus("error")
      return
    }

    setFile(selectedFile)
    setUploadStatus("idle")
    setErrorMessage("")
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setUploadStatus("idle")
    setErrorMessage("")

    try {
      await onUpload(file)
      setUploadStatus("success")
      // Reset after 2 seconds
      setTimeout(() => {
        setFile(null)
        setUploadStatus("idle")
      }, 2000)
    } catch (error) {
      setUploadStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
    setUploadStatus("idle")
    setErrorMessage("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-0">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 transition-colors",
              isDragging && !disabled && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Upload className={cn("h-12 w-12 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />

            <div className="text-center">
              <p className="text-lg font-medium mb-1">
                {isDragging ? "Drop file here" : "Drag and drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">or</p>

              <Button type="button" variant="outline" onClick={handleBrowseClick} disabled={disabled}>
                Browse Files
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInputChange}
                className="hidden"
                disabled={disabled}
              />
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              Supported formats: {accept} • Max size: {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Selected File */}
      {file && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <File className="h-8 w-8 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {uploadStatus === "idle" && !uploading && (
                  <>
                    <Button onClick={handleUpload} disabled={disabled}>
                      Upload
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleRemove} disabled={disabled}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {uploading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                )}

                {uploadStatus === "success" && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Success!</span>
                  </div>
                )}

                {uploadStatus === "error" && (
                  <Button variant="ghost" size="icon" onClick={handleRemove}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {uploadStatus === "error" && errorMessage && (
              <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
