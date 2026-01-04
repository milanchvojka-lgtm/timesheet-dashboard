import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await auth()

  // Redirect authenticated users to overview
  if (session) {
    redirect("/overview")
  }

  // Redirect unauthenticated users to login
  redirect("/login")
}
