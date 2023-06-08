type Tag = {
    name: string
    mode: 'leading' | 'closing'
}

// return the next immediate valid tag and renaming string after found tag
export const parseTag = (input: string): { tag?: Tag; remnant?: string } => {
    // matching pattern like:
    // `{some prefix}</AAA>123` => closing: /, tagName: AAA, tail: 123
    const { closing, tagName, tail } =
        /<(?<closing>\/?)(?<tagName>[A-Z]+)>(?<tail>.*)/.exec(input)?.groups ??
        {}

    const tag = tagName
        ? ({
              name: tagName,
              mode: closing ? 'closing' : 'leading',
          } as const)
        : undefined

    return { tag, remnant: tail }
}

// generator function for returning all valid tags
export function* readTag(input: string) {
    while (true) {
        const { tag, remnant } = parseTag(input)

        // report found tag
        if (tag) yield tag

        // reach the end and terminate
        if (!remnant) return

        // otherwise, cont' to get next tag with remaining text
        input = remnant
    }
}

// return string format like </TagName>
export const formatAsClosingTag = (tag?: Tag) =>
    tag?.name ? `</${tag?.name}>` : '#'

// engine for checking if all tags match with each other
export const validateTag = (input: string): string => {
    const tagStack: Tag[] = []

    for (const tag of readTag(input)) {
        switch (tag.mode) {
            case 'leading':
                tagStack.push(tag)
                break
            case 'closing':
                const previous = tagStack.pop()

                // check if the previous leading tag can match the current closing tag
                if (previous?.name !== tag.name)
                    return `Expected ${formatAsClosingTag(
                        previous
                    )} found ${formatAsClosingTag(tag)}`
                break
        }
    }

    // at the end, all tags should be matched and the stack should be empty
    const last = tagStack.pop()
    return last
        ? `Expected ${formatAsClosingTag(last)} found #`
        : 'Correctly tagged paragraph'
}
