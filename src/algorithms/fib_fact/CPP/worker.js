import Module from './ttmath.js';

Module.onRuntimeInitialized = () => self.postMessage({
    message: 'initialized',
    args: {},
});

self.onmessage = ({ data: { id, fn, args } }) => {
    let t = performance.now();
    Module[fn](...args);
    const calcTime = performance.now() - t;
    t = performance.now();
    const result = Module.get_result();

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
