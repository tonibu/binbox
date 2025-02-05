import { Router } from "express";
import { auth } from "@googleapis/oauth2";

import type { RequestHandler } from "express";

const AUTH_COOKIE_NAME = "auth";

const oauth2Client = new auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/callback",
);

export const oauthRoutes = Router();

oauthRoutes.get("/callback", async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    next(new Error("Unauthorized"));
  }

  try {
    const response = await oauth2Client.getToken(code as string);

    res.cookie(AUTH_COOKIE_NAME, response.tokens, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });

    res.redirect(302, "/");
  } catch (e) {
    next(e);
  }
});

oauthRoutes.post("/refresh", async (req, res) => {
  const tokens = req.cookies[AUTH_COOKIE_NAME];

  if (!tokens) {
    res.status(401).send("Unauthorized");

    return;
  }

  try {
    oauth2Client.setCredentials(tokens);
    await oauth2Client.refreshAccessToken();

    res.cookie(AUTH_COOKIE_NAME, oauth2Client.credentials, {
      httpOnly: true,
      secure: false,
    });

    res
      .status(200)
      .json({ accessToken: oauth2Client.credentials.access_token });
  } catch (e) {
    res.status(500).json(e?.message);
  }
});

export const oauthMiddleware = (): RequestHandler => async (req, res, next) => {
  const tokens = req.cookies[AUTH_COOKIE_NAME];

  if (!tokens) {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: ["https://mail.google.com/"],
    });

    res.redirect(302, url);

    return;
  }

  try {
    oauth2Client.setCredentials(tokens);

    if (
      !oauth2Client.credentials.expiry_date ||
      oauth2Client.credentials.expiry_date < Date.now()
    ) {
      await oauth2Client.refreshAccessToken();

      res.cookie(AUTH_COOKIE_NAME, oauth2Client.credentials, {
        httpOnly: true,
        secure: false,
      });
    }

    res.locals = {
      ...res.locals,
      accessToken: oauth2Client.credentials.access_token,
    };

    next();
  } catch (e) {
    next(e);
  }
};
