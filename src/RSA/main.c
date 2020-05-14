#include "emscripten.h"
#include <gmp.h>
#include <stdlib.h>

mpz_t *result = NULL;
char *result_str = NULL;

mpz_t *allocate_result(void) {
    if (!result) {
        mpz_clear(*result);
        free(result);
    }
    result = (mpz_t *) malloc(sizeof(mpz_t));
    mpz_init(*result);
    return result;
}

EMSCRIPTEN_KEEPALIVE
char *get_result(void) {
    if (!result) {
        return NULL;
    }

    if (result_str) {
        free(result_str);
    }
    result_str = (char *) malloc(sizeof(char) * (mpz_sizeinbase(*result, 10) + 2));

    mpz_get_str(result_str, 10, *result);

    mpz_clear(*result);
    free(result);
    result = NULL;

    return result_str;
}

EMSCRIPTEN_KEEPALIVE
void free_result_str(void) {
    if (!result_str) return;
    free(result_str);
    result_str = NULL;
}

long calc_d(int m) {
  long d = m - 1;
 
  for (long i = 2; i <= m; i++)
    if ((m % i == 0) && (d % i == 0))
    {
      d--;
      i = 1;
    }

  return d;
}

long calc_e(int d, int m) {
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

long calc_symbol_code(long index, long e, long n) {
    mpz_t big_int;
    mpz_t big_pow;
    mpz_t big_mod;

    mpz_init(big_int);
    mpz_init(big_pow);
    mpz_init(big_mod);

    mpz_set_ui(big_int, index);
    mpz_pow_ui(big_pow, big_int, e);
    mpz_mod_ui(big_mod, big_pow, n);

    long result_int = mpz_get_ui(big_mod);
    return result_int;
}

void encrypt_rsa(long* text, long length, long e, long n) {
    for (long i = 0; i < length; i++)
    {
        text[i] = calc_symbol_code(text[i], e, n);
    }
}

EMSCRIPTEN_KEEPALIVE
long encrypt(long* text, long length, long p, long q) {
  allocate_result();
  long n = p * q; // public
  long m = (p - 1) * (q - 1);
  long d = calc_d(m);
  long e = calc_e(d, m); // public
  encrypt_rsa(text, length, e, n);
  long i = (long)text;
  return i;
}

EMSCRIPTEN_KEEPALIVE
long* create_buffer(int width, int height) {
  return malloc(width * height * 4 * sizeof(long));
}

EMSCRIPTEN_KEEPALIVE
void destroy_buffer(long* p) {
  free(p);
}
