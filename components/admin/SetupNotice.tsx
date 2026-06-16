export function SetupNotice({
  title = "Supabase is not connected yet.",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className="min-h-[100dvh] px-6 py-28 sm:px-10">
      <section className="mx-auto max-w-2xl">
        <p className="eyebrow">Admin setup</p>
        <h1 className="headline-md mt-5 text-balance">{title}</h1>
        <div className="mt-8 space-y-4 text-base font-light leading-relaxed text-muted">
          {children ?? (
            <>
              <p>
                Add your Supabase URL and publishable key to `.env.local`, then
                run the SQL migration in `supabase/migrations`.
              </p>
              <p>
                The public site still works while this is missing; admin routes
                stay in setup mode.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
