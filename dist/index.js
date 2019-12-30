let uid = 0;
let workers = {};

const onSubmit = e => {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const { target } = e;

    if (!target || !target.id || !target.elements || !target.elements.value) {
        throw new Error('target is malformed');
    }

    let { elements: { value: { value } }, id: fn } = target;
    const row = document.createElement('tr');
    const header = document.createElement('th');

    value = Math.max(1, parseInt(value, 10));
    header.innerText = `${fn}(${value})`;
    row.appendChild(header);

    Object.entries(workers).forEach(([name, w]) => {
        const id = `${name}-${uid}`;

        const column = document.createElement('td');
        column.id = id;
        row.appendChild(column);

        w.postMessage({
            id,
            fn,
            args: [value]
        });
    });

    const firstRow = document.querySelector('table tr:first-child');
    if (firstRow) firstRow.parentNode.insertBefore(row, firstRow.nextSibling);

    ++uid;
    return false;
}

(() => {
    if (!window.Worker) {
        return alert('Unfortunately, your browser does not support WebWorkers');
    }

    let initializedWorkers = 0;

    ['native', 'gmp', 'ttmath'].forEach(el => {
        const worker = new Worker(`./workers/${el}.js`);
        worker.onmessage = ({ data: { message, args } }) => {
            switch (message) {
            case 'initialized':
                ++initializedWorkers;
                if (initializedWorkers === 3) {
                    document.querySelectorAll('button').forEach(b => b.disabled = false);
                    onSubmit({
                        target: {
                            id: 'fibonacci',
                            elements: {
                                value: { value: 100 },
                            },
                        },
                    });
                }
                break;
            case 'execComplete':
                console.debug(args);
                const el = document.getElementById(args.id);
                if (el) {
                    el.innerText = `${ args.calcTime.toFixed(2) }ms (+ ${ args.toStringTime.toFixed(2) }ms)`;
                }
                break;
            default:
                console.error(`Unknown message: '${message}'`);
            }
        };
        workers[el] = worker;
    });

    requestIdleCallback(() => {
        const forms = document.querySelectorAll('form');
        forms.forEach(f => f.addEventListener('submit', onSubmit));
    });
})();
