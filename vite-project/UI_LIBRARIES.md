# UI Libraries Guide

This document explains all the UI enhancement libraries installed in this project and how to use them.

## 📦 Installed Libraries

### 1. **Tailwind CSS** (v4.2.1)
Utility-first CSS framework for rapid UI development.

**Usage**: Apply utility classes directly to elements
```tsx
<div className="flex items-center gap-4 p-6 bg-primary text-white rounded-lg">
  Content here
</div>
```

**Key Features**:
- Responsive design with breakpoints (`sm:`, `md:`, `lg:`, `xl:`)
- Flexbox and Grid utilities
- Spacing system (padding, margin)
- Colors via CSS variables
- Dark mode support with `dark:` prefix

**Documentation**: https://tailwindcss.com/docs

---

### 2. **shadcn/ui Components**
Beautiful, accessible component library built on Radix UI and Tailwind CSS.

**Available Components**:
- `Button` - Multiple variants (default, secondary, destructive, outline, ghost, link)
- `Card` - Card container with Header, Title, Description, Content, Footer
- `Input` - Styled text input
- `Label` - Form label
- `Textarea` - Styled multi-line text input
- `Select` - Styled dropdown select
- `Badge` - Status indicators and labels

**Usage Example**:
```tsx
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="default">Click Me</Button>
  </CardContent>
</Card>
```

**Button Variants**:
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="ghost">Subtle Action</Button>
```

**Documentation**: https://ui.shadcn.com/docs

---

### 3. **Lucide React** (v0.575.0)
Beautiful, consistent icon library with 1000+ icons.

**Usage**:
```tsx
import { CheckCircle2, XCircle, Upload, Download, Loader2 } from "lucide-react"

<CheckCircle2 className="h-6 w-6 text-green-500" />
<XCircle className="h-6 w-6 text-red-500" />
<Upload className="h-5 w-5" />
```

**Common Icons for Venue Vetting App**:
- `CheckCircle2` - Validation passed
- `XCircle` - Validation failed
- `AlertCircle` - Warning
- `Upload` - File upload
- `Download` - Export manifest
- `Loader2` - Loading spinner (add `animate-spin` class)
- `Eye` - Preview
- `Edit` - Edit data
- `Trash2` - Delete row
- `Plus` - Add row
- `ArrowLeft`, `ArrowRight` - Navigation

**Documentation**: https://lucide.dev/icons

---

### 4. **Framer Motion** (v12.34.3)
Animation library for smooth, professional transitions.

**Basic Usage**:
```tsx
import { motion } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Animated content
</motion.div>
```

**Common Patterns**:

**Fade In**:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

**Slide Up**:
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

**Scale**:
```tsx
<motion.div
  initial={{ scale: 0.8 }}
  animate={{ scale: 1 }}
>
```

**Stagger Children** (for lists):
```tsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: { transition: { staggerChildren: 0.1 } }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

**Documentation**: https://www.framer.com/motion/

---

### 5. **React Hot Toast** (v2.6.0)
Lightweight toast notification library.

**Setup** (already done in DemoComponents):
```tsx
import toast, { Toaster } from "react-hot-toast"

// Add once to your main component or App.tsx
<Toaster position="top-right" />
```

**Usage**:
```tsx
// Success
toast.success("Validation passed!")

// Error
toast.error("Validation failed. Please check your input.")

// Info/Default
toast("Processing your request...")

// Custom icon
toast("File uploaded!", { icon: "📁" })

// Promise-based (for async operations)
toast.promise(
  fetchData(),
  {
    loading: "Loading...",
    success: "Data loaded!",
    error: "Failed to load data"
  }
)
```

**Documentation**: https://react-hot-toast.com/docs

---

## 🎨 Theme Customization

The project uses CSS variables for theming. Modify colors in `src/index.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Primary blue */
  --secondary: 210 40% 96.1%;     /* Light gray */
  --destructive: 0 84.2% 60.2%;   /* Red */
  --success: 142 76% 36%;         /* Green (custom) */
  /* ... more colors */
}
```

