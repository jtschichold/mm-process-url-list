import {format as panosFormats} from './panos'
import {OutputFormat} from './models'

export {OutputFormat, OutputFormatMapper} from './models'
export const outputFormats: OutputFormat = {
    ...panosFormats
}
