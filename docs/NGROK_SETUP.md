# ngrok Setup for Self Protocol HTTPS Verification

Self Protocol backend verification requires HTTPS endpoints to receive zkProof callbacks. This guide shows how to use ngrok to expose your local development server via HTTPS.

## Prerequisites

1. **ngrok account and authtoken** - Sign up at [ngrok.com](https://ngrok.com)
2. **ngrok CLI installed** - Download from [ngrok.com/download](https://ngrok.com/download)
3. **Reserved domain** - `codalabs.ngrok.io` (configured in ngrok dashboard)

## Quick Start

### 1. Configure ngrok Authtoken

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### 2. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3000`

### 3. Start ngrok Tunnel (in separate terminal)

```bash
ngrok http --domain=codalabs.ngrok.io 3000
```

**Output should show:**
```
Session Status                online
Account                       your-account (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://codalabs.ngrok.io -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

### 4. Verify HTTPS Endpoint

Test the Self Protocol verification endpoint:

```bash
curl https://codalabs.ngrok.io/api/verify-self
```

Expected response:
```json
{
  "status": "ok",
  "message": "Self Protocol verification endpoint is active",
  "scope": "buildergate"
}
```

## Environment Configuration

The app is pre-configured for ngrok in `.env.local`:

```env
# Site Configuration (ngrok HTTPS domain)
NEXT_PUBLIC_SITE_NAME=BuilderGate
NEXT_PUBLIC_SITE_URL=https://codalabs.ngrok.io

# Self Protocol Configuration
NEXT_PUBLIC_SELF_SCOPE=buildergate
NEXT_PUBLIC_SELF_APP_NAME=BuilderGate
NEXT_PUBLIC_SELF_USE_MOCK=false
NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK=https://codalabs.ngrok.io
```

**Important**: `NEXT_PUBLIC_SITE_URL` must match your ngrok domain exactly.

## Self Protocol Verification Flow

1. **User initiates verification** - Opens Self modal in BuilderGate
2. **SDK generates deeplink** - Points to `https://codalabs.ngrok.io/api/verify-self`
3. **User scans QR or opens link** - Self mobile app opens
4. **Self app completes verification** - Generates zkProof
5. **Self app sends callback** - POST request to `https://codalabs.ngrok.io/api/verify-self`
6. **Backend verifies proof** - Stores result in cache
7. **Frontend polls status** - GET request to `https://codalabs.ngrok.io/api/verify-self/check`
8. **Success** - Verification complete

## Monitoring ngrok Traffic

### Web Interface

Access ngrok's web interface at `http://127.0.0.1:4040` to:
- View all HTTP requests in real-time
- Inspect request/response headers and bodies
- Replay requests for debugging
- See Self Protocol callback payloads

### Useful Endpoints to Monitor

- `POST /api/verify-self` - Self app zkProof callback
- `POST /api/verify-self/check` - Frontend polling requests
- `GET /api/verify-self` - Health check

## Troubleshooting

### Issue: "ngrok not found"

**Solution**: Install ngrok CLI
```bash
# macOS (Homebrew)
brew install ngrok

# Or download from https://ngrok.com/download
```

### Issue: "Domain not found"

**Solution**: Use reserved domain from ngrok dashboard
```bash
# If you don't have a reserved domain, use random URL:
ngrok http 3000

# Then update .env.local with the generated URL
```

### Issue: "Self Protocol callback not received"

**Checklist**:
1. ✅ ngrok tunnel is running (`https://codalabs.ngrok.io` accessible)
2. ✅ Development server is running (`localhost:3000`)
3. ✅ `.env.local` has correct `NEXT_PUBLIC_SITE_URL`
4. ✅ Self mobile app is installed on phone
5. ✅ Wallet is connected in BuilderGate

**Debug steps**:
```bash
# 1. Check ngrok is forwarding
curl https://codalabs.ngrok.io/api/verify-self

# 2. Check backend endpoint directly
curl http://localhost:3000/api/verify-self

# 3. Monitor ngrok web interface at http://127.0.0.1:4040
```

### Issue: "Verification timeout"

**Possible causes**:
- Self mobile app not completing verification
- Network latency between Self app and ngrok
- Backend verification error (check console logs)

**Solution**: Check server logs for errors:
```bash
# Server console should show:
# 🚀 /api/verify-self POST endpoint hit!
# ✅ Stored verification for wallet: 0x...
```

## Alternative: Using Different Domain

If you need to use a different ngrok domain:

1. **Update `.env.local`**:
```env
NEXT_PUBLIC_SITE_URL=https://your-custom-domain.ngrok.io
NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK=https://your-custom-domain.ngrok.io
```

2. **Restart dev server** (Next.js needs to reload env vars)
```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

3. **Start ngrok with new domain**:
```bash
ngrok http --domain=your-custom-domain.ngrok.io 3000
```

## Production Deployment

For production, replace ngrok with:
- **Vercel** - Automatic HTTPS with custom domains
- **Netlify** - Built-in SSL certificates
- **AWS/GCP** - Load balancer with SSL termination

Update `.env.production`:
```env
NEXT_PUBLIC_SITE_URL=https://buildergate.com
NEXT_PUBLIC_SELF_DEEPLINK_CALLBACK=https://buildergate.com
```

## Security Notes

⚠️ **Development Only**: ngrok tunnels expose your local server to the internet. Only use for development.

✅ **Safe for Self Protocol**: Self Protocol callbacks use zkProofs (cryptographically verified) so ngrok exposure is safe for testing.

🔒 **Production**: Use proper SSL certificates and secure hosting for production deployments.

## Additional Resources

- [ngrok Documentation](https://ngrok.com/docs)
- [Self Protocol Docs](https://docs.self.xyz)
- [Reserved Domains Setup](https://dashboard.ngrok.com/cloud-edge/domains)
- [BuilderGate README](../README.md)
