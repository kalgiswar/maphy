alter table users add COLUMN skill_level_id int
alter table users add COLUMN talent_group_id int
Alter table tickets add COLUMN issue_id int
Alter table tickets add COLUMN talent_group_id int
Alter table tickets add COLUMN sister_ticket_id int
Alter table tickets add COLUMN others varchar(191)
alter table users add COLUMN availability_status int
alter table users add COLUMN user_type int
alter table tickets add COLUMN escalated_by integer DEFAULT 0