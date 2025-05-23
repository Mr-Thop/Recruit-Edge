"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, Upload, Download, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ResumeManagement() {
  const [files, setFiles] = useState<File[]>([])
  const [prompt, setPrompt] = useState("")
  const [openings, setOpenings] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files).filter((file) => file.type === "application/pdf")
      setFiles(fileArray)
      if (fileArray.length > 0) {
        toast({
          title: "Files selected",
          description: `${fileArray.length} resume${fileArray.length > 1 ? "s" : ""} ready for analysis`,
        })
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files).filter((file) => file.type === "application/pdf")
      setFiles(fileArray)
      if (fileArray.length > 0) {
        toast({
          title: "Files dropped",
          description: `${fileArray.length} resume${fileArray.length > 1 ? "s" : ""} ready for analysis`,
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      setError("Please upload at least one resume file.")
      return
    }

    if (!prompt.trim()) {
      setError("Please enter a job description.")
      return
    }

    setIsLoading(true)
    setProgress(0)
    setError(null)

    // Create a progress simulation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + 5
      })
    }, 500)

    try {
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("openings", openings.toString())

      files.forEach((file) => {
        formData.append("resumes", file)
      })

      const response = await fetch("https://mr-thop-recruit-edge.hf.space/process_resumes", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: "Analysis complete",
        description: `Found ${data.candidates.length} matching candidates for ${data.job_role}`,
        variant: "success",
      })
    } catch (err) {
      clearInterval(progressInterval)
      setError(err instanceof Error ? err.message : "An unknown error occurred")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCSV = () => {
    if (!results) return

    const candidates = results.candidates
    const headers = ["Name", "Email", "Phone", "Skills", "Experience", "Education", "Match Score"]

    let csvContent = headers.join(",") + "\n"

    candidates.forEach((candidate: any) => {
      const row = [
        candidate.Name || "",
        candidate.Email || "",
        candidate.output || "",
        extractRating(candidate.output) || "",
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")

      csvContent += row + "\n"
    })

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "resume_analysis_results.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Download started",
      description: "Your CSV file is being downloaded",
    })
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const extractRating = (outputText: string): string => {
    if (!outputText) return "0"

    // Look for patterns like "7.5/10" or "7.7/10"
    const ratingRegex = /(\d+\.\d+)\/10/
    const match = outputText.match(ratingRegex)

    if (match && match[1]) {
      // Convert to percentage (e.g., 7.5/10 -> 75%)
      const rating = Number.parseFloat(match[1])
      return (rating * 10).toFixed(0)
    }

    return "0"
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="py-12 md:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container"
        >
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3 max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Resume Management</h1>
              <p className="text-foreground/80 text-lg">
                Upload resumes and extract candidate information using AI-powered analysis.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-error/10 border-error/20 text-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-border/30 shadow-sm">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div
                      className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                      onClick={triggerFileInput}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-primary/10">
                          <Upload className="h-8 w-8 text-primary" />
                        </div>
                        <p className="font-medium text-lg">Drag and drop files here or click to browse</p>
                        <p className="text-foreground/70">Supports PDF files only</p>
                      </div>
                    </div>

                    {files.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">Selected Files ({files.length})</p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles([])}
                            className="text-foreground/70 hover:text-foreground"
                          >
                            Clear all
                          </Button>
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                          <AnimatePresence>
                            {files.map((file, index) => (
                              <motion.div
                                key={`${file.name}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 text-sm p-3 bg-primary/5 rounded-lg"
                              >
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="truncate flex-1">{file.name}</span>
                                <span className="text-foreground/60 text-xs">{(file.size / 1024).toFixed(0)} KB</span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <Label htmlFor="prompt" className="text-base">
                        Job Description
                      </Label>
                      <Textarea
                        id="prompt"
                        placeholder="Enter the job description and requirements..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        required
                        className="resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="openings" className="text-base">
                        Number of Openings
                      </Label>
                      <Input
                        id="openings"
                        type="number"
                        min="1"
                        value={openings}
                        onChange={(e) => setOpenings(Number.parseInt(e.target.value) || 1)}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full py-6 text-base" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Analyze Resumes"
                      )}
                    </Button>

                    {isLoading && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Processing resumes...</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card className="border-border/30 shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>

                      <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="grid grid-cols-2 gap-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Skeleton className="h-6 w-1/3" />
                        <div className="rounded-md border border-border/30">
                          <div className="h-10 border-b border-border/30 px-4 flex items-center">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-4 w-1/4 ml-auto" />
                            <Skeleton className="h-4 w-1/4 ml-auto" />
                          </div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-14 border-b border-border/30 px-4 flex items-center">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-1/4 ml-auto" />
                              <Skeleton className="h-4 w-1/4 ml-auto" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : results ? (
                <Card className="border-border/30 shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold mb-1">Analysis Results</h2>
                          <p className="text-foreground/70">Showing top candidates for {results.job_role}</p>
                        </div>
                        <Button variant="outline" onClick={handleDownloadCSV}>
                          <Download className="mr-2 h-4 w-4" />
                          Download CSV
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Job Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <div>
                            <p className="text-sm text-foreground/70 mb-1">Role</p>
                            <p className="font-medium">{results.job_role}</p>
                          </div>
                          <div>
                            <p className="text-sm text-foreground/70 mb-1">Required Skills</p>
                            <div className="flex flex-wrap gap-2">
                              {results.job_skills.split(",").map((skill: string, idx: number) => (
                                <Badge
                                  key={idx}
                                  variant="outline"
                                  className="bg-primary/10 text-primary border-primary/20"
                                >
                                  {skill.trim()}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="md:col-span-2">
                            <p className="text-sm text-foreground/70 mb-1">Description</p>
                            <p className="text-sm">{results.description}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">Top Candidates</h3>
                          <Badge className="bg-success/10 text-success border-success/20">
                            {results.candidates.length} matches found
                          </Badge>
                        </div>
                        <div className="rounded-lg border border-border/30 overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-primary/5 hover:bg-primary/5">
                                <TableHead className="font-medium">Name</TableHead>
                                <TableHead className="font-medium">Email</TableHead>
                                <TableHead className="font-medium">Evaluation</TableHead>
                                <TableHead className="font-medium text-right">Match Score</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <AnimatePresence>
                                {results.candidates.map((candidate: any, index: number) => (
                                  <TableRow
                                    key={index}
                                    className="group hover:bg-primary/5 cursor-pointer"
                                    onClick={() => setSelectedCandidate(candidate)}
                                  >
                                    <TableCell className="font-medium">{candidate.Name}</TableCell>
                                    <TableCell>{candidate.Email}</TableCell>
                                    <TableCell>
                                      <div className="max-w-xs truncate text-sm text-foreground/70">
                                        {candidate.output.substring(0, 100)}...
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex flex-col items-end gap-1">
                                        <Badge
                                          className={`
                                            ${
                                              Number.parseInt(extractRating(candidate.output)) >= 80
                                                ? "bg-success/10 text-success border-success/20"
                                                : Number.parseInt(extractRating(candidate.output)) >= 60
                                                  ? "bg-secondary/10 text-secondary border-secondary/20"
                                                  : "bg-error/10 text-error border-error/20"
                                            }
                                          `}
                                        >
                                          {extractRating(candidate.output)}%
                                        </Badge>
                                        <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                          <div
                                            className={`h-full ${
                                              Number.parseInt(extractRating(candidate.output)) >= 80
                                                ? "bg-success"
                                                : Number.parseInt(extractRating(candidate.output)) >= 60
                                                  ? "bg-secondary"
                                                  : "bg-error"
                                            }`}
                                            style={{ width: `${extractRating(candidate.output)}%` }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </AnimatePresence>
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/30 shadow-sm">
                  <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full">
                    <div className="p-6 rounded-full bg-primary/10 mb-6">
                      <FileText className="h-12 w-12 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No Analysis Results Yet</h3>
                    <p className="text-foreground/70 max-w-md mb-6">
                      Upload resumes and provide a job description to see AI-powered candidate matching results here.
                    </p>
                    <Button variant="outline" onClick={triggerFileInput}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resumes
                    </Button>
                  </CardContent>
                </Card>
              )}
              {selectedCandidate && (
                <Dialog open={!!selectedCandidate} onOpenChange={() => setSelectedCandidate(null)}>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">{selectedCandidate.Name}</DialogTitle>
                      <DialogDescription className="text-foreground/70 text-base">
                        {selectedCandidate.Email}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Match Score</h3>
                        <Badge
                          className={`
                            ${
                              Number.parseInt(extractRating(selectedCandidate.output)) >= 80
                                ? "bg-success/10 text-success border-success/20"
                                : Number.parseInt(extractRating(selectedCandidate.output)) >= 60
                                  ? "bg-secondary/10 text-secondary border-secondary/20"
                                  : "bg-error/10 text-error border-error/20"
                            }
                          `}
                        >
                          {extractRating(selectedCandidate.output)}%
                        </Badge>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-6">
                        <div
                          className={`h-full ${
                            Number.parseInt(extractRating(selectedCandidate.output)) >= 80
                              ? "bg-success"
                              : Number.parseInt(extractRating(selectedCandidate.output)) >= 60
                                ? "bg-secondary"
                                : "bg-error"
                          }`}
                          style={{ width: `${extractRating(selectedCandidate.output)}%` }}
                        />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Evaluation</h3>
                        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 whitespace-pre-wrap">
                          {selectedCandidate.output}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => setSelectedCandidate(null)}>Close</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
