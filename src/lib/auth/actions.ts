"use server";

import { redirect } from "next/navigation";
import { initialAuthActionState, type AuthActionState } from "@/types/auth";
import {
  signInWithEmailPassword,
  signOutCurrentUser,
  signUpWithEmailPassword,
} from "@/lib/auth/service";

function readCredentials(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  return { email, password };
}

function validateCredentials(email: string, password: string): string | null {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return "Please enter a valid email address.";
  }

  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}

export async function loginWithEmailAction(
  _prevState: AuthActionState = initialAuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { status: "error", message: validationError };
  }

  try {
    await signInWithEmailPassword({ email, password });
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Login failed. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function signupWithEmailAction(
  _prevState: AuthActionState = initialAuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const { email, password } = readCredentials(formData);
  const validationError = validateCredentials(email, password);

  if (validationError) {
    return { status: "error", message: validationError };
  }

  try {
    const { user, session } = await signUpWithEmailPassword({ email, password });

    if (!user) {
      return {
        status: "error",
        message: "Signup failed. Please verify your details and retry.",
      };
    }

    if (!session) {
      return {
        status: "success",
        message: "Account created. Check your inbox to confirm your email before logging in.",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Signup failed. Please try again.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOutCurrentUser();
  redirect("/login");
}
