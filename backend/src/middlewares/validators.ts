import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Manejo de errores de validación
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Errores de validación',
      details: errors.array()
    });
  }
  next();
};

// Sanitización XSS
const sanitizeString = (value: any) => {
  // Validar que value sea string y no undefined/null
  if (typeof value !== 'string' || !value) {
    return value;
  }
  
  return value
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Validaciones REGISTRO (protección contra XSS + inyección)
export const validateRegister = [
  body('nombre')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nombre debe tener entre 2 y 100 caracteres')
    .customSanitizer(sanitizeString),
  
  body('correo')
    .isEmail()
    .withMessage('Correo inválido')
    .normalizeEmail()
    .matches(/@(pucv\.cl|mail\.pucv\.cl)$/)
    .withMessage('Debe usar correo institucional PUCV'),
  
  body('usuario')
    .isLength({ min: 3, max: 50 })
    .withMessage('Usuario debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Usuario solo puede contener letras, números y guion bajo')
    .customSanitizer(sanitizeString),
  
  body('contrasena')
    .isLength({ min: 6 })
    .withMessage('Contraseña debe tener al menos 6 caracteres'),
  
  body('rut')
    .optional()
    .matches(/^\d{7,8}-[\dkK]$/)
    .withMessage('Formato RUT inválido')
    .customSanitizer(sanitizeString),
  
  body('region').optional().customSanitizer(sanitizeString),
  body('comuna').optional().customSanitizer(sanitizeString),
  
  handleValidationErrors
];

// Validaciones LOGIN
export const validateLogin = [
  body('correo')
    .isEmail()
    .withMessage('Correo inválido')
    .normalizeEmail(),
  
  body('contrasena')
    .notEmpty()
    .withMessage('Contraseña requerida'),
  
  handleValidationErrors
];

// Validaciones PRODUCTOS
export const validateProducto = [
  body('titulo')
    .isLength({ min: 3, max: 255 })
    .withMessage('Título debe tener entre 3 y 255 caracteres')
    .customSanitizer(sanitizeString),
  
  body('precio')
    .isInt({ min: 0, max: 10000000 })
    .withMessage('Precio debe ser un número positivo válido'),
  
  body('descripcion')
    .optional()
    .isLength({ max: 2000 })
    .customSanitizer(sanitizeString),
  
  body('categoria')
    .isIn(['libros', 'electronica', 'deportes', 'otros'])
    .withMessage('Categoría inválida'),
  
  body('campus')
    .isIn(['isabelBrown', 'casaCentral', 'curauma'])
    .withMessage('Campus inválido'),
  
  body('imagen')
    .optional()
    .isURL()
    .withMessage('URL de imagen inválida'),
  
  handleValidationErrors
];
