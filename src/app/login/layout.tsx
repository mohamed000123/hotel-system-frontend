import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign in — Hotel Booking',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">{children}</div>
  );
}
