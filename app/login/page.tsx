"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, LogIn, AlertCircle } from "lucide-react";
import { Button, Input, Card, Form } from "@heroui/react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await authClient.signIn.email({
      email: email || "admin@example.com",
      password: password,
    });

    if (error) {
      setError(error.message || "Invalid password");
    } else {
      router.push("/");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Lock size={32} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Welcome Back
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            Enter the admin password to access the billing dashboard.
          </p>
        </div>

        <Card className="w-full shadow-xl shadow-black/5 dark:shadow-black/40 border border-zinc-200 dark:border-zinc-800">
          <Card.Content className="p-8">
            <Form
              onSubmit={handleLogin}
              className="space-y-6 w-full flex flex-col"
            >
              <div className="w-full space-y-4">
                <div className="w-full">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Email Address (Optional)
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="w-full">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Admin Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className="w-full"
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full bg-danger-50 text-danger-500 text-sm p-3 rounded-lg flex items-center gap-2 border border-danger-200 dark:bg-danger-500/10 dark:border-danger-500/20"
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full font-medium"
                isDisabled={loading}
              >
                {loading ? (
                  "Logging in..."
                ) : (
                  <>
                    Log in to Dashboard
                    <LogIn size={18} />
                  </>
                )}
              </Button>
            </Form>
          </Card.Content>
        </Card>

        <p className="text-center text-zinc-400 text-sm mt-8">
          &copy; {new Date().getFullYear()} Aaradhya Fancy Dresses
        </p>
      </motion.div>
    </div>
  );
}
