CREATE TABLE `corpus` (
	`language` char(5) NOT NULL,
	`word` varchar(100) NOT NULL,
	`ranking` int NOT NULL,
	CONSTRAINT `corpus_language_word_pk` PRIMARY KEY(`language`,`word`),
	CONSTRAINT `corpus_ranking_unique` UNIQUE(`ranking`)
);
--> statement-breakpoint
ALTER TABLE `word` MODIFY COLUMN `frequency` double NOT NULL;