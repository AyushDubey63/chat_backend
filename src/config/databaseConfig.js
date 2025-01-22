import knex from "knex";
const db = knex({
  client: "pg",
  connection: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    ssl: {
      rejectUnauthorized: false,
    },
  },
});
export { db };
// import pg from "pg";

// const { Pool } = pg;
// let pool = null;
// try {
//   pool = new Pool({
//     host: process.env.DATABASE_HOST,
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
//     ssl: {
//       rejectUnauthorized: false,
//     },
//   });
//   if (pool) {
//     console.log("Database connected successfully");
//   }
// } catch (error) {
//   console.log("Error connecting to database", error);
// }
// export { pool };
