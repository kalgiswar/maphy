CREATE TABLE `tickets` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`description` VARCHAR(500) NOT NULL ,
	`asset_tag` VARCHAR(191) NOT NULL ,
	`details` TEXT NOT NULL ,
	`user_id` INT NOT NULL ,
	`created_by` INT NOT NULL ,
	`status_id` INT NOT NULL ,
	`assigned_to` INT NULL,
	`created_at` DATETIME NOT NULL,
	`updated_at` DATETIME NULL,
	PRIMARY KEY (id)) ENGINE = InnoDB

CREATE TABLE `talent_groups` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `severity` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `skill_level` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci


CREATE TABLE `ticket_issues` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(500),
  `talent_group_id` int(10),
  `severity_id` int(10),
  `skill_level_id` int(10),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

CREATE TABLE `ticket_status` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(191) NOT NULL ,
	`type` VARCHAR(191) NOT NULL ,
	`user_id` INT NOT NULL ,
	`created_by` INT NULL DEFAULT NULL, 
	`created_at` timestamp NULL DEFAULT NULL, 
	`deleted_at` timestamp NULL DEFAULT NULL,
	`updated_at` timestamp NULL DEFAULT NULL,
	PRIMARY KEY (id)) ENGINE = InnoDB