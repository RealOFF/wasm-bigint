#!/usr/bin/env bash

# -e - exit on error
# -u - treat unset variables as an error
# -x - print each command before executing it
# -o pipefail - sets the exit code of a pipeline to that of the rightmost command to exit with a non-zero status,
#   or to zero if all commands of the pipeline exit successfully.
set -euxo pipefail

LIB_PATH="${PWD}/opt"
export GIT_AUTHOR_DATE="$(git log -n1 --format='%aI')"
export GIT_COMMITTER_DATE="$(git log -n1 --format='%cI')"

set +x
if [[ "${GIT_REMOTE:+1}" && "${SSH_KEY:+1}" ]]; then
	echo -e "Host *\n\tStrictHostKeyChecking no\n" > ~/.ssh/config
	eval $(ssh-agent -s)
	echo "${SSH_KEY}" | xxd -r -p | ssh-add -
fi
set -x

# get emsdk
git submodule update --init --recursive
# git submodule update --recursive --remote

# get dependencies
pushd "${LIB_PATH}/src"
[[ ! -d "gmp-6.1.2" ]] && tar xf gmp-6.1.2.tar.xz
[[ ! -d "ttmath-0.9.2" ]] && tar xf ttmath-0.9.2-src.tar.xz
popd # ${LIB_PATH}/src

# setup emsdk
pushd emsdk
if [[ ! -f "${HOME}/.emscripten" ]]; then
	# ./emsdk install latest
	./emsdk install 1.39.5
	# ./emsdk activate latest
	./emsdk activate 1.39.5
fi
source ./emsdk_env.sh
popd # emsdk

# compile dependencies
pushd "${LIB_PATH}/src"
if [[ ! -d "${LIB_PATH}/include" ]]; then
	pushd gmp-6.1.2
	emconfigure ./configure "CC_FOR_BUILD=gcc" "CCAS=gcc -c" "CFLAGS=-m32 -DPIC" --host=x86_64-pc-linux-gnu --build=i686-pc-linux-gnu --disable-assembly --prefix=${LIB_PATH}
	make -s -j4
	make -s install
	popd # gmp-6.1.2
fi
if [[ ! -d "${LIB_PATH}/include/ttmath" ]]; then
	pushd ttmath-0.9.2
	mv ttmath "${LIB_PATH}/include"
	popd # ttmath-0.9.2
fi
popd # ${LIB_PATH}/src

# compile wasm modules
emcc -O3 -o dist/workers/gmp.js gmp.c \
	${LIB_PATH}/lib/libgmp.a \
	-I ${LIB_PATH}/include \
	-s WASM=1 \
	-s "EXTRA_EXPORTED_RUNTIME_METHODS=['ccall', 'cwrap']"

emcc --bind -O3 -std=c++14 -o dist/workers/ttmath.js ttmath.cpp \
	-I ${LIB_PATH}/include \
	-s WASM=1 \
	-s ALLOW_MEMORY_GROWTH=1

# patch resulting .js-files turning them into workers
< gmp-worker.js sed '/^import/ d' >> dist/workers/gmp.js
< ttmath-worker.js sed '/^import/ d' >> dist/workers/ttmath.js

# deploy to gh-pages
if [[ "${GIT_REMOTE:+1}" ]]; then
	pushd dist
	git init
	git checkout --orphan gh-pages
	git add .
	git config user.name "${GIT_NAME:-Travis CI}"
	git config user.email "${GIT_EMAIL:-travisci@localhost}"
	git commit -m "gh-pages"
	git remote add origin "${GIT_REMOTE}"
	git push -f -u origin gh-pages
	popd # dist
fi
