import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see today's tasks and your team's progress."
      footer={
        <>
          New to the team?{" "}
          <Link href="/signup" className="font-medium text-primary-fg hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
