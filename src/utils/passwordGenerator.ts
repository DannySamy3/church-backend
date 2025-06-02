export const generateRandomPassword = (
  firstName: string,
  lastName: string,
  length: number = 12
): string => {
  // Clean and format the name parts
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z]/g, "");
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z]/g, "");

  // Simple special characters that are easy to remember
  const specialChars = ["@", "#", "$", "!", "&"];

  // Common number patterns
  const numbers = ["123", "2024", "99", "88", "77"];

  // Create password variations
  const variations = [
    `${cleanFirstName}${
      specialChars[Math.floor(Math.random() * specialChars.length)]
    }${numbers[Math.floor(Math.random() * numbers.length)]}`,
    `${cleanFirstName}${cleanLastName}${
      specialChars[Math.floor(Math.random() * specialChars.length)]
    }`,
    `${cleanFirstName}${
      specialChars[Math.floor(Math.random() * specialChars.length)]
    }${cleanLastName}`,
    `${cleanFirstName}${numbers[Math.floor(Math.random() * numbers.length)]}${
      specialChars[Math.floor(Math.random() * specialChars.length)]
    }`,
  ];

  // Select a random variation
  let password = variations[Math.floor(Math.random() * variations.length)];

  // Ensure the password meets minimum length
  if (password.length < length) {
    const extraChars = "abcdefghijklmnopqrstuvwxyz";
    while (password.length < length) {
      password += extraChars[Math.floor(Math.random() * extraChars.length)];
    }
  }

  return password;
};
