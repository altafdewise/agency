export default function AdminLoading() {
  return <div aria-label="Loading admin data" role="status" className="animate-pulse space-y-6"><div className="h-3 w-24 bg-foreground/10" /><div className="h-12 w-72 max-w-full bg-foreground/10" /><div className="h-4 w-96 max-w-full bg-foreground/10" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <div key={item} className="h-32 border border-border bg-foreground/[0.025]" />)}</div><div className="h-72 border border-border bg-foreground/[0.025]" /></div>;
}
