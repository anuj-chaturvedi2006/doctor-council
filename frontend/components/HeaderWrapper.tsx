"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  if (pathname.startsWith("/user-profile")) {
    return null;
  }

  return <Header />;
}