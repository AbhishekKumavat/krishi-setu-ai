CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"photo_url" varchar(500),
	"role" varchar(50) DEFAULT 'user',
	"region" varchar(500) DEFAULT '',
	"is_verified" boolean DEFAULT false,
	"followers" jsonb,
	"following" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
