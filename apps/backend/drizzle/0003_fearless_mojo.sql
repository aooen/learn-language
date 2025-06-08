CREATE TABLE `collecting` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255),
	`progress` decimal(3,2) NOT NULL DEFAULT '0.00',
	`source` text NOT NULL,
	`error` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`userId` int NOT NULL,
	`wordlistId` int,
	CONSTRAINT `collecting_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `collecting` ADD CONSTRAINT `collecting_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;