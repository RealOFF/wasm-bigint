function primes(upTo) {
    if (upTo < 2) {
        return [];
    }

    const length = (upTo + 1) >>> 1;
    let sieve = new Array(length).fill(false);

    for (let i = 1, iters = Math.sqrt(length - 1) | 0; i < iters; ++i) {
        if (!sieve[i]) {
            for (let step = 2 * i + 1, j = i * (step + 1); j < length; j += step) {
                sieve[j] = true;
            }
        }
    }

    let primes = 0;
    for (let i = 0; i < length; ++i) {
        if (!sieve[i]) ++primes;
    }

    const result = new Array(primes);
    result[0] = 2
    for (let i = 1, j = 1; i < length; ++i) {
        if (!sieve[i]) {
            result[j++] = 2 * i + 1;
        }
    }

    return result;
}

function product(multipliers, i, j) {
    if (i > j) return 1n;
    if (i == j) return multipliers[i];
    const k = (i + j) >>> 1;
    return product(multipliers, i, k) * product(multipliers, k + 1, j);
}

function primeSwing(nth, primes) {
    const multipliers = [];
    for (let i = 0; i < primes.length && primes[i] <= nth; i++) {
        let prime = primes[i];

        let p = 1n;

        let q = nth;
        while (q != 0) {
            q = (q / prime) | 0;
            if (q % 2 == 1) {
                p = p * BigInt(prime);
            }
        }

        if (p != 1n) {
            multipliers.push(p);
        }
    }
    return product(multipliers, 0, multipliers.length - 1);
}

function factorialRec(nth, primes) {
    if (nth < 2) return 1n;
    const f = factorialRec((nth / 2) | 0, primes);
    const ps = primeSwing(nth, primes);
    return f * f * ps;
}

const fns = {
    naive_fibonacci: nth => {
        let curr = 0n;
        let next = 1n;
        for (let i = 0; i < nth; ++i) {
            const t = curr + next;
            curr = next;
            next = t;
        }
        return curr;
    },
    fibonacci: nth => {
        let curr = 0n;
        let next = 1n;
        for (let i = 31; i >= 0; --i) {
            const temp1 = curr * (next * 2n - curr);
            const temp2 = curr * curr + next * next;
            curr = temp1;
            next = temp2;
            if ((nth >> i & 1) != 0) {
                const temp3 = curr + next;
                curr = next;
                next = temp3;
            }
        }
        return curr;
    },
    naive_factorial: nth => {
        let result = 1n;
        for (let i = 2; i <= nth; ++i) {
            result *= BigInt(i);
        }
        return result;
    },
    factorial: nth => factorialRec(nth, primes(nth)),
}

self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    let t = performance.now();
    let result = fns[fn](...args);
    const calcTime = performance.now() - t;
    t = performance.now();
    result = result.toString();

    self.postMessage({
        message: 'execComplete',
        args: {
            id,
            result,
            calcTime,
            toStringTime: performance.now() - t,
        },
    });
};
