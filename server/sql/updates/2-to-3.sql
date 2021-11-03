ALTER TABLE `albums` ADD `lastupdate` INTEGER NOT NULL DEFAULT 0;
ALTER TABLE `albums` ADD `coverfile` INTEGER NOT NULL DEFAULT 0;

UPDATE `conf` set currentversion=3;