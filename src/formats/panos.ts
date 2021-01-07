import {OutputFormat} from './models'

function sanitizeToken(t: string, wildcard: string): string {
    return t.match(/^[^*^]*$/) ? t : wildcard
}

function panosURL(list: string[]): string[] {
    const result: string[] = []

    for (const entry of list) {
        let newEntry = entry.replace(/^\w+:\/\//, '') // remove protocol
        newEntry = newEntry.replace(/^([-a-zA-Z0-9.]+)(?::[0-9]+)*/, '$1') // remove port

        let currentToken = ''
        let sanitizedNewEntry = ''
        for (const c of newEntry) {
            if ('./?&=;+'.includes(c)) {
                sanitizedNewEntry += sanitizeToken(currentToken, '*')
                sanitizedNewEntry += c
                currentToken = ''

                continue
            }

            currentToken += c
        }
        if (currentToken !== '') {
            sanitizedNewEntry += sanitizeToken(currentToken, '*')
        }
        if (sanitizedNewEntry.match(/^[-a-zA-Z0-9.*^]+$/)) {
            // fqdn with no path
            sanitizedNewEntry += '/' // add / at the end
        }

        result.push(sanitizedNewEntry)
    }

    return result
}

export const format: OutputFormat = {
    PANOSURL: panosURL
}
