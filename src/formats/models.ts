export type OutputFormatMapper = (list: string[]) => string[]
export interface OutputFormat {
    [fmtName: string]: OutputFormatMapper
}
