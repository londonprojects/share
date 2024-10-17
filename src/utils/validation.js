export const validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (email.length > 255) {
    return { isValid: false, error: 'Email is too long (max 255 characters)' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: '' };
};

export const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasNonAlphas = /\W/.test(password);
  
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long (max 128 characters)' };
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasNonAlphas) {
    return { 
      isValid: false, 
      error: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character' 
    };
  }
  if (/(.)\1{2,}/.test(password)) {
    return { isValid: false, error: 'Password should not contain repeating characters' };
  }
  return { isValid: true, error: '' };
};

export const validateName = (name) => {
  if (!name) {
    return { isValid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }
  if (name.length > 50) {
    return { isValid: false, error: 'Name is too long (max 50 characters)' };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  return { isValid: true, error: '' };
};
