class CustomError extends Error {
  code: 'GENERAL_ERROR'
  level: 'ERROR'
  httpCode: 500

  constructor(settings) {
    super(settings)
    this.name = this.constructor.name
    
    if (typeof settings === 'object') {
      this.code = settings.code
      this.httpCode = settings.httpCode
      this.level = settings.level
      this.message = settings.message
    }

    Error.captureStackTrace(this, this.constructor)
  }
}

export default CustomError