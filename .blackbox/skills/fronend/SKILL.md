
---
name: frontend
description: Generates clean, modular frontend components and application code in pure JavaScript and JSX, aligned with Expo and React web best practices.
---

# Frontend

## Instructions
When generating frontend code or troubleshooting UI issues, always adhere to the following guidelines:

1. **Language & Syntax:**
   * Write all code in pure **JavaScript (JS)** and **JSX**. Do not use TypeScript (TS/TSX).
   * For component documentation and validation, use standard **Prop-Types** if component specifications require prop validation.

2. **State Management & Data Fetching:** 
   * Use **Zustand** for lightweight, global client-side state. Keep stores modular and simple.
   * Use **TanStack Query (React Query)** for all server-side state, caching, and background data fetching.

3. **Routing & Navigation:**
   * For mobile (Expo/React Native), utilize **TanStack Router** using the file-based route tree generation approach.
   * Ensure routes match the file-based convention while keeping the implementations inside pure JS/JSX.

4. **UI & Component Styling:**
   * For web applications, prioritize **shadcn/ui** primitives styled with Tailwind CSS, adapted for standard JSX.
   * Keep components highly modular, reusable, and readable.
   * When designing authentication or security screens (like OTP inputs), default to a **4-digit verification code layout** rather than 6 digits.

## Examples

### 1. Expo + TanStack Router (JS/JSX Route Component)
```jsx
import * as React from 'react'
import { View, Text } from 'react-native'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardComponent,
})

function DashboardComponent() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-foreground">Welcome Back</Text>
    </View>
  )
}

```

### 2. Form Component with 4-Digit OTP Input (JSX + shadcn/ui style)

```jsx
import * as React from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export function VerifyOTPForm() {
  const { handleSubmit, setValue } = useForm({ defaultValues: { pin: "" } })

  const onSubmit = (data) => {
    // Handle verification logic via TanStack Query mutation
    console.log("Submitted PIN:", data.pin)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Enter 4-Digit Code</label>
        <InputOTP maxLength="{4}" onChange="{(val)"> setValue("pin", val)}>
          <InputOTPGroup>
            <InputOTPSlot index="{0}"/>
            <InputOTPSlot index="{1}"/>
            <InputOTPSlot index="{2}"/>
            <InputOTPSlot index="{3}"/>
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button type="submit">Verify Code</Button>
    </form>
  )
}

