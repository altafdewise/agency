/** The public site is light; the admin keeps the original dark token set. */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-dark min-h-[100dvh] bg-background text-foreground">
      {children}
    </div>
  );
}
