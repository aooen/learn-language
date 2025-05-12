CREATE TABLE `words` (
	`id` int AUTO_INCREMENT NOT NULL,
	`word` varchar(255) NOT NULL,
	`meaning` varchar(255) NOT NULL,
	`count` int NOT NULL,
	`level` int NOT NULL,
	CONSTRAINT `words_id` PRIMARY KEY(`id`),
	CONSTRAINT `words_word_unique` UNIQUE(`word`)
);
