# 1. Setup Instructions (windows computer)

**1.1 - Apps to be Installed**
- Node.js (v26.5.1)
- Ollama (0.40.16)
- Visual Studio Code

**1.2 - Ollama Instructions (after installation of app)**
- Open the Ollama app. That will get ollama running. 
- Go to your terminal and type `ollama pull qwen3.5:9b`
- Once the pull is completed, type `ollama list`, you should see qwen3.5:9b
- It must be reachable at `http://localhost:11434`, which is its default address.

**1.3 - Github Instruction**
- Open a folder in VS Code.
- Open a **command prompt** terminal (not powershell) and type 
```bash
git clone https://github.com/abinashbiswal2000/rag-system
```

**1.4 - Backend Instructions**
- Type the following commands one after the other in the **exact order**
```bash
cd rag-system
```
```bash
cd Backend
```
```bash
copy .env.example .env
```
```bash
npm install
```
```bash
npx prisma generate
```
```bash
npm run dev
```

The backend runs at `http://localhost:5000`.

On first run, the backend downloads a small embedding model (`Xenova/all-MiniLM-L6-v2`) from Hugging Face. The first ingest or query therefore needs internet access and takes a little longer; later runs use the cached copy.

**1.5 - Frontend Instructions**

- In a second terminal type the following commands one after the other in the **exact order**
```bash
cd rag-system
```
```bash
cd Frontend
```
```bash
npm install
```
```bash
npm run dev
```

Open `http://localhost:5173`. The frontend must run on port 5173, because the backend only accepts requests from that address (CORS).

# 2. Techstack
**2.1 - Frontend**
- React Js

**2.2 - Backend**
- Node
- Express
- Prisma

**2.3 - Database**
- Sqlite

# 3. Design Decisions

**3.1 - Chunking: 500 characters, with a 50-character overlap**
- Small enough that the top 5 chunks fit in the prompt and each one stays focused on a single topic. I tried with more characters in an attempt to get better responses, but it slowed the process a lot and confused the small 9b model, hence was counterproductive.
- The overlap means a sentence cut at a chunk boundary is still readable in at least one chunk.

**3.2 - Embeddings: all-MiniLM-L6-v2, run locally in Node**
- Free and needs no API key.
- Small (about 25 MB) and fast to run on a normal computer.

**3.3 - Vector store: SQLite**
- Each chunk's vector is stored as JSON text in SQLite, next to the chunk text.
- A query compares the question's vector with every stored chunk and keeps the 5 most similar.
- No extra service to install, and fast enough for a single user's notes.

**3.4 - LLM: qwen3.5:9b, run locally through Ollama**
- Runs locally, needs no API key and costs nothing. I tried Gemini APIs but they seemed under high load all the time, so were unreliable.
- The model must reply in a fixed JSON format that includes the IDs of the chunks it used. Those IDs are how the answer's sources (citations) are shown.

# 4. Tradeoffs

**4.1 - What Breaks at scale**
- As the size of the database grows, the chances to hit the correct chunks decreases. Why? Because there could be similar (but incorrect) chunks which could end up higher in rank than the correct chunk.
- The time complexity of finding the cosine similarity increases linearly O(n). But we also sort the array to get the top 5 hits, so O(n * log(n)) is the sorting cost. 
- When finding similarity scores, the space complexity is O(n) as a comparison has to be done with every chunk.
- Ollama answers one request at a time, so users would queue.
- Chunks are embedded one at a time while the user waits, so a large page can take many seconds before the request returns.


**4.2 - Production Changes**
- **Better retrieval:** retrieve more candidates (e.g. the top 20), then re-rank them with a stronger model before sending the best 5 to the LLM. Clean pages better when fetching (drop menus and reference lists) and split chunks on sentence boundaries.
- **Faster search:** use a proper vector index (e.g. `sqlite-vec`, `pgvector` in Postgres, or a vector database). It finds the nearest chunks without comparing against all of them, and stores vectors as numbers instead of JSON text.
- **Less memory per query:** with the same index, vectors no longer have to be loaded and parsed on every query.
- **More than one LLM request at a time:** use a hosted LLM API with a fallback provider, or a GPU server that can handle several requests at once. Add a timeout and a retry.
- **Ingest without waiting:** return straight away with a "processing" status, do the fetching and embedding in a background job queue, and embed chunks in batches instead of one by one.
- **Production basics:** stop the same URL from being saved twice, use structured (JSON) logs, and limit how many requests a user can send.
