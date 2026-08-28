import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Clock, RefreshCw, ArrowLeft } from 'lucide-react';

const TokenExpired: React.FC = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-6 py-16 md:py-24 bg-background min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="gradient-orb gradient-orb-rose w-[380px] h-[380px] top-[15%] right-[15%] -z-0 opacity-80" />
      <div className="gradient-orb gradient-orb-peach w-[380px] h-[380px] bottom-[10%] left-[10%] -z-0 opacity-80" />

      <Card className="w-full max-w-md rounded-2xl border-border bg-card/90 backdrop-blur-md relative z-10 p-4 md:p-6 text-center shadow-xl">
        <CardHeader className="flex flex-col items-center pb-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-500">
            <Clock className="w-10 h-10" />
          </div>
          <CardTitle className="text-3xl font-heading font-light text-foreground">
            Link Expired
          </CardTitle>
          <CardDescription className="text-muted-foreground text-sm mt-2">
            The verification link you clicked is invalid or has expired. For security reasons, verification tokens expire after 15 minutes.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-4 space-y-3">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-600 dark:text-red-400 font-medium text-center">
            Don't worry! You can request a new verification link to activate your account.
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <Link to="/resend-verification" className="w-full">
            <Button className="w-full rounded-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700 flex items-center justify-center gap-2 font-medium transition-colors">
              <RefreshCw className="w-4 h-4" /> Request New Verification Link
            </Button>
          </Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TokenExpired;
