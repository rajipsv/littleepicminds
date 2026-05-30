const express = require('express');
const { registerGitaAudioRoutes } = require('../../lib/gita-audio');

const router = express.Router();
registerGitaAudioRoutes(router);

module.exports = router;
