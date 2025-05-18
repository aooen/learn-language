CREATE TABLE `word` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`meaning` varchar(255) NOT NULL,
	`count` int NOT NULL,
	`frequency` int NOT NULL,
	`wordlistId` int NOT NULL,
	CONSTRAINT `word_id` PRIMARY KEY(`id`)
);
