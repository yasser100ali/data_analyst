# 🚀 Quick Start - File Upload Feature

## ⚡ TL;DR

Your data analyst now accepts file uploads! Users can drag & drop CSV, Excel, PDF, and text files for analysis.

## 🎯 What You Need to Do

### 1. Get Vercel Blob Token (2 minutes)

```bash
1. Visit: https://vercel.com/dashboard
2. Select your project
3. Click: Storage → Blob → Create (or use existing)
4. Copy the "Read/Write Token"
```

### 2. Add to Environment Variables

**Local Development** (`.env`):
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**Vercel Deployment**:
```bash
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: BLOB_READ_WRITE_TOKEN = vercel_blob_rw_xxxxxxxxxxxxx
3. Apply to: Production, Preview, Development
```

**Railway Deployment** (optional):
```bash
1. Railway Dashboard → Your Service → Variables
2. Add: BLOB_READ_WRITE_TOKEN = vercel_blob_rw_xxxxxxxxxxxxx
```

### 3. Deploy & Test

```bash
# Local
pnpm run dev

# Or deploy to Vercel/Railway
git push
```

## ✅ Test It

1. Open your app
2. **Drag & drop** a CSV file onto the page
3. **OR** click the **📎 paperclip icon**
4. See the file attached
5. Send the message
6. File URL is sent to backend

## 🎨 What Users See

- **Drag anywhere** → Page overlay appears: "Drop files to attach"
- **Click paperclip** (bottom-left of input) → File picker opens
- **Attached files** → Show above input with ❌ to remove
- **Send** → Files upload to Blob, URLs sent to backend

## 🔧 Backend Processing (Next Step)

Add to `api/index.py` or create `api/utils/file_processor.py`:

```python
import requests
import pandas as pd
import io

def handle_attachments(messages):
    # Get attachments from last message
    if not messages or 'attachments' not in messages[-1]:
        return None
    
    attachments = messages[-1]['attachments']
    processed_data = []
    
    for file in attachments:
        url = file['url']
        file_type = file['type']
        
        if file_type == 'text/csv':
            # Download and parse CSV
            response = requests.get(url)
            df = pd.read_csv(io.StringIO(response.text))
            processed_data.append({
                'name': file['name'],
                'type': 'dataframe',
                'data': df
            })
    
    return processed_data
```

## 📦 Dependencies Added

Already installed:
- ✅ `@vercel/blob` - Blob storage client
- ✅ `lucide-react` - UI icons

## 🎯 Ready to Use!

That's it! Your file upload feature is ready. Users can now upload data files for analysis.

---

For detailed documentation, see:
- `FILE_UPLOAD_SETUP.md` - Complete setup guide
- `FEATURE_SUMMARY.md` - Feature overview
