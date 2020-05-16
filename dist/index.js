let uid = 0;
const workers = [];

const SORTED_STUCTURE = {
    factorial: ['fib_fact_js', 'fib_fact_c', 'fib_fact_cpp'],
    fibonacci: ['fib_fact_js', 'fib_fact_c', 'fib_fact_cpp'],
    encrypt: ['RSA_js', 'RSA_c', ''],
};

function getViewValues(maxColumnLength, ...args) {
    const viewValues = args.map((el) => {
        return el.length > maxColumnLength ?
        el.slice(0, maxColumnLength) + '...' :
        el;
    });
    return viewValues.join(', ');
}

function parseValues(...args) {
    return args.map((el) => {
        try {
            const parsedValue = JSON.parse(el);
            switch (typeof parsedValue) {
                case 'number':
                    return Math.max(1, parsedValue);
                case 'object':
                    return Array.isArray(parsedValue) ? parsedValue : null;
                default:
                    return null;
            }
        } catch {
            return null;
        }
    })

}


function getArguments(functionName, elements) {
    const argsLength = functionName === 'encrypt' ? 3 : 1;

    return [].slice.call(elements, 0, argsLength).map((el) => el.value);
}

function getWorkerArguments(args) {
    const {length} = args;
    return length > 1 ?
        [args[0], length, ...args.slice(1)] :
        [args[0]];
}

function onSubmit(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const { target } = e;

    if (!target || !target.id || !target.elements || !target.elements.value) {
        throw new Error('target is malformed');
    }

    const { elements, id: fn } = target;
    const args = getArguments(fn, elements);
    if (!args) {
        return;
    }
    const parsedArgs = parseValues(...args);
    const row = document.createElement('tr');
    const header = document.createElement('th');

    const maxColumnLength = 7;
    
    header.innerText = `${fn}(${getViewValues(maxColumnLength, args)})`;
    row.appendChild(header);

    SORTED_STUCTURE[fn].forEach((workerName) => {
        const workerObject = workers.find(({name}) => name === workerName);
        const column = document.createElement('td');

        if (workerObject) {
            const id = `${workerName}-${uid}`;
            column.id = id;

            workerObject.worker.postMessage({
                id,
                fn,
                args: getWorkerArguments(parsedArgs)
            });
        } else {
            column.innerText = 'None';
        }

        row.appendChild(column);
    });

    const firstRow = document.querySelector('table tr:first-child');
    if (firstRow) firstRow.parentNode.insertBefore(row, firstRow.nextSibling);

    ++uid;
    return false;
}

(() => {
    let initializedWorkers = 0;

    const workerNames = ['RSA_c', 'RSA_js', 'fib_fact_c', 'fib_fact_cpp', 'fib_fact_js'];

    workerNames.forEach(name => {
        const worker = new Worker(`./workers/${name}.js`);
        worker.onmessage = ({ data: { message, args } }) => {
            switch (message) {
            case 'initialized':
                ++initializedWorkers;
                if (initializedWorkers === workers.length) {
                    document.querySelectorAll('form').forEach(f => f.addEventListener('submit', onSubmit));
                    document.querySelectorAll('button').forEach(b => b.disabled = false);
                }
                break;
            case 'execComplete':
                console.debug(args);
                const el = document.getElementById(args.id);
                if (el) {
                    el.innerText = `${ args.calcTime.toFixed(3) }ms ${ args.toStringTime ? '(+ ' + args.toStringTime.toFixed(3) + ' ms)' : ''}`;
                }
                break;
            default:
                console.error(`Unknown message: '${message}'`);
            }
        };
        workers.push({name, worker});
    });
})();
