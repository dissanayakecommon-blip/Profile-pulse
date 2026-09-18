
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors() });
    }

    // Homepage
    if (url.pathname === "/") {
      return env.ASSETS.fetch(request);
    }

    // Health check
    if (url.pathname === "/health") {
      return json({ status: "ok" });
    }

    // Instagram login
    if (url.pathname === "/auth/login") {
      if (!env.META_APP_ID) {
        return json({ error: "META_APP_ID not configured" }, 500);
      }

      const redirect =
        env.REDIRECT_URI || `${url.origin}/auth/callback`;

      const state = crypto.randomUUID();

      const instagramLogin = new URL(
        "https://www.instagram.com/oauth/authorize"
      );

      instagramLogin.searchParams.set(
        "client_id",
        env.META_APP_ID
      );

      instagramLogin.searchParams.set(
        "redirect_uri",
        redirect
      );

      instagramLogin.searchParams.set(
        "response_type",
        "code"
      );

      instagramLogin.searchParams.set(
        "scope",
        "instagram_business_basic"
      );

      const response = new Response(null, {
        status: 302,
        headers: {
          Location: instagramLogin.toString(),
          "Set-Cookie":
            `oauth_state=${encodeURIComponent(state)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`
        }
      });

      return response;
    }

    // Instagram callback
    if (url.pathname === "/auth/callback") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        return new Response(
          `Instagram authorization failed: ${error}`,
          { status: 400 }
        );
      }

      if (!code) {
        return new Response(
          "No authorization code returned.",
          { status: 400 }
        );
      }

      if (!env.META_APP_ID || !env.META_APP_SECRET) {
        return new Response(
          "META_APP_ID or META_APP_SECRET is missing.",
          { status: 500 }
        );
      }

      const redirect =
        env.REDIRECT_URI || `${url.origin}/auth/callback`;

      // Exchange authorization code for short-lived token
      const tokenResponse = await fetch(
        "https://api.instagram.com/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({
            client_id: env.META_APP_ID,
            client_secret: env.META_APP_SECRET,
            grant_type: "authorization_code",
            redirect_uri: redirect,
            code: code
          })
        }
      );

      const shortToken = await tokenResponse.json();

      if (!tokenResponse.ok || !shortToken.access_token) {
        return json({
          error: "Short-lived token exchange failed",
          details: shortToken
        }, 400);
      }

      // Exchange for long-lived token
      const longTokenUrl = new URL(
        "https://graph.instagram.com/access_token"
      );

      longTokenUrl.searchParams.set(
        "grant_type",
        "ig_exchange_token"
      );

      longTokenUrl.searchParams.set(
        "client_secret",
        env.META_APP_SECRET
      );

      longTokenUrl.searchParams.set(
        "access_token",
        shortToken.access_token
      );

      const longTokenResponse = await fetch(
        longTokenUrl.toString()
      );

      const longToken = await longTokenResponse.json();

      if (!longTokenResponse.ok || !longToken.access_token) {
        return json({
          error: "Long-lived token exchange failed",
          details: longToken
        }, 400);
      }

      // Store token in an HttpOnly cookie for this prototype
      const response = new Response(null, {
        status: 302,
        headers: {
          Location: "/",
          "Set-Cookie":
            `instagram_token=${encodeURIComponent(longToken.access_token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=5184000`
        }
      });

      return response;
    }

    // Deauthorization callback
    if (
      url.pathname === "/auth/deauthorize" &&
      request.method === "POST"
    ) {
      return json({
        ok: true,
        message: "Deauthorization received"
      });
    }

    // Data deletion callback
    if (
      url.pathname === "/auth/data-deletion" &&
      request.method === "POST"
    ) {
      return json({
        url: "https://profile-pulse.dissanayakecommon.workers.dev",
        confirmation_code: "profile-pulse-deletion"
      });
    }

    // Instagram insights
    if (url.pathname === "/api/insights") {
      const cookies = request.headers.get("Cookie") || "";

      const cookieToken = cookies
        .split(";")
        .map(item => item.trim())
        .find(item => item.startsWith("instagram_token="));

      const token = cookieToken
        ? decodeURIComponent(cookieToken.split("=")[1])
        : env.INSTAGRAM_ACCESS_TOKEN;

      const instagramId =
        env.INSTAGRAM_ID || "17841463531948420";

      if (!token) {
        return json({
          error: "Instagram is not connected"
        }, 401);
      }

      const response = await fetch(
        `https://graph.instagram.com/${instagramId}?fields=id,username,followers_count,media_count&access_token=${encodeURIComponent(token)}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        return json({
          error: "Instagram API request failed",
          details: data
        }, response.status || 400);
      }

      return json({
        mode: "instagram",
        instagram: data
      });
    }

    return json({ error: "Not found" }, 404);
  }
};

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization"
  };
}

function json(data, status = 200) {
  return new Response(
    JSON.stringify(data, null, 2),
    {
      status,
      headers: {
        "content-type": "application/json;charset=utf-8",
        ...cors()
      }
    }
  );
    }
            
