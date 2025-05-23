"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, FolderKanban, ArrowRight } from "lucide-react"
import { motion, useInView, useAnimation } from "framer-motion"

export default function Home() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, threshold: 0.2 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [controls, isInView])

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 xl:py-52 bg-gradient-to-b from-background to-background/80">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center space-y-8 text-center"
          >
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                Streamline Your Recruitment Process
              </h1>
              <p className="mx-auto max-w-[800px] text-foreground/80 text-lg md:text-xl lg:text-2xl">
                Recruit-Edge is a powerful automation platform that helps you manage resumes, schedule interviews, and
                assign projects with ease.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/resume-management">
                <Button size="lg" className="px-8 text-base">
                  Get Started
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-20 md:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Powerful Features</h2>
              <p className="mx-auto max-w-[800px] text-foreground/80 text-lg md:text-xl">
                Recruit-Edge offers a comprehensive suite of tools to streamline your recruitment process.
              </p>
            </div>
          </div>
          <motion.div
            ref={ref}
            variants={staggerContainer}
            initial="hidden"
            animate={controls}
            className="mx-auto grid gap-10 md:grid-cols-3 lg:gap-14"
          >
            <motion.div variants={fadeIn}>
              <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/5 border-border/30 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="h-2 bg-primary w-full"></div>
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FileText className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Resume Management</h3>
                    <p className="text-foreground/80 mb-6">
                      Upload and analyze resumes to extract candidate information with AI-powered processing.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground/70 mb-6">
                      <li>Bulk resume processing</li>
                      <li>AI-powered data extraction</li>
                      <li>Export results as CSV</li>
                    </ul>
                    <div className="mt-4">
                      <Link href="/resume-management">
                        <Button variant="ghost" className="group p-0 h-auto">
                          <span className="text-primary">Learn more</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/5 border-border/30 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="h-2 bg-primary w-full"></div>
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Calendar className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Interview Scheduling</h3>
                    <p className="text-foreground/80 mb-6">
                      Schedule and manage candidate interviews efficiently with automated email notifications.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground/70 mb-6">
                      <li>Automated email invitations</li>
                      <li>Calendar integration</li>
                      <li>Customizable time slots</li>
                    </ul>
                    <div className="mt-4">
                      <Link href="/interview-scheduling">
                        <Button variant="ghost" className="group p-0 h-auto">
                          <span className="text-primary">Learn more</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeIn}>
              <Card className="h-full transition-all hover:shadow-lg hover:shadow-primary/5 border-border/30 overflow-hidden group">
                <CardContent className="p-0">
                  <div className="h-2 bg-primary w-full"></div>
                  <div className="p-8">
                    <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <FolderKanban className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3">Project Management</h3>
                    <p className="text-foreground/80 mb-6">
                      Assign and manage projects based on employee skills and availability.
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-foreground/70 mb-6">
                      <li>Skill-based team assignment</li>
                      <li>Project tracking</li>
                      <li>Resource allocation</li>
                    </ul>
                    <div className="mt-4">
                      <Link href="/project-management">
                        <Button variant="ghost" className="group p-0 h-auto">
                          <span className="text-primary">Learn more</span>
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 text-primary" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 md:py-32 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <div className="space-y-3 max-w-3xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Recruitment Process?
              </h2>
              <p className="mx-auto max-w-[800px] text-foreground/80 text-lg md:text-xl">
                Start using Recruit-Edge today and experience the difference.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link href="/resume-management">
                <Button size="lg" className="px-8 text-base">
                  Get Started
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="px-8 text-base">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
