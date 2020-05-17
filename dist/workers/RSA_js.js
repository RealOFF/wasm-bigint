function calc_d(m) {
    let d = m - 1;
   
    for (let i = 2; i <= m; i++)
      if ((m % i == 0) && (d % i == 0))
      {
        d--;
        i = 1;
      }
  
    return d;
  } 
  
  
  function calc_e(d, m) {
    let e = 10;
   
      while (1)
      {
        if ((e * d) % m == 1)
            break;
        else
            e++;
      }
   
      return e;
  }

  function powerMod(base, exponent, modulus) {
    if (modulus === 1) return 0;
    var result = 1;
    base = base % modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1)  //odd number
            result = (result * base) % modulus;
        exponent = exponent >> 1; //divide by 2
        base = (base * base) % modulus;
    }
    return result;
  }

function calc_symbol_code(index, e, n) {
  return powerMod(index, e, n);
}

function calc_symbol_code_naive(index, e, n) {
  const bigIndex = BigInt(index);
  const bigE = BigInt(e);
  const bigN = BigInt(n);

  const powResult = bigIndex ** bigE;
  const wholePart = powResult / bigN;
  const partWithoutMod = wholePart * bigN;
  const modResult = powResult - partWithoutMod;

  const resultNumber = +modResult.toString();
  return resultNumber;
}


function encrypt_rsa(text, length, e, n, method) {
    for (let i = 0; i < length; i++)
    {
        text[i] = method(text[i], e, n);
    }
    return text;
}

function encrypt_naive(text, length, p, q) {
  let n = p * q; // public
  let m = (p - 1) * (q - 1);
  let d = calc_d(m);
  let e = calc_e(d, m); // public
  return encrypt_rsa(text, length, e, n, calc_symbol_code_naive);
}
  
function encrypt(text, length, p, q) {
  let n = p * q; // public
  let m = (p - 1) * (q - 1);
  let d = calc_d(m);
  let e = calc_e(d, m); // public
  return encrypt_rsa(text, length, e, n, calc_symbol_code);
}

self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    const func = fn.name === 'encrypt' ?
      encrypt :
      encrypt_naive;

    let t = performance.now();
    const result = func(...args);
    const calcTime = performance.now() - t;
    t = performance.now();

    console.log(result)
    self.postMessage({
        message: 'execComplete',
        args: {
            id,
            result,
            calcTime,
        },
    });
};
