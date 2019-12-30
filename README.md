# WASM BigInt

A proof of concept of [GMP](https://gmplib.org/) (and [TTMath](https://www.ttmath.org/)) being compiled to WASM, as well as a benchmark comparing two implementations with native BigInt.

Both WASM implementations have a separate function for getting the result. It's implemented this way because in order to pass information from WASM to JS you have to convert the result to a string, that's not a zero-cost operation.

## Build process

```bash
./compile.sh
```

## Usage

```bash
python3 -m http.server --directory ./dist
```

or

```bash
cd ./dist && python -m SimpleHTTPServer
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

## TravisCI

TravisCI is configured to push compilation artifacts to `gh-pages`.
