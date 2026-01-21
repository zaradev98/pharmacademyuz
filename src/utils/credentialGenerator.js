// Username va password generatori

// Username generatori
export const generateUsername = (fullName) => {
  const cleaned = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // maxsus belgilarni olib tashlash
    .trim()
    .replace(/\s+/g, '') // bo'shliqlarni olib tashlash

  const randomNum = Math.floor(Math.random() * 1000)
  return `${cleaned}${randomNum}`
}

// Random password generatori
export const generatePassword = (length = 12) => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const numbers = '0123456789'
  const symbols = '!@#$%^&*'

  const allChars = lowercase + uppercase + numbers + symbols

  let password = ''

  // Kamida bittadan har xil character bo'lishini ta'minlash
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += symbols[Math.floor(Math.random() * symbols.length)]

  // Qolgan characterlarni to'ldirish
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Passwordni aralashtirib qo'yish
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('')
}

// Simple password generatori (faqat raqamlar)
export const generateSimplePassword = () => {
  return Math.floor(100000000 + Math.random() * 900000000).toString()
}
