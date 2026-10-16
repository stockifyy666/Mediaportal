import Link from "next/link";
import { AuthLayout } from "@/components/auth-layout";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join your media team. Your admin approves new accounts before you can sign in."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-fg hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
