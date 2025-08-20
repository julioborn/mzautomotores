const { MongoClient } = require("mongodb")

console.log("[v0] Testing MongoDB connection...")
console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)

if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI environment variable is required")
  process.exit(1)
}

async function testConnection() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log("[v0] Attempting to connect to MongoDB...")
    await client.connect()
    console.log("[v0] Successfully connected to MongoDB!")

    const db = client.db()
    console.log("[v0] Database name:", db.databaseName)

    // Test basic operation
    const collections = await db.listCollections().toArray()
    console.log(
      "[v0] Existing collections:",
      collections.map((c) => c.name),
    )

    // Test creating a test document
    const testCollection = db.collection("connection_test")
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date(),
    })
    console.log("[v0] Test document inserted with ID:", result.insertedId)

    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId })
    console.log("[v0] Test document cleaned up")
  } catch (error) {
    console.error("[v0] Connection error:", error.message)
    console.error("[v0] Full error:", error)
  } finally {
    await client.close()
    console.log("[v0] Connection closed")
  }
}

testConnection()
