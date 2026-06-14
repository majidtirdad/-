module.exports = async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.setHeader('Content-Type', 'text/html');
    return res.send(`<!DOCTYPE html><html><body><script>
(function(){
  var msg = 'authorization:github:error:' + JSON.stringify({error: "${error}"});
  if(window.opener) window.opener.postMessage(msg, '*');
  window.close();
})();
</script></body></html>`);
  }

  if (!code) return res.status(400).send('Missing code');

  const CLIENT_ID     = process.env.GITHUB_CLIENT_ID     || 'Ov23liKFMb7CSkEHSutX';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'ca8e035bc00ebaa9a72c3dfd99ff6ea279cf6229';

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      }),
    });

    const data = await r.json();

    if (data.error) {
      res.setHeader('Content-Type', 'text/html');
      return res.send(`<!DOCTYPE html><html><body><script>
(function(){
  var msg = 'authorization:github:error:' + JSON.stringify({error: "${data.error}"});
  if(window.opener) window.opener.postMessage(msg, '*');
  window.close();
})();
</script></body></html>`);
    }

    const token    = data.access_token;
    const content  = JSON.stringify({ token: token, provider: 'github' });

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<p style="font-family:sans-serif;color:#333;padding:20px">Login successful. Closing window...</p>
<script>
(function() {
  var receiveMsg = 'authorization:github:success:' + JSON.stringify({ token: "${token}", provider: "github" });
  
  function sendMsg() {
    if (window.opener) {
      window.opener.postMessage(receiveMsg, document.referrer || '*');
      window.opener.postMessage(receiveMsg, '*');
    }
  }
  
  // Try immediately and after delay
  sendMsg();
  setTimeout(sendMsg, 100);
  setTimeout(function() {
    sendMsg();
    window.close();
  }, 500);
})();
</script>
</body>
</html>`);

  } catch(e) {
    res.status(500).send('Error: ' + e.message);
  }
};
