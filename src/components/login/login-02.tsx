import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/login/components/input";
import { Label } from "@/components/login/components/label";
import { Separator } from "@/components/login/components/separator";
import { Card as Cardaevr } from "@/components/ui/aevr/card"
import { GithubIcon } from "@/components/icons";
import { useNavigate } from "react-router-dom";

export default function Login02() {
    const navigate = useNavigate();
  
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCard, setShowCard] = useState(false);

  // Email OTP login
    const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);

      const { error } = await supabase.auth.signInWithOtp({ email });
      
      if (error) {
        console.log("Error sending OTP: " + error.message);
      } else {
        setShowCard(true);
      }

        setLoading(false);
  };


  // OTP Code verification
  const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { session }, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
      })

      if (error) {
        alert("Invalid code: " + error.message);
      } else {
        setShowCard(false);
        navigate("/dashboard");
      }
    } catch (error) {
      console.log("Error verifying OTP: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
    {showCard && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        onClick={() => setShowCard(false)} // click outside closes
      >
        <div
          className="max-w-100 w-full"
          onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
        >
          <Cardaevr
            className="flex items-center justify-center"
            title={
              <h2 className="text-center text-xl font-semibold text-foreground m-6">
                Enter the Code sent to your Email
              </h2>
            }
            subtitle={
              <form method="post" className="space-y-4 w-full" onSubmit={handleVerifyCode}>
                <div>
                  <Label>Code</Label>
                  <Input
                    type="text"
                    id="code-login-02"
                    name="code-login-02"
                    autoComplete="one-time-code"
                    placeholder="Enter your code"
                    className="mt-2"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="mb-6 w-full py-2 font-medium"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Submit Code"}
                </Button>
              </form>
            }
            variant="login"
            border="default"
            hoverable={false}
            size="login"
          />
        </div>
      </div>
    )}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center text-xl font-semibold text-foreground">
            Log in or create account
          </h2>
          <form method="post" className="mt-6 space-y-4" onSubmit={handleEmailLogin}>
            <div>
              <Label
              htmlFor="email-login-02"
              className="text-sm font-medium text-foreground dark:text-foreground"
              >
              Email
              </Label>
              <Input
              type="email"
              id="email-login-02"
              name="email-login-02"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              />
            </div>
            <Button type="submit" className="mt-4 w-full py-2 font-medium" disabled={loading}>
              {loading ? "Sending OTP..." : "Sign in"}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or with
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="flex w-full items-center justify-center space-x-2 py-2"
            asChild
          >
            <a href="#">
              <GithubIcon className="size-5" aria-hidden={true} />
              <span className="text-sm font-medium">Sign in with Github</span>
            </a>
          </Button>

          <p className="mt-4 text-xs text-muted-foreground dark:text-muted-foreground">
            By signing in, you agree to our{" "}
            <a href="#" className="underline underline-offset-4">
              terms of service
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-4">
              privacy policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
