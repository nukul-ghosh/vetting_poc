import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, AlertCircle, Loader2, Upload, Download } from "lucide-react"
import { motion } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"

/**
 * Demo component showcasing all the new UI libraries:
 * - Tailwind CSS for styling
 * - shadcn/ui components
 * - Lucide React icons
 * - Framer Motion animations
 * - React Hot Toast notifications
 */
export function DemoComponents(): React.ReactElement {
  const handleSuccess = (): void => {
    toast.success("Operation completed successfully!")
  }

  const handleError = (): void => {
    toast.error("Something went wrong!")
  }

  const handleInfo = (): void => {
    toast("This is an info message", {
      icon: "ℹ️",
    })
  }

  return (
    <div className="container mx-auto p-8 space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2">UI Components Demo</h1>
        <p className="text-muted-foreground">
          Showcasing Tailwind CSS, shadcn/ui, Lucide icons, Framer Motion, and React Hot Toast
        </p>
      </motion.div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Different button variants and sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading
          </Button>
        </CardContent>
      </Card>

      {/* Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Lucide Icons</CardTitle>
          <CardDescription>Beautiful, consistent icons</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            <span>Error</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-yellow-500" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-500" />
            <span>Upload</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-6 w-6 text-blue-500" />
            <span>Download</span>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
          <CardDescription>Status indicators and labels</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Input fields with proper styling</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter your email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter a description" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="direction">Direction</Label>
            <Select id="direction">
              <option value="">Select direction</option>
              <option value="facing_stage">Facing Stage</option>
              <option value="facing_away">Facing Away</option>
              <option value="side_view">Side View</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>User feedback with toast messages</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button onClick={handleSuccess} variant="default">
            Show Success
          </Button>
          <Button onClick={handleError} variant="destructive">
            Show Error
          </Button>
          <Button onClick={handleInfo} variant="secondary">
            Show Info
          </Button>
        </CardContent>
      </Card>

      {/* Framer Motion */}
      <Card>
        <CardHeader>
          <CardTitle>Framer Motion Animations</CardTitle>
          <CardDescription>Smooth animations and transitions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 bg-primary text-primary-foreground rounded-md"
          >
            Slide in from left
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-4 bg-secondary text-secondary-foreground rounded-md"
          >
            Scale animation
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-4 bg-accent text-accent-foreground rounded-md"
          >
            Slide up with delay
          </motion.div>
        </CardContent>
      </Card>
    </div>
  )
}
