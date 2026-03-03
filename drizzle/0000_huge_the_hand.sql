CREATE TABLE "retailers" (
	"id" serial PRIMARY KEY NOT NULL,
	"retailer_id" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"image" varchar(500),
	"location" varchar(500) NOT NULL,
	"maps_link" varchar(500),
	"iframe_link" varchar(500),
	"rating" integer DEFAULT 0,
	"reviews_count" integer DEFAULT 0,
	"contact" varchar(20),
	"verified" boolean DEFAULT false,
	"stock" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "retailers_retailer_id_unique" UNIQUE("retailer_id")
);
