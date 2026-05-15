package com.example.members.member;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class CpfValidatorTest {

    @Test
    void shouldAcceptValidCpfWithOrWithoutMask() {
        assertThat(CpfValidator.isValid("529.982.247-25")).isTrue();
        assertThat(CpfValidator.isValid("52998224725")).isTrue();
    }

    @Test
    void shouldRejectInvalidCpf() {
        assertThat(CpfValidator.isValid("111.111.111-11")).isFalse();
        assertThat(CpfValidator.isValid("529.982.247-24")).isFalse();
        assertThat(CpfValidator.isValid("123")).isFalse();
    }
}
