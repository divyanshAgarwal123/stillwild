import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_CONNECTION,API_LIMITS,apiBoundary,apiRequest,connectionIssue,field,generateCustom} from '../src/photo/customApi.ts';
const key='fixture-only-session-secret',endpoint='https://service.example/v1/generate',media='https://cdn.example/output.mp4';
const connection=(extra={})=>({...DEFAULT_CONNECTION,endpoint,...extra});
const json=(v,status=200,headers={})=>new Response(JSON.stringify(v),{status,headers:{'content-type':'application/json',...headers}});
const video=()=>new Response(new Uint8Array(64).fill(7),{headers:{'content-type':'video/mp4'}});
const options=(fetcher,extra={})=>({connection:connection(),key,image:'YQ==',prompt:' Quiet water ',duration:4,signal:new AbortController().signal,status:()=>{},fetcher,pollMs:0,...extra});

test('parsed JSON substitutes values safely, preserves types, supports arrays and both image formats',()=>{
 const c=connection({model:'visitor-model',template:JSON.stringify({model:'{{model}}',input:[{text:'{{prompt}}',seconds:'{{duration}}',image:'{{image_base64}}',url:'{{image_data_url}}'}],label:'run {{duration}}s'})});
 const request=JSON.parse(apiRequest(c,{image:'YQ==',prompt:' a "quote"\n{{literal}} ',duration:3.5}));
 assert.equal(request.model,'visitor-model');assert.equal(request.input[0].text,'a "quote"\n{{literal}}');assert.equal(request.input[0].seconds,3.5);assert.equal(request.input[0].image,'YQ==');assert.equal(request.input[0].url,'data:image/jpeg;base64,YQ==');assert.equal(request.label,'run 3.5s');
});
test('unsupported, prototype, executable and excessive templates are rejected without execution',()=>{
 for(const template of ['not json','[]','{"x":"{{key}}"}','{"x":"{{prompt.toString()}}"}','{"__proto__":{}}','{"constructor":{}}','{"{{model}}":1}',JSON.stringify({v:'x'.repeat(API_LIMITS.template)})])assert.throws(()=>apiRequest(connection({template}),{image:'YQ==',prompt:'calm',duration:4}));
 let deep={x:1};for(let i=0;i<14;i++)deep={x:deep};assert.throws(()=>apiRequest(connection({template:JSON.stringify(deep)}),{image:'YQ==',prompt:'calm',duration:4}),/complex/);
 for(const input of [{image:'bad',prompt:'calm',duration:4},{image:'YQ==',prompt:' ',duration:4},{image:'YQ==',prompt:'calm',duration:31}])assert.throws(()=>apiRequest(connection(),input));
 assert.throws(()=>apiRequest(connection({template:JSON.stringify({a:'{{image_base64}}',b:'{{image_base64}}'})}),{image:'a'.repeat(3_200_000),prompt:'calm',duration:4}),/size/);
});
test('bounded own-property field paths support array indexes and cannot traverse prototypes',()=>{
 assert.equal(field({output:[{url:'media'}]},'output.0.url'),'media');assert.equal(field(Object.create({secret:1}),'secret'),undefined);assert.equal(field({},''),undefined);
 for(const path of ['__proto__.x','constructor.name','x.prototype.y','a[0].url',Array(10).fill('a').join('.'),'x'.repeat(257)])assert.throws(()=>field({},path));
});
test('connection validation gates unsafe URLs, config types, auth headers, mappings and states',()=>{
 for(const endpoint of ['', 'http://remote.example/v1/jobs','https://user:pass@service.example/v1/jobs','https://service.example/v1/jobs#part','https://service.example/v1/jobs?q=1','https://service.example/v1/'+key,'https://service.example/v1/a%2fb','https://service.example/v1/../jobs'])assert.ok(connectionIssue(connection({endpoint}),key));
 for(const extra of [{authHeader:'Cookie'},{authHeader:'x\nkey'},{authHeader:'Origin'},{authHeader:'Sec-Test'},{authPrefix:'bad:'},{videoPath:'constructor.name'},{trustPath:'/other/'},{pending:'completed'},{pollTemplate:'https://evil.example/{{id}}'},{allowLocalhost:'true'}])assert.ok(connectionIssue(connection(extra),key));
 assert.ok(connectionIssue(connection(),''));assert.equal(connectionIssue(connection(),key),'');assert.deepEqual(apiBoundary(connection()),{endpoint,origin:'https://service.example',prefix:'/v1/'});
 assert.equal(connectionIssue(connection({endpoint:'http://127.0.0.1:5173/api/jobs',allowLocalhost:true}),key,'http://127.0.0.1:5173'),'');
 assert.ok(connectionIssue(connection({endpoint:'http://127.0.0.1:5174/api/jobs',allowLocalhost:true}),key,'http://127.0.0.1:5173'));assert.ok(connectionIssue(connection({endpoint:'https://localhost/jobs'}),key));
});
test('multiple visitor services actually change auth, model, request and response shape; one POST each',async()=>{
 for(const [authHeader,authPrefix] of [['Authorization','Bearer'],['Authorization','Key'],['X-Visitor-Key','']]){
  let calls=0;const c=connection({endpoint:'https://second.example/api/create',authHeader,authPrefix,model:'custom-model',template:'{"name":"{{model}}","input":{"caption":"{{prompt}}","photo":"{{image_base64}}","seconds":"{{duration}}"}}',videoPath:'outputs.0.location',statusPath:''});
  const blob=await generateCustom(options(async(url,init)=>{calls++;assert.equal(init.credentials,'omit');assert.equal(init.redirect,'error');assert.equal(init.referrerPolicy,'no-referrer');
   if(calls===1){assert.equal(url,c.endpoint);assert.equal(init.method,'POST');assert.equal(init.headers[authHeader],(authPrefix?authPrefix+' ':'')+key);assert.deepEqual(JSON.parse(init.body),{name:'custom-model',input:{caption:'Quiet water',photo:'YQ==',seconds:4}});return json({outputs:[{location:media}]});}
   assert.equal(url,media);assert.equal(init.headers,undefined);assert.equal(init.method,'GET');return video();
  },{connection:c}));assert.equal(calls,2);assert.equal(blob.size,64);
 }
});
test('direct binary video and bounded inline base64 both succeed',async()=>{
 for(const response of [video(),json({video:{base64:Buffer.alloc(80,5).toString('base64'),mime_type:'video/webm'}})]){let calls=0;const b=await generateCustom(options(async()=>{calls++;return response;}));assert.ok(b.size>=64);assert.equal(calls,1);}
});
test('creation ID and resolved poll/result templates survive pending and completed polls without IDs',async()=>{
 const urls=[],methods=[];const c=connection({pollTemplate:'https://service.example/v1/jobs/{{id}}/status',resultTemplate:'https://service.example/v1/jobs/{{id}}/result'});
 const responses=[json({id:'job_123',status:'queued'}),json({status:'processing'}),json({status:'completed'}),json({video:{url:media}}),video()];
 const b=await generateCustom(options(async(url,init)=>{urls.push(url);methods.push(init.method);return responses.shift();},{connection:c}));
 assert.equal(b.size,64);assert.deepEqual(urls,[endpoint,'https://service.example/v1/jobs/job_123/status','https://service.example/v1/jobs/job_123/status','https://service.example/v1/jobs/job_123/result',media]);assert.deepEqual(methods,['POST','GET','GET','GET','GET']);
});
test('safely resolved job URLs stay stable when later responses omit links or try to replace them',async()=>{
 const urls=[];let count=0;const responses=[{status:'queued',poll_url:'/v1/tasks/a',result_url:'/v1/tasks/a/result'},{status:'pending',poll_url:'https://evil.example/leak'},{status:'completed'},{video:{url:media}}];
 await generateCustom(options(async(url)=>{urls.push(url);return count<responses.length?json(responses[count++]):video();}));
 assert.deepEqual(urls,[endpoint,'https://service.example/v1/tasks/a','https://service.example/v1/tasks/a','https://service.example/v1/tasks/a/result',media]);
});
test('missing, invalid or changed creation IDs fail closed for templated job URLs',async()=>{
 for(const id of [undefined,'../job','a/b',1]){let calls=0;await assert.rejects(generateCustom(options(async()=>{calls++;return json({id,status:'pending'});},{connection:connection({pollTemplate:'/v1/{{id}}'})})),/job ID/);assert.equal(calls,1);}
 let calls=0;await assert.rejects(generateCustom(options(async()=>json({status:'pending',id:++calls===1?'first':'other'}),{connection:connection({pollTemplate:'/v1/{{id}}'})})),/changed job ID/);assert.equal(calls,2);
});
test('cross-boundary response URLs never receive keys; external videos receive neither auth nor cookies',async()=>{
 for(const poll_url of ['https://evil.example/v1/jobs/a','https://service.example/other/a','https://user:pass@service.example/v1/a','/v1/a#x','/v1/a?key=secret','/v1/a%2fb','/v1/../a']){let calls=0;await assert.rejects(generateCustom(options(async()=>{calls++;return json({status:'pending',poll_url});})));assert.equal(calls,1);}
 for(const url of ['http://cdn.example/x','https://localhost/x','https://user@cdn.example/x','https://cdn.example/x#x','https://cdn.example/x?api_key='+key]){let calls=0;await assert.rejects(generateCustom(options(async()=>{calls++;return json({video:{url}});})));assert.equal(calls,1);}
});
test('HTTP/auth/billing/quota failures and network/stream errors never echo provider secrets or retry POST',async()=>{
 for(const status of [400,401,402,403,422,429,500]){let calls=0;await assert.rejects(generateCustom(options(async()=>{calls++;return json({error:key+' provider-private-body'},status);})),e=>!e.message.includes(key)&&!e.message.includes('provider-private-body')&&e.message.includes(String(status===401||status===403?'authentication':status===400||status===422?'format':status)));assert.equal(calls,1);}
 for(const fetcher of [async()=>{throw Error(key);},async()=>new Response(new ReadableStream({start(c){c.error(Error(key));}}))])await assert.rejects(generateCustom(options(fetcher)),e=>!e.message.includes(key));
});
test('redirects are disabled and rejected at creation, job and external-media stages',async()=>{
 const redirect=()=>new Response(null,{status:302,headers:{location:'https://evil.example/leak'}});
 for(const stage of ['create','poll','media']){let posts=0;await assert.rejects(generateCustom(options(async(url,init)=>{if(init.method==='POST')posts++;if(stage==='create'||url!==endpoint)return redirect();return json(stage==='poll'?{status:'pending',poll_url:'/v1/poll'}:{video:{url:media}});})),/302/);assert.equal(posts,1);}
});
test('invalid JSON, unknown/failed states and absent mappings produce safe actionable errors',async()=>{
 for(const response of [new Response('{bad'),json([]),json({status:'surprise'}),json({status:'failed',error:key}),json({}),json({video:{base64:'!'}}),json({video:{base64:Buffer.alloc(50).toString('base64'),mime_type:'text/html'}})])await assert.rejects(generateCustom(options(async()=>response)),e=>!e.message.includes(key));
});
test('declared and streamed JSON/media bounds cancel readers; inline size is bounded',async()=>{
 let cancelled=0;
 for(const response of [json({},200,{'content-length':String(API_LIMITS.json+1)}),new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(API_LIMITS.video+1));},cancel(){cancelled++;}}),{headers:{'content-type':'video/mp4'}})])await assert.rejects(generateCustom(options(async()=>response)),/size/);
 assert.equal(cancelled,1);
 const inline='A'.repeat(Math.ceil(API_LIMITS.video/3)*4+4);await assert.rejects(generateCustom(options(async()=>json({video:{base64:inline}}))),/oversized|size/);
});
test('pre-submit abort, polling abort and media-stream abort clean up without retry',async()=>{
 const first=new AbortController();first.abort();let calls=0;await assert.rejects(generateCustom(options(async()=>{calls++;return video();},{signal:first.signal})),e=>e.name==='AbortError');assert.equal(calls,0);
 for(const stage of ['poll','media']){const c=new AbortController();let posts=0,cancelled=0;await assert.rejects(generateCustom(options(async(url,init)=>{if(init.method==='POST')posts++;
  if(url===endpoint)return json(stage==='poll'?{status:'pending',poll_url:'/v1/poll'}:{video:{url:media}});
  if(stage==='poll'){c.abort();return json({status:'pending'});}
  return new Response(new ReadableStream({start(r){r.enqueue(new Uint8Array(40));setTimeout(()=>c.abort(),5);},cancel(){cancelled++;}}),{headers:{'content-type':'video/mp4'}});
 },{signal:c.signal})),e=>e.name==='AbortError');assert.equal(posts,1);if(stage==='media')assert.equal(cancelled,1);}
});
test('deadline and hard poll ceiling end waiting with exactly one generation POST',async()=>{
 for(const timeoutMs of [8,5000]){let posts=0,calls=0;await assert.rejects(generateCustom(options(async(url,init)=>{calls++;if(init.method==='POST')posts++;return json({status:'pending',poll_url:'/v1/poll'});},{timeoutMs,pollMs:timeoutMs===8?20:0})),e=>e.name==='TimeoutError');assert.equal(posts,1);if(timeoutMs===5000)assert.equal(calls,API_LIMITS.polls+1);}
});
