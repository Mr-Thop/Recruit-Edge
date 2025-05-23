"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Clock, Upload, Download, Loader2, AlertCircle, Check, Info } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function InterviewScheduling() {
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState<string>("09:00")
  const [slotLength, setSlotLength] = useState<number>(30)
  const [breakTime, setBreakTime] = useState<number>(60)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.name.endsWith(".csv")) {
        setFile(selectedFile)
        setError(null)
        toast({
          title: "File selected",
          description: `${selectedFile.name} is ready for scheduling`,
        })
      } else {
        setError("Please upload a CSV file.")
        setFile(null)
        toast({
          title: "Invalid file format",
          description: "Please upload a CSV file with candidate information",
          variant: "destructive",
        })
      }
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please upload a CSV file with candidate information.")
      return
    }

    if (!date) {
      setError("Please select a start date for interviews.")
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccess(false)
    setDownloadUrl(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("start_date", `${format(date, "yyyy-MM-dd")} ${time}`)
      formData.append("slot_length", slotLength.toString())
      formData.append("break_time", breakTime.toString())

      const response = await fetch("https://mr-thop-recruit-edge.hf.space/api/schedule", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setSuccess(true)
      if (data.file_url) {
        setDownloadUrl(data.file_url)
      }

      toast({
        title: "Interviews scheduled",
        description: "Email invitations have been sent to all candidates",
        variant: "success",
      })
    } catch (err) {
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
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Interview Scheduling</h1>
              <p className="text-foreground/80 text-lg">
                Schedule interviews and send automated email invitations to candidates.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-error/10 border-error/20 text-error">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-success/10 border-success/20 text-success">
                <Check className="h-4 w-4" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Interviews have been scheduled successfully. Emails have been sent to the candidates.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-8 lg:grid-cols-2">
              <Card className="border-border/30 shadow-sm">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-base">Upload Candidate List</Label>
                      <div
                        className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                        onClick={triggerFileInput}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-primary/10">
                            <Upload className="h-8 w-8 text-primary" />
                          </div>
                          <p className="font-medium text-lg">{file ? file.name : "Click to upload a CSV file"}</p>
                          <p className="text-foreground/70">CSV should include Name, Email columns</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label className="text-base">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-foreground/70",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? format(date, "PPP") : "Select a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-base">Start Time</Label>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-foreground/70" />
                          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-3">
                        <Label htmlFor="slotLength" className="text-base">
                          Interview Slot Length (minutes)
                        </Label>
                        <Input
                          id="slotLength"
                          type="number"
                          min="15"
                          step="5"
                          value={slotLength}
                          onChange={(e) => setSlotLength(Number.parseInt(e.target.value) || 30)}
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="breakTime" className="text-base">
                          Lunch Break Duration (minutes)
                        </Label>
                        <Input
                          id="breakTime"
                          type="number"
                          min="30"
                          step="15"
                          value={breakTime}
                          onChange={(e) => setBreakTime(Number.parseInt(e.target.value) || 60)}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1 py-6 text-base" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          "Schedule Interviews"
                        )}
                      </Button>

                      {downloadUrl && (
                        <Button variant="outline" className="flex-1" onClick={() => window.open(downloadUrl)}>
                          <Download className="mr-2 h-4 w-4" />
                          Download Schedule
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {isLoading ? (
                <Card className="border-border/30 shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />

                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Skeleton className="h-5 w-5 rounded-full" />
                            </div>
                            <div className="flex-1">
                              <Skeleton className="h-5 w-full mb-2" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-border/30 shadow-sm">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-semibold mb-1">How It Works</h2>
                        <p className="text-foreground/70">Learn how the interview scheduling process works.</p>
                      </div>

                      <ol className="space-y-6">
                        <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            1
                          </div>
                          <div>
                            <h3 className="font-medium text-lg mb-1">Upload a CSV file</h3>
                            <p className="text-foreground/70">
                              Prepare a CSV file with candidate information including name and email address.
                            </p>
                          </div>
                        </li>

                        <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            2
                          </div>
                          <div>
                            <h3 className="font-medium text-lg mb-1">Set the schedule parameters</h3>
                            <p className="text-foreground/70">
                              Choose the start date and time for the interviews, along with the slot length and break
                              duration.
                            </p>
                          </div>
                        </li>

                        <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            3
                          </div>
                          <div>
                            <h3 className="font-medium text-lg mb-1">Schedule interviews</h3>
                            <p className="text-foreground/70">
                              Click "Schedule Interviews" to automatically generate interview slots and send email
                              invitations.
                            </p>
                          </div>
                        </li>

                        <li className="flex gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium shrink-0">
                            4
                          </div>
                          <div>
                            <h3 className="font-medium text-lg mb-1">Download the schedule</h3>
                            <p className="text-foreground/70">
                              Once scheduling is complete, download the schedule to view the complete interview
                              timetable.
                            </p>
                          </div>
                        </li>
                      </ol>

                      <Alert className="bg-primary/5 border-primary/10">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className="text-primary">Note</AlertTitle>
                        <AlertDescription className="text-foreground/80">
                          Interviews are scheduled between 9:00 AM and 4:00 PM with a lunch break at 12:30 PM. The
                          system automatically handles scheduling across multiple days if needed.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
