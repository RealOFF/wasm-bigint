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
  
  function encrypt(text, length, p, q) {
    let n = p * q; // public
    let m = (p - 1) * (q - 1);
    let d = calc_d(m);
    let e = calc_e(d, m); // public
    return encrypt_rsa(text, length, e, n);
  }
  
  function calc_symbol_code(index, e, n) {
      let bigIndex = BigInt(index);
      let bigN = BigInt(n);
      let bigE = BigInt(e);
      let powResult = BigInt(0);
      
    
        powResult = bigIndex ** bigE;
    
      const wholePart = powResult / bigN;
      let partWithoutMod = wholePart * bigN;
      const modResult = powResult - partWithoutMod;
      const resultNumber = +modResult.toString();
      return resultNumber;
  }
  
  
  function encrypt_rsa(text, length, e, n) {
      for (let i = 0; i < length; i++)
      {
          text[i] = calc_symbol_code(text[i], e, n);
      }
      return text;
  }

self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    const myArray = args[0];
    let t = performance.now();
    const result = encrypt(...args);
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