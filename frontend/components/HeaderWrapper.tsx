
"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  const hideHeaderRoutes = [
    "/user-profile",
  ];

  const shouldHideHeader = hideHeaderRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}
