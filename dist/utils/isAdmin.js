"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = isAdmin;
const client_1 = require("../db/client");
async function isAdmin(userId, guildId) {
    const result = await client_1.db.query(`
    SELECT 1
    FROM admins
    WHERE user_id = $1
      AND guild_id = $2
    LIMIT 1
    `, [userId, guildId]);
    return (result.rowCount ?? 0) > 0;
}
