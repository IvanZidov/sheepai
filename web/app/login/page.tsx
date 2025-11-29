import { AuthScreen } from '@/components/auth/auth-screen';
import { ShepherdNav } from '@/components/layout/shepherd-nav';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-emerald-500/20 selection:text-emerald-500 flex flex-col">
      <ShepherdNav />
      <main className="flex-1 flex items-center justify-center p-4">
        <AuthScreen />
      </main>
    </div>
  );
}

