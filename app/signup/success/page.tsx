import Link from "next/link";

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent you a confirmation email. Please click the link in the
            email to verify your account.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <p className="text-xs text-muted-foreground">
            Didn't receive the email? Check your spam folder or try signing up
            again.
          </p>

          <Link
            href="/login"
            className="inline-block w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

