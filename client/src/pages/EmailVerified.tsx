import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'sonner';

const EmailVerified: React.FC = () => {
  const { token } = useParams<{ token?: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(!!token);
  const [success, setSuccess] = useState<boolean>(!token); // If navigated straight to /email-verified, default to true
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        setLoading(true);
        await api.get(`/auth/user/verify/${token}`);
        setSuccess(true);
        toast.success("Email verified successfully!");
      } catch (err: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) {
        setSuccess(false);
        const msg = err.response?.data?.message || "Invalid or expired verification link.";
        setErrorMessage(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-mint w-[380px] h-[380px] top-[15%] right-[15%] -z-0 opacity-80" />
      <div className="gradient-orb gradient-orb-sky w-[380px] h-[380px] bottom-[10%] left-[10%] -z-0 opacity-80" />

      <Card className="w-full max-w-md rounded-2xl border-border bg-card/90 backdrop-blur-md relative z-10 p-4 md:p-6 text-center shadow-xl">
        {loading ? (
          <CardContent className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <CardTitle className="text-2xl font-heading font-light text-foreground">
              Verifying your email...
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              Please wait while we validate your verification token.
            </CardDescription>
          </CardContent>
        ) : success ? (
          <>
            <CardHeader className="flex flex-col items-center pb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-500">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <CardTitle className="text-3xl font-heading font-light text-foreground">
                Email Verified!
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-2">
                Your email address has been successfully verified. You can now access all features of Layerzero.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 pb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                Your account is active. Ready to sign in!
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2"
              >
                Sign In to Your Account <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="flex flex-col items-center pb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center mb-4 text-destructive">
                <XCircle className="w-10 h-10" />
              </div>
              <CardTitle className="text-3xl font-heading font-light text-foreground">
                Verification Failed
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm mt-2">
                {errorMessage || "The verification link is invalid or has expired."}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-2 pb-4">
              <p className="text-xs text-muted-foreground bg-accent/40 rounded-xl p-4 text-left">
                Verification tokens expire after 15 minutes. If your link has expired, you can request a new verification link below.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 pt-2">
              <Link to="/resend-verification" className="w-full">
                <Button className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Request New Verification Link
                </Button>
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Back to Sign In
              </Link>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
};

export default EmailVerified;
