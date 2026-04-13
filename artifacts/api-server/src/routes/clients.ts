import { Router, type IRouter } from "express";
import { eq, desc, sql, and, ilike, or } from "drizzle-orm";
import { db, clientsTable, projectsTable } from "@workspace/db";
import {
  CreateClientBody,
  UpdateClientBody,
  ListClientsQueryParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";
import { ApiHttpError } from "../middlewares/error-handler";

const router: IRouter = Router();

function serializeClient(c: typeof clientsTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
  };
}

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

router.get(
  "/clients",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const rawSearch = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
    const search = typeof rawSearch === "string" ? rawSearch.replace(/[%_\\]/g, "\\$&") : undefined;

    let whereClause = eq(clientsTable.userId, userId);

    const clients = await db
      .select({
        id: clientsTable.id,
        name: clientsTable.name,
        company: clientsTable.company,
        email: clientsTable.email,
        phone: clientsTable.phone,
        address: clientsTable.address,
        notes: clientsTable.notes,
        userId: clientsTable.userId,
        createdAt: clientsTable.createdAt,
        projectCount: sql<number>`(select count(*)::int from ${projectsTable} where ${projectsTable.clientId} = ${clientsTable.id} and ${projectsTable.userId} = ${userId})`,
      })
      .from(clientsTable)
      .where(
        search
          ? and(
              whereClause,
              or(
                ilike(clientsTable.name, `%${search}%`),
                ilike(clientsTable.company, `%${search}%`),
                ilike(clientsTable.email, `%${search}%`)
              )
            )
          : whereClause
      )
      .orderBy(desc(clientsTable.createdAt));

    res.json(
      clients.map((c) => ({
        ...serializeClient(c),
        projectCount: c.projectCount,
      }))
    );
  })
);

router.post(
  "/clients",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const parsed = CreateClientBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid client data: " + parsed.error.message);
    }

    const [client] = await db
      .insert(clientsTable)
      .values({
        name: parsed.data.name.trim(),
        company: parsed.data.company || null,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
        userId,
      })
      .returning();

    res.status(201).json(serializeClient(client));
  })
);

router.get(
  "/clients/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid client id");
    }

    const [client] = await db
      .select({
        id: clientsTable.id,
        name: clientsTable.name,
        company: clientsTable.company,
        email: clientsTable.email,
        phone: clientsTable.phone,
        address: clientsTable.address,
        notes: clientsTable.notes,
        userId: clientsTable.userId,
        createdAt: clientsTable.createdAt,
        projectCount: sql<number>`(select count(*)::int from ${projectsTable} where ${projectsTable.clientId} = ${clientsTable.id} and ${projectsTable.userId} = ${userId})`,
      })
      .from(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));

    if (!client) {
      throw new ApiHttpError(404, "Client not found");
    }

    res.json({
      ...serializeClient(client),
      projectCount: client.projectCount,
    });
  })
);

router.patch(
  "/clients/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid client id");
    }

    const [existing] = await db
      .select()
      .from(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)));

    if (!existing) {
      throw new ApiHttpError(404, "Client not found");
    }

    const parsed = UpdateClientBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiHttpError(400, "Invalid update data: " + parsed.error.message);
    }

    const updates: Partial<typeof clientsTable.$inferInsert> = {};
    if (parsed.data.name != null) updates.name = parsed.data.name.trim();
    if (parsed.data.company != null) updates.company = parsed.data.company;
    if (parsed.data.email != null) updates.email = parsed.data.email;
    if (parsed.data.phone != null) updates.phone = parsed.data.phone;
    if (parsed.data.address != null) updates.address = parsed.data.address;
    if (parsed.data.notes != null) updates.notes = parsed.data.notes;

    if (Object.keys(updates).length === 0) {
      throw new ApiHttpError(400, "No valid fields to update");
    }

    const [client] = await db
      .update(clientsTable)
      .set(updates)
      .where(eq(clientsTable.id, id))
      .returning();

    if (!client) {
      throw new ApiHttpError(404, "Client not found");
    }

    res.json(serializeClient(client));
  })
);

router.delete(
  "/clients/:id",
  asyncHandler(async (req, res) => {
    const userId = req.userId;
    const id = parseIdParam(req.params.id);
    if (!id) {
      throw new ApiHttpError(400, "Invalid client id");
    }

    const [deleted] = await db
      .delete(clientsTable)
      .where(and(eq(clientsTable.id, id), eq(clientsTable.userId, userId)))
      .returning();

    if (!deleted) {
      throw new ApiHttpError(404, "Client not found");
    }

    res.sendStatus(204);
  })
);

export default router;
