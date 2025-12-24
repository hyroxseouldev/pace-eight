"use client";

import { createClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";

export default function AccountForm({ user }: { user: User | null }) {
  const supabase = createClient();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 rounded-lg border p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Manage your account settings
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="text"
              value={user?.email}
              disabled
              className="mt-1 block w-full rounded-md border bg-muted px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">User ID</label>
            <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm">
              {user?.id}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium">Created At</label>
            <p className="mt-1 rounded-md border bg-muted px-3 py-2 text-sm">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "N/A"}
            </p>
          </div>

          <form action="/auth/signout" method="post" className="pt-4">
            <button
              className="w-full rounded-md border border-destructive px-4 py-2 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

