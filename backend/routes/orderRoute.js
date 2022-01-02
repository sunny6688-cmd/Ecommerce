const express = require("express");
const { newOrder, getSingleOrder, myOrder, getAllOrder, deleteOrder, updateOrder } = require("../controllers/orderController");
const router = express.Router();

const { isAuthenticatedUser, authoriseRoles } = require("../middleware/auth");

/**
 * @swagger
 * /customers:
 *  get:
 *    description: Use to request all customers
 *    responses:
 *      '200':
 *        description: A successful response
 */
router.route("/order/new").post(isAuthenticatedUser, newOrder);
router.route("/order/:id").get(isAuthenticatedUser, getSingleOrder);
router.route("/orders/me").get(isAuthenticatedUser, myOrder);

router.route("/admin/orders").get(isAuthenticatedUser, authoriseRoles("admin"), getAllOrder);
router.route("/admin/order/:id").put(isAuthenticatedUser, authoriseRoles("admin"), updateOrder).delete(isAuthenticatedUser, authoriseRoles("admin"), deleteOrder);

module.exports = router;