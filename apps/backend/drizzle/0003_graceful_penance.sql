CREATE TABLE `media` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaLink` varchar(200) NOT NULL,
	`kind` varchar(10) NOT NULL,
	CONSTRAINT `media_id` PRIMARY KEY(`id`),
	CONSTRAINT `media_mediaLink_unique` UNIQUE(`mediaLink`)
);
--> statement-breakpoint
CREATE TABLE `subtitle` (
	`sid` int AUTO_INCREMENT NOT NULL,
	`mediaId` int NOT NULL,
	`startTime` int NOT NULL,
	`endTime` int NOT NULL,
	`subtitle` varchar(200) NOT NULL,
	CONSTRAINT `subtitle_sid` PRIMARY KEY(`sid`)
);
--> statement-breakpoint
ALTER TABLE `subtitle` ADD CONSTRAINT `subtitle_mediaId_media_id_fk` FOREIGN KEY (`mediaId`) REFERENCES `media`(`id`) ON DELETE no action ON UPDATE no action;