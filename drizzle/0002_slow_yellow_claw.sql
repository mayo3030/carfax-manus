CREATE TABLE `carfax_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`encryptedUsername` text NOT NULL,
	`encryptedPassword` text NOT NULL,
	`sessionCookie` text,
	`lastLoginAt` timestamp DEFAULT (now()),
	`expiresAt` timestamp,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carfax_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `carfax_sessions` ADD CONSTRAINT `carfax_sessions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;