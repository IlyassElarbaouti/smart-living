"use client";

import { login } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";

interface Login1Props {
  heading?: string;
  logo: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  buttonText?: string;
  googleText?: string;
  signupText?: string;
  signupUrl?: string;
}

    // <form>
    //   <label htmlFor="email">Email:</label>
    //   <input id="email" name="email" type="email" required />
    //   <label htmlFor="password">Password:</label>
    //   <input id="password" name="password" type="password" required />
    //   <button formAction={login}>Log in</button>
    //   <button formAction={signup}>Sign up</button>
    // </form>

const Login = ({
  heading,
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://www.shadcnblocks.com/images/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  buttonText = "Login",
  signupText = "Don't have an account?",
  signupUrl = "https://shadcnblocks.com",
}: Login1Props) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(event.currentTarget);
    
    try {
      // Add a small delay to make loading state visible

      await login(formData);
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };
  return (
    <section className="relative h-screen overflow-hidden" style={{
      background: 'linear-gradient(135deg, #d0f0c0 0%, #e8f5e9 25%, #c8e6c9 50%, #a5d6a7 75%, #81c784 100%)'
    }}>
      {/* Additional gradient overlay for depth */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at top right, rgba(130,176,131,0.2), transparent 50%), radial-gradient(circle at bottom left, rgba(130,176,131,0.15), transparent 50%)'
      }}></div>
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2382B083' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>

      <div className="relative flex h-full items-center justify-center z-10">
        <div className="bg-white/80 backdrop-blur-md border border-green-100/50 flex w-full max-w-sm flex-col items-center gap-y-8 rounded-2xl px-6 py-12 shadow-2xl shadow-green-100/50">
          <div className="flex flex-col items-center gap-y-2">
            {/* Logo */}
            <div className="flex items-center gap-1 lg:justify-start">
              <a href={logo.url}>
                <Image
                width="200"
                height="200"
                  src={logo.src}
                  alt={"Dar Alkhayma"}
                  title={logo.title || "Dar Alkhayma"}
                  className="h-10"
                />
              </a>
            </div>
            {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
          </div>
          <div className="flex w-full flex-col gap-8">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Input id="email" placeholder="Email" name="email" type="email" required  />
              </div>
              <div className="flex flex-col gap-2">
                <Input id="password" name="password" placeholder="Password" type="password" required/>
              </div>
              <div className="flex flex-col gap-4">
                <Button 
                  type="submit"
                  className="mt-2 w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    buttonText
                  )}
                </Button>
              </div>
            </form>
          </div>
          <div className="text-muted-foreground flex justify-center gap-1 text-sm">
            <p>{signupText}</p>
            <a
              href={signupUrl}
              className="text-primary font-medium hover:underline"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Login };
