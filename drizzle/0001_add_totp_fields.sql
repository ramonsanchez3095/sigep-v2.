ALTER TABLE "usuarios" ADD COLUMN "totp_secret" varchar(500);--> statement-breakpoint
ALTER TABLE "usuarios" ADD COLUMN "totp_enabled" boolean DEFAULT false NOT NULL;
