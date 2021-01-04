import * as urllist from '../src/urllist'

test('test read', async () => {
    let count = 0

    for await (const ipnetwork of urllist.read('./__tests__/list1.list')) {
        count += 1
    }
    for await (const ipnetwork of urllist.read('./__tests__/list2.json')) {
        count += 1
    }

    expect(count).toBe(5)
})

test('test collapsing 1', () => {
    let collapsed = urllist.collapse([
        'www.example.com',
        'demisto.pan.dev',
        'strata.pan.dev',
        'STRATA.pan.dev',
        'demisto.pan.dev',
        'https://strata.pan.dev'
    ])
    expect(collapsed).toEqual(
        [
            'demisto.pan.dev',
            'strata.pan.dev',
            'STRATA.pan.dev',
            'www.example.com',
            'https://strata.pan.dev'
        ].sort((a, b) => a.localeCompare(b))
    )
})

test('test filter 1', () => {
    let filters = [
        new RegExp(/example\.com$/, 'i'),
        new RegExp(/http:\/\/strata\.pan\.dev/, 'i')
    ]
    let urlList = [
        'www.example.com',
        'example.com.pan.dev',
        'strata.pan.dev',
        'https://strata.pan.dev',
        'http://strata.pan.dev'
    ]
    let {delta, result} = urllist.filter(urlList, filters)
    expect(delta.sort()).toEqual(['http://strata.pan.dev', 'www.example.com'])
    expect(result.sort()).toEqual([
        'example.com.pan.dev',
        'https://strata.pan.dev',
        'strata.pan.dev'
    ])
})
