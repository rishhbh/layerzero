import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { toast } from 'sonner';
import { Loader2, MailCheck, ArrowLeft, Send } from 'lucide-react';

const resendSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResendFormValues = z.infer<typeof resendSchema>;

const ResendVerification: React.FC = () => {
  const { resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const defaultEmail = location.state?.email || '';

  const { register, handleSubmit, setError, formState: { errors } } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: defaultEmail,
    }
  });

  const onSubmit = async (data: ResendFormValues) => {
    setIsLoading(true);
    try {
      await resendVerification(data.email);
      toast.success("Verification email sent successfully!");
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
        const message = error.response?.data?.message || "Failed to send verification email";
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-peach w-[350px] h-[350px] top-[10%] right-[10%] -z-0 opacity-80" />
      <div className="gradient-orb gradient-orb-lavender w-[350px] h-[350px] bottom-[10%] left-[10%] -z-0 opacity-80" />

      <Card className="w-full max-w-md rounded-2xl border-border bg-card/90 backdrop-blur-md relative z-10 p-2 md:p-4 shadow-xl">
        <CardHeader className="text-left pb-2 flex flex-col items-start">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
            <MailCheck className="w-6 h-6" />
          </div>
          <CardTitle className="text-3xl font-heading font-light text-foreground">Resend Verification</CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-1">
            Enter your registered email address and we'll send you a new verification link.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-foreground/80">
                Email Address
              </Label>
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
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2 text-left">
            <Button type="submit" className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Verification Link
            </Button>
            <div className="flex items-center justify-between w-full pt-1 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-foreground inline-flex items-center gap-1 text-xs">
                <ArrowLeft className="w-3 h-3" /> Back to Sign In
              </Link>
              <Link to="/register" className="text-foreground font-medium text-xs hover:underline">
                Create Account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ResendVerification;
