"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Users, AlertCircle, Check, Briefcase, User } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface Project {
  id: number
  name: string
  description: string
}

interface TeamMember {
  id: number
  name: string
  role: string
  skills: string
  proficiency_level: number
}

interface TeamAssignment {
  frontend_developer: TeamMember | null
  backend_developer: TeamMember | null
  aiml_engineers: TeamMember[]
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [newProject, setNewProject] = useState({ name: "", description: "", required_skill: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [teamAssignment, setTeamAssignment] = useState<TeamAssignment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("https://mr-thop-recruit-edge.hf.space/api/projects")

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to fetch projects",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProject.name.trim() || !newProject.description.trim() || !newProject.required_skill.trim()) {
      setError("All fields are required")
      return
    }

    setIsCreating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch("https://mr-thop-recruit-edge.hf.space/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setSuccess("Project created successfully")
      setNewProject({ name: "", description: "", required_skill: "" })
      fetchProjects()
      setIsDialogOpen(false)

      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
        variant: "success",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create project",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleAssignTeam = async (projectId: number) => {
    setIsAssigning(true)
    setError(null)
    setSuccess(null)
    setTeamAssignment(null)

    try {
      const response = await fetch(`https://mr-thop-recruit-edge.hf.space/api/assign-team/${projectId}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`)
      }

      const data = await response.json()
      setTeamAssignment(data.assignments)
      setSuccess("Team assigned successfully")

      // Find and set the selected project
      const project = projects.find((p) => p.id === projectId) || null
      setSelectedProject(project)

      toast({
        title: "Team assigned",
        description: "Team members have been assigned to the project based on skills",
        variant: "success",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign team")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to assign team",
        variant: "destructive",
      })
    } finally {
      setIsAssigning(false)
    }
  }

