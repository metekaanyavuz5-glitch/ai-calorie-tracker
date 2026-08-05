import Navbar from "@/components/Navbar";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Navbar />
      <main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">
            Yemek fotoğrafını analiz et, kalori ve besin değerlerini öğren.
          </p>
          <AuthForm />
        </div>
      </main>
    </div>
  );
}
