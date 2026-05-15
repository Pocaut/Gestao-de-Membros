export function cpfDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11);
}

export function formatCpf(value: string): string {
  const digits = cpfDigits(value);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function isValidCpf(value: string): boolean {
  const digits = cpfDigits(value);

  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) {
    return false;
  }

  const firstDigit = calculateDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateDigit(`${digits.slice(0, 9)}${firstDigit}`, 11);

  return digits === `${digits.slice(0, 9)}${firstDigit}${secondDigit}`;
}

function calculateDigit(base: string, weight: number): number {
  const sum = base
    .split('')
    .reduce((total, digit, index) => total + Number(digit) * (weight - index), 0);
  const remainder = (sum * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}
