import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-content1 p-8">
      <div className="w-full max-w-md p-8 space-y-6 bg-content2 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-foreground-content4">
          Login to Your Account
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
            Login
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </a>
        </p>
      </div>
    </div>
  );
}
