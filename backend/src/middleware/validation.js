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
        error: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
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
      'string.base': 'Tên đăng nhập phải là chuỗi ký tự',
      'string.empty': 'Tên đăng nhập không được để trống',
      'string.alphanum': 'Tên đăng nhập chỉ được chứa chữ cái và số',
      'string.min': 'Tên đăng nhập phải có ít nhất 3 ký tự',
      'string.max': 'Tên đăng nhập không được vượt quá 30 ký tự',
      'any.required': 'Tên đăng nhập là bắt buộc'
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.base': 'Email phải là chuỗi ký tự',
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ. Vui lòng nhập đúng định dạng email',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.base': 'Mật khẩu phải là chuỗi ký tự',
      'string.empty': 'Mật khẩu không được để trống',
      'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email không được để trống',
      'string.email': 'Email không hợp lệ',
      'any.required': 'Email là bắt buộc'
    }),
  password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Mật khẩu không được để trống',
      'any.required': 'Mật khẩu là bắt buộc'
    })
});

const createRoomSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Tiêu đề không được để trống',
      'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 200 ký tự',
      'any.required': 'Tiêu đề là bắt buộc'
    }),
  description: Joi.string()
    .max(1000)
    .allow('')
    .messages({
      'string.max': 'Mô tả không được vượt quá 1000 ký tự'
    }),
  category: Joi.string()
    .valid('gaming', 'music', 'talk', 'creative', 'other')
    .required()
    .messages({
      'any.only': 'Danh mục không hợp lệ',
      'any.required': 'Danh mục là bắt buộc'
    })
});

const updateRoomSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .messages({
      'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
      'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
    }),
  description: Joi.string()
    .max(1000)
    .messages({
      'string.max': 'Mô tả không được vượt quá 1000 ký tự'
    }),
  category: Joi.string()
    .valid('gaming', 'music', 'talk', 'creative', 'other')
    .messages({
      'any.only': 'Danh mục không hợp lệ'
    }),
  thumbnailUrl: Joi.string()
    .uri()
    .messages({
      'string.uri': 'URL thumbnail không hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật'
});

const updateProfileSchema = Joi.object({
  displayName: Joi.string()
    .min(1)
    .max(100)
    .messages({
      'string.min': 'Tên hiển thị phải có ít nhất 1 ký tự',
      'string.max': 'Tên hiển thị không được vượt quá 100 ký tự'
    }),
  bio: Joi.string()
    .max(500)
    .messages({
      'string.max': 'Tiểu sử không được vượt quá 500 ký tự'
    }),
  avatarUrl: Joi.string()
    .uri()
    .messages({
      'string.uri': 'URL avatar không hợp lệ'
    })
}).min(1).messages({
  'object.min': 'Phải có ít nhất một trường để cập nhật'
});

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateCreateRoom: validate(createRoomSchema),
  validateUpdateRoom: validate(updateRoomSchema),
  validateUpdateProfile: validate(updateProfileSchema)
};