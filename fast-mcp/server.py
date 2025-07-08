

from fastmcp import FastMCP
import requests

mcp = FastMCP("Neo4j MCP Server")

@mcp.tool
def search_people(name: str = None, city: str = None, friend_of: str = None):
    """Search for people by name, city, or friendships."""
    if name:
        resp = requests.get(f"http://localhost:3000/people/{name}")
    elif city:
        resp = requests.get(f"http://localhost:3000/location/{city}/people")
    elif friend_of:
        resp = requests.get(f"http://localhost:3000/people/{friend_of}/friends")
    else:
        resp = requests.get("http://localhost:3000/people")
    return resp.json()

@mcp.tool
def modify_graph(action: str, entity: str, data: dict):
    """Add, update, delete people or relationships."""
    if action == "create" and entity == "person":
        return requests.post("http://localhost:3000/people", json=data).json()
    elif action == "update" and entity == "person":
        return requests.patch(f"http://localhost:3000/people/{data['name']}", json=data).json()
    elif action == "delete" and entity == "person":
        return requests.delete(f"http://localhost:3000/people/{data['name']}").json()
    elif action == "connect":
        rel_type = data.get("type")
        return requests.post(f"http://localhost:3000/relationships/{rel_type}", json=data).json()
    return {"error": "Invalid action or entity"}

@mcp.tool
def explain_connection(from_person: str, to_person: str):
    """Explain how one person is connected to another."""
    resp = requests.get(
        f"http://localhost:3000/relationship/explain?from={from_person}&to={to_person}"
    )
    return resp.json()