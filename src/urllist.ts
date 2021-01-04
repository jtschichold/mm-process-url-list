import * as core from '@actions/core'
import * as readline from 'readline'
import * as fs from 'fs'

function readAsJSON(path: string): string[] | null {
    let result: string[]

    try {
        result = JSON.parse(fs.readFileSync(path, {encoding: 'utf-8'}))

        if (!Array.isArray(result)) {
            return null
        }
    } catch {
        return null
    }

    core.info(`Read ${path} as JSON`)
    return result
}

async function* readAsText(path: string): AsyncGenerator<string, void, void> {
    const fileStream = fs.createReadStream(path, 'utf-8')
    const readLine = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })

    for await (const line of readLine) {
        if (line.startsWith('#')) {
            continue
        }

        const trimmedLine = line.trim()
        if (trimmedLine.length === 0) {
            continue
        }

        yield trimmedLine
    }
}

// real stuff
export async function* read(path: string): AsyncGenerator<string, void, void> {
    let entries:
        | null
        | AsyncGenerator<string, void, void>
        | string[] = readAsJSON(path)
    if (entries == null) {
        entries = readAsText(path)
    }

    for await (const entry of entries) {
        yield entry
    }
}

export async function write(path: string, list: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const wstream = fs.createWriteStream(path, {
            flags: 'w+',
            encoding: 'utf-8'
        })

        for (const entry of list) {
            wstream.write(entry)
            wstream.write('\n')
        }
        wstream.end()

        wstream.on('finish', () => resolve('OK'))
        wstream.on('error', reject)
    })
}

export function collapse(list: string[]): string[] {
    // XXX we don't do much here
    // better equality match
    const resultMap: Map<string, string> = new Map()

    for (const e of list) {
        if (resultMap.has(e)) continue
        resultMap.set(e, e)
    }

    return Array.from(resultMap.values()).sort((a, b) => a.localeCompare(b))
}

export function filter(
    list: string[],
    filterList: RegExp[]
): {result: string[]; delta: string[]} {
    if (filterList.length === 0) {
        return {result: list, delta: []}
    }

    const result: string[] = []
    const delta: string[] = []

    for (const entry of list) {
        const target = filterList.find(cfre => cfre.test(entry))
            ? delta
            : result
        target.push(entry)
    }

    return {result, delta}
}
