import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAdmin } from "../middlewares/require-admin";

const router: IRouter = Router();

router.post(
  "/users/sync",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const supaUser = (req as any).user;

    const email = supaUser.email ?? "";
    const displayName =
      supaUser.user_metadata?.full_name ??
      supaUser.user_metadata?.name ??
      email.split("@")[0];
    const avatarUrl =
      supaUser.user_metadata?.avatar_url ??
      supaUser.user_metadata?.picture ??
      null;

    const [existingById] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (existingById) {
      const [updated] = await db
        .update(usersTable)
        .set({ email, displayName, avatarUrl })
        .where(eq(usersTable.id, userId))
        .returning();
      res.json(updated);
    } else {
      const [existingByEmail] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1);

      if (existingByEmail) {
        const [migrated] = await db
          .update(usersTable)
          .set({ id: userId, displayName, avatarUrl })
          .where(eq(usersTable.email, email))
          .returning();
        res.json(migrated);
      } else {
        const [created] = await db
          .insert(usersTable)
          .values({ id: userId, email, displayName, avatarUrl, role: "user" })
          .returning();
        res.status(201).json(created);
      }
    }
  }),
);

router.get(
  "/users/me",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User profile not found. Call POST /api/users/sync first.", status: 404 });
      return;
    }

    res.json(user);
  }),
);

router.get(
  "/admin/users",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const users = await db.select().from(usersTable);
    res.json(users);
  }),
);

router.patch(
  "/admin/users/:id/role",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      res.status(400).json({ error: "Role must be 'user' or 'admin'", status: 400 });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set({ role })
      .where(eq(usersTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "User not found", status: 404 });
      return;
    }

    res.json(updated);
  }),
);

export default router;
