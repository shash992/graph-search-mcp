# 🧭 Neo4j Relationship Graph API + FastMCP Tools

This project is a lightweight graph-powered API that models people, locations, and their relationships using Neo4j and exposes endpoints via an Express.js server. Additionally, it supports natural-language interactions and automation through a FastMCP-based tool interface.

---

## 🧠 Use Cases

- **Visiting New York?** Instantly find out who you know in the city.
- **Need a referral?** Discover how you're connected to someone in your network graph (e.g., "How is Dave connected to Alice?").
- **Manage connections:** Add, update, or delete people, relationships, and locations.
- **AI Automation:** Search, modify, or explain graph paths via FastMCP tools (usable in LLMs like GPT).

---

## 🧱 Tech Stack

| Component     | Description                                 |
|---------------|---------------------------------------------|
| **Node.js**   | Backend runtime                             |
| **Express.js**| RESTful API framework                       |
| **Neo4j**     | Graph database for relationships            |
| **Cypher**    | Query language for graph traversal          |
| **FastMCP**   | Python-based tool framework for agent use   |
| **Jest**      | Testing suite for API endpoints             |

---

## 🚀 Quickstart

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/neo4j-api-server.git
cd neo4j-api-server
```

### 2. Configure `.env`

```bash
cp .env.example .env
```

Update `.env` with your Neo4j credentials:

```dotenv
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password
```

Make sure Neo4j is running and listening on that URI.

---

### 3. Install Node.js dependencies

```bash
npm install
```

### 4. Start the Express API server

```bash
npm start
```

Runs on `http://localhost:3000`

---

### 5. (Optional) Set up FastMCP

```bash
cd fast-mcp
uv pip install -r requirements.txt
```

Run the FastMCP server:

```bash
uvicorn server:app --reload
```

> This exposes tools like `search_people`, `modify_graph`, and `explain_relationship` to AI agents via MCP protocol.

---

## 📂 Folder Structure

```
neo4j-api-server/
├── index.js              # Main Express server
├── .env                  # Environment variables
├── fast-mcp/             # FastMCP Python tool server
│   ├── server.py         # All @mcp.tool functions live here
│   └── __pycache__/      # Python bytecode (auto)
├── __tests__/            # Jest-based API tests
├── package.json          # Node.js dependencies
└── README.md             # You're reading it!
```

---

## 🔍 Endpoints Overview

| Method | Endpoint                         | Purpose                          |
|--------|----------------------------------|----------------------------------|
| GET    | `/people`                        | List all people                  |
| GET    | `/people/:name`                  | Get person by name               |
| POST   | `/people`                        | Create a new person              |
| PATCH  | `/people/:name`                  | Update person's info             |
| DELETE | `/people/:name`                  | Delete person + relationships    |
| POST   | `/relationships/friend`          | Add a bidirectional friendship   |
| POST   | `/relationships/father`          | Link father to child             |
| POST   | `/relationships/lives-in`        | Link person to a location        |
| GET    | `/people/:name/friends`          | List a person's friends          |
| GET    | `/people/:name/location`         | Get where a person lives         |
| GET    | `/location/:name/people`         | People in a given location       |
| GET    | `/path/:from/:to`                | Get raw path between two people  |
| GET    | `/relationship/explain`          | Human-readable explanation       |

---

## 🧪 Run Tests

```bash
npm test
```

Runs tests from the `__tests__` folder using `jest`.

---

## ✅ Example Workflow

1. Add people: Alice, Bob, Dave, Carol
2. Create relationships:
   - Alice → FRIEND_OF → Bob
   - Dave → FRIEND_OF → Carol
   - Bob → FATHER_OF → Carol
3. Add location nodes: New York, San Francisco
4. Use `/location/New York/people` to find who’s there
5. Use `/relationship/explain?from=Dave&to=Alice` to trace the referral path

---

## 📦 MCP Tools (in `fast-mcp/server.py`)

| Tool Name               | Description                                |
|------------------------|--------------------------------------------|
| `search_people`        | Find people by name, city, etc.            |
| `modify_graph`         | Add or delete people and relationships     |
| `explain_relationship` | Explain how two people are connected       |

---

## 🛡️ .gitignore Tips

Make sure your `.gitignore` includes:

```
.env
.venv/
fast-mcp/__pycache__/
node_modules/
```

---

## ✍️ Credits

Made by [Your Name]  
Built for demos, prototyping, and experimentation.

---

## 📬 Feedback / Issues

Open an issue or ping me if something breaks or you want to contribute ideas.