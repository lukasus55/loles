import { redirect } from "next/navigation";

export default function LegacyNotesRedirectPage() {
  redirect("/matchups");
}
