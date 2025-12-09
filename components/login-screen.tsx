"use client"

import type React from "react"
import { useState } from "react"
import { AuthLayout } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginScreenProps {
  onLogin: () => void
  onSignUpComplete?: () => void
  onForgotPassword?: () => void
}

export function LoginScreen({ onLogin, onSignUpComplete, onForgotPassword }: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState("")

  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [nameError, setNameError] = useState("")
  const [touched, setTouched] = useState({ email: false, password: false, name: false })

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

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required."
    }
    if (value.length < 6) {
      return "Password must be at least 6 characters."
    }
    return ""
  }

  const validateName = (value: string) => {
    if (!value.trim()) {
      return "Name is required."
    }
    return ""
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    if (touched.email) {
      setEmailError(validateEmail(value))
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPassword(value)
    if (touched.password) {
      setPasswordError(validatePassword(value))
    }
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    if (touched.name) {
      setNameError(validateName(value))
    }
  }

  const handleBlur = (field: "email" | "password" | "name") => {
    setTouched({ ...touched, [field]: true })

    if (field === "email") {
      setEmailError(validateEmail(email))
    } else if (field === "password") {
      setPasswordError(validatePassword(password))
    } else if (field === "name") {
      setNameError(validateName(name))
    }
  }

  const isFormValid = () => {
    const emailValid = validateEmail(email) === ""
    const passwordValid = validatePassword(password) === ""
    const nameValid = !isSignUp || validateName(name) === ""
    return emailValid && passwordValid && nameValid
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setTouched({ email: true, password: true, name: true })
    const emailErr = validateEmail(email)
    const passwordErr = validatePassword(password)
    const nameErr = isSignUp ? validateName(name) : ""

    setEmailError(emailErr)
    setPasswordError(passwordErr)
    setNameError(nameErr)

    if (emailErr || passwordErr || nameErr) {
      return
    }

    if (isSignUp) {
      console.log("[v0] Signing up with:", { name, email, password })
      if (onSignUpComplete) {
        onSignUpComplete()
      } else {
        onLogin()
      }
    } else {
      console.log("[v0] Logging in with:", { email, password })
      onLogin()
    }
  }

  const handleGitHubSSO = () => {
    console.log("[v0] Starting GitHub OAuth flow")
    setTimeout(() => {
      if (isSignUp && onSignUpComplete) {
        onSignUpComplete()
      } else {
        onLogin()
      }
    }, 1000)
  }

  const handleGoogleSSO = () => {
    console.log("[v0] Starting Google Workspace OAuth flow")
    setTimeout(() => {
      if (isSignUp && onSignUpComplete) {
        onSignUpComplete()
      } else {
        onLogin()
      }
    }, 1000)
  }

  return (
    <AuthLayout title="" subtitle={isSignUp ? "Create your account" : "Sign in to your account"}>
      <div className="space-y-2.5 mb-5">
        <Button type="button" variant="outline" className="w-full h-11 bg-transparent" onClick={handleGitHubSSO}>
          <Github className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
        <Button type="button" variant="outline" className="w-full h-11 bg-transparent" onClick={handleGoogleSSO}>
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google Workspace
        </Button>
      </div>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="your name"
              value={name}
              onChange={handleNameChange}
              onBlur={() => handleBlur("name")}
              className={cn(nameError && touched.name && "border-[#D92D20] border-[1.5px] bg-[#FFF6F6]")}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "name-error" : undefined}
            />
            <div className="min-h-[16px]">
              {nameError && touched.name && (
                <p id="name-error" className="text-xs font-medium text-[#D92D20] mt-1">
                  {nameError}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur("email")}
            className={cn(emailError && touched.email && "border-[#D92D20] border-[1.5px] bg-[#FFF6F6]")}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          <div className="min-h-[16px]">
            {emailError && touched.email && (
              <p id="email-error" className="text-xs font-medium text-[#D92D20] mt-1">
                {emailError}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur("password")}
            className={cn(passwordError && touched.password && "border-[#D92D20] border-[1.5px] bg-[#FFF6F6]")}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          <div className="min-h-[16px]">
            {passwordError && touched.password && (
              <p id="password-error" className="text-xs font-medium text-[#D92D20] mt-1">
                {passwordError}
              </p>
            )}
          </div>
        </div>
        {!isSignUp && (
          <button type="button" className="text-sm text-primary hover:underline" onClick={() => onForgotPassword?.()}>
            Forgot password?
          </button>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid()}
          title={!isFormValid() ? "Enter valid information to continue." : ""}
        >
          {isSignUp ? "Sign Up" : "Log In"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="text-primary">{isSignUp ? "Log in" : "Sign up"}</span>
        </button>
      </div>
    </AuthLayout>
  )
}