  const renderSkillBadges = (skills: string) => {
    return skills.split(",").map((skill, index) => (
      <Badge key={index} variant="outline" className="bg-primary/5 text-primary border-primary/10">
        {skill.trim()}
      </Badge>
    ))
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
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-3 max-w-3xl">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Project Management</h1>
                <p className="text-foreground/80 text-lg">
                  Manage projects and assign team members based on skills and availability.
                </p>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="text-base">
                    <Plus className="mr-2 h-5 w-5" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Create New Project</DialogTitle>
                    <DialogDescription className="text-foreground/70 text-base">
                      Add a new project and specify the required skills.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateProject}>
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-base">
                          Project Name
                        </Label>
                        <Input
                          id="name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Enter project name"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-base">
                          Description
                        </Label>
                        <Textarea
                          id="description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Enter project description"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="required_skill" className="text-base">
                          Required Skills
                        </Label>
                        <Textarea
                          id="required_skill"
                          value={newProject.required_skill}
                          onChange={(e) => setNewProject({ ...newProject, required_skill: e.target.value })}
                          placeholder="Enter required skills (e.g., React, Node.js, Machine Learning)"
                          rows={3}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" size="lg" className="text-base" disabled={isCreating}>
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Project"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
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
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="projects" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="projects" className="text-base py-2 px-4">
                  Projects
                </TabsTrigger>
                <TabsTrigger value="team" className="text-base py-2 px-4">
                  Team Assignment
                </TabsTrigger>
              </TabsList>
              <TabsContent value="projects" className="space-y-6">
                {isLoading ? (
                  <Card className="border-border/30 shadow-sm">
                    <CardContent className="p-8">
                      <div className="space-y-4">
                        <Skeleton className="h-8 w-1/4" />
                        <div className="rounded-lg border border-border/30 overflow-hidden">
                          <div className="h-12 border-b border-border/30 px-4 flex items-center bg-primary/5">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-4 w-32 ml-8" />
                            <Skeleton className="h-4 w-64 ml-8" />
                            <Skeleton className="h-4 w-24 ml-auto" />
                          </div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 border-b border-border/30 px-4 flex items-center">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-4 w-32 ml-8" />
                              <Skeleton className="h-4 w-64 ml-8" />
                              <Skeleton className="h-8 w-32 ml-auto" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : projects.length > 0 ? (
                  <Card className="border-border/30 shadow-sm">
                    <CardContent className="p-0">
                      <div className="rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-primary/5 hover:bg-primary/5">
                              <TableHead className="font-medium">ID</TableHead>
                              <TableHead className="font-medium">Name</TableHead>
                              <TableHead className="font-medium">Description</TableHead>
                              <TableHead className="text-right font-medium">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <AnimatePresence>
                              {projects.map((project) => (
                                <TableRow key={project.id} className="group hover:bg-primary/5">
                                  <TableCell className="font-medium">{project.id}</TableCell>
                                  <TableCell>{project.name}</TableCell>
                                  <TableCell className="max-w-xs truncate">{project.description}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleAssignTeam(project.id)}
                                      disabled={isAssigning && selectedProject?.id === project.id}
                                      className="bg-primary/5 border-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
                                    >
                                      {isAssigning && selectedProject?.id === project.id ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      ) : (
                                        <Users className="mr-2 h-4 w-4" />
                                      )}
                                      Assign Team
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </AnimatePresence>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-border/30 shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-6 rounded-full bg-primary/10 mb-6">
                        <Briefcase className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">No projects found</h3>
                      <p className="text-foreground/70 max-w-md mb-6">
                        Create your first project to start assigning team members based on their skills.
                      </p>
                      <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Project
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              <TabsContent value="team" className="space-y-6">
                {selectedProject && teamAssignment ? (
                  <div className="grid gap-8 md:grid-cols-2">
                    <Card className="border-border/30 shadow-sm">
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                              <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-semibold mb-1">Project Details</h2>
                              <p className="text-foreground/70">Information about the selected project</p>
                            </div>
                          </div>

                          <div className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <h3 className="font-medium text-lg">Name</h3>
                              <p className="text-foreground/80 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                {selectedProject.name}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-medium text-lg">Description</h3>
                              <p className="text-foreground/80 bg-primary/5 p-3 rounded-lg border border-primary/10">
                                {selectedProject.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-border/30 shadow-sm">
                      <CardContent className="p-8">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-full bg-primary/10">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-semibold mb-1">Team Assignment</h2>
                              <p className="text-foreground/70">Team members assigned to this project</p>
                            </div>
                          </div>

                          <div className="space-y-6 mt-4">
                            <div className="space-y-3">
                              <h3 className="font-medium text-lg">Frontend Developer</h3>
                              {teamAssignment.frontend_developer ? (
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                  <p className="font-medium text-lg">{teamAssignment.frontend_developer.name}</p>
                                  <p className="text-foreground/70 mb-3">
                                    Role: {teamAssignment.frontend_developer.role}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {renderSkillBadges(teamAssignment.frontend_developer.skills)}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-muted/50 rounded-lg border border-border/30 text-foreground/60">
                                  No frontend developer assigned
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <h3 className="font-medium text-lg">Backend Developer</h3>
                              {teamAssignment.backend_developer ? (
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                  <p className="font-medium text-lg">{teamAssignment.backend_developer.name}</p>
                                  <p className="text-foreground/70 mb-3">
                                    Role: {teamAssignment.backend_developer.role}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {renderSkillBadges(teamAssignment.backend_developer.skills)}
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 bg-muted/50 rounded-lg border border-border/30 text-foreground/60">
                                  No backend developer assigned
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-lg">AI/ML Engineers</h3>
                                <Badge className="bg-primary/10 text-primary border-primary/20">
                                  {teamAssignment.aiml_engineers.length} assigned
                                </Badge>
                              </div>
                              {teamAssignment.aiml_engineers.length > 0 ? (
                                <div className="space-y-3">
                                  {teamAssignment.aiml_engineers.map((engineer, index) => (
                                    <div key={index} className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                      <p className="font-medium text-lg">{engineer.name}</p>
                                      <p className="text-foreground/70 mb-3">Role: {engineer.role}</p>
                                      <div className="flex flex-wrap gap-2">{renderSkillBadges(engineer.skills)}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 bg-muted/50 rounded-lg border border-border/30 text-foreground/60">
                                  No AI/ML engineers assigned
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card className="border-border/30 shadow-sm">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="p-6 rounded-full bg-primary/10 mb-6">
                        <Users className="h-12 w-12 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">
                        {isAssigning ? "Assigning team members..." : "No team assignment selected"}
                      </h3>
                      <p className="text-foreground/70 max-w-md mb-6">
                        {isAssigning ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Finding the best team members based on skills...
                          </span>
                        ) : (
                          "Please select a project and click 'Assign Team' to view team assignments."
                        )}
                      </p>
                      {!isAssigning && (
                        <Button variant="outline" onClick={() => document.getElementById("projects-tab")?.click()}>
                          View Projects
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
