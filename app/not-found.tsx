import { CloudOff } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="tint-card mx-auto mt-16 max-w-xl px-8 py-12 text-center">
      <p className="kicker">404</p>
      <h1 className="text-headline mt-3">This forecast doesn&apos;t exist</h1>
      <p className="text-subtitle mt-3">
        The page you&apos;re looking for has drifted off course. Check the URL, or head back to
        AeroWeather.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-accent active:scale-[0.98]"
      >
        <CloudOff className="size-4" strokeWidth={1.5} aria-hidden="true" />
        Back to AeroWeather
      </Link>
    </div>
  );
}
