import Module from './RSA.js';

Module.onRuntimeInitialized = () => self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    const myArray = [17,20,9,4,14,25,4,12,9,23,2,15,3,7,18];
    const data = new Int32Array(myArray);
    const nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    const p = Module.ccall('create_buffer', 'number', ['number', 'number'], [nDataBytes]);

    const dataHeap = new Uint8Array(Module.HEAPU8.buffer, p, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));

    let t = performance.now();
    Module.ccall(fn, 'number', ['number', 'number', 'number', 'number'], [dataHeap.byteOffset, myArray.length, 17, 13]);
    const calcTime = performance.now() - t;
    t = performance.now();
    const result = Module.ccall('get_result', 'string', [], []);

    self.postMessage({
        message: 'execComplete',
        args: {
            id,
            result,
            calcTime,
            toStringTime: performance.now() - t,
        },
    });

    Module.ccall('free_result_str', 'undefined', [], []);
    Module.ccall('destroy_buffer', '', ['number'], p);
};
