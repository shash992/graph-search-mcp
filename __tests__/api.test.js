const request = require('supertest');
const express = require('express');
const neo4j = require('neo4j-driver');
require('dotenv').config();

const app = require('../index'); // if your express server is exported

describe('Neo4j API Endpoints', () => {
  const testName = 'TestUser';

  // Create a test person before running tests
  beforeAll(async () => {
    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    const session = driver.session();
    await session.run(`CREATE (:Person {name: $name, email: $email})`, {
      name: testName,
      email: 'test@example.com',
    });
    await session.close();
    await driver.close();
  });

  test('GET /people should return an array', async () => {
    const res = await request(app).get('/people');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('GET /people/:name should return a person', async () => {
    const res = await request(app).get(`/people/${testName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(testName);
  });

  test('PATCH /people/:name should update email', async () => {
    const res = await request(app)
      .patch(`/people/${testName}`)
      .send({ email: 'updated@example.com' });
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe('updated@example.com');
  });

  test('POST /relationships/lives-in should succeed', async () => {
    // Add location manually before test
    const driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
    );
    const session = driver.session();
    await session.run(`MERGE (:Location {name: "TestCity", country: "Testland"})`);
    await session.close();
    await driver.close();

    const res = await request(app)
      .post('/relationships/lives-in')
      .send({ person: testName, location: 'TestCity' });
    expect(res.statusCode).toBe(201);
  });

  test('DELETE /people/:name should delete the person', async () => {
    const res = await request(app).delete(`/people/${testName}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/deleted successfully/);
  });

  test('GET /people/:name should now return 404', async () => {
    const res = await request(app).get(`/people/${testName}`);
    expect(res.statusCode).toBe(404);
  });
});