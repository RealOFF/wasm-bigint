#!/usr/bin/env bash

set -e

curl --silent --show-error --output gmp-6.1.2.tar.xz https://gmplib.org/download/gmp/gmp-6.1.2.tar.xz
curl --silent --show-error --output ttmath-0.9.2-src.tar.gz ftp://ttmath.org/pub/ttmath/ttmath-0.9.2-src.tar.gz
echo -e "9dc6981197a7d92f339192eea974f5eca48fcffe  gmp-6.1.2.tar.xz\n27801dfd3077bb46930a411455024ab2bf5f011b  ttmath-0.9.2-src.tar.gz" | sha1sum -c -
