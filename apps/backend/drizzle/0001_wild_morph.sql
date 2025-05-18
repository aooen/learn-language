CREATE TABLE `wordlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	CONSTRAINT `wordlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `wordlist` ADD CONSTRAINT `wordlist_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;