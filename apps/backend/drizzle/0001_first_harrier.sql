CREATE TABLE `quizSetLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizSetId` int NOT NULL,
	`studyDate` datetime NOT NULL,
	`learnedQuizId` int NOT NULL,
	CONSTRAINT `quizSetLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `friends` (
	`userId` int NOT NULL,
	`friendId` int NOT NULL,
	CONSTRAINT `friends_userId_friendId_pk` PRIMARY KEY(`userId`,`friendId`)
);
--> statement-breakpoint
ALTER TABLE `word` MODIFY COLUMN `meaning` varchar(255);--> statement-breakpoint
ALTER TABLE `subtitle` ADD `koSubtitle` varchar(1024) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `image` varchar(512) NOT NULL;--> statement-breakpoint
ALTER TABLE `quizSetLog` ADD CONSTRAINT `quizSetLog_quizSetId_quizSet_id_fk` FOREIGN KEY (`quizSetId`) REFERENCES `quizSet`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizSetLog` ADD CONSTRAINT `quizSetLog_learnedQuizId_quiz_id_fk` FOREIGN KEY (`learnedQuizId`) REFERENCES `quiz`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `friends` ADD CONSTRAINT `friends_friendId_user_id_fk` FOREIGN KEY (`friendId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;