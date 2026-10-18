import { requireAdmin } from "@/lib/auth";
import { getUserRows } from "@/lib/admin";
import { UsersTable } from "@/components/admin/UsersTable";

export const metadata = { title: "Users" };

export default async function AdminUsers() {
  const admin = await requireAdmin();
  const users = await getUserRows(admin);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="mt-1 text-sm text-muted">Everyone who has signed up. Open a user to see their progress, goal and activity.</p>
      </div>
      <UsersTable users={users} />
    </div>
  );
}
