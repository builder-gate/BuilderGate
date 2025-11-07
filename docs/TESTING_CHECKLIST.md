# Self Protocol Verification Testing Checklist

## Pre-Test Setup ✅

- [x] ngrok running on `https://codalabs.ngrok.io`
- [x] `.env.local` configured with ngrok domain
- [ ] Development server running (`npm run dev`)
- [ ] Self Protocol mobile app installed on phone
- [ ] Wallet connected in BuilderGate

## Test Endpoints

### 1. Health Check
```bash
curl https://codalabs.ngrok.io/api/verify-self
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Self Protocol verification endpoint is active",
  "scope": "buildergate"
}
```

### 2. Check ngrok Web Interface
Open `http://127.0.0.1:4040` to monitor requests

## Verification Flow Test Steps

### Step 1: Connect Wallet
1. Open `https://codalabs.ngrok.io` in browser
2. Click "Connect Wallet"
3. Connect with MetaMask/WalletConnect/Farcaster
4. Verify wallet address appears in UI

### Step 2: Open Self Protocol Modal
1. Scroll to "Identity Verification" section
2. Click "Verify Now" on Self Protocol card
3. Modal should open with:
   - "Open Self App" button
   - "Copy Link" button
   - "Show QR" button

### Step 3: Initiate Verification
Choose ONE method:

**Option A: QR Code (Desktop → Mobile)**
1. Click "Show QR" button
2. Scan QR code with Self mobile app
3. Complete verification in Self app

**Option B: Deeplink (Mobile)**
1. Click "Open Self App" button
2. Self app should open automatically
3. Complete verification in Self app

**Option C: Copy Link (Any Device)**
1. Click "Copy Link"
2. Paste link in Self mobile app
3. Complete verification in Self app

### Step 4: Monitor Backend
Watch development server console for:
```
🚀 /api/verify-self POST endpoint hit!
📦 Request body keys: ['attestationId', 'proof', 'publicSignals', 'userContextData']
✅ Stored verification for wallet: 0x...
📅 Date of birth: YYYY-MM-DD
```

Watch ngrok web interface (`http://127.0.0.1:4040`) for:
- POST request to `/api/verify-self` from Self app
- Polling GET requests to `/api/verify-self/check` from frontend

### Step 5: Verify Success
Modal should show:
1. ✅ Green checkmark animation
2. Verification data:
   - Date of Birth: `YYYY-MM-DD`
   - Name: (if disclosed)
   - Nationality: (if disclosed)
3. Auto-close after 1.5 seconds

Main UI should update:
1. Self Protocol card shows "Verified" ✅
2. Card has accent border
3. Button disabled with "Verified" text

## Common Issues & Solutions

### ❌ Issue: Modal opens but QR doesn't show
**Check:**
- `selfApp` is initialized (check browser console)
- No JavaScript errors in console
- `NEXT_PUBLIC_SITE_URL` is set correctly

### ❌ Issue: Verification timeout (5 minutes)
**Check:**
- ngrok tunnel is active: `curl https://codalabs.ngrok.io/api/verify-self`
- Self app completed verification (check phone)
- Backend received callback (check server logs)
- Polling is working (check ngrok web interface for `/check` requests)

### ❌ Issue: Backend doesn't receive callback
**Check:**
1. ngrok tunnel status: `curl https://codalabs.ngrok.io/api/verify-self`
2. Self app has network connection
3. Universal link format is correct in console logs
4. Backend endpoint is correct: `https://codalabs.ngrok.io/api/verify-self`

### ❌ Issue: Verification cache miss
**Check:**
- Wallet address matches between verification and polling
- Verification cache hasn't expired (1 hour TTL)
- Server console shows "Stored verification for wallet"

## Debug Commands

```bash
# Check ngrok tunnel
curl https://codalabs.ngrok.io/api/verify-self

# Check local endpoint
curl http://localhost:3000/api/verify-self

# Test polling endpoint
curl -X POST https://codalabs.ngrok.io/api/verify-self/check \
  -H "Content-Type: application/json" \
  -d '{"userId":"0xYourWalletAddress"}'

# View ngrok traffic
open http://127.0.0.1:4040
```

## Expected Console Output

### Frontend (Browser Console)
```
🔧 Self Protocol Configuration: {
  verificationMode: 'backend',
  endpoint: 'https://codalabs.ngrok.io/api/verify-self',
  endpointType: 'https',
  scope: 'buildergate',
  userId: '0x...'
}

🔗 Generated Self deeplink: self://...
📍 Verification endpoint: https://codalabs.ngrok.io/api/verify-self
👤 User address: 0x...
✅ Opened Self app with Farcaster SDK
```

### Backend (Server Console)
```
🚀 /api/verify-self POST endpoint hit!
📦 Request body keys: [ 'attestationId', 'proof', 'publicSignals', 'userContextData' ]
✅ Stored verification for wallet: 0x...
📅 Date of birth: 1990-01-01
🗂️ Cache size: 1
```

### Polling Requests
```
[abc123] 📥 Verification check request: { userId: '0x...', ... }
[abc123] ✅ Returning valid verification
```

## Success Criteria ✅

- [ ] Wallet connected successfully
- [ ] Self modal opens with QR code
- [ ] Deeplink opens Self mobile app
- [ ] Backend receives zkProof callback
- [ ] Verification stored in cache
- [ ] Frontend polling retrieves verification
- [ ] Modal shows success with data
- [ ] UI updates to verified state
- [ ] Builder score unlocked (if all verifications complete)

## Next Steps After Successful Test

1. ✅ Test other verification methods (GitHub, Talent Protocol)
2. ✅ Test token swap and vault features
3. ✅ Test in Farcaster Mini App environment
4. ✅ Deploy to production with real domain
