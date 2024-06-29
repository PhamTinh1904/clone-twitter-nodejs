import { ParamSchema, checkSchema } from 'express-validator'
import { AuthFailureError, BadRequestError, ErrorResponse, NotFoundError } from '~/core/error.response'
import { checkIsExitEmail } from '~/models/repo/user.repo'
import { validate } from '~/utils/validation'
import JWT, { JwtPayload } from 'jsonwebtoken'
import mongoClient from '~/configs/config.mongodb'
import { ObjectId } from 'mongodb'
import { USER_MESSAGES } from '~/utils/message'
import { REGEX_USERNAME } from '~/utils/regex'
import { hashPassword } from '~/utils/hashPassword'

export const loginValidator = validate(
  checkSchema({
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const holderUser = await checkIsExitEmail(value)

          if (!holderUser) {
            throw new BadRequestError('Shop not registered!')
          }
          return true
        }
      }
    },
    password: {
      notEmpty: true,
      isString: true,
      isLength: {
        options: {
          min: 6,
          max: 50
        }
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      errorMessage:
        'Password confirmation must have at least 6 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol'
    }
  })
)

const passwordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  errorMessage: 'Password must have at least 6 characters, 1 lowercase, 1 uppercase, 1 number, and 1 symbol',
 
}

const forgotPasswordSchema: ParamSchema = {
  trim: true,
  custom: {
    options: async (value: string, { req }) => {
      if (!value) {
        throw new Error('Invalid token!')
      }

      const decodeUser = (await JWT.verify(value, process.env.JWT_FORGOT_PASSWORD_SECRET as string)) as JwtPayload
      const { userId, email } = decodeUser

      req.userId = userId
      const foundUser = await mongoClient.users.findOne({ _id: new ObjectId(userId) })
      if (!foundUser) throw new AuthFailureError('User not found!')

      if (foundUser.forgot_password_token !== value) throw new AuthFailureError('Invalid token!')

      return true
    }
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: true,
  isString: true,
  isLength: {
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  },
  errorMessage:
    'Password confirmation does not match password'
}

const nameSchema: ParamSchema = {
  notEmpty: true,
  isString: {
    errorMessage: 'Name must be a string'
  },
  isLength: {
    options: {
      min: 1,
      max: 255
    }
  },
  trim: true
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: true,
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  }
}

const userIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new AuthFailureError('Invalid value')
      }

      const followed_user = await mongoClient.users.findOne({
        _id: new ObjectId(value)
      })

      if (!followed_user) throw new NotFoundError('User not found!')
    }
  }
}

export const registerValidator = validate(
  checkSchema({
    name: nameSchema,
    email: {
      notEmpty: true,
      isEmail: true,
      trim: true,
      custom: {
        options: async (value) => {
          const holderUser = await checkIsExitEmail(value)

          if (holderUser) {
            throw new Error('Email already registered!')
          }
          return true
        }
      }
    },
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
    datedate_or_birth: dateOfBirthSchema
  })
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: true,
        isEmail: true,
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const holderUser = await checkIsExitEmail(value)

            if (!holderUser) {
              throw new Error('Invalid email!')
            }
            req.user = holderUser
            return true
          }
        }
      }
    },
    ['body', 'query']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordSchema
    },
    ['query']
  )
)

export const resetPasswordTokenValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirmPassword: confirmPasswordSchema,
      forgot_password_token: forgotPasswordSchema
    },
    ['body', 'query']
  )
)

export const changePasswordValidator = validate(
  checkSchema(
    {
      oldPassword: {
        notEmpty: true,
        isString: true,
        isLength: {
          options: {
            min: 6,
            max: 50
          }
        },
        errorMessage: 'Old password must have at least 6 characters',
        custom: {
          options: async(value, {req})=>{
            const user = await mongoClient.users.findOne({_id: new ObjectId(req.user.userId)})

            if(!user){
              throw new AuthFailureError('User not found!')
            }

            const {password} = user

            

            const isMatch = await hashPassword(value) === password

            if( !isMatch){
              throw new BadRequestError('Old password is incorrect!')
            }
          
          }
        }
      },
      password: passwordSchema,
      confirmPasswrod: confirmPasswordSchema
    },
    ['body']
  )

)

export const updateValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        optional: true,
        notEmpty: false
      },
      date_of_birth: { ...dateOfBirthSchema, optional: true },
      bio: {
        optional: true,
        isString: {
          errorMessage: 'Bio must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Bio must be a number between 1 and 200 characters'
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: 'Location must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Location must be a number between 1 and 200 characters'
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: 'Website must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 200
          },
          errorMessage: 'Website must be a number between 1 and 200 characters'
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: 'Username must be a string'
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (REGEX_USERNAME.test(value)) {
              throw new BadRequestError(
                'User name must be 4-15 characters long and contain at least one letter, number, underscores.'
              )
            }

            const user = await mongoClient.users.findOne({username: value})

            if(user){
              throw new BadRequestError('Username already exists!')
            }
          }
        },
        isLength: {
          options: {
            min: 1,
            max: 50
          },
          errorMessage: 'Username must be a number between 1 and 50 characters'
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: 'avatar must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 400
          },
          errorMessage: 'avatar must be a number between 1 and 400 characters'
        }
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: 'cover_photo must be a string'
        },
        trim: true,
        isLength: {
          options: {
            min: 1,
            max: 400
          },
          errorMessage: 'cover_photo must be a number between 1 and 400 characters'
        }
      }
    },
    ['body']
  )
)

export const followerValidator = validate(
  checkSchema({
    follower_user_id: {
      custom: {
        options: async (value: string, { req }) => {
          if (!ObjectId.isValid(value)) {
            throw new BadRequestError('Invalid user id!')
          }

          const followed_user = await mongoClient.users.findOne({
            _id: new ObjectId(value)
          })

          if (!followed_user) throw new NotFoundError('User not found!')
        }
      }
    }
  })
)

export const unFolowValidator = validate(
  checkSchema(
    {
      userId: userIdSchema
    },
    ['params']
  )
)
