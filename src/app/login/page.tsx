import { AuthLayout } from "@/components/auth-layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to see today's tasks and your team's progress."
      footer="Accounts are created by your admin. Ask them if you need access."
    >
      <LoginForm />
    </AuthLayout>
  );
}
