import { redirect } from "next/navigation"

// The actual home is at /home
export default function UserIndexPage() {
  redirect("/home")
}