---

## 🔧 Utility Functions

### `cn()` - Merge Tailwind Classes
Located in `src/lib/utils.ts`, combines `clsx` and `tailwind-merge` for conditional classes.

```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-classes",
  isPrimary && "bg-primary text-primary-foreground",
  isDisabled && "opacity-50 cursor-not-allowed"
)} />
```

---

## 🚀 Quick Start Examples

### Example 1: Enhanced Button with Icon
```tsx
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"

<Button>
  <Upload className="mr-2 h-4 w-4" />
  Upload Image
</Button>
```

### Example 2: Animated Card
```tsx
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <Card>
    <CardHeader>
      <CardTitle>Validation Results</CardTitle>
    </CardHeader>
    <CardContent>
      <p>All checkpoints passed!</p>
    </CardContent>
  </Card>
</motion.div>
```

### Example 3: Form with Toast Notification
```tsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

function MyForm() {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    if (!value) {
      toast.error("Please enter a value")
      return
    }
    toast.success("Form submitted successfully!")
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="input">Venue Name</Label>
        <Input
          id="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter venue name"
        />
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  )
}
```

### Example 4: Status Badge with Icon
```tsx
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

<div className="flex gap-2">
  <Badge variant="success" className="flex items-center gap-1">
    <CheckCircle2 className="h-3 w-3" />
    Passed
  </Badge>
  <Badge variant="destructive" className="flex items-center gap-1">
    <XCircle className="h-3 w-3" />
    Failed
  </Badge>
</div>
```

---

## 📂 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   └── badge.tsx
│   └── DemoComponents.tsx  # Demo showing all libraries
├── lib/
│   └── utils.ts         # cn() utility function
└── index.css            # Tailwind directives + theme variables
```

---

## 🎯 Recommended Migration Path

To update existing components to use the new libraries:

1. **Replace inline styles with Tailwind classes**
   - Before: `style={{ padding: '20px', backgroundColor: '#f0f0f0' }}`
   - After: `className="p-5 bg-gray-100"`

2. **Use shadcn/ui components instead of plain HTML elements**
   - Before: `<button style={{...}}>Click</button>`
   - After: `<Button variant="default">Click</Button>`

3. **Add icons to improve visual hierarchy**
   - Import from `lucide-react`
   - Use alongside text or buttons

4. **Wrap components with motion for smooth transitions**
   - Add `motion.div` wrapper with animation props
   - Use for step transitions, validation results

5. **Replace alert() with toast notifications**
   - Before: `alert("Success!")`
   - After: `toast.success("Success!")`

---

## 📝 Demo Component

A comprehensive demo is available in `src/components/DemoComponents.tsx`. To view it:

1. Import in your App.tsx:
   ```tsx
   import { DemoComponents } from './components/DemoComponents'
   ```

2. Render it:
   ```tsx
   <DemoComponents />
   ```

3. Explore all the examples and copy patterns you like!

---

## 🎓 Best Practices

1. **Consistency**: Use the same component variants across the app
2. **Accessibility**: shadcn/ui components are accessible by default
3. **Performance**: Framer Motion is optimized; animations won't impact performance
4. **Responsive**: Use Tailwind breakpoints for mobile-friendly design
5. **Dark Mode**: Theme supports dark mode with `.dark` class on `<html>`

---

## ⚠️ Important Notes

- All libraries are installed **locally** in this project only (in `node_modules/`)
- No global installations were made
- Other projects on your system are **not affected**
- Path aliases (`@/`) are configured in `tsconfig.app.json` and `vite.config.ts`
- Tailwind v4 is used (latest version with improved performance)

---

## 🔗 Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [Lucide Icons](https://lucide.dev/icons)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Hot Toast Docs](https://react-hot-toast.com/docs)
