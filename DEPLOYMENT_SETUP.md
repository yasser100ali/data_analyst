# Deployment Setup Guide

## Issue: "One or more uploads failed" in Production

This error occurs because Vercel Blob storage was rejecting duplicate file uploads. **This has been fixed with intelligent file caching!**

## ✅ Solution Implemented: Smart File Upload Caching

### How It Works

The app now caches file uploads using localStorage:

1. **First Upload**: File is uploaded to Vercel Blob and the URL is cached
2. **Subsequent Uploads**: If the same file (name + size + type) is uploaded again, the cached URL is used
3. **Cache Expiry**: Cached URLs expire after 7 days
4. **Automatic Cleanup**: Expired cache entries are cleaned on app load

### Cache Key Strategy

Files are cached based on:
- File name
- File size  
- File type (MIME type)

This means if you upload `all_seasons.csv` (1.92 MB), it will be cached. If you upload the same file again, it uses the cached URL without re-uploading.

### Benefits

✅ Prevents "duplicate file" errors from Vercel Blob  
✅ Faster uploads (instant for cached files)  
✅ Reduces bandwidth usage  
✅ Better user experience  

### Debugging Cache (Development Only)

In development mode, you can access cache utilities in the browser console:

```javascript
// View all cached files
window.atlasFileCache.stats()

// Clear the cache
window.atlasFileCache.clear()

// View raw cache data
window.atlasFileCache.get()
```

## Initial Setup: Configure Vercel Blob Storage

### Step 1: Get Your Blob Storage Token

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (`dataanalyst-zeta`)
3. Go to **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Follow the prompts to create a Blob store
6. After creation, Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` to your environment variables

### Step 2: Verify Environment Variable

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Verify that `BLOB_READ_WRITE_TOKEN` exists
3. If it doesn't exist, add it manually with the token from your Blob store

### Step 3: Redeploy

After adding the environment variable, trigger a new deployment:

```bash
git add .
git commit -m "Fix upload configuration"
git push origin main
```

Or redeploy from the Vercel dashboard.

## Alternative: Use Existing Backend for Uploads

If you don't want to use Vercel Blob, you can modify the frontend to always use your FastAPI backend for uploads. However, note that FastAPI on Vercel has filesystem limitations.

## Model Configuration

The API has been fixed to use `gpt-4o-mini` (a valid OpenAI model). If you need a more powerful model, use `gpt-4o` instead.

## Environment Variables Checklist

Make sure these are set in your Vercel project:

- ✅ `BLOB_READ_WRITE_TOKEN` (for file uploads)
- ✅ `OPENAI_API_KEY` (for AI chat)
- ✅ `E2B_API_KEY` (if using code execution)

## Testing

After deployment:

1. Go to your production site
2. Try uploading a CSV file
3. Ask a question about the data
4. The upload should now work without errors

## Local Development

For local development, the app will use the FastAPI backend endpoint at `/api/upload` instead of Vercel Blob (as configured in `multimodal-input.tsx` line 300).

