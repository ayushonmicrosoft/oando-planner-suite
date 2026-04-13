import { Router, type IRouter } from "express";
import { eq, count, desc } from "drizzle-orm";
import { db, usersTable, plansTable, catalogItemsTable, templatesTable } from "@workspace/db";
import { asyncHandler } from "../middlewares/async-handler";
import { requireAdmin } from "../middlewares/require-admin";
import { ApiHttpError } from "../middlewares/error-handler";
import { config } from "../lib/config";
import { z } from "zod";

const router: IRouter = Router();

const IdParams = z.object({ id: z.string().min(1) });

function getAdminEmails(): string[] {
  return config.adminEmails.map((e) => e.toLowerCase());
}

const UpdateUserRoleBody = z.object({
  role: z.enum(["user", "admin"]),
});

router.post(
  "/users/sync",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const authUser = req.user;

    const email = authUser.email ?? "";
    const displayName = authUser.name ?? email.split("@")[0];
    const avatarUrl = authUser.image ?? null;

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
        const adminEmails = getAdminEmails();
        const isAdmin = adminEmails.includes(email.toLowerCase());
        const [created] = await db
          .insert(usersTable)
          .values({ id: userId, email, displayName, avatarUrl, role: isAdmin ? "admin" : "user" })
          .returning();
        res.status(201).json(created);
      }
    }
  }),
);

router.get(
  "/users/me",
  asyncHandler(async (req, res) => {
    const userId = req.userId;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!user) {
      throw new ApiHttpError(404, "User profile not found. Call POST /api/users/sync first.");
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
    const { id } = IdParams.parse(req.params);

    const parsed = UpdateUserRoleBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Role must be 'user' or 'admin'");
    }

    const [updated] = await db
      .update(usersTable)
      .set({ role: parsed.data.role })
      .where(eq(usersTable.id, String(id)))
      .returning();

    if (!updated) {
      throw new ApiHttpError(404, "User not found");
    }

    res.json(updated);
  }),
);

router.get(
  "/admin/stats",
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [[userCount], [planCount], [catalogCount], [templateCount], recentUsers] = await Promise.all([
      db.select({ value: count() }).from(usersTable),
      db.select({ value: count() }).from(plansTable),
      db.select({ value: count() }).from(catalogItemsTable),
      db.select({ value: count() }).from(templatesTable),
      db.select().from(usersTable).orderBy(desc(usersTable.createdAt)).limit(5),
    ]);

    res.json({
      totalUsers: userCount.value,
      totalPlans: planCount.value,
      totalCatalogItems: catalogCount.value,
      totalTemplates: templateCount.value,
      recentSignups: recentUsers.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  }),
);

export default router;
