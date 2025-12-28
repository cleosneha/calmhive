# Vector Embeddings Setup Guide

## Overview

CalmHive stores user onboarding data as vector embeddings in two vector databases:

- **Qdrant**: Open-source, can run locally or in cloud
- **Pinecone**: Managed service, serverless

This enables semantic search and similarity matching for user profiles.

---

## 1. Mistral AI Setup (Embeddings Model)

### Get API Key

1. Go to [Mistral AI Console](https://console.mistral.ai)
2. Create an account / Sign in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and add to `.env`:
   ```
   MISTRAL_API_KEY=your-mistral-api-key
   ```

---

## 2. Qdrant Setup

### Option A: Local (Development)

Run Qdrant using Docker:

```bash
docker run -p 6333:6333 qdrant/qdrant
```

Set in `.env`:

```
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=  # Leave empty for local
```

### Option B: Qdrant Cloud (Production)

1. Go to [Qdrant Cloud](https://cloud.qdrant.io)
2. Create an account
3. Create a new cluster
4. Get your cluster URL and API key
5. Set in `.env`:
   ```
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-qdrant-api-key
   ```

---

## 3. Pinecone Setup

### Get API Key

1. Go to [Pinecone](https://app.pinecone.io)
2. Create an account / Sign in
3. Navigate to API Keys
4. Copy your API key
5. Add to `.env`:
   ```
   PINECONE_API_KEY=your-pinecone-api-key
   ```

### Index Configuration

The index is automatically created with these specs:

- **Name**: `calmhive-onboarding`
- **Dimension**: 1024 (Mistral-embed)
- **Metric**: Cosine similarity
- **Cloud**: AWS (us-east-1)
- **Type**: Serverless

---

## 4. How It Works

### Storage Flow

1. User completes onboarding
2. Responses are converted to text format
3. Mistral generates embedding (1024-dimensional vector)
4. Embedding stored in both Qdrant & Pinecone with userId

### Data Structure

Each vector point contains:

- **ID**: User ID
- **Vector**: 1024-dimensional embedding
- **Metadata**:
  - userId
  - responses (JSON)
  - text (full onboarding text)
  - createdAt (timestamp)

### Usage Examples

#### Search Similar Profiles (Qdrant)

```typescript
import { searchSimilarProfilesQdrant } from "@/ai/utils/onboarding-vectors";

const similar = await searchSimilarProfilesQdrant(
  "I want to reduce stress and improve sleep",
  5 // top 5 matches
);
```

#### Search Similar Profiles (Pinecone)

```typescript
import { searchSimilarProfilesPinecone } from "@/ai/utils/onboarding-vectors";

const similar = await searchSimilarProfilesPinecone(
  "Morning person with busy schedule",
  5
);
```

#### Delete User Data

```typescript
import { deleteOnboardingEmbeddings } from "@/ai/utils/onboarding-vectors";

await deleteOnboardingEmbeddings(userId);
```

---

## 5. Testing

### Initialize Collections/Indexes

Collections and indexes are created automatically on first use. To manually initialize:

```typescript
import { initQdrantCollection } from "@/ai/config/qdrant";
import { initPineconeIndex } from "@/ai/config/pinecone";

await initQdrantCollection();
await initPineconeIndex();
```

### Check Storage

After a user completes onboarding, check:

- Qdrant: http://localhost:6333/dashboard (local) or Qdrant Cloud dashboard
- Pinecone: https://app.pinecone.io → Select index → View vectors

---

## 6. Docker Compose (Optional)

Add Qdrant to your `docker-compose.yml`:

```yaml
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

volumes:
  qdrant_data:
```

Run: `docker-compose up -d`

---

## 7. Cost Considerations

### Mistral AI

- **mistral-embed**: ~$0.10 per 1M tokens
- Each onboarding: ~500 tokens = $0.00005

### Qdrant

- Local: Free
- Cloud: Free tier available, then pay-as-you-go

### Pinecone

- Serverless: Pay per usage
- Free tier: 1M vectors
- After free tier: ~$0.002 per 1K storage/month

---

## 8. Troubleshooting

### "Connection refused" error

- Check if Qdrant is running: `curl http://localhost:6333`
- Verify Docker container: `docker ps | grep qdrant`

### "Invalid API key" error

- Verify `.env` has correct API keys
- Restart Next.js dev server after changing `.env`

### "Collection/Index not found"

- Collections/indexes are created automatically
- Check logs for initialization errors

---

## 9. Production Checklist

- [ ] Use Qdrant Cloud or managed instance
- [ ] Set strong API keys
- [ ] Enable HTTPS for Qdrant URL
- [ ] Set up backups for vector data
- [ ] Monitor vector database usage
- [ ] Implement rate limiting for searches
- [ ] Consider caching frequent queries

---

## Support

For issues or questions:

- Qdrant: https://qdrant.tech/documentation
- Pinecone: https://docs.pinecone.io
- Mistral: https://docs.mistral.ai
