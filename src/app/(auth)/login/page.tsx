import { AuthForm } from "@/components/auth/auth-form";
import { loginWithEmailAction } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <AuthForm
      title="Sign in to Crypto Terminal"
      subtitle="Access your analytics workspace with your email credentials."
      submitLabel="Sign In"
      action={loginWithEmailAction}
      alternateText="New here?"
      alternateHref="/signup"
      alternateLabel="Create account"
    />
  );
}
