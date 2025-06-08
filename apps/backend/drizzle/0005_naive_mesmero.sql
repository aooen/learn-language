CREATE TABLE `cacheMeaning` (
	`language` char(5) NOT NULL,
	`word` varchar(255) NOT NULL,
	`meaningLanguage` char(5) NOT NULL,
	`meaning` varchar(255) NOT NULL,
	CONSTRAINT `cacheMeaning_language_word_meaningLanguage_pk` PRIMARY KEY(`language`,`word`,`meaningLanguage`)
);
--> statement-breakpoint
CREATE TABLE `cacheStem` (
	`language` char(5) NOT NULL,
	`word` varchar(255) NOT NULL,
	`stem` varchar(255) NOT NULL,
	CONSTRAINT `cacheStem_language_word_pk` PRIMARY KEY(`language`,`word`)
);
--> statement-breakpoint
CREATE TABLE `cacheTranslate` (
	`language` char(5) NOT NULL,
	`line` varchar(512) NOT NULL,
	`translateLanguage` char(5) NOT NULL,
	`translated` varchar(512) NOT NULL,
	CONSTRAINT `cacheTranslate_language_line_translateLanguage_pk` PRIMARY KEY(`language`,`line`,`translateLanguage`)
);
