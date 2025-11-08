import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[${requestId}] 🚀 GitHub OAuth callback hit`)

    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      console.error(`[${requestId}] ❌ GitHub OAuth error:`, error)
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
          <head><title>GitHub Auth Error</title></head>
          <body>
            <script>
              window.opener.postMessage({
                type: 'github-auth-error',
                error: '${error}'
              }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    if (!code) {
      console.error(`[${requestId}] ❌ No authorization code received`)
      return NextResponse.json({ error: 'No code provided' }, { status: 400 })
    }

    console.log(`[${requestId}] ✅ Authorization code received`)

    // Exchange code for access token
    const clientId = process.env.GITHUB_CLIENT_ID
    const clientSecret = process.env.GITHUB_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error(`[${requestId}] ❌ GitHub OAuth credentials not configured`)
      return NextResponse.json({ error: 'OAuth not configured' }, { status: 500 })
    }

    console.log(`[${requestId}] 🔑 Exchanging code for access token`)

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log(`[${requestId}] 📡 Token response keys:`, Object.keys(tokenData))

    if (tokenData.error) {
      console.error(`[${requestId}] ❌ Token exchange error:`, tokenData.error)
      throw new Error(tokenData.error_description || tokenData.error)
    }

    const accessToken = tokenData.access_token

    // Fetch user profile
    console.log(`[${requestId}] 👤 Fetching GitHub user profile`)

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const userData = await userResponse.json()
    console.log(`[${requestId}] 📊 User data keys:`, Object.keys(userData))
    console.log(`[${requestId}] 📄 GitHub user data:`, JSON.stringify(userData, null, 2))

    // Fetch user emails
    console.log(`[${requestId}] 📧 Fetching user emails`)

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    })

    const emailsData = await emailsResponse.json()
    console.log(`[${requestId}] 📧 Emails data:`, JSON.stringify(emailsData, null, 2))

    // Get primary email
    const primaryEmail = emailsData.find((e: any) => e.primary)?.email || emailsData[0]?.email || null

    const githubData = {
      username: userData.login,
      email: primaryEmail,
      name: userData.name,
      avatar: userData.avatar_url,
      verified: true,
      timestamp: new Date().toISOString(),
    }

    console.log(`[${requestId}] ✅ GitHub verification successful:`, {
      username: githubData.username,
      email: githubData.email,
      name: githubData.name
    })

    // Return HTML that posts message to parent window
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Auth Success</title></head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github-auth-success',
              data: ${JSON.stringify(githubData)}
            }, '*');
            window.close();
          </script>
          <p>Authentication successful! This window will close automatically...</p>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    })

  } catch (error) {
    console.error(`[${requestId}] 🔴 GitHub OAuth callback error:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })

    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head><title>GitHub Auth Error</title></head>
        <body>
          <script>
            window.opener.postMessage({
              type: 'github-auth-error',
              error: '${error instanceof Error ? error.message : 'Unknown error'}'
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    })
  }
}
