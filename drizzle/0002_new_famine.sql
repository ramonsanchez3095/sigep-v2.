CREATE TABLE "estadisticas_anuales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"departamento_id" uuid NOT NULL,
	"tabla_config_id" uuid NOT NULL,
	"anio" integer NOT NULL,
	"total_anual_anterior" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_anual_actual" numeric(15, 2) DEFAULT '0' NOT NULL,
	"promedio_mensual" numeric(15, 2) DEFAULT '0' NOT NULL,
	"tendencia" numeric(15, 6) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estadisticas_anuales_tabla_config_id_anio_unique" UNIQUE("tabla_config_id","anio")
);
--> statement-breakpoint
CREATE TABLE "estadisticas_diarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"departamento_id" uuid NOT NULL,
	"tabla_config_id" uuid NOT NULL,
	"fecha" timestamp NOT NULL,
	"total_periodo_anterior" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_periodo_actual" numeric(15, 2) DEFAULT '0' NOT NULL,
	"cantidad_cambios" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estadisticas_diarias_tabla_config_id_fecha_unique" UNIQUE("tabla_config_id","fecha")
);
--> statement-breakpoint
CREATE TABLE "estadisticas_mensuales" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"departamento_id" uuid NOT NULL,
	"tabla_config_id" uuid NOT NULL,
	"mes" integer NOT NULL,
	"anio" integer NOT NULL,
	"promedio_diario" numeric(15, 2) DEFAULT '0' NOT NULL,
	"pico_maximo" numeric(15, 2) DEFAULT '0' NOT NULL,
	"pico_minimo" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_cambios" integer DEFAULT 0 NOT NULL,
	"snapshot_data" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estadisticas_mensuales_tabla_config_id_mes_anio_unique" UNIQUE("tabla_config_id","mes","anio")
);
--> statement-breakpoint
ALTER TABLE "estadisticas_anuales" ADD CONSTRAINT "estadisticas_anuales_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estadisticas_anuales" ADD CONSTRAINT "estadisticas_anuales_tabla_config_id_tablas_config_id_fk" FOREIGN KEY ("tabla_config_id") REFERENCES "public"."tablas_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estadisticas_diarias" ADD CONSTRAINT "estadisticas_diarias_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estadisticas_diarias" ADD CONSTRAINT "estadisticas_diarias_tabla_config_id_tablas_config_id_fk" FOREIGN KEY ("tabla_config_id") REFERENCES "public"."tablas_config"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estadisticas_mensuales" ADD CONSTRAINT "estadisticas_mensuales_departamento_id_departamentos_id_fk" FOREIGN KEY ("departamento_id") REFERENCES "public"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estadisticas_mensuales" ADD CONSTRAINT "estadisticas_mensuales_tabla_config_id_tablas_config_id_fk" FOREIGN KEY ("tabla_config_id") REFERENCES "public"."tablas_config"("id") ON DELETE cascade ON UPDATE no action;