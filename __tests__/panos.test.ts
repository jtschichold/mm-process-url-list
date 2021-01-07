import * as panos from '../src/formats/panos'

test('test panosURL', async () => {
    const vector = [
        'http://www.hanecaklaw.com/',
        'http://www.hanoiguidedtours.com/iQ2q1f.php',
        'http://www.weddingsonthefrenchriviera.com/wp-content/uploads/bcswkG.php',
        '*abc.example.com/foobar?a=:80',
        'https://*abc.*test.com',
        'http://www.example.com:1000',
        'http://*.feyda.net/hOeDr4.php',
        'dillardvideo.com/wp-admin/network/2-*.php'
    ]

    let result = panos.format['PANOSURL'](vector)

    expect(result.sort()).toEqual([
        '*.*.com/',
        '*.example.com/foobar?a=:80',
        '*.feyda.net/hOeDr4.php',
        'dillardvideo.com/wp-admin/network/*.php',
        'www.example.com/',
        'www.hanecaklaw.com/',
        'www.hanoiguidedtours.com/iQ2q1f.php',
        'www.weddingsonthefrenchriviera.com/wp-content/uploads/bcswkG.php'
    ])
})
