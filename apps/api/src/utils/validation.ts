export function validateName(value: unknown, minLength = 2): string | null {
    if (!value) {
        return "name is required"
    }    

    if (typeof value !== "string") {
    return "name must be a string";
    }

    if (value.trim().length < minLength) {
    return `name must be at least ${minLength} characters`;
    }
    
    return null;
}

export function validateEmail(value: unknown): string | null {
  if (typeof value !== "string") {
    return "email must be a string";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "email must be a valid email address";
  }
  return null;
}

export function validatePassword(value: unknown): string | null {
  if (typeof value !== "string") {
    return "password must be a string";
  }
  if (value.length < 8) {
    return "password must be at least 8 characters";
  }
  if (!/[a-z]/.test(value)) {
    return "password must include at least one lowercase letter";
  }
  if (!/[A-Z]/.test(value)) {
    return "password must include at least one uppercase letter";
  }
  if (!/[0-9]/.test(value)) {
    return "password must include at least one number";
  }
  if (!/[^a-zA-Z0-9]/.test(value)) {
    return "password must include at least one symbol";
  }
  return null;
}

export function validatePrice(value: unknown): string | null {
  const num = Number(value);

  if (value === undefined || value === null || value === "") {
    return "price is required";
  }
  if (isNaN(num)) {
    return "price must be a number";
  }
  if (num <= 0) {
    return "price must be a positive number";
  }
  return null;
}