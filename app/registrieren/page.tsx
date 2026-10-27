import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Registrieren", robots: { index: false, follow: true } };

export default function RegisterPage() {
  return <AuthForm mode="signup" />;
}
