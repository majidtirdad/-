export default function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23liKFMb7CSkEHSutX';
  const redirect = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,user&state=decap`;
  res.redirect(302, redirect);
}
