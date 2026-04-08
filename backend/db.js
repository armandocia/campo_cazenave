const { Pool } = require("pg");

const pool = new Pool({
   connectionString: process.env.DATABASE_URL,
   ssl: {
	rejectUnathorized: false
	}
});

module.exports = pool;