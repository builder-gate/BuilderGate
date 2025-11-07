# Troubleshooting Guide - AppMokup

## ✅ Issues Fixed

### 1. Dev Server Won't Start (Turbopack/Next.js 16 Issue)

**Problem**:
```
Error: Next.js inferred your workspace root, but it may not be correct.
We couldn't find the Next.js package (next/package.json)
```

**Solution**:
- Downgraded from Next.js 16 to Next.js 15 (more stable)
- Removed conflicting `pnpm-lock.yaml` file
- Created `.npmrc` with `legacy-peer-deps=true`

```bash
# Commands used to fix:
rm -rf node_modules .next pnpm-lock.yaml
npm install next@15 --legacy-peer-deps
npm install --legacy-peer-deps
```

### 2. Hydration Mismatch Warning

**Problem**:
```
A tree hydrated but some attributes of the server rendered HTML didn't match
```

**Cause**: Browser extensions (Grammarly, etc.) modify the DOM

**Solution**: Added `suppressHydrationWarning` to body tag in `layout.tsx`:

```tsx
<body className="font-sans antialiased" suppressHydrationWarning>
```

### 3. Missing Dependency Error

**Problem**:
```
Module not found: Can't resolve '@react-native-async-storage/async-storage'
```

**Solution**: Installed the missing dependency:
```bash
npm install @react-native-async-storage/async-storage --legacy-peer-deps
```

### 4. WalletConnect URL Mismatch Warning

**Problem**:
```
The configured WalletConnect 'metadata.url':https://your-domain.com
differs from the actual page url:http://localhost:3000
```

**Solution**: Updated `.env` file:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note**: Change this to your production URL when deploying.

### 5. Peer Dependency Conflicts (vaul package)

**Problem**: The `vaul` package doesn't support React 19

**Solution**: Created `.npmrc` file with:
```
legacy-peer-deps=true
auto-install-peers=false
```

This allows npm to install packages despite peer dependency mismatches.

## 🔧 Current Configuration

### Files Created/Modified for Fixes

1. **`.npmrc`** (Created)
   ```
   legacy-peer-deps=true
   auto-install-peers=false
   ```

2. **`next.config.mjs`** (Modified)
   - Added webpack fallbacks for wallet libraries
   - Simplified configuration for Next.js 15

3. **`.env`** (Modified)
   - Updated `NEXT_PUBLIC_SITE_URL` to localhost for development

4. **`app/layout.tsx`** (Modified)
   - Added `suppressHydrationWarning` to body tag

### Dependencies Installed

```json
{
  "dependencies": {
    "@farcaster/miniapp-sdk": "^0.2.1",
    "@farcaster/miniapp-wagmi-connector": "^1.1.0",
    "@tanstack/react-query": "^5.90.7",
    "@react-native-async-storage/async-storage": "^1.x.x",
    "viem": "^2.38.6",
    "wagmi": "^2.19.2",
    "next": "15.5.6",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  }
}
```

## 🚀 How to Run the App

### Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

### Expected Console Messages (Normal)

These messages are **expected** and **safe** to ignore:

1. **Vercel Analytics Debug Mode**
   ```
   [Vercel Web Analytics] Debug mode is enabled by default in development
   ```
   - This is normal in development
   - No requests sent to analytics servers

2. **Lit Dev Mode Warning**
   ```
   Lit is in dev mode. Not recommended for production!
   ```
   - Only appears in development
   - Goes away in production build

3. **Farcaster SDK Messages**
   ```
   🔐 Attempting to get Farcaster context...
   📱 SDK context: undefined
   📍 Not in Farcaster environment
   ```
   - Normal when running in browser (not in Farcaster app)
   - Wallet will work with MetaMask/WalletConnect

## 🐛 Common Issues & Solutions

### Issue: "npm install" fails with peer dependency errors

**Solution**:
```bash
npm install --legacy-peer-deps
```

Or ensure `.npmrc` contains:
```
legacy-peer-deps=true
```

### Issue: ConnectButton not appearing

