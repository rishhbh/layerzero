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

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setError, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success("Account registered! Please check your email to verify.");
      navigate('/verification-sent', { state: { email: data.email } });
    } catch (error: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        Object.keys(backendErrors).forEach((key) => {
          setError(key as any /* eslint-disable-line @typescript-eslint/no-explicit-any */, {
            type: "server",
            message: backendErrors[key][0],
          });
        });
      } else {
        toast.error(error.response?.data?.message || "Failed to create account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-mint w-[350px] h-[350px] top-[10%] right-[10%] -z-0" />
      <div className="gradient-orb gradient-orb-lavender w-[350px] h-[350px] bottom-[10%] left-[10%] -z-0" />

      <Card className="w-full max-w-md rounded-2xl border border-border bg-card/90 backdrop-blur-md relative z-10 shadow-xl">
        <CardHeader className="text-left pb-2 px-6 pt-6 md:px-8 md:pt-8">
          <CardTitle className="text-2xl font-heading font-medium tracking-tight text-foreground">Create an account</CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">Enter your details to get started with layerzero</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-3.5 px-6 md:px-8 py-3 text-left">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
                disabled={isLoading}
                className="rounded-lg h-10"
              />
              {errors.name && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="developer@layerzero.ai"
                {...register('email')}
                disabled={isLoading}
                className="rounded-lg h-10"
              />
              {errors.email && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">Password</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
                disabled={isLoading}
                className="rounded-lg h-10"
              />
              {errors.password && (
                <p className="text-sm text-red-600 font-medium pl-2 border-l-2 border-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 px-6 pb-6 md:px-8 md:pb-8 pt-2 text-center">
            <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 h-10 font-medium" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Started
            </Button>
            <div className="pt-1 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-foreground font-semibold hover:text-primary transition-colors hover:underline">
                Sign in here →
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Register;
