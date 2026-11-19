
"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "./header";

function HeaderWrapperContent() {
  const pathname = usePathname();

  const hideHeaderRoutes = ["/user-profile"];

  const shouldHideHeader = hideHeaderRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  if (shouldHideHeader) {
    return null;
  }

  return <Header />;
}

export default function HeaderWrapper() {
  return (
    <Suspense fallback={null}>
      <HeaderWrapperContent />
    </Suspense>
  );
}
