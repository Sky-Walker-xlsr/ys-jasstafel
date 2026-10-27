import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Anmelden · YS-Jasstafel" };

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
