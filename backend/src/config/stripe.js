const Stripe = require("stripe");

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_replace_me";

module.exports = new Stripe(stripeSecretKey);
