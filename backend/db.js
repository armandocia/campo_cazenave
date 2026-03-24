const { Pool } = require("pg")

const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "campo_cazenave",
    password: "Postgres2026**",
    port: 5432,
})

module.exports = pool