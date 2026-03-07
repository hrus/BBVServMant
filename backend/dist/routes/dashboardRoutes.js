"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboardController_1 = require("../controllers/dashboardController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/coordinator', auth_1.authenticate, (0, auth_1.authorize)(['COORDINADOR_INTERVENCION', 'ADMIN']), dashboardController_1.getCoordinatorDashboard);
exports.default = router;
