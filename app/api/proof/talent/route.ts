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

    // Get API key from environment variables
    const apiKey = process.env.TALENT_API_KEY

    if (!apiKey) {
      console.error('TALENT_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Talent API key is not configured' },
        { status: 500 }
      )
    }

    // Fetch Talent Protocol score using GitHub username
    const apiUrl = `https://api.talentprotocol.com/score?id=${username}&account_source=github`
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`Talent API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Extract score information
    const score = data?.score
    if (!score) {
      return NextResponse.json(
        { error: 'Invalid response from Talent API' },
        { status: 500 }
      )
    }

    const proofData = {
      platform: 'talent',
      username,
      points: score.points || 0,
      rank_position: score.rank_position,
      slug: score.slug || 'builder_score',
      last_calculated_at: score.last_calculated_at,
      verified: true,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(proofData, { status: 200 })
  } catch (error) {
    console.error('Error in /api/proof/talent:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate Talent proof'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
