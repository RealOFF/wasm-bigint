import Module from './RSA.js';

Module.onRuntimeInitialized = () => self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    const [myArray, length, keyQ, keyP] = args;
    const data = new Int32Array(myArray);
    const nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    const p = Module.ccall('create_buffer', 'number', ['number', 'number'], [nDataBytes]);

    const dataHeap = new Uint8Array(Module.HEAPU8.buffer, p, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));

    let t = performance.now();
    Module.ccall(fn, 'number', ['number', 'number', 'number', 'number'], [dataHeap.byteOffset, length, keyQ, keyP]);
    const calcTime = performance.now() - t;
    t = performance.now();
    const result = new Int32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);

    console.log(result)
    self.postMessage({
        message: 'execComplete',
        args: {
            id,
            result,
            calcTime,
        },
    });

    Module.ccall('destroy_buffer', '', ['number'], p);
};
