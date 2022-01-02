const express = require("express");
const { getAllProduct, createProduct, updateProduct, deleteProduct, getProductDetails, createProductReview, getProductReviews, deleteProductReviews } = require("../controllers/productController");
const { isAuthenticatedUser, authoriseRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/products").get(getAllProduct);
router.route("/admin/product/new").post(isAuthenticatedUser , authoriseRoles("admin") ,createProduct);
router.route("/admin/product/:id").put(isAuthenticatedUser , authoriseRoles("admin") ,updateProduct);
router.route("/admin/product/:id").delete(isAuthenticatedUser , authoriseRoles("admin") ,deleteProduct);
router.route("/product/:id").get(getProductDetails);

router.route("/review").put(isAuthenticatedUser, createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteProductReviews);

module.exports = router;