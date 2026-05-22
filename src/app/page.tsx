import { redirect } from 'next/navigation';

/** App entry: send visitors straight to the login screen. */
export default function HomePage() {
  redirect('/login');
}
