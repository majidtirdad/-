module.exports = async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).send('Missing code');

  const CLIENT_ID     = process.env.GITHUB_CLIENT_ID     || 'Ov23liKFMb7CSkEHSutX';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'ca8e035bc00ebaa9a72c3dfd99ff6ea279cf6229';

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code }),
    });
    const data = await r.json();
    if (data.error) return res.status(400).send(data.error_description);

    const token    = data.access_token;
    const provider = 'github';
    const content  = JSON.stringify({ token, provider });

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html><html><body><script>
(function(){
  var msg = 'authorization:github:success:' + ${JSON.stringify(JSON.stringify({token, provider}))};
  if(window.opener){ window.opener.postMessage(msg,'*'); }
  setTimeout(function(){ window.close(); }, 1000);
})();
</script><p>Login successful. Closing...</p></body></html>`);
  } catch(e) {
    res.status(500).send('Error: ' + e.message);
  }
};
