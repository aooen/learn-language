CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` binary(60) NOT NULL,
	`motherLang` char(5) NOT NULL,
	`targetLang` char(5) NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `wordlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	CONSTRAINT `wordlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wordlist` ADD CONSTRAINT `wordlist_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;