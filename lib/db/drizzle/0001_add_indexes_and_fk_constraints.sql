ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "plans" ADD CONSTRAINT "plans_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_auth_account_user_id" ON "auth_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_auth_session_user_id" ON "auth_session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_catalog_items_category" ON "catalog_items" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_catalog_items_series_id" ON "catalog_items" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "idx_clients_user_id" ON "clients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_user_id" ON "projects" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_projects_client_id" ON "projects" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "idx_plans_user_id" ON "plans" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_plans_project_id" ON "plans" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "idx_plan_versions_plan_id" ON "plan_versions" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_user_id" ON "quotes" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_quotes_plan_id" ON "quotes" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_templates_category" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_plan_comments_share_id" ON "plan_comments" USING btree ("share_id");--> statement-breakpoint
CREATE INDEX "idx_plan_comments_plan_id" ON "plan_comments" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "idx_plan_shares_plan_id" ON "plan_shares" USING btree ("plan_id");