package com.example.members.member;

public final class CpfValidator {

    private CpfValidator() {
    }

    public static String onlyDigits(String cpf) {
        if (cpf == null) {
            return "";
        }

        return cpf.replaceAll("\\D", "");
    }

    public static boolean isValid(String cpf) {
        String digits = onlyDigits(cpf);

        if (digits.length() != 11 || hasRepeatedDigits(digits)) {
            return false;
        }

        int firstCheckDigit = calculateDigit(digits.substring(0, 9), 10);
        int secondCheckDigit = calculateDigit(digits.substring(0, 9) + firstCheckDigit, 11);

        return digits.equals(digits.substring(0, 9) + firstCheckDigit + secondCheckDigit);
    }

    private static boolean hasRepeatedDigits(String digits) {
        return digits.chars().distinct().count() == 1;
    }

    private static int calculateDigit(String base, int weight) {
        int sum = 0;

        for (int index = 0; index < base.length(); index++) {
            sum += Character.getNumericValue(base.charAt(index)) * (weight - index);
        }

        int remainder = (sum * 10) % 11;
        return remainder == 10 ? 0 : remainder;
    }
}
