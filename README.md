# cheetahvault 

a simple webgallery with  taggingsupport build on vue and node


## Requirements
to generate thumbnails for videos you need to have ffmpeg installed

see https://www.npmjs.com/package/fluent-ffmpeg#prerequisites for more information

## Deployment

Run the following commands to start the gallery, do not forget to add the "run" command.

```bash
npm run install

npm run build

npm run start
```

### PM2
in case you want to use pm2 you can start it with
```
npm run startpm2
```
for stopping / restarting use
```
npm run stoppm2
and
npm run restartpm2
```

Your gallery should be running on port 8089 now.

### Config
to change the config, use the server/config.json.

relative paths are vom ./server/.
```json
{
    // webport to run on
    "webport":8089,

    // ip to bind express app to, use 127.0.0.1 if you want localhost only
    "bindip":"0.0.0.0",

    // paths where files are stored and served from
    "uploadpath":"./uploads/",
    // path for temporary uploads and thumbnailgeneration
    "temppath":"./tmp/"
}
```

### sharp 0.27.2
I'm still using sharp in version 0.27.2 because everything newer won't run on my pc.

Feel free to change to a newer version in server/package.json