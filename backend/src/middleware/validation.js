const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Schemas
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const createRoomSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).allow(''),
  category: Joi.string().valid('gaming', 'music', 'talk', 'creative', 'other').required()
});

const updateRoomSchema = Joi.object({
  title: Joi.string().min(3).max(200),
  description: Joi.string().max(1000),
  category: Joi.string().valid('gaming', 'music', 'talk', 'creative', 'other'),
  thumbnailUrl: Joi.string().uri()
}).min(1);

const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(1).max(100),
  bio: Joi.string().max(500),
  avatarUrl: Joi.string().uri()
}).min(1);

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateCreateRoom: validate(createRoomSchema),
  validateUpdateRoom: validate(updateRoomSchema),
  validateUpdateProfile: validate(updateProfileSchema)
};