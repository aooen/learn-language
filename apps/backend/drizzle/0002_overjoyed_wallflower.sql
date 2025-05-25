CREATE TABLE `friends` (
	`userId` int NOT NULL,
	`friendId` int NOT NULL
);
--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_friendId_user_id_fk` FOREIGN KEY (`friendId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;