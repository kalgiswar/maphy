CREATE TABLE `firm` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(191) NOT NULL ,
	`image` VARCHAR(191) NULL ,
	`user_id` INT NULL  ,
	`created_at` DATETIME NOT NULL,
	`updated_at` DATETIME NULL,
    `deleted_at` DATETIME NULL,
	PRIMARY KEY (id)) ENGINE = InnoDB