**Possible causes**:
1. Missing wallet dependencies
2. WagmiProvider not wrapping app
3. TypeScript errors

**Solution**:
```bash
# 1. Check dependencies are installed
npm list wagmi viem @tanstack/react-query

# 2. Verify layout.tsx has providers in correct order
# Should be: WagmiConfig → FarcasterProvider → ThemeProvider

# 3. Check for TypeScript errors
npx tsc --noEmit
```

### Issue: Wallet won't connect in browser

**Debugging steps**:

1. **Check console for errors**
   - Open browser DevTools (F12)
   - Look for red errors in Console tab

2. **Verify environment variables**
   ```bash
   # Check .env file exists and has correct values
   cat .env
   ```

3. **Test with MetaMask**
   - Install MetaMask extension
   - Click "Connect Wallet"
   - Should prompt for connection

4. **Test with WalletConnect**
   - If no MetaMask, WalletConnect should activate
   - QR code should appear for mobile wallet

### Issue: Hydration warnings persist

**Solution**:
1. Disable browser extensions (especially Grammarly, ad blockers)
2. Try in incognito mode
3. Ensure `suppressHydrationWarning` is on `<body>` tag

### Issue: Module not found errors

**Common missing modules**:
```bash
# Install all wallet-related dependencies
npm install --legacy-peer-deps \
  @farcaster/miniapp-sdk \
  @farcaster/miniapp-wagmi-connector \
  @tanstack/react-query \
  @react-native-async-storage/async-storage \
  viem \
  wagmi
```

## 📝 Development Checklist

Before reporting an issue, verify:

- [ ] `.npmrc` file exists with `legacy-peer-deps=true`
- [ ] `.env` file exists with all required variables
- [ ] `node_modules` and `.next` are from fresh install
- [ ] Running on Node.js v18 or higher
- [ ] No conflicting lock files (`pnpm-lock.yaml`, `yarn.lock`)
- [ ] Browser extensions disabled (for testing)
- [ ] Console checked for specific error messages

## 🔍 Debug Mode

To enable detailed logging:

1. **Wagmi Debug**
   ```tsx
   // In lib/wagmi.ts, add to config:
   export const config = createConfig({
     // ... existing config
     logger: {
       warn: console.warn,
     },
   })
   ```

2. **Network Requests**
   - Open DevTools → Network tab
   - Filter by "Fetch/XHR"
   - Check for failed requests

3. **React DevTools**
   - Install React Developer Tools extension
   - Components tab shows component tree
   - Profiler tab for performance issues

## 🚨 When to Reinstall

Perform fresh install if:
- Dependencies seem corrupted
- Multiple "module not found" errors
- Peer dependency conflicts persist
- Build cache issues

```bash
# Complete fresh install
rm -rf node_modules .next package-lock.json
npm install --legacy-peer-deps
npm run dev
```

## 📞 Getting Help

If issues persist:

1. Check browser console for specific errors
2. Review this troubleshooting guide
3. Check [WALLET_SETUP.md](./WALLET_SETUP.md) for configuration
4. Check [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for architecture

### Useful Information to Include

When reporting issues, include:
- Error message (full text)
- Browser and version
- Node.js version (`node -v`)
- npm version (`npm -v`)
- Operating system
- Steps to reproduce

## ✅ Verification Tests

Run these to verify everything works:

```bash
# 1. TypeScript compiles without errors
npx tsc --noEmit

# 2. Development server starts
npm run dev

# 3. Dependencies are installed correctly
npm list wagmi viem @farcaster/miniapp-sdk

# 4. Environment variables are loaded
npm run dev | grep "NEXT_PUBLIC_SITE_URL"
```

## 🎯 Success Indicators

You should see:
- ✅ Dev server starts on http://localhost:3000
- ✅ Page loads without errors
- ✅ ConnectButton visible in header
- ✅ Click "Connect Wallet" opens wallet selector
- ✅ Can connect with MetaMask or WalletConnect
- ✅ Wallet address displays after connection

---

**Last Updated**: 2025-11-07
**Status**: All known issues resolved ✅
