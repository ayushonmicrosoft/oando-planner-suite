import { Router, type IRouter } from "express";
import { eq, desc, sql, and } from "drizzle-orm";
import { db, projectsTable, clientsTable, plansTable } from "@workspace/db";
import {
  CreateProjectBody,
  UpdateProjectBody,
  ListProjectsQueryParams,
} from "@workspace/api-zod";
import { asyncHandler } from "../middlewares/async-handler";

const router: IRouter = Router();

function serializeProject(p: typeof projectsTable.$inferSelect) {
  return {
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

function parseIdParam(raw: string | string[]): number | null {
  const str = Array.isArray(raw) ? raw[0] : raw;
  const id = parseInt(str, 10);
  return isNaN(id) || id <= 0 ? null : id;
}

function countItems(documentJson: string): number {
  try {
    const doc = JSON.parse(documentJson);
    return Array.isArray(doc?.items) ? doc.items.length : 0;
  } catch {
    return 0;
  }
}

router.get(
  "/projects",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string, 10) : undefined;
    const status = req.query.status as string | undefined;

    let conditions = [eq(projectsTable.userId, userId)];
    if (clientId && !isNaN(clientId)) {
      conditions.push(eq(projectsTable.clientId, clientId));
    }
    if (status) {
      conditions.push(eq(projectsTable.status, status));
    }

    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
        clientId: projectsTable.clientId,
        clientName: clientsTable.name,
        status: projectsTable.status,
        notes: projectsTable.notes,
        userId: projectsTable.userId,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        planCount: sql<number>`(select count(*)::int from ${plansTable} where ${plansTable.projectId} = ${projectsTable.id} and ${plansTable.userId} = ${userId})`,
      })
      .from(projectsTable)
      .leftJoin(clientsTable, eq(projectsTable.clientId, clientsTable.id))
      .where(and(...conditions))
      .orderBy(desc(projectsTable.updatedAt));

    res.json(
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        clientId: p.clientId,
        clientName: p.clientName || null,
        status: p.status,
        notes: p.notes,
        planCount: p.planCount,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      }))
    );
  })
);

router.post(
  "/projects",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const parsed = CreateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid project data: " + parsed.error.message, status: 400 });
      return;
    }

    if (parsed.data.clientId) {
      const [client] = await db
        .select()
        .from(clientsTable)
        .where(and(eq(clientsTable.id, parsed.data.clientId), eq(clientsTable.userId, userId)));
      if (!client) {
        res.status(400).json({ error: "Client not found", status: 400 });
        return;
      }
    }

    const [project] = await db
      .insert(projectsTable)
      .values({
        name: parsed.data.name.trim(),
        clientId: parsed.data.clientId || null,
        status: parsed.data.status || "active",
        notes: parsed.data.notes || null,
        userId,
      })
      .returning();

    res.status(201).json(serializeProject(project));
  })
);

router.get(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid project id", status: 400 });
      return;
    }

    const [project] = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    if (!project) {
      res.status(404).json({ error: "Project not found", status: 404 });
      return;
    }

    let client = null;
    if (project.clientId) {
      const [c] = await db
        .select({
          id: clientsTable.id,
          name: clientsTable.name,
          company: clientsTable.company,
          email: clientsTable.email,
          phone: clientsTable.phone,
        })
        .from(clientsTable)
        .where(and(eq(clientsTable.id, project.clientId), eq(clientsTable.userId, userId)));
      client = c || null;
    }

    const plans = await db
      .select()
      .from(plansTable)
      .where(and(eq(plansTable.projectId, id), eq(plansTable.userId, userId)))
      .orderBy(desc(plansTable.updatedAt));

    const planSummaries = plans.map((p) => ({
      id: p.id,
      name: p.name,
      plannerType: p.plannerType,
      roomWidthCm: p.roomWidthCm,
      roomDepthCm: p.roomDepthCm,
      itemCount: countItems(p.documentJson),
      projectId: p.projectId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    res.json({
      id: project.id,
      name: project.name,
      clientId: project.clientId,
      client,
      status: project.status,
      notes: project.notes,
      plans: planSummaries,
      planCount: planSummaries.length,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    });
  })
);

router.patch(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid project id", status: 400 });
      return;
    }

    const [existing] = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Project not found", status: 404 });
      return;
    }

    const parsed = UpdateProjectBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid update data: " + parsed.error.message, status: 400 });
      return;
    }

    const updates: Partial<typeof projectsTable.$inferInsert> = {};
    if (parsed.data.name != null) updates.name = parsed.data.name.trim();
    if (parsed.data.clientId !== undefined) {
      if (parsed.data.clientId != null) {
        const [client] = await db
          .select()
          .from(clientsTable)
          .where(and(eq(clientsTable.id, parsed.data.clientId), eq(clientsTable.userId, userId)));
        if (!client) {
          res.status(400).json({ error: "Client not found", status: 400 });
          return;
        }
      }
      updates.clientId = parsed.data.clientId;
    }
    if (parsed.data.status != null) updates.status = parsed.data.status;
    if (parsed.data.notes != null) updates.notes = parsed.data.notes;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update", status: 400 });
      return;
    }

    const [project] = await db
      .update(projectsTable)
      .set(updates)
      .where(eq(projectsTable.id, id))
      .returning();

    if (!project) {
      res.status(404).json({ error: "Project not found", status: 404 });
      return;
    }

    res.json(serializeProject(project));
  })
);

router.delete(
  "/projects/:id",
  asyncHandler(async (req, res) => {
    const userId = (req as any).userId as string;
    const id = parseIdParam(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid project id", status: 400 });
      return;
    }

    const [existing] = await db
      .select()
      .from(projectsTable)
      .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));

    if (!existing) {
      res.status(404).json({ error: "Project not found", status: 404 });
      return;
    }

    await db
      .update(plansTable)
      .set({ projectId: null })
      .where(and(eq(plansTable.projectId, id), eq(plansTable.userId, userId)));

    await db
      .delete(projectsTable)
      .where(eq(projectsTable.id, id));

    res.sendStatus(204);
  })
);

export default router;
