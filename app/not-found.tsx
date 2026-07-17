import Link from "next/link";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { twCtaPrimaryMotion } from "@/lib/motion-styles";
import { uiCtaPrimarySurfaceRoundedXl } from "@/lib/ui-classes";

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        role="main"
        tabIndex={-1}
        className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-6 pb-20 pt-32 text-center"
      >
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">
          404
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">
          Page not found
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600">
          This page may have moved. Return home to browse GoGoCash partners,
          guides, and cashback resources.
        </p>
        <Link
          href="/"
          className={`mt-8 px-6 py-3 text-sm ${uiCtaPrimarySurfaceRoundedXl} ${twCtaPrimaryMotion}`}
        >
          Back to home
        </Link>
      </main>
      <Footer />
    </>
  );
}
