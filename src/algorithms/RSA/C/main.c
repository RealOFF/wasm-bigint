#include "emscripten.h"
#include <gmp.h>
#include <stdlib.h>

long calc_d(long m) {
  long d = m - 1;
 
  for (long i = 2; i <= m; i++)
    if ((m % i == 0) && (d % i == 0))
    {
      d--;
      i = 1;
    }

  return d;
}

long calc_e(long d, long m) {
  long e = 10;
 
    while (1)
    {
      if ((e * d) % m == 1)
          break;
      else
          e++;
    }
 
    return e;
}

long modpow(long base, long exp, long modulus) {
  base %= modulus;
  long result = 1;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exp >>= 1;
  }
  return result;
}

long calc_symbol_code(long index, long e, long n) {
  long result_long = modpow(index, e, n);
    return result_long;
}

void encrypt_rsa(long* text, long length, long e, long n) {
    for (long i = 0; i < length; i++)
    {
        text[i] = calc_symbol_code(text[i], e, n);
    }
}

EMSCRIPTEN_KEEPALIVE
long encrypt(long* text, long length, long p, long q) {
  long n = p * q; // public
  long m = (p - 1) * (q - 1);
  long d = calc_d(m);
  long e = calc_e(d, m); // public
  encrypt_rsa(text, length, e, n);
  long i = (long)text;
  return i;
}

long calc_symbol_code_naive(long index, long e, long n) {
  mpz_t big_temp;
  mpz_t big_pow;
  mpz_t big_whole_part;
  mpz_t big_mod;

  mpz_init(big_temp);
  mpz_init(big_pow);
  mpz_init(big_whole_part);
  mpz_init(big_mod);

  mpz_set_ui(big_temp, index);

  mpz_pow_ui(big_pow, big_temp, e);
  mpz_div_ui(big_whole_part, big_pow, n);
  mpz_mul_ui(big_temp, big_whole_part, n);
  mpz_sub(big_mod, big_pow, big_temp);

  long result_long = mpz_get_ui(big_mod);
  mpz_clear(big_temp);
  mpz_clear(big_pow);
  mpz_clear(big_whole_part);
  mpz_clear(big_mod);
  return result_long;
}

void encrypt_rsa_naive(long* text, long length, long e, long n) {
    for (long i = 0; i < length; i++)
    {
        text[i] = calc_symbol_code_naive(text[i], e, n);
    }
}

EMSCRIPTEN_KEEPALIVE
long naive_encrypt(long* text, long length, long p, long q) {
  long n = p * q; // public
  long m = (p - 1) * (q - 1);
  long d = calc_d(m);
  long e = calc_e(d, m); // public
  encrypt_rsa_naive(text, length, e, n);
  long i = (long)text;
  return i;
}

EMSCRIPTEN_KEEPALIVE
long* create_buffer(long width, long height) {
  return malloc(width * height * 4 * sizeof(long));
}

EMSCRIPTEN_KEEPALIVE
void destroy_buffer(long* p) {
  free(p);
}
