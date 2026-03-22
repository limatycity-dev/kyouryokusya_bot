"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentWeekKey = getCurrentWeekKey;
function getCurrentWeekKey() {
    const now = new Date();
    const year = now.getUTCFullYear();
    const firstDayOfYear = new Date(Date.UTC(year, 0, 1));
    const pastDaysOfYear = Math.floor((Number(now) - Number(firstDayOfYear)) / (24 * 60 * 60 * 1000));
    const week = Math.floor(pastDaysOfYear / 7) + 1;
    return `${year}-W${week}`;
}
