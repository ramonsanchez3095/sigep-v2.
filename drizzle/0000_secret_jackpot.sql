CREATE TYPE "public"."campo" AS ENUM('PERIODO_ANTERIOR', 'PERIODO_ACTUAL');--> statement-breakpoint
CREATE TYPE "public"."rol" AS ENUM('ADMIN', 'EDITOR', 'VIEWER');--> statement-breakpoint
CREATE TABLE "config_global" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edicion_habilitada" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "config_periodos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anterior_inicio" timestamp NOT NULL,
	"anterior_fin" timestamp NOT NULL,
	"anterior_label" varchar(100) NOT NULL,
	"actual_inicio" timestamp NOT NULL,
	"actual_fin" timestamp NOT NULL,
	"actual_label" varchar(100) NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "datos_comparativos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"fila_id" varchar(255) NOT NULL,
	"label" varchar(500) NOT NULL,
	"periodo_anterior" numeric(15, 2) DEFAULT '0' NOT NULL,
	"periodo_actual" numeric(15, 2) DEFAULT '0' NOT NULL,
	"editable" boolean DEFAULT true NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"tabla_config_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "datos_comparativos_tabla_config_id_fila_id_unique" UNIQUE("tabla_config_id","fila_id")
);
--> statement-breakpoint
CREATE TABLE "departamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" varchar(50) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"color" varchar(20) DEFAULT '#1e3a5f' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "departamentos_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "historial_cambios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"campo" "campo" NOT NULL,
	"valor_anterior" numeric(15, 2) NOT NULL,
	"valor_nuevo" numeric(15, 2) NOT NULL,
	"fila_id" varchar(255) NOT NULL,
	"fila_label" varchar(500) NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tabla_config_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permisos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" varchar(50) NOT NULL,
	"usuario_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "permisos_usuario_id_tipo_unique" UNIQUE("usuario_id","tipo")
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" varchar(500) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"usuario_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mes" integer NOT NULL,
	"anio" integer NOT NULL,
	"datos" json NOT NULL,
	"fecha_creacion" timestamp DEFAULT now() NOT NULL,
	"creado_por_id" uuid NOT NULL,
	CONSTRAINT "snapshots_mes_anio_unique" UNIQUE("mes","anio")
);
--> statement-breakpoint
CREATE TABLE "tablas_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tabla_id" varchar(255) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"departamento_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tablas_config_tabla_id_unique" UNIQUE("tabla_id")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"nombre" varchar(255) NOT NULL,
	"rol" "rol" DEFAULT 'EDITOR' NOT NULL,
	"color" varchar(20) DEFAULT '#1e3a5f' NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"departamento_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "datos_comparativos" ADD CONSTRAINT "datos_comparativos_tabla_config_id_tablas_config_id_fk" FOREIGN KEY ("tabla_config_id") REFERENCES "public"."tablas_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "historial_cambios" ADD CONSTRAINT "historial_cambios_tabla_config_id_tablas_config_id_fk" FOREIGN KEY ("tabla_config_id") REFERENCES "public"."tablas_config"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permisos" ADD CONSTRAINT "permisos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_creado_por_id_usuarios_id_fk" FOREIGN KEY ("creado_por_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tablas_config" ADD CONSTRAINT "tablas_config_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;