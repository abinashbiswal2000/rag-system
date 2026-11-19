import "dotenv/config"
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"

const urlString = process.env["DATABASE_URL"];

if (urlString == null) {
    throw new Error("The DATABASE_URL must not be null. Check env file.");
}

const adapter = new PrismaBetterSqlite3({
    url: urlString
})

const prisma = new PrismaClient({
    adapter: adapter
})

export { prisma }