#include <emscripten.h>
#include <emscripten/bind.h>
#include <ttmath/ttmath.h>
#include <cmath>

typedef ttmath::UInt<4096> bigUint_t;

bigUint_t *result = nullptr;

bigUint_t* allocate_result() {
    if (!result) {
        result = new bigUint_t;
    }
    return result;
}

std::string get_result() {
    if (result) {
        auto str = result->ToString();
        delete result;
        result = nullptr;
        return str;
    }
    return "";
}

void naive_factorial(size_t nth) {
    allocate_result();

    *result = 1;

    for (size_t i = 2; i <= nth; ++i) {
        result->MulInt(i);
    }
}

std::vector<uint64_t> primes(uint64_t upTo) {
    if (upTo < 2) {
        return std::vector<uint64_t>();
    }

    uint64_t length = (upTo + 1) >> 1;
    bool *sieve = new bool[length]; // std::vector<bool> is avoided intentionally
    for (uint64_t i = 1; i < length; ++i) {
        sieve[i] = false;
    }

    for (uint64_t i = 1, iterations = (uint64_t) std::sqrt(length - 1); i < iterations; ++i) {
        if (!sieve[i]) {
            for (uint64_t step = 2 * i + 1, j = i * (step + 1); j < length; j += step) {
                sieve[j] = true;
            }
        }
    }

    size_t primes = 0;
    for (uint64_t i = 0; i < length; ++i) {
        if (sieve[i]) ++primes;
    }

    std::vector<uint64_t> result = { 2 };
    result.reserve(primes);
    for (uint64_t i = 1, j = 1; i < length; ++i) {
        if (!sieve[i]) {
            result.push_back(2 * i + 1);
        }
    }
    delete[] sieve;

    return result;
}

bigUint_t product(const std::vector<bigUint_t>& multipliers, uint64_t i, uint64_t j) {
    if (i > j) return bigUint_t(1);
    if (i == j) return multipliers[i];
    uint64_t k = (i + j) >> 1;
    return product(multipliers, i, k) * product(multipliers, k + 1, j);
}

bigUint_t prime_swing(uint64_t n, const std::vector<uint64_t>& primes) {
    std::vector<bigUint_t> multipliers;
    for (uint64_t i = 0; i < primes.size() && primes[i] <= n; i++) {
        uint64_t prime = primes[i];

        bigUint_t p = 1;

        uint64_t q = n;
        while (q != 0) {
            q = q / prime;
            if (q % 2 == 1) {
                p.MulInt(prime);
            }
        }

        if (p != bigUint_t(1)) {
            multipliers.push_back(p);
        }
    }
    return product(multipliers, 0, multipliers.size() - 1);
}

bigUint_t factorial_rec(size_t nth, const std::vector<uint64_t>& primes) {
    if (nth < 2) return bigUint_t(1);
    bigUint_t f = factorial_rec(nth / 2, primes);
    bigUint_t ps = prime_swing(nth, primes);
    return f * f * ps;
}

void factorial(size_t nth) {
    allocate_result();

    *result = factorial_rec(nth, primes(nth));
}


void naive_fibonacci(size_t nth) {
    allocate_result();

    bigUint_t &curr = *result;
    curr = 0;

    bigUint_t t, next = 1;

    for (size_t i = 0; i < nth; ++i) {
        t = curr + next;
        curr = next;
        next = t;
    }
}

void fibonacci(size_t nth) {
    allocate_result();
    bigUint_t &curr = *result;
    curr = 0;

    bigUint_t next = 1;
    for (size_t i = 31; i-- > 0;) {
        bigUint_t temp1 = curr * (next * bigUint_t(2) - curr);
        bigUint_t temp2 = curr * curr + next * next;
        curr = temp1;
        next = temp2;
        if ((nth >> i & 1) != 0) {
            bigUint_t temp3 = curr + next;
            curr = next;
            next = temp3;
        }
    }
}

EMSCRIPTEN_BINDINGS(my_module) {
    emscripten::function("naive_factorial", &naive_factorial);
    emscripten::function("factorial", &factorial);
    emscripten::function("naive_fibonacci", &naive_fibonacci);
    emscripten::function("fibonacci", &fibonacci);
    emscripten::function("get_result", &get_result);
}
