import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { MailCheck, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';

const VerificationSent: React.FC = () => {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-mint w-[380px] h-[380px] top-[10%] left-[15%] -z-0 opacity-80" />
      <div className="gradient-orb gradient-orb-lavender w-[380px] h-[380px] bottom-[10%] right-[15%] -z-0 opacity-80" />

      <Card className="w-full max-w-lg rounded-2xl border-border bg-card/90 backdrop-blur-md relative z-10 p-4 md:p-6 text-center shadow-xl">
        <CardHeader className="flex flex-col items-center pb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 text-primary animate-pulse">
            <MailCheck className="w-8 h-8" />
          </div>
          <CardTitle className="text-3xl font-heading font-light text-foreground">
            Check your email
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm max-w-md mt-2">
            We've sent a verification link to your email address. Please click the link to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {email && (
            <div className="bg-muted/50 border border-border/80 rounded-xl p-3.5 text-sm text-foreground flex items-center justify-center gap-2">
              <span className="text-muted-foreground">Sent to:</span>
              <span className="font-semibold text-primary">{email}</span>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-accent/40 rounded-xl p-4 text-left space-y-2">
            <div className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-primary" /> Next Steps:
            </div>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground pl-1">
              <li>Open your email client and find the email from Layerzero.</li>
              <li>Click the <strong>Verify Email</strong> button inside.</li>
              <li>The link is valid for <strong>15 minutes</strong>.</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-4">
          <Link to="/login" className="w-full">
            <Button className="w-full rounded-full bg-primary text-primary-foreground hover:opacity-90">
              Proceed to Sign In
            </Button>
          </Link>

          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-1">
            <span>Didn't receive the email?</span>
            <Link 
              to="/resend-verification" 
              state={{ email }}
              className="text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Resend Link
            </Link>
          </div>

          <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mt-2">
            <ArrowLeft className="w-3 h-3" /> Back to registration
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificationSent;
