"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUser = getUser;
const client_1 = require("../db/client");
async function getUser(discordUserId) {
    const result = await client_1.db.query("SELECT * FROM users WHERE user_id = $1", [discordUserId]);
    return result.rows[0] ?? null;
}
