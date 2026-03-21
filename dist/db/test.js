"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("./client");
async function test() {
    const result = await client_1.db.query("SELECT NOW()");
    console.log(result.rows);
}
test();
