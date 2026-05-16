import Link from 'next/link';

async function SupabaseHealthCheck() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
        <div className="font-semibold">Supabase connection: FAIL</div>
        <div className="mt-1 text-red-800">
          Missing <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> or{" "}
          <code className="font-mono">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
          </code>
          .
        </div>
      </div>
    );
  }

  const base = url.replace(/\/$/, '');
  const endpoint = `${base}/auth/v1/health`;

  let result:
    | { type: 'http'; ok: boolean; status: number }
    | { type: 'network_error'; message: string };

  try {
    const res = await fetch(endpoint, {
      cache: 'no-store',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    });

    result = { type: 'http', ok: res.ok, status: res.status };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    result = { type: 'network_error', message };
  }

  if (result.type === 'network_error') {
    return (
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-950">
        <div className="font-semibold">Supabase connection: FAIL</div>
        <div className="mt-1">
          Network error: <span className="font-mono">{result.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={[
        'mt-6 rounded-lg border p-4 text-sm',
        result.ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
          : 'border-red-200 bg-red-50 text-red-950',
      ].join(' ')}
    >
      <div className="font-semibold">
        Supabase connection: {result.ok ? 'OK' : 'FAIL'}
      </div>
      <div className="mt-1">
        <span className="font-mono">{endpoint}</span>
        <span className="mx-2 text-black/40">•</span>
        <span>
          HTTP <span className="font-mono">{result.status}</span>
        </span>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  return (
    <div>
      <nav className='mb-6 flex flex-wrap gap-4 text-sm font-medium'>
        <Link
          href='/pricing'
          className='text-foreground underline-offset-4 transition-colors hover:underline'
        >
          Pricing
        </Link>
        <Link
          href='/contact'
          className='text-foreground underline-offset-4 transition-colors hover:underline'
        >
          Contact
        </Link>
      </nav>
      <h1>Landing Page for Ginger</h1>
      <p>
        Ginger is an AI-powered platform for creating and sharing your
        flashcards.
      </p>

      <SupabaseHealthCheck />
    </div>
  );
}
