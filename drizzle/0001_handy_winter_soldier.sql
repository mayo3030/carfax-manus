CREATE TABLE `admin_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`setting_key` varchar(100) NOT NULL,
	`setting_value` text NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admin_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_settings_setting_key_unique` UNIQUE(`setting_key`)
);
--> statement-breakpoint
CREATE TABLE `vehicle_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vin_submission_id` int NOT NULL,
	`vin` varchar(17) NOT NULL,
	`year` int,
	`make` varchar(100),
	`model` varchar(100),
	`trim` varchar(100),
	`mileage` int,
	`price` int,
	`color` varchar(50),
	`engine_type` varchar(100),
	`transmission` varchar(50),
	`accident_count` int DEFAULT 0,
	`owner_count` int DEFAULT 0,
	`service_record_count` int DEFAULT 0,
	`accident_history` text,
	`service_history` text,
	`ownership_history` text,
	`title_info` text,
	`additional_data` text,
	`scraped_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vehicle_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vin_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`vin` varchar(17) NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`error_message` text,
	`submitted_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `vin_submissions_id` PRIMARY KEY(`id`)
);
