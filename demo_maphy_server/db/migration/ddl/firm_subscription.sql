CREATE TABLE `firm_subscription` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`firm_id` INT NOT NULL ,
	`amount` INT NOT NULL ,
    `number_of_days` INT NOT NULL,
    `expiration_date` DATETIME NOT NULL,
	`description` TEXT NOT NULL ,
	`user_id` INT NOT NULL,
	`created_at` DATETIME NOT NULL,
	PRIMARY KEY (id)) ENGINE = InnoDB