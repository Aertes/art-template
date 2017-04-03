const assert = require('assert');
const Compiler = require('../../src/compile/compiler');
const defaults = require('../../src/compile/defaults');

const compressor = source => {
    return source
        .replace(/\s+/g, ` `)
        .replace(/<!--[\w\W]*?-->/g, ``);
};

describe('#compile/compiler', () => {

    describe('addContext', () => {
        const test = (code, result) => {
            it(code, () => {
                defaults.source = '';
                const compiler = new Compiler(defaults);
                compiler.addContext(code);
                result.$out = '""';
                assert.deepEqual(result, compiler.context);
            });
        };

        test('value', {
            value: '$data.value'
        });

        test('if', {});
        test('for', {});
        test('$data', {});
        test('$imports', {});

        test('$escape', { $escape: '$imports.$escape' });
        test('$include', { $include: '$imports.$include' });

        it('imports', () => {
            const options = Object.create(defaults);
            options.imports.Math = Math;
            options.source = '';
            const compiler = new Compiler(options);
            compiler.addContext('Math');
            assert.deepEqual({
                $out: '""',
                Math: '$imports.Math'
            }, compiler.context);
        });

    });


    describe('addString', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                options.source = '';
                const compiler = new Compiler(options);
                compiler.addString(code);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        // raw
        test('hello', ['$out+="hello"']);
        test('\'hello\'', ['$out+="\'hello\'"']);
        test('"hello    world"', ['$out+="\\"hello    world\\""']);
        test('<div>hello</div>', ['$out+="<div>hello</div>"']);
        test('<div id="test">hello</div>', ['$out+="<div id=\\"test\\">hello</div>"']);

        // compressor
        test('  hello  ', ['$out+=" hello "'], { compressor });
        test('\n  hello  \n\n.', ['$out+=" hello ."'], { compressor });
        test('"hello    world"', ['$out+="\\"hello world\\""'], { compressor });
        test('\'hello    world\'', ['$out+="\'hello world\'"'], { compressor });
    });


    describe('addExpression', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                options.source = '';
                const compiler = new Compiler(options);
                compiler.addExpression(code);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        // v3 compat
        test('<%=value%>', ['$out+=$escape(value)']);
        test('<%=#value%>', ['$out+=value']);

        // v4
        test('<%-value%>', ['$out+=value']);
        test('<%- value %>', ['$out+= value ']);

        test('<%=value%>', ['$out+=value'], { escape: false });
        test('<%-value%>', ['$out+=value'], { escape: false });

        test('<%if (value) {%>', ['if (value) {']);
        test('<% if (value) { %>', [' if (value) { ']);
        test('<%    if ( value ) {    %>', ['    if ( value ) {    '], {
            compressor: true
        });

    });

    describe('addSource', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%=value%>', ['$out+=$escape(value)']);

        test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

    });


    describe('build', () => {
        const test = (code, result, options) => {
            it(code, () => {
                options = Object.assign({}, defaults, options);
                options.source = code;
                const compiler = new Compiler(options);
                assert.deepEqual(result, compiler.scripts);
            });
        };

        test('hello', ['$out+="hello"']);
        test('<%=value%>', ['$out+=$escape(value)']);
        test('hello <%=value%>.', ['$out+="hello "', '$out+=$escape(value)', '$out+="."']);
        test('<%-value%>', ['$out+=value']);
        test('hello <%-value%>.', ['$out+="hello "', '$out+=value', '$out+="."']);

        test('hello<%=value%>', ['$out+="hello"', '$out+=$escape(value)']);
        test('hello\n<%=value%>', ['$out+="hello\\n"', '$out+=$escape(value)']);

        test('<% if (value) { %>\nhello\n<% } %>', [' if (value) { ', '$out+="\\nhello\\n"', ' } ']);

    });




});