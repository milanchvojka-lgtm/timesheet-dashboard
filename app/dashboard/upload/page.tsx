"use client"

import { useState, useEffect } from "react"
import { FileUpload } from "@/components/upload/file-upload"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, AlertTriangle, Clock, FileText, Calendar, User } from "lucide-react"

interface UploadResult {
  success: boolean
  message: string
  result: {
    upload_id: string
    total_rows: number
    successful_rows: number
    failed_rows: number
    data_date_from: string | null
    data_date_to: string | null
  }
}

interface UploadHistory {
  id: string
  filename: string
  file_size: number
  uploaded_by_email: string
  uploaded_by_name: string | null
  total_rows: number
  successful_rows: number
  failed_rows: number
  status: string
  data_date_from: string | null
  data_date_to: string | null
  created_at: string
}

export default function UploadPage() {
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadHistory, setUploadHistory] = useState<UploadHistory[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)

  useEffect(() => {
    fetchUploadHistory()
  }, [])

  const fetchUploadHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch("/api/upload/history")
      if (response.ok) {
        const data = await response.json()
        setUploadHistory(data.history || [])
      }
    } catch (error) {
      console.error("Failed to fetch upload history:", error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleUpload = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload/timesheet", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || data.error || "Upload failed")
    }

    setUploadResult(data)
    // Refresh history
    fetchUploadHistory()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "partial":
        return <Badge className="bg-yellow-500">Partial</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDateRange = (from: string | null, to: string | null) => {
    if (!from && !to) return "N/A"
    if (from === to) return new Date(from!).toLocaleDateString()
    return `${from ? new Date(from).toLocaleDateString() : "?"} - ${to ? new Date(to).toLocaleDateString() : "?"}`
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Timesheet Data</h1>
        <p className="text-muted-foreground">
          Upload CSV or Excel files exported from Costlocker
        </p>
      </div>

      {/* Instructions */}
      <Alert className="mb-6">
        <FileText className="h-4 w-4" />
        <AlertTitle>How to export from Costlocker:</AlertTitle>
        <AlertDescription className="mt-2 space-y-1">
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Costlocker → Timesheet view</li>
            <li>Select desired date range</li>
            <li>Export to CSV or Excel format</li>
            <li>Upload the exported file below</li>
          </ol>
        </AlertDescription>
      </Alert>

      {/* File Upload */}
      <div className="mb-8">
        <FileUpload onUpload={handleUpload} accept=".csv,.xlsx,.xls" maxSize={10} />
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <Alert className={uploadResult.success ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          {uploadResult.success ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertTitle className={uploadResult.success ? "text-green-900" : "text-red-900"}>
            {uploadResult.success ? "Upload Successful!" : "Upload Failed"}
          </AlertTitle>
          <AlertDescription className={uploadResult.success ? "text-green-800" : "text-red-800"}>
            <p className="mb-2">{uploadResult.message}</p>
            {uploadResult.result && (
              <div className="text-sm space-y-1">
                <p>Total rows: {uploadResult.result.total_rows}</p>
                <p>Successful: {uploadResult.result.successful_rows}</p>
                {uploadResult.result.failed_rows > 0 && (
                  <p className="font-medium">Failed: {uploadResult.result.failed_rows}</p>
                )}
                {uploadResult.result.data_date_from && uploadResult.result.data_date_to && (
                  <p>
                    Date range: {formatDateRange(uploadResult.result.data_date_from, uploadResult.result.data_date_to)}
                  </p>
                )}
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Separator className="my-8" />

      {/* Upload History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Upload History</h2>

        {isLoadingHistory ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        ) : uploadHistory.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No uploads yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {uploadHistory.map((upload) => (
              <Card key={upload.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {upload.filename}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {upload.uploaded_by_name || upload.uploaded_by_email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(upload.created_at)}
                        </span>
                      </CardDescription>
                    </div>
                    {getStatusBadge(upload.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Rows</p>
                      <p className="font-medium">{upload.total_rows}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Successful</p>
                      <p className="font-medium text-green-600">{upload.successful_rows}</p>
                    </div>
                    {upload.failed_rows > 0 && (
                      <div>
                        <p className="text-muted-foreground">Failed</p>
                        <p className="font-medium text-red-600">{upload.failed_rows}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Date Range
                      </p>
                      <p className="font-medium">
                        {formatDateRange(upload.data_date_from, upload.data_date_to)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
