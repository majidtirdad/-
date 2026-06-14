export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send('Missing code');
  }

  const CLIENT_ID     = process.env.GITHUB_CLIENT_ID     || 'Ov23liKFMb7CSkEHSutX';
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'ca8e035bc00ebaa9a72c3dfd99ff6ea279cf6229';

  try {
    // Exchange code for token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
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

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).send(`OAuth error: ${tokenData.error_description}`);
    }

    const token = tokenData.access_token;

    // Return token to Decap CMS via postMessage
    const html = `
<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
  (function() {
    const token = "${token}";
    const message = "authorization:github:success:${JSON.stringify({token, provider: 'github'}).replace(/"/g, '\\"')}";
    // Send to opener (Decap CMS)
    if (window.opener) {
      window.opener.postMessage(message, '*');
    }
    window.close();
  })();
</script>
<p>Authentication successful. You can close this window.</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);

  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).send('OAuth failed: ' + err.message);
  }
}
