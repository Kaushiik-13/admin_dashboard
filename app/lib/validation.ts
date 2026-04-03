export function validateMobile(phone: string): string | null {
  if (!phone.trim()) return "Phone number is required";
  const cleaned = phone.replace(/\s/g, "");
  if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
    return "Enter a valid phone number (7-15 digits)";
  }
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Enter a valid email address";
  return null;
}

export function validateDate(
  dateStr: string,
  options?: {
    minDate?: Date;
    maxDate?: Date;
    format?: "iso" | "dd/mm/yyyy" | "mm/dd/yyyy";
  }
): string | null {
  if (!dateStr.trim()) return "Date is required";

  let date: Date;
  if (options?.format === "dd/mm/yyyy") {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "Invalid date format (use DD/MM/YYYY)";
    date = new Date(`${parts[1]}/${parts[0]}/${parts[2]}`);
  } else if (options?.format === "mm/dd/yyyy") {
    const parts = dateStr.split("/");
    if (parts.length !== 3) return "Invalid date format (use MM/DD/YYYY)";
    date = new Date(`${parts[0]}/${parts[1]}/${parts[2]}`);
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) return "Invalid date";

  if (options?.minDate && date < options.minDate) {
    return `Date must be after ${options.minDate.toLocaleDateString()}`;
  }
  if (options?.maxDate && date > options.maxDate) {
    return `Date must be before ${options.maxDate.toLocaleDateString()}`;
  }

  return null;
}

export function validateCoordinates(
  lat: number,
  lng: number
): string | null {
  if (isNaN(lat) || isNaN(lng)) return "Coordinates must be numbers";
  if (lat < -90 || lat > 90) return "Latitude must be between -90 and 90";
  if (lng < -180 || lng > 180) return "Longitude must be between -180 and 180";
  return null;
}

export function validateCoordinatesString(
  coordStr: string,
  separator: string = ","
): string | null {
  if (!coordStr.trim()) return "Location coordinates are required";
  
  const parts = coordStr.split(separator).map((s) => s.trim());
  if (parts.length !== 2) return "Invalid coordinate format (use: lat,lng)";
  
  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);
  
  return validateCoordinates(lat, lng);
}

export function validateFileSize(
  file: File,
  maxMB: number = 5
): string | null {
  if (!file) return "File is required";
  
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return `File size must be less than ${maxMB}MB`;
  }
  return null;
}

export function validateFileType(
  file: File,
  allowedTypes: string[]
): string | null {
  if (!file) return "File is required";
  
  const ext = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();
  
  const isValidExt = allowedTypes.some((type) => 
    type.replace(".", "").toLowerCase() === ext
  );
  const isValidMime = allowedTypes.some((type) => 
    mimeType.includes(type.replace(".", "").toLowerCase())
  );
  
  if (!isValidExt && !isValidMime) {
    return `File type must be: ${allowedTypes.join(", ")}`;
  }
  return null;
}

export function validateFile(
  file: File,
  options?: {
    maxMB?: number;
    allowedTypes?: string[];
  }
): string | null {
  const maxMB = options?.maxMB ?? 5;
  const allowedTypes = options?.allowedTypes ?? [".jpg", ".jpeg", ".png", ".pdf"];
  
  const sizeError = validateFileSize(file, maxMB);
  if (sizeError) return sizeError;
  
  const typeError = validateFileType(file, allowedTypes);
  if (typeError) return typeError;
  
  return null;
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value.trim()) return `${fieldName} is required`;
  return null;
}

export function validateMinLength(
  value: string,
  min: number,
  fieldName: string
): string | null {
  if (value.trim().length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return null;
}

export function validateMaxLength(
  value: string,
  max: number,
  fieldName: string
): string | null {
  if (value.trim().length > max) {
    return `${fieldName} must be at most ${max} characters`;
  }
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password.trim()) return "Password is required";
  if (password.length < 6) return "Password must be at least 6 characters";
  return null;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | null {
  if (!confirmPassword.trim()) return "Please confirm your password";
  if (password !== confirmPassword) return "Passwords don't match";
  return null;
}
