import { cookies } from './test2'
import { scripts } from './test1'
import { Page, Protocol, TimeoutError } from 'puppeteer'
import { Url } from 'url'


function createUrlIndex(url: string): string[][] {
    const splitUrl = url.split('.')
    const splitUrlLength = splitUrl.length
    let index: string[][] = []
    splitUrl.forEach((e, i) => {
       if(!(i === splitUrlLength - 1)) {
           index.push([e, splitUrl[i + 1]])
       } 
    })

    return index
}

function createScriptDomainsIndex(scriptDomains: string[]): string[][][] {
   return scriptDomains.map((scriptDomain) => createUrlIndex(scriptDomain)) 
}

function associateDomains(cookieDomain: string, scriptDomainsIndex: string[][][]): string | null {
    //outbrain.com 
    // widgets.outbrain.com 
    // ==> amplify.outbrain.com (scriptDomain)
    //
    // amazon-adsystem.com
    // ==> c.amazon-adsystem.com 
   
    const cookieDomainIndex = createUrlIndex(cookieDomain)

    const a = scriptDomainsIndex.findIndex((arr) => {
        // [ [ 'www', 'lemonde' ], [ 'lemonde', 'fr' ] ]
        return arr.map((e) => cookieDomainIndex.some(f => JSON.stringify(e) === JSON.stringify(f))).includes(true) 
    })
    if(a !== -1) {
        let r: string[] = []
        scriptDomainsIndex[a].forEach((e, i) => {
            if(i === 0) {
                r.push(e.join('.'))
            } else {
                r.push(e[1])
            }
        })
        return r.join('.')
    }
    return null 
}

function mapScriptCookies(cookies: Protocol.Network.Cookie[], scriptsSrc: string[]) {

    const scriptsDomain = [...new Set(scriptsSrc.filter((src) => src !== '').map((e) => (new URL(e)).hostname))]
    // console.log(scriptsDomain)
    // [{ domain: 'lmd.fr', cookies: []} ]
    
    console.log(scriptsDomain)
    console.log([...new Set(cookies.map(e => e.domain))])
    
    const scriptDomainsIndex = createScriptDomainsIndex(scriptsDomain)
    let csc: { domain: string, cookies: Protocol.Network.Cookie[]}[] = []
    
    cookies.forEach((cookie) => {
        // const cookieDomain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain
        // const scriptDomain = scriptsDomain.find((e) => e === cookieDomain)

        const scriptDomain = associateDomains(cookie.domain, scriptDomainsIndex)
        if(scriptDomain) {
            const cscEl = csc.find((e) => e.domain === scriptDomain)
            if (cscEl) {
               cscEl.cookies.push(cookie) 
            } else {
                csc.push({ domain: scriptDomain, cookies: [cookie]})
            }
        } else {
            const cscUkn = csc.find((e) => e.domain === 'unknown')
            if (cscUkn) {
               cscUkn.cookies.push(cookie) 
            } else {
                csc.push({ domain: 'unknown', cookies: [cookie]})
            }
        }
    })


    const r = scriptsDomain.map((url) => {
        const f = csc.find((e) => e.domain === url)
        if(f) {
            return f
        }
        return { domain: url, cookies: []}
    })
    const u = csc.find((e) => e.domain === 'unknown')
    if (u) {
        r.push(u)
    }
    console.log(r)

    // console.log([...new Set(cookies.map(e => e.domain))])
}

mapScriptCookies(cookies as Protocol.Network.Cookie[], scripts)
