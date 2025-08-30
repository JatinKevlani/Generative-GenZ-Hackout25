import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function SignupPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-content1 p-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-content2 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground-content4">
          Create New Account
        </h2>

        <form className="space-y-5">
          <Input
            type="email"
            label="Email"
            variant="flat"
            placeholder="Enter your email"
            fullWidth
            required
          />
          <Input
            type="password"
            label="Password"
            variant="flat"
            placeholder="Enter your password"
            fullWidth
            required
          />

          <Button
            type="submit"
            color="primary"
            variant="solid"
            className="w-full rounded-xl"
          >
            Sign Up
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
}
