import { validateTag } from './tag-checker'

const inputs = [
    'The following text<C><B>is centred and in boldface</B></C>',
    '<B>This <g>is <B>boldface</B> in <<*> a</B> <\\6> <<d>sentence',
    '<B><C> This should be centred and in boldface, but the tags are wrongly nested </B></C>',
    '<B>This should be in boldface, but there is an extra closing tag</B></C>',
    '<B><C>This should be centred and in boldface, but there is a missing closing tag</C>',
]

inputs.map(validateTag).forEach((output) => console.log(output))
