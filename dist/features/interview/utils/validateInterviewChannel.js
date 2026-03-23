"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateInterviewChannel = validateInterviewChannel;
const constants_1 = require("../config/constants");
// GuildChannel または ThreadChannel のみ parentId を持つ
function validateInterviewChannel(channel) {
    return channel.parentId === constants_1.INTERVIEW_CATEGORY_ID;
}
