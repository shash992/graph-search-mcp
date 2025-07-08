require('dotenv').config();
const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
app.use(express.json());

// Connect to Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

// Sample route: Get all people
app.get('/people', async (req, res) => {
  try {
    const result = await session.run(`MATCH (p:Person) RETURN p`);
    const people = result.records.map(r => r.get('p').properties);
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new person
app.post('/people', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Missing name or email' });
  }
  try {
    const result = await session.run(
      `CREATE (p:Person {name: $name, email: $email}) RETURN p`,
      { name, email }
    );
    const person = result.records[0].get('p').properties;
    res.status(201).json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a FRIEND_OF relationship
app.post('/relationships/friend', async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to name' });
  }
  try {
    const result = await session.run(
      `MATCH (a:Person {name: $from}), (b:Person {name: $to})
       MERGE (a)-[:FRIEND_OF {since: datetime()}]->(b)
       RETURN a, b`,
      { from, to }
    );
    res.status(201).json({ message: `${from} is now friends with ${to}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a FATHER_OF relationship
app.post('/relationships/father', async (req, res) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to name' });
  }
  try {
    await session.run(
      `MATCH (a:Person {name: $from}), (b:Person {name: $to})
       MERGE (a)-[:FATHER_OF]->(b)`,
      { from, to }
    );
    res.status(201).json({ message: `${from} is now father of ${to}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a LIVES_IN relationship
app.post('/relationships/lives-in', async (req, res) => {
  const { person, location } = req.body;
  if (!person || !location) {
    return res.status(400).json({ error: 'Missing person or location' });
  }
  try {
    await session.run(
      `MATCH (p:Person {name: $person}), (l:Location {name: $location})
       MERGE (p)-[:LIVES_IN]->(l)`,
      { person, location }
    );
    res.status(201).json({ message: `${person} now lives in ${location}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a person's friends
app.get('/people/:name/friends', async (req, res) => {
  const name = req.params.name;
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:FRIEND_OF]->(f:Person) RETURN f`,
      { name }
    );
    const friends = result.records.map(r => r.get('f').properties);
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get where a person lives
app.get('/people/:name/location', async (req, res) => {
  const name = req.params.name;
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:LIVES_IN]->(l:Location) RETURN l`,
      { name }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }
    const location = result.records[0].get('l').properties;
    res.json(location);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all people in a given location
app.get('/location/:name/people', async (req, res) => {
  const name = req.params.name;
  try {
    const result = await session.run(
      `MATCH (p:Person)-[:LIVES_IN]->(l:Location {name: $name}) RETURN p`,
      { name }
    );
    const people = result.records.map(r => r.get('p').properties);
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get raw path between two people
app.get('/path/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  try {
    const result = await session.run(
      `MATCH path = shortestPath((a:Person {name: $from})-[*..4]-(b:Person {name: $to}))
       RETURN [n in nodes(path) | n.name] AS names,
              [rel in relationships(path) | type(rel)] AS relationships`,
      { from, to }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'No path found' });
    }
    const data = result.records[0].toObject();
    res.json({ nodes: data.names, relationships: data.relationships });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Explain how two people are connected
app.get('/relationship/explain', async (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) {
    return res.status(400).json({ error: 'Missing from or to parameter' });
  }
  try {
    const result = await session.run(
      `MATCH path = shortestPath((a:Person {name: $from})-[*..4]-(b:Person {name: $to}))
       RETURN [n in nodes(path) | n.name] AS names,
              [rel in relationships(path) | type(rel)] AS relationships`,
      { from, to }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'No path found' });
    }
    const { names, relationships } = result.records[0].toObject();
    const explanation = `${names[0]} knows ${names[names.length - 1]} via ${relationships.join(' → ')}`;
    res.json({ explanation, nodes: names, relationships });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get person by name
app.get('/people/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name}) RETURN p`,
      { name }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const person = result.records[0].get('p').properties;
    res.json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update person info
app.patch('/people/:name', async (req, res) => {
  const name = req.params.name;
  const { newName, email } = req.body;
  if (!newName && !email) {
    return res.status(400).json({ error: 'No new data provided' });
  }
  const updates = [];
  if (newName) updates.push('p.name = $newName');
  if (email) updates.push('p.email = $email');
  const query = `MATCH (p:Person {name: $name}) SET ${updates.join(', ')} RETURN p`;
  try {
    const result = await session.run(query, { name, newName, email });
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const person = result.records[0].get('p').properties;
    res.json(person);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete person and relationships
app.delete('/people/:name', async (req, res) => {
  const name = req.params.name;
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name}) DETACH DELETE p RETURN count(p) AS deletedCount`,
      { name }
    );
    const count = result.records[0].get('deletedCount').toNumber();
    if (count === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    res.json({ message: `${name} deleted successfully` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
    app.listen(3000, () => {
      console.log('API server running on http://localhost:3000');
    });
  }
  
  module.exports = app;