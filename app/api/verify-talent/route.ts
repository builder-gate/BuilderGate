import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7)

  try {
    console.log(`[${requestId}] 🚀 /api/verify-talent POST endpoint hit`)
    console.log(`[${requestId}] 📍 Request URL:`, request.url)
    console.log(`[${requestId}] 🔗 Origin:`, request.headers.get('origin'))

    const body = await request.json()
    const { username } = body

    console.log(`[${requestId}] 📦 Request body:`, { username })

    if (!username) {
      console.log(`[${requestId}] ❌ Missing username in request`)
      return NextResponse.json(
        { success: false, message: 'GitHub username is required' },
        { status: 400 }
      )
    }

    console.log(`[${requestId}] 📦 Looking up Talent Protocol score for:`, username)

    // Get API key from environment variables
    const apiKey = process.env.TALENT_API_KEY

    if (!apiKey) {
      console.error(`[${requestId}] ❌ TALENT_API_KEY is not configured`)
      return NextResponse.json(
        { success: false, message: 'Talent API key is not configured' },
        { status: 500 }
      )
    }

    console.log(`[${requestId}] ✅ API key found, making request to Talent Protocol API`)

    // Fetch Talent Protocol score using GitHub username
    const apiUrl = `https://api.talentprotocol.com/score?id=${username}&account_source=github`
    console.log(`[${requestId}] 🌐 Fetching from:`, apiUrl)

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey,
      },
    })

    console.log(`[${requestId}] 📡 Talent API response status:`, response.status)

    if (!response.ok) {
      console.error(`[${requestId}] ❌ Talent API error: ${response.status} ${response.statusText}`)
      throw new Error(`Talent API responded with status: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[${requestId}] 📊 Talent API response keys:`, Object.keys(data))
    console.log(`[${requestId}] 📄 Full Talent API JSON response:`, JSON.stringify(data, null, 2))

    // Extract score information
    const score = data?.score
    if (!score) {
      console.error(`[${requestId}] ❌ Invalid response structure from Talent API`)
      console.error(`[${requestId}] 📄 Full response (error):`, JSON.stringify(data, null, 2))
      return NextResponse.json(
        { success: false, message: 'Invalid response from Talent API' },
        { status: 500 }
      )
    }

    console.log(`[${requestId}] ✅ Score data extracted:`, {
      points: score.points,
      rank_position: score.rank_position,
      slug: score.slug,
      last_calculated_at: score.last_calculated_at
    })

    const proofData = {
      success: true,
      message: 'Talent Protocol verified successfully!',
      data: {
        platform: 'talent',
        username,
        points: score.points || 0,
        rank_position: score.rank_position,
        slug: score.slug || 'builder_score',
        last_calculated_at: score.last_calculated_at,
        verified: true,
        timestamp: new Date().toISOString(),
      }
    }

    console.log(`[${requestId}] ✅ Verification successful for user:`, username)
    console.log(`[${requestId}] 📤 Returning proof data with ${proofData.data.points} points`)

    return NextResponse.json(proofData, { status: 200 })
  } catch (error) {
    console.error(`[${requestId}] 🔴 Error in /api/verify-talent:`, {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    })
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify Talent Protocol'
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    )
  }
}
