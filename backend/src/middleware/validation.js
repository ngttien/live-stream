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
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'Username must only contain alphanumeric characters',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 30 characters'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    })
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