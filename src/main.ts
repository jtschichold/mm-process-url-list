import * as core from '@actions/core'
import * as glob from '@actions/glob'
import * as urlfilters from './urlfilters'
import * as urllist from './urllist'

interface ActionInputs {
    list: string
    listGlobOptions: glob.GlobOptions
    initval?: string
    filter?: string
    inPlace?: boolean
    outFormat?: string
    result: string
    delta: string
}

function parseInputs(): ActionInputs {
    const result: ActionInputs = {
        list: core.getInput('list', {required: true}),
        listGlobOptions: {
            followSymbolicLinks:
                core.getInput('followSymbolicLinks').toUpperCase() !== 'FALSE'
        },
        result: core.getInput('result'),
        delta: core.getInput('delta')
    }

    const initval: string = core.getInput('initval')
    if (initval) result.initval = initval

    const filter: string = core.getInput('filter')
    if (filter) result.filter = filter

    const filterInPlace: string = core.getInput('inPlace')
    if (filterInPlace && filterInPlace.toLocaleUpperCase() !== 'FALSE')
        result.inPlace = true

    const outFormat: string = core.getInput('outFormat')
    if (outFormat) result.outFormat = outFormat

    if (
        result.inPlace &&
        (result.delta || result.result || result.initval)
    ) {
        core.warning(
            'inPlace input set: delta, result and initval inputs are ignored'
        )
    }

    core.info(`Inputs: ${result}`)

    return result
}

async function run(): Promise<void> {
    try {
        const inputs = parseInputs()
        let filters: RegExp[] = []

        // add the nets from the file
        if (inputs.filter) {
            core.info(`Loading filter entries from ${inputs.filter}...`)
            filters = await urlfilters.read(inputs.filter)
        }

        if (!inputs.inPlace) {
            let delta: string[] = []

            // load the initial list if present
            const initialList: string[] = []

            if (inputs.initval) {
                core.info(`Loading initval from ${inputs.initval}...`)

                for await (const iventry of urllist.read(inputs.initval)) {
                    initialList.push(iventry)
                }
            }

            // load the additional list
            const globber = await glob.create(
                inputs.list,
                inputs.listGlobOptions
            )
            for await (const lpath of globber.globGenerator()) {
                core.info(`Loading list from ${lpath}...`)
                for await (const nentry of urllist.read(lpath)) {
                    initialList.push(nentry)
                }
            }

            // aggregate the list
            core.info('Aggregating and collapsing the list...')
            let result = urllist.collapse(initialList)

            // let's filter (if needed)
            if (filters.length !== 0) {
                let fdelta: string[]

                core.info('Filtering the list...')
                ;({result, delta: fdelta} = urllist.filter(result, filters))
                core.warning(`Entries ${fdelta.join(', ')} filtered...`)
                delta = delta.concat(fdelta)
            }

            // save my stuff
            core.info('Saving outputs...')
            if (inputs.result) {
                await urllist.write(inputs.result, result)
            }
            if (inputs.delta) {
                await urllist.write(inputs.delta, delta)
            }

            core.setOutput('result', inputs.result)
            core.setOutput('delta', inputs.delta)
        } else {
            const globber = await glob.create(
                inputs.list,
                inputs.listGlobOptions
            )
            for await (const lpath of globber.globGenerator()) {
                core.info(`Processing list from ${lpath}...`)
                const currentList: string[] = []

                for await (const nentry of urllist.read(lpath)) {
                    currentList.push(nentry)
                }

                let result = urllist.collapse(currentList)

                // let's filter (if needed)
                if (filters.length !== 0) {
                    let delta: string[]

                    core.info('Filtering the list...')
                    ;({result, delta} = urllist.filter(result, filters))
                    core.warning(`Entries ${delta.join(', ')} filtered...`)
                }

                await urllist.write(lpath, result)
            }
        }
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
