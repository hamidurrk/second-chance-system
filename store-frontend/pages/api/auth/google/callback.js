import { google } from "googleapis";
import axios from "axios";

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
    "http://localhost:3000/api/auth/google/callback"
  );

  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    const { data } = await oauth2.userinfo.get();

    const response = await axios.post(process.env.FASTAPI + "/auth/store/google", data);
    const { access_token } = response.data;

    res.redirect(`http://localhost:3000?token=${access_token}`);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      res.redirect(`http://localhost:3000?error=unauthorized`);
    } else {
      console.error("Failed to handle Google callback:", error);
      res.redirect(`http://localhost:3000?error=unknown`);
    }
  }
}