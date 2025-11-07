import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[${requestId}] 🚀 /api/verify-github POST endpoint hit`)
    console.log(`[${requestId}] 📍 Request URL:`, request.url)
    console.log(`[${requestId}] 🔗 Origin:`, request.headers.get('origin'))

    const body = await request.json()
    const { username } = body

    console.log(`[${requestId}] 📦 Request body:`, { username })

    if (!username) {
      console.log(`[${requestId}] ❌ Missing username in request`)
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      )
    }

    // Fetch GitHub stats from github-readme-stats API
    const apiUrl = `https://github-readme-stats.vercel.app/api?username=${username}&include_all_commits=true&count_private=true`
    console.log(`[${requestId}] 🌐 Fetching from:`, apiUrl)

    const response = await fetch(apiUrl)

    console.log(`[${requestId}] 📡 GitHub stats API response status:`, response.status)
    console.log(`[${requestId}] 📋 Content-Type:`, response.headers.get('content-type'))

    if (!response.ok) {
      console.error(`[${requestId}] ❌ GitHub API error: ${response.status} ${response.statusText}`)
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const svgText = await response.text()
    console.log(`[${requestId}] 📄 Received SVG data length:`, svgText.length)
    console.log(`[${requestId}] 📄 GitHub stats API SVG response (first 500 chars):`, svgText.substring(0, 500))

    // Extract rank from the SVG title
    // Pattern: "..., Rank: A" or "..., Rank: S" etc.
    const rankMatch = svgText.match(/Rank:\s*([A-Z]\+?)/i)
    const rank = rankMatch ? rankMatch[1] : 'D'

    console.log(`[${requestId}] 🏆 Extracted rank:`, rank)
    console.log(`[${requestId}] 🔍 Rank match details:`, {
      found: !!rankMatch,
      fullMatch: rankMatch ? rankMatch[0] : null,
      rank
    })

    // Log additional stats if available
    const statsMatch = svgText.match(/Total Stars Earned: ([\d,]+)|Total Commits.*?: ([\d,]+)|Total PRs.*?: ([\d,]+)/gi)
    if (statsMatch) {
      console.log(`[${requestId}] 📊 Additional stats found:`, statsMatch)
    }

    const proofData = {
      success: true,
      message: 'GitHub verified successfully!',
      data: {
        platform: 'github',
        username,
        rank,
        verified: true,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`[${requestId}] ✅ Verification successful for user:`, username)
    console.log(`[${requestId}] 📤 Returning proof data with rank:`, rank)

    return NextResponse.json(proofData, { status: 200 })
  } catch (error) {
    console.error(`[${requestId}] 🔴 Error in /api/verify-github:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify GitHub'
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
