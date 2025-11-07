# API Documentation - Proof Endpoints

## Base URL
```
http://localhost:4000/api/proof
```

---

## GET /api/proof/github

Endpoint to verify and retrieve GitHub proof data. Fetches GitHub stats from [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) and extracts the user's rank.

### Request

**Method:** `GET`

**URL:** `/api/proof/github`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | **Yes** | GitHub username to verify |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/proof/github?username=dpinones"
```

**Example Request (JavaScript):**
```javascript
const response = await fetch('/api/proof/github?username=dpinones')
const data = await response.json()
```

### Response

**Success Response (200 OK):**
```json
{
  "platform": "github",
  "username": "dpinones",
  "rank": "A",
  "verified": true,
  "timestamp": "2025-11-07T12:34:56.789Z"
}
```

**Error Response - Missing Username (400 Bad Request):**
```json
{
  "error": "Username parameter is required"
}
```

**Error Response - API Error (500 Internal Server Error):**
```json
{
  "error": "GitHub API responded with status: 404"
}
```

### Rank Values

The GitHub rank can be one of the following:
- `S+` (Top 1%)
- `S` (Top 5%)
- `A+` (Top 10%)
- `A` (Top 20%)
- `B+` (Top 30%)
- `B` (Top 40%)
- `C` (Below 40%)
- `D` (Default - when rank cannot be extracted)

---

## GET /api/proof/talent

Endpoint to verify and retrieve Talent Protocol proof data. Fetches builder score from [Talent Protocol API](https://docs.talentprotocol.com/) using GitHub username.

### Request

**Method:** `GET`

**URL:** `/api/proof/talent`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| username | string | **Yes** | GitHub username to look up in Talent Protocol |

**Example Request:**
```bash
curl -X GET "http://localhost:4000/api/proof/talent?username=ArturVargas"
```

**Example Request (JavaScript):**
```javascript
const response = await fetch('/api/proof/talent?username=ArturVargas')
const data = await response.json()
```

### Response

**Success Response (200 OK):**
```json
{
  "platform": "talent",
  "username": "ArturVargas",
  "points": 69,
  "rank_position": null,
  "slug": "builder_score",
  "last_calculated_at": "2025-11-07T04:04:36Z",
  "verified": true,
  "timestamp": "2025-11-07T12:34:56.789Z"
}
```

**Error Response - Missing Username (400 Bad Request):**
```json
{
  "error": "Username parameter is required"
}
```

**Error Response - API Key Not Configured (500 Internal Server Error):**
```json
{
  "error": "Talent API key is not configured"
}
```

**Error Response - Invalid API Response (500 Internal Server Error):**
```json
{
  "error": "Invalid response from Talent API"
}
```

**Error Response - API Error (500 Internal Server Error):**
```json
{
  "error": "Talent API responded with status: 404"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| platform | string | Always "talent" |
| username | string | GitHub username used for lookup |
| points | number | Builder score points |
| rank_position | number \| null | Global rank position (null if not ranked) |
| slug | string | Score type identifier (e.g., "builder_score") |
| last_calculated_at | string | ISO 8601 timestamp of last score calculation |
| verified | boolean | Always true for successful responses |
| timestamp | string | ISO 8601 timestamp of request |

---

## Usage Examples

### From React Component

```typescript
'use client'

import { useState } from 'react'

export default function ProofChecker() {
  const [githubProof, setGithubProof] = useState(null)
  const [talentProof, setTalentProof] = useState(null)

  const checkGithubProof = async () => {
    try {
      const response = await fetch('/api/proof/github?username=dpinones')
      const data = await response.json()
      setGithubProof(data)
    } catch (error) {
      console.error('Error fetching GitHub proof:', error)
    }
  }

  const checkTalentProof = async () => {
    try {
      const response = await fetch('/api/proof/talent?username=ArturVargas')
      const data = await response.json()
      setTalentProof(data)
    } catch (error) {
      console.error('Error fetching Talent proof:', error)
    }
  }

  return (
    <div>
      <button onClick={checkGithubProof}>Check GitHub Proof</button>
      <button onClick={checkTalentProof}>Check Talent Proof</button>

      {githubProof && <pre>{JSON.stringify(githubProof, null, 2)}</pre>}
      {talentProof && <pre>{JSON.stringify(talentProof, null, 2)}</pre>}
    </div>
  )
}
```

### Using Fetch with Error Handling

```typescript
async function getGithubProof(username: string) {
  try {
    const response = await fetch(`/api/proof/github?username=${username}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching GitHub proof:', error)
    throw error
  }
}

async function getTalentProof(username: string) {
  try {
    const response = await fetch(`/api/proof/talent?username=${username}`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching Talent proof:', error)
    throw error
  }
}

// Usage
const githubData = await getGithubProof('dpinones')
const talentData = await getTalentProof('ArturVargas')
```

### Using with Wagmi Hooks (Web3 Integration)

```typescript
'use client'

import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'

export default function Web3ProofChecker() {
  const { address, isConnected } = useAccount()
  const [proof, setProof] = useState(null)

  useEffect(() => {
    if (isConnected && address) {
      // Example: Fetch proof using a GitHub username
      // You might store the GitHub username in your user profile
      const githubUsername = 'dpinones' // Get from user profile
      fetch(`/api/proof/github?username=${githubUsername}`)
        .then(res => res.json())
        .then(data => setProof(data))
        .catch(console.error)
    }
  }, [isConnected, address])

  return (
    <div>
      {isConnected ? (
        <div>
          <p>Connected: {address}</p>
          {proof && <pre>{JSON.stringify(proof, null, 2)}</pre>}
        </div>
      ) : (
        <p>Please connect your wallet</p>
      )}
    </div>
  )
}
```

---

## Notes

- **GitHub endpoint** fetches real data from github-readme-stats API and extracts rank
- **Talent endpoint** fetches real data from Talent Protocol API using GitHub username and `account_source=github` parameter
- The Talent API key is stored in `.env` as `TALENT_API_KEY` (server-side only, no NEXT_PUBLIC prefix)
- Both endpoints can use the **same GitHub username** for unified user verification
- Consider adding authentication/authorization if needed
- Add rate limiting for production environments to avoid API abuse
- The GitHub rank is calculated based on commits, PRs, issues, stars, and contributions
- GitHub stats are cached by the github-readme-stats API
- Talent Protocol scores are updated periodically by their system
