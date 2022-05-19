#!/bin/bash
cd ./rust
wasm-pack build
cd ..
yarn upgrade startest2
yarn dev