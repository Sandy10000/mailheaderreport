const html=`
<p id=country>x-country-code: <img id=flag></img> </p>
<table>
    <thead>
        <tr>
            <th colspan=4>received</th>
        </tr><tr>
            <th rowspan=2>by</th>
            <th colspan=3>from</th>
        </tr><tr>
            <th>domain name</th>
            <th>ipv</th>
            <th>ip address</th>
        </tr>
    </thead>
    <tbody id=tbody>
    </tbody>
</table>
<p>from: <span id=from></span><span id=fromAddress></span></p>
<p>return-path: <span id=returnAddress></span></p>
<p>authentication-results<ul id=ul></ul></p>
<p id=spf>received-spf: </p>`

const dom={}

export function report(header){
    document.body.insertAdjacentHTML('beforeend',html)
    dom.tbody=document.getElementById('tbody')
    dom.ul=document.getElementById('ul')
    dom.from=document.getElementById('from')
    dom.fromAddress=document.getElementById('fromAddress')
    dom.returnAddress=document.getElementById('returnAddress')
    dom.spf=document.getElementById('spf')
    dom.country=document.getElementById('country')
    dom.flag=document.getElementById('flag')
    reportReceived(header.received)
    reportAuthenticationResults(header['authentication-results'])
    reportFrom(header.from)
    reportReturn(header['return-path'])
    reportSpf(header['received-spf'])
    reportCountry(header['x-country-code'])
}

function reportReturn(returnPath){
    dom.returnAddress.insertAdjacentHTML(
        'beforeend',
        returnPath
    )
    dom.returnAddress.style.color='orange'
}

function reportFrom(from){
    if(from==undefined)return
    const s0=from.split('<')
    const name=s0[0]
    let address
    if(s0[1]==undefined)address=''
    else address='&lt'+s0[1].replace('>','&gt')
    dom.from.insertAdjacentHTML(
        'beforeend',
        name
    )
    dom.fromAddress.insertAdjacentHTML(
        'beforeend',
        address
    )
    dom.fromAddress.style.color='orange'
}

function reportCountry(country){
    if(country==undefined)return
    dom.country.insertAdjacentHTML(
        'beforeend',
        country
    )
    dom.flag.src='images/'+country+'.svg'
}

function reportReceived(received){
    for(let i=0;i<received.length;i++){
        const server=received[i]
        let domainName
        let ipv
        let ipAddress
        if(received[i].from==undefined){
            domainName=ipv=ipAddress=''
        }else{
            domainName=received[i].from.domainName
            if(received[i].from.ipv4!=undefined){
                ipv=4
                ipAddress=received[i].from.ipv4.toString().replaceAll(',','.')
            }else if(received[i].from.ipv6!=undefined){
                ipv=6
                ipAddress=received[i].from.ipv6.toString().replaceAll(',',':')
            }else ipv=ipAddress=''
        }
        dom.tbody.insertAdjacentHTML(
            'beforeend',
            '<tr><td>'+received[i].by+'</td><td>'+domainName+'</td><td>'+ipv+'</td><td>'+ipAddress+'</td></tr>'
        )
    }
}

function reportAuthenticationResults(array){
    if(array==undefined)return
    for(let i=0;i<array.length;i++){
        for(let j=0;j<array[i].length;j++){
            dom.ul.insertAdjacentHTML(
                'beforeend',
                '<li><span id=span'+i+'_'+j+'>'+array[i][j]+'</span></li>'
            )
            const span=document.getElementById('span'+i+'_'+j)
            if(array[i][j].includes('fail'))span.style.color='red'
            if(array[i][j].includes('permerror')||array[i][j].includes('none'))span.style.color='orange'
        }
    }
}

function reportSpf(spf){
    if(spf==undefined)return
    dom.spf.insertAdjacentHTML(
        'beforeend',
        spf
    )
    if(spf.includes('FAIL'))dom.spf.style.color='red'
    if(spf.includes('PERMERROR')||spf.includes('NONE'))dom.spf.style.color='orange'
}