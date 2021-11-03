CREATE TABLE IF NOT EXISTS `conf`(
    currentversion      INTEGER NOT NULL DEFAULT -1 /* change to default version */
);
INSERT INTO `conf` (currentversion) VALUES (3);

CREATE TABLE IF NOT EXISTS `files`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    filetype            VARCHAR(255) NOT NULL DEFAULT '',
    filedate            VARCHAR(255) NOT NULL DEFAULT '',
    filetime            INTEGER NOT NULL DEFAULT 0,

    filesize            INTEGER NOT NULL DEFAULT 0,
    filesizestr         VARCHAR(255) NOT NULL DEFAULT '',
    
    /*exif > filedate > uploadtime */
    sortdate            VARCHAR(255) NOT NULL DEFAULT '',

    showinindex         INTEGER NOT NULL DEFAULT 1,

    imagex              INTEGER NOT NULL DEFAULT 0,
    imagey              INTEGER NOT NULL DEFAULT 0,
    
    originalfilename    VARCHAR(255) NOT NULL DEFAULT '',
    filename            VARCHAR(255) NOT NULL DEFAULT '',
    filepath            VARCHAR(255) NOT NULL DEFAULT '',

    videopreviewx       INTEGER NOT NULL DEFAULT 0,
    videopreviewy       INTEGER NOT NULL DEFAULT 0,
    videopreview        VARCHAR(255) NOT NULL DEFAULT '', /*screenshot from the video, thumbnail is still for gallery*/

    thumbnailx          INTEGER NOT NULL DEFAULT 0,
    thumbnaily          INTEGER NOT NULL DEFAULT 0,
    thumbnail           VARCHAR(255) NOT NULL DEFAULT '',

    uploadtime          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS `tagmap`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    imageid             INTEGER NOT NULL,
    tagid               INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS `tags`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    name                VARCHAR(255) NOT NULL DEFAULT ''
);


CREATE TABLE IF NOT EXISTS `users`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    username            VARCHAR(255) NOT NULL,
    password            VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS `albums`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    albumname           VARCHAR(255) NOT NULL DEFAULT '',
    albumdate           VARCHAR(255) NOT NULL DEFAULT '',
    albumtime           INTEGER NOT NULL DEFAULT 0,
    albumkey            VARCHAR(255) NOT NULL DEFAULT '',
    lastupdate          INTEGER NOT NULL DEFAULT 0,
    coverfile           INTEGER NOT NULL DEFAULT 0,
);

CREATE TABLE IF NOT EXISTS `albummap`(
    fileid              INTEGER NOT NULL,
    albumid             INTEGER NOT NULL,
    addtime             INTEGER NOT NULL DEFAULT 0,
    adddate             VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY(albumid,fileid)
);

CREATE TABLE IF NOT EXISTS `shares`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    targetid            INTEGER NOT NULL,
    sharetype           INTEGER NOT NULL, /* 0->file, 1->album */
    sharekey            VARCHAR(255) NOT NULL UNIQUE,
    sharetime           INTEGER NOT NULL DEFAULT 0,
    sharedate           VARCHAR(255) NOT NULL DEFAULT ''
);