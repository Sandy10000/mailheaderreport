export function getHeaderDetails(headers){
	return {
	    'authentication-results':authenticationResults(headers['authentication-results']),
	    from:from(headers.from),
	    received:received(headers.received),
	    'received-spf':receivedSpf(headers['received-spf']),
	    'return-path':headers['return-path'][0],
	    'x-country-code':headers['x-country-code']
	}
    }
    
    function from(from){
	if(from==undefined)return
	return from[0]
    }
    
    function receivedSpf(spf){
	if(spf==undefined)return
	return spf[0]
    }
    
    function authenticationResults(authenticationResults){
	if(authenticationResults==undefined)return
	const result=[]
	for(let i=0;i<authenticationResults.length;i++)result.push(authenticationResults[i].split(';'))
	return result
    }
    
    function received(received){
	const result=[]
	for(let i=0;i<received.length;i++)result.push(receivedServer(received[i]))
	return result
    }
    
    function receivedServer(server){
	const index=[]
	const s0=splitTimeStamp(server)
	const server1=s0[0]
	for(let key of ['from ','by ','with ','id ','for '])getIndex(index,server1,key)
	const result=splitString(index,server1)
	result.timeStamp=s0[1].trim()
	if(result.from!=undefined)result.from=receivedFrom(result.from)
	if(result.by==undefined)result.by=server1
       return result
    }
    
    function splitTimeStamp(server){
	if(server.includes(';'))return server.split(';')
	else if(server.includes(','))return server.split(',')
	else return server.split('        ')
    }
    
    function receivedFrom(from){
    //domainName space ( string space [ address ] )
    //domainName space ( string space [ address ] ) space (Authenticated...)
    //domainName space (                           [ address ] )
    //domainName space (                           [ address ] ) space (using...) space (client...)
    //domainName space                                                         ( address )
    //domainName space ( string )
    //domainName space ( string space string ) space ( address )
	if(from.includes('['))return receivedFromA(from)
	else return receivedFromB(from)
    }
    
    function receivedFromA(from){
    //domainName space ( string space [ address ] )
    //domainName space ( string space [ address ] ) space (Authenticated...)
    //domainName space (                           [ address ] )
    //domainName space (                           [ address ] ) space (using...) space (client...)
	const result={}
	const s1=from.split('[')
	if(s1[0].endsWith('('))result.domainName=s1[0].slice(0,-1).trim()
	else result.domainName=s1[0].trim()+')'
	const s2=s1[1].split(']')
	const ipString=s2[0]
	if(s2[1].length>1)result.comment=s2[1].slice(2,s2[1].length)
	if(ipString.includes(':'))result.ipv6=ipv6(ipString)
	else result.ipv4=ipv4(ipString)
	return result
    }
    
    function receivedFromB(from){
    //domainName space                                                         ( address )
    //domainName space ( string )
    //domainName space ( string space string ) space ( address )
    const first=from.indexOf('(')
	const last=from.lastIndexOf('(')
	if(first==last)return receivedFromB1(from)
	else return receivedFromB2(from)
    }
    
    function receivedFromB1(from){
    //domainName space                                                         ( address )
    //domainName space ( string )
	const result={}
	if(from.includes('.')||from.includes(':')){
	    const s1=from.split('(')
	    result.domainName=s1[0].slice(0,-1).trim()
	    const ipString=s1[1].split(')')[[0]]
	    if(ipString.includes(':'))result.ipv6=ipv6(ipString)
	    else result.ipv4=ipv4(ipString)
	}else result.domainName=from
	return result
    }
    
    function receivedFromB2(from){
    //domainName space ( string space string ) space ( address )
    const result={}
	const s1=from.split(')')
	result.domainName=s1[0]+')'
	const ipString=s1[1].split('(')[[1]]
	if(ipString.includes(':'))result.ipv6=ipv6(ipString)
	else result.ipv4=ipv4(ipString)
	return result
    }
    
    function ipv4(ipString){
	const s1=ipString.split('.')
	const result=[]
	for(let i=0;i<s1.length;i++)result.push(parseInt(s1[i]))
	return result
    }
    
    function ipv6(ipString){
	const result=ipString.split(':')
	if(result.includes('IPv6'))result.splice(0,1)
	return result 
    }
    
    function splitString(array,sourceString){
	const result={}
	let indexEnd=sourceString.length
	for(let i=array.length-1;i>=0;i--){
	    const key=Object.keys(array[i])[0]
	    const value=Object.values(array[i])[0]
	    result[key]=sourceString.substring(value,indexEnd).slice(key.length).trim()
	    indexEnd=value
	}
	return result
    }
    
    function getIndex(array,sourceString,searchString){
	if(!sourceString.includes(searchString))return
	const first=sourceString.indexOf(searchString)
	const last=sourceString.lastIndexOf(searchString)
	if(outsideParenthesis(sourceString,first))array.push({[searchString.trim()]:first})
	else if(outsideParenthesis(sourceString,last))array.push({[searchString.trim()]:last})
    }
    
    function outsideParenthesis(sourceString,index){
	return sourceString.lastIndexOf(')',index)>=sourceString.lastIndexOf('(',index)
    }