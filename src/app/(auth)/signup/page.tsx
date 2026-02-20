import { AuthForm } from "@/components/auth/auth-form";
import { signupWithEmailAction } from "@/lib/auth/actions";

export default function SignupPage() {
  return (
    <AuthForm
      title="Create your Crypto Terminal account"
      subtitle="Sign up with email and password to unlock your secure dashboard."
      submitLabel="Create Account"
      action={signupWithEmailAction}
      alternateText="Already have an account?"
      alternateHref="/login"
      alternateLabel="Sign in"
    />
  );
}
