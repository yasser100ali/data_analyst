/**
 * Troubleshooting Guide for File Upload Issues
 */

# File Upload Troubleshooting

## Step 1: Check Browser Console

Open your browser's developer console (F12 or Cmd+Option+I) and look for these messages when you upload a file:

### Expected Messages (Success):
```
🔧 Upload mode: Production (Vercel Blob)
⬆ Uploading all_seasons.csv to Vercel Blob as all_seasons_1701234567890.csv...
```

### Error Messages to Look For:

1. **"BLOB_READ_WRITE_TOKEN is not configured"**
   - Solution: Go to Vercel dashboard → Storage → Create Blob storage
   - The token will be automatically added to your environment variables

2. **"Upload failed: [specific error]"**
   - Check the full error message in console
   - Common errors:
     - Network error: Check your internet connection
     - CORS error: Backend configuration issue
     - 403 Forbidden: Token not configured or invalid

3. **"Using cached URL for [filename]"**
   - This is GOOD - means cache is working
   - If you see this but still get errors, the cached URL might be invalid

## Step 2: Clear Cache (If Needed)

If cached URLs are causing issues:

```javascript
// Open browser console on your site
localStorage.removeItem('atlas_file_upload_cache')
// Then refresh and try again
```

## Step 3: Test Upload Flow

1. **Open browser DevTools** → Network tab
2. **Upload a file** 
3. **Look for these requests:**
   - `/api/blob/upload` - Should return 200 OK with a token
   - Vercel blob domain request - Should upload the file

## Step 4: Verify Environment

Check if you're actually hitting production:

```javascript
// In browser console on your production site:
console.log(window.location.hostname)
// Should show your Vercel domain, NOT localhost
```

## Step 5: Check Vercel Blob Storage

1. Go to Vercel Dashboard → Your Project → Storage → Blob
2. Check if files are being uploaded
3. Look for any error messages

## Common Issues & Solutions

### Issue: "One or more uploads failed" immediately
**Cause:** BLOB_READ_WRITE_TOKEN not configured
**Solution:** Set up Vercel Blob storage in dashboard

### Issue: Error only happens with duplicate filenames
**Cause:** This is now fixed with timestamp suffixes
**Solution:** Deploy the latest code changes

### Issue: Cache not working
**Cause:** localStorage might be disabled or cache expired
**Solution:** 
```javascript
// Check if localStorage is working
console.log(localStorage.getItem('atlas_file_upload_cache'))
// Should show cached files or null
```

### Issue: Wrong environment detection
**Cause:** Browser thinks it's in dev when in prod or vice versa
**Solution:** Check console for "🔧 Upload mode:" message
- Should say "Production (Vercel Blob)" on your Vercel domain
- Should say "Development (local backend)" on localhost

## Debug Commands

Run these in your browser console on the production site:

```javascript
// Check cache contents
console.log(localStorage.getItem('atlas_file_upload_cache'))

// Check environment detection
console.log('Hostname:', window.location.hostname)
console.log('Is Dev?', window.location.hostname === 'localhost')

// Clear cache
localStorage.removeItem('atlas_file_upload_cache')

// Test cache functions (only in dev mode)
if (window.atlasFileCache) {
  window.atlasFileCache.stats()
}
```

## Still Not Working?

Share the following information:
1. Complete error message from browser console
2. Network tab showing the failed requests
3. Result of: `console.log(window.location.hostname)`
4. Whether you've set up Vercel Blob storage

