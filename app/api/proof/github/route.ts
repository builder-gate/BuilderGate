import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Extract username from query parameters
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username parameter is required' },
        { status: 400 }
      )
    }

    // Fetch GitHub stats from github-readme-stats API
    const apiUrl = `https://github-readme-stats.vercel.app/api?username=${username}&include_all_commits=true&count_private=true`
    const response = await fetch(apiUrl)

    if (!response.ok) {
      throw new Error(`GitHub API responded with status: ${response.status}`)
    }

    const svgText = await response.text()

    // Extract rank from the SVG title
    // Pattern: "..., Rank: A" or "..., Rank: S" etc.
    const rankMatch = svgText.match(/Rank:\s*([A-Z]\+?)/i)
    const rank = rankMatch ? rankMatch[1] : 'D'

    const proofData = {
      platform: 'github',
      username,
      rank,
      verified: true,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(proofData, { status: 200 })
  } catch (error) {
    console.error('Error in /api/proof/github:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate GitHub proof'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
