import Link from "next/link";

export default function PricingPage() {
  return (
    <div>
      <nav className="mb-6">
        <Link
          href="/"
          className="text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline"
        >
          ← Back to home
        </Link>
      </nav>
      <p>PricingPage</p>
    </div>
  );
}
