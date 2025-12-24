export default function ErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Oops!</h1>
        <p className="mt-4 text-muted-foreground">
          Sorry, something went wrong. Please try again.
        </p>
        <a
          href="/login"
          className="mt-6 inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Back to Login
        </a>
      </div>
    </div>
  );
}

