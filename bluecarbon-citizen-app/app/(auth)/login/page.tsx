// File: app/(auth)/login/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Link,
  Divider,
  Image,
  Chip
} from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, Waves, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual authentication with Convex
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full -top-40 -right-40 w-80 h-80 bg-primary/10 blur-3xl"></div>
        <div className="absolute rounded-full -bottom-40 -left-40 w-80 h-80 bg-secondary/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-primary rounded-2xl">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-800">Blue Carbon Platform</h1>
          <p className="text-gray-600">Monitor and protect coastal ecosystems</p>
        </div>

        {/* Login Card */}
        <Card className="border-0 shadow-xl bg-content1/80 backdrop-blur-md">
          <CardHeader className="pb-4">
            <div className="w-full text-center">
              <h2 className="text-xl font-semibold text-gray-800">Welcome Back</h2>
              <p className="mt-1 text-sm text-gray-600">Sign in to your account</p>
            </div>
          </CardHeader>

          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                }}
                required
              />

              {/* Password Input */}
              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={toggleVisibility}
                  >
                    {isVisible ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                }
                type={isVisible ? "text" : "password"}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                }}
                required
              />

              {/* Error Message */}
              {error && (
                <Chip color="danger" variant="flat" className="justify-center w-full">
                  {error}
                </Chip>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-medium shadow-lg"
                isLoading={isLoading}
                disabled={!email || !password}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-2 my-4">
                <Divider className="flex-1" />
                <span className="text-sm text-gray-400">or</span>
                <Divider className="flex-1" />
              </div>

              {/* Demo Account */}
              <Button
                variant="bordered"
                size="lg"
                className="w-full"
                onClick={() => {
                  setEmail('demo@bluecarbon.org');
                  setPassword('demo123');
                }}
              >
                <Leaf className="w-4 h-4 mr-2" />
                Try Demo Account
              </Button>

              {/* Sign Up Link */}
              <div className="pt-4 text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link href="/signup" color="primary" className="font-medium">
                    Sign up
                  </Link>
                </span>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Features Preview */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              IoT Monitoring
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-secondary"></div>
              AI Analysis
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              Community Reports
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;