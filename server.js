// Setup the basics for a basic express server
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const bodyParser = require("body-parser");

const path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "asset")));

// Push notification setting up
const webpush = require('web-push');
// VAPID keys should only be generated only once. we've run the vapid.js file to do this.
const vapidPublicKey = "BIhkiNM1U1xyGKU8JRRO8okL_4zemo2B_lL87W4eS1bfytF0YfOAI61dIyE6DkMX-jpAtK5m0_oOVMVn4A4dYqg";
const vapidPrivateKey = "nOyCQhbZb34LvCr-uTT1gJ5cQVmW5XIoK0nQ7xm-VEA";

webpush.setVapidDetails(
  'mailto:kevin.chang@kiwi-tec.com',
  vapidPublicKey,
  vapidPrivateKey
);

const tokenList = [];

// handle new subscriber
app.post('/newbrowser', (req, res) => {
  const token = req.body.token;
  const isSafari = (req.headers['user-agent'].indexOf("Safari") > 0);
  const auth = req.body.auth;
  const endpoint = req.body.endpoint;
  tokenList.push({ token: token, auth: auth, isSafari: isSafari, endpoint: endpoint });
  console.log("adding token: " + token + " with auth: " + auth + " and notification url:" + endpoint);
  res.end("ok");
});

// send a notify messaging
app.get('/notify', (req, res) => {
  const options = {
    TTL: 24 * 60 * 60,
    vapidDetails: {
      subject: 'mailto:kevin.chang@kiwi-tec.com',
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey
    }
  };
  const message = "Web Notification Testing";

  // push message to all subscriber
  for (let i = 0; i < tokenList.length; i++) {
    const pushSubscription = {
      "endpoint": tokenList[i].endpoint,
      "keys": {
        "p256dh": tokenList[i].token,
        "auth": tokenList[i].auth
      }
    };

    // push a message
    webpush.sendNotification(pushSubscription, message, options);
  }

  console.log(tokenList.length + " notification sent");
  console.log(JSON.stringify(tokenList));

  res.end(tokenList.length + " notification sent");

});

app.listen(port, () => { console.log("started on port " + port); });
