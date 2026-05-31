// src/middlewares/validate.js
const { ZodError } = require("zod");

/**
 * Factory that returns an Express middleware which validates
 * req.body against the provided Zod schema.
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors,
        });
      }
      next(err);
    }
  };
}

module.exports = validate;
