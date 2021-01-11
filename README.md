# mm-process-url-list

This action can be used to process list of URLs.

The action can be used to:
- aggregate and collapse multiple lists
- drop the entries matching a list of regular expressions
- transform the list in a new format

## Inputs

### `list`

*Required*

Name of the list(s) to operate on. This input supports glob patterns (see: [@actions/glob](https://github.com/actions/toolkit/tree/master/packages/glob)).

All the files matching the given glob pattern are aggregated and collapsed before filtering.

### `followSymbolicLinks`

If symbolic link should be followed during processing of glob pattern in `list`.

Default: *true*. Set to `False` to disable symbolic link.

### `initval`

Path to a list of URLs. Entries from `list` are added to this before processing. You can think of it as the `initval` argument in a `reduce` op.

Default: *none*

### `filter`

Path to a list of regular expressions. If an entry from `list` matches one of the entries in `filter`, the overlapping part will be dropped and won't show up in `result`.

Default: *none*

### `inPlace`

Lists matching the pattern in `list` are filtered in place, no aggregation is performed.

Default: *false*. Set to *True* to enable.

### `outFormat`

Format of the generated list. Currently the following formats are supported:
- `PANOSURL`: list compatible with URL EDL feature of PAN-OS

Default: *plain text format*

### `result`

Path of the list with the processing results.

### `delta`

Path of the list with entries dropped by filtering operations.

## Outputs

### `result`

Path of the list with the processing results.

### `delta`

Path of the list with entries dropped by filtering operations.

## Example usage

### Filter & Transform in place
```yaml
# Basic usage, all the lists matching the glob ./temp/**/*-urls.txt
# are translated in PAN-OS URL EDL format and then filtered with
# regular expressions in the file url-exclusion-list
uses: jtschichold/mm-process-url-list
with:
    list: ./temp/**/*-urls.txt
    inPlace: true
    outFormat: PANOSURL
    filter: ./url-exclusion-list
```

# License

The scripts and documentation in this project are released under the [MIT License](LICENSE)