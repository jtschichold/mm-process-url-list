import * as readline from 'readline'
import * as fs from 'fs'

export async function read(path: string): Promise<RegExp[]> {
    const fileStream = fs.createReadStream(path, 'utf-8')
    const readLine = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    })
    const result: RegExp[] = []

    for await (const line of readLine) {
        if (line.startsWith('#')) {
            continue
        }

        const trimmedLine = line.trim()
        if (trimmedLine.length === 0) {
            continue
        }

        result.push(new RegExp(trimmedLine, 'i'))
    }

    return result
}
