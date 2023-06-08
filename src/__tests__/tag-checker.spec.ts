import { parseTag, readTag, validateTag } from '../tag-checker'

describe('validateTag()', () => {
    it.each([
        {
            message: 'should report well format',
            input: 'The following text<C><B>is centred and in boldface</B></C>',
            output: 'Correctly tagged paragraph',
        },
        {
            message:
                'should report well format and ignore tags contain non-captial letters',
            input: '<B>This <g>is <B>boldface</B> in <<*> a</B> <\\6> <<d>sentence',
            output: 'Correctly tagged paragraph',
        },
        {
            message: 'should report mismatched tag',
            input: '<B><C> This should be centred and in boldface, but the tags are wrongly nested </B></C>',
            output: 'Expected </C> found </B>',
        },
        {
            message: 'should report extra closing tag',
            input: '<B>This should be in boldface, but there is an extra closing tag</B></C>',
            output: 'Expected # found </C>',
        },
        {
            message: 'should report missing closing tag',
            input: '<B><C>This should be centred and in boldface, but there is a missing closing tag</C>',
            output: 'Expected </B> found #',
        },
    ])('$message', ({ input, output }) => {
        const result = validateTag(input)
        expect(result).toBe(output)
    })
})

describe('parseTag', () => {
    it.each`
        description                                                   | prefix                | tagName  | tagPrefix | tail       | expected
        ${'has tag only'}                                             | ${''}                 | ${'BBB'} | ${''}     | ${''}      | ${['BBB', 'leading', '']}
        ${'has closing tag only'}                                     | ${''}                 | ${'BBB'} | ${'/'}    | ${''}      | ${['BBB', 'closing', '']}
        ${'has closing tag with prefix'}                              | ${'AAA'}              | ${'BBB'} | ${'/'}    | ${''}      | ${['BBB', 'closing', '']}
        ${'has closing tag with tail'}                                | ${''}                 | ${'BBB'} | ${'/'}    | ${'AAA'}   | ${['BBB', 'closing', 'AAA']}
        ${'has closing tag with another tag as tail'}                 | ${''}                 | ${'BBB'} | ${'/'}    | ${'<AAA>'} | ${['BBB', 'closing', '<AAA>']}
        ${'has closing tag with tail and invalid tag prefix '}        | ${'<a><><Aa><1>'}     | ${'BBB'} | ${'/'}    | ${'AAA'}   | ${['BBB', 'closing', 'AAA']}
        ${'has closing tag with tail and invalid closing tag prefix'} | ${'</a></></Aa></1>'} | ${'BBB'} | ${'/'}    | ${'AAA'}   | ${['BBB', 'closing', 'AAA']}
    `(
        'should parse next tag with remnant correctly [$description]',
        ({ prefix, tagName, tagPrefix, tail, expected }) => {
            const input = `${prefix}<${tagPrefix}${tagName}>${tail}`

            const result = parseTag(input)

            expect(result).toMatchObject({
                tag: {
                    name: expected[0],
                    mode: expected[1],
                },
                remnant: expected[2],
            })
        }
    )

    it.each(['', '<>', 'aaa'])('should return tag no found', (input) => {
        const result = parseTag(input)
        expect(result).toMatchObject({
            tag: undefined,
            remnant: undefined,
        })
    })
})

describe('readTag', () => {
    it.each`
        input                      | expected
        ${'<AAA></BBB><CCC>'}      | ${[['AAA', 'leading'], ['BBB', 'closing'], ['CCC', 'leading']]}
        ${'<aAAA></BBB><CCC>'}     | ${[['BBB', 'closing'], ['CCC', 'leading']]}
        ${'<aAAA></BBB>aaaa<CCC>'} | ${[['BBB', 'closing'], ['CCC', 'leading']]}
    `('should read all valid tags', ({ input, expected }) => {
        const result = [...readTag(input)]

        expect(result).toMatchObject(
            expected.map(([name, mode]: [string, string]) => ({ name, mode }))
        )
    })
})
