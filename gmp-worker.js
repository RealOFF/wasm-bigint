import Module from './gmp.js';

Module.onRuntimeInitialized = () => self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    let t = performance.now();
    Module.ccall(fn, 'undefined', ['number'], args);
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
};
