const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.get('/callback', async (req, res) => {
  // this is how we get the user login info so we can send it to auth0 - using payload
  const { REACT_APP_AUTH0_CLIENT_ID, REACT_APP_AUTH0_DOMAIN, AUTH0_CLIENT_SECRET } = process.env;
  let payload = {
    client_id: REACT_APP_AUTH0_CLIENT_ID,
    client_secret: AUTH0_CLIENT_SECRET,
    code: req.query.code,
    grant_type: "authorization_code",
    redirect_uri: `http://${req.headers.host}/callback`
  };

  let accessToken = await axios.post(`https://${REACT_APP_AUTH0_DOMAIN}/oauth/token`, payload);
  let userInfo = await axios.get(`https://${REACT_APP_AUTH0_DOMAIN}/userinfo?access_token=${accessToken.data.access_token}`);

  req.session.user = userInfo.data;
  res.redirect('/')



})

// this is how we redirect the user after they login;
app.get('/api/user-data', (req, res) => {
  res.status(200).json(req.session.user)
})

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.send('logged out');
})

const port = 4000;
app.listen(port, () => { console.log(`Server listening on port ${port}`); });
