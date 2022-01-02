const express = require("express");
const { registerUser, loginUser, logoutUser, forgotPassword, resetPassword, getUserDetails, updateUserProfile, getAllUser, getSingleUser, updateUserRole, deleteUser } = require("../controllers/userController");
const router = express.Router();
const { isAuthenticatedUser, authoriseRoles } = require("../middleware/auth");

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/reset").post(forgotPassword);
router.route("/logout").get(logoutUser);
router.route("/password/reset/:token").put(resetPassword);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/me").put(updateUserProfile);

router.route("/admin/users").get(isAuthenticatedUser,authoriseRoles("admin"),getAllUser);
router.route("/admin/user/:id").get(isAuthenticatedUser,authoriseRoles("admin"),getSingleUser);

router.route("/admin/user/:id").put(isAuthenticatedUser,authoriseRoles("admin"),updateUserRole);
router.route("/admin/user/:id").delete(isAuthenticatedUser,authoriseRoles("admin"),deleteUser);

module.exports = router;