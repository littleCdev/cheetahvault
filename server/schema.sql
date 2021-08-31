CREATE TABLE IF NOT EXISTS `files`(
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,

    filetype            VARCHAR(255) NOT NULL DEFAULT '',
    filedate            VARCHAR(255) NOT NULL DEFAULT '',
    filetime            INTEGER NOT NULL DEFAULT 0,
    
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