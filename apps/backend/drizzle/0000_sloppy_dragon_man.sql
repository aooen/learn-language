CREATE TABLE `word` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`meaning` varchar(255) NOT NULL,
	`count` int NOT NULL,
	`frequency` int NOT NULL,
	`wordlistId` int NOT NULL,
	CONSTRAINT `word_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subtitle` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wordlistId` int NOT NULL,
	`startTime` int NOT NULL,
	`endTime` int NOT NULL,
	`subtitle` varchar(1024) NOT NULL,
	CONSTRAINT `subtitle_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizSet` (
	`id` int AUTO_INCREMENT NOT NULL,
	`wordlistId` int NOT NULL,
	`maker` int,
	CONSTRAINT `quizSet_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wordlist` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`sourceType` varchar(20),
	`sourceUrl` varchar(1024),
	CONSTRAINT `wordlist_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz` (
	`id` int AUTO_INCREMENT NOT NULL,
	`front` varchar(500) NOT NULL,
	`back` varchar(500) NOT NULL,
	`progress` double NOT NULL,
	`sentenceFrom` varchar(500) NOT NULL,
	`due` int NOT NULL,
	`quizSetId` int NOT NULL,
	CONSTRAINT `quiz_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`password` binary(60) NOT NULL,
	`motherLang` char(5) NOT NULL,
	`targetLang` char(5) NOT NULL,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
ALTER TABLE `word` ADD CONSTRAINT `word_wordlistId_wordlist_id_fk` FOREIGN KEY (`wordlistId`) REFERENCES `wordlist`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subtitle` ADD CONSTRAINT `subtitle_wordlistId_wordlist_id_fk` FOREIGN KEY (`wordlistId`) REFERENCES `wordlist`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizSet` ADD CONSTRAINT `quizSet_wordlistId_wordlist_id_fk` FOREIGN KEY (`wordlistId`) REFERENCES `wordlist`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `wordlist` ADD CONSTRAINT `wordlist_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quiz` ADD CONSTRAINT `quiz_quizSetId_quizSet_id_fk` FOREIGN KEY (`quizSetId`) REFERENCES `quizSet`(`id`) ON DELETE cascade ON UPDATE no action;
ALTER TABLE `word` MODIFY COLUMN `meaning` VARCHAR(255) NULL;