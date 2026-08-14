import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setUnverifiedEmail(null);
    try {
      await login(data);
      toast.success("Logged in successfully");
      navigate('/dashboard/url');
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      if (error.response?.status === 403 || error.response?.data?.message?.includes("Verify your email")) {
        setUnverifiedEmail(data.email);
        toast.error("Please verify your email address before logging in.");
      } else if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as any /* eslint-disable-line @typescript-eslint/no-explicit-any */, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to log in");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-peach w-[350px] h-[350px] top-[10%] left-[10%] -z-0" />
      <div className="gradient-orb gradient-orb-sky w-[350px] h-[350px] bottom-[10%] right-[10%] -z-0" />

      <Card className="w-full max-w-md rounded-2xl border-border bg-card relative z-10 p-2 md:p-4">
        <CardHeader className="text-left pb-2">
          <CardTitle className="text-3xl font-heading font-light text-foreground">Welcome back</CardTitle>
          <CardDescription className="text-muted-foreground text-sm">Enter your credentials to access layerzero</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-5 pt-4 text-left">
            {unverifiedEmail && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-600 dark:text-amber-400 space-y-2">
                <p className="font-semibold">Email Verification Required</p>
                <p>Your email address is not verified yet. Please check your inbox or resend the verification link.</p>
                <Link
                  to="/resend-verification"
                  state={{ email: unverifiedEmail }}
                  className="inline-block font-bold underline hover:opacity-80"
                >
                  Resend Verification Email →
                </Link>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@layerzero.ai"
                {...register('email')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
                className="rounded-lg"
              />
              {errors.password && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 text-left">
            <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
            <div className="flex items-center justify-between w-full text-sm text-muted-foreground">
              <div>
                Don't have an account?{" "}
                <Link to="/register" className="text-foreground font-medium hover:underline">
                  Create account
                </Link>
              </div>
              <Link to="/resend-verification" className="text-xs text-primary hover:underline font-medium">
                Resend email?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Login;
