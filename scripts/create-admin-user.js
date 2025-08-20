const { MongoClient } = require("mongodb")
const bcrypt = require("bcryptjs")

if (!process.env.MONGODB_URI) {
  console.error("[v0] MONGODB_URI environment variable is required")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("[v0] JWT_SECRET environment variable is required")
  process.exit(1)
}

async function createAdminUser() {
  const client = new MongoClient(process.env.MONGODB_URI)

  try {
    console.log("[v0] Attempting to connect to MongoDB...")
    await client.connect()
    console.log("[v0] Successfully connected to MongoDB")

    const db = client.db()
    console.log("[v0] Using database:", db.databaseName)

    const users = db.collection("users")

    // Check if admin user already exists
    console.log("[v0] Checking for existing admin user...")
    const existingAdmin = await users.findOne({ username: "admin" })
    if (existingAdmin) {
      console.log("[v0] Admin user already exists")
      return
    }

    console.log("[v0] Creating new admin user...")
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash("admin123", salt)

    // Create admin user
    const adminUser = {
      username: "admin",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await users.insertOne(adminUser)
    console.log("[v0] Admin user created successfully with ID:", result.insertedId)
    console.log("[v0] Username: admin")
    console.log("[v0] Password: admin123")
  } catch (error) {
    console.error("[v0] Error creating admin user:", error.message)
    console.error("[v0] Full error:", error)
  } finally {
    await client.close()
    console.log("[v0] Connection closed")
  }
}

createAdminUser()
