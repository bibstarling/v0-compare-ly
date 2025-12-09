"use client"

import type React from "react"
import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ForgotPasswordScreenProps {
  onBack: () => void
}

export function ForgotPasswordScreen({ onBack }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [touched, setTouched] = useState(false)

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email is required."
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      return "Enter a valid email address."
    }
    return ""
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched) {
      setEmailError(validateEmail(value))
    }
  }

  const handleBlur = () => {
    setTouched(true)
    setEmailError(validateEmail(email))
  }

  const isFormValid = () => {
    return validateEmail(email) === ""
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(true)
    const emailErr = validateEmail(email)
    setEmailError(emailErr)

    if (emailErr) {
      return
    }

    console.log("[v0] Sending password reset link to:", email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <AuthLayout title="" subtitle="">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a password reset link to
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-4 w-full">
            <Button onClick={onBack} className="w-full">
              Back to Log In
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Didn't receive the email? <span className="text-primary">Try again</span>
              </button>
            </div>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
      showBackButton
      onBack={onBack}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleBlur}
            className={cn(emailError && touched && "border-[#D92D20] border-[1.5px] bg-[#FFF6F6]")}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          <div className="min-h-[16px]">
            {emailError && touched && (
              <p id="email-error" className="text-xs font-medium text-[#D92D20] mt-1">
                {emailError}
              </p>
            )}
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid()}
          title={!isFormValid() ? "Enter a valid email to continue." : ""}
        >
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  )
}
