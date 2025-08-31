// File: app/(auth)/signup/page.tsx
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
  Select,
  SelectItem,
  Checkbox,
  Chip,
  Progress
} from '@heroui/react';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Waves, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

const SignUpPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    location: ''
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const router = useRouter();

  const roles = [
    { key: 'citizen', label: 'Citizen Scientist' },
    { key: 'researcher', label: 'Researcher' },
    { key: 'educator', label: 'Educator' },
    { key: 'government', label: 'Government Official' },
    { key: 'ngo', label: 'NGO/Conservation Group' }
  ];

  const locations = [
    { key: 'mumbai', label: 'Mumbai, India' },
    { key: 'gujarat', label: 'Gujarat, India' },
    { key: 'kerala', label: 'Kerala, India' },
    { key: 'goa', label: 'Goa, India' },
    { key: 'other', label: 'Other Location' }
  ];

  const passwordStrength = () => {
    const { password } = formData;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength < 50) return 'danger';
    if (strength < 75) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    const strength = passwordStrength();
    if (strength < 50) return 'Weak';
    if (strength < 75) return 'Medium';
    return 'Strong';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email) {
      setError('Please enter your email');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (passwordStrength() < 50) {
      setError('Please choose a stronger password');
      return false;
    }
    if (!formData.role) {
      setError('Please select your role');
      return false;
    }
    if (!acceptTerms) {
      setError('Please accept the terms and conditions');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // TODO: Implement actual registration with Convex
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      router.push('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
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
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 w-96 h-96 bg-success/5 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-lg">
        {/* Logo Section */}
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 shadow-lg bg-primary rounded-2xl">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="mb-1 text-2xl font-bold text-gray-800">Join Blue Carbon</h1>
          <p className="text-gray-600">Help protect coastal ecosystems worldwide</p>
        </div>

        {/* Registration Card */}
        <Card className="border-0 shadow-xl bg-content1/80 backdrop-blur-md">
          <CardHeader className="pb-4">
            <div className="w-full text-center">
              <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
              <p className="mt-1 text-sm text-gray-600">Start your conservation journey</p>
            </div>
          </CardHeader>

          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  label="First Name"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-800",
                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                  }}
                  required
                />
                <Input
                  type="text"
                  label="Last Name"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-800",
                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                  }}
                  required
                />
              </div>

              {/* Email Input */}
              <Input
                type="email"
                label="Email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                startContent={<Mail className="w-4 h-4 text-gray-400" />}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                }}
                required
              />

              {/* Role Selection */}
              <Select
                label="Role"
                placeholder="Select your role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                variant="bordered"
                size="lg"
                startContent={<User className="w-4 h-4 text-gray-400" />}
                classNames={{
                  trigger: "border-gray-200 hover:border-primary data-[open=true]:border-primary bg-white/50"
                }}
              >
                {roles.map((role) => (
                  <SelectItem key={role.key}>
                    {role.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Location Selection */}
              <Select
                label="Location"
                placeholder="Select your location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                variant="bordered"
                size="lg"
                startContent={<MapPin className="w-4 h-4 text-gray-400" />}
                classNames={{
                  trigger: "border-gray-200 hover:border-primary data-[open=true]:border-primary bg-white/50"
                }}
              >
                {locations.map((location) => (
                  <SelectItem key={location.key}>
                    {location.label}
                  </SelectItem>
                ))}
              </Select>

              {/* Password Input */}
              <div className="space-y-2">
                <Input
                  label="Password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  startContent={<Lock className="w-4 h-4 text-gray-400" />}
                  endContent={
                    <button
                      className="focus:outline-none"
                      type="button"
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  }
                  type={isPasswordVisible ? "text" : "password"}
                  variant="bordered"
                  size="lg"
                  classNames={{
                    input: "text-gray-800",
                    inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                  }}
                  required
                />
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Password Strength</span>
                      <Chip
                        size="sm"
                        color={getPasswordStrengthColor()}
                        variant="flat"
                      >
                        {getPasswordStrengthText()}
                      </Chip>
                    </div>
                    <Progress
                      value={passwordStrength()}
                      color={getPasswordStrengthColor()}
                      size="sm"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                startContent={<Shield className="w-4 h-4 text-gray-400" />}
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  >
                    {isConfirmPasswordVisible ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                }
                type={isConfirmPasswordVisible ? "text" : "password"}
                variant="bordered"
                size="lg"
                classNames={{
                  input: "text-gray-800",
                  inputWrapper: "border-gray-200 hover:border-primary focus-within:border-primary bg-white/50"
                }}
                required
              />

              {/* Terms and Conditions */}
              <Checkbox
                isSelected={acceptTerms}
                onValueChange={setAcceptTerms}
                size="sm"
                color="primary"
              >
                <span className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" size="sm" color="primary">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" size="sm" color="primary">
                    Privacy Policy
                  </Link>
                </span>
              </Checkbox>

              {/* Error Message */}
              {error && (
                <Chip color="danger" variant="flat" className="justify-center w-full">
                  {error}
                </Chip>
              )}

              {/* Sign Up Button */}
              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full font-medium shadow-lg"
                isLoading={isLoading}
                disabled={!acceptTerms}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>

              {/* Sign In Link */}
              <div className="pt-4 text-center">
                <span className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" color="primary" className="font-medium">
                    Sign in
                  </Link>
                </span>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Security Note */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-content2/60 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-xs text-gray-600">Your data is encrypted and secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;