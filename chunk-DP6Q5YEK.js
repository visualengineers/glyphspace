import{a as Ae,b as st,c as Pe}from"./chunk-WASERODV.js";function Qe(n){return typeof n=="function"}function Zu(n){let t=n(i=>{Error.call(i),i.stack=new Error().stack});return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var Ju=Zu(n=>function(t){n(this),this.message=t?`${t.length} errors occurred during unsubscription:
${t.map((i,r)=>`${r+1}) ${i.toString()}`).join(`
  `)}`:"",this.name="UnsubscriptionError",this.errors=t});function Cc(n,e){if(n){let t=n.indexOf(e);0<=t&&n.splice(t,1)}}var rn=class n{constructor(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}unsubscribe(){let e;if(!this.closed){this.closed=!0;let{_parentage:t}=this;if(t)if(this._parentage=null,Array.isArray(t))for(let s of t)s.remove(this);else t.remove(this);let{initialTeardown:i}=this;if(Qe(i))try{i()}catch(s){e=s instanceof Ju?s.errors:[s]}let{_finalizers:r}=this;if(r){this._finalizers=null;for(let s of r)try{sb(s)}catch(o){e=e??[],o instanceof Ju?e=[...e,...o.errors]:e.push(o)}}if(e)throw new Ju(e)}}add(e){var t;if(e&&e!==this)if(this.closed)sb(e);else{if(e instanceof n){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(t=this._finalizers)!==null&&t!==void 0?t:[]).push(e)}}_hasParent(e){let{_parentage:t}=this;return t===e||Array.isArray(t)&&t.includes(e)}_addParent(e){let{_parentage:t}=this;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e}_removeParent(e){let{_parentage:t}=this;t===e?this._parentage=null:Array.isArray(t)&&Cc(t,e)}remove(e){let{_finalizers:t}=this;t&&Cc(t,e),e instanceof n&&e._removeParent(this)}};rn.EMPTY=(()=>{let n=new rn;return n.closed=!0,n})();var ig=rn.EMPTY;function Ku(n){return n instanceof rn||n&&"closed"in n&&Qe(n.remove)&&Qe(n.add)&&Qe(n.unsubscribe)}function sb(n){Qe(n)?n():n.unsubscribe()}function s1(n){return Qe(n?.lift)}function hn(n){return e=>{if(s1(e))return e.lift(function(t){try{return n(t,this)}catch(i){this.error(i)}});throw new TypeError("Unable to lift unknown Observable type")}}var vi={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1};var Io={setTimeout(n,e,...t){let{delegate:i}=Io;return i?.setTimeout?i.setTimeout(n,e,...t):setTimeout(n,e,...t)},clearTimeout(n){let{delegate:e}=Io;return(e?.clearTimeout||clearTimeout)(n)},delegate:void 0};function Qu(n){Io.setTimeout(()=>{let{onUnhandledError:e}=vi;if(e)e(n);else throw n})}function rg(){}var ob=sg("C",void 0,void 0);function ab(n){return sg("E",void 0,n)}function cb(n){return sg("N",n,void 0)}function sg(n,e,t){return{kind:n,value:e,error:t}}var Ds=null;function Ro(n){if(vi.useDeprecatedSynchronousErrorHandling){let e=!Ds;if(e&&(Ds={errorThrown:!1,error:null}),n(),e){let{errorThrown:t,error:i}=Ds;if(Ds=null,t)throw i}}else n()}function lb(n){vi.useDeprecatedSynchronousErrorHandling&&Ds&&(Ds.errorThrown=!0,Ds.error=n)}var As=class extends rn{constructor(e){super(),this.isStopped=!1,e?(this.destination=e,Ku(e)&&e.add(this)):this.destination=c1}static create(e,t,i){return new No(e,t,i)}next(e){this.isStopped?ag(cb(e),this):this._next(e)}error(e){this.isStopped?ag(ab(e),this):(this.isStopped=!0,this._error(e))}complete(){this.isStopped?ag(ob,this):(this.isStopped=!0,this._complete())}unsubscribe(){this.closed||(this.isStopped=!0,super.unsubscribe(),this.destination=null)}_next(e){this.destination.next(e)}_error(e){try{this.destination.error(e)}finally{this.unsubscribe()}}_complete(){try{this.destination.complete()}finally{this.unsubscribe()}}},o1=Function.prototype.bind;function og(n,e){return o1.call(n,e)}var cg=class{constructor(e){this.partialObserver=e}next(e){let{partialObserver:t}=this;if(t.next)try{t.next(e)}catch(i){ed(i)}}error(e){let{partialObserver:t}=this;if(t.error)try{t.error(e)}catch(i){ed(i)}else ed(e)}complete(){let{partialObserver:e}=this;if(e.complete)try{e.complete()}catch(t){ed(t)}}},No=class extends As{constructor(e,t,i){super();let r;if(Qe(e)||!e)r={next:e??void 0,error:t??void 0,complete:i??void 0};else{let s;this&&vi.useDeprecatedNextContext?(s=Object.create(e),s.unsubscribe=()=>this.unsubscribe(),r={next:e.next&&og(e.next,s),error:e.error&&og(e.error,s),complete:e.complete&&og(e.complete,s)}):r=e}this.destination=new cg(r)}};function ed(n){vi.useDeprecatedSynchronousErrorHandling?lb(n):Qu(n)}function a1(n){throw n}function ag(n,e){let{onStoppedNotification:t}=vi;t&&Io.setTimeout(()=>t(n,e))}var c1={closed:!0,next:rg,error:a1,complete:rg};function pn(n,e,t,i,r){return new lg(n,e,t,i,r)}var lg=class extends As{constructor(e,t,i,r,s,o){super(e),this.onFinalize=s,this.shouldUnsubscribe=o,this._next=t?function(a){try{t(a)}catch(c){e.error(c)}}:super._next,this._error=r?function(a){try{r(a)}catch(c){e.error(c)}finally{this.unsubscribe()}}:super._error,this._complete=i?function(){try{i()}catch(a){e.error(a)}finally{this.unsubscribe()}}:super._complete}unsubscribe(){var e;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){let{closed:t}=this;super.unsubscribe(),!t&&((e=this.onFinalize)===null||e===void 0||e.call(this))}}};function Tn(n,e){return hn((t,i)=>{let r=0;t.subscribe(pn(i,s=>{i.next(n.call(e,s,r++))}))})}function td(n){return n}function l1(n,e=td){return n=n??u1,hn((t,i)=>{let r,s=!0;t.subscribe(pn(i,o=>{let a=e(o);(s||!n(r,a))&&(s=!1,r=a,i.next(o))}))})}function u1(n,e){return n===e}function Dc(n,e){return hn((t,i)=>{let r=0;t.subscribe(pn(i,s=>n.call(e,s,r++)&&i.next(s)))})}function d1(n){return Dc((e,t)=>n<=t)}var Po=typeof Symbol=="function"&&Symbol.observable||"@@observable";function ub(n){return n.length===0?td:n.length===1?n[0]:function(t){return n.reduce((i,r)=>r(i),t)}}var At=(()=>{class n{constructor(t){t&&(this._subscribe=t)}lift(t){let i=new n;return i.source=this,i.operator=t,i}subscribe(t,i,r){let s=h1(t)?t:new No(t,i,r);return Ro(()=>{let{operator:o,source:a}=this;s.add(o?o.call(s,a):a?this._subscribe(s):this._trySubscribe(s))}),s}_trySubscribe(t){try{return this._subscribe(t)}catch(i){t.error(i)}}forEach(t,i){return i=db(i),new i((r,s)=>{let o=new No({next:a=>{try{t(a)}catch(c){s(c),o.unsubscribe()}},error:s,complete:r});this.subscribe(o)})}_subscribe(t){var i;return(i=this.source)===null||i===void 0?void 0:i.subscribe(t)}[Po](){return this}pipe(...t){return ub(t)(this)}toPromise(t){return t=db(t),new t((i,r)=>{let s;this.subscribe(o=>s=o,o=>r(o),()=>i(s))})}}return n.create=e=>new n(e),n})();function db(n){var e;return(e=n??vi.Promise)!==null&&e!==void 0?e:Promise}function f1(n){return n&&Qe(n.next)&&Qe(n.error)&&Qe(n.complete)}function h1(n){return n&&n instanceof As||f1(n)&&Ku(n)}var fb=Zu(n=>function(){n(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"});var Ut=(()=>{class n extends At{constructor(){super(),this.closed=!1,this.currentObservers=null,this.observers=[],this.isStopped=!1,this.hasError=!1,this.thrownError=null}lift(t){let i=new nd(this,this);return i.operator=t,i}_throwIfClosed(){if(this.closed)throw new fb}next(t){Ro(()=>{if(this._throwIfClosed(),!this.isStopped){this.currentObservers||(this.currentObservers=Array.from(this.observers));for(let i of this.currentObservers)i.next(t)}})}error(t){Ro(()=>{if(this._throwIfClosed(),!this.isStopped){this.hasError=this.isStopped=!0,this.thrownError=t;let{observers:i}=this;for(;i.length;)i.shift().error(t)}})}complete(){Ro(()=>{if(this._throwIfClosed(),!this.isStopped){this.isStopped=!0;let{observers:t}=this;for(;t.length;)t.shift().complete()}})}unsubscribe(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null}get observed(){var t;return((t=this.observers)===null||t===void 0?void 0:t.length)>0}_trySubscribe(t){return this._throwIfClosed(),super._trySubscribe(t)}_subscribe(t){return this._throwIfClosed(),this._checkFinalizedStatuses(t),this._innerSubscribe(t)}_innerSubscribe(t){let{hasError:i,isStopped:r,observers:s}=this;return i||r?ig:(this.currentObservers=null,s.push(t),new rn(()=>{this.currentObservers=null,Cc(s,t)}))}_checkFinalizedStatuses(t){let{hasError:i,thrownError:r,isStopped:s}=this;i?t.error(r):s&&t.complete()}asObservable(){let t=new At;return t.source=this,t}}return n.create=(e,t)=>new nd(e,t),n})(),nd=class extends Ut{constructor(e,t){super(),this.destination=e,this.source=t}next(e){var t,i;(i=(t=this.destination)===null||t===void 0?void 0:t.next)===null||i===void 0||i.call(t,e)}error(e){var t,i;(i=(t=this.destination)===null||t===void 0?void 0:t.error)===null||i===void 0||i.call(t,e)}complete(){var e,t;(t=(e=this.destination)===null||e===void 0?void 0:e.complete)===null||t===void 0||t.call(e)}_subscribe(e){var t,i;return(i=(t=this.source)===null||t===void 0?void 0:t.subscribe(e))!==null&&i!==void 0?i:ig}};var Qt=class extends Ut{constructor(e){super(),this._value=e}get value(){return this.getValue()}_subscribe(e){let t=super._subscribe(e);return!t.closed&&e.next(this._value),t}getValue(){let{hasError:e,thrownError:t,_value:i}=this;if(e)throw t;return this._throwIfClosed(),i}next(e){super.next(this._value=e)}};function hb(n){return n&&Qe(n.schedule)}function pb(n){return n[n.length-1]}function mb(n){return Qe(pb(n))?n.pop():void 0}function gb(n){return hb(pb(n))?n.pop():void 0}function vb(n,e,t,i){function r(s){return s instanceof t?s:new t(function(o){o(s)})}return new(t||(t=Promise))(function(s,o){function a(u){try{l(i.next(u))}catch(d){o(d)}}function c(u){try{l(i.throw(u))}catch(d){o(d)}}function l(u){u.done?s(u.value):r(u.value).then(a,c)}l((i=i.apply(n,e||[])).next())})}function yb(n){var e=typeof Symbol=="function"&&Symbol.iterator,t=e&&n[e],i=0;if(t)return t.call(n);if(n&&typeof n.length=="number")return{next:function(){return n&&i>=n.length&&(n=void 0),{value:n&&n[i++],done:!n}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function Is(n){return this instanceof Is?(this.v=n,this):new Is(n)}function _b(n,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=t.apply(n,e||[]),r,s=[];return r=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",o),r[Symbol.asyncIterator]=function(){return this},r;function o(h){return function(p){return Promise.resolve(p).then(h,d)}}function a(h,p){i[h]&&(r[h]=function(v){return new Promise(function(m,g){s.push([h,v,m,g])>1||c(h,v)})},p&&(r[h]=p(r[h])))}function c(h,p){try{l(i[h](p))}catch(v){f(s[0][3],v)}}function l(h){h.value instanceof Is?Promise.resolve(h.value.v).then(u,d):f(s[0][2],h)}function u(h){c("next",h)}function d(h){c("throw",h)}function f(h,p){h(p),s.shift(),s.length&&c(s[0][0],s[0][1])}}function xb(n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e=n[Symbol.asyncIterator],t;return e?e.call(n):(n=typeof yb=="function"?yb(n):n[Symbol.iterator](),t={},i("next"),i("throw"),i("return"),t[Symbol.asyncIterator]=function(){return this},t);function i(s){t[s]=n[s]&&function(o){return new Promise(function(a,c){o=n[s](o),r(a,c,o.done,o.value)})}}function r(s,o,a,c){Promise.resolve(c).then(function(l){s({value:l,done:a})},o)}}var id=n=>n&&typeof n.length=="number"&&typeof n!="function";function rd(n){return Qe(n?.then)}function sd(n){return Qe(n[Po])}function od(n){return Symbol.asyncIterator&&Qe(n?.[Symbol.asyncIterator])}function ad(n){return new TypeError(`You provided ${n!==null&&typeof n=="object"?"an invalid object":`'${n}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`)}function p1(){return typeof Symbol!="function"||!Symbol.iterator?"@@iterator":Symbol.iterator}var cd=p1();function ld(n){return Qe(n?.[cd])}function ud(n){return _b(this,arguments,function*(){let t=n.getReader();try{for(;;){let{value:i,done:r}=yield Is(t.read());if(r)return yield Is(void 0);yield yield Is(i)}}finally{t.releaseLock()}})}function dd(n){return Qe(n?.getReader)}function Bn(n){if(n instanceof At)return n;if(n!=null){if(sd(n))return m1(n);if(id(n))return g1(n);if(rd(n))return y1(n);if(od(n))return bb(n);if(ld(n))return v1(n);if(dd(n))return _1(n)}throw ad(n)}function m1(n){return new At(e=>{let t=n[Po]();if(Qe(t.subscribe))return t.subscribe(e);throw new TypeError("Provided object does not correctly implement Symbol.observable")})}function g1(n){return new At(e=>{for(let t=0;t<n.length&&!e.closed;t++)e.next(n[t]);e.complete()})}function y1(n){return new At(e=>{n.then(t=>{e.closed||(e.next(t),e.complete())},t=>e.error(t)).then(null,Qu)})}function v1(n){return new At(e=>{for(let t of n)if(e.next(t),e.closed)return;e.complete()})}function bb(n){return new At(e=>{x1(n,e).catch(t=>e.error(t))})}function _1(n){return bb(ud(n))}function x1(n,e){var t,i,r,s;return vb(this,void 0,void 0,function*(){try{for(t=xb(n);i=yield t.next(),!i.done;){let o=i.value;if(e.next(o),e.closed)return}}catch(o){r={error:o}}finally{try{i&&!i.done&&(s=t.return)&&(yield s.call(t))}finally{if(r)throw r.error}}e.complete()})}function oi(n,e,t,i=0,r=!1){let s=e.schedule(function(){t(),r?n.add(this.schedule(null,i)):this.unsubscribe()},i);if(n.add(s),!r)return s}function fd(n,e=0){return hn((t,i)=>{t.subscribe(pn(i,r=>oi(i,n,()=>i.next(r),e),()=>oi(i,n,()=>i.complete(),e),r=>oi(i,n,()=>i.error(r),e)))})}function hd(n,e=0){return hn((t,i)=>{i.add(n.schedule(()=>t.subscribe(i),e))})}function Mb(n,e){return Bn(n).pipe(hd(e),fd(e))}function Sb(n,e){return Bn(n).pipe(hd(e),fd(e))}function Eb(n,e){return new At(t=>{let i=0;return e.schedule(function(){i===n.length?t.complete():(t.next(n[i++]),t.closed||this.schedule())})})}function wb(n,e){return new At(t=>{let i;return oi(t,e,()=>{i=n[cd](),oi(t,e,()=>{let r,s;try{({value:r,done:s}=i.next())}catch(o){t.error(o);return}s?t.complete():t.next(r)},0,!0)}),()=>Qe(i?.return)&&i.return()})}function pd(n,e){if(!n)throw new Error("Iterable cannot be null");return new At(t=>{oi(t,e,()=>{let i=n[Symbol.asyncIterator]();oi(t,e,()=>{i.next().then(r=>{r.done?t.complete():t.next(r.value)})},0,!0)})})}function Tb(n,e){return pd(ud(n),e)}function Cb(n,e){if(n!=null){if(sd(n))return Mb(n,e);if(id(n))return Eb(n,e);if(rd(n))return Sb(n,e);if(od(n))return pd(n,e);if(ld(n))return wb(n,e);if(dd(n))return Tb(n,e)}throw ad(n)}function Rs(n,e){return e?Cb(n,e):Bn(n)}function Lr(...n){let e=gb(n);return Rs(n,e)}var{isArray:b1}=Array;function M1(n,e){return b1(e)?n(...e):n(e)}function Db(n){return Tn(e=>M1(n,e))}var{isArray:S1}=Array,{getPrototypeOf:E1,prototype:w1,keys:T1}=Object;function Ab(n){if(n.length===1){let e=n[0];if(S1(e))return{args:e,keys:null};if(C1(e)){let t=T1(e);return{args:t.map(i=>e[i]),keys:t}}}return{args:n,keys:null}}function C1(n){return n&&typeof n=="object"&&E1(n)===w1}function Ib(n,e){return n.reduce((t,i,r)=>(t[i]=e[r],t),{})}function Rb(n,e,t,i,r,s,o,a){let c=[],l=0,u=0,d=!1,f=()=>{d&&!c.length&&!l&&e.complete()},h=v=>l<i?p(v):c.push(v),p=v=>{s&&e.next(v),l++;let m=!1;Bn(t(v,u++)).subscribe(pn(e,g=>{r?.(g),s?h(g):e.next(g)},()=>{m=!0},void 0,()=>{if(m)try{for(l--;c.length&&l<i;){let g=c.shift();o?oi(e,o,()=>p(g)):p(g)}f()}catch(g){e.error(g)}}))};return n.subscribe(pn(e,h,()=>{d=!0,f()})),()=>{a?.()}}function md(n,e,t=1/0){return Qe(e)?md((i,r)=>Tn((s,o)=>e(i,s,r,o))(Bn(n(i,r))),t):(typeof e=="number"&&(t=e),hn((i,r)=>Rb(i,r,n,t)))}function Ac(...n){let e=mb(n),{args:t,keys:i}=Ab(n),r=new At(s=>{let{length:o}=t;if(!o){s.complete();return}let a=new Array(o),c=o,l=o;for(let u=0;u<o;u++){let d=!1;Bn(t[u]).subscribe(pn(s,f=>{d||(d=!0,l--),a[u]=f},()=>c--,void 0,()=>{(!c||!d)&&(l||s.next(i?Ib(i,a):a),s.complete())}))}});return e?r.pipe(Db(e)):r}function ug(n,e){return Qe(e)?md(n,e,1):md(n,1)}function dg(n){return hn((e,t)=>{try{e.subscribe(t)}finally{t.add(n)}})}function Fo(n,e){return hn((t,i)=>{let r=null,s=0,o=!1,a=()=>o&&!r&&i.complete();t.subscribe(pn(i,c=>{r?.unsubscribe();let l=0,u=s++;Bn(n(c,u)).subscribe(r=pn(i,d=>i.next(e?e(c,d,u,l++):d),()=>{r=null,a()}))},()=>{o=!0,a()}))})}var mn=null,gd=!1,fg=1,D1=null,gn=Symbol("SIGNAL");function ke(n){let e=mn;return mn=n,e}function xd(){return mn}var Oo={version:0,lastCleanEpoch:0,dirty:!1,producers:void 0,producersTail:void 0,consumers:void 0,consumersTail:void 0,recomputing:!1,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,kind:"unknown",producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function bd(n){if(gd)throw new Error("");if(mn===null)return;mn.consumerOnSignalRead(n);let e=mn.producersTail;if(e!==void 0&&e.producer===n)return;let t,i=mn.recomputing;if(i&&(t=e!==void 0?e.nextProducer:mn.producers,t!==void 0&&t.producer===n)){mn.producersTail=t,t.lastReadVersion=n.version;return}let r=n.consumersTail;if(r!==void 0&&r.consumer===mn&&(!i||I1(r,mn)))return;let s=Lo(mn),o={producer:n,consumer:mn,nextProducer:t,prevConsumer:r,lastReadVersion:n.version,nextConsumer:void 0};mn.producersTail=o,e!==void 0?e.nextProducer=o:mn.producers=o,s&&Ob(n,o)}function Nb(){fg++}function Md(n){if(!(Lo(n)&&!n.dirty)&&!(!n.dirty&&n.lastCleanEpoch===fg)){if(!n.producerMustRecompute(n)&&!mg(n)){_d(n);return}n.producerRecomputeValue(n),_d(n)}}function hg(n){if(n.consumers===void 0)return;let e=gd;gd=!0;try{for(let t=n.consumers;t!==void 0;t=t.nextConsumer){let i=t.consumer;i.dirty||A1(i)}}finally{gd=e}}function pg(){return mn?.consumerAllowSignalWrites!==!1}function A1(n){n.dirty=!0,hg(n),n.consumerMarkedDirty?.(n)}function _d(n){n.dirty=!1,n.lastCleanEpoch=fg}function Rc(n){return n&&Pb(n),ke(n)}function Pb(n){n.producersTail=void 0,n.recomputing=!0}function Sd(n,e){ke(e),n&&Fb(n)}function Fb(n){n.recomputing=!1;let e=n.producersTail,t=e!==void 0?e.nextProducer:n.producers;if(t!==void 0){if(Lo(n))do t=gg(t);while(t!==void 0);e!==void 0?e.nextProducer=void 0:n.producers=void 0}}function mg(n){for(let e=n.producers;e!==void 0;e=e.nextProducer){let t=e.producer,i=e.lastReadVersion;if(i!==t.version||(Md(t),i!==t.version))return!0}return!1}function Ed(n){if(Lo(n)){let e=n.producers;for(;e!==void 0;)e=gg(e)}n.producers=void 0,n.producersTail=void 0,n.consumers=void 0,n.consumersTail=void 0}function Ob(n,e){let t=n.consumersTail,i=Lo(n);if(t!==void 0?(e.nextConsumer=t.nextConsumer,t.nextConsumer=e):(e.nextConsumer=void 0,n.consumers=e),e.prevConsumer=t,n.consumersTail=e,!i)for(let r=n.producers;r!==void 0;r=r.nextProducer)Ob(r.producer,r)}function gg(n){let e=n.producer,t=n.nextProducer,i=n.nextConsumer,r=n.prevConsumer;if(n.nextConsumer=void 0,n.prevConsumer=void 0,i!==void 0?i.prevConsumer=r:e.consumersTail=r,r!==void 0)r.nextConsumer=i;else if(e.consumers=i,!Lo(e)){let s=e.producers;for(;s!==void 0;)s=gg(s)}return t}function Lo(n){return n.consumerIsAlwaysLive||n.consumers!==void 0}function wd(n){D1?.(n)}function I1(n,e){let t=e.producersTail;if(t!==void 0){let i=e.producers;do{if(i===n)return!0;if(i===t)break;i=i.nextProducer}while(i!==void 0)}return!1}function Td(n,e){return Object.is(n,e)}function Nc(n,e){let t=Object.create(R1);t.computation=n,e!==void 0&&(t.equal=e);let i=()=>{if(Md(t),bd(t),t.value===Ic)throw t.error;return t.value};return i[gn]=t,wd(t),i}var yd=Symbol("UNSET"),vd=Symbol("COMPUTING"),Ic=Symbol("ERRORED"),R1=st(Ae({},Oo),{value:yd,dirty:!0,error:null,equal:Td,kind:"computed",producerMustRecompute(n){return n.value===yd||n.value===vd},producerRecomputeValue(n){if(n.value===vd)throw new Error("");let e=n.value;n.value=vd;let t=Rc(n),i,r=!1;try{i=n.computation(),ke(null),r=e!==yd&&e!==Ic&&i!==Ic&&n.equal(e,i)}catch(s){i=Ic,n.error=s}finally{Sd(n,t)}if(r){n.value=e;return}n.value=i,n.version++}});function N1(){throw new Error}var Lb=N1;function kb(n){Lb(n)}function yg(n){Lb=n}var P1=null;function vg(n,e){let t=Object.create(Bb);t.value=n,e!==void 0&&(t.equal=e);let i=()=>Ub(t);return i[gn]=t,wd(t),[i,o=>Cd(t,o),o=>_g(t,o)]}function Ub(n){return bd(n),n.value}function Cd(n,e){pg()||kb(n),n.equal(n.value,e)||(n.value=e,F1(n))}function _g(n,e){pg()||kb(n),Cd(n,e(n.value))}var Bb=st(Ae({},Oo),{equal:Td,value:void 0,kind:"signal"});function F1(n){n.version++,Nb(),hg(n),P1?.(n)}var xg;function Dd(){return xg}function Vi(n){let e=xg;return xg=n,e}var Vb=Symbol("NotFound");function ko(n){return n===Vb||n?.name==="\u0275NotFound"}function Hb(n){let e=ke(null);try{return n()}finally{ke(e)}}var Fd="https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss",Fe=class extends Error{code;constructor(e,t){super(Bc(e,t)),this.code=e}};function k1(n){return`NG0${Math.abs(n)}`}function Bc(n,e){return`${k1(n)}${e?": "+e:""}`}var Hi=globalThis;function yt(n){for(let e in n)if(n[e]===yt)return e;throw Error("")}function $b(n,e){for(let t in e)e.hasOwnProperty(t)&&!n.hasOwnProperty(t)&&(n[t]=e[t])}function Od(n){if(typeof n=="string")return n;if(Array.isArray(n))return`[${n.map(Od).join(", ")}]`;if(n==null)return""+n;let e=n.overriddenName||n.name;if(e)return`${e}`;let t=n.toString();if(t==null)return""+t;let i=t.indexOf(`
`);return i>=0?t.slice(0,i):t}function Ld(n,e){return n?e?`${n} ${e}`:n:e||""}var U1=yt({__forward_ref__:yt});function zi(n){return n.__forward_ref__=zi,n}function sn(n){return Og(n)?n():n}function Og(n){return typeof n=="function"&&n.hasOwnProperty(U1)&&n.__forward_ref__===zi}function Ie(n){return{token:n.token,providedIn:n.providedIn||null,factory:n.factory,value:void 0}}function Vr(n){return{providers:n.providers||[],imports:n.imports||[]}}function kd(n){return B1(n,Ud)}function B1(n,e){return n.hasOwnProperty(e)&&n[e]||null}function V1(n){let e=n?.[Ud]??null;return e||null}function Mg(n){return n&&n.hasOwnProperty(Rd)?n[Rd]:null}var Ud=yt({\u0275prov:yt}),Rd=yt({\u0275inj:yt}),Be=class{_desc;ngMetadataName="InjectionToken";\u0275prov;constructor(e,t){this._desc=e,this.\u0275prov=void 0,typeof t=="number"?this.__NG_ELEMENT_ID__=t:t!==void 0&&(this.\u0275prov=Ie({token:this,providedIn:t.providedIn||"root",factory:t.factory}))}get multi(){return this}toString(){return`InjectionToken ${this._desc}`}};function Lg(n){return n&&!!n.\u0275providers}var Vc=yt({\u0275cmp:yt}),Hc=yt({\u0275dir:yt}),kg=yt({\u0275pipe:yt});var Fc=yt({\u0275fac:yt}),ks=yt({__NG_ELEMENT_ID__:yt}),zb=yt({__NG_ENV_ID__:yt});function Hr(n){return Bg(n,"@Component"),n[Vc]||null}function Bd(n){return Bg(n,"@Directive"),n[Hc]||null}function Ug(n){return Bg(n,"@Pipe"),n[kg]||null}function Bg(n,e){if(n==null)throw new Fe(-919,!1)}function gr(n){return typeof n=="string"?n:n==null?"":String(n)}var qb=yt({ngErrorCode:yt}),H1=yt({ngErrorMessage:yt}),z1=yt({ngTokenPath:yt});function Vg(n,e){return Xb("",-200,e)}function Vd(n,e){throw new Fe(-201,!1)}function Xb(n,e,t){let i=new Fe(e,n);return i[qb]=e,i[H1]=n,t&&(i[z1]=t),i}function G1(n){return n[qb]}var Sg;function Yb(){return Sg}function Cn(n){let e=Sg;return Sg=n,e}function Hg(n,e,t){let i=kd(n);if(i&&i.providedIn=="root")return i.value===void 0?i.value=i.factory():i.value;if(t&8)return null;if(e!==void 0)return e;Vd(n,"")}var j1={},Ns=j1,W1="__NG_DI_FLAG__",Eg=class{injector;constructor(e){this.injector=e}retrieve(e,t){let i=Ps(t)||0;try{return this.injector.get(e,i&8?null:Ns,i)}catch(r){if(ko(r))return r;throw r}}};function $1(n,e=0){let t=Dd();if(t===void 0)throw new Fe(-203,!1);if(t===null)return Hg(n,void 0,e);{let i=q1(e),r=t.retrieve(n,i);if(ko(r)){if(i.optional)return null;throw r}return r}}function Ye(n,e=0){return(Yb()||$1)(sn(n),e)}function ve(n,e){return Ye(n,Ps(e))}function Ps(n){return typeof n>"u"||typeof n=="number"?n:0|(n.optional&&8)|(n.host&&1)|(n.self&&2)|(n.skipSelf&&4)}function q1(n){return{optional:!!(n&8),host:!!(n&1),self:!!(n&2),skipSelf:!!(n&4)}}function wg(n){let e=[];for(let t=0;t<n.length;t++){let i=sn(n[t]);if(Array.isArray(i)){if(i.length===0)throw new Fe(900,!1);let r,s=0;for(let o=0;o<i.length;o++){let a=i[o],c=X1(a);typeof c=="number"?c===-1?r=a.token:s|=c:r=a}e.push(Ye(r,s))}else e.push(Ye(i))}return e}function X1(n){return n[W1]}function Ur(n,e){let t=n.hasOwnProperty(Fc);return t?n[Fc]:null}function Zb(n,e,t){if(n.length!==e.length)return!1;for(let i=0;i<n.length;i++){let r=n[i],s=e[i];if(t&&(r=t(r),s=t(s)),s!==r)return!1}return!0}function Jb(n){return n.flat(Number.POSITIVE_INFINITY)}function Hd(n,e){n.forEach(t=>Array.isArray(t)?Hd(t,e):e(t))}function zg(n,e,t){e>=n.length?n.push(t):n.splice(e,0,t)}function zc(n,e){return e>=n.length-1?n.pop():n.splice(e,1)[0]}function Gg(n,e,t){let i=n.length-t;for(;e<i;)n[e]=n[e+t],e++;for(;t--;)n.pop()}function jg(n,e,t,i){let r=n.length;if(r==e)n.push(t,i);else if(r===1)n.push(i,n[0]),n[0]=t;else{for(r--,n.push(n[r-1],n[r]);r>e;){let s=r-2;n[r]=n[s],r--}n[e]=t,n[e+1]=i}}function Gc(n,e,t){let i=Bo(n,e);return i>=0?n[i|1]=t:(i=~i,jg(n,i,e,t)),i}function zd(n,e){let t=Bo(n,e);if(t>=0)return n[t|1]}function Bo(n,e){return Y1(n,e,1)}function Y1(n,e,t){let i=0,r=n.length>>t;for(;r!==i;){let s=i+(r-i>>1),o=n[s<<t];if(e===o)return s<<t;o>e?r=s:i=s+1}return~(r<<t)}var zr={},yn=[],Us=new Be(""),Wg=new Be("",-1),$g=new Be(""),Oc=class{get(e,t=Ns){if(t===Ns){let r=Xb("",-201);throw r.name="\u0275NotFound",r}return t}};function jc(n){return{\u0275providers:n}}function Kb(...n){return{\u0275providers:Gd(!0,n),\u0275fromNgModule:!0}}function Gd(n,...e){let t=[],i=new Set,r,s=o=>{t.push(o)};return Hd(e,o=>{let a=o;Nd(a,s,[],i)&&(r||=[],r.push(a))}),r!==void 0&&Qb(r,s),t}function Qb(n,e){for(let t=0;t<n.length;t++){let{ngModule:i,providers:r}=n[t];qg(r,s=>{e(s,i)})}}function Nd(n,e,t,i){if(n=sn(n),!n)return!1;let r=null,s=Mg(n),o=!s&&Hr(n);if(!s&&!o){let c=n.ngModule;if(s=Mg(c),s)r=c;else return!1}else{if(o&&!o.standalone)return!1;r=n}let a=i.has(r);if(o){if(a)return!1;if(i.add(r),o.dependencies){let c=typeof o.dependencies=="function"?o.dependencies():o.dependencies;for(let l of c)Nd(l,e,t,i)}}else if(s){if(s.imports!=null&&!a){i.add(r);let l;Hd(s.imports,u=>{Nd(u,e,t,i)&&(l||=[],l.push(u))}),l!==void 0&&Qb(l,e)}if(!a){let l=Ur(r)||(()=>new r);e({provide:r,useFactory:l,deps:yn},r),e({provide:$g,useValue:r,multi:!0},r),e({provide:Us,useValue:()=>Ye(r),multi:!0},r)}let c=s.providers;if(c!=null&&!a){let l=n;qg(c,u=>{e(u,l)})}}else return!1;return r!==n&&n.providers!==void 0}function qg(n,e){for(let t of n)Lg(t)&&(t=t.\u0275providers),Array.isArray(t)?qg(t,e):e(t)}var Z1=yt({provide:String,useValue:yt});function eM(n){return n!==null&&typeof n=="object"&&Z1 in n}function J1(n){return!!(n&&n.useExisting)}function K1(n){return!!(n&&n.useFactory)}function Fs(n){return typeof n=="function"}function tM(n){return!!n.useClass}var Xg=new Be(""),Ad={},Gb={},bg;function Wc(){return bg===void 0&&(bg=new Oc),bg}var vn=class{},Os=class extends vn{parent;source;scopes;records=new Map;_ngOnDestroyHooks=new Set;_onDestroyHooks=[];get destroyed(){return this._destroyed}_destroyed=!1;injectorDefTypes;constructor(e,t,i,r){super(),this.parent=t,this.source=i,this.scopes=r,Cg(e,o=>this.processProvider(o)),this.records.set(Wg,Uo(void 0,this)),r.has("environment")&&this.records.set(vn,Uo(void 0,this));let s=this.records.get(Xg);s!=null&&typeof s.value=="string"&&this.scopes.add(s.value),this.injectorDefTypes=new Set(this.get($g,yn,{self:!0}))}retrieve(e,t){let i=Ps(t)||0;try{return this.get(e,Ns,i)}catch(r){if(ko(r))return r;throw r}}destroy(){Pc(this),this._destroyed=!0;let e=ke(null);try{for(let i of this._ngOnDestroyHooks)i.ngOnDestroy();let t=this._onDestroyHooks;this._onDestroyHooks=[];for(let i of t)i()}finally{this.records.clear(),this._ngOnDestroyHooks.clear(),this.injectorDefTypes.clear(),ke(e)}}onDestroy(e){return Pc(this),this._onDestroyHooks.push(e),()=>this.removeOnDestroy(e)}runInContext(e){Pc(this);let t=Vi(this),i=Cn(void 0),r;try{return e()}finally{Vi(t),Cn(i)}}get(e,t=Ns,i){if(Pc(this),e.hasOwnProperty(zb))return e[zb](this);let r=Ps(i),s,o=Vi(this),a=Cn(void 0);try{if(!(r&4)){let l=this.records.get(e);if(l===void 0){let u=iR(e)&&kd(e);u&&this.injectableDefInScope(u)?l=Uo(Tg(e),Ad):l=null,this.records.set(e,l)}if(l!=null)return this.hydrate(e,l,r)}let c=r&2?Wc():this.parent;return t=r&8&&t===Ns?null:t,c.get(e,t)}catch(c){let l=G1(c);throw l===-200||l===-201?new Fe(l,null):c}finally{Cn(a),Vi(o)}}resolveInjectorInitializers(){let e=ke(null),t=Vi(this),i=Cn(void 0),r;try{let s=this.get(Us,yn,{self:!0});for(let o of s)o()}finally{Vi(t),Cn(i),ke(e)}}toString(){return"R3Injector[...]"}processProvider(e){e=sn(e);let t=Fs(e)?e:sn(e&&e.provide),i=eR(e);if(!Fs(e)&&e.multi===!0){let r=this.records.get(t);r||(r=Uo(void 0,Ad,!0),r.factory=()=>wg(r.multi),this.records.set(t,r)),t=e,r.multi.push(e)}this.records.set(t,i)}hydrate(e,t,i){let r=ke(null);try{if(t.value===Gb)throw Vg("");return t.value===Ad&&(t.value=Gb,t.value=t.factory(void 0,i)),typeof t.value=="object"&&t.value&&nR(t.value)&&this._ngOnDestroyHooks.add(t.value),t.value}finally{ke(r)}}injectableDefInScope(e){if(!e.providedIn)return!1;let t=sn(e.providedIn);return typeof t=="string"?t==="any"||this.scopes.has(t):this.injectorDefTypes.has(t)}removeOnDestroy(e){let t=this._onDestroyHooks.indexOf(e);t!==-1&&this._onDestroyHooks.splice(t,1)}};function Tg(n){let e=kd(n),t=e!==null?e.factory:Ur(n);if(t!==null)return t;if(n instanceof Be)throw new Fe(-204,!1);if(n instanceof Function)return Q1(n);throw new Fe(-204,!1)}function Q1(n){if(n.length>0)throw new Fe(-204,!1);let t=V1(n);return t!==null?()=>t.factory(n):()=>new n}function eR(n){if(eM(n))return Uo(void 0,n.useValue);{let e=Yg(n);return Uo(e,Ad)}}function Yg(n,e,t){let i;if(Fs(n)){let r=sn(n);return Ur(r)||Tg(r)}else if(eM(n))i=()=>sn(n.useValue);else if(K1(n))i=()=>n.useFactory(...wg(n.deps||[]));else if(J1(n))i=(r,s)=>Ye(sn(n.useExisting),s!==void 0&&s&8?8:void 0);else{let r=sn(n&&(n.useClass||n.provide));if(tR(n))i=()=>new r(...wg(n.deps));else return Ur(r)||Tg(r)}return i}function Pc(n){if(n.destroyed)throw new Fe(-205,!1)}function Uo(n,e,t=!1){return{factory:n,value:e,multi:t?[]:void 0}}function tR(n){return!!n.deps}function nR(n){return n!==null&&typeof n=="object"&&typeof n.ngOnDestroy=="function"}function iR(n){return typeof n=="function"||typeof n=="object"&&n.ngMetadataName==="InjectionToken"}function Cg(n,e){for(let t of n)Array.isArray(t)?Cg(t,e):t&&Lg(t)?Cg(t.\u0275providers,e):e(t)}function Vo(n,e){let t;n instanceof Os?(Pc(n),t=n):t=new Eg(n);let i,r=Vi(t),s=Cn(void 0);try{return e()}finally{Vi(r),Cn(s)}}function nM(){return Yb()!==void 0||Dd()!=null}var xi=0,xe=1,Ve=2,jt=3,ai=4,ci=5,Ho=6,zo=7,Vt=8,An=9,bi=10,xt=11,Go=12,Zg=13,Bs=14,qn=15,Gr=16,Vs=17,Gi=18,yr=19,Jg=20,pr=21,jd=22,$c=23,Xn=24,Hs=25,jr=26,bt=27,iM=1,Wr=6,$r=7,qc=8,zs=9,Ft=10;function vr(n){return Array.isArray(n)&&typeof n[iM]=="object"}function Mi(n){return Array.isArray(n)&&n[iM]===!0}function Kg(n){return(n.flags&4)!==0}function _r(n){return n.componentOffset>-1}function jo(n){return(n.flags&1)===1}function ji(n){return!!n.template}function Wo(n){return(n[Ve]&512)!==0}function qr(n){return(n[Ve]&256)===256}var Vn=(function(n){return n[n.NONE=0]="NONE",n[n.HTML=1]="HTML",n[n.STYLE=2]="STYLE",n[n.SCRIPT=3]="SCRIPT",n[n.URL=4]="URL",n[n.RESOURCE_URL=5]="RESOURCE_URL",n[n.ATTRIBUTE_NO_BINDING=6]="ATTRIBUTE_NO_BINDING",n})(Vn||{}),Id,Lc="svg",Qg="math";function rM(){return Id||(Id={},kr(Vn.HTML,void 0,[["iframe",["srcdoc"]],["*",["innerHTML","outerHTML"]]]),kr(Vn.STYLE,void 0,[["*",["style"]]]),kr(Vn.URL,void 0,[["*",["formAction"]],["area",["href"]],["a",["href","xlink:href"]],["form",["action"]],["img",["src"]],["video",["src"]]]),kr(Vn.URL,Qg,[["*",["href","xlink:href"]],["annotation",["href","xlink:href"]],["annotation-xml",["href","xlink:href"]],["maction",["href","xlink:href"]],["malignmark",["href","xlink:href"]],["math",["href","xlink:href"]],["mroot",["href","xlink:href"]],["msqrt",["href","xlink:href"]],["merror",["href","xlink:href"]],["mfrac",["href","xlink:href"]],["mglyph",["href","xlink:href"]],["msub",["href","xlink:href"]],["msup",["href","xlink:href"]],["msubsup",["href","xlink:href"]],["mmultiscripts",["href","xlink:href"]],["mprescripts",["href","xlink:href"]],["mi",["href","xlink:href"]],["mn",["href","xlink:href"]],["mo",["href","xlink:href"]],["mpadded",["href","xlink:href"]],["mphantom",["href","xlink:href"]],["mrow",["href","xlink:href"]],["ms",["href","xlink:href"]],["mspace",["href","xlink:href"]],["mstyle",["href","xlink:href"]],["mtable",["href","xlink:href"]],["mtd",["href","xlink:href"]],["mtr",["href","xlink:href"]],["mtext",["href","xlink:href"]],["mover",["href","xlink:href"]],["munder",["href","xlink:href"]],["munderover",["href","xlink:href"]],["semantics",["href","xlink:href"]],["none",["href","xlink:href"]]]),kr(Vn.RESOURCE_URL,void 0,[["base",["href"]],["embed",["src"]],["frame",["src"]],["iframe",["src"]],["link",["href"]],["object",["codebase","data"]]]),kr(Vn.URL,Lc,[["a",["href","xlink:href"]]]),kr(Vn.ATTRIBUTE_NO_BINDING,Lc,[["animate",["attributeName","values","to","from"]],["set",["to","attributeName"]],["animateMotion",["attributeName"]],["animateTransform",["attributeName"]]]),kr(Vn.ATTRIBUTE_NO_BINDING,void 0,[["unknown",["attributeName","values","to","from","sandbox","allow","allowFullscreen","referrerPolicy","csp","fetchPriority"]],["iframe",["sandbox","allow","allowFullscreen","referrerPolicy","csp","fetchPriority"]]])),Id}function kr(n,e,t){for(let[i,r]of t){let s=e&&i!=="unknown"?`:${e}:${i}`:i;s=s.toLowerCase();for(let o of r)Id[`${s}|${o.toLowerCase()}`]=n}}function sM(n,e,t){let i=rM(),r=n.toLowerCase(),s=e.toLowerCase(),o=t&&r!=="*"&&r!=="unknown"?i[`:${t}:${r}|${s}`]:void 0,a=t?i[`:${t}:*|${s}`]:void 0;return o??a??i[`${r}|${s}`]??i[`*|${s}`]??Vn.NONE}function li(n){for(;Array.isArray(n);)n=n[xi];return n}function ey(n,e){return li(e[n])}function ui(n,e){return li(e[n.index])}function $o(n,e){return n.data[e]}function Wd(n,e){return n[e]}function Xc(n,e,t,i){t>=n.data.length&&(n.data[t]=null,n.blueprint[t]=null),e[t]=i}function di(n,e){let t=e[n];return vr(t)?t:t[xi]}function oM(n){return(n[Ve]&4)===4}function $d(n){return(n[Ve]&128)===128}function aM(n){return Mi(n[jt])}function In(n,e){return e==null?null:n[e]}function ty(n){n[Vs]=0}function ny(n){n[Ve]&1024||(n[Ve]|=1024,$d(n)&&qo(n))}function cM(n,e){for(;n>0;)e=e[Bs],n--;return e}function Yc(n){return!!(n[Ve]&9216||n[Xn]?.dirty)}function qd(n){n[bi].changeDetectionScheduler?.notify(8),n[Ve]&64&&(n[Ve]|=1024),Yc(n)&&qo(n)}function qo(n){n[bi].changeDetectionScheduler?.notify(0);let e=Br(n);for(;e!==null&&!(e[Ve]&8192||(e[Ve]|=8192,!$d(e)));)e=Br(e)}function Xd(n,e){if(qr(n))throw new Fe(911,!1);n[pr]===null&&(n[pr]=[]),n[pr].push(e)}function iy(n,e){if(n[pr]===null)return;let t=n[pr].indexOf(e);t!==-1&&n[pr].splice(t,1)}function Br(n){let e=n[jt];return Mi(e)?e[jt]:e}function ry(n){return n[zo]??=[]}function sy(n){return n.cleanup??=[]}function lM(n,e,t,i){let r=ry(e);r.push(t),n.firstCreatePass&&sy(n).push(i,r.length-1)}var We={lFrame:MM(null),bindingsEnabled:!0,skipHydrationRootTNode:null};var Dg=!1;function uM(){return We.lFrame.elementDepthCount}function dM(){We.lFrame.elementDepthCount++}function oy(){We.lFrame.elementDepthCount--}function Yd(){return We.bindingsEnabled}function fM(){return We.skipHydrationRootTNode!==null}function ay(n){return We.skipHydrationRootTNode===n}function cy(){We.skipHydrationRootTNode=null}function Re(){return We.lFrame.lView}function Mt(){return We.lFrame.tView}function Zc(n){return We.lFrame.contextLView=n,n[Vt]}function Jc(n){return We.lFrame.contextLView=null,n}function en(){let n=ly();for(;n!==null&&n.type===64;)n=n.parent;return n}function ly(){return We.lFrame.currentTNode}function hM(){let n=We.lFrame,e=n.currentTNode;return n.isParent?e:e.parent}function Gs(n,e){let t=We.lFrame;t.currentTNode=n,t.isParent=e}function uy(){return We.lFrame.isParent}function pM(){We.lFrame.isParent=!1}function dy(){return We.lFrame.contextLView}function fy(){return Dg}function hy(n){let e=Dg;return Dg=n,e}function mM(){let n=We.lFrame,e=n.bindingRootIndex;return e===-1&&(e=n.bindingRootIndex=n.tView.bindingStartIndex),e}function py(){return We.lFrame.bindingIndex}function gM(n){return We.lFrame.bindingIndex=n}function Xr(){return We.lFrame.bindingIndex++}function Kc(n){let e=We.lFrame,t=e.bindingIndex;return e.bindingIndex=e.bindingIndex+n,t}function yM(){return We.lFrame.inI18n}function vM(n,e){let t=We.lFrame;t.bindingIndex=t.bindingRootIndex=n,Zd(e)}function _M(){return We.lFrame.currentDirectiveIndex}function Zd(n){We.lFrame.currentDirectiveIndex=n}function xM(n){let e=We.lFrame.currentDirectiveIndex;return e===-1?null:n[e]}function Jd(){return We.lFrame.currentQueryIndex}function Qc(n){We.lFrame.currentQueryIndex=n}function rR(n){let e=n[xe];return e.type===2?e.declTNode:e.type===1?n[ci]:null}function my(n,e,t){if(t&4){let r=e,s=n;for(;r=r.parent,r===null&&!(t&1);)if(r=rR(s),r===null||(s=s[Bs],r.type&10))break;if(r===null)return!1;e=r,n=s}let i=We.lFrame=bM();return i.currentTNode=e,i.lView=n,!0}function Kd(n){let e=bM(),t=n[xe];We.lFrame=e,e.currentTNode=t.firstChild,e.lView=n,e.tView=t,e.contextLView=n,e.bindingIndex=t.bindingStartIndex,e.inI18n=!1}function bM(){let n=We.lFrame,e=n===null?null:n.child;return e===null?MM(n):e}function MM(n){let e={currentTNode:null,isParent:!0,lView:null,tView:null,selectedIndex:-1,contextLView:null,elementDepthCount:0,currentNamespace:null,currentDirectiveIndex:-1,bindingRootIndex:-1,bindingIndex:-1,currentQueryIndex:0,parent:n,child:null,inI18n:!1};return n!==null&&(n.child=e),e}function SM(){let n=We.lFrame;return We.lFrame=n.parent,n.currentTNode=null,n.lView=null,n}var gy=SM;function Qd(){let n=SM();n.isParent=!0,n.tView=null,n.selectedIndex=-1,n.contextLView=null,n.elementDepthCount=0,n.currentDirectiveIndex=-1,n.currentNamespace=null,n.bindingRootIndex=-1,n.bindingIndex=-1,n.currentQueryIndex=0}function EM(n){return(We.lFrame.contextLView=cM(n,We.lFrame.contextLView))[Vt]}function Yn(){return We.lFrame.selectedIndex}function Yr(n){We.lFrame.selectedIndex=n}function Xo(){let n=We.lFrame;return $o(n.tView,n.selectedIndex)}function wM(){We.lFrame.currentNamespace=Lc}function TM(){sR()}function sR(){We.lFrame.currentNamespace=null}function yy(){return We.lFrame.currentNamespace}var CM=!0;function ef(){return CM}function el(n){CM=n}function Ag(n,e=null,t=null,i){let r=DM(n,e,t,i);return r.resolveInjectorInitializers(),r}function DM(n,e=null,t=null,i,r=new Set){let s=[t||yn,Kb(n)],o;return new Os(s,e||Wc(),o||null,r)}var _i=class n{static THROW_IF_NOT_FOUND=Ns;static NULL=new Oc;static create(e,t){if(Array.isArray(e))return Ag({name:""},t,e,"");{let i=e.name??"";return Ag({name:i},e.parent,e.providers,i)}}static \u0275prov=Ie({token:n,providedIn:"any",factory:()=>Ye(Wg)});static __NG_ELEMENT_ID__=-1},Zr=new Be(""),Jr=(()=>{class n{static __NG_ELEMENT_ID__=oR;static __NG_ENV_ID__=t=>t}return n})(),Ig=class extends Jr{_lView;constructor(e){super(),this._lView=e}get destroyed(){return qr(this._lView)}onDestroy(e){let t=this._lView;return Xd(t,e),()=>iy(t,e)}};function oR(){return new Ig(Re())}var vy=!1,AM=new Be(""),Kr=(()=>{class n{taskId=0;pendingTasks=new Set;destroyed=!1;pendingTask=new Qt(!1);debugTaskTracker=ve(AM,{optional:!0});get hasPendingTasks(){return this.destroyed?!1:this.pendingTask.value}get hasPendingTasksObservable(){return this.destroyed?new At(t=>{t.next(!1),t.complete()}):this.pendingTask}add(){!this.hasPendingTasks&&!this.destroyed&&this.pendingTask.next(!0);let t=this.taskId++;return this.pendingTasks.add(t),this.debugTaskTracker?.add(t),t}has(t){return this.pendingTasks.has(t)}remove(t){this.pendingTasks.delete(t),this.debugTaskTracker?.remove(t),this.pendingTasks.size===0&&this.hasPendingTasks&&this.pendingTask.next(!1)}ngOnDestroy(){this.pendingTasks.clear(),this.hasPendingTasks&&this.pendingTask.next(!1),this.destroyed=!0,this.pendingTask.unsubscribe()}static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new n})}return n})(),Rg=class extends Ut{__isAsync;destroyRef=void 0;pendingTasks=void 0;constructor(e=!1){super(),this.__isAsync=e,nM()&&(this.destroyRef=ve(Jr,{optional:!0})??void 0,this.pendingTasks=ve(Kr,{optional:!0})??void 0)}emit(e){let t=ke(null);try{super.next(e)}finally{ke(t)}}subscribe(e,t,i){let r=e,s=t||(()=>null),o=i;if(e&&typeof e=="object"){let c=e;r=c.next?.bind(c),s=c.error?.bind(c),o=c.complete?.bind(c)}this.__isAsync&&(s=this.wrapInTimeout(s),r&&(r=this.wrapInTimeout(r)),o&&(o=this.wrapInTimeout(o)));let a=super.subscribe({next:r,error:s,complete:o});return e instanceof rn&&e.add(a),a}wrapInTimeout(e){return t=>{let i=this.pendingTasks?.add();setTimeout(()=>{try{e(t)}finally{i!==void 0&&this.pendingTasks?.remove(i)}})}}},Dn=Rg;function Pd(...n){}function _y(n){let e,t;function i(){n=Pd;try{t!==void 0&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(t),e!==void 0&&clearTimeout(e)}catch(r){}}return e=setTimeout(()=>{n(),i()}),typeof requestAnimationFrame=="function"&&(t=requestAnimationFrame(()=>{n(),i()})),()=>i()}function IM(n){return queueMicrotask(()=>n()),()=>{n=Pd}}var xy="isAngularZone",kc=xy+"_ID",aR=0,Bt=class n{hasPendingMacrotasks=!1;hasPendingMicrotasks=!1;isStable=!0;onUnstable=new Dn(!1);onMicrotaskEmpty=new Dn(!1);onStable=new Dn(!1);onError=new Dn(!1);constructor(e){let{enableLongStackTrace:t=!1,shouldCoalesceEventChangeDetection:i=!1,shouldCoalesceRunChangeDetection:r=!1,scheduleInRootZone:s=vy}=e;if(typeof Zone>"u")throw new Fe(908,!1);Zone.assertZonePatched();let o=this;o._nesting=0,o._outer=o._inner=Zone.current,Zone.TaskTrackingZoneSpec&&(o._inner=o._inner.fork(new Zone.TaskTrackingZoneSpec)),t&&Zone.longStackTraceZoneSpec&&(o._inner=o._inner.fork(Zone.longStackTraceZoneSpec)),o.shouldCoalesceEventChangeDetection=!r&&i,o.shouldCoalesceRunChangeDetection=r,o.callbackScheduled=!1,o.scheduleInRootZone=s,uR(o)}static isInAngularZone(){return typeof Zone<"u"&&Zone.current.get(xy)===!0}static assertInAngularZone(){if(!n.isInAngularZone())throw new Fe(909,!1)}static assertNotInAngularZone(){if(n.isInAngularZone())throw new Fe(909,!1)}run(e,t,i){return this._inner.run(e,t,i)}runTask(e,t,i,r){let s=this._inner,o=s.scheduleEventTask("NgZoneEvent: "+r,e,cR,Pd,Pd);try{return s.runTask(o,t,i)}finally{s.cancelTask(o)}}runGuarded(e,t,i){return this._inner.runGuarded(e,t,i)}runOutsideAngular(e){return this._outer.run(e)}},cR={};function by(n){if(n._nesting==0&&!n.hasPendingMicrotasks&&!n.isStable)try{n._nesting++,n.onMicrotaskEmpty.emit(null)}finally{if(n._nesting--,!n.hasPendingMicrotasks)try{n.runOutsideAngular(()=>n.onStable.emit(null))}finally{n.isStable=!0}}}function lR(n){if(n.isCheckStableRunning||n.callbackScheduled)return;n.callbackScheduled=!0;function e(){_y(()=>{n.callbackScheduled=!1,Ng(n),n.isCheckStableRunning=!0,by(n),n.isCheckStableRunning=!1})}n.scheduleInRootZone?Zone.root.run(()=>{e()}):n._outer.run(()=>{e()}),Ng(n)}function uR(n){let e=()=>{lR(n)},t=aR++;n._inner=n._inner.fork({name:"angular",properties:{[xy]:!0,[kc]:t,[kc+t]:!0},onInvokeTask:(i,r,s,o,a,c)=>{if(dR(c))return i.invokeTask(s,o,a,c);try{return jb(n),i.invokeTask(s,o,a,c)}finally{(n.shouldCoalesceEventChangeDetection&&o.type==="eventTask"||n.shouldCoalesceRunChangeDetection)&&e(),Wb(n)}},onInvoke:(i,r,s,o,a,c,l)=>{try{return jb(n),i.invoke(s,o,a,c,l)}finally{n.shouldCoalesceRunChangeDetection&&!n.callbackScheduled&&!fR(c)&&e(),Wb(n)}},onHasTask:(i,r,s,o)=>{i.hasTask(s,o),r===s&&(o.change=="microTask"?(n._hasPendingMicrotasks=o.microTask,Ng(n),by(n)):o.change=="macroTask"&&(n.hasPendingMacrotasks=o.macroTask))},onHandleError:(i,r,s,o)=>(i.handleError(s,o),n.runOutsideAngular(()=>n.onError.emit(o)),!1)})}function Ng(n){n._hasPendingMicrotasks||(n.shouldCoalesceEventChangeDetection||n.shouldCoalesceRunChangeDetection)&&n.callbackScheduled===!0?n.hasPendingMicrotasks=!0:n.hasPendingMicrotasks=!1}function jb(n){n._nesting++,n.isStable&&(n.isStable=!1,n.onUnstable.emit(null))}function Wb(n){n._nesting--,by(n)}var Uc=class{hasPendingMicrotasks=!1;hasPendingMacrotasks=!1;isStable=!0;onUnstable=new Dn;onMicrotaskEmpty=new Dn;onStable=new Dn;onError=new Dn;run(e,t,i){return e.apply(t,i)}runGuarded(e,t,i){return e.apply(t,i)}runOutsideAngular(e){return e()}runTask(e,t,i,r){return e.apply(t,i)}};function dR(n){return RM(n,"__ignore_ng_zone__")}function fR(n){return RM(n,"__scheduler_tick__")}function RM(n,e){return!Array.isArray(n)||n.length!==1?!1:n[0]?.data?.[e]===!0}var Ls=class{_console=console;handleError(e){this._console.error("ERROR",e)}},Wi=new Be("",{factory:()=>{let n=ve(Bt),e=ve(vn),t;return i=>{n.runOutsideAngular(()=>{e.destroyed&&!t?setTimeout(()=>{throw i}):(t??=e.get(Ls),t.handleError(i))})}}}),NM={provide:Us,useValue:()=>{let n=ve(Ls,{optional:!0})},multi:!0};function js(n,e){let[t,i,r]=vg(n,e?.equal),s=t,o=s[gn];return s.set=i,s.update=r,s.asReadonly=PM.bind(s),s}function PM(){let n=this[gn];if(n.readonlyFn===void 0){let e=()=>this();e[gn]=n,n.readonlyFn=e}return n.readonlyFn}var tf=(()=>{class n{view;node;constructor(t,i){this.view=t,this.node=i}static __NG_ELEMENT_ID__=hR}return n})();function hR(){return new tf(Re(),en())}var mr=class{},Yo=new Be("",{factory:()=>!0});var nf=new Be(""),tl=(()=>{class n{internalPendingTasks=ve(Kr);scheduler=ve(mr);errorHandler=ve(Wi);add(){let t=this.internalPendingTasks.add();return()=>{this.internalPendingTasks.has(t)&&(this.scheduler.notify(11),this.internalPendingTasks.remove(t))}}run(t){let i=this.add();t().catch(this.errorHandler).finally(i)}static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new n})}return n})(),My=(()=>{class n{static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new Pg})}return n})(),Pg=class{dirtyEffectCount=0;queues=new Map;add(e){this.enqueue(e),this.schedule(e)}schedule(e){e.dirty&&this.dirtyEffectCount++}remove(e){let t=e.zone,i=this.queues.get(t);i.has(e)&&(i.delete(e),e.dirty&&this.dirtyEffectCount--)}enqueue(e){let t=e.zone;this.queues.has(t)||this.queues.set(t,new Set);let i=this.queues.get(t);i.has(e)||i.add(e)}flush(){for(;this.dirtyEffectCount>0;){let e=!1;for(let[t,i]of this.queues)t===null?e||=this.flushQueue(i):e||=t.run(()=>this.flushQueue(i));e||(this.dirtyEffectCount=0)}}flushQueue(e){let t=!1;for(let i of e)i.dirty&&(this.dirtyEffectCount--,t=!0,i.run());return t}},Fg=class{[gn];constructor(e){this[gn]=e}destroy(){this[gn].destroy()}};function gl(n){return{toString:n}.toString()}function MR(n){return typeof n=="function"}function bS(n,e,t,i){e!==null?e.applyValueToInputSignal(e,i):n[t]=i}var mf=class{previousValue;currentValue;firstChange;constructor(e,t,i){this.previousValue=e,this.currentValue=t,this.firstChange=i}isFirstChange(){return this.firstChange}},yl=(()=>{let n=()=>MS;return n.ngInherit=!0,n})();function MS(n){return n.type.prototype.ngOnChanges&&(n.setInput=ER),SR}function SR(){let n=ES(this),e=n?.current;if(e){let t=n.previous;if(t===zr)n.previous=e;else for(let i in e)t[i]=e[i];n.current=null,this.ngOnChanges(e)}}function ER(n,e,t,i,r){let s=this.declaredInputs[i],o=ES(n)||wR(n,{previous:zr,current:null}),a=o.current||(o.current={}),c=o.previous,l=c[s];a[s]=new mf(l&&l.currentValue,t,c===zr),bS(n,e,r,t)}var SS="__ngSimpleChanges__";function ES(n){return n[SS]||null}function wR(n,e){return n[SS]=e}var FM=[];var ct=function(n,e=null,t){for(let i=0;i<FM.length;i++){let r=FM[i];r(n,e,t)}},it=(function(n){return n[n.TemplateCreateStart=0]="TemplateCreateStart",n[n.TemplateCreateEnd=1]="TemplateCreateEnd",n[n.TemplateUpdateStart=2]="TemplateUpdateStart",n[n.TemplateUpdateEnd=3]="TemplateUpdateEnd",n[n.LifecycleHookStart=4]="LifecycleHookStart",n[n.LifecycleHookEnd=5]="LifecycleHookEnd",n[n.OutputStart=6]="OutputStart",n[n.OutputEnd=7]="OutputEnd",n[n.BootstrapApplicationStart=8]="BootstrapApplicationStart",n[n.BootstrapApplicationEnd=9]="BootstrapApplicationEnd",n[n.BootstrapComponentStart=10]="BootstrapComponentStart",n[n.BootstrapComponentEnd=11]="BootstrapComponentEnd",n[n.ChangeDetectionStart=12]="ChangeDetectionStart",n[n.ChangeDetectionEnd=13]="ChangeDetectionEnd",n[n.ChangeDetectionSyncStart=14]="ChangeDetectionSyncStart",n[n.ChangeDetectionSyncEnd=15]="ChangeDetectionSyncEnd",n[n.AfterRenderHooksStart=16]="AfterRenderHooksStart",n[n.AfterRenderHooksEnd=17]="AfterRenderHooksEnd",n[n.ComponentStart=18]="ComponentStart",n[n.ComponentEnd=19]="ComponentEnd",n[n.DeferBlockStateStart=20]="DeferBlockStateStart",n[n.DeferBlockStateEnd=21]="DeferBlockStateEnd",n[n.DynamicComponentStart=22]="DynamicComponentStart",n[n.DynamicComponentEnd=23]="DynamicComponentEnd",n[n.HostBindingsUpdateStart=24]="HostBindingsUpdateStart",n[n.HostBindingsUpdateEnd=25]="HostBindingsUpdateEnd",n})(it||{});function TR(n,e,t){let{ngOnChanges:i,ngOnInit:r,ngDoCheck:s}=e.type.prototype;if(i){let o=MS(e);(t.preOrderHooks??=[]).push(n,o),(t.preOrderCheckHooks??=[]).push(n,o)}r&&(t.preOrderHooks??=[]).push(0-n,r),s&&((t.preOrderHooks??=[]).push(n,s),(t.preOrderCheckHooks??=[]).push(n,s))}function wS(n,e){for(let t=e.directiveStart,i=e.directiveEnd;t<i;t++){let s=n.data[t].type.prototype,{ngAfterContentInit:o,ngAfterContentChecked:a,ngAfterViewInit:c,ngAfterViewChecked:l,ngOnDestroy:u}=s;o&&(n.contentHooks??=[]).push(-t,o),a&&((n.contentHooks??=[]).push(t,a),(n.contentCheckHooks??=[]).push(t,a)),c&&(n.viewHooks??=[]).push(-t,c),l&&((n.viewHooks??=[]).push(t,l),(n.viewCheckHooks??=[]).push(t,l)),u!=null&&(n.destroyHooks??=[]).push(t,u)}}function lf(n,e,t){TS(n,e,3,t)}function uf(n,e,t,i){(n[Ve]&3)===t&&TS(n,e,t,i)}function Sy(n,e){let t=n[Ve];(t&3)===e&&(t&=16383,t+=1,n[Ve]=t)}function TS(n,e,t,i){let r=i!==void 0?n[Vs]&65535:0,s=i??-1,o=e.length-1,a=0;for(let c=r;c<o;c++)if(typeof e[c+1]=="number"){if(a=e[c],i!=null&&a>=i)break}else e[c]<0&&(n[Vs]+=65536),(a<s||s==-1)&&(CR(n,t,e,c),n[Vs]=(n[Vs]&4294901760)+c+2),c++}function OM(n,e){ct(it.LifecycleHookStart,n,e);let t=ke(null);try{e.call(n)}finally{ke(t),ct(it.LifecycleHookEnd,n,e)}}function CR(n,e,t,i){let r=t[i]<0,s=t[i+1],o=r?-t[i]:t[i],a=n[o];r?n[Ve]>>14<n[Vs]>>16&&(n[Ve]&3)===e&&(n[Ve]+=16384,OM(a,s)):OM(a,s)}var Jo=-1,$s=class{factory;name;injectImpl;resolving=!1;canSeeViewProviders;multi;componentProviders;index;providerFactory;constructor(e,t,i,r){this.factory=e,this.name=r,this.canSeeViewProviders=t,this.injectImpl=i}};function DR(n){return(n.flags&8)!==0}function AR(n){return(n.flags&16)!==0}function IR(n,e,t){let i=0;for(;i<t.length;){let r=t[i];if(typeof r=="number"){if(r!==0)break;i++;let s=t[i++],o=t[i++],a=t[i++];n.setAttribute(e,o,a,s)}else{let s=r,o=t[++i];NR(s)?n.setProperty(e,s,o):n.setAttribute(e,s,o),i++}}return i}function RR(n){return n===3||n===4||n===6}function NR(n){return n.charCodeAt(0)===64}function ea(n,e){if(!(e===null||e.length===0))if(n===null||n.length===0)n=e.slice();else{let t=-1;for(let i=0;i<e.length;i++){let r=e[i];typeof r=="number"?t=r:t===0||(t===-1||t===2?LM(n,t,r,null,e[++i]):LM(n,t,r,null,null))}}return n}function LM(n,e,t,i,r){let s=0,o=n.length;if(e===-1)o=-1;else for(;s<n.length;){let a=n[s++];if(typeof a=="number"){if(a===e){o=-1;break}else if(a>e){o=s-1;break}}}for(;s<n.length;){let a=n[s];if(typeof a=="number")break;if(a===t){r!==null&&(n[s+1]=r);return}s++,r!==null&&s++}o!==-1&&(n.splice(o,0,e),s=o+1),n.splice(s++,0,t),r!==null&&n.splice(s++,0,r)}function CS(n){return n!==Jo}function gf(n){return n&32767}function PR(n){return n>>16}function yf(n,e){let t=PR(n),i=e;for(;t>0;)i=i[Bs],t--;return i}var Ly=!0;function vf(n){let e=Ly;return Ly=n,e}var FR=256,DS=FR-1,AS=5,OR=0,$i={};function LR(n,e,t){let i;typeof t=="string"?i=t.charCodeAt(0)||0:t.hasOwnProperty(ks)&&(i=t[ks]),i==null&&(i=t[ks]=OR++);let r=i&DS,s=1<<r;e.data[n+(r>>AS)]|=s}function _f(n,e){let t=IS(n,e);if(t!==-1)return t;let i=e[xe];i.firstCreatePass&&(n.injectorIndex=e.length,Ey(i.data,n),Ey(e,null),Ey(i.blueprint,null));let r=vv(n,e),s=n.injectorIndex;if(CS(r)){let o=gf(r),a=yf(r,e),c=a[xe].data;for(let l=0;l<8;l++)e[s+l]=a[o+l]|c[o+l]}return e[s+8]=r,s}function Ey(n,e){n.push(0,0,0,0,0,0,0,0,e)}function IS(n,e){return n.injectorIndex===-1||n.parent&&n.parent.injectorIndex===n.injectorIndex||e[n.injectorIndex+8]===null?-1:n.injectorIndex}function vv(n,e){if(n.parent&&n.parent.injectorIndex!==-1)return n.parent.injectorIndex;let t=0,i=null,r=e;for(;r!==null;){if(i=OS(r),i===null)return Jo;if(t++,r=r[Bs],i.injectorIndex!==-1)return i.injectorIndex|t<<16}return Jo}function ky(n,e,t){LR(n,e,t)}function RS(n,e,t){if(t&8||n!==void 0)return n;Vd(e,"NodeInjector")}function NS(n,e,t,i){if(t&8&&i===void 0&&(i=null),(t&3)===0){let r=n[An],s=Cn(void 0);try{return r?r.get(e,i,t&8):Hg(e,i,t&8)}finally{Cn(s)}}return RS(i,e,t)}function PS(n,e,t,i=0,r){if(n!==null){if(e[Ve]&2048&&!(i&2)){let o=VR(n,e,t,i,$i);if(o!==$i)return o}let s=FS(n,e,t,i,$i);if(s!==$i)return s}return NS(e,t,i,r)}function FS(n,e,t,i,r){let s=UR(t);if(typeof s=="function"){if(!my(e,n,i))return i&1?RS(r,t,i):NS(e,t,i,r);try{let o;if(o=s(i),o==null&&!(i&8))Vd(t);else return o}finally{gy()}}else if(typeof s=="number"){let o=null,a=IS(n,e),c=Jo,l=i&1?e[qn][ci]:null;for((a===-1||i&4)&&(c=a===-1?vv(n,e):e[a+8],c===Jo||!UM(i,!1)?a=-1:(o=e[xe],a=gf(c),e=yf(c,e)));a!==-1;){let u=e[xe];if(kM(s,a,u.data)){let d=kR(a,e,t,o,i,l);if(d!==$i)return d}c=e[a+8],c!==Jo&&UM(i,e[xe].data[a+8]===l)&&kM(s,a,e)?(o=u,a=gf(c),e=yf(c,e)):a=-1}}return r}function kR(n,e,t,i,r,s){let o=e[xe],a=o.data[n+8],c=i==null?_r(a)&&Ly:i!=o&&(a.type&3)!==0,l=r&1&&s===a,u=df(a,o,t,c,l);return u!==null?al(e,o,u,a,r):$i}function df(n,e,t,i,r){let s=n.providerIndexes,o=e.data,a=s&1048575,c=n.directiveStart,l=n.directiveEnd,u=s>>20,d=i?a:a+u,f=r?a+u:l;for(let h=d;h<f;h++){let p=o[h];if(h<c&&t===p||h>=c&&p.type===t)return h}if(r){let h=o[c];if(h&&ji(h)&&h.type===t)return c}return null}function al(n,e,t,i,r){let s=n[t],o=e.data;if(s instanceof $s){let a=s;if(a.resolving)throw Vg("");let c=vf(a.canSeeViewProviders);a.resolving=!0;let l=o[t].type||o[t],u,d=a.injectImpl?Cn(a.injectImpl):null,f=my(n,i,0);try{s=n[t]=a.factory(void 0,r,o,n,i),e.firstCreatePass&&t>=i.directiveStart&&TR(t,o[t],e)}finally{d!==null&&Cn(d),vf(c),a.resolving=!1,gy()}}return s}function UR(n){if(typeof n=="string")return n.charCodeAt(0)||0;let e=n.hasOwnProperty(ks)?n[ks]:void 0;return typeof e=="number"?e>=0?e&DS:BR:e}function kM(n,e,t){let i=1<<n;return!!(t[e+(n>>AS)]&i)}function UM(n,e){return!(n&2)&&!(n&1&&e)}var Ws=class{_tNode;_lView;constructor(e,t){this._tNode=e,this._lView=t}get(e,t,i){return PS(this._tNode,this._lView,e,Ps(i),t)}};function BR(){return new Ws(en(),Re())}function ca(n){return gl(()=>{let e=n.prototype.constructor,t=e[Fc]||Uy(e),i=Object.prototype,r=Object.getPrototypeOf(n.prototype).constructor;for(;r&&r!==i;){let s=r[Fc]||Uy(r);if(s&&s!==t)return s;r=Object.getPrototypeOf(r)}return s=>new s})}function Uy(n){return Og(n)?()=>{let e=Uy(sn(n));return e&&e()}:Ur(n)}function VR(n,e,t,i,r){let s=n,o=e;for(;s!==null&&o!==null&&o[Ve]&2048&&!Wo(o);){let a=FS(s,o,t,i|2,$i);if(a!==$i)return a;let c=s.parent;if(!c){let l=o[Jg];if(l){let u=l.get(t,$i,i&-5);if(u!==$i)return u}c=OS(o),o=o[Bs]}s=c}return r}function OS(n){let e=n[xe],t=e.type;return t===2?e.declTNode:t===1?n[ci]:null}function HR(){return la(en(),Re())}function la(n,e){return new Rn(ui(n,e))}var Rn=(()=>{class n{nativeElement;constructor(t){this.nativeElement=t}static __NG_ELEMENT_ID__=HR}return n})();function LS(n){return n instanceof Rn?n.nativeElement:n}function zR(){return this._results[Symbol.iterator]()}var xf=class{_emitDistinctChangesOnly;dirty=!0;_onDirty=void 0;_results=[];_changesDetected=!1;_changes=void 0;length=0;first=void 0;last=void 0;get changes(){return this._changes??=new Ut}constructor(e=!1){this._emitDistinctChangesOnly=e}get(e){return this._results[e]}map(e){return this._results.map(e)}filter(e){return this._results.filter(e)}find(e){return this._results.find(e)}reduce(e,t){return this._results.reduce(e,t)}forEach(e){this._results.forEach(e)}some(e){return this._results.some(e)}toArray(){return this._results.slice()}toString(){return this._results.toString()}reset(e,t){this.dirty=!1;let i=Jb(e);(this._changesDetected=!Zb(this._results,i,t))&&(this._results=i,this.length=i.length,this.last=i[this.length-1],this.first=i[0])}notifyOnChanges(){this._changes!==void 0&&(this._changesDetected||!this._emitDistinctChangesOnly)&&this._changes.next(this)}onDirty(e){this._onDirty=e}setDirty(){this.dirty=!0,this._onDirty?.()}destroy(){this._changes!==void 0&&(this._changes.complete(),this._changes.unsubscribe())}[Symbol.iterator]=zR};function kS(n){return(n.flags&128)===128}var _v=(function(n){return n[n.OnPush=0]="OnPush",n[n.Eager=1]="Eager",n[n.Default=1]="Default",n})(_v||{}),US=new Map,GR=0;function jR(){return GR++}function WR(n){US.set(n[yr],n)}function By(n){US.delete(n[yr])}var BM="__ngContext__";function ta(n,e){vr(e)?(n[BM]=e[yr],WR(e)):n[BM]=e}function BS(n){return HS(n[Go])}function VS(n){return HS(n[ai])}function HS(n){for(;n!==null&&!Mi(n);)n=n[ai];return n}var Vy;function $R(n){Vy=n}function zS(){if(Vy!==void 0)return Vy;if(typeof document<"u")return document;throw new Fe(210,!1)}var qR=new Be("",{factory:()=>XR}),XR="ng";var GS=new Be(""),YR=new Be("",{providedIn:"platform",factory:()=>"unknown"});var jS=new Be("",{factory:()=>ve(Zr).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce")||null});var WS="r";var xv="di",bv="s";var $S=!1,qS=new Be("",{factory:()=>$S});var XS=new Be("");var VM=new WeakMap;function ZR(n,e){if(n==null||typeof n!="object")return;let t=VM.get(n);t||(t=new WeakSet,VM.set(n,t)),t.add(e)}var JR=(n,e,t,i)=>{};function KR(n,e,t,i){JR(n,e,t,i)}var YS=new Be("");function Mv(n){return(n.flags&32)===32}var QR=()=>null;function ZS(n,e,t=!1){return QR(n,e,t)}function Sv(n){return n.get(XS,!1,{optional:!0})}function JS(n,e){let t=n.contentQueries;if(t!==null){let i=ke(null);try{for(let r=0;r<t.length;r+=2){let s=t[r],o=t[r+1];if(o!==-1){let a=n.data[o];Qc(s),a.contentQueries(2,e[o],o)}}}finally{ke(i)}}}function Hy(n,e,t){Qc(0);let i=ke(null);try{e(n,t)}finally{ke(i)}}function Ev(n,e,t){if(Kg(e)){let i=ke(null);try{let r=e.directiveStart,s=e.directiveEnd;for(let o=r;o<s;o++){let a=n.data[o];if(a.contentQueries){let c=t[o];a.contentQueries(1,c,o)}}}finally{ke(i)}}}var qs=(function(n){return n[n.Emulated=0]="Emulated",n[n.None=2]="None",n[n.ShadowDom=3]="ShadowDom",n[n.ExperimentalIsolatedShadowDom=4]="ExperimentalIsolatedShadowDom",n})(qs||{});var eN="svg",tN="math",nN={"http://www.w3.org/2000/svg":eN,"http://www.w3.org/1998/Math/MathML":tN},rf;function iN(){if(rf===void 0&&(rf=null,Hi.trustedTypes))try{rf=Hi.trustedTypes.createPolicy("angular",{createHTML:n=>n,createScript:n=>n,createScriptURL:n=>n})}catch(n){}return rf}function If(n){return iN()?.createHTML(n)||n}var sf;function rN(){if(sf===void 0&&(sf=null,Hi.trustedTypes))try{sf=Hi.trustedTypes.createPolicy("angular#unsafe-bypass",{createHTML:n=>n,createScript:n=>n,createScriptURL:n=>n})}catch(n){}return sf}function HM(n){return rN()?.createHTML(n)||n}var bf=class{changingThisBreaksApplicationSecurity;constructor(e){this.changingThisBreaksApplicationSecurity=e}toString(){return`SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${Fd})`}};function vl(n){return n instanceof bf?n.changingThisBreaksApplicationSecurity:n}function KS(n,e){let t=QS(n);if(t!=null&&t!==e){if(t==="ResourceURL"&&e==="URL")return!0;throw new Error(`Required a safe ${e}, got a ${t} (see ${Fd})`)}return t===e}function QS(n){return n instanceof bf&&n.getTypeName()||null}function sN(n){let e=new Gy(n);return oN()?new zy(e):e}var zy=class{inertDocumentHelper;constructor(e){this.inertDocumentHelper=e}getInertBodyElement(e){e="<body><remove></remove>"+e;try{let t=new window.DOMParser().parseFromString(If(e),"text/html").body;return t===null?this.inertDocumentHelper.getInertBodyElement(e):(t.firstChild?.remove(),t)}catch(t){return null}}},Gy=class{defaultDoc;inertDocument;constructor(e){this.defaultDoc=e,this.inertDocument=this.defaultDoc.implementation.createHTMLDocument("sanitization-inert")}getInertBodyElement(e){let t=this.inertDocument.createElement("template");return t.innerHTML=If(e),t}};function oN(){try{return!!new window.DOMParser().parseFromString(If(""),"text/html")}catch(n){return!1}}var aN=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;function eE(n){return n=String(n),n.match(aN)?n:"unsafe:"+n}function br(n){let e={};for(let t of n.split(","))e[t]=!0;return e}function _l(...n){let e={};for(let t of n)for(let i in t)t.hasOwnProperty(i)&&(e[i]=!0);return e}var tE=br("area,br,col,hr,img,wbr"),nE=br("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),iE=br("rp,rt"),cN=_l(iE,nE),lN=_l(nE,br("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul")),uN=_l(iE,br("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video")),zM=_l(tE,lN,uN,cN),rE=br("background,cite,href,itemtype,longdesc,poster,src,xlink:href"),dN=br("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width"),fN=br("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext"),hN=_l(rE,dN,fN),pN=br("script,style,template"),jy=class{sanitizedSomething=!1;buf=[];sanitizeChildren(e){let t=e.firstChild,i=!0,r=[];for(;t;){if(t.nodeType===Node.ELEMENT_NODE?i=this.startElement(t):t.nodeType===Node.TEXT_NODE?this.chars(t.nodeValue):this.sanitizedSomething=!0,i&&t.firstChild){r.push(t),t=yN(t);continue}for(;t;){t.nodeType===Node.ELEMENT_NODE&&this.endElement(t);let s=gN(t);if(s){t=s;break}t=r.pop()}}return this.buf.join("")}startElement(e){let t=GM(e).toLowerCase();if(!zM.hasOwnProperty(t))return this.sanitizedSomething=!0,!pN.hasOwnProperty(t);this.buf.push("<"),this.buf.push(t);let i=e.attributes;for(let r=0;r<i.length;r++){let s=i.item(r),o=s.name,a=o.toLowerCase();if(!hN.hasOwnProperty(a)){this.sanitizedSomething=!0;continue}let c=s.value;rE[a]&&(c=eE(c)),this.buf.push(" ",o,'="',jM(c),'"')}return this.buf.push(">"),!0}endElement(e){let t=GM(e).toLowerCase();zM.hasOwnProperty(t)&&!tE.hasOwnProperty(t)&&(this.buf.push("</"),this.buf.push(t),this.buf.push(">"))}chars(e){this.buf.push(jM(e))}};function mN(n,e){return(n.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_CONTAINED_BY)!==Node.DOCUMENT_POSITION_CONTAINED_BY}function gN(n){let e=n.nextSibling;if(e&&n!==e.previousSibling)throw sE(e);return e}function yN(n){let e=n.firstChild;if(e&&mN(n,e))throw sE(e);return e}function GM(n){let e=n.nodeName;return typeof e=="string"?e:"FORM"}function sE(n){return new Error(`Failed to sanitize html because the element is clobbered: ${n.outerHTML}`)}var vN=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,_N=/([^\#-~ |!])/g;function jM(n){return n.replace(/&/g,"&amp;").replace(vN,function(e){let t=e.charCodeAt(0),i=e.charCodeAt(1);return"&#"+((t-55296)*1024+(i-56320)+65536)+";"}).replace(_N,function(e){return"&#"+e.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}var of;function oE(n,e){let t=null;try{of=of||sN(n);let i=e?String(e):"";t=of.getInertBodyElement(i);let r=5,s=i;do{if(r===0)throw new Error("Failed to sanitize html because the input is unstable");r--,i=s,s=t.innerHTML,t=of.getInertBodyElement(i)}while(i!==s);let a=new jy().sanitizeChildren(WM(t)||t);return If(a)}finally{if(t){let i=WM(t)||t;for(;i.firstChild;)i.firstChild.remove()}}}function WM(n){return"content"in n&&xN(n)?n.content:null}function xN(n){return n.nodeType===Node.ELEMENT_NODE&&n.nodeName==="TEMPLATE"}var bN=/^>|^->|<!--|-->|--!>|<!-$/g,MN=/(<|>)/g,SN="\u200B$1\u200B";function EN(n){return n.replace(bN,e=>e.replace(MN,SN))}function wN(n,e){return n.createText(e)}function TN(n,e,t){n.setValue(e,t)}function CN(n,e){return n.createComment(EN(e))}function aE(n,e,t){return n.createElement(e,t)}function Mf(n,e,t,i,r){n.insertBefore(e,t,i,r)}function cE(n,e,t){n.appendChild(e,t)}function $M(n,e,t,i,r){i!==null?Mf(n,e,t,i,r):cE(n,e,t)}function lE(n,e,t,i){n.removeChild(null,e,t,i)}function DN(n,e,t){n.setAttribute(e,"style",t)}function AN(n,e,t){t===""?n.removeAttribute(e,"class"):n.setAttribute(e,"class",t)}function uE(n,e,t){let{mergedAttrs:i,classes:r,styles:s}=t;i!==null&&IR(n,e,i),r!==null&&AN(n,e,r),s!==null&&DN(n,e,s)}function IN(n,e=!0){if(n[0]!=":")return[null,n];let t=n.indexOf(":",1);if(t===-1){if(e)throw new Error(`Unsupported format "${n}" expecting ":namespace:name"`);return[null,n]}return[n.slice(1,t),n.slice(t+1)]}function RN(n,e,t){if(e!==void 0&&t!==void 0&&PN(e,t)!==Vn.HTML)return n;let i=NN();return i?HM(i.sanitize(Vn.HTML,n)||""):KS(n,"HTML")?HM(vl(n)):oE(zS(),gr(n))}function NN(){let n=Re();return n&&n[bi].sanitizer}function PN(n,e){let[t,i]=FN(n);return sM(i,e,t)}function FN(n){n=n.toLowerCase();let e=IN(n,!1);if(e[0])return e;let i=Yn()===-1?null:Xo(),r=i?.namespace;if(n==="#host"&&i?.type===2){let s=ui(i,Re());if(s.tagName&&(n=s.tagName.toLowerCase()),r==null){let o=s.namespaceURI;r=o&&nN[o]}}return[r,n]}function wv(n){return n.ownerDocument}function ON(n,e,t){let i=n.length;for(;;){let r=n.indexOf(e,t);if(r===-1)return r;if(r===0||n.charCodeAt(r-1)<=32){let s=e.length;if(r+s===i||n.charCodeAt(r+s)<=32)return r}t=r+1}}var dE="ng-template";function LN(n,e,t,i){let r=0;if(i){for(;r<e.length&&typeof e[r]=="string";r+=2)if(e[r]==="class"&&ON(e[r+1].toLowerCase(),t,0)!==-1)return!0}else if(Tv(n))return!1;if(r=e.indexOf(1,r),r>-1){let s;for(;++r<e.length&&typeof(s=e[r])=="string";)if(s.toLowerCase()===t)return!0}return!1}function Tv(n){return n.type===4&&n.value!==dE}function kN(n,e,t){let i=n.type===4&&!t?dE:n.value;return e===i}function UN(n,e,t){let i=4,r=n.attrs,s=r!==null?HN(r):0,o=!1;for(let a=0;a<e.length;a++){let c=e[a];if(typeof c=="number"){if(!o&&!Si(i)&&!Si(c))return!1;if(o&&Si(c))continue;o=!1,i=c|i&1;continue}if(!o)if(i&4){if(i=2|i&1,c!==""&&!kN(n,c,t)||c===""&&e.length===1){if(Si(i))return!1;o=!0}}else if(i&8){if(r===null||!LN(n,r,c,t)){if(Si(i))return!1;o=!0}}else{let l=e[++a],u=BN(c,r,Tv(n),t);if(u===-1){if(Si(i))return!1;o=!0;continue}if(l!==""){let d;if(u>s?d="":d=r[u+1].toLowerCase(),i&2&&l!==d){if(Si(i))return!1;o=!0}}}}return Si(i)||o}function Si(n){return(n&1)===0}function BN(n,e,t,i){if(e===null)return-1;let r=0;if(i||!t){let s=!1;for(;r<e.length;){let o=e[r];if(o===n)return r;if(o===3||o===6)s=!0;else if(o===1||o===2){let a=e[++r];for(;typeof a=="string";)a=e[++r];continue}else{if(o===4)break;if(o===0){r+=4;continue}}r+=s?1:2}return-1}else return zN(e,n)}function VN(n,e,t=!1){for(let i=0;i<e.length;i++)if(UN(n,e[i],t))return!0;return!1}function HN(n){for(let e=0;e<n.length;e++){let t=n[e];if(RR(t))return e}return n.length}function zN(n,e){let t=n.indexOf(4);if(t>-1)for(t++;t<n.length;){let i=n[t];if(typeof i=="number")return-1;if(i===e)return t;t++}return-1}function qM(n,e){return n?":not("+e.trim()+")":e}function GN(n){let e=n[0],t=1,i=2,r="",s=!1;for(;t<n.length;){let o=n[t];if(typeof o=="string")if(i&2){let a=n[++t];r+="["+o+(a.length>0?'="'+a+'"':"")+"]"}else i&8?r+="."+o:i&4&&(r+=" "+o);else r!==""&&!Si(o)&&(e+=qM(s,r),r=""),i=o,s=s||!Si(i);t++}return r!==""&&(e+=qM(s,r)),e}function jN(n){return n.map(GN).join(",")}function WN(n){let e=[],t=[],i=1,r=2;for(;i<n.length;){let s=n[i];if(typeof s=="string")r===2?s!==""&&e.push(s,n[++i]):r===8&&t.push(s);else{if(!Si(r))break;r=s}i++}return t.length&&e.push(1,...t),e}var _n={};function Cv(n,e,t,i,r,s,o,a,c,l,u){let d=bt+i,f=d+r,h=$N(d,f),p=typeof l=="function"?l():l;return h[xe]={type:n,blueprint:h,template:t,queries:null,viewQuery:a,declTNode:e,data:h.slice().fill(null,d),bindingStartIndex:d,expandoStartIndex:f,hostBindingOpCodes:null,firstCreatePass:!0,firstUpdatePass:!0,staticViewQueries:!1,staticContentQueries:!1,preOrderHooks:null,preOrderCheckHooks:null,contentHooks:null,contentCheckHooks:null,viewHooks:null,viewCheckHooks:null,destroyHooks:null,cleanup:null,contentQueries:null,components:null,directiveRegistry:typeof s=="function"?s():s,pipeRegistry:typeof o=="function"?o():o,firstChild:null,schemas:c,consts:p,incompleteFirstPass:!1,ssrId:u}}function $N(n,e){let t=[];for(let i=0;i<e;i++)t.push(i<n?null:_n);return t}function qN(n){let e=n.tView;return e===null||e.incompleteFirstPass?n.tView=Cv(1,null,n.template,n.decls,n.vars,n.directiveDefs,n.pipeDefs,n.viewQuery,n.schemas,n.consts,n.id):e}function Dv(n,e,t,i,r,s,o,a,c,l,u){let d=e.blueprint.slice();return d[xi]=r,d[Ve]=i|4|128|8|64|1024,(l!==null||n&&n[Ve]&2048)&&(d[Ve]|=2048),ty(d),d[jt]=d[Bs]=n,d[Vt]=t,d[bi]=o||n&&n[bi],d[xt]=a||n&&n[xt],d[An]=c||n&&n[An]||null,d[ci]=s,d[yr]=jR(),d[Ho]=u,d[Jg]=l,d[qn]=e.type==2?n[qn]:d,d}function XN(n,e,t){let i=ui(e,n),r=qN(t),s=n[bi].rendererFactory,o=Av(n,Dv(n,r,null,fE(t),i,e,null,s.createRenderer(i,t),null,null,null));return n[e.index]=o}function fE(n){let e=16;return n.signals?e=4096:n.onPush&&(e=64),e}function hE(n,e,t,i){if(t===0)return-1;let r=e.length;for(let s=0;s<t;s++)e.push(i),n.blueprint.push(i),n.data.push(null);return r}function Av(n,e){return n[Go]?n[Zg][ai]=e:n[Go]=e,n[Zg]=e,e}function zn(n=1){pE(Mt(),Re(),Yn()+n,!1)}function pE(n,e,t,i){if(!i)if((e[Ve]&3)===3){let s=n.preOrderCheckHooks;s!==null&&lf(e,s,t)}else{let s=n.preOrderHooks;s!==null&&uf(e,s,0,t)}Yr(t)}var Rf=(function(n){return n[n.None=0]="None",n[n.SignalBased=1]="SignalBased",n[n.HasDecoratorInputTransform=2]="HasDecoratorInputTransform",n})(Rf||{});function Wy(n,e,t,i){let r=ke(null);try{let[s,o,a]=n.inputs[t],c=null;(o&Rf.SignalBased)!==0&&(c=e[s][gn]),c!==null&&c.transformFn!==void 0?i=c.transformFn(i):a!==null&&(i=a.call(e,i)),n.setInput!==null?n.setInput(e,c,i,t,s):bS(e,c,s,i)}finally{ke(r)}}var na=(function(n){return n[n.Important=1]="Important",n[n.DashCase=2]="DashCase",n})(na||{}),YN;function Iv(n,e){return YN(n,e)}var eq=typeof document<"u"&&typeof document?.documentElement?.getAnimations=="function";var $y=new WeakMap,il=new WeakSet;function ZN(n,e){let t=$y.get(n);if(!t||t.length===0)return;let i=e.parentNode,r=e.previousSibling;for(let s=t.length-1;s>=0;s--){let o=t[s],a=o.parentNode;o===e?(t.splice(s,1),il.add(o),o.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}}))):(r&&o===r||a&&i&&a!==i)&&(t.splice(s,1),o.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}})),o.parentNode?.removeChild(o))}}function JN(n,e){let t=$y.get(n);t?t.includes(e)||t.push(e):$y.set(n,[e])}var cl=new Set,Nf=(function(n){return n[n.CHANGE_DETECTION=0]="CHANGE_DETECTION",n[n.AFTER_NEXT_RENDER=1]="AFTER_NEXT_RENDER",n})(Nf||{}),es=new Be(""),XM=new Set;function qi(n){XM.has(n)||(XM.add(n),performance?.mark?.("mark_feature_usage",{detail:{feature:n}}))}var Rv=(()=>{class n{impl=null;execute(){this.impl?.execute()}static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new n})}return n})(),mE=[0,1,2,3],gE=(()=>{class n{ngZone=ve(Bt);scheduler=ve(mr);errorHandler=ve(Ls,{optional:!0});sequences=new Set;deferredRegistrations=new Set;executing=!1;constructor(){ve(es,{optional:!0})}execute(){let t=this.sequences.size>0;t&&ct(it.AfterRenderHooksStart),this.executing=!0;for(let i of mE)for(let r of this.sequences)if(!(r.erroredOrDestroyed||!r.hooks[i]))try{r.pipelinedValue=this.ngZone.runOutsideAngular(()=>this.maybeTrace(()=>{let s=r.hooks[i];return s(r.pipelinedValue)},r.snapshot))}catch(s){r.erroredOrDestroyed=!0,this.errorHandler?.handleError(s)}this.executing=!1;for(let i of this.sequences)i.afterRun(),i.once&&(this.sequences.delete(i),i.destroy());for(let i of this.deferredRegistrations)this.sequences.add(i);this.deferredRegistrations.size>0&&this.scheduler.notify(7),this.deferredRegistrations.clear(),t&&ct(it.AfterRenderHooksEnd)}register(t){let{view:i}=t;i!==void 0?((i[Hs]??=[]).push(t),qo(i),i[Ve]|=8192):this.executing?this.deferredRegistrations.add(t):this.addSequence(t)}addSequence(t){this.sequences.add(t),this.scheduler.notify(7)}unregister(t){this.executing&&this.sequences.has(t)?(t.erroredOrDestroyed=!0,t.pipelinedValue=void 0,t.once=!0):(this.sequences.delete(t),this.deferredRegistrations.delete(t))}maybeTrace(t,i){return i?i.run(Nf.AFTER_NEXT_RENDER,t):t()}static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new n})}return n})(),Sf=class{impl;hooks;view;once;snapshot;erroredOrDestroyed=!1;pipelinedValue=void 0;unregisterOnDestroy;constructor(e,t,i,r,s,o=null){this.impl=e,this.hooks=t,this.view=i,this.once=r,this.snapshot=o,this.unregisterOnDestroy=s?.onDestroy(()=>this.destroy())}afterRun(){this.erroredOrDestroyed=!1,this.pipelinedValue=void 0,this.snapshot?.dispose(),this.snapshot=null}destroy(){this.impl.unregister(this),this.unregisterOnDestroy?.();let e=this.view?.[Hs];e&&(this.view[Hs]=e.filter(t=>t!==this))}};function Nv(n,e){let t=e?.injector??ve(_i);return qi("NgAfterNextRender"),QN(n,t,e,!0)}function KN(n){return n instanceof Function?[void 0,void 0,n,void 0]:[n.earlyRead,n.write,n.mixedReadWrite,n.read]}function QN(n,e,t,i){let r=e.get(Rv);r.impl??=e.get(gE);let s=e.get(es,null,{optional:!0}),o=t?.manualCleanup!==!0?e.get(Jr):null,a=e.get(tf,null,{optional:!0}),c=new Sf(r.impl,KN(n),a?.view,i,o,s?.snapshot(null));return r.impl.register(c),c}var yE=new Be("",{factory:()=>({queue:new Set,isScheduled:!1,scheduler:null,injector:ve(vn)})});function vE(n,e,t){let i=n.get(yE);if(Array.isArray(e))for(let r of e)i.queue.add(r),t?.detachedLeaveAnimationFns?.push(r);else i.queue.add(e),t?.detachedLeaveAnimationFns?.push(e);i.scheduler&&i.scheduler(n)}function eP(n,e){let t=n.get(yE);if(e.detachedLeaveAnimationFns){for(let i of e.detachedLeaveAnimationFns)t.queue.delete(i);e.detachedLeaveAnimationFns=void 0}}function tP(n,e){for(let[t,i]of e)vE(n,i.animateFns)}function YM(n,e,t,i){let r=n?.[jr]?.enter;e!==null&&r&&r.has(t.index)&&tP(i,r)}function Zo(n,e,t,i,r,s,o,a){if(r!=null){let c,l=!1;Mi(r)?c=r:vr(r)&&(l=!0,r=r[xi]);let u=li(r);n===0&&i!==null?(YM(a,i,s,t),o==null?cE(e,i,u):Mf(e,i,u,o||null,!0)):n===1&&i!==null?(YM(a,i,s,t),Mf(e,i,u,o||null,!0),ZN(s,u)):n===2?(a?.[jr]?.leave?.has(s.index)&&JN(s,u),il.delete(u),ZM(a,s,t,d=>{if(il.has(u)){il.delete(u);return}lE(e,u,l,d)})):n===3&&(il.delete(u),ZM(a,s,t,()=>{e.destroyNode(u)})),c!=null&&pP(e,n,t,c,s,i,o)}}function nP(n,e){_E(n,e),e[xi]=null,e[ci]=null}function iP(n,e,t,i,r,s){i[xi]=r,i[ci]=e,Ff(n,i,t,1,r,s)}function _E(n,e){e[bi].changeDetectionScheduler?.notify(9),Ff(n,e,e[xt],2,null,null)}function rP(n){let e=n[Go];if(!e)return wy(n[xe],n);for(;e;){let t=null;if(vr(e))t=e[Go];else{let i=e[Ft];i&&(t=i)}if(!t){for(;e&&!e[ai]&&e!==n;)vr(e)&&wy(e[xe],e),e=e[jt];e===null&&(e=n),vr(e)&&wy(e[xe],e),t=e&&e[ai]}e=t}}function Pv(n,e){let t=n[zs],i=t.indexOf(e);t.splice(i,1)}function Pf(n,e){if(qr(e))return;let t=e[xt];t.destroyNode&&Ff(n,e,t,3,null,null),rP(e)}function wy(n,e){if(qr(e))return;let t=ke(null);try{e[Ve]&=-129,e[Ve]|=256,e[Xn]&&Ed(e[Xn]),aP(n,e),oP(n,e),e[xe].type===1&&e[xt].destroy();let i=e[Gr];if(i!==null&&Mi(e[jt])){i!==e[jt]&&Pv(i,e);let r=e[Gi];r!==null&&r.detachView(n)}By(e)}finally{ke(t)}}function ZM(n,e,t,i){let r=n?.[jr];if(r==null||r.leave==null||!r.leave.has(e.index))return i(!1);n&&cl.add(n[yr]),vE(t,()=>{if(r.leave&&r.leave.has(e.index)){let o=r.leave.get(e.index),a=[];if(o){for(let c=0;c<o.animateFns.length;c++){let l=o.animateFns[c],{promise:u}=l();a.push(u)}r.detachedLeaveAnimationFns=void 0}r.running=Promise.allSettled(a),sP(n,i)}else n&&cl.delete(n[yr]),i(!1)},r)}function sP(n,e){let t=n[jr]?.running;if(t){t.then(()=>{n[jr].running=void 0,cl.delete(n[yr]),e(!0)});return}e(!1)}function oP(n,e){let t=n.cleanup,i=e[zo];if(t!==null)for(let o=0;o<t.length-1;o+=2)if(typeof t[o]=="string"){let a=t[o+3];a>=0?i[a]():i[-a].unsubscribe(),o+=2}else{let a=i[t[o+1]];t[o].call(a)}i!==null&&(e[zo]=null);let r=e[pr];if(r!==null){e[pr]=null;for(let o=0;o<r.length;o++){let a=r[o];a()}}let s=e[$c];if(s!==null){e[$c]=null;for(let o of s)o.destroy()}}function aP(n,e){let t;if(n!=null&&(t=n.destroyHooks)!=null)for(let i=0;i<t.length;i+=2){let r=e[t[i]];if(!(r instanceof $s)){let s=t[i+1];if(Array.isArray(s))for(let o=0;o<s.length;o+=2){let a=r[s[o]],c=s[o+1];ct(it.LifecycleHookStart,a,c);try{c.call(a)}finally{ct(it.LifecycleHookEnd,a,c)}}else{ct(it.LifecycleHookStart,r,s);try{s.call(r)}finally{ct(it.LifecycleHookEnd,r,s)}}}}}function cP(n,e,t){return lP(n,e.parent,t)}function lP(n,e,t){let i=e;for(;i!==null&&i.type&168;)e=i,i=e.parent;if(i===null)return t[xi];if(_r(i)){let{encapsulation:r}=n.data[i.directiveStart+i.componentOffset];if(r===qs.None||r===qs.Emulated)return null}return ui(i,t)}function uP(n,e,t){return fP(n,e,t)}function dP(n,e,t){return n.type&40?ui(n,t):null}var fP=dP,JM;function Fv(n,e,t,i){let r=cP(n,i,e),s=e[xt],o=i.parent||e[ci],a=uP(o,i,e);if(r!=null)if(Array.isArray(t))for(let c=0;c<t.length;c++)$M(s,r,t[c],a,!1);else $M(s,r,t,a,!1);JM!==void 0&&JM(s,i,e,t,r)}function rl(n,e){if(e!==null){let t=e.type;if(t&3)return ui(e,n);if(t&4)return qy(-1,n[e.index]);if(t&8){let i=e.child;if(i!==null)return rl(n,i);{let r=n[e.index];return Mi(r)?qy(-1,r):li(r)}}else{if(t&128)return rl(n,e.next);if(t&32)return Iv(e,n)()||li(n[e.index]);{let i=xE(n,e);if(i!==null){if(Array.isArray(i))return i[0];let r=Br(n[qn]);return rl(r,i)}else return rl(n,e.next)}}}return null}function xE(n,e){if(e!==null){let i=n[qn][ci],r=e.projection;return i.projection[r]}return null}function qy(n,e){let t=Ft+n+1;if(t<e.length){let i=e[t],r=i[xe].firstChild;if(r!==null)return rl(i,r)}return e[$r]}function Ov(n,e,t,i,r,s,o){for(;t!=null;){let a=i[An];if(t.type===128){t=t.next;continue}let c=i[t.index],l=t.type;if(o&&e===0&&(c&&ta(li(c),i),t.flags|=2),!Mv(t))if(l&8)Ov(n,e,t.child,i,r,s,!1),Zo(e,n,a,r,c,t,s,i);else if(l&32){let u=Iv(t,i),d;for(;d=u();)Zo(e,n,a,r,d,t,s,i);Zo(e,n,a,r,c,t,s,i)}else l&16?hP(n,e,i,t,r,s):Zo(e,n,a,r,c,t,s,i);t=o?t.projectionNext:t.next}}function Ff(n,e,t,i,r,s){Ov(t,i,n.firstChild,e,r,s,!1)}function hP(n,e,t,i,r,s){let o=t[qn],c=o[ci].projection[i.projection];if(Array.isArray(c))for(let l=0;l<c.length;l++){let u=c[l];Zo(e,n,t[An],r,u,i,s,t)}else{let l=c,u=o[jt];kS(i)&&(l.flags|=128),Ov(n,e,l,u,r,s,!0)}}function pP(n,e,t,i,r,s,o){let a=i[$r],c=li(i);a!==c&&Zo(e,n,t,s,a,r,o);for(let l=Ft;l<i.length;l++){let u=i[l];Ff(u[xe],u,n,e,s,a)}}function mP(n,e,t,i,r){if(e)r?n.addClass(t,i):n.removeClass(t,i);else{let s=i.indexOf("-")===-1?void 0:na.DashCase;r==null?n.removeStyle(t,i,s):(typeof r=="string"&&r.endsWith("!important")&&(r=r.slice(0,-10),s|=na.Important),n.setStyle(t,i,r,s))}}function bE(n,e,t,i,r){let s=Yn(),o=i&2;try{Yr(-1),o&&e.length>bt&&pE(n,e,bt,!1);let a=o?it.TemplateUpdateStart:it.TemplateCreateStart;ct(a,r,t),t(i,r)}finally{Yr(s);let a=o?it.TemplateUpdateEnd:it.TemplateCreateEnd;ct(a,r,t)}}function Of(n,e,t){bP(n,e,t),(t.flags&64)===64&&MP(n,e,t)}function xl(n,e,t=ui){let i=e.localNames;if(i!==null){let r=e.index+1;for(let s=0;s<i.length;s+=2){let o=i[s+1],a=o===-1?t(e,n):n[o];n[r++]=a}}}function gP(n,e,t,i){let s=i.get(qS,$S)||t===qs.ShadowDom||t===qs.ExperimentalIsolatedShadowDom,o=n.selectRootElement(e,s);return yP(o),o}function yP(n){vP(n)}var vP=()=>null;function _P(n){return n==="class"?"className":n==="for"?"htmlFor":n==="formaction"?"formAction":n==="innerHtml"?"innerHTML":n==="readonly"?"readOnly":n==="tabindex"?"tabIndex":n}function ME(n,e,t,i,r,s){let o=e[xe];if(Vv(n,o,e,t,i)){_r(n)&&xP(e,n.index);return}n.type&3&&(t=_P(t)),SE(n,e,t,i,r,s)}function SE(n,e,t,i,r,s){if(n.type&3){let o=ui(n,e);i=s!=null?s(i,n.value||"",t):i,r.setProperty(o,t,i)}else n.type&12}function xP(n,e){let t=di(e,n);t[Ve]&16||(t[Ve]|=64)}function bP(n,e,t){let i=t.directiveStart,r=t.directiveEnd;_r(t)&&XN(e,t,n.data[i+t.componentOffset]),n.firstCreatePass||_f(t,e);let s=t.initialInputs;for(let o=i;o<r;o++){let a=n.data[o],c=al(e,n,o,t);if(ta(c,e),s!==null&&TP(e,o-i,c,a,t,s),ji(a)){let l=di(t.index,e);l[Vt]=al(e,n,o,t)}}}function MP(n,e,t){let i=t.directiveStart,r=t.directiveEnd,s=t.index,o=_M();try{Yr(s);for(let a=i;a<r;a++){let c=n.data[a],l=e[a];Zd(a),(c.hostBindings!==null||c.hostVars!==0||c.hostAttrs!==null)&&SP(c,l)}}finally{Yr(-1),Zd(o)}}function SP(n,e){n.hostBindings!==null&&n.hostBindings(1,e)}function Lv(n,e){let t=n.directiveRegistry,i=null;if(t)for(let r=0;r<t.length;r++){let s=t[r];VN(e,s.selectors,!1)&&(i??=[],ji(s)?i.unshift(s):i.push(s))}return i}function EP(n,e,t,i,r,s){let o=ui(n,e);wP(e[xt],o,s,n.value,t,i,r)}function wP(n,e,t,i,r,s,o){if(s==null)n.removeAttribute(e,r,t);else{let a=o==null?gr(s):o(s,i||"",r);n.setAttribute(e,r,a,t)}}function TP(n,e,t,i,r,s){let o=s[e];if(o!==null)for(let a=0;a<o.length;a+=2){let c=o[a],l=o[a+1];Wy(i,t,c,l)}}function kv(n,e,t,i,r){let s=bt+t,o=e[xe],a=r(o,e,n,i,t);e[s]=a,Gs(n,!0);let c=n.type===2;return c?(uE(e[xt],a,n),(uM()===0||jo(n))&&ta(a,e),dM()):ta(a,e),ef()&&(!c||!Mv(n))&&Fv(o,e,a,n),n}function Uv(n){let e=n;return uy()?pM():(e=e.parent,Gs(e,!1)),e}function Bv(n,e){let t=n[An];if(!t)return;let i;try{i=t.get(Wi,null)}catch(r){i=null}i?.(e)}function Vv(n,e,t,i,r){let s=n.inputs?.[i],o=n.hostDirectiveInputs?.[i],a=!1;if(o)for(let c=0;c<o.length;c+=2){let l=o[c],u=o[c+1],d=e.data[l];Wy(d,t[l],u,r),a=!0}if(s)for(let c of s){let l=t[c],u=e.data[c];Wy(u,l,i,r),a=!0}return a}function CP(n,e){let t=di(e,n),i=t[xe];DP(i,t);let r=t[xi];r!==null&&t[Ho]===null&&(t[Ho]=ZS(r,t[An])),ct(it.ComponentStart);try{Hv(i,t,t[Vt])}finally{ct(it.ComponentEnd,t[Vt])}}function DP(n,e){for(let t=e.length;t<n.blueprint.length;t++)e.push(n.blueprint[t])}function Hv(n,e,t){Kd(e);try{let i=n.viewQuery;i!==null&&Hy(1,i,t);let r=n.template;r!==null&&bE(n,e,r,1,t),n.firstCreatePass&&(n.firstCreatePass=!1),e[Gi]?.finishViewCreation(n),n.staticContentQueries&&JS(n,e),n.staticViewQueries&&Hy(2,n.viewQuery,t);let s=n.components;s!==null&&AP(e,s)}catch(i){throw n.firstCreatePass&&(n.incompleteFirstPass=!0,n.firstCreatePass=!1),i}finally{e[Ve]&=-5,Qd()}}function AP(n,e){for(let t=0;t<e.length;t++)CP(n,e[t])}function bl(n,e,t,i){let r=ke(null);try{let s=e.tView,a=n[Ve]&4096?4096:16,c=Dv(n,s,t,a,null,e,null,null,i?.injector??null,i?.embeddedViewInjector??null,i?.dehydratedView??null),l=n[e.index];c[Gr]=l;let u=n[Gi];return u!==null&&(c[Gi]=u.createEmbeddedView(s)),Hv(s,c,t),c}finally{ke(r)}}function ia(n,e){return!e||e.firstChild===null||kS(n)}function ll(n,e,t,i,r=!1){for(;t!==null;){if(t.type===128){t=r?t.projectionNext:t.next;continue}let s=e[t.index];s!==null&&i.push(li(s)),Mi(s)&&EE(s,i);let o=t.type;if(o&8)ll(n,e,t.child,i);else if(o&32){let a=Iv(t,e),c;for(;c=a();)i.push(c)}else if(o&16){let a=xE(e,t);if(Array.isArray(a))i.push(...a);else{let c=Br(e[qn]);ll(c[xe],c,a,i,!0)}}t=r?t.projectionNext:t.next}return i}function EE(n,e){for(let t=Ft;t<n.length;t++){let i=n[t],r=i[xe].firstChild;r!==null&&ll(i[xe],i,r,e)}n[$r]!==n[xi]&&e.push(n[$r])}function wE(n){if(n[Hs]!==null){for(let e of n[Hs])e.impl.addSequence(e);n[Hs].length=0}}var TE=[];function IP(n){return n[Xn]??RP(n)}function RP(n){let e=TE.pop()??Object.create(PP);return e.lView=n,e}function NP(n){n.lView[Xn]!==n&&(n.lView=null,TE.push(n))}var PP=st(Ae({},Oo),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:n=>{qo(n.lView)},consumerOnSignalRead(){this.lView[Xn]=this}});function FP(n){let e=n[Xn]??Object.create(OP);return e.lView=n,e}var OP=st(Ae({},Oo),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:n=>{let e=Br(n.lView);for(;e&&!CE(e[xe]);)e=Br(e);e&&ny(e)},consumerOnSignalRead(){this.lView[Xn]=this}});function CE(n){return n.type!==2}function DE(n){if(n[$c]===null)return;let e=!0;for(;e;){let t=!1;for(let i of n[$c])i.dirty&&(t=!0,i.zone===null||Zone.current===i.zone?i.run():i.zone.run(()=>i.run()));e=t&&!!(n[Ve]&8192)}}var LP=100;function AE(n,e=0){let i=n[bi].rendererFactory,r=!1;r||i.begin?.();try{kP(n,e)}finally{r||i.end?.()}}function kP(n,e){let t=fy();try{hy(!0),Xy(n,e);let i=0;for(;Yc(n);){if(i===LP)throw new Fe(103,!1);i++,Xy(n,1)}}finally{hy(t)}}function UP(n,e,t,i){if(qr(e))return;let r=e[Ve],s=!1,o=!1;Kd(e);let a=!0,c=null,l=null;s||(CE(n)?(l=IP(e),c=Rc(l)):xd()===null?(a=!1,l=FP(e),c=Rc(l)):e[Xn]&&(Ed(e[Xn]),e[Xn]=null));try{ty(e),gM(n.bindingStartIndex),t!==null&&bE(n,e,t,2,i);let u=(r&3)===3;if(!s)if(u){let h=n.preOrderCheckHooks;h!==null&&lf(e,h,null)}else{let h=n.preOrderHooks;h!==null&&uf(e,h,0,null),Sy(e,0)}if(o||BP(e),DE(e),IE(e,0),n.contentQueries!==null&&JS(n,e),!s)if(u){let h=n.contentCheckHooks;h!==null&&lf(e,h)}else{let h=n.contentHooks;h!==null&&uf(e,h,1),Sy(e,1)}HP(n,e);let d=n.components;d!==null&&NE(e,d,0);let f=n.viewQuery;if(f!==null&&Hy(2,f,i),!s)if(u){let h=n.viewCheckHooks;h!==null&&lf(e,h)}else{let h=n.viewHooks;h!==null&&uf(e,h,2),Sy(e,2)}if(n.firstUpdatePass===!0&&(n.firstUpdatePass=!1),e[jd]){for(let h of e[jd])h();e[jd]=null}s||(wE(e),e[Ve]&=-73)}catch(u){throw s||qo(e),u}finally{l!==null&&(Sd(l,c),a&&NP(l)),Qd()}}function IE(n,e){for(let t=BS(n);t!==null;t=VS(t))for(let i=Ft;i<t.length;i++){let r=t[i];RE(r,e)}}function BP(n){for(let e=BS(n);e!==null;e=VS(e)){if(!(e[Ve]&2))continue;let t=e[zs];for(let i=0;i<t.length;i++){let r=t[i];ny(r)}}}function VP(n,e,t){ct(it.ComponentStart);let i=di(e,n);try{RE(i,t)}finally{ct(it.ComponentEnd,i[Vt])}}function RE(n,e){$d(n)&&Xy(n,e)}function Xy(n,e){let i=n[xe],r=n[Ve],s=n[Xn],o=!!(e===0&&r&16);if(o||=!!(r&64&&e===0),o||=!!(r&1024),o||=!!(s?.dirty&&mg(s)),o||=!1,s&&(s.dirty=!1),n[Ve]&=-9217,o)UP(i,n,i.template,n[Vt]);else if(r&8192){let a=ke(null);try{DE(n),IE(n,1);let c=i.components;c!==null&&NE(n,c,1),wE(n)}finally{ke(a)}}}function NE(n,e,t){for(let i=0;i<e.length;i++)VP(n,e[i],t)}function HP(n,e){let t=n.hostBindingOpCodes;if(t!==null)try{for(let i=0;i<t.length;i++){let r=t[i];if(r<0)Yr(~r);else{let s=r,o=t[++i],a=t[++i];vM(o,s);let c=e[s];ct(it.HostBindingsUpdateStart,c);try{a(2,c)}finally{ct(it.HostBindingsUpdateEnd,c)}}}}finally{Yr(-1)}}function Lf(n,e){let t=fy()?64:1088;for(n[bi].changeDetectionScheduler?.notify(e);n;){n[Ve]|=t;let i=Br(n);if(Wo(n)&&!i)return n;n=i}return null}function PE(n,e,t,i){return[n,!0,0,e,null,i,null,t,null,null]}function FE(n,e){let t=Ft+e;if(t<n.length)return n[t]}function Ml(n,e,t,i=!0){let r=e[xe];if(zP(r,e,n,t),i){let o=qy(t,n),a=e[xt],c=a.parentNode(n[$r]);c!==null&&iP(r,n[ci],a,e,c,o)}let s=e[Ho];s!==null&&s.firstChild!==null&&(s.firstChild=null)}function zv(n,e){let t=ul(n,e);return t!==void 0&&Pf(t[xe],t),t}function ul(n,e){if(n.length<=Ft)return;let t=Ft+e,i=n[t];if(i){let r=i[Gr];r!==null&&r!==n&&Pv(r,i),e>0&&(n[t-1][ai]=i[ai]);let s=zc(n,Ft+e);nP(i[xe],i);let o=s[Gi];o!==null&&o.detachView(s[xe]),i[jt]=null,i[ai]=null,i[Ve]&=-129}return i}function zP(n,e,t,i){let r=Ft+i,s=t.length;i>0&&(t[r-1][ai]=e),i<s-Ft?(e[ai]=t[r],zg(t,Ft+i,e)):(t.push(e),e[ai]=null),e[jt]=t;let o=e[Gr];o!==null&&t!==o&&OE(o,e);let a=e[Gi];a!==null&&a.insertView(n),qd(e),e[Ve]|=128}function OE(n,e){let t=n[zs],i=e[jt];if(vr(i))n[Ve]|=2;else{let r=i[jt][qn];e[qn]!==r&&(n[Ve]|=2)}t===null?n[zs]=[e]:t.push(e)}var Qr=class{_lView;_cdRefInjectingView;_appRef=null;_attachedToViewContainer=!1;exhaustive;get rootNodes(){let e=this._lView,t=e[xe];return ll(t,e,t.firstChild,[])}constructor(e,t){this._lView=e,this._cdRefInjectingView=t}get context(){return this._lView[Vt]}set context(e){this._lView[Vt]=e}get destroyed(){return qr(this._lView)}destroy(){if(this._appRef)this._appRef.detachView(this);else if(this._attachedToViewContainer){let e=this._lView[jt];if(Mi(e)){let t=e[qc],i=t?t.indexOf(this):-1;i>-1&&(ul(e,i),zc(t,i))}this._attachedToViewContainer=!1}Pf(this._lView[xe],this._lView)}onDestroy(e){Xd(this._lView,e)}markForCheck(){Lf(this._cdRefInjectingView||this._lView,4)}detach(){this._lView[Ve]&=-129}reattach(){qd(this._lView),this._lView[Ve]|=128}detectChanges(){this._lView[Ve]|=1024,AE(this._lView)}checkNoChanges(){}attachToViewContainerRef(){if(this._appRef)throw new Fe(902,!1);this._attachedToViewContainer=!0}detachFromAppRef(){this._appRef=null;let e=Wo(this._lView),t=this._lView[Gr];t!==null&&!e&&Pv(t,this._lView),_E(this._lView[xe],this._lView)}attachToAppRef(e){if(this._attachedToViewContainer)throw new Fe(902,!1);this._appRef=e;let t=Wo(this._lView),i=this._lView[Gr];i!==null&&!t&&OE(i,this._lView),qd(this._lView)}};var ra=(()=>{class n{_declarationLView;_declarationTContainer;elementRef;static __NG_ELEMENT_ID__=GP;constructor(t,i,r){this._declarationLView=t,this._declarationTContainer=i,this.elementRef=r}get ssrId(){return this._declarationTContainer.tView?.ssrId||null}createEmbeddedView(t,i){return this.createEmbeddedViewImpl(t,i)}createEmbeddedViewImpl(t,i,r){let s=bl(this._declarationLView,this._declarationTContainer,t,{embeddedViewInjector:i,dehydratedView:r});return new Qr(s)}}return n})();function GP(){return kf(en(),Re())}function kf(n,e){return n.type&4?new ra(e,n,la(n,e)):null}function ua(n,e,t,i,r){let s=n.data[e];if(s===null)s=jP(n,e,t,i,r),yM()&&(s.flags|=32);else if(s.type&64){s.type=t,s.value=i,s.attrs=r;let o=hM();s.injectorIndex=o===null?-1:o.injectorIndex}return Gs(s,!0),s}function jP(n,e,t,i,r){let s=ly(),o=uy(),a=o?s:s&&s.parent,c=n.data[e]=$P(n,a,t,e,i,r);return WP(n,c,s,o),c}function WP(n,e,t,i){n.firstChild===null&&(n.firstChild=e),t!==null&&(i?t.child==null&&e.parent!==null&&(t.child=e):t.next===null&&(t.next=e,e.prev=t))}function $P(n,e,t,i,r,s){let o=e?e.injectorIndex:-1,a=0;return fM()&&(a|=128),{type:t,index:i,insertBeforeIndex:null,injectorIndex:o,directiveStart:-1,directiveEnd:-1,directiveStylingLast:-1,componentOffset:-1,controlDirectiveIndex:-1,customControlIndex:-1,propertyBindings:null,flags:a,providerIndexes:0,value:r,namespace:yy(),attrs:s,mergedAttrs:null,localNames:null,initialInputs:null,inputs:null,hostDirectiveInputs:null,outputs:null,hostDirectiveOutputs:null,directiveToIndex:null,tView:null,next:null,prev:null,projectionNext:null,child:null,parent:e,projection:null,styles:null,stylesWithoutHost:null,residualStyles:void 0,classes:null,classesWithoutHost:null,residualClasses:void 0,classBindings:0,styleBindings:0}}function qP(n){let e=n[Wr]??[],i=n[jt][xt],r=[];for(let s of e)s.data[xv]!==void 0?r.push(s):XP(s,i);n[Wr]=r}function XP(n,e){let t=0,i=n.firstChild;if(i){let r=n.data[WS];for(;t<r;){let s=i.nextSibling;lE(e,i,!1),i=s,t++}}}var YP=()=>null,ZP=()=>null;function Yy(n,e){return YP(n,e)}function LE(n,e,t){return ZP(n,e,t)}var kE=class{},Uf=class{},Zy=class{resolveComponentFactory(e){throw new Fe(917,!1)}},Bf=class{static NULL=new Zy},dl=class{},Mr=(()=>{class n{destroyNode=null;static __NG_ELEMENT_ID__=()=>JP()}return n})();function JP(){let n=Re(),e=en(),t=di(e.index,n);return(vr(t)?t:n)[xt]}var UE=(()=>{class n{static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>null})}return n})();var ff={},Ko=class{injector;parentInjector;constructor(e,t){this.injector=e,this.parentInjector=t}get(e,t,i){let r=this.injector.get(e,ff,i);return r!==ff||t===ff?r:this.parentInjector.get(e,t,i)}};function Ef(n,e,t){let i=t?n.styles:null,r=t?n.classes:null,s=0;if(e!==null)for(let o=0;o<e.length;o++){let a=e[o];if(typeof a=="number")s=a;else if(s==1)r=Ld(r,a);else if(s==2){let c=a,l=e[++o];i=Ld(i,c+": "+l+";")}}t?n.styles=i:n.stylesWithoutHost=i,t?n.classes=r:n.classesWithoutHost=r}function et(n,e=0){let t=Re();if(t===null)return Ye(n,e);let i=en();return PS(i,t,sn(n),e)}function BE(n,e,t,i,r){let s=i===null?null:{"":-1},o=r(n,t);if(o!==null){let a=o,c=null,l=null;for(let u of o)if(u.resolveHostDirectives!==null){[a,c,l]=u.resolveHostDirectives(o);break}eF(n,e,t,a,s,c,l)}s!==null&&i!==null&&KP(t,i,s)}function KP(n,e,t){let i=n.localNames=[];for(let r=0;r<e.length;r+=2){let s=t[e[r+1]];if(s==null)throw new Fe(-301,!1);i.push(e[r],s)}}function QP(n,e,t){e.componentOffset=t,(n.components??=[]).push(e.index)}function eF(n,e,t,i,r,s,o){let a=i.length,c=null;for(let f=0;f<a;f++){let h=i[f];c===null&&ji(h)&&(c=h,QP(n,t,f)),ky(_f(t,e),n,h.type)}oF(t,n.data.length,a),c?.viewProvidersResolver&&c.viewProvidersResolver(c);for(let f=0;f<a;f++){let h=i[f];h.providersResolver&&h.providersResolver(h)}let l=!1,u=!1,d=hE(n,e,a,null);a>0&&(t.directiveToIndex=new Map);for(let f=0;f<a;f++){let h=i[f];if(t.mergedAttrs=ea(t.mergedAttrs,h.hostAttrs),nF(n,t,e,d,h),sF(d,h,r),o!==null&&o.has(h)){let[v,m]=o.get(h);t.directiveToIndex.set(h.type,[d,v+t.directiveStart,m+t.directiveStart])}else(s===null||!s.has(h))&&t.directiveToIndex.set(h.type,d);h.contentQueries!==null&&(t.flags|=4),(h.hostBindings!==null||h.hostAttrs!==null||h.hostVars!==0)&&(t.flags|=64);let p=h.type.prototype;!l&&(p.ngOnChanges||p.ngOnInit||p.ngDoCheck)&&((n.preOrderHooks??=[]).push(t.index),l=!0),!u&&(p.ngOnChanges||p.ngDoCheck)&&((n.preOrderCheckHooks??=[]).push(t.index),u=!0),d++}tF(n,t,s)}function tF(n,e,t){for(let i=e.directiveStart;i<e.directiveEnd;i++){let r=n.data[i];if(t===null||!t.has(r))KM(0,e,r,i),KM(1,e,r,i),eS(e,i,!1);else{let s=t.get(r);QM(0,e,s,i),QM(1,e,s,i),eS(e,i,!0)}}}function KM(n,e,t,i){let r=n===0?t.inputs:t.outputs;for(let s in r)if(r.hasOwnProperty(s)){let o;n===0?o=e.inputs??={}:o=e.outputs??={},o[s]??=[],o[s].push(i),VE(e,s)}}function QM(n,e,t,i){let r=n===0?t.inputs:t.outputs;for(let s in r)if(r.hasOwnProperty(s)){let o=r[s],a;n===0?a=e.hostDirectiveInputs??={}:a=e.hostDirectiveOutputs??={},a[o]??=[],a[o].push(i,s),VE(e,o)}}function VE(n,e){e==="class"?n.flags|=8:e==="style"&&(n.flags|=16)}function eS(n,e,t){let{attrs:i,inputs:r,hostDirectiveInputs:s}=n;if(i===null||!t&&r===null||t&&s===null||Tv(n)){n.initialInputs??=[],n.initialInputs.push(null);return}let o=null,a=0;for(;a<i.length;){let c=i[a];if(c===0){a+=4;continue}else if(c===5){a+=2;continue}else if(typeof c=="number")break;if(!t&&r.hasOwnProperty(c)){let l=r[c];for(let u of l)if(u===e){o??=[],o.push(c,i[a+1]);break}}else if(t&&s.hasOwnProperty(c)){let l=s[c];for(let u=0;u<l.length;u+=2)if(l[u]===e){o??=[],o.push(l[u+1],i[a+1]);break}}a+=2}n.initialInputs??=[],n.initialInputs.push(o)}function nF(n,e,t,i,r){n.data[i]=r;let s=r.factory||(r.factory=Ur(r.type,!0)),o=new $s(s,ji(r),et,null);n.blueprint[i]=o,t[i]=o,iF(n,e,i,hE(n,t,r.hostVars,_n),r)}function iF(n,e,t,i,r){let s=r.hostBindings;if(s){let o=n.hostBindingOpCodes;o===null&&(o=n.hostBindingOpCodes=[]);let a=~e.index;rF(o)!=a&&o.push(a),o.push(t,i,s)}}function rF(n){let e=n.length;for(;e>0;){let t=n[--e];if(typeof t=="number"&&t<0)return t}return 0}function sF(n,e,t){if(t){if(e.exportAs)for(let i=0;i<e.exportAs.length;i++)t[e.exportAs[i]]=n;ji(e)&&(t[""]=n)}}function oF(n,e,t){n.flags|=1,n.directiveStart=e,n.directiveEnd=e+t,n.providerIndexes=e}function Gv(n,e,t,i,r,s,o,a){let c=e[xe],l=c.consts,u=In(l,o),d=ua(c,n,t,i,u);return s&&BE(c,e,d,In(l,a),r),d.mergedAttrs=ea(d.mergedAttrs,d.attrs),d.attrs!==null&&Ef(d,d.attrs,!1),d.mergedAttrs!==null&&Ef(d,d.mergedAttrs,!0),c.queries!==null&&c.queries.elementStart(c,d),d}function jv(n,e){wS(n,e),Kg(e)&&n.queries.elementEnd(e)}function aF(n,e,t,i,r,s){let o=e.consts,a=In(o,r),c=ua(e,n,t,i,a);if(c.mergedAttrs=ea(c.mergedAttrs,c.attrs),s!=null){let l=In(o,s);c.localNames=[];for(let u=0;u<l.length;u+=2)c.localNames.push(l[u],-1)}return c.attrs!==null&&Ef(c,c.attrs,!1),c.mergedAttrs!==null&&Ef(c,c.mergedAttrs,!0),e.queries!==null&&e.queries.elementStart(e,c),c}function Wv(n){return n!==null&&(typeof n=="function"||typeof n=="object")}function cF(n,e,t){return n[e]=t}function Zn(n,e,t){if(t===_n)return!1;let i=n[e];return Object.is(i,t)?!1:(n[e]=t,!0)}function HE(n,e,t,i){let r=Zn(n,e,t);return Zn(n,e+1,i)||r}function lF(n,e,t,i,r){let s=HE(n,e,t,i);return Zn(n,e+2,r)||s}function hf(n,e,t){return function i(r){let s=i.__ngNativeEl__;s!==void 0&&ZR(r,s);let o=_r(n)?di(n.index,e):e;Lf(o,5);let a=e[Vt],c=tS(e,a,t,r),l=i.__ngNextListenerFn__;for(;l;)c=tS(e,a,l,r)&&c,l=l.__ngNextListenerFn__;return c}}function tS(n,e,t,i){let r=ke(null);try{return ct(it.OutputStart,e,t),t(i)!==!1}catch(s){return Bv(n,s),!1}finally{ct(it.OutputEnd,e,t),ke(r)}}function zE(n,e,t,i,r,s,o,a){let c=jo(n),l=!1,u=null;if(!i&&c&&(u=dF(e,t,s,n.index)),u!==null){let d=u.__ngLastListenerFn__||u;d.__ngNextListenerFn__=o,u.__ngLastListenerFn__=o,l=!0}else{let d=ui(n,t),f=i?i(d):d;KR(t,f,s,a),i||(a.__ngNativeEl__=d);let h=r.listen(f,s,a);if(!uF(s)){let p=i?v=>i(li(v[n.index])):n.index;GE(p,e,t,s,a,h,!1)}}return l}function uF(n){return n.startsWith("animation")||n.startsWith("transition")}function dF(n,e,t,i){let r=n.cleanup;if(r!=null)for(let s=0;s<r.length-1;s+=2){let o=r[s];if(o===t&&r[s+1]===i){let a=e[zo],c=r[s+2];return a&&a.length>c?a[c]:null}typeof o=="string"&&(s+=2)}return null}function GE(n,e,t,i,r,s,o){let a=e.firstCreatePass?sy(e):null,c=ry(t),l=c.length;c.push(r,s),a&&a.push(i,n,l,(l+1)*(o?-1:1))}function nS(n,e,t,i,r,s){let o=e[t],a=e[xe],l=a.data[t].outputs[i],d=o[l].subscribe(s);GE(n.index,a,e,r,s,d,!0)}var Jy=Symbol("BINDING");function jE(n){return n.debugInfo?.className||n.type.name||null}var Ky=class extends Bf{ngModule;constructor(e){super(),this.ngModule=e}resolveComponentFactory(e){let t=Hr(e);return new fl(t,this.ngModule)}};function fF(n){return Object.keys(n).map(e=>{let[t,i,r]=n[e],s={propName:t,templateName:e,isSignal:(i&Rf.SignalBased)!==0};return r&&(s.transform=r),s})}function hF(n){return Object.keys(n).map(e=>({propName:n[e],templateName:e}))}function pF(n,e,t){let i=e instanceof vn?e:e?.injector;return i&&n.getStandaloneInjector!==null&&(i=n.getStandaloneInjector(i)||i),i?new Ko(t,i):t}function mF(n){let e=n.get(dl,null);if(e===null)throw new Fe(407,!1);let t=n.get(UE,null),i=n.get(mr,null),r=n.get(es,null,{optional:!0});return{rendererFactory:e,sanitizer:t,changeDetectionScheduler:i,ngReflect:!1,tracingService:r}}function gF(n,e){let t=WE(n);return aE(e,t,t==="svg"?Lc:t==="math"?Qg:null)}function yF(n){if(n?.toLowerCase()==="script")throw new Fe(905,!1)}function WE(n){return(n.selectors[0][0]||"div").toLowerCase()}var fl=class extends Uf{componentDef;ngModule;selector;componentType;ngContentSelectors;isBoundToModule;cachedInputs=null;cachedOutputs=null;get inputs(){return this.cachedInputs??=fF(this.componentDef.inputs),this.cachedInputs}get outputs(){return this.cachedOutputs??=hF(this.componentDef.outputs),this.cachedOutputs}constructor(e,t){super(),this.componentDef=e,this.ngModule=t,this.componentType=e.type,this.selector=jN(e.selectors),this.ngContentSelectors=e.ngContentSelectors??[],this.isBoundToModule=!!t}create(e,t,i,r,s,o){ct(it.DynamicComponentStart);let a=ke(null);try{let c=this.componentDef,l=pF(c,r||this.ngModule,e),u=mF(l),d=u.tracingService;return d&&d.componentCreate?d.componentCreate(jE(c),()=>this.createComponentRef(u,l,t,i,s,o)):this.createComponentRef(u,l,t,i,s,o)}finally{ke(a)}}createComponentRef(e,t,i,r,s,o){let a=this.componentDef,c=vF(r,a,o,s),l=e.rendererFactory.createRenderer(null,a),u=r?gP(l,r,a.encapsulation,t):gF(a,l);yF(u?.tagName);let d=o?.some(iS)||s?.some(p=>typeof p!="function"&&p.bindings.some(iS)),f=Dv(null,c,null,512|fE(a),null,null,e,l,t,null,ZS(u,t,!0));f[bt]=u,Kd(f);let h=null;try{let p=Gv(bt,f,2,"#host",()=>c.directiveRegistry,!0,0);uE(l,u,p),ta(u,f),Of(c,f,p),Ev(c,p,f),jv(c,p),i!==void 0&&xF(p,this.ngContentSelectors,i),h=di(p.index,f),f[Vt]=h[Vt],Hv(c,f,null)}catch(p){throw h!==null&&By(h),By(f),p}finally{ct(it.DynamicComponentEnd),Qd()}return new wf(this.componentType,f,!!d)}};function vF(n,e,t,i){let r=n?["ng-version","21.2.26"]:WN(e.selectors[0]),s=null,o=null,a=0;if(t)for(let u of t)a+=u[Jy].requiredVars,u.create&&(u.targetIdx=0,(s??=[]).push(u)),u.update&&(u.targetIdx=0,(o??=[]).push(u));if(i)for(let u=0;u<i.length;u++){let d=i[u];if(typeof d!="function")for(let f of d.bindings){a+=f[Jy].requiredVars;let h=u+1;f.create&&(f.targetIdx=h,(s??=[]).push(f)),f.update&&(f.targetIdx=h,(o??=[]).push(f))}}let c=[e];if(i)for(let u of i){let d=typeof u=="function"?u:u.type,f=Bd(d);c.push(f)}return Cv(0,null,_F(s,o),1,a,c,null,null,null,[r],null)}function _F(n,e){return!n&&!e?null:t=>{if(t&1&&n)for(let i of n)i.create();if(t&2&&e)for(let i of e)i.update()}}function iS(n){let e=n[Jy].kind;return e==="input"||e==="twoWay"}var wf=class extends kE{_rootLView;_hasInputBindings;instance;hostView;changeDetectorRef;componentType;location;previousInputValues=null;_tNode;constructor(e,t,i){super(),this._rootLView=t,this._hasInputBindings=i,this._tNode=$o(t[xe],bt),this.location=la(this._tNode,t),this.instance=di(this._tNode.index,t)[Vt],this.hostView=this.changeDetectorRef=new Qr(t,void 0),this.componentType=e}setInput(e,t){this._hasInputBindings;let i=this._tNode;if(this.previousInputValues??=new Map,this.previousInputValues.has(e)&&Object.is(this.previousInputValues.get(e),t))return;let r=this._rootLView,s=Vv(i,r[xe],r,e,t);this.previousInputValues.set(e,t);let o=di(i.index,r);Lf(o,1)}get injector(){return new Ws(this._tNode,this._rootLView)}destroy(){this.hostView.destroy()}onDestroy(e){this.hostView.onDestroy(e)}};function xF(n,e,t){let i=n.projection=[];for(let r=0;r<e.length;r++){let s=t[r];i.push(s!=null&&s.length?Array.from(s):null)}}var da=(()=>{class n{static __NG_ELEMENT_ID__=bF}return n})();function bF(){let n=en();return $E(n,Re())}var Qy=class n extends da{_lContainer;_hostTNode;_hostLView;constructor(e,t,i){super(),this._lContainer=e,this._hostTNode=t,this._hostLView=i}get element(){return la(this._hostTNode,this._hostLView)}get injector(){return new Ws(this._hostTNode,this._hostLView)}get parentInjector(){let e=vv(this._hostTNode,this._hostLView);if(CS(e)){let t=yf(e,this._hostLView),i=gf(e),r=t[xe].data[i+8];return new Ws(r,t)}else return new Ws(null,this._hostLView)}clear(){for(;this.length>0;)this.remove(this.length-1)}get(e){let t=rS(this._lContainer);return t!==null&&t[e]||null}get length(){return this._lContainer.length-Ft}createEmbeddedView(e,t,i){let r,s;typeof i=="number"?r=i:i!=null&&(r=i.index,s=i.injector);let o=Yy(this._lContainer,e.ssrId),a=e.createEmbeddedViewImpl(t||{},s,o);return this.insertImpl(a,r,ia(this._hostTNode,o)),a}createComponent(e,t,i,r,s,o,a){let c=e&&!MR(e),l;if(c)l=t;else{let m=t||{};l=m.index,i=m.injector,r=m.projectableNodes,s=m.environmentInjector||m.ngModuleRef,o=m.directives,a=m.bindings}let u=c?e:new fl(Hr(e)),d=i||this.parentInjector;if(!s&&u.ngModule==null){let g=(c?d:this.parentInjector).get(vn,null);g&&(s=g)}let f=Hr(u.componentType??{}),h=Yy(this._lContainer,f?.id??null),p=h?.firstChild??null,v=u.create(d,r,p,s,o,a);return this.insertImpl(v.hostView,l,ia(this._hostTNode,h)),v}insert(e,t){return this.insertImpl(e,t,!0)}insertImpl(e,t,i){let r=e._lView;if(aM(r)){let a=this.indexOf(e);if(a!==-1)this.detach(a);else{let c=r[jt],l=new n(c,c[ci],c[jt]);l.detach(l.indexOf(e))}}let s=this._adjustIndex(t),o=this._lContainer;return Ml(o,r,s,i),e.attachToViewContainerRef(),zg(Ty(o),s,e),e}move(e,t){return this.insert(e,t)}indexOf(e){let t=rS(this._lContainer);return t!==null?t.indexOf(e):-1}remove(e){let t=this._adjustIndex(e,-1),i=ul(this._lContainer,t);i&&(zc(Ty(this._lContainer),t),Pf(i[xe],i))}detach(e){let t=this._adjustIndex(e,-1),i=ul(this._lContainer,t);return i&&zc(Ty(this._lContainer),t)!=null?new Qr(i):null}_adjustIndex(e,t=0){return e??this.length+t}};function rS(n){return n[qc]}function Ty(n){return n[qc]||(n[qc]=[])}function $E(n,e){let t,i=e[n.index];return Mi(i)?t=i:(t=PE(i,e,null,n),e[n.index]=t,Av(e,t)),SF(t,e,n,i),new Qy(t,n,e)}function MF(n,e){let t=n[xt],i=t.createComment(""),r=ui(e,n),s=t.parentNode(r);return Mf(t,s,i,t.nextSibling(r),!1),i}var SF=wF,EF=()=>!1;function qE(n,e,t){return EF(n,e,t)}function wF(n,e,t,i){if(n[$r])return;let r;t.type&8?r=li(i):r=MF(e,t),n[$r]=r}var ev=class n{queryList;matches=null;constructor(e){this.queryList=e}clone(){return new n(this.queryList)}setDirty(){this.queryList.setDirty()}},tv=class n{queries;constructor(e=[]){this.queries=e}createEmbeddedView(e){let t=e.queries;if(t!==null){let i=e.contentQueries!==null?e.contentQueries[0]:t.length,r=[];for(let s=0;s<i;s++){let o=t.getByIndex(s),a=this.queries[o.indexInDeclarationView];r.push(a.clone())}return new n(r)}return null}insertView(e){this.dirtyQueriesWithMatches(e)}detachView(e){this.dirtyQueriesWithMatches(e)}finishViewCreation(e){this.dirtyQueriesWithMatches(e)}dirtyQueriesWithMatches(e){for(let t=0;t<this.queries.length;t++)qv(e,t).matches!==null&&this.queries[t].setDirty()}},nv=class{flags;read;predicate;constructor(e,t,i=null){this.flags=t,this.read=i,typeof e=="string"?this.predicate=RF(e):this.predicate=e}},iv=class n{queries;constructor(e=[]){this.queries=e}elementStart(e,t){for(let i=0;i<this.queries.length;i++)this.queries[i].elementStart(e,t)}elementEnd(e){for(let t=0;t<this.queries.length;t++)this.queries[t].elementEnd(e)}embeddedTView(e){let t=null;for(let i=0;i<this.length;i++){let r=t!==null?t.length:0,s=this.getByIndex(i).embeddedTView(e,r);s&&(s.indexInDeclarationView=i,t!==null?t.push(s):t=[s])}return t!==null?new n(t):null}template(e,t){for(let i=0;i<this.queries.length;i++)this.queries[i].template(e,t)}getByIndex(e){return this.queries[e]}get length(){return this.queries.length}track(e){this.queries.push(e)}},rv=class n{metadata;matches=null;indexInDeclarationView=-1;crossesNgTemplate=!1;_declarationNodeIndex;_appliesToNextNode=!0;constructor(e,t=-1){this.metadata=e,this._declarationNodeIndex=t}elementStart(e,t){this.isApplyingToNode(t)&&this.matchTNode(e,t)}elementEnd(e){this._declarationNodeIndex===e.index&&(this._appliesToNextNode=!1)}template(e,t){this.elementStart(e,t)}embeddedTView(e,t){return this.isApplyingToNode(e)?(this.crossesNgTemplate=!0,this.addMatch(-e.index,t),new n(this.metadata)):null}isApplyingToNode(e){if(this._appliesToNextNode&&(this.metadata.flags&1)!==1){let t=this._declarationNodeIndex,i=e.parent;for(;i!==null&&i.type&8&&i.index!==t;)i=i.parent;return t===(i!==null?i.index:-1)}return this._appliesToNextNode}matchTNode(e,t){let i=this.metadata.predicate;if(Array.isArray(i))for(let r=0;r<i.length;r++){let s=i[r];this.matchTNodeWithReadOption(e,t,TF(t,s)),this.matchTNodeWithReadOption(e,t,df(t,e,s,!1,!1))}else i===ra?t.type&4&&this.matchTNodeWithReadOption(e,t,-1):this.matchTNodeWithReadOption(e,t,df(t,e,i,!1,!1))}matchTNodeWithReadOption(e,t,i){if(i!==null){let r=this.metadata.read;if(r!==null)if(r===Rn||r===da||r===ra&&t.type&4)this.addMatch(t.index,-2);else{let s=df(t,e,r,!1,!1);s!==null&&this.addMatch(t.index,s)}else this.addMatch(t.index,i)}}addMatch(e,t){this.matches===null?this.matches=[e,t]:this.matches.push(e,t)}};function TF(n,e){let t=n.localNames;if(t!==null){for(let i=0;i<t.length;i+=2)if(t[i]===e)return t[i+1]}return null}function CF(n,e){return n.type&11?la(n,e):n.type&4?kf(n,e):null}function DF(n,e,t,i){return t===-1?CF(e,n):t===-2?AF(n,e,i):al(n,n[xe],t,e)}function AF(n,e,t){if(t===Rn)return la(e,n);if(t===ra)return kf(e,n);if(t===da)return $E(e,n)}function XE(n,e,t,i){let r=e[Gi].queries[i];if(r.matches===null){let s=n.data,o=t.matches,a=[];for(let c=0;o!==null&&c<o.length;c+=2){let l=o[c];if(l<0)a.push(null);else{let u=s[l];a.push(DF(e,u,o[c+1],t.metadata.read))}}r.matches=a}return r.matches}function sv(n,e,t,i){let r=n.queries.getByIndex(t),s=r.matches;if(s!==null){let o=XE(n,e,r,t);for(let a=0;a<s.length;a+=2){let c=s[a];if(c>0)i.push(o[a/2]);else{let l=s[a+1],u=e[-c];for(let d=Ft;d<u.length;d++){let f=u[d];f[Gr]===f[jt]&&sv(f[xe],f,l,i)}if(u[zs]!==null){let d=u[zs];for(let f=0;f<d.length;f++){let h=d[f];sv(h[xe],h,l,i)}}}}}return i}function $v(n,e){return n[Gi].queries[e].queryList}function IF(n,e,t){let i=new xf((t&4)===4);return lM(n,e,i,i.destroy),(e[Gi]??=new tv).queries.push(new ev(i))-1}function YE(n,e,t){let i=Mt();return i.firstCreatePass&&(NF(i,new nv(n,e,t),-1),(e&2)===2&&(i.staticViewQueries=!0)),IF(i,Re(),e)}function RF(n){return n.split(",").map(e=>e.trim())}function NF(n,e,t){n.queries===null&&(n.queries=new iv),n.queries.track(new rv(e,t))}function qv(n,e){return n.queries.getByIndex(e)}function ZE(n,e){let t=n[xe],i=qv(t,e);return i.crossesNgTemplate?sv(t,n,e,[]):XE(t,n,i,e)}function JE(n,e,t){let i,r=Nc(()=>{i._dirtyCounter();let s=FF(i,n);if(e&&s===void 0)throw new Fe(-951,!1);return s});return i=r[gn],i._dirtyCounter=js(0),i._flatValue=void 0,r}function KE(n){return JE(!0,!1,n)}function QE(n){return JE(!0,!0,n)}function PF(n,e){let t=n[gn];t._lView=Re(),t._queryIndex=e,t._queryList=$v(t._lView,e),t._queryList.onDirty(()=>t._dirtyCounter.update(i=>i+1))}function FF(n,e){let t=n._lView,i=n._queryIndex;if(t===void 0||i===void 0||t[Ve]&4)return e?void 0:yn;let r=$v(t,i),s=ZE(t,i);return r.reset(s,LS),e?r.first:r._changesDetected||n._flatValue===void 0?n._flatValue=r.toArray():n._flatValue}var hl=class{};var pl=class extends hl{injector;componentFactoryResolver=new Ky(this);instance=null;constructor(e){super();let t=new Os([...e.providers,{provide:hl,useValue:this},{provide:Bf,useValue:this.componentFactoryResolver}],e.parent||Wc(),e.debugName,new Set(["environment"]));this.injector=t,e.runEnvironmentInitializers&&t.resolveInjectorInitializers()}destroy(){this.injector.destroy()}onDestroy(e){this.injector.onDestroy(e)}};function Xv(n,e,t=null){return new pl({providers:n,parent:e,debugName:t,runEnvironmentInitializers:!0}).injector}var OF=(()=>{class n{_injector;cachedInjectors=new Map;constructor(t){this._injector=t}getOrCreateStandaloneInjector(t){if(!t.standalone)return null;if(!this.cachedInjectors.has(t)){let i=Gd(!1,t.type),r=i.length>0?Xv([i],this._injector,""):null;this.cachedInjectors.set(t,r)}return this.cachedInjectors.get(t)}ngOnDestroy(){try{for(let t of this.cachedInjectors.values())t!==null&&t.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=Ie({token:n,providedIn:"environment",factory:()=>new n(Ye(vn))})}return n})();function Yv(n){return gl(()=>{let e=ew(n),t=st(Ae({},e),{decls:n.decls,vars:n.vars,template:n.template,consts:n.consts||null,ngContentSelectors:n.ngContentSelectors,onPush:n.changeDetection===_v.OnPush,directiveDefs:null,pipeDefs:null,dependencies:e.standalone&&n.dependencies||null,getStandaloneInjector:e.standalone?r=>r.get(OF).getOrCreateStandaloneInjector(t):null,getExternalStyles:null,signals:n.signals??!1,data:n.data||{},encapsulation:n.encapsulation||qs.Emulated,styles:n.styles||yn,_:null,schemas:n.schemas||null,tView:null,id:""});e.standalone&&qi("NgStandalone"),tw(t);let i=n.dependencies;return t.directiveDefs=sS(i,LF),t.pipeDefs=sS(i,Ug),t.id=BF(t),t})}function LF(n){return Hr(n)||Bd(n)}function Ys(n){return gl(()=>({type:n.type,bootstrap:n.bootstrap||yn,declarations:n.declarations||yn,imports:n.imports||yn,exports:n.exports||yn,transitiveCompileScopes:null,schemas:n.schemas||null,id:n.id||null}))}function kF(n,e){if(n==null)return zr;let t={};for(let i in n)if(n.hasOwnProperty(i)){let r=n[i],s,o,a,c;Array.isArray(r)?(a=r[0],s=r[1],o=r[2]??s,c=r[3]||null):(s=r,o=r,a=Rf.None,c=null),t[s]=[i,a,c],e[s]=o}return t}function UF(n){if(n==null)return zr;let e={};for(let t in n)n.hasOwnProperty(t)&&(e[n[t]]=t);return e}function xn(n){return gl(()=>{let e=ew(n);return tw(e),e})}function Vf(n){return{type:n.type,name:n.name,factory:null,pure:n.pure!==!1,standalone:n.standalone??!0,onDestroy:n.type.prototype.ngOnDestroy||null}}function ew(n){let e={};return{type:n.type,providersResolver:null,viewProvidersResolver:null,factory:null,hostBindings:n.hostBindings||null,hostVars:n.hostVars||0,hostAttrs:n.hostAttrs||null,contentQueries:n.contentQueries||null,declaredInputs:e,inputConfig:n.inputs||zr,exportAs:n.exportAs||null,standalone:n.standalone??!0,signals:n.signals===!0,selectors:n.selectors||yn,viewQuery:n.viewQuery||null,features:n.features||null,setInput:null,resolveHostDirectives:null,hostDirectives:null,controlDef:null,inputs:kF(n.inputs,e),outputs:UF(n.outputs),debugInfo:null}}function tw(n){n.features?.forEach(e=>e(n))}function sS(n,e){return n?()=>{let t=typeof n=="function"?n():n,i=[];for(let r of t){let s=e(r);s!==null&&i.push(s)}return i}:null}function BF(n){let e=0,t=typeof n.consts=="function"?"":n.consts,i=[n.selectors,n.ngContentSelectors,n.hostVars,n.hostAttrs,t,n.vars,n.decls,n.encapsulation,n.standalone,n.signals,n.exportAs,JSON.stringify(n.inputs),JSON.stringify(n.outputs),Object.getOwnPropertyNames(n.type.prototype),!!n.contentQueries,!!n.viewQuery];for(let s of i.join("|"))e=Math.imul(31,e)+s.charCodeAt(0)<<0;return e+=2147483648,"c"+e}function VF(n){return Object.getPrototypeOf(n.prototype).constructor}function Xi(n){let e=VF(n.type),t=!0,i=[n];for(;e&&e!==Function.prototype&&e!==Object.prototype;){let r,s=Object.hasOwn(e,Vc)?e[Vc]:void 0,o=Object.hasOwn(e,Hc)?e[Hc]:void 0;if(ji(n))r=s??o;else{if(s)throw new Fe(903,!1);r=o}if(r){if(t){i.push(r);let c=n;c.inputs=Cy(n.inputs),c.declaredInputs=Cy(n.declaredInputs),c.outputs=Cy(n.outputs);let l=r.hostBindings;l&&WF(n,l);let u=r.viewQuery,d=r.contentQueries;if(u&&GF(n,u),d&&jF(n,d),HF(n,r),$b(n.outputs,r.outputs),ji(r)&&r.data.animation){let f=n.data;f.animation=(f.animation||[]).concat(r.data.animation)}}let a=r.features;if(a)for(let c=0;c<a.length;c++){let l=a[c];l&&l.ngInherit&&l(n),l===Xi&&(t=!1)}}e=Object.getPrototypeOf(e)}zF(i)}function HF(n,e){for(let t in e.inputs){if(!e.inputs.hasOwnProperty(t)||n.inputs.hasOwnProperty(t))continue;let i=e.inputs[t];i!==void 0&&(n.inputs[t]=i,n.declaredInputs[t]=e.declaredInputs[t])}}function zF(n){let e=0,t=null;for(let i=n.length-1;i>=0;i--){let r=n[i];r.hostVars=e+=r.hostVars,r.hostAttrs=ea(r.hostAttrs,t=ea(t,r.hostAttrs))}}function Cy(n){return n===zr?{}:n===yn?[]:n}function GF(n,e){let t=n.viewQuery;t?n.viewQuery=(i,r)=>{e(i,r),t(i,r)}:n.viewQuery=e}function jF(n,e){let t=n.contentQueries;t?n.contentQueries=(i,r,s)=>{e(i,r,s),t(i,r,s)}:n.contentQueries=e}function WF(n,e){let t=n.hostBindings;t?n.hostBindings=(i,r)=>{e(i,r),t(i,r)}:n.hostBindings=e}function nw(n,e,t,i,r,s,o,a){if(t.firstCreatePass){n.mergedAttrs=ea(n.mergedAttrs,n.attrs);let u=n.tView=Cv(2,n,r,s,o,t.directiveRegistry,t.pipeRegistry,null,t.schemas,t.consts,null);t.queries!==null&&(t.queries.template(t,n),u.queries=t.queries.embeddedTView(n))}a&&(n.flags|=a),Gs(n,!1);let c=qF(t,e,n,i);ef()&&Fv(t,e,c,n),ta(c,e);let l=PE(c,e,c,n);e[i+bt]=l,Av(e,l),qE(l,n,e)}function $F(n,e,t,i,r,s,o,a,c,l,u){let d=t+bt,f;return e.firstCreatePass?(f=ua(e,d,4,o||null,a||null),Yd()&&BE(e,n,f,In(e.consts,l),Lv),wS(e,f)):f=e.data[d],nw(f,n,e,t,i,r,s,c),jo(f)&&Of(e,n,f),l!=null&&xl(n,f,u),f}function sa(n,e,t,i,r,s,o,a,c,l,u){let d=t+bt,f;if(e.firstCreatePass){if(f=ua(e,d,4,o||null,a||null),l!=null){let h=In(e.consts,l);f.localNames=[];for(let p=0;p<h.length;p+=2)f.localNames.push(h[p],-1)}}else f=e.data[d];return nw(f,n,e,t,i,r,s,c),l!=null&&xl(n,f,u),f}function iw(n,e,t,i,r,s,o,a){let c=Re(),l=Mt(),u=In(l.consts,s);return $F(c,l,n,e,t,i,r,u,void 0,o,a),iw}function rw(n,e,t,i,r,s,o,a){let c=Re(),l=Mt(),u=In(l.consts,s);return sa(c,l,n,e,t,i,r,u,void 0,o,a),rw}var qF=XF;function XF(n,e,t,i){return el(!0),e[xt].createComment("")}var Hn=(function(n){return n[n.NOT_STARTED=0]="NOT_STARTED",n[n.IN_PROGRESS=1]="IN_PROGRESS",n[n.COMPLETE=2]="COMPLETE",n[n.FAILED=3]="FAILED",n})(Hn||{}),oS=0,YF=1,Ot=(function(n){return n[n.Placeholder=0]="Placeholder",n[n.Loading=1]="Loading",n[n.Complete=2]="Complete",n[n.Error=3]="Error",n})(Ot||{}),sw=(function(n){return n[n.Initial=-1]="Initial",n})(sw||{}),Qo=0,Hf=1,sl=2,af=3,ZF=4,JF=5,KF=6,QF=7,Dy=8,eO=9,Zv=(function(n){return n[n.Manual=0]="Manual",n[n.Playthrough=1]="Playthrough",n})(Zv||{});function tO(n,e,t){let i=aw(n);e[i]===null&&(e[i]=[]),e[i].push(t)}function pf(n,e){let t=aw(n),i=e[t];if(i!==null){for(let r of i)r();e[t]=null}}function ow(n){pf(1,n),pf(0,n),pf(2,n)}function aw(n){let e=ZF;return n===1?e=JF:n===2&&(e=eO),e}function zf(n){return n+1}function Sl(n,e){let t=n[xe],i=zf(e.index);return n[i]}function nO(n,e,t){let i=n[xe],r=zf(e);n[r]=t}function ts(n,e){let t=zf(e.index);return n.data[t]}function iO(n,e,t){let i=zf(e);n.data[i]=t}function rO(n,e,t){let i=e[xe],r=ts(i,t);switch(n){case Ot.Complete:return r.primaryTmplIndex;case Ot.Loading:return r.loadingTmplIndex;case Ot.Error:return r.errorTmplIndex;case Ot.Placeholder:return r.placeholderTmplIndex;default:return null}}function ov(n,e){return e===Ot.Placeholder?n.placeholderBlockConfig?.[oS]??null:e===Ot.Loading?n.loadingBlockConfig?.[oS]??null:null}function cw(n){return n.loadingBlockConfig?.[YF]??null}function aS(n,e){if(!n||n.length===0)return e;let t=new Set(n);for(let i of e)t.add(i);return n.length===t.size?n:Array.from(t)}function sO(n,e){let t=e.primaryTmplIndex+bt;return $o(n,t)}function oO(n,e,t){let i=t.get(lw),r=t.get(Bt),s=()=>i.remove(e);return i.add(n,e,r),s}var lw=(()=>{class n{executingCallbacks=!1;timeoutId=null;invokeTimerAt=null;current=[];deferred=[];add(t,i,r){let s=this.executingCallbacks?this.deferred:this.current;this.addToQueue(s,Date.now()+t,i),this.scheduleTimer(r)}remove(t){let{current:i,deferred:r}=this;this.removeFromQueue(i,t)===-1&&this.removeFromQueue(r,t),i.length===0&&r.length===0&&this.clearTimeout()}addToQueue(t,i,r){let s=t.length;for(let o=0;o<t.length;o+=2)if(t[o]>i){s=o;break}jg(t,s,i,r)}removeFromQueue(t,i){let r=-1;for(let s=0;s<t.length;s+=2)if(t[s+1]===i){r=s;break}return r>-1&&Gg(t,r,2),r}scheduleTimer(t){let i=()=>{this.clearTimeout(),this.executingCallbacks=!0;let s=[...this.current],o=Date.now();for(let c=0;c<s.length;c+=2){let l=s[c],u=s[c+1];if(l<=o)u();else break}let a=-1;for(let c=0;c<this.current.length&&this.current[c]<=o;c+=2)a=c+1;if(a>=0&&Gg(this.current,0,a+1),this.executingCallbacks=!1,this.deferred.length>0){for(let c=0;c<this.deferred.length;c+=2){let l=this.deferred[c],u=this.deferred[c+1];this.addToQueue(this.current,l,u)}this.deferred.length=0}this.scheduleTimer(t)};if(this.current.length>0){let s=Date.now(),o=this.current[0];if(this.timeoutId===null||this.invokeTimerAt&&this.invokeTimerAt-o>16){this.clearTimeout();let a=Math.max(o-s,16);this.invokeTimerAt=o,this.timeoutId=t.runOutsideAngular(()=>setTimeout(()=>t.run(i),a))}}}clearTimeout(){this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null)}ngOnDestroy(){this.clearTimeout(),this.current.length=0,this.deferred.length=0}static \u0275prov=Ie({token:n,providedIn:"root",factory:()=>new n})}return n})(),aO=(()=>{class n{cachedInjectors=new Map;getOrCreateInjector(t,i,r,s){if(!this.cachedInjectors.has(t)){let o=r.length>0?Xv(r,i,s):null;this.cachedInjectors.set(t,o)}return this.cachedInjectors.get(t)}ngOnDestroy(){try{for(let t of this.cachedInjectors.values())t!==null&&t.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=Ie({token:n,providedIn:"environment",factory:()=>new n})}return n})();var uw=new Be("");function Ay(n,e,t){return n.get(aO).getOrCreateInjector(e,n,t,"")}function cO(n,e,t){if(n instanceof Ko){let r=n.injector,s=n.parentInjector,o=Ay(s,e,t);return new Ko(r,o)}let i=n.get(vn);if(i!==n){let r=Ay(i,e,t);return new Ko(n,r)}return Ay(n,e,t)}function xr(n,e,t,i=!1){let r=t[jt],s=r[xe];if(qr(r))return;let o=Sl(r,e),a=o[Hf],c=o[QF];if(!(c!==null&&n<c)&&lS(a,n)&&lS(o[Qo]??-1,n)){let l=ts(s,e),d=!i&&!0&&(cw(l)!==null||ov(l,Ot.Loading)!==null||ov(l,Ot.Placeholder))?av:dw;try{d(n,o,t,e,r)}catch(f){Bv(r,f)}}}function lO(n,e){let t=n[Wr]?.findIndex(r=>r.data[bv]===e[Hf])??-1;return{dehydratedView:t>-1?n[Wr][t]:null,dehydratedViewIx:t}}function dw(n,e,t,i,r){ct(it.DeferBlockStateStart);let s=rO(n,r,i);if(s!==null){e[Hf]=n;let o=r[xe],a=s+bt,c=$o(o,a),l=0;zv(t,l);let u;if(n===Ot.Complete){let p=ts(o,i),v=p.providers;v&&v.length>0&&(u=cO(r[An],p,v))}let{dehydratedView:d,dehydratedViewIx:f}=lO(t,e),h=bl(r,c,null,{injector:u,dehydratedView:d});if(Ml(t,h,l,ia(c,d)),Lf(h,2),f>-1&&t[Wr]?.splice(f,1),(n===Ot.Complete||n===Ot.Error)&&Array.isArray(e[Dy])){for(let p of e[Dy])p();e[Dy]=null}}ct(it.DeferBlockStateEnd)}function uO(n,e,t,i,r){let s=Date.now(),o=r[xe],a=ts(o,i);if(e[sl]===null||e[sl]<=s){e[sl]=null;let c=cw(a),l=e[af]!==null;if(n===Ot.Loading&&c!==null&&!l){e[Qo]=n;let u=cS(c,e,i,t,r);e[af]=u}else{n>Ot.Loading&&l&&(e[af](),e[af]=null,e[Qo]=null),dw(n,e,t,i,r);let u=ov(a,n);u!==null&&(e[sl]=s+u,cS(u,e,i,t,r))}}else e[Qo]=n}function cS(n,e,t,i,r){return oO(n,()=>{let o=e[Qo];e[sl]=null,e[Qo]=null,o!==null&&xr(o,t,i)},r[An])}function lS(n,e){return n<e}function dO(n,e){let t=n[e.index];xr(Ot.Placeholder,e,t)}function uS(n,e,t){n.loadingPromise.then(()=>{n.loadingState===Hn.COMPLETE?xr(Ot.Complete,e,t):n.loadingState===Hn.FAILED&&xr(Ot.Error,e,t)})}var av=null;function fO(n,e,t,i){let r=n.consts;t!=null&&(e.placeholderBlockConfig=In(r,t)),i!=null&&(e.loadingBlockConfig=In(r,i)),av===null&&(av=uO)}function Jv(n){return typeof n=="function"&&n[gn]!==void 0}function Kv(n){return Jv(n)&&typeof n.set=="function"}var fw=new Be("");function Zs(n){return!!n&&typeof n.then=="function"}function Gf(n){return!!n&&typeof n.subscribe=="function"}var hw=new Be("");var Qv=(()=>{class n{resolve;reject;initialized=!1;done=!1;donePromise=new Promise((t,i)=>{this.resolve=t,this.reject=i});appInits=ve(hw,{optional:!0})??[];injector=ve(_i);constructor(){}runInitializers(){if(this.initialized)return;let t=[];for(let r of this.appInits){let s=Vo(this.injector,r);if(Zs(s))t.push(s);else if(Gf(s)){let o=new Promise((a,c)=>{s.subscribe({complete:a,error:c})});t.push(o)}}let i=()=>{this.done=!0,this.resolve()};Promise.all(t).then(()=>{i()}).catch(r=>{this.reject(r)}),t.length===0&&i(),this.initialized=!0}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),pw=new Be("");function mw(){yg(()=>{let n="";throw new Fe(600,n)})}function gw(n){return n.isBoundToModule}var hO=10;var Js=(()=>{class n{_runningTick=!1;_destroyed=!1;_destroyListeners=[];_views=[];internalErrorHandler=ve(Wi);afterRenderManager=ve(Rv);zonelessEnabled=ve(Yo);rootEffectScheduler=ve(My);dirtyFlags=0;tracingSnapshot=null;allTestViews=new Set;autoDetectTestViews=new Set;includeAllTestViews=!1;afterTick=new Ut;get allViews(){return[...(this.includeAllTestViews?this.allTestViews:this.autoDetectTestViews).keys(),...this._views]}get destroyed(){return this._destroyed}componentTypes=[];components=[];internalPendingTask=ve(Kr);get isStable(){return this.internalPendingTask.hasPendingTasksObservable.pipe(Tn(t=>!t))}constructor(){ve(es,{optional:!0})}whenStable(){let t;return new Promise(i=>{t=this.isStable.subscribe({next:r=>{r&&i()}})}).finally(()=>{t.unsubscribe()})}_injector=ve(vn);_rendererFactory=null;get injector(){return this._injector}bootstrap(t,i){return this.bootstrapImpl(t,i)}bootstrapImpl(t,i,r=_i.NULL){return this._injector.get(Bt).run(()=>{ct(it.BootstrapComponentStart);let o=t instanceof Uf;if(!this._injector.get(Qv).done){let p="";throw new Fe(405,p)}let c;o?c=t:c=this._injector.get(Bf).resolveComponentFactory(t),this.componentTypes.push(c.componentType);let l=gw(c)?void 0:this._injector.get(hl),u=i||c.selector,d=c.create(r,[],u,l),f=d.location.nativeElement,h=d.injector.get(fw,null);return h?.registerApplication(f),d.onDestroy(()=>{this.detachView(d.hostView),ol(this.components,d),h?.unregisterApplication(f)}),this._loadComponent(d),ct(it.BootstrapComponentEnd,d),d})}tick(){this.zonelessEnabled||(this.dirtyFlags|=1),this._tick()}_tick(){ct(it.ChangeDetectionStart),this.tracingSnapshot!==null?this.tracingSnapshot.run(Nf.CHANGE_DETECTION,this.tickImpl):this.tickImpl()}tickImpl=()=>{if(this._runningTick)throw ct(it.ChangeDetectionEnd),new Fe(101,!1);let t=ke(null);try{this._runningTick=!0,this.synchronize()}finally{this._runningTick=!1,this.tracingSnapshot?.dispose(),this.tracingSnapshot=null,ke(t),this.afterTick.next(),ct(it.ChangeDetectionEnd)}};synchronize(){this._rendererFactory===null&&!this._injector.destroyed&&(this._rendererFactory=this._injector.get(dl,null,{optional:!0}));let t=0;for(;this.dirtyFlags!==0&&t++<hO;){ct(it.ChangeDetectionSyncStart);try{this.synchronizeOnce()}finally{ct(it.ChangeDetectionSyncEnd)}}}synchronizeOnce(){this.dirtyFlags&16&&(this.dirtyFlags&=-17,this.rootEffectScheduler.flush());let t=!1;if(this.dirtyFlags&7){let i=!!(this.dirtyFlags&1);this.dirtyFlags&=-8,this.dirtyFlags|=8;for(let{_lView:r}of this.allViews){if(!i&&!Yc(r))continue;let s=i&&!this.zonelessEnabled?0:1;AE(r,s),t=!0}if(this.dirtyFlags&=-5,this.syncDirtyFlagsWithViews(),this.dirtyFlags&23)return}t||(this._rendererFactory?.begin?.(),this._rendererFactory?.end?.()),this.dirtyFlags&8&&(this.dirtyFlags&=-9,this.afterRenderManager.execute()),this.syncDirtyFlagsWithViews()}syncDirtyFlagsWithViews(){if(this.allViews.some(({_lView:t})=>Yc(t))){this.dirtyFlags|=2;return}else this.dirtyFlags&=-8}attachView(t){let i=t;this._views.push(i),i.attachToAppRef(this)}detachView(t){let i=t;ol(this._views,i),i.detachFromAppRef()}_loadComponent(t){this.attachView(t.hostView);try{this.tick()}catch(r){this.internalErrorHandler(r)}this.components.push(t),this._injector.get(pw,[]).forEach(r=>r(t))}ngOnDestroy(){if(!this._destroyed)try{this._destroyListeners.forEach(t=>t()),this._views.slice().forEach(t=>t.destroy())}finally{this._destroyed=!0,this._views=[],this._destroyListeners=[]}}onDestroy(t){return this._destroyListeners.push(t),()=>ol(this._destroyListeners,t)}destroy(){if(this._destroyed)throw new Fe(406,!1);let t=this._injector;t.destroy&&!t.destroyed&&t.destroy()}get viewCount(){return this._views.length}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function ol(n,e){let t=n.indexOf(e);t>-1&&n.splice(t,1)}function yw(n,e,t){let i=e[An],r=e[xe];if(n.loadingState!==Hn.NOT_STARTED)return n.loadingPromise??Promise.resolve();let s=Sl(e,t),o=sO(r,n);n.loadingState=Hn.IN_PROGRESS,pf(1,s);let a=n.dependencyResolverFn,c=i.get(tl).add();return a?(n.loadingPromise=Promise.allSettled(a()).then(l=>{let u=!1,d=null,f=[],h=[];for(let p=0;p<l.length;p++){let v=l[p];if(v.status==="fulfilled"){let m=v.value,g=Hr(m)||Bd(m);if(g)f.push(g);else{let M=Ug(m);M&&h.push(M)}}else{u=!0,d=v.reason instanceof Error?v.reason:new Error(String(v.reason));break}}if(u){if(n.loadingState=Hn.FAILED,n.errorTmplIndex===null){let v="",m=new Fe(-750,v);Bv(e,m)}}else{n.loadingState=Hn.COMPLETE;let p=o.tView;if(f.length>0){p.directiveRegistry=aS(p.directiveRegistry,f);let v=f.map(g=>g.type),m=Gd(!1,...v);n.providers=m}h.length>0&&(p.pipeRegistry=aS(p.pipeRegistry,h))}}),n.loadingPromise.finally(()=>{n.loadingPromise=null,c()})):(n.loadingPromise=Promise.resolve().then(()=>{n.loadingPromise=null,n.loadingState=Hn.COMPLETE,c()}),n.loadingPromise)}function pO(n,e){return e[An].get(uw,null,{optional:!0})?.behavior!==Zv.Manual}function mO(n,e,t){let i=e[xe],r=e[t.index];if(!pO(n,e))return;let s=Sl(e,t),o=ts(i,t);switch(ow(s),o.loadingState){case Hn.NOT_STARTED:xr(Ot.Loading,t,r),yw(o,e,t),o.loadingState===Hn.IN_PROGRESS&&uS(o,t,r);break;case Hn.IN_PROGRESS:xr(Ot.Loading,t,r),uS(o,t,r);break;case Hn.COMPLETE:xr(Ot.Complete,t,r);break;case Hn.FAILED:xr(Ot.Error,t,r);break;default:}}function gO(n,e,t){return n===0?dS(e,t):n===2?!dS(e,t):!0}function yO(n){return n!=null&&(n&1)===1}function dS(n,e){let t=n[An],i=ts(n[xe],e),r=Sv(t),s=yO(i.flags),a=Sl(n,e)[KF]!==null;return!(s&&a&&r)}function vO(n,e,t,i,r,s,o,a,c,l){let u=Re(),d=Mt(),f=n+bt,h=sa(u,d,n,null,0,0),p=u[An],v=Sv(p);if(d.firstCreatePass){qi("NgDefer");let E={primaryTmplIndex:e,loadingTmplIndex:i??null,placeholderTmplIndex:r??null,errorTmplIndex:s??null,placeholderBlockConfig:null,loadingBlockConfig:null,dependencyResolverFn:t??null,loadingState:Hn.NOT_STARTED,loadingPromise:null,providers:null,hydrateTriggers:null,debug:null,flags:l??0};c?.(d,E,a,o),iO(d,f,E)}let m=u[f];qE(m,h,u);let g=null,M=null;if(m[Wr]?.length>0){let E=m[Wr][0].data;M=E[xv]??null,g=E[bv]}let w=[null,sw.Initial,null,null,null,null,M,g,null,null];nO(u,f,w);let _=null;M!==null&&v&&(_=p.get(YS),_.add(M,{lView:u,tNode:h,lContainer:m}));let S=()=>{ow(w),M!==null&&_?.cleanup([M])};tO(0,w,()=>iy(u,S)),Xd(u,S)}function _O(){let n=Re(),e=en();if(!gO(0,n,e))return;ts(n[xe],e).loadingTmplIndex===null&&dO(n,e),mO(0,n,e)}function ns(n,e,t,i){let r=Re(),s=Xr();if(Zn(r,s,e)){let o=Mt(),a=Xo();EP(a,r,n,e,t,i)}return ns}var cv=class{destroy(e){}updateValue(e,t){}swap(e,t){let i=Math.min(e,t),r=Math.max(e,t),s=this.detach(r);if(r-i>1){let o=this.detach(i);this.attach(i,s),this.attach(r,o)}else this.attach(i,s)}move(e,t){this.attach(t,this.detach(e))}};function Iy(n,e,t,i,r){return n===t&&Object.is(e,i)?1:Object.is(r(n,e),r(t,i))?-1:0}function xO(n,e,t,i){let r,s,o=0,a=n.length-1,c=void 0;if(Array.isArray(e)){ke(i);let l=e.length-1;for(ke(null);o<=a&&o<=l;){let u=n.at(o),d=e[o],f=Iy(o,u,o,d,t);if(f!==0){f<0&&n.updateValue(o,d),o++;continue}let h=n.at(a),p=e[l],v=Iy(a,h,l,p,t);if(v!==0){v<0&&n.updateValue(a,p),a--,l--;continue}let m=t(o,u),g=t(a,h),M=t(o,d);if(Object.is(M,g)){let w=t(l,p);Object.is(w,m)?(n.swap(o,a),n.updateValue(a,p),l--,a--):n.move(a,o),n.updateValue(o,d),o++;continue}if(r??=new Tf,s??=hS(n,o,a,t),lv(n,r,o,M))n.updateValue(o,d),o++,a++;else if(s.has(M))r.set(m,n.detach(o)),a--;else{let w=n.create(o,e[o]);n.attach(o,w),o++,a++}}for(;o<=l;)fS(n,r,t,o,e[o]),o++}else if(e!=null){ke(i);let l=e[Symbol.iterator]();ke(null);let u=l.next();for(;!u.done&&o<=a;){let d=n.at(o),f=u.value,h=Iy(o,d,o,f,t);if(h!==0)h<0&&n.updateValue(o,f),o++,u=l.next();else{r??=new Tf,s??=hS(n,o,a,t);let p=t(o,f);if(lv(n,r,o,p))n.updateValue(o,f),o++,a++,u=l.next();else if(!s.has(p))n.attach(o,n.create(o,f)),o++,a++,u=l.next();else{let v=t(o,d);r.set(v,n.detach(o)),a--}}}for(;!u.done;)fS(n,r,t,n.length,u.value),u=l.next()}for(;o<=a;)n.destroy(n.detach(a--));r?.forEach(l=>{n.destroy(l)})}function lv(n,e,t,i){return e!==void 0&&e.has(i)?(n.attach(t,e.get(i)),e.delete(i),!0):!1}function fS(n,e,t,i,r){if(lv(n,e,i,t(i,r)))n.updateValue(i,r);else{let s=n.create(i,r);n.attach(i,s)}}function hS(n,e,t,i){let r=new Set;for(let s=e;s<=t;s++)r.add(i(s,n.at(s)));return r}var Tf=class{kvMap=new Map;_vMap=void 0;has(e){return this.kvMap.has(e)}delete(e){if(!this.has(e))return!1;let t=this.kvMap.get(e);return this._vMap!==void 0&&this._vMap.has(t)?(this.kvMap.set(e,this._vMap.get(t)),this._vMap.delete(t)):this.kvMap.delete(e),!0}get(e){return this.kvMap.get(e)}set(e,t){if(this.kvMap.has(e)){let i=this.kvMap.get(e);this._vMap===void 0&&(this._vMap=new Map);let r=this._vMap;for(;r.has(i);)i=r.get(i);r.set(i,t)}else this.kvMap.set(e,t)}forEach(e){for(let[t,i]of this.kvMap)if(e(i,t),this._vMap!==void 0){let r=this._vMap;for(;r.has(i);)i=r.get(i),e(i,t)}}};function fa(n,e,t,i,r,s,o,a){qi("NgControlFlow");let c=Re(),l=Mt(),u=In(l.consts,s);return sa(c,l,n,e,t,i,r,u,256,o,a),e_}function e_(n,e,t,i,r,s,o,a){qi("NgControlFlow");let c=Re(),l=Mt(),u=In(l.consts,s);return sa(c,l,n,e,t,i,r,u,512,o,a),e_}function ha(n,e){qi("NgControlFlow");let t=Re(),i=Xr(),r=t[i]!==_n?t[i]:-1,s=r!==-1?Cf(t,bt+r):void 0,o=0;if(Zn(t,i,n)){let a=ke(null);try{if(s!==void 0&&zv(s,o),n!==-1){let c=bt+n,l=Cf(t,c),u=hv(t[xe],c),d=LE(l,u,t),f=bl(t,u,e,{dehydratedView:d});Ml(l,f,o,ia(u,d))}}finally{ke(a)}}else if(s!==void 0){let a=FE(s,o);a!==void 0&&(a[Vt]=e)}}var uv=class{lContainer;$implicit;$index;constructor(e,t,i){this.lContainer=e,this.$implicit=t,this.$index=i}get $count(){return this.lContainer.length-Ft}};function bO(n){return n}function jf(n,e){return e}var dv=class{hasEmptyBlock;trackByFn;liveCollection;constructor(e,t,i){this.hasEmptyBlock=e,this.trackByFn=t,this.liveCollection=i}};function pa(n,e,t,i,r,s,o,a,c,l,u,d,f){qi("NgControlFlow");let h=Re(),p=Mt(),v=c!==void 0,m=Re(),g=a?o.bind(m[qn][Vt]):o,M=new dv(v,g);m[bt+n]=M,sa(h,p,n+1,e,t,i,r,In(p.consts,s),256),v&&sa(h,p,n+2,c,l,u,d,In(p.consts,f),512)}var fv=class extends cv{lContainer;hostLView;templateTNode;operationsCounter=void 0;needsIndexUpdate=!1;constructor(e,t,i){super(),this.lContainer=e,this.hostLView=t,this.templateTNode=i}get length(){return this.lContainer.length-Ft}at(e){return this.getLView(e)[Vt].$implicit}attach(e,t){let i=t[Ho];this.needsIndexUpdate||=e!==this.length,Ml(this.lContainer,t,e,ia(this.templateTNode,i)),MO(this.lContainer,e)}detach(e){return this.needsIndexUpdate||=e!==this.length-1,SO(this.lContainer,e),EO(this.lContainer,e)}create(e,t){let i=Yy(this.lContainer,this.templateTNode.tView.ssrId);return bl(this.hostLView,this.templateTNode,new uv(this.lContainer,t,e),{dehydratedView:i})}destroy(e){Pf(e[xe],e)}updateValue(e,t){this.getLView(e)[Vt].$implicit=t}reset(){this.needsIndexUpdate=!1}updateIndexes(){if(this.needsIndexUpdate)for(let e=0;e<this.length;e++)this.getLView(e)[Vt].$index=e}getLView(e){return wO(this.lContainer,e)}};function ma(n){let e=ke(null),t=Yn();try{let i=Re(),r=i[xe],s=i[t],o=t+1,a=Cf(i,o);if(s.liveCollection===void 0){let l=hv(r,o);s.liveCollection=new fv(a,i,l)}else s.liveCollection.reset();let c=s.liveCollection;if(xO(c,n,s.trackByFn,e),c.updateIndexes(),s.hasEmptyBlock){let l=Xr(),u=c.length===0;if(Zn(i,l,u)){let d=t+2,f=Cf(i,d);if(u){let h=hv(r,d),p=LE(f,h,i),v=bl(i,h,void 0,{dehydratedView:p});Ml(f,v,0,ia(h,p))}else r.firstUpdatePass&&qP(f),zv(f,0)}}}finally{ke(e)}}function Cf(n,e){return n[e]}function MO(n,e){if(n.length<=Ft)return;let t=Ft+e,i=n[t],r=i?i[jr]:void 0;if(i&&r&&r.detachedLeaveAnimationFns&&r.detachedLeaveAnimationFns.length>0){let s=i[An];eP(s,r),cl.delete(i[yr]),r.detachedLeaveAnimationFns=void 0}}function SO(n,e){if(n.length<=Ft)return;let t=Ft+e,i=n[t],r=i?i[jr]:void 0;r&&r.leave&&r.leave.size>0&&(r.detachedLeaveAnimationFns=[])}function EO(n,e){return ul(n,e)}function wO(n,e){return FE(n,e)}function hv(n,e){return $o(n,e)}function vw(n,e,t){let i=Re(),r=Xr();if(Zn(i,r,e)){let s=Mt(),o=Xo();ME(o,i,n,e,i[xt],t)}return vw}function pv(n,e,t,i,r){Vv(e,n,t,r?"class":"style",i)}function Df(n,e,t,i){let r=Re(),s=r[xe],o=n+bt,a=s.firstCreatePass?Gv(o,r,2,e,Lv,Yd(),t,i):s.data[o];if(_r(a)){let c=r[bi].tracingService;if(c&&c.componentCreate){let l=s.data[a.directiveStart+a.componentOffset];return c.componentCreate(jE(l),()=>(pS(n,e,r,a,i),Df))}}return pS(n,e,r,a,i),Df}function pS(n,e,t,i,r){if(kv(i,t,n,e,xw),jo(i)){let s=t[xe];Of(s,t,i),Ev(s,i,t)}r!=null&&xl(t,i)}function t_(){let n=Mt(),e=en(),t=Uv(e);return n.firstCreatePass&&jv(n,t),ay(t)&&cy(),oy(),t.classesWithoutHost!=null&&DR(t)&&pv(n,t,Re(),t.classesWithoutHost,!0),t.stylesWithoutHost!=null&&AR(t)&&pv(n,t,Re(),t.stylesWithoutHost,!1),t_}function _w(n,e,t,i){return Df(n,e,t,i),t_(),_w}function Yi(n,e,t,i){let r=Re(),s=r[xe],o=n+bt,a=s.firstCreatePass?aF(o,s,2,e,t,i):s.data[o];return kv(a,r,n,e,xw),i!=null&&xl(r,a),Yi}function fi(){let n=en(),e=Uv(n);return ay(e)&&cy(),oy(),fi}function is(n,e,t,i){return Yi(n,e,t,i),fi(),is}var xw=(n,e,t,i,r)=>(el(!0),aE(e[xt],i,yy()));function n_(n,e,t){let i=Re(),r=i[xe],s=n+bt,o=r.firstCreatePass?Gv(s,i,8,"ng-container",Lv,Yd(),e,t):r.data[s];if(kv(o,i,n,"ng-container",TO),jo(o)){let a=i[xe];Of(a,i,o),Ev(a,o,i)}return t!=null&&xl(i,o),n_}function i_(){let n=Mt(),e=en(),t=Uv(e);return n.firstCreatePass&&jv(n,t),i_}function bw(n,e,t){return n_(n,e,t),i_(),bw}var TO=(n,e,t,i,r)=>(el(!0),CN(e[xt],""));function r_(){return Re()}function ga(n,e,t){let i=Re(),r=Xr();if(Zn(i,r,e)){let s=Mt(),o=Xo();SE(o,i,n,e,i[xt],t)}return ga}var nl=void 0;function CO(n){let e=Math.floor(Math.abs(n)),t=n.toString().replace(/^[^.]*\.?/,"").length;return e===1&&t===0?1:5}var DO=["en",[["a","p"],["AM","PM"]],[["AM","PM"]],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],nl,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],nl,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm\u202Fa","h:mm:ss\u202Fa","h:mm:ss\u202Fa z","h:mm:ss\u202Fa zzzz"],["{1}, {0}",nl,nl,nl],[".",",",";","%","+","-","E","\xD7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0%","\xA4#,##0.00","#E0"],"USD","$","US Dollar",{},"ltr",CO],Ry=Object.create(null);function Wf(n){let e=AO(n),t=mS(e);if(t)return t;let i=e.split("-")[0];if(t=mS(i),t)return t;if(i==="en")return DO;throw new Fe(701,!1)}function mS(n){if(!(n in Ry)){let e=Hi.ng&&Hi.ng.common&&Hi.ng.common.locales&&Hi.ng.common.locales[n];return e!==void 0&&(Ry[n]=e),e}return Ry[n]}var Ks=(function(n){return n[n.LocaleId=0]="LocaleId",n[n.DayPeriodsFormat=1]="DayPeriodsFormat",n[n.DayPeriodsStandalone=2]="DayPeriodsStandalone",n[n.DaysFormat=3]="DaysFormat",n[n.DaysStandalone=4]="DaysStandalone",n[n.MonthsFormat=5]="MonthsFormat",n[n.MonthsStandalone=6]="MonthsStandalone",n[n.Eras=7]="Eras",n[n.FirstDayOfWeek=8]="FirstDayOfWeek",n[n.WeekendRange=9]="WeekendRange",n[n.DateFormat=10]="DateFormat",n[n.TimeFormat=11]="TimeFormat",n[n.DateTimeFormat=12]="DateTimeFormat",n[n.NumberSymbols=13]="NumberSymbols",n[n.NumberFormats=14]="NumberFormats",n[n.CurrencyCode=15]="CurrencyCode",n[n.CurrencySymbol=16]="CurrencySymbol",n[n.CurrencyName=17]="CurrencyName",n[n.Currencies=18]="Currencies",n[n.Directionality=19]="Directionality",n[n.PluralCase=20]="PluralCase",n[n.ExtraData=21]="ExtraData",n})(Ks||{});function AO(n){return n.toLowerCase().replace(/_/g,"-")}var El="en-US";var IO=El;function Mw(n){typeof n=="string"&&(IO=n.toLowerCase().replace(/_/g,"-"))}function Sr(n,e,t){let i=Re(),r=Mt(),s=en();return Sw(r,i,i[xt],s,n,e,t),Sr}function wl(n,e,t){let i=Re(),r=Mt(),s=en();return(s.type&3||t)&&zE(s,r,i,t,i[xt],n,e,hf(s,i,e)),wl}function Sw(n,e,t,i,r,s,o){let a=!0,c=null;if((i.type&3||o)&&(c??=hf(i,e,s),zE(i,n,e,o,t,r,s,c)&&(a=!1)),a){let l=i.outputs?.[r],u=i.hostDirectiveOutputs?.[r];if(u&&u.length)for(let d=0;d<u.length;d+=2){let f=u[d],h=u[d+1];c??=hf(i,e,s),nS(i,e,f,h,r,c)}if(l&&l.length)for(let d of l)c??=hf(i,e,s),nS(i,e,d,r,r,c)}}function Jn(n=1){return EM(n)}function Ew(n,e,t){return YE(n,e,t),Ew}function RO(n){let e=Re(),t=Mt(),i=Jd();Qc(i+1);let r=qv(t,i);if(n.dirty&&oM(e)===((r.metadata.flags&2)===2)){if(r.matches===null)n.reset([]);else{let s=ZE(e,i);n.reset(s,LS),n.notifyOnChanges()}return!0}return!1}function NO(){return $v(Re(),Jd())}function ww(n,e,t,i){return PF(n,YE(e,t,i)),ww}function PO(n=1){Qc(Jd()+n)}function FO(n){let e=dy();return Wd(e,bt+n)}function cf(n,e){return n<<17|e<<2}function Xs(n){return n>>17&32767}function OO(n){return(n&2)==2}function LO(n,e){return n&131071|e<<17}function mv(n){return n|2}function oa(n){return(n&131068)>>2}function Ny(n,e){return n&-131069|e<<2}function kO(n){return(n&1)===1}function gv(n){return n|1}function UO(n,e,t,i,r,s){let o=s?e.classBindings:e.styleBindings,a=Xs(o),c=oa(o);n[i]=t;let l=!1,u;if(Array.isArray(t)){let d=t;u=d[1],(u===null||Bo(d,u)>0)&&(l=!0)}else u=t;if(r)if(c!==0){let f=Xs(n[a+1]);n[i+1]=cf(f,a),f!==0&&(n[f+1]=Ny(n[f+1],i)),n[a+1]=LO(n[a+1],i)}else n[i+1]=cf(a,0),a!==0&&(n[a+1]=Ny(n[a+1],i)),a=i;else n[i+1]=cf(c,0),a===0?a=i:n[c+1]=Ny(n[c+1],i),c=i;l&&(n[i+1]=mv(n[i+1])),gS(n,u,i,!0),gS(n,u,i,!1),BO(e,u,n,i,s),o=cf(a,c),s?e.classBindings=o:e.styleBindings=o}function BO(n,e,t,i,r){let s=r?n.residualClasses:n.residualStyles;s!=null&&typeof e=="string"&&Bo(s,e)>=0&&(t[i+1]=gv(t[i+1]))}function gS(n,e,t,i){let r=n[t+1],s=e===null,o=i?Xs(r):oa(r),a=!1;for(;o!==0&&(a===!1||s);){let c=n[o],l=n[o+1];VO(c,e)&&(a=!0,n[o+1]=i?gv(l):mv(l)),o=i?Xs(l):oa(l)}a&&(n[t+1]=i?mv(r):gv(r))}function VO(n,e){return n===null||e==null||(Array.isArray(n)?n[1]:n)===e?!0:Array.isArray(n)&&typeof e=="string"?Bo(n,e)>=0:!1}var Yt={textEnd:0,key:0,keyEnd:0,value:0,valueEnd:0};function Tw(n){return n.substring(Yt.key,Yt.keyEnd)}function HO(n){return n.substring(Yt.value,Yt.valueEnd)}function zO(n){return Aw(n),Cw(n,aa(n,0,Yt.textEnd))}function Cw(n,e){let t=Yt.textEnd;return t===e?-1:(e=Yt.keyEnd=jO(n,Yt.key=e,t),aa(n,e,t))}function GO(n){return Aw(n),Dw(n,aa(n,0,Yt.textEnd))}function Dw(n,e){let t=Yt.textEnd,i=Yt.key=aa(n,e,t);return t===i?-1:(i=Yt.keyEnd=WO(n,i,t),i=yS(n,i,t,58),i=Yt.value=aa(n,i,t),i=Yt.valueEnd=$O(n,i,t),yS(n,i,t,59))}function Aw(n){Yt.key=0,Yt.keyEnd=0,Yt.value=0,Yt.valueEnd=0,Yt.textEnd=n.length}function aa(n,e,t){for(;e<t&&n.charCodeAt(e)<=32;)e++;return e}function jO(n,e,t){for(;e<t&&n.charCodeAt(e)>32;)e++;return e}function WO(n,e,t){let i;for(;e<t&&((i=n.charCodeAt(e))===45||i===95||(i&-33)>=65&&(i&-33)<=90||i>=48&&i<=57);)e++;return e}function yS(n,e,t,i){return e=aa(n,e,t),e<t&&e++,e}function $O(n,e,t){let i=-1,r=-1,s=-1,o=e,a=o;for(;o<t;){let c=n.charCodeAt(o++);if(c===59)return a;c===34||c===39?a=o=vS(n,c,o,t):e===o-4&&s===85&&r===82&&i===76&&c===40?a=o=vS(n,41,o,t):c>32&&(a=o),s=r,r=i,i=c&-33}return a}function vS(n,e,t,i){let r=-1,s=t;for(;s<i;){let o=n.charCodeAt(s++);if(o==e&&r!==92)return s;o==92&&r===92?r=0:r=o}throw new Error}function Qs(n,e,t){return Iw(n,e,t,!1),Qs}function ya(n,e){return Iw(n,e,null,!0),ya}function qO(n){Rw(Fw,XO,n,!1)}function XO(n,e){for(let t=GO(e);t>=0;t=Dw(e,t))Fw(n,Tw(e),HO(e))}function YO(n){Rw(nL,ZO,n,!0)}function ZO(n,e){for(let t=zO(e);t>=0;t=Cw(e,t))Gc(n,Tw(e),!0)}function Iw(n,e,t,i){let r=Re(),s=Mt(),o=Kc(2);if(s.firstUpdatePass&&Pw(s,n,o,i),e!==_n&&Zn(r,o,e)){let a=s.data[Yn()];Ow(s,a,r,r[xt],n,r[o+1]=rL(e,t),i,o)}}function Rw(n,e,t,i){let r=Mt(),s=Kc(2);r.firstUpdatePass&&Pw(r,null,s,i);let o=Re();if(t!==_n&&Zn(o,s,t)){let a=r.data[Yn()];if(Lw(a,i)&&!Nw(r,s)){let c=i?a.classesWithoutHost:a.stylesWithoutHost;c!==null&&(t=Ld(c,t||"")),pv(r,a,o,t,i)}else iL(r,a,o,o[xt],o[s+1],o[s+1]=tL(n,e,t),i,s)}}function Nw(n,e){return e>=n.expandoStartIndex}function Pw(n,e,t,i){let r=n.data;if(r[t+1]===null){let s=r[Yn()],o=Nw(n,t);Lw(s,i)&&e===null&&!o&&(e=!1),e=JO(r,s,e,i),UO(r,s,e,t,o,i)}}function JO(n,e,t,i){let r=xM(n),s=i?e.residualClasses:e.residualStyles;if(r===null)(i?e.classBindings:e.styleBindings)===0&&(t=Py(null,n,e,t,i),t=ml(t,e.attrs,i),s=null);else{let o=e.directiveStylingLast;if(o===-1||n[o]!==r)if(t=Py(r,n,e,t,i),s===null){let c=KO(n,e,i);c!==void 0&&Array.isArray(c)&&(c=Py(null,n,e,c[1],i),c=ml(c,e.attrs,i),QO(n,e,i,c))}else s=eL(n,e,i)}return s!==void 0&&(i?e.residualClasses=s:e.residualStyles=s),t}function KO(n,e,t){let i=t?e.classBindings:e.styleBindings;if(oa(i)!==0)return n[Xs(i)]}function QO(n,e,t,i){let r=t?e.classBindings:e.styleBindings;n[Xs(r)]=i}function eL(n,e,t){let i,r=e.directiveEnd;for(let s=1+e.directiveStylingLast;s<r;s++){let o=n[s].hostAttrs;i=ml(i,o,t)}return ml(i,e.attrs,t)}function Py(n,e,t,i,r){let s=null,o=t.directiveEnd,a=t.directiveStylingLast;for(a===-1?a=t.directiveStart:a++;a<o&&(s=e[a],i=ml(i,s.hostAttrs,r),s!==n);)a++;return n!==null&&(t.directiveStylingLast=a),i}function ml(n,e,t){let i=t?1:2,r=-1;if(e!==null)for(let s=0;s<e.length;s++){let o=e[s];typeof o=="number"?r=o:r===i&&(Array.isArray(n)||(n=n===void 0?[]:["",n]),Gc(n,o,t?!0:e[++s]))}return n===void 0?null:n}function tL(n,e,t){if(t==null||t==="")return yn;let i=[],r=vl(t);if(Array.isArray(r))for(let s=0;s<r.length;s++)n(i,r[s],!0);else if(r instanceof Set)for(let s of r)n(i,s,!0);else if(typeof r=="object")for(let s in r)r.hasOwnProperty(s)&&n(i,s,r[s]);else typeof r=="string"&&e(i,r);return i}function Fw(n,e,t){Gc(n,e,vl(t))}function nL(n,e,t){let i=String(e);i!==""&&!i.includes(" ")&&Gc(n,i,t)}function iL(n,e,t,i,r,s,o,a){r===_n&&(r=yn);let c=0,l=0,u=0<r.length?r[0]:null,d=0<s.length?s[0]:null;for(;u!==null||d!==null;){let f=c<r.length?r[c+1]:void 0,h=l<s.length?s[l+1]:void 0,p=null,v;u===d?(c+=2,l+=2,f!==h&&(p=d,v=h)):d===null||u!==null&&u<d?(c+=2,p=u):(l+=2,p=d,v=h),p!==null&&Ow(n,e,t,i,p,v,o,a),u=c<r.length?r[c]:null,d=l<s.length?s[l]:null}}function Ow(n,e,t,i,r,s,o,a){if(!(e.type&3))return;let c=n.data,l=c[a+1],u=kO(l)?_S(c,e,t,r,oa(l),o):void 0;if(!Af(u)){Af(s)||OO(l)&&(s=_S(c,null,t,r,a,o));let d=ey(Yn(),t);mP(i,o,d,r,s)}}function _S(n,e,t,i,r,s){let o=e===null,a;for(;r>0;){let c=n[r],l=Array.isArray(c),u=l?c[1]:c,d=u===null,f=t[r+1];f===_n&&(f=d?yn:void 0);let h=d?zd(f,i):u===i?f:void 0;if(l&&!Af(h)&&(h=zd(c,i)),Af(h)&&(a=h,o))return a;let p=n[r+1];r=o?Xs(p):oa(p)}if(e!==null){let c=s?e.residualClasses:e.residualStyles;c!=null&&(a=zd(c,i))}return a}function Af(n){return n!==void 0}function rL(n,e){return n==null||n===""||(typeof e=="string"?n=n+e:typeof n=="object"&&(n=Od(vl(n)))),n}function Lw(n,e){return(n.flags&(e?8:16))!==0}function Tl(n,e=""){let t=Re(),i=Mt(),r=n+bt,s=i.firstCreatePass?ua(i,r,1,e,null):i.data[r],o=sL(i,t,s,e);t[r]=o,ef()&&Fv(i,t,o,s),Gs(s,!1)}var sL=(n,e,t,i)=>(el(!0),wN(e[xt],i));function kw(n,e,t,i=""){return Zn(n,Xr(),t)?e+gr(t)+i:_n}function Uw(n,e,t,i,r,s=""){let o=py(),a=HE(n,o,t,r);return Kc(2),a?e+gr(t)+i+gr(r)+s:_n}function oL(n,e,t,i,r,s,o,a=""){let c=py(),l=lF(n,c,t,r,o);return Kc(3),l?e+gr(t)+i+gr(r)+s+gr(o)+a:_n}function va(n){return s_("",n),va}function s_(n,e,t){let i=Re(),r=kw(i,n,e,t);return r!==_n&&o_(i,Yn(),r),s_}function Bw(n,e,t,i,r){let s=Re(),o=Uw(s,n,e,t,i,r);return o!==_n&&o_(s,Yn(),o),Bw}function Vw(n,e,t,i,r,s,o){let a=Re(),c=oL(a,n,e,t,i,r,s,o);return c!==_n&&o_(a,Yn(),c),Vw}function o_(n,e,t){let i=ey(e,n);TN(n[xt],i,t)}function Hw(n,e,t){Kv(e)&&(e=e());let i=Re(),r=Xr();if(Zn(i,r,e)){let s=Mt(),o=Xo();ME(o,i,n,e,i[xt],t)}return Hw}function aL(n,e){let t=Kv(n);return t&&n.set(e),t}function zw(n,e){let t=Re(),i=Mt(),r=en();return Sw(i,t,t[xt],r,n,e),zw}var Gw={};function jw(n){qi("NgLet");let e=Mt(),t=Re(),i=n+bt,r=ua(e,i,128,null,null);return Gs(r,!1),Xc(e,t,i,Gw),jw}function cL(n){let e=Mt(),t=Re(),i=Yn();return Xc(e,t,i,n),n}function lL(n){let e=dy(),t=Wd(e,bt+n);if(t===Gw)throw new Fe(314,!1);return t}function uL(n,e,t=""){return kw(Re(),n,e,t)}function dL(n,e,t,i,r=""){return Uw(Re(),n,e,t,i,r)}function xS(n,e,t){let i=Mt();i.firstCreatePass&&Ww(e,i.data,i.blueprint,ji(n),t)}function Ww(n,e,t,i,r){if(n=sn(n),Array.isArray(n))for(let s=0;s<n.length;s++)Ww(n[s],e,t,i,r);else{let s=Mt(),o=Re(),a=en(),c=Fs(n)?n:sn(n.provide),l=Yg(n),u=a.providerIndexes&1048575,d=a.directiveStart,f=a.providerIndexes>>20;if(Fs(n)||!n.multi){let h=new $s(l,r,et,null),p=Oy(c,e,r?u:u+f,d);p===-1?(ky(_f(a,o),s,c),Fy(s,n,e.length),e.push(c),a.directiveStart++,a.directiveEnd++,r&&(a.providerIndexes+=1048576),t.push(h),o.push(h)):(t[p]=h,o[p]=h)}else{let h=Oy(c,e,u+f,d),p=Oy(c,e,u,u+f),v=h>=0&&t[h],m=p>=0&&t[p];if(r&&!m||!r&&!v){ky(_f(a,o),s,c);let g=pL(r?hL:fL,t.length,r,i,l,n);!r&&m&&(t[p].providerFactory=g),Fy(s,n,e.length,0),e.push(c),a.directiveStart++,a.directiveEnd++,r&&(a.providerIndexes+=1048576),t.push(g),o.push(g)}else{let g=$w(t[r?p:h],l,!r&&i);Fy(s,n,h>-1?h:p,g)}!r&&i&&m&&t[p].componentProviders++}}}function Fy(n,e,t,i){let r=Fs(e),s=tM(e);if(r||s){let c=(s?sn(e.useClass):e).prototype.ngOnDestroy;if(c){let l=n.destroyHooks||(n.destroyHooks=[]);if(!r&&e.multi){let u=l.indexOf(t);u===-1?l.push(t,[i,c]):l[u+1].push(i,c)}else l.push(t,c)}}}function $w(n,e,t){return t&&n.componentProviders++,n.multi.push(e)-1}function Oy(n,e,t,i){for(let r=t;r<i;r++)if(e[r]===n)return r;return-1}function fL(n,e,t,i,r){return yv(this.multi,[])}function hL(n,e,t,i,r){let s=this.multi,o;if(this.providerFactory){let a=this.providerFactory.componentProviders,c=al(i,i[xe],this.providerFactory.index,r);o=c.slice(0,a),yv(s,o);for(let l=a;l<c.length;l++)o.push(c[l])}else o=[],yv(s,o);return o}function yv(n,e){for(let t=0;t<n.length;t++){let i=n[t];e.push(i())}return e}function pL(n,e,t,i,r,s){let o=new $s(n,t,et,null);return o.multi=[],o.index=e,o.componentProviders=0,$w(o,r,i&&!t),o}function eo(n,e){return t=>{t.providersResolver=(i,r)=>xS(i,r?r(n):n,!1),e&&(t.viewProvidersResolver=(i,r)=>xS(i,r?r(e):e,!0))}}function mL(n,e){let t=n[e];return t===_n?void 0:t}function gL(n,e,t,i,r,s){let o=e+t;return Zn(n,o,r)?cF(n,o+1,s?i.call(s,r):i(r)):mL(n,o+1)}function yL(n,e){let t=Mt(),i,r=n+bt;t.firstCreatePass?(i=vL(e,t.pipeRegistry),t.data[r]=i,i.onDestroy&&(t.destroyHooks??=[]).push(r,i.onDestroy)):i=t.data[r];let s=i.factory||(i.factory=Ur(i.type,!0)),o,a=Cn(et);try{let c=vf(!1),l=s();return vf(c),Xc(t,Re(),r,l),l}finally{Cn(a)}}function vL(n,e){if(e)for(let t=e.length-1;t>=0;t--){let i=e[t];if(n===i.name)return i}}function _L(n,e,t){let i=n+bt,r=Re(),s=Wd(r,i);return xL(r,i)?gL(r,mM(),e,s.transform,t,s):s.transform(t)}function xL(n,e){return n[xe].data[e].pure}function bL(n,e){return kf(n,e)}var qw=(()=>{class n{applicationErrorHandler=ve(Wi);appRef=ve(Js);taskService=ve(Kr);ngZone=ve(Bt);zonelessEnabled=ve(Yo);tracing=ve(es,{optional:!0});zoneIsDefined=typeof Zone<"u"&&!!Zone.root.run;schedulerTickApplyArgs=[{data:{__scheduler_tick__:!0}}];subscriptions=new rn;angularZoneId=this.zoneIsDefined?this.ngZone._inner?.get(kc):null;scheduleInRootZone=!this.zonelessEnabled&&this.zoneIsDefined&&(ve(nf,{optional:!0})??!1);cancelScheduledCallback=null;useMicrotaskScheduler=!1;runningTick=!1;pendingRenderTaskId=null;constructor(){this.subscriptions.add(this.appRef.afterTick.subscribe(()=>{let t=this.taskService.add();if(!this.runningTick&&(this.cleanup(),!this.zonelessEnabled||this.appRef.includeAllTestViews)){this.taskService.remove(t);return}this.switchToMicrotaskScheduler(),this.taskService.remove(t)})),this.subscriptions.add(this.ngZone.onUnstable.subscribe(()=>{this.runningTick||this.cleanup()}))}switchToMicrotaskScheduler(){this.ngZone.runOutsideAngular(()=>{let t=this.taskService.add();this.useMicrotaskScheduler=!0,queueMicrotask(()=>{this.useMicrotaskScheduler=!1,this.taskService.remove(t)})})}notify(t){if(!this.zonelessEnabled&&t===5)return;switch(t){case 0:{this.appRef.dirtyFlags|=2;break}case 3:case 2:case 4:case 5:case 1:{this.appRef.dirtyFlags|=4;break}case 6:{this.appRef.dirtyFlags|=2;break}case 12:{this.appRef.dirtyFlags|=16;break}case 13:{this.appRef.dirtyFlags|=2;break}case 11:break;default:this.appRef.dirtyFlags|=8}if(this.appRef.tracingSnapshot=this.tracing?.snapshot(this.appRef.tracingSnapshot)??null,!this.shouldScheduleTick())return;let i=this.useMicrotaskScheduler?IM:_y;this.pendingRenderTaskId=this.taskService.add(),this.scheduleInRootZone?this.cancelScheduledCallback=Zone.root.run(()=>i(()=>this.tick())):this.cancelScheduledCallback=this.ngZone.runOutsideAngular(()=>i(()=>this.tick()))}shouldScheduleTick(){return!(this.appRef.destroyed||this.pendingRenderTaskId!==null||this.runningTick||this.appRef._runningTick||!this.zonelessEnabled&&this.zoneIsDefined&&Zone.current.get(kc+this.angularZoneId))}tick(){if(this.runningTick||this.appRef.destroyed)return;if(this.appRef.dirtyFlags===0){this.cleanup();return}!this.zonelessEnabled&&this.appRef.dirtyFlags&7&&(this.appRef.dirtyFlags|=1);let t=this.taskService.add();try{this.ngZone.run(()=>{this.runningTick=!0,this.appRef._tick()},void 0,this.schedulerTickApplyArgs)}catch(i){this.applicationErrorHandler(i)}finally{this.taskService.remove(t),this.cleanup()}}ngOnDestroy(){this.subscriptions.unsubscribe(),this.cleanup()}cleanup(){if(this.runningTick=!1,this.cancelScheduledCallback?.(),this.cancelScheduledCallback=null,this.pendingRenderTaskId!==null){let t=this.pendingRenderTaskId;this.pendingRenderTaskId=null,this.taskService.remove(t)}}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function Xw(){return[{provide:mr,useExisting:qw},{provide:Bt,useClass:Uc},{provide:Yo,useValue:!0}]}function ML(){return typeof $localize<"u"&&$localize.locale||El}var Cl=new Be("",{factory:()=>ve(Cl,{optional:!0,skipSelf:!0})||ML()});function Ei(n){return Hb(n)}function Dl(n,e){return Nc(n,e?.equal)}function Yw(n,e){return KE(e)}function RL(n,e){return QE(e)}var rK=(Yw.required=RL,Yw);var NL=(()=>{class n{zone=ve(Bt);changeDetectionScheduler=ve(mr);applicationRef=ve(Js);applicationErrorHandler=ve(Wi);_onMicrotaskEmptySubscription;initialize(){this._onMicrotaskEmptySubscription||(this._onMicrotaskEmptySubscription=this.zone.onMicrotaskEmpty.subscribe({next:()=>{this.changeDetectionScheduler.runningTick||this.zone.run(()=>{try{this.applicationRef.dirtyFlags|=1,this.applicationRef._tick()}catch(t){this.applicationErrorHandler(t)}})}}))}ngOnDestroy(){this._onMicrotaskEmptySubscription?.unsubscribe()}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),PL=new Be("",{factory:()=>!1});function FL({ngZoneFactory:n,scheduleInRootZone:e}){return n??=()=>new Bt(st(Ae({},Jw()),{scheduleInRootZone:e})),[{provide:Yo,useValue:!1},{provide:Bt,useFactory:n},{provide:Us,multi:!0,useFactory:()=>{let t=ve(NL,{optional:!0});return()=>t.initialize()}},{provide:Us,multi:!0,useFactory:()=>{let t=ve(OL);return()=>{t.initialize()}}},{provide:nf,useValue:e??vy}]}function sK(n){let e=n?.scheduleInRootZone,t=FL({ngZoneFactory:()=>{let i=Jw(n);return i.scheduleInRootZone=e,i.shouldCoalesceEventChangeDetection&&qi("NgZone_CoalesceEvent"),new Bt(i)},scheduleInRootZone:e});return jc([{provide:PL,useValue:!0},t])}function Jw(n){return{enableLongStackTrace:!1,shouldCoalesceEventChangeDetection:n?.eventCoalescing??!1,shouldCoalesceRunChangeDetection:n?.runCoalescing??!1}}var OL=(()=>{class n{subscription=new rn;initialized=!1;zone=ve(Bt);pendingTasks=ve(Kr);initialize(){if(this.initialized)return;this.initialized=!0;let t=null;!this.zone.isStable&&!this.zone.hasPendingMacrotasks&&!this.zone.hasPendingMicrotasks&&(t=this.pendingTasks.add()),this.zone.runOutsideAngular(()=>{this.subscription.add(this.zone.onStable.subscribe(()=>{Bt.assertNotInAngularZone(),queueMicrotask(()=>{t!==null&&!this.zone.hasPendingMacrotasks&&!this.zone.hasPendingMicrotasks&&(this.pendingTasks.remove(t),t=null)})}))}),this.subscription.add(this.zone.onUnstable.subscribe(()=>{Bt.assertInAngularZone(),t??=this.pendingTasks.add()}))}ngOnDestroy(){this.subscription.unsubscribe()}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var a_=new Be(""),LL=new Be("");function Al(n){return!n.moduleRef}function kL(n){let e=Al(n)?n.r3Injector:n.moduleRef.injector,t=e.get(Bt);return t.run(()=>{Al(n)?n.r3Injector.resolveInjectorInitializers():n.moduleRef.resolveInjectorInitializers();let i=e.get(Wi),r;if(t.runOutsideAngular(()=>{r=t.onError.subscribe({next:i})}),Al(n)){let s=()=>e.destroy(),o=n.platformInjector.get(a_);o.add(s),e.onDestroy(()=>{r.unsubscribe(),o.delete(s)})}else{let s=()=>n.moduleRef.destroy(),o=n.platformInjector.get(a_);o.add(s),n.moduleRef.onDestroy(()=>{ol(n.allPlatformModules,n.moduleRef),r.unsubscribe(),o.delete(s)})}return BL(i,t,()=>{let s=e.get(Kr),o=s.add(),a=e.get(Qv);return a.runInitializers(),a.donePromise.then(()=>{let c=e.get(Cl,El);if(Mw(c||El),!e.get(LL,!0))return Al(n)?e.get(Js):(n.allPlatformModules.push(n.moduleRef),n.moduleRef);if(Al(n)){let u=e.get(Js);return n.rootComponent!==void 0&&u.bootstrap(n.rootComponent),u}else return UL?.(n.moduleRef,n.allPlatformModules),n.moduleRef}).finally(()=>{s.remove(o)})})})}var UL;function BL(n,e,t){try{let i=t();return Zs(i)?i.catch(r=>{throw e.runOutsideAngular(()=>n(r)),r}):i}catch(i){throw e.runOutsideAngular(()=>n(i)),i}}var $f=null;function VL(n=[],e){return _i.create({name:e,providers:[{provide:Xg,useValue:"platform"},{provide:a_,useValue:new Set([()=>$f=null])},...n]})}function HL(n=[]){if($f)return $f;let e=VL(n);return $f=e,mw(),zL(e),e}function zL(n){let e=n.get(GS,null);Vo(n,()=>{e?.forEach(t=>t())})}function oK(){return!1}var GL=1e4;var aK=GL-1e3;var to=(()=>{class n{static __NG_ELEMENT_ID__=jL}return n})();function jL(n){return WL(en(),Re(),(n&16)===16)}function WL(n,e,t){if(_r(n)&&!t){let i=di(n.index,e);return new Qr(i,i)}else if(n.type&175){let i=e[qn];return new Qr(i,e)}return null}var c_=class{supports(e){return e instanceof Map||Wv(e)}create(){return new l_}},l_=class{_records=new Map;_mapHead=null;_appendAfter=null;_previousMapHead=null;_changesHead=null;_changesTail=null;_additionsHead=null;_additionsTail=null;_removalsHead=null;get isDirty(){return this._additionsHead!==null||this._changesHead!==null||this._removalsHead!==null}forEachItem(e){let t;for(t=this._mapHead;t!==null;t=t._next)e(t)}forEachPreviousItem(e){let t;for(t=this._previousMapHead;t!==null;t=t._nextPrevious)e(t)}forEachChangedItem(e){let t;for(t=this._changesHead;t!==null;t=t._nextChanged)e(t)}forEachAddedItem(e){let t;for(t=this._additionsHead;t!==null;t=t._nextAdded)e(t)}forEachRemovedItem(e){let t;for(t=this._removalsHead;t!==null;t=t._nextRemoved)e(t)}diff(e){if(!e)e=new Map;else if(!(e instanceof Map||Wv(e)))throw new Fe(900,!1);return this.check(e)?this:null}check(e){this._reset();let t=this._mapHead;if(this._appendAfter=null,this._forEach(e,(i,r)=>{if(t&&t.key===r)this._maybeAddToChanges(t,i),this._appendAfter=t,t=t._next;else{let s=this._getOrCreateRecordForKey(r,i);t=this._insertBeforeOrAppend(t,s)}}),t){t._prev&&(t._prev._next=null),this._removalsHead=t;for(let i=t;i!==null;i=i._nextRemoved)i===this._mapHead&&(this._mapHead=null),this._records.delete(i.key),i._nextRemoved=i._next,i.previousValue=i.currentValue,i.currentValue=null,i._prev=null,i._next=null}return this._changesTail&&(this._changesTail._nextChanged=null),this._additionsTail&&(this._additionsTail._nextAdded=null),this.isDirty}_insertBeforeOrAppend(e,t){if(e){let i=e._prev;return t._next=e,t._prev=i,e._prev=t,i&&(i._next=t),e===this._mapHead&&(this._mapHead=t),this._appendAfter=e,e}return this._appendAfter?(this._appendAfter._next=t,t._prev=this._appendAfter):this._mapHead=t,this._appendAfter=t,null}_getOrCreateRecordForKey(e,t){if(this._records.has(e)){let r=this._records.get(e);this._maybeAddToChanges(r,t);let s=r._prev,o=r._next;return s&&(s._next=o),o&&(o._prev=s),r._next=null,r._prev=null,r}let i=new u_(e);return this._records.set(e,i),i.currentValue=t,this._addToAdditions(i),i}_reset(){if(this.isDirty){let e;for(this._previousMapHead=this._mapHead,e=this._previousMapHead;e!==null;e=e._next)e._nextPrevious=e._next;for(e=this._changesHead;e!==null;e=e._nextChanged)e.previousValue=e.currentValue;for(e=this._additionsHead;e!=null;e=e._nextAdded)e.previousValue=e.currentValue;this._changesHead=this._changesTail=null,this._additionsHead=this._additionsTail=null,this._removalsHead=null}}_maybeAddToChanges(e,t){Object.is(t,e.currentValue)||(e.previousValue=e.currentValue,e.currentValue=t,this._addToChanges(e))}_addToAdditions(e){this._additionsHead===null?this._additionsHead=this._additionsTail=e:(this._additionsTail._nextAdded=e,this._additionsTail=e)}_addToChanges(e){this._changesHead===null?this._changesHead=this._changesTail=e:(this._changesTail._nextChanged=e,this._changesTail=e)}_forEach(e,t){e instanceof Map?e.forEach(t):Object.keys(e).forEach(i=>t(e[i],i))}},u_=class{key;previousValue=null;currentValue=null;_nextPrevious=null;_next=null;_prev=null;_nextAdded=null;_nextRemoved=null;_nextChanged=null;constructor(e){this.key=e}};function Zw(){return new d_([new c_])}var d_=(()=>{class n{static \u0275prov=Ie({token:n,providedIn:"root",factory:Zw});factories;constructor(t){this.factories=t}static create(t,i){if(i){let r=i.factories.slice();t=t.concat(r)}return new n(t)}static extend(t){return{provide:n,useFactory:()=>{let i=ve(n,{optional:!0,skipSelf:!0});return n.create(t,i||Zw())}}}find(t){let i=this.factories.find(r=>r.supports(t));if(i)return i;throw new Fe(901,!1)}}return n})();function cK(n){let{rootComponent:e,appProviders:t,platformProviders:i,platformRef:r}=n;ct(it.BootstrapApplicationStart);try{let s=r?.injector??HL(i),o=[Xw(),NM,...t||[]],a=new pl({providers:o,parent:s,debugName:"",runEnvironmentInitializers:!1});return kL({r3Injector:a.injector,platformInjector:s,rootComponent:e})}catch(s){return Promise.reject(s)}finally{ct(it.BootstrapApplicationEnd)}}function Kw(n){return typeof n=="boolean"?n:n!=null&&n!=="false"}var Qw=null;function no(){return Qw}function $L(n){Qw??=n}var f_=class{},qf=(()=>{class n{historyGo(t){throw new Error("")}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:()=>ve(eT),providedIn:"platform"})}return n})();var eT=(()=>{class n extends qf{_location;_history;_doc=ve(Zr);constructor(){super(),this._location=window.location,this._history=window.history}getBaseHrefFromDOM(){return no().getBaseHref(this._doc)}onPopState(t){let i=no().getGlobalEventTarget(this._doc,"window");return i.addEventListener("popstate",t,!1),()=>i.removeEventListener("popstate",t)}onHashChange(t){let i=no().getGlobalEventTarget(this._doc,"window");return i.addEventListener("hashchange",t,!1),()=>i.removeEventListener("hashchange",t)}get href(){return this._location.href}get protocol(){return this._location.protocol}get hostname(){return this._location.hostname}get port(){return this._location.port}get pathname(){return this._location.pathname}get search(){return this._location.search}get hash(){return this._location.hash}set pathname(t){this._location.pathname=t}pushState(t,i,r){this._history.pushState(t,i,r)}replaceState(t,i,r){this._history.replaceState(t,i,r)}forward(){this._history.forward()}back(){this._history.back()}historyGo(t=0){this._history.go(t)}getState(){return this._history.state}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:()=>new n,providedIn:"platform"})}return n})();var v_=(function(n){return n[n.Decimal=0]="Decimal",n[n.Percent=1]="Percent",n[n.Currency=2]="Currency",n[n.Scientific=3]="Scientific",n})(v_||{});var Zi={Decimal:0,Group:1,List:2,PercentSign:3,PlusSign:4,MinusSign:5,Exponential:6,SuperscriptingExponent:7,PerMille:8,Infinity:9,NaN:10,TimeSeparator:11,CurrencyDecimal:12,CurrencyGroup:13};function _a(n,e){let t=Wf(n),i=t[Ks.NumberSymbols][e];if(typeof i>"u"){if(e===Zi.CurrencyDecimal)return t[Ks.NumberSymbols][Zi.Decimal];if(e===Zi.CurrencyGroup)return t[Ks.NumberSymbols][Zi.Group]}return i}function iT(n,e){return Wf(n)[Ks.NumberFormats][e]}var qL=/^(\d+)?\.((\d+)(-(\d+))?)?$/,tT=22,Xf=".",Il="0",XL=";",YL=",",h_="#";function ZL(n,e,t,i,r,s,o=!1){let a="",c=!1;if(!isFinite(n))a=_a(t,Zi.Infinity);else{let l=QL(n);o&&(l=KL(l));let u=e.minInt,d=e.minFrac,f=e.maxFrac;if(s){let M=s.match(qL);if(M===null)throw new Fe(2306,!1);let w=M[1],_=M[3],S=M[5];w!=null&&(u=p_(w)),_!=null&&(d=p_(_)),S!=null?f=p_(S):_!=null&&d>f&&(f=d);let E=100;if(u>E||d>E||f>E)throw new Fe(2306,!1)}e2(l,d,f);let h=l.digits,p=l.integerLen,v=l.exponent,m=[];for(c=h.every(M=>!M);p<u;p++)h.unshift(0);for(;p<0;p++)h.unshift(0);p>0?m=h.splice(p,h.length):(m=h,h=[0]);let g=[];for(h.length>=e.lgSize&&g.unshift(h.splice(-e.lgSize,h.length).join(""));h.length>e.gSize;)g.unshift(h.splice(-e.gSize,h.length).join(""));h.length&&g.unshift(h.join("")),a=g.join(_a(t,i)),m.length&&(a+=_a(t,r)+m.join("")),v&&(a+=_a(t,Zi.Exponential)+"+"+v)}return n<0&&!c?a=e.negPre+a+e.negSuf:a=e.posPre+a+e.posSuf,a}function rT(n,e,t){let i=iT(e,v_.Decimal),r=JL(i,_a(e,Zi.MinusSign));return ZL(n,r,e,Zi.Group,Zi.Decimal,t)}function JL(n,e="-"){let t={minInt:1,minFrac:0,maxFrac:0,posPre:"",posSuf:"",negPre:"",negSuf:"",gSize:0,lgSize:0},i=n.split(XL),r=i[0],s=i[1],o=r.indexOf(Xf)!==-1?r.split(Xf):[r.substring(0,r.lastIndexOf(Il)+1),r.substring(r.lastIndexOf(Il)+1)],a=o[0],c=o[1]||"";t.posPre=a.substring(0,a.indexOf(h_));for(let u=0;u<c.length;u++){let d=c.charAt(u);d===Il?t.minFrac=t.maxFrac=u+1:d===h_?t.maxFrac=u+1:t.posSuf+=d}let l=a.split(YL);if(t.gSize=l[1]?l[1].length:0,t.lgSize=l[2]||l[1]?(l[2]||l[1]).length:0,s){let u=r.length-t.posPre.length-t.posSuf.length,d=s.indexOf(h_);t.negPre=s.substring(0,d).replace(/'/g,""),t.negSuf=s.slice(d+u).replace(/'/g,"")}else t.negPre=e+t.posPre,t.negSuf=t.posSuf;return t}function KL(n){if(n.digits[0]===0)return n;let e=n.digits.length-n.integerLen;return n.exponent?n.exponent+=2:(e===0?n.digits.push(0,0):e===1&&n.digits.push(0),n.integerLen+=2),n}function QL(n){let e=Math.abs(n)+"",t=0,i,r,s,o,a;for((r=e.indexOf(Xf))>-1&&(e=e.replace(Xf,"")),(s=e.search(/e/i))>0?(r<0&&(r=s),r+=+e.slice(s+1),e=e.substring(0,s)):r<0&&(r=e.length),s=0;e.charAt(s)===Il;s++);if(s===(a=e.length))i=[0],r=1;else{for(a--;e.charAt(a)===Il;)a--;for(r-=s,i=[],o=0;s<=a;s++,o++)i[o]=Number(e.charAt(s))}return r>tT&&(i=i.splice(0,tT-1),t=r-1,r=1),{digits:i,exponent:t,integerLen:r}}function e2(n,e,t){if(e>t)throw new Fe(2307,!1);let i=n.digits,r=i.length-n.integerLen,s=Math.min(Math.max(e,r),t),o=s+n.integerLen,a=i[o];if(o>0){i.splice(Math.max(n.integerLen,o));for(let d=o;d<i.length;d++)i[d]=0}else{r=Math.max(0,r),n.integerLen=1,i.length=Math.max(1,o=s+1),i[0]=0;for(let d=1;d<o;d++)i[d]=0}if(a>=5)if(o-1<0){for(let d=0;d>o;d--)i.unshift(0),n.integerLen++;i.unshift(1),n.integerLen++}else i[o-1]++;for(;r<Math.max(0,s);r++)i.push(0);let c=s!==0,l=e+n.integerLen,u=i.reduceRight(function(d,f,h,p){return f=f+d,p[h]=f<10?f:f-10,c&&(p[h]===0&&h>=l?p.pop():c=!1),f>=10?1:0},0);u&&(i.unshift(u),n.integerLen++)}function p_(n){let e=parseInt(n);if(isNaN(e))throw new Fe(2305,!1);return e}var m_=/\s+/,nT=[],t2=(()=>{class n{_ngEl;_renderer;initialClasses=nT;rawClass;stateMap=new Map;constructor(t,i){this._ngEl=t,this._renderer=i}set klass(t){this.initialClasses=t!=null?t.trim().split(m_):nT}set ngClass(t){this.rawClass=typeof t=="string"?t.trim().split(m_):t}ngDoCheck(){for(let i of this.initialClasses)this._updateState(i,!0);let t=this.rawClass;if(Array.isArray(t)||t instanceof Set)for(let i of t)this._updateState(i,!0);else if(t!=null)for(let i of Object.keys(t))this._updateState(i,!!t[i]);this._applyStateDiff()}_updateState(t,i){let r=this.stateMap.get(t);r!==void 0?(r.enabled!==i&&(r.changed=!0,r.enabled=i),r.touched=!0):this.stateMap.set(t,{enabled:i,changed:!0,touched:!0})}_applyStateDiff(){for(let t of this.stateMap){let i=t[0],r=t[1];r.changed?(this._toggleClass(i,r.enabled),r.changed=!1):r.touched||(r.enabled&&this._toggleClass(i,!1),this.stateMap.delete(i)),r.touched=!1}}_toggleClass(t,i){t=t.trim(),t.length>0&&t.split(m_).forEach(r=>{i?this._renderer.addClass(this._ngEl.nativeElement,r):this._renderer.removeClass(this._ngEl.nativeElement,r)})}static \u0275fac=function(i){return new(i||n)(et(Rn),et(Mr))};static \u0275dir=xn({type:n,selectors:[["","ngClass",""]],inputs:{klass:[0,"class","klass"],ngClass:"ngClass"}})}return n})();var n2=(()=>{class n{_ngEl;_differs;_renderer;_ngStyle=null;_differ=null;constructor(t,i,r){this._ngEl=t,this._differs=i,this._renderer=r}set ngStyle(t){this._ngStyle=t,!this._differ&&t&&(this._differ=this._differs.find(t).create())}ngDoCheck(){if(this._differ){let t=this._differ.diff(this._ngStyle);t&&this._applyChanges(t)}}_setStyle(t,i){let[r,s]=t.split("."),o=r.indexOf("-")===-1?void 0:na.DashCase;i!=null?this._renderer.setStyle(this._ngEl.nativeElement,r,s?`${i}${s}`:i,o):this._renderer.removeStyle(this._ngEl.nativeElement,r,o)}_applyChanges(t){t.forEachRemovedItem(i=>this._setStyle(i.key,null)),t.forEachAddedItem(i=>this._setStyle(i.key,i.currentValue)),t.forEachChangedItem(i=>this._setStyle(i.key,i.currentValue))}static \u0275fac=function(i){return new(i||n)(et(Rn),et(d_),et(Mr))};static \u0275dir=xn({type:n,selectors:[["","ngStyle",""]],inputs:{ngStyle:"ngStyle"}})}return n})(),i2=(()=>{class n{_viewContainerRef;_viewRef=null;ngTemplateOutletContext=null;ngTemplateOutlet=null;ngTemplateOutletInjector=null;injector=ve(_i);constructor(t){this._viewContainerRef=t}ngOnChanges(t){if(this._shouldRecreateView(t)){let i=this._viewContainerRef;if(this._viewRef&&i.remove(i.indexOf(this._viewRef)),!this.ngTemplateOutlet){this._viewRef=null;return}let r=this._createContextForwardProxy();this._viewRef=i.createEmbeddedView(this.ngTemplateOutlet,r,{injector:this._getInjector()})}}_getInjector(){return this.ngTemplateOutletInjector==="outlet"?this.injector:this.ngTemplateOutletInjector??void 0}_shouldRecreateView(t){return!!t.ngTemplateOutlet||!!t.ngTemplateOutletInjector}_createContextForwardProxy(){return new Proxy({},{set:(t,i,r)=>this.ngTemplateOutletContext?Reflect.set(this.ngTemplateOutletContext,i,r):!1,get:(t,i,r)=>{if(this.ngTemplateOutletContext)return Reflect.get(this.ngTemplateOutletContext,i,r)}})}static \u0275fac=function(i){return new(i||n)(et(da))};static \u0275dir=xn({type:n,selectors:[["","ngTemplateOutlet",""]],inputs:{ngTemplateOutletContext:"ngTemplateOutletContext",ngTemplateOutlet:"ngTemplateOutlet",ngTemplateOutletInjector:"ngTemplateOutletInjector"},features:[yl]})}return n})();function sT(n,e){return new Fe(2100,!1)}var g_=class{createSubscription(e,t,i){return Ei(()=>e.subscribe({next:t,error:i}))}dispose(e){Ei(()=>e.unsubscribe())}},y_=class{createSubscription(e,t,i){return e.then(r=>t?.(r),r=>i?.(r)),{unsubscribe:()=>{t=null,i=null}}}dispose(e){e.unsubscribe()}},r2=new y_,s2=new g_,o2=(()=>{class n{_ref;_latestValue=null;markForCheckOnValueUpdate=!0;_subscription=null;_obj=null;_strategy=null;applicationErrorHandler=ve(Wi);constructor(t){this._ref=t}ngOnDestroy(){this._subscription&&this._dispose(),this._ref=null}transform(t){if(!this._obj){if(t)try{this.markForCheckOnValueUpdate=!1,this._subscribe(t)}finally{this.markForCheckOnValueUpdate=!0}return this._latestValue}return t!==this._obj?(this._dispose(),this.transform(t)):this._latestValue}_subscribe(t){this._obj=t,this._strategy=this._selectStrategy(t),this._subscription=this._strategy.createSubscription(t,i=>this._updateLatestValue(t,i),i=>this.applicationErrorHandler(i))}_selectStrategy(t){if(Zs(t))return r2;if(Gf(t))return s2;throw sT(n,t)}_dispose(){this._strategy.dispose(this._subscription),this._latestValue=null,this._subscription=null,this._obj=null}_updateLatestValue(t,i){t===this._obj&&(this._latestValue=i,this.markForCheckOnValueUpdate&&this._ref?.markForCheck())}static \u0275fac=function(i){return new(i||n)(et(to,16))};static \u0275pipe=Vf({name:"async",type:n,pure:!1})}return n})();var a2=(()=>{class n{_locale;constructor(t){this._locale=t}transform(t,i,r){if(!c2(t))return null;r||=this._locale;try{let s=l2(t);return rT(s,r,i)}catch(s){throw sT(n,s.message)}}static \u0275fac=function(i){return new(i||n)(et(Cl,16))};static \u0275pipe=Vf({name:"number",type:n,pure:!0})}return n})();function c2(n){return!(n==null||n===""||n!==n)}function l2(n){if(typeof n=="string"&&!isNaN(Number(n)-parseFloat(n)))return Number(n);if(typeof n!="number")throw new Fe(2309,!1);return n}var u2=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Ys({type:n});static \u0275inj=Vr({})}return n})();function __(n,e){e=encodeURIComponent(e);for(let t of n.split(";")){let i=t.indexOf("="),[r,s]=i==-1?[t,""]:[t.slice(0,i),t.slice(i+1)];if(r.trim()===e)return decodeURIComponent(s)}return null}var Rl=class{};var AQ="browser";var rs=class n{headers;normalizedNames=new Map;lazyInit;lazyUpdate=null;constructor(e){e?typeof e=="string"?this.lazyInit=()=>{this.headers=new Map,e.split(`
`).forEach(t=>{let i=t.indexOf(":");if(i>0){let r=t.slice(0,i),s=t.slice(i+1).trim();this.addHeaderEntry(r,s)}})}:typeof Headers<"u"&&e instanceof Headers?(this.headers=new Map,e.forEach((t,i)=>{this.addHeaderEntry(i,t)})):this.lazyInit=()=>{this.headers=new Map,Object.entries(e).forEach(([t,i])=>{this.setHeaderEntries(t,i)})}:this.headers=new Map}has(e){return this.init(),this.headers.has(e.toLowerCase())}get(e){this.init();let t=this.headers.get(e.toLowerCase());return t&&t.length>0?t[0]:null}keys(){return this.init(),Array.from(this.normalizedNames.values())}getAll(e){return this.init(),this.headers.get(e.toLowerCase())||null}append(e,t){return this.clone({name:e,value:t,op:"a"})}set(e,t){return this.clone({name:e,value:t,op:"s"})}delete(e,t){return this.clone({name:e,value:t,op:"d"})}maybeSetNormalizedName(e,t){this.normalizedNames.has(t)||this.normalizedNames.set(t,e)}init(){this.lazyInit&&(this.lazyInit instanceof n?this.copyFrom(this.lazyInit):this.lazyInit(),this.lazyInit=null,this.lazyUpdate&&(this.lazyUpdate.forEach(e=>this.applyUpdate(e)),this.lazyUpdate=null))}copyFrom(e){e.init();for(let[t,i]of e.headers.entries())this.headers.set(t,i),this.normalizedNames.set(t,e.normalizedNames.get(t))}clone(e){let t=new n;return t.lazyInit=this.lazyInit&&this.lazyInit instanceof n?this.lazyInit:this,t.lazyUpdate=(this.lazyUpdate||[]).concat([e]),t}applyUpdate(e){let t=e.name.toLowerCase();switch(e.op){case"a":case"s":let i=e.value;if(typeof i=="string"&&(i=[i]),i.length===0)return;this.maybeSetNormalizedName(e.name,t);let r=e.op==="a"?(this.headers.get(t)||[]).slice():[];r.push(...i),this.headers.set(t,r);break;case"d":let s=e.value;if(s===void 0)this.headers.delete(t),this.normalizedNames.delete(t);else{let o=Array.isArray(s)?s:[s],a=this.headers.get(t);if(!a)return;a=a.filter(c=>o.indexOf(c)===-1),a.length===0?(this.headers.delete(t),this.normalizedNames.delete(t)):this.headers.set(t,a)}break}}addHeaderEntry(e,t){let i=e.toLowerCase();this.maybeSetNormalizedName(e,i),this.headers.has(i)?this.headers.get(i).push(t):this.headers.set(i,[t])}setHeaderEntries(e,t){let i=(Array.isArray(t)?t:[t]).map(s=>s.toString()),r=e.toLowerCase();this.headers.set(r,i),this.maybeSetNormalizedName(e,r)}forEach(e){this.init(),Array.from(this.normalizedNames.keys()).forEach(t=>e(this.normalizedNames.get(t),this.headers.get(t)))}};var Zf=class{map=new Map;set(e,t){return this.map.set(e,t),this}get(e){return this.map.has(e)||this.map.set(e,e.defaultValue()),this.map.get(e)}delete(e){return this.map.delete(e),this}has(e){return this.map.has(e)}keys(){return this.map.keys()}},Jf=class{encodeKey(e){return oT(e)}encodeValue(e){return oT(e)}decodeKey(e){return decodeURIComponent(e)}decodeValue(e){return decodeURIComponent(e)}};function f2(n,e){let t=new Map;return n.length>0&&n.replace(/^\?/,"").split("&").forEach(r=>{let s=r.indexOf("="),[o,a]=s==-1?[e.decodeKey(r),""]:[e.decodeKey(r.slice(0,s)),e.decodeValue(r.slice(s+1))],c=t.get(o)||[];c.push(a),t.set(o,c)}),t}var h2=/%(\d[a-f0-9])/gi,p2={40:"@","3A":":",24:"$","2C":",","3B":";","3D":"=","3F":"?","2F":"/"};function oT(n){return encodeURIComponent(n).replace(h2,(e,t)=>p2[t]??e)}function Yf(n){return`${n}`}var Er=class n{map;encoder;updates=null;cloneFrom=null;constructor(e={}){if(this.encoder=e.encoder||new Jf,e.fromString){if(e.fromObject)throw new Fe(2805,!1);this.map=f2(e.fromString,this.encoder)}else e.fromObject?(this.map=new Map,Object.keys(e.fromObject).forEach(t=>{let i=e.fromObject[t],r=Array.isArray(i)?i.map(Yf):[Yf(i)];this.map.set(t,r)})):this.map=null}has(e){return this.init(),this.map.has(e)}get(e){this.init();let t=this.map.get(e);return t?t[0]:null}getAll(e){return this.init(),this.map.get(e)||null}keys(){return this.init(),Array.from(this.map.keys())}append(e,t){return this.clone({param:e,value:t,op:"a"})}appendAll(e){let t=[];return Object.keys(e).forEach(i=>{let r=e[i];Array.isArray(r)?r.forEach(s=>{t.push({param:i,value:s,op:"a"})}):t.push({param:i,value:r,op:"a"})}),this.clone(t)}set(e,t){return this.clone({param:e,value:t,op:"s"})}delete(e,t){return this.clone({param:e,value:t,op:"d"})}toString(){return this.init(),this.keys().map(e=>{let t=this.encoder.encodeKey(e);return this.map.get(e).map(i=>t+"="+this.encoder.encodeValue(i)).join("&")}).filter(e=>e!=="").join("&")}clone(e){let t=new n({encoder:this.encoder});return t.cloneFrom=this.cloneFrom||this,t.updates=(this.updates||[]).concat(e),t}init(){if(this.map===null&&(this.map=new Map),this.cloneFrom!==null){this.cloneFrom.init();for(let[e,t]of this.cloneFrom.map.entries())this.map.set(e,t);this.updates.forEach(e=>{switch(e.op){case"a":case"s":let t=e.op==="a"?(this.map.get(e.param)||[]).slice():[];t.push(Yf(e.value)),this.map.set(e.param,t);break;case"d":if(e.value!==void 0){let i=(this.map.get(e.param)||[]).slice(),r=i.indexOf(Yf(e.value));r!==-1&&i.splice(r,1),i.length>0?this.map.set(e.param,i):this.map.delete(e.param)}else{this.map.delete(e.param);break}}}),this.cloneFrom=this.updates=null}}};function m2(n){switch(n){case"DELETE":case"GET":case"HEAD":case"OPTIONS":case"JSONP":return!1;default:return!0}}function aT(n){return typeof ArrayBuffer<"u"&&n instanceof ArrayBuffer}function cT(n){return typeof Blob<"u"&&n instanceof Blob}function lT(n){return typeof FormData<"u"&&n instanceof FormData}function g2(n){return typeof URLSearchParams<"u"&&n instanceof URLSearchParams}var uT="Content-Type",dT="Accept",fT="text/plain",hT="application/json",y2=`${hT}, ${fT}, */*`,xa=class n{url;body=null;headers;context;reportProgress=!1;withCredentials=!1;credentials;keepalive=!1;cache;priority;mode;redirect;referrer;integrity;referrerPolicy;responseType="json";method;params;urlWithParams;transferCache;timeout;constructor(e,t,i,r){this.url=t,this.method=e.toUpperCase();let s;if(m2(this.method)||r?(this.body=i!==void 0?i:null,s=r):s=i,s){if(this.reportProgress=!!s.reportProgress,this.withCredentials=!!s.withCredentials,this.keepalive=!!s.keepalive,s.responseType&&(this.responseType=s.responseType),s.headers&&(this.headers=s.headers),s.context&&(this.context=s.context),s.params&&(this.params=s.params),s.priority&&(this.priority=s.priority),s.cache&&(this.cache=s.cache),s.credentials&&(this.credentials=s.credentials),typeof s.timeout=="number"){if(s.timeout<1||!Number.isInteger(s.timeout))throw new Fe(2822,"");this.timeout=s.timeout}s.mode&&(this.mode=s.mode),s.redirect&&(this.redirect=s.redirect),s.integrity&&(this.integrity=s.integrity),s.referrer!==void 0&&(this.referrer=s.referrer),s.referrerPolicy&&(this.referrerPolicy=s.referrerPolicy),this.transferCache=s.transferCache}if(this.headers??=new rs,this.context??=new Zf,!this.params)this.params=new Er,this.urlWithParams=t;else{let o=this.params.toString();if(o.length===0)this.urlWithParams=t;else{let a=t.indexOf("?"),c=a===-1?"?":a<t.length-1?"&":"";this.urlWithParams=t+c+o}}}serializeBody(){return this.body===null?null:typeof this.body=="string"||aT(this.body)||cT(this.body)||lT(this.body)||g2(this.body)?this.body:this.body instanceof Er?this.body.toString():typeof this.body=="object"||typeof this.body=="boolean"||Array.isArray(this.body)?JSON.stringify(this.body):this.body.toString()}detectContentTypeHeader(){return this.body===null||lT(this.body)?null:cT(this.body)?this.body.type||null:aT(this.body)?null:typeof this.body=="string"?fT:this.body instanceof Er?"application/x-www-form-urlencoded;charset=UTF-8":typeof this.body=="object"||typeof this.body=="number"||typeof this.body=="boolean"?hT:null}clone(e={}){let t=e.method||this.method,i=e.url||this.url,r=e.responseType||this.responseType,s=e.keepalive??this.keepalive,o=e.priority||this.priority,a=e.cache||this.cache,c=e.mode||this.mode,l=e.redirect||this.redirect,u=e.credentials||this.credentials,d=e.referrer??this.referrer,f=e.integrity||this.integrity,h=e.referrerPolicy||this.referrerPolicy,p=e.transferCache??this.transferCache,v=e.timeout??this.timeout,m=e.body!==void 0?e.body:this.body,g=e.withCredentials??this.withCredentials,M=e.reportProgress??this.reportProgress,w=e.headers||this.headers,_=e.params||this.params,S=e.context??this.context;return e.setHeaders!==void 0&&(w=Object.keys(e.setHeaders).reduce((E,D)=>E.set(D,e.setHeaders[D]),w)),e.setParams&&(_=Object.keys(e.setParams).reduce((E,D)=>E.set(D,e.setParams[D]),_)),new n(t,i,m,{params:_,headers:w,context:S,reportProgress:M,responseType:r,withCredentials:g,transferCache:p,keepalive:s,cache:a,priority:o,timeout:v,mode:c,redirect:l,credentials:u,referrer:d,integrity:f,referrerPolicy:h})}},io=(function(n){return n[n.Sent=0]="Sent",n[n.UploadProgress=1]="UploadProgress",n[n.ResponseHeader=2]="ResponseHeader",n[n.DownloadProgress=3]="DownloadProgress",n[n.Response=4]="Response",n[n.User=5]="User",n})(io||{}),Ma=class{headers;status;statusText;url;ok;type;redirected;responseType;constructor(e,t=200,i="OK"){this.headers=e.headers||new rs,this.status=e.status!==void 0?e.status:t,this.statusText=e.statusText||i,this.url=e.url||null,this.redirected=e.redirected,this.responseType=e.responseType,this.ok=this.status>=200&&this.status<300}},Kf=class n extends Ma{constructor(e={}){super(e)}type=io.ResponseHeader;clone(e={}){return new n({headers:e.headers||this.headers,status:e.status!==void 0?e.status:this.status,statusText:e.statusText||this.statusText,url:e.url||this.url||void 0})}},Nl=class n extends Ma{body;constructor(e={}){super(e),this.body=e.body!==void 0?e.body:null}type=io.Response;clone(e={}){return new n({body:e.body!==void 0?e.body:this.body,headers:e.headers||this.headers,status:e.status!==void 0?e.status:this.status,statusText:e.statusText||this.statusText,url:e.url||this.url||void 0,redirected:e.redirected??this.redirected,responseType:e.responseType??this.responseType})}},ba=class extends Ma{name="HttpErrorResponse";message;error;ok=!1;constructor(e){super(e,0,"Unknown Error"),this.status>=200&&this.status<300?this.message=`Http failure during parsing for ${e.url||"(unknown url)"}`:this.message=`Http failure response for ${e.url||"(unknown url)"}: ${e.status} ${e.statusText}`,this.error=e.error||null}},v2=200,_2=204;var x2=new Be("");var b2=/^\)\]\}',?\n/;var b_=(()=>{class n{xhrFactory;tracingService=ve(es,{optional:!0});constructor(t){this.xhrFactory=t}maybePropagateTrace(t){return this.tracingService?.propagate?this.tracingService.propagate(t):t}handle(t){if(t.method==="JSONP")throw new Fe(-2800,!1);let i=this.xhrFactory;return Lr(null).pipe(Fo(()=>new At(s=>{let o=i.build();if(o.open(t.method,t.urlWithParams),t.withCredentials&&(o.withCredentials=!0),t.headers.forEach((m,g)=>o.setRequestHeader(m,g.join(","))),t.headers.has(dT)||o.setRequestHeader(dT,y2),!t.headers.has(uT)){let m=t.detectContentTypeHeader();m!==null&&o.setRequestHeader(uT,m)}if(t.timeout&&(o.timeout=t.timeout),t.responseType){let m=t.responseType.toLowerCase();o.responseType=m!=="json"?m:"text"}let a=t.serializeBody(),c=null,l=()=>{if(c!==null)return c;let m=o.statusText||"OK",g=new rs(o.getAllResponseHeaders()),M=o.responseURL||t.url;return c=new Kf({headers:g,status:o.status,statusText:m,url:M}),c},u=this.maybePropagateTrace(()=>{let{headers:m,status:g,statusText:M,url:w}=l(),_=null;g!==_2&&(_=typeof o.response>"u"?o.responseText:o.response),g===0&&(g=_?v2:0);let S=g>=200&&g<300;if(t.responseType==="json"&&typeof _=="string"){let E=_;_=_.replace(b2,"");try{_=_!==""?JSON.parse(_):null}catch(D){_=E,S&&(S=!1,_={error:D,text:_})}}S?(s.next(new Nl({body:_,headers:m,status:g,statusText:M,url:w||void 0})),s.complete()):s.error(new ba({error:_,headers:m,status:g,statusText:M,url:w||void 0}))}),d=this.maybePropagateTrace(m=>{let{url:g}=l(),M=new ba({error:m,status:o.status||0,statusText:o.statusText||"Unknown Error",url:g||void 0});s.error(M)}),f=d;t.timeout&&(f=this.maybePropagateTrace(m=>{let{url:g}=l(),M=new ba({error:new DOMException("Request timed out","TimeoutError"),status:o.status||0,statusText:o.statusText||"Request timeout",url:g||void 0});s.error(M)}));let h=!1,p=this.maybePropagateTrace(m=>{h||(s.next(l()),h=!0);let g={type:io.DownloadProgress,loaded:m.loaded};m.lengthComputable&&(g.total=m.total),t.responseType==="text"&&o.responseText&&(g.partialText=o.responseText),s.next(g)}),v=this.maybePropagateTrace(m=>{let g={type:io.UploadProgress,loaded:m.loaded};m.lengthComputable&&(g.total=m.total),s.next(g)});return o.addEventListener("load",u),o.addEventListener("error",d),o.addEventListener("timeout",f),o.addEventListener("abort",d),t.reportProgress&&(o.addEventListener("progress",p),a!==null&&o.upload&&o.upload.addEventListener("progress",v)),o.send(a),s.next({type:io.Sent}),()=>{o.removeEventListener("error",d),o.removeEventListener("abort",d),o.removeEventListener("load",u),o.removeEventListener("timeout",f),t.reportProgress&&(o.removeEventListener("progress",p),a!==null&&o.upload&&o.upload.removeEventListener("progress",v)),o.readyState!==o.DONE&&o.abort()}})))}static \u0275fac=function(i){return new(i||n)(Ye(Rl))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),M2=new Be("",{factory:()=>!0}),S2="XSRF-TOKEN",E2=new Be("",{factory:()=>S2}),w2="X-XSRF-TOKEN",T2=new Be("",{factory:()=>w2}),C2=(()=>{class n{cookieName=ve(E2);doc=ve(Zr);lastCookieString="";lastToken=null;parseCount=0;getToken(){let t=this.doc.cookie||"";return t!==this.lastCookieString&&(this.parseCount++,this.lastToken=__(t,this.cookieName),this.lastCookieString=t),this.lastToken}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),pT=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=Ye(C2),r},providedIn:"root"})}return n})();function mT(n,e){if(!ve(M2)||n.method==="GET"||n.method==="HEAD")return e(n);try{let r=ve(qf).href,{origin:s}=new URL(r),{origin:o}=new URL(n.url,s);if(s!==o)return e(n)}catch(r){return e(n)}let t=ve(pT).getToken(),i=ve(T2);return t!=null&&!n.headers.has(i)&&(n=n.clone({headers:n.headers.set(i,t)})),e(n)}function D2(n,e){return e(n)}function A2(n,e,t){return(i,r)=>Vo(t,()=>e(i,s=>n(s,r)))}var gT=new Be("",{factory:()=>[mT]}),yT=new Be(""),vT=new Be("",{factory:()=>!0});var M_=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=Ye(b_),r},providedIn:"root"})}return n})();var Qf=(()=>{class n{backend;injector;chain=null;pendingTasks=ve(tl);contributeToStability=ve(vT);constructor(t,i){this.backend=t,this.injector=i}handle(t){if(this.chain===null){let i=this.injector.get(eh,null,{skipSelf:!0}),r=i!==null&&this.backend===i,s=this.injector.get(yT,[],r?{self:!0}:void 0),o=Array.from(new Set([...this.injector.get(gT),...s]));this.chain=o.reduceRight((a,c)=>A2(a,c,this.injector),D2)}if(this.contributeToStability){let i=this.pendingTasks.add();return this.chain(t,r=>this.backend.handle(r)).pipe(dg(i))}else return this.chain(t,i=>this.backend.handle(i))}static \u0275fac=function(i){return new(i||n)(Ye(M_),Ye(vn))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),eh=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Ie({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=Ye(Qf),r},providedIn:"root"})}return n})();function x_(n,e){return{body:e,headers:n.headers,context:n.context,observe:n.observe,params:n.params,reportProgress:n.reportProgress,responseType:n.responseType,withCredentials:n.withCredentials,credentials:n.credentials,transferCache:n.transferCache,timeout:n.timeout,keepalive:n.keepalive,priority:n.priority,cache:n.cache,mode:n.mode,redirect:n.redirect,integrity:n.integrity,referrer:n.referrer,referrerPolicy:n.referrerPolicy}}var th=(()=>{class n{handler;constructor(t){this.handler=t}request(t,i,r={}){let s;if(t instanceof xa)s=t;else{let c;r.headers instanceof rs?c=r.headers:c=new rs(r.headers);let l;r.params&&(r.params instanceof Er?l=r.params:l=new Er({fromObject:r.params})),s=new xa(t,i,r.body!==void 0?r.body:null,{headers:c,context:r.context,params:l,reportProgress:r.reportProgress,responseType:r.responseType||"json",withCredentials:r.withCredentials,transferCache:r.transferCache,keepalive:r.keepalive,priority:r.priority,cache:r.cache,mode:r.mode,redirect:r.redirect,credentials:r.credentials,referrer:r.referrer,referrerPolicy:r.referrerPolicy,integrity:r.integrity,timeout:r.timeout})}let o=Lr(s).pipe(ug(c=>this.handler.handle(c)));if(t instanceof xa||r.observe==="events")return o;let a=o.pipe(Dc(c=>c instanceof Nl));switch(r.observe||"body"){case"body":switch(s.responseType){case"arraybuffer":return a.pipe(Tn(c=>{if(c.body!==null&&!(c.body instanceof ArrayBuffer))throw new Fe(2806,!1);return c.body}));case"blob":return a.pipe(Tn(c=>{if(c.body!==null&&!(c.body instanceof Blob))throw new Fe(2807,!1);return c.body}));case"text":return a.pipe(Tn(c=>{if(c.body!==null&&typeof c.body!="string")throw new Fe(2808,!1);return c.body}));default:return a.pipe(Tn(c=>c.body))}case"response":return a;default:throw new Fe(2809,!1)}}delete(t,i={}){return this.request("DELETE",t,i)}get(t,i={}){return this.request("GET",t,i)}head(t,i={}){return this.request("HEAD",t,i)}jsonp(t,i){return this.request("JSONP",t,{params:new Er().append(i,"JSONP_CALLBACK"),observe:"body",responseType:"json"})}options(t,i={}){return this.request("OPTIONS",t,i)}patch(t,i,r={}){return this.request("PATCH",t,x_(r,i))}post(t,i,r={}){return this.request("POST",t,x_(r,i))}put(t,i,r={}){return this.request("PUT",t,x_(r,i))}static \u0275fac=function(i){return new(i||n)(Ye(eh))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function I2(...n){let e=[th,Qf,{provide:eh,useExisting:Qf},{provide:M_,useFactory:()=>ve(x2,{optional:!0})??ve(b_)},{provide:gT,useValue:mT,multi:!0}];for(let t of n)e.push(...t.\u0275providers);return jc(e)}var CT=(()=>{class n{_renderer;_elementRef;onChange=t=>{};onTouched=()=>{};constructor(t,i){this._renderer=t,this._elementRef=i}setProperty(t,i){this._renderer.setProperty(this._elementRef.nativeElement,t,i)}registerOnTouched(t){this.onTouched=t}registerOnChange(t){this.onChange=t}setDisabledState(t){this.setProperty("disabled",t)}static \u0275fac=function(i){return new(i||n)(et(Mr),et(Rn))};static \u0275dir=xn({type:n})}return n})(),oh=(()=>{class n extends CT{static \u0275fac=(()=>{let t;return function(r){return(t||(t=ca(n)))(r||n)}})();static \u0275dir=xn({type:n,features:[Xi]})}return n})(),Ul=new Be(""),N2={provide:Ul,useExisting:zi(()=>P2),multi:!0},P2=(()=>{class n extends oh{writeValue(t){this.setProperty("checked",t)}static \u0275fac=(()=>{let t;return function(r){return(t||(t=ca(n)))(r||n)}})();static \u0275dir=xn({type:n,selectors:[["input","type","checkbox","formControlName",""],["input","type","checkbox","formControl",""],["input","type","checkbox","ngModel",""]],hostBindings:function(i,r){i&1&&Sr("change",function(o){return r.onChange(o.target.checked)})("blur",function(){return r.onTouched()})},standalone:!1,features:[eo([N2]),Xi]})}return n})(),F2={provide:Ul,useExisting:zi(()=>DT),multi:!0};function O2(){let n=no()?no().getUserAgent():"";return/android (\d+)/.test(n.toLowerCase())}var L2=new Be(""),DT=(()=>{class n extends CT{_compositionMode;_composing=!1;constructor(t,i,r){super(t,i),this._compositionMode=r,this._compositionMode==null&&(this._compositionMode=!O2())}writeValue(t){let i=t??"";this.setProperty("value",i)}_handleInput(t){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(t)}_compositionStart(){this._composing=!0}_compositionEnd(t){this._composing=!1,this._compositionMode&&this.onChange(t)}static \u0275fac=function(i){return new(i||n)(et(Mr),et(Rn),et(L2,8))};static \u0275dir=xn({type:n,selectors:[["input","formControlName","",3,"type","checkbox"],["textarea","formControlName",""],["input","formControl","",3,"type","checkbox"],["textarea","formControl",""],["input","ngModel","",3,"type","checkbox"],["textarea","ngModel",""],["","ngDefaultControl",""]],hostBindings:function(i,r){i&1&&Sr("input",function(o){return r._handleInput(o.target.value)})("blur",function(){return r.onTouched()})("compositionstart",function(){return r._compositionStart()})("compositionend",function(o){return r._compositionEnd(o.target.value)})},standalone:!1,features:[eo([F2]),Xi]})}return n})();var k2=new Be(""),U2=new Be("");function AT(n){return n!=null}function IT(n){return Zs(n)?Rs(n):n}function RT(n){let e={};return n.forEach(t=>{e=t!=null?Ae(Ae({},e),t):e}),Object.keys(e).length===0?null:e}function NT(n,e){return e.map(t=>t(n))}function B2(n){return!n.validate}function PT(n){return n.map(e=>B2(e)?e:t=>e.validate(t))}function V2(n){if(!n)return null;let e=n.filter(AT);return e.length==0?null:function(t){return RT(NT(t,e))}}function FT(n){return n!=null?V2(PT(n)):null}function H2(n){if(!n)return null;let e=n.filter(AT);return e.length==0?null:function(t){let i=NT(t,e).map(IT);return Ac(i).pipe(Tn(RT))}}function OT(n){return n!=null?H2(PT(n)):null}function _T(n,e){return n===null?[e]:Array.isArray(n)?[...n,e]:[n,e]}function z2(n){return n._rawValidators}function G2(n){return n._rawAsyncValidators}function S_(n){return n?Array.isArray(n)?n:[n]:[]}function ih(n,e){return Array.isArray(n)?n.includes(e):n===e}function xT(n,e){let t=S_(e);return S_(n).forEach(r=>{ih(t,r)||t.push(r)}),t}function bT(n,e){return S_(e).filter(t=>!ih(n,t))}var rh=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(e){this._rawValidators=e||[],this._composedValidatorFn=FT(this._rawValidators)}_setAsyncValidators(e){this._rawAsyncValidators=e||[],this._composedAsyncValidatorFn=OT(this._rawAsyncValidators)}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(e){this._onDestroyCallbacks.push(e)}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(e=>e()),this._onDestroyCallbacks=[]}reset(e=void 0){this.control?.reset(e)}hasError(e,t){return this.control?this.control.hasError(e,t):!1}getError(e,t){return this.control?this.control.getError(e,t):null}},E_=class extends rh{name;get formDirective(){return null}get path(){return null}},kl=class extends rh{_parent=null;name=null;valueAccessor=null},w_=class{_cd;constructor(e){this._cd=e}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return!!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return!!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return!!this._cd?.control?.invalid}get isPending(){return!!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var Iee=(()=>{class n extends w_{constructor(t){super(t)}static \u0275fac=function(i){return new(i||n)(et(kl,2))};static \u0275dir=xn({type:n,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(i,r){i&2&&ya("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending)},standalone:!1,features:[Xi]})}return n})();var Pl="VALID",nh="INVALID",Sa="PENDING",Fl="DISABLED",ro=class{},sh=class extends ro{value;source;constructor(e,t){super(),this.value=e,this.source=t}},Ol=class extends ro{pristine;source;constructor(e,t){super(),this.pristine=e,this.source=t}},Ll=class extends ro{touched;source;constructor(e,t){super(),this.touched=e,this.source=t}},Ea=class extends ro{status;source;constructor(e,t){super(),this.status=e,this.source=t}};var T_=class extends ro{source;constructor(e){super(),this.source=e}};function j2(n){return(ah(n)?n.validators:n)||null}function W2(n){return Array.isArray(n)?FT(n):n||null}function $2(n,e){return(ah(e)?e.asyncValidators:n)||null}function q2(n){return Array.isArray(n)?OT(n):n||null}function ah(n){return n!=null&&!Array.isArray(n)&&typeof n=="object"}var C_=class{_pendingDirty=!1;_hasOwnPendingAsyncValidator=null;_pendingTouched=!1;_onCollectionChange=()=>{};_updateOn;_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(e,t){this._assignValidators(e),this._assignAsyncValidators(t)}get validator(){return this._composedValidatorFn}set validator(e){this._rawValidators=this._composedValidatorFn=e}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(e){this._rawAsyncValidators=this._composedAsyncValidatorFn=e}get parent(){return this._parent}get status(){return Ei(this.statusReactive)}set status(e){Ei(()=>this.statusReactive.set(e))}_status=Dl(()=>this.statusReactive());statusReactive=js(void 0);get valid(){return this.status===Pl}get invalid(){return this.status===nh}get pending(){return this.status===Sa}get disabled(){return this.status===Fl}get enabled(){return this.status!==Fl}errors;get pristine(){return Ei(this.pristineReactive)}set pristine(e){Ei(()=>this.pristineReactive.set(e))}_pristine=Dl(()=>this.pristineReactive());pristineReactive=js(!0);get dirty(){return!this.pristine}get touched(){return Ei(this.touchedReactive)}set touched(e){Ei(()=>this.touchedReactive.set(e))}_touched=Dl(()=>this.touchedReactive());touchedReactive=js(!1);get untouched(){return!this.touched}_events=new Ut;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(e){this._assignValidators(e)}setAsyncValidators(e){this._assignAsyncValidators(e)}addValidators(e){this.setValidators(xT(e,this._rawValidators))}addAsyncValidators(e){this.setAsyncValidators(xT(e,this._rawAsyncValidators))}removeValidators(e){this.setValidators(bT(e,this._rawValidators))}removeAsyncValidators(e){this.setAsyncValidators(bT(e,this._rawAsyncValidators))}hasValidator(e){return ih(this._rawValidators,e)}hasAsyncValidator(e){return ih(this._rawAsyncValidators,e)}clearValidators(){this.validator=null}clearAsyncValidators(){this.asyncValidator=null}markAsTouched(e={}){let t=this.touched===!1;this.touched=!0;let i=e.sourceControl??this;e.onlySelf||this._parent?.markAsTouched(st(Ae({},e),{sourceControl:i})),t&&e.emitEvent!==!1&&this._events.next(new Ll(!0,i))}markAllAsDirty(e={}){this.markAsDirty({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsDirty(e))}markAllAsTouched(e={}){this.markAsTouched({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsTouched(e))}markAsUntouched(e={}){let t=this.touched===!0;this.touched=!1,this._pendingTouched=!1;let i=e.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:i})}),e.onlySelf||this._parent?._updateTouched(e,i),t&&e.emitEvent!==!1&&this._events.next(new Ll(!1,i))}markAsDirty(e={}){let t=this.pristine===!0;this.pristine=!1;let i=e.sourceControl??this;e.onlySelf||this._parent?.markAsDirty(st(Ae({},e),{sourceControl:i})),t&&e.emitEvent!==!1&&this._events.next(new Ol(!1,i))}markAsPristine(e={}){let t=this.pristine===!1;this.pristine=!0,this._pendingDirty=!1;let i=e.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:!0,emitEvent:e.emitEvent})}),e.onlySelf||this._parent?._updatePristine(e,i),t&&e.emitEvent!==!1&&this._events.next(new Ol(!0,i))}markAsPending(e={}){this.status=Sa;let t=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new Ea(this.status,t)),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.markAsPending(st(Ae({},e),{sourceControl:t}))}disable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=Fl,this.errors=null,this._forEachChild(r=>{r.disable(st(Ae({},e),{onlySelf:!0}))}),this._updateValue();let i=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new sh(this.value,i)),this._events.next(new Ea(this.status,i)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(st(Ae({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(r=>r(!0))}enable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=Pl,this._forEachChild(i=>{i.enable(st(Ae({},e),{onlySelf:!0}))}),this.updateValueAndValidity({onlySelf:!0,emitEvent:e.emitEvent}),this._updateAncestors(st(Ae({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(i=>i(!1))}_updateAncestors(e,t){e.onlySelf||(this._parent?.updateValueAndValidity(e),e.skipPristineCheck||this._parent?._updatePristine({},t),this._parent?._updateTouched({},t))}setParent(e){this._parent=e}getRawValue(){return this.value}updateValueAndValidity(e={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let i=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===Pl||this.status===Sa)&&this._runAsyncValidator(i,e.emitEvent)}let t=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new sh(this.value,t)),this._events.next(new Ea(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.updateValueAndValidity(st(Ae({},e),{sourceControl:t}))}_updateTreeValidity(e={emitEvent:!0}){this._forEachChild(t=>t._updateTreeValidity(e)),this.updateValueAndValidity({onlySelf:!0,emitEvent:e.emitEvent})}_setInitialStatus(){this.status=this._allControlsDisabled()?Fl:Pl}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(e,t){if(this.asyncValidator){this.status=Sa,this._hasOwnPendingAsyncValidator={emitEvent:t!==!1,shouldHaveEmitted:e!==!1};let i=IT(this.asyncValidator(this));this._asyncValidationSubscription=i.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:t,shouldHaveEmitted:e})})}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let e=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??!1;return this._hasOwnPendingAsyncValidator=null,e}return!1}setErrors(e,t={}){this.errors=e,this._updateControlsErrors(t.emitEvent!==!1,this,t.shouldHaveEmitted)}get(e){let t=e;return t==null||(Array.isArray(t)||(t=t.split(".")),t.length===0)?null:t.reduce((i,r)=>i&&i._find(r),this)}getError(e,t){let i=t?this.get(t):this;return i?.errors?i.errors[e]:null}hasError(e,t){return!!this.getError(e,t)}get root(){let e=this;for(;e._parent;)e=e._parent;return e}_updateControlsErrors(e,t,i){this.status=this._calculateStatus(),e&&this.statusChanges.emit(this.status),(e||i)&&this._events.next(new Ea(this.status,t)),this._parent&&this._parent._updateControlsErrors(e,t,i)}_initObservables(){this.valueChanges=new Dn,this.statusChanges=new Dn}_calculateStatus(){return this._allControlsDisabled()?Fl:this.errors?nh:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(Sa)?Sa:this._anyControlsHaveStatus(nh)?nh:Pl}_anyControlsHaveStatus(e){return this._anyControls(t=>t.status===e)}_anyControlsDirty(){return this._anyControls(e=>e.dirty)}_anyControlsTouched(){return this._anyControls(e=>e.touched)}_updatePristine(e,t){let i=!this._anyControlsDirty(),r=this.pristine!==i;this.pristine=i,e.onlySelf||this._parent?._updatePristine(e,t),r&&this._events.next(new Ol(this.pristine,t))}_updateTouched(e={},t){this.touched=this._anyControlsTouched(),this._events.next(new Ll(this.touched,t)),e.onlySelf||this._parent?._updateTouched(e,t)}_onDisabledChange=[];_registerOnCollectionChange(e){this._onCollectionChange=e}_setUpdateStrategy(e){ah(e)&&e.updateOn!=null&&(this._updateOn=e.updateOn)}_parentMarkedDirty(e){return!e&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(e){return null}_assignValidators(e){this._rawValidators=Array.isArray(e)?e.slice():e,this._composedValidatorFn=W2(this._rawValidators)}_assignAsyncValidators(e){this._rawAsyncValidators=Array.isArray(e)?e.slice():e,this._composedAsyncValidatorFn=q2(this._rawAsyncValidators)}};var LT=new Be("",{factory:()=>D_}),D_="always";function X2(n,e){return[...e.path,n]}function Y2(n,e,t=D_){J2(n,e),e.valueAccessor.writeValue(n.value),(n.disabled||t==="always")&&e.valueAccessor.setDisabledState?.(n.disabled),K2(n,e),ek(n,e),Q2(n,e),Z2(n,e)}function MT(n,e){n.forEach(t=>{t.registerOnValidatorChange&&t.registerOnValidatorChange(e)})}function Z2(n,e){if(e.valueAccessor.setDisabledState){let t=i=>{e.valueAccessor.setDisabledState(i)};n.registerOnDisabledChange(t),e._registerOnDestroy(()=>{n._unregisterOnDisabledChange(t)})}}function J2(n,e){let t=z2(n);e.validator!==null?n.setValidators(_T(t,e.validator)):typeof t=="function"&&n.setValidators([t]);let i=G2(n);e.asyncValidator!==null?n.setAsyncValidators(_T(i,e.asyncValidator)):typeof i=="function"&&n.setAsyncValidators([i]);let r=()=>n.updateValueAndValidity();MT(e._rawValidators,r),MT(e._rawAsyncValidators,r)}function K2(n,e){e.valueAccessor.registerOnChange(t=>{n._pendingValue=t,n._pendingChange=!0,n._pendingDirty=!0,n.updateOn==="change"&&kT(n,e)})}function Q2(n,e){e.valueAccessor.registerOnTouched(()=>{n._pendingTouched=!0,n.updateOn==="blur"&&n._pendingChange&&kT(n,e),n.updateOn!=="submit"&&n.markAsTouched()})}function kT(n,e){n._pendingDirty&&n.markAsDirty(),n.setValue(n._pendingValue,{emitModelToViewChange:!1}),e.viewToModelUpdate(n._pendingValue),n._pendingChange=!1}function ek(n,e){let t=(i,r)=>{e.valueAccessor.writeValue(i),r&&e.viewToModelUpdate(i)};n.registerOnChange(t),e._registerOnDestroy(()=>{n._unregisterOnChange(t)})}function tk(n,e){if(!n.hasOwnProperty("model"))return!1;let t=n.model;return t.isFirstChange()?!0:!Object.is(e,t.currentValue)}function nk(n){return Object.getPrototypeOf(n.constructor)===oh}function ik(n,e){if(!e)return null;Array.isArray(e);let t,i,r;return e.forEach(s=>{s.constructor===DT?t=s:nk(s)?i=s:r=s}),r||i||t||null}function ST(n,e){let t=n.indexOf(e);t>-1&&n.splice(t,1)}function ET(n){return typeof n=="object"&&n!==null&&Object.keys(n).length===2&&"value"in n&&"disabled"in n}var rk=class extends C_{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=!1;constructor(e=null,t,i){super(j2(t),$2(i,t)),this._applyFormState(e),this._setUpdateStrategy(t),this._initObservables(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator}),ah(t)&&(t.nonNullable||t.initialValueIsDefault)&&(ET(e)?this.defaultValue=e.value:this.defaultValue=e)}setValue(e,t={}){this.value=this._pendingValue=e,this._onChange.length&&t.emitModelToViewChange!==!1&&this._onChange.forEach(i=>i(this.value,t.emitViewToModelChange!==!1)),this.updateValueAndValidity(t)}patchValue(e,t={}){this.setValue(e,t)}reset(e=this.defaultValue,t={}){this._applyFormState(e),this.markAsPristine(t),this.markAsUntouched(t),this.setValue(this.value,t),t.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=!1,t?.emitEvent!==!1&&this._events.next(new T_(this))}_updateValue(){}_anyControls(e){return!1}_allControlsDisabled(){return this.disabled}registerOnChange(e){this._onChange.push(e)}_unregisterOnChange(e){ST(this._onChange,e)}registerOnDisabledChange(e){this._onDisabledChange.push(e)}_unregisterOnDisabledChange(e){ST(this._onDisabledChange,e)}_forEachChild(e){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:!0,emitModelToViewChange:!1}),!0):!1}_applyFormState(e){ET(e)?(this.value=this._pendingValue=e.value,e.disabled?this.disable({onlySelf:!0,emitEvent:!1}):this.enable({onlySelf:!0,emitEvent:!1})):this.value=this._pendingValue=e}};var sk={provide:kl,useExisting:zi(()=>ok)},wT=Promise.resolve(),ok=(()=>{class n extends kl{_changeDetectorRef;callSetDisabledState;control=new rk;static ngAcceptInputType_isDisabled;_registered=!1;viewModel;name="";isDisabled;model;options;update=new Dn;constructor(t,i,r,s,o,a){super(),this._changeDetectorRef=o,this.callSetDisabledState=a,this._parent=t,this._setValidators(i),this._setAsyncValidators(r),this.valueAccessor=ik(this,s)}ngOnChanges(t){if(this._checkForErrors(),!this._registered||"name"in t){if(this._registered&&(this._checkName(),this.formDirective)){let i=t.name.previousValue;this.formDirective.removeControl({name:i,path:this._getPath(i)})}this._setUpControl()}"isDisabled"in t&&this._updateDisabled(t),tk(t,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model)}ngOnDestroy(){this.formDirective?.removeControl(this)}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t)}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=!0}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn)}_isStandalone(){return!this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){Y2(this.control,this,this.callSetDisabledState),this.control.updateValueAndValidity({emitEvent:!1})}_checkForErrors(){this._checkName()}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name}_updateValue(t){wT.then(()=>{this.control.setValue(t,{emitViewToModelChange:!1}),this._changeDetectorRef?.markForCheck()})}_updateDisabled(t){let i=t.isDisabled.currentValue,r=i!==0&&Kw(i);wT.then(()=>{r&&!this.control.disabled?this.control.disable():!r&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck()})}_getPath(t){return this._parent?X2(t,this._parent):[t]}static \u0275fac=function(i){return new(i||n)(et(E_,9),et(k2,10),et(U2,10),et(Ul,10),et(to,8),et(LT,8))};static \u0275dir=xn({type:n,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:!1,features:[eo([sk]),Xi,yl]})}return n})();var ak={provide:Ul,useExisting:zi(()=>BT),multi:!0};function UT(n,e){return n==null?`${e}`:(e&&typeof e=="object"&&(e="Object"),`${n}: ${e}`.slice(0,50))}function ck(n){return n.split(":")[0]}var BT=(()=>{class n extends oh{value;_optionMap=new Map;_idCounter=0;set compareWith(t){this._compareWith=t}_compareWith=Object.is;appRefInjector=ve(Js).injector;destroyRef=ve(Jr);cdr=ve(to);_queuedWrite=!1;_writeValueAfterRender(){this._queuedWrite||this.appRefInjector.destroyed||(this._queuedWrite=!0,Nv({write:()=>{this.destroyRef.destroyed||(this._queuedWrite=!1,this.writeValue(this.value))}},{injector:this.appRefInjector}))}writeValue(t){this.cdr.markForCheck(),this.value=t;let i=this._getOptionId(t),r=UT(i,t);this.setProperty("value",r)}registerOnChange(t){this.onChange=i=>{this.value=this._getOptionValue(i),t(this.value)}}_registerOption(){return(this._idCounter++).toString()}_getOptionId(t){for(let i of this._optionMap.keys())if(this._compareWith(this._optionMap.get(i),t))return i;return null}_getOptionValue(t){let i=ck(t);return this._optionMap.has(i)?this._optionMap.get(i):t}static \u0275fac=(()=>{let t;return function(r){return(t||(t=ca(n)))(r||n)}})();static \u0275dir=xn({type:n,selectors:[["select","formControlName","",3,"multiple",""],["select","formControl","",3,"multiple",""],["select","ngModel","",3,"multiple",""]],hostBindings:function(i,r){i&1&&Sr("change",function(o){return r.onChange(o.target.value)})("blur",function(){return r.onTouched()})},inputs:{compareWith:"compareWith"},standalone:!1,features:[eo([ak]),Xi]})}return n})(),Nee=(()=>{class n{_element;_renderer;_select;id;constructor(t,i,r){this._element=t,this._renderer=i,this._select=r,this._select&&(this.id=this._select._registerOption())}set ngValue(t){this._select!=null&&(this._select._optionMap.set(this.id,t),this._setElementValue(UT(this.id,t)),this._select._writeValueAfterRender())}set value(t){this._setElementValue(t),this._select?._writeValueAfterRender()}_setElementValue(t){this._renderer.setProperty(this._element.nativeElement,"value",t)}ngOnDestroy(){this._select?._optionMap.delete(this.id),this._select?._writeValueAfterRender()}static \u0275fac=function(i){return new(i||n)(et(Rn),et(Mr),et(BT,9))};static \u0275dir=xn({type:n,selectors:[["option"]],inputs:{ngValue:"ngValue",value:"value"},standalone:!1})}return n})(),lk={provide:Ul,useExisting:zi(()=>VT),multi:!0};function TT(n,e){return n==null?`${e}`:(typeof e=="string"&&(e=`'${e}'`),e&&typeof e=="object"&&(e="Object"),`${n}: ${e}`.slice(0,50))}function uk(n){return n.split(":")[0]}var VT=(()=>{class n extends oh{value;_optionMap=new Map;_idCounter=0;set compareWith(t){this._compareWith=t}_compareWith=Object.is;writeValue(t){this.value=t;let i;if(Array.isArray(t)){let r=t.map(s=>this._getOptionId(s));i=(s,o)=>{s._setSelected(r.indexOf(o)>-1)}}else i=r=>{r._setSelected(!1)};this._optionMap.forEach(i)}registerOnChange(t){this.onChange=i=>{let r=[],s=i.selectedOptions;if(s!==void 0){let o=s;for(let a=0;a<o.length;a++){let c=o[a],l=this._getOptionValue(c.value);r.push(l)}}else{let o=i.options;for(let a=0;a<o.length;a++){let c=o[a];if(c.selected){let l=this._getOptionValue(c.value);r.push(l)}}}this.value=r,t(r)}}_registerOption(t){let i=(this._idCounter++).toString();return this._optionMap.set(i,t),i}_getOptionId(t){for(let i of this._optionMap.keys())if(this._compareWith(this._optionMap.get(i)._value,t))return i;return null}_getOptionValue(t){let i=uk(t);return this._optionMap.has(i)?this._optionMap.get(i)._value:t}static \u0275fac=(()=>{let t;return function(r){return(t||(t=ca(n)))(r||n)}})();static \u0275dir=xn({type:n,selectors:[["select","multiple","","formControlName",""],["select","multiple","","formControl",""],["select","multiple","","ngModel",""]],hostBindings:function(i,r){i&1&&Sr("change",function(o){return r.onChange(o.target)})("blur",function(){return r.onTouched()})},inputs:{compareWith:"compareWith"},standalone:!1,features:[eo([lk]),Xi]})}return n})(),Pee=(()=>{class n{_element;_renderer;_select;id;_value;constructor(t,i,r){this._element=t,this._renderer=i,this._select=r,this._select&&(this.id=this._select._registerOption(this))}set ngValue(t){this._select!=null&&(this._value=t,this._setElementValue(TT(this.id,t)),this._select.writeValue(this._select.value))}set value(t){this._select?(this._value=t,this._setElementValue(TT(this.id,t)),this._select.writeValue(this._select.value)):this._setElementValue(t)}_setElementValue(t){this._renderer.setProperty(this._element.nativeElement,"value",t)}_setSelected(t){this._renderer.setProperty(this._element.nativeElement,"selected",t)}ngOnDestroy(){this._select&&(this._select._optionMap.delete(this.id),this._select.writeValue(this._select.value))}static \u0275fac=function(i){return new(i||n)(et(Rn),et(Mr),et(VT,9))};static \u0275dir=xn({type:n,selectors:[["option"]],inputs:{ngValue:"ngValue",value:"value"},standalone:!1})}return n})();var dk=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=Ys({type:n});static \u0275inj=Vr({})}return n})();var Fee=(()=>{class n{static withConfig(t){return{ngModule:n,providers:[{provide:LT,useValue:t.callSetDisabledState??D_}]}}static \u0275fac=function(i){return new(i||n)};static \u0275mod=Ys({type:n});static \u0275inj=Vr({imports:[dk]})}return n})();function Bl(n,e){return n==null||e==null?NaN:n<e?-1:n>e?1:n>=e?0:NaN}function fk(n,e){return n==null||e==null?NaN:e<n?-1:e>n?1:e>=n?0:NaN}function HT(n){let e,t,i;n.length!==2?(e=Bl,t=(a,c)=>Bl(n(a),c),i=(a,c)=>n(a)-c):(e=n===Bl||n===fk?n:hk,t=n,i=n);function r(a,c,l=0,u=a.length){if(l<u){if(e(c,c)!==0)return u;do{let d=l+u>>>1;t(a[d],c)<0?l=d+1:u=d}while(l<u)}return l}function s(a,c,l=0,u=a.length){if(l<u){if(e(c,c)!==0)return u;do{let d=l+u>>>1;t(a[d],c)<=0?l=d+1:u=d}while(l<u)}return l}function o(a,c,l=0,u=a.length){let d=r(a,c,l,u-1);return d>l&&i(a[d-1],c)>-i(a[d],c)?d-1:d}return{left:r,center:o,right:s}}function hk(){return 0}function pk(n){return n===null?NaN:+n}var zT=HT(Bl),A_=zT.right,Uee=zT.left,Bee=HT(pk).center;var Vee=GT(jT),Hee=GT(mk);function GT(n){return function(e,t,i=t){if(!((t=+t)>=0))throw new RangeError("invalid rx");if(!((i=+i)>=0))throw new RangeError("invalid ry");let{data:r,width:s,height:o}=e;if(!((s=Math.floor(s))>=0))throw new RangeError("invalid width");if(!((o=Math.floor(o!==void 0?o:r.length/s))>=0))throw new RangeError("invalid height");if(!s||!o||!t&&!i)return e;let a=t&&n(t),c=i&&n(i),l=r.slice();return a&&c?(wa(a,l,r,s,o),wa(a,r,l,s,o),wa(a,l,r,s,o),Ta(c,r,l,s,o),Ta(c,l,r,s,o),Ta(c,r,l,s,o)):a?(wa(a,r,l,s,o),wa(a,l,r,s,o),wa(a,r,l,s,o)):c&&(Ta(c,r,l,s,o),Ta(c,l,r,s,o),Ta(c,r,l,s,o)),e}}function wa(n,e,t,i,r){for(let s=0,o=i*r;s<o;)n(e,t,s,s+=i,1)}function Ta(n,e,t,i,r){for(let s=0,o=i*r;s<i;++s)n(e,t,s,s+o,i)}function mk(n){let e=jT(n);return(t,i,r,s,o)=>{r<<=2,s<<=2,o<<=2,e(t,i,r+0,s+0,o),e(t,i,r+1,s+1,o),e(t,i,r+2,s+2,o),e(t,i,r+3,s+3,o)}}function jT(n){let e=Math.floor(n);if(e===n)return gk(n);let t=n-e,i=2*n+1;return(r,s,o,a,c)=>{if(!((a-=c)>=o))return;let l=e*s[o],u=c*e,d=u+c;for(let f=o,h=o+u;f<h;f+=c)l+=s[Math.min(a,f)];for(let f=o,h=a;f<=h;f+=c)l+=s[Math.min(a,f+u)],r[f]=(l+t*(s[Math.max(o,f-d)]+s[Math.min(a,f+d)]))/i,l-=s[Math.max(o,f-u)]}}function gk(n){let e=2*n+1;return(t,i,r,s,o)=>{if(!((s-=o)>=r))return;let a=n*i[r],c=o*n;for(let l=r,u=r+c;l<u;l+=o)a+=i[Math.min(s,l)];for(let l=r,u=s;l<=u;l+=o)a+=i[Math.min(s,l+c)],t[l]=a/e,a-=i[Math.max(r,l-c)]}}var yk=Array.prototype,zee=yk.slice;var vk=Math.sqrt(50),_k=Math.sqrt(10),xk=Math.sqrt(2);function ch(n,e,t){let i=(e-n)/Math.max(0,t),r=Math.floor(Math.log10(i)),s=i/Math.pow(10,r),o=s>=vk?10:s>=_k?5:s>=xk?2:1,a,c,l;return r<0?(l=Math.pow(10,-r)/o,a=Math.round(n*l),c=Math.round(e*l),a/l<n&&++a,c/l>e&&--c,l=-l):(l=Math.pow(10,r)*o,a=Math.round(n/l),c=Math.round(e/l),a*l<n&&++a,c*l>e&&--c),c<a&&.5<=t&&t<2?ch(n,e,t*2):[a,c,l]}function WT(n,e,t){if(e=+e,n=+n,t=+t,!(t>0))return[];if(n===e)return[n];let i=e<n,[r,s,o]=i?ch(e,n,t):ch(n,e,t);if(!(s>=r))return[];let a=s-r+1,c=new Array(a);if(i)if(o<0)for(let l=0;l<a;++l)c[l]=(s-l)/-o;else for(let l=0;l<a;++l)c[l]=(s-l)*o;else if(o<0)for(let l=0;l<a;++l)c[l]=(r+l)/-o;else for(let l=0;l<a;++l)c[l]=(r+l)*o;return c}function lh(n,e,t){return e=+e,n=+n,t=+t,ch(n,e,t)[2]}function $T(n,e,t){e=+e,n=+n,t=+t;let i=e<n,r=i?lh(e,n,t):lh(n,e,t);return(i?-1:1)*(r<0?1/-r:r)}function Gee(n,e){let t;if(e===void 0)for(let i of n)i!=null&&(t<i||t===void 0&&i>=i)&&(t=i);else{let i=-1;for(let r of n)(r=e(r,++i,n))!=null&&(t<r||t===void 0&&r>=r)&&(t=r)}return t}function jee(n,e){let t;if(e===void 0)for(let i of n)i!=null&&(t>i||t===void 0&&i>=i)&&(t=i);else{let i=-1;for(let r of n)(r=e(r,++i,n))!=null&&(t>r||t===void 0&&r>=r)&&(t=r)}return t}var Wee=bk(Math.random);function bk(n){return function(t,i=0,r=t.length){let s=r-(i=+i);for(;s;){let o=n()*s--|0,a=t[s+i];t[s+i]=t[o+i],t[o+i]=a}return t}}var I_="http://www.w3.org/1999/xhtml",qT={svg:"http://www.w3.org/2000/svg",xhtml:I_,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function XT(n){var e=n+="",t=e.indexOf(":");return t>=0&&(e=n.slice(0,t))!=="xmlns"&&(n=n.slice(t+1)),qT.hasOwnProperty(e)?{space:qT[e],local:n}:n}function Mk(n){return function(){var e=this.ownerDocument,t=this.namespaceURI;return t===I_&&e.documentElement.namespaceURI===I_?e.createElement(n):e.createElementNS(t,n)}}function Sk(n){return function(){return this.ownerDocument.createElementNS(n.space,n.local)}}function YT(n){var e=XT(n);return(e.local?Sk:Mk)(e)}function Ek(){}function ZT(n){return n==null?Ek:function(){return this.querySelector(n)}}function wk(n){typeof n!="function"&&(n=ZT(n));for(var e=this._groups,t=e.length,i=new Array(t),r=0;r<t;++r)for(var s=e[r],o=s.length,a=i[r]=new Array(o),c,l,u=0;u<o;++u)(c=s[u])&&(l=n.call(c,c.__data__,u,s))&&("__data__"in c&&(l.__data__=c.__data__),a[u]=l);return new Kn(i,this._parents)}function Tk(n){return n==null?[]:Array.isArray(n)?n:Array.from(n)}function Ck(){return[]}function Dk(n){return n==null?Ck:function(){return this.querySelectorAll(n)}}function Ak(n){return function(){return Tk(n.apply(this,arguments))}}function Ik(n){typeof n=="function"?n=Ak(n):n=Dk(n);for(var e=this._groups,t=e.length,i=[],r=[],s=0;s<t;++s)for(var o=e[s],a=o.length,c,l=0;l<a;++l)(c=o[l])&&(i.push(n.call(c,c.__data__,l,o)),r.push(c));return new Kn(i,r)}function Rk(n){return function(){return this.matches(n)}}function JT(n){return function(e){return e.matches(n)}}var Nk=Array.prototype.find;function Pk(n){return function(){return Nk.call(this.children,n)}}function Fk(){return this.firstElementChild}function Ok(n){return this.select(n==null?Fk:Pk(typeof n=="function"?n:JT(n)))}var Lk=Array.prototype.filter;function kk(){return Array.from(this.children)}function Uk(n){return function(){return Lk.call(this.children,n)}}function Bk(n){return this.selectAll(n==null?kk:Uk(typeof n=="function"?n:JT(n)))}function Vk(n){typeof n!="function"&&(n=Rk(n));for(var e=this._groups,t=e.length,i=new Array(t),r=0;r<t;++r)for(var s=e[r],o=s.length,a=i[r]=[],c,l=0;l<o;++l)(c=s[l])&&n.call(c,c.__data__,l,s)&&a.push(c);return new Kn(i,this._parents)}function KT(n){return new Array(n.length)}function Hk(){return new Kn(this._enter||this._groups.map(KT),this._parents)}function uh(n,e){this.ownerDocument=n.ownerDocument,this.namespaceURI=n.namespaceURI,this._next=null,this._parent=n,this.__data__=e}uh.prototype={constructor:uh,appendChild:function(n){return this._parent.insertBefore(n,this._next)},insertBefore:function(n,e){return this._parent.insertBefore(n,e)},querySelector:function(n){return this._parent.querySelector(n)},querySelectorAll:function(n){return this._parent.querySelectorAll(n)}};function zk(n){return function(){return n}}function Gk(n,e,t,i,r,s){for(var o=0,a,c=e.length,l=s.length;o<l;++o)(a=e[o])?(a.__data__=s[o],i[o]=a):t[o]=new uh(n,s[o]);for(;o<c;++o)(a=e[o])&&(r[o]=a)}function jk(n,e,t,i,r,s,o){var a,c,l=new Map,u=e.length,d=s.length,f=new Array(u),h;for(a=0;a<u;++a)(c=e[a])&&(f[a]=h=o.call(c,c.__data__,a,e)+"",l.has(h)?r[a]=c:l.set(h,c));for(a=0;a<d;++a)h=o.call(n,s[a],a,s)+"",(c=l.get(h))?(i[a]=c,c.__data__=s[a],l.delete(h)):t[a]=new uh(n,s[a]);for(a=0;a<u;++a)(c=e[a])&&l.get(f[a])===c&&(r[a]=c)}function Wk(n){return n.__data__}function $k(n,e){if(!arguments.length)return Array.from(this,Wk);var t=e?jk:Gk,i=this._parents,r=this._groups;typeof n!="function"&&(n=zk(n));for(var s=r.length,o=new Array(s),a=new Array(s),c=new Array(s),l=0;l<s;++l){var u=i[l],d=r[l],f=d.length,h=qk(n.call(u,u&&u.__data__,l,i)),p=h.length,v=a[l]=new Array(p),m=o[l]=new Array(p),g=c[l]=new Array(f);t(u,d,v,m,g,h,e);for(var M=0,w=0,_,S;M<p;++M)if(_=v[M]){for(M>=w&&(w=M+1);!(S=m[w])&&++w<p;);_._next=S||null}}return o=new Kn(o,i),o._enter=a,o._exit=c,o}function qk(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function Xk(){return new Kn(this._exit||this._groups.map(KT),this._parents)}function Yk(n,e,t){var i=this.enter(),r=this,s=this.exit();return typeof n=="function"?(i=n(i),i&&(i=i.selection())):i=i.append(n+""),e!=null&&(r=e(r),r&&(r=r.selection())),t==null?s.remove():t(s),i&&r?i.merge(r).order():r}function Zk(n){for(var e=n.selection?n.selection():n,t=this._groups,i=e._groups,r=t.length,s=i.length,o=Math.min(r,s),a=new Array(r),c=0;c<o;++c)for(var l=t[c],u=i[c],d=l.length,f=a[c]=new Array(d),h,p=0;p<d;++p)(h=l[p]||u[p])&&(f[p]=h);for(;c<r;++c)a[c]=t[c];return new Kn(a,this._parents)}function Jk(){for(var n=this._groups,e=-1,t=n.length;++e<t;)for(var i=n[e],r=i.length-1,s=i[r],o;--r>=0;)(o=i[r])&&(s&&o.compareDocumentPosition(s)^4&&s.parentNode.insertBefore(o,s),s=o);return this}function Kk(n){n||(n=Qk);function e(d,f){return d&&f?n(d.__data__,f.__data__):!d-!f}for(var t=this._groups,i=t.length,r=new Array(i),s=0;s<i;++s){for(var o=t[s],a=o.length,c=r[s]=new Array(a),l,u=0;u<a;++u)(l=o[u])&&(c[u]=l);c.sort(e)}return new Kn(r,this._parents).order()}function Qk(n,e){return n<e?-1:n>e?1:n>=e?0:NaN}function e3(){var n=arguments[0];return arguments[0]=this,n.apply(null,arguments),this}function t3(){return Array.from(this)}function n3(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],r=0,s=i.length;r<s;++r){var o=i[r];if(o)return o}return null}function i3(){let n=0;for(let e of this)++n;return n}function r3(){return!this.node()}function s3(n){for(var e=this._groups,t=0,i=e.length;t<i;++t)for(var r=e[t],s=0,o=r.length,a;s<o;++s)(a=r[s])&&n.call(a,a.__data__,s,r);return this}function o3(n){return function(){this.removeAttribute(n)}}function a3(n){return function(){this.removeAttributeNS(n.space,n.local)}}function c3(n,e){return function(){this.setAttribute(n,e)}}function l3(n,e){return function(){this.setAttributeNS(n.space,n.local,e)}}function u3(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttribute(n):this.setAttribute(n,t)}}function d3(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttributeNS(n.space,n.local):this.setAttributeNS(n.space,n.local,t)}}function f3(n,e){var t=XT(n);if(arguments.length<2){var i=this.node();return t.local?i.getAttributeNS(t.space,t.local):i.getAttribute(t)}return this.each((e==null?t.local?a3:o3:typeof e=="function"?t.local?d3:u3:t.local?l3:c3)(t,e))}function QT(n){return n.ownerDocument&&n.ownerDocument.defaultView||n.document&&n||n.defaultView}function h3(n){return function(){this.style.removeProperty(n)}}function p3(n,e,t){return function(){this.style.setProperty(n,e,t)}}function m3(n,e,t){return function(){var i=e.apply(this,arguments);i==null?this.style.removeProperty(n):this.style.setProperty(n,i,t)}}function g3(n,e,t){return arguments.length>1?this.each((e==null?h3:typeof e=="function"?m3:p3)(n,e,t??"")):y3(this.node(),n)}function y3(n,e){return n.style.getPropertyValue(e)||QT(n).getComputedStyle(n,null).getPropertyValue(e)}function v3(n){return function(){delete this[n]}}function _3(n,e){return function(){this[n]=e}}function x3(n,e){return function(){var t=e.apply(this,arguments);t==null?delete this[n]:this[n]=t}}function b3(n,e){return arguments.length>1?this.each((e==null?v3:typeof e=="function"?x3:_3)(n,e)):this.node()[n]}function eC(n){return n.trim().split(/^|\s+/)}function N_(n){return n.classList||new tC(n)}function tC(n){this._node=n,this._names=eC(n.getAttribute("class")||"")}tC.prototype={add:function(n){var e=this._names.indexOf(n);e<0&&(this._names.push(n),this._node.setAttribute("class",this._names.join(" ")))},remove:function(n){var e=this._names.indexOf(n);e>=0&&(this._names.splice(e,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(n){return this._names.indexOf(n)>=0}};function nC(n,e){for(var t=N_(n),i=-1,r=e.length;++i<r;)t.add(e[i])}function iC(n,e){for(var t=N_(n),i=-1,r=e.length;++i<r;)t.remove(e[i])}function M3(n){return function(){nC(this,n)}}function S3(n){return function(){iC(this,n)}}function E3(n,e){return function(){(e.apply(this,arguments)?nC:iC)(this,n)}}function w3(n,e){var t=eC(n+"");if(arguments.length<2){for(var i=N_(this.node()),r=-1,s=t.length;++r<s;)if(!i.contains(t[r]))return!1;return!0}return this.each((typeof e=="function"?E3:e?M3:S3)(t,e))}function T3(){this.textContent=""}function C3(n){return function(){this.textContent=n}}function D3(n){return function(){var e=n.apply(this,arguments);this.textContent=e??""}}function A3(n){return arguments.length?this.each(n==null?T3:(typeof n=="function"?D3:C3)(n)):this.node().textContent}function I3(){this.innerHTML=""}function R3(n){return function(){this.innerHTML=n}}function N3(n){return function(){var e=n.apply(this,arguments);this.innerHTML=e??""}}function P3(n){return arguments.length?this.each(n==null?I3:(typeof n=="function"?N3:R3)(n)):this.node().innerHTML}function F3(){this.nextSibling&&this.parentNode.appendChild(this)}function O3(){return this.each(F3)}function L3(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function k3(){return this.each(L3)}function U3(n){var e=typeof n=="function"?n:YT(n);return this.select(function(){return this.appendChild(e.apply(this,arguments))})}function B3(){return null}function V3(n,e){var t=typeof n=="function"?n:YT(n),i=e==null?B3:typeof e=="function"?e:ZT(e);return this.select(function(){return this.insertBefore(t.apply(this,arguments),i.apply(this,arguments)||null)})}function H3(){var n=this.parentNode;n&&n.removeChild(this)}function z3(){return this.each(H3)}function G3(){var n=this.cloneNode(!1),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function j3(){var n=this.cloneNode(!0),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function W3(n){return this.select(n?j3:G3)}function $3(n){return arguments.length?this.property("__data__",n):this.node().__data__}function q3(n){return function(e){n.call(this,e,this.__data__)}}function X3(n){return n.trim().split(/^|\s+/).map(function(e){var t="",i=e.indexOf(".");return i>=0&&(t=e.slice(i+1),e=e.slice(0,i)),{type:e,name:t}})}function Y3(n){return function(){var e=this.__on;if(e){for(var t=0,i=-1,r=e.length,s;t<r;++t)s=e[t],(!n.type||s.type===n.type)&&s.name===n.name?this.removeEventListener(s.type,s.listener,s.options):e[++i]=s;++i?e.length=i:delete this.__on}}}function Z3(n,e,t){return function(){var i=this.__on,r,s=q3(e);if(i){for(var o=0,a=i.length;o<a;++o)if((r=i[o]).type===n.type&&r.name===n.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=s,r.options=t),r.value=e;return}}this.addEventListener(n.type,s,t),r={type:n.type,name:n.name,value:e,listener:s,options:t},i?i.push(r):this.__on=[r]}}function J3(n,e,t){var i=X3(n+""),r,s=i.length,o;if(arguments.length<2){var a=this.node().__on;if(a){for(var c=0,l=a.length,u;c<l;++c)for(r=0,u=a[c];r<s;++r)if((o=i[r]).type===u.type&&o.name===u.name)return u.value}return}for(a=e?Z3:Y3,r=0;r<s;++r)this.each(a(i[r],e,t));return this}function rC(n,e,t){var i=QT(n),r=i.CustomEvent;typeof r=="function"?r=new r(e,t):(r=i.document.createEvent("Event"),t?(r.initEvent(e,t.bubbles,t.cancelable),r.detail=t.detail):r.initEvent(e,!1,!1)),n.dispatchEvent(r)}function K3(n,e){return function(){return rC(this,n,e)}}function Q3(n,e){return function(){return rC(this,n,e.apply(this,arguments))}}function eU(n,e){return this.each((typeof e=="function"?Q3:K3)(n,e))}function*tU(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],r=0,s=i.length,o;r<s;++r)(o=i[r])&&(yield o)}var sC=[null];function Kn(n,e){this._groups=n,this._parents=e}function nU(){return new Kn([[document.documentElement]],sC)}function iU(){return this}Kn.prototype=nU.prototype={constructor:Kn,select:wk,selectAll:Ik,selectChild:Ok,selectChildren:Bk,filter:Vk,data:$k,enter:Hk,exit:Xk,join:Yk,merge:Zk,selection:iU,order:Jk,sort:Kk,call:e3,nodes:t3,node:n3,size:i3,empty:r3,each:s3,attr:f3,style:g3,property:b3,classed:w3,text:A3,html:P3,raise:O3,lower:k3,append:U3,insert:V3,remove:z3,clone:W3,datum:$3,on:J3,dispatch:eU,[Symbol.iterator]:tU};function Xee(n){return typeof n=="string"?new Kn([[document.querySelector(n)]],[document.documentElement]):new Kn([[n]],sC)}var rU=0;function sU(){return new R_}function R_(){this._="@"+(++rU).toString(36)}R_.prototype=sU.prototype={constructor:R_,get:function(n){for(var e=this._;!(e in n);)if(!(n=n.parentNode))return;return n[e]},set:function(n,e){return n[this._]=e},remove:function(n){return this._ in n&&delete n[this._]},toString:function(){return this._}};function oU(n){let e;for(;e=n.sourceEvent;)n=e;return n}function Yee(n,e){if(n=oU(n),e===void 0&&(e=n.currentTarget),e){var t=e.ownerSVGElement||e;if(t.createSVGPoint){var i=t.createSVGPoint();return i.x=n.clientX,i.y=n.clientY,i=i.matrixTransform(e.getScreenCTM().inverse()),[i.x,i.y]}if(e.getBoundingClientRect){var r=e.getBoundingClientRect();return[n.clientX-r.left-e.clientLeft,n.clientY-r.top-e.clientTop]}}return[n.pageX,n.pageY]}function Ia(n,e,t){n.prototype=e.prototype=t,t.constructor=n}function zl(n,e){var t=Object.create(n.prototype);for(var i in e)t[i]=e[i];return t}function ss(){}var co=.7,Aa=1/co,Ca="\\s*([+-]?\\d+)\\s*",Vl="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",Ji="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",aU=/^#([0-9a-f]{3,8})$/,cU=new RegExp(`^rgb\\(${Ca},${Ca},${Ca}\\)$`),lU=new RegExp(`^rgb\\(${Ji},${Ji},${Ji}\\)$`),uU=new RegExp(`^rgba\\(${Ca},${Ca},${Ca},${Vl}\\)$`),dU=new RegExp(`^rgba\\(${Ji},${Ji},${Ji},${Vl}\\)$`),fU=new RegExp(`^hsl\\(${Vl},${Ji},${Ji}\\)$`),hU=new RegExp(`^hsla\\(${Vl},${Ji},${Ji},${Vl}\\)$`),oC={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Ia(ss,Ra,{copy(n){return Object.assign(new this.constructor,this,n)},displayable(){return this.rgb().displayable()},hex:aC,formatHex:aC,formatHex8:pU,formatHsl:mU,formatRgb:cC,toString:cC});function aC(){return this.rgb().formatHex()}function pU(){return this.rgb().formatHex8()}function mU(){return yC(this).formatHsl()}function cC(){return this.rgb().formatRgb()}function Ra(n){var e,t;return n=(n+"").trim().toLowerCase(),(e=aU.exec(n))?(t=e[1].length,e=parseInt(e[1],16),t===6?lC(e):t===3?new tn(e>>8&15|e>>4&240,e>>4&15|e&240,(e&15)<<4|e&15,1):t===8?dh(e>>24&255,e>>16&255,e>>8&255,(e&255)/255):t===4?dh(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|e&240,((e&15)<<4|e&15)/255):null):(e=cU.exec(n))?new tn(e[1],e[2],e[3],1):(e=lU.exec(n))?new tn(e[1]*255/100,e[2]*255/100,e[3]*255/100,1):(e=uU.exec(n))?dh(e[1],e[2],e[3],e[4]):(e=dU.exec(n))?dh(e[1]*255/100,e[2]*255/100,e[3]*255/100,e[4]):(e=fU.exec(n))?fC(e[1],e[2]/100,e[3]/100,1):(e=hU.exec(n))?fC(e[1],e[2]/100,e[3]/100,e[4]):oC.hasOwnProperty(n)?lC(oC[n]):n==="transparent"?new tn(NaN,NaN,NaN,0):null}function lC(n){return new tn(n>>16&255,n>>8&255,n&255,1)}function dh(n,e,t,i){return i<=0&&(n=e=t=NaN),new tn(n,e,t,i)}function U_(n){return n instanceof ss||(n=Ra(n)),n?(n=n.rgb(),new tn(n.r,n.g,n.b,n.opacity)):new tn}function Gl(n,e,t,i){return arguments.length===1?U_(n):new tn(n,e,t,i??1)}function tn(n,e,t,i){this.r=+n,this.g=+e,this.b=+t,this.opacity=+i}Ia(tn,Gl,zl(ss,{brighter(n){return n=n==null?Aa:Math.pow(Aa,n),new tn(this.r*n,this.g*n,this.b*n,this.opacity)},darker(n){return n=n==null?co:Math.pow(co,n),new tn(this.r*n,this.g*n,this.b*n,this.opacity)},rgb(){return this},clamp(){return new tn(oo(this.r),oo(this.g),oo(this.b),hh(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:uC,formatHex:uC,formatHex8:gU,formatRgb:dC,toString:dC}));function uC(){return`#${so(this.r)}${so(this.g)}${so(this.b)}`}function gU(){return`#${so(this.r)}${so(this.g)}${so(this.b)}${so((isNaN(this.opacity)?1:this.opacity)*255)}`}function dC(){let n=hh(this.opacity);return`${n===1?"rgb(":"rgba("}${oo(this.r)}, ${oo(this.g)}, ${oo(this.b)}${n===1?")":`, ${n})`}`}function hh(n){return isNaN(n)?1:Math.max(0,Math.min(1,n))}function oo(n){return Math.max(0,Math.min(255,Math.round(n)||0))}function so(n){return n=oo(n),(n<16?"0":"")+n.toString(16)}function fC(n,e,t,i){return i<=0?n=e=t=NaN:t<=0||t>=1?n=e=NaN:e<=0&&(n=NaN),new wi(n,e,t,i)}function yC(n){if(n instanceof wi)return new wi(n.h,n.s,n.l,n.opacity);if(n instanceof ss||(n=Ra(n)),!n)return new wi;if(n instanceof wi)return n;n=n.rgb();var e=n.r/255,t=n.g/255,i=n.b/255,r=Math.min(e,t,i),s=Math.max(e,t,i),o=NaN,a=s-r,c=(s+r)/2;return a?(e===s?o=(t-i)/a+(t<i)*6:t===s?o=(i-e)/a+2:o=(e-t)/a+4,a/=c<.5?s+r:2-s-r,o*=60):a=c>0&&c<1?0:o,new wi(o,a,c,n.opacity)}function mh(n,e,t,i){return arguments.length===1?yC(n):new wi(n,e,t,i??1)}function wi(n,e,t,i){this.h=+n,this.s=+e,this.l=+t,this.opacity=+i}Ia(wi,mh,zl(ss,{brighter(n){return n=n==null?Aa:Math.pow(Aa,n),new wi(this.h,this.s,this.l*n,this.opacity)},darker(n){return n=n==null?co:Math.pow(co,n),new wi(this.h,this.s,this.l*n,this.opacity)},rgb(){var n=this.h%360+(this.h<0)*360,e=isNaN(n)||isNaN(this.s)?0:this.s,t=this.l,i=t+(t<.5?t:1-t)*e,r=2*t-i;return new tn(P_(n>=240?n-240:n+120,r,i),P_(n,r,i),P_(n<120?n+240:n-120,r,i),this.opacity)},clamp(){return new wi(hC(this.h),fh(this.s),fh(this.l),hh(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){let n=hh(this.opacity);return`${n===1?"hsl(":"hsla("}${hC(this.h)}, ${fh(this.s)*100}%, ${fh(this.l)*100}%${n===1?")":`, ${n})`}`}}));function hC(n){return n=(n||0)%360,n<0?n+360:n}function fh(n){return Math.max(0,Math.min(1,n||0))}function P_(n,e,t){return(n<60?e+(t-e)*n/60:n<180?t:n<240?e+(t-e)*(240-n)/60:e)*255}var vC=Math.PI/180,_C=180/Math.PI,ph=18,xC=.96422,bC=1,MC=.82521,SC=4/29,Da=6/29,EC=3*Da*Da,yU=Da*Da*Da;function wC(n){if(n instanceof Ki)return new Ki(n.l,n.a,n.b,n.opacity);if(n instanceof wr)return CC(n);n instanceof tn||(n=U_(n));var e=k_(n.r),t=k_(n.g),i=k_(n.b),r=F_((.2225045*e+.7168786*t+.0606169*i)/bC),s,o;return e===t&&t===i?s=o=r:(s=F_((.4360747*e+.3850649*t+.1430804*i)/xC),o=F_((.0139322*e+.0971045*t+.7141733*i)/MC)),new Ki(116*r-16,500*(s-r),200*(r-o),n.opacity)}function TC(n,e,t,i){return arguments.length===1?wC(n):new Ki(n,e,t,i??1)}function Ki(n,e,t,i){this.l=+n,this.a=+e,this.b=+t,this.opacity=+i}Ia(Ki,TC,zl(ss,{brighter(n){return new Ki(this.l+ph*(n??1),this.a,this.b,this.opacity)},darker(n){return new Ki(this.l-ph*(n??1),this.a,this.b,this.opacity)},rgb(){var n=(this.l+16)/116,e=isNaN(this.a)?n:n+this.a/500,t=isNaN(this.b)?n:n-this.b/200;return e=xC*O_(e),n=bC*O_(n),t=MC*O_(t),new tn(L_(3.1338561*e-1.6168667*n-.4906146*t),L_(-.9787684*e+1.9161415*n+.033454*t),L_(.0719453*e-.2289914*n+1.4052427*t),this.opacity)}}));function F_(n){return n>yU?Math.pow(n,1/3):n/EC+SC}function O_(n){return n>Da?n*n*n:EC*(n-SC)}function L_(n){return 255*(n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055)}function k_(n){return(n/=255)<=.04045?n/12.92:Math.pow((n+.055)/1.055,2.4)}function vU(n){if(n instanceof wr)return new wr(n.h,n.c,n.l,n.opacity);if(n instanceof Ki||(n=wC(n)),n.a===0&&n.b===0)return new wr(NaN,0<n.l&&n.l<100?0:NaN,n.l,n.opacity);var e=Math.atan2(n.b,n.a)*_C;return new wr(e<0?e+360:e,Math.sqrt(n.a*n.a+n.b*n.b),n.l,n.opacity)}function gh(n,e,t,i){return arguments.length===1?vU(n):new wr(n,e,t,i??1)}function wr(n,e,t,i){this.h=+n,this.c=+e,this.l=+t,this.opacity=+i}function CC(n){if(isNaN(n.h))return new Ki(n.l,0,0,n.opacity);var e=n.h*vC;return new Ki(n.l,Math.cos(e)*n.c,Math.sin(e)*n.c,n.opacity)}Ia(wr,gh,zl(ss,{brighter(n){return new wr(this.h,this.c,this.l+ph*(n??1),this.opacity)},darker(n){return new wr(this.h,this.c,this.l-ph*(n??1),this.opacity)},rgb(){return CC(this).rgb()}}));var DC=-.14861,B_=1.78277,V_=-.29227,yh=-.90649,Hl=1.97294,pC=Hl*yh,mC=Hl*B_,gC=B_*V_-yh*DC;function _U(n){if(n instanceof ao)return new ao(n.h,n.s,n.l,n.opacity);n instanceof tn||(n=U_(n));var e=n.r/255,t=n.g/255,i=n.b/255,r=(gC*i+pC*e-mC*t)/(gC+pC-mC),s=i-r,o=(Hl*(t-r)-V_*s)/yh,a=Math.sqrt(o*o+s*s)/(Hl*r*(1-r)),c=a?Math.atan2(o,s)*_C-120:NaN;return new ao(c<0?c+360:c,a,r,n.opacity)}function vh(n,e,t,i){return arguments.length===1?_U(n):new ao(n,e,t,i??1)}function ao(n,e,t,i){this.h=+n,this.s=+e,this.l=+t,this.opacity=+i}Ia(ao,vh,zl(ss,{brighter(n){return n=n==null?Aa:Math.pow(Aa,n),new ao(this.h,this.s,this.l*n,this.opacity)},darker(n){return n=n==null?co:Math.pow(co,n),new ao(this.h,this.s,this.l*n,this.opacity)},rgb(){var n=isNaN(this.h)?0:(this.h+120)*vC,e=+this.l,t=isNaN(this.s)?0:this.s*e*(1-e),i=Math.cos(n),r=Math.sin(n);return new tn(255*(e+t*(DC*i+B_*r)),255*(e+t*(V_*i+yh*r)),255*(e+t*(Hl*i)),this.opacity)}}));function NC(n,e,t,i,r){var s=n*n,o=s*n;return((1-3*n+3*s-o)*e+(4-6*s+3*o)*t+(1+3*n+3*s-3*o)*i+o*r)/6}function xU(n){var e=n.length-1;return function(t){var i=t<=0?t=0:t>=1?(t=1,e-1):Math.floor(t*e),r=n[i],s=n[i+1],o=i>0?n[i-1]:2*r-s,a=i<e-1?n[i+2]:2*s-r;return NC((t-i/e)*e,o,r,s,a)}}function bU(n){var e=n.length;return function(t){var i=Math.floor(((t%=1)<0?++t:t)*e),r=n[(i+e-1)%e],s=n[i%e],o=n[(i+1)%e],a=n[(i+2)%e];return NC((t-i/e)*e,r,s,o,a)}}var xh=n=>()=>n;function PC(n,e){return function(t){return n+t*e}}function MU(n,e,t){return n=Math.pow(n,t),e=Math.pow(e,t)-n,t=1/t,function(i){return Math.pow(n+i*e,t)}}function j_(n,e){var t=e-n;return t?PC(n,t>180||t<-180?t-360*Math.round(t/360):t):xh(isNaN(n)?e:n)}function SU(n){return(n=+n)==1?Gn:function(e,t){return t-e?MU(e,t,n):xh(isNaN(e)?t:e)}}function Gn(n,e){var t=e-n;return t?PC(n,t):xh(isNaN(n)?e:n)}var AC=(function n(e){var t=SU(e);function i(r,s){var o=t((r=Gl(r)).r,(s=Gl(s)).r),a=t(r.g,s.g),c=t(r.b,s.b),l=Gn(r.opacity,s.opacity);return function(u){return r.r=o(u),r.g=a(u),r.b=c(u),r.opacity=l(u),r+""}}return i.gamma=n,i})(1);function FC(n){return function(e){var t=e.length,i=new Array(t),r=new Array(t),s=new Array(t),o,a;for(o=0;o<t;++o)a=Gl(e[o]),i[o]=a.r||0,r[o]=a.g||0,s[o]=a.b||0;return i=n(i),r=n(r),s=n(s),a.opacity=1,function(c){return a.r=i(c),a.g=r(c),a.b=s(c),a+""}}}var Qee=FC(xU),ete=FC(bU);function EU(n,e){e||(e=[]);var t=n?Math.min(e.length,n.length):0,i=e.slice(),r;return function(s){for(r=0;r<t;++r)i[r]=n[r]*(1-s)+e[r]*s;return i}}function wU(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function TU(n,e){var t=e?e.length:0,i=n?Math.min(t,n.length):0,r=new Array(i),s=new Array(t),o;for(o=0;o<i;++o)r[o]=bh(n[o],e[o]);for(;o<t;++o)s[o]=e[o];return function(a){for(o=0;o<i;++o)s[o]=r[o](a);return s}}function CU(n,e){var t=new Date;return n=+n,e=+e,function(i){return t.setTime(n*(1-i)+e*i),t}}function Ti(n,e){return n=+n,e=+e,function(t){return n*(1-t)+e*t}}function DU(n,e){var t={},i={},r;(n===null||typeof n!="object")&&(n={}),(e===null||typeof e!="object")&&(e={});for(r in e)r in n?t[r]=bh(n[r],e[r]):i[r]=e[r];return function(s){for(r in t)i[r]=t[r](s);return i}}var z_=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,H_=new RegExp(z_.source,"g");function AU(n){return function(){return n}}function IU(n){return function(e){return n(e)+""}}function RU(n,e){var t=z_.lastIndex=H_.lastIndex=0,i,r,s,o=-1,a=[],c=[];for(n=n+"",e=e+"";(i=z_.exec(n))&&(r=H_.exec(e));)(s=r.index)>t&&(s=e.slice(t,s),a[o]?a[o]+=s:a[++o]=s),(i=i[0])===(r=r[0])?a[o]?a[o]+=r:a[++o]=r:(a[++o]=null,c.push({i:o,x:Ti(i,r)})),t=H_.lastIndex;return t<e.length&&(s=e.slice(t),a[o]?a[o]+=s:a[++o]=s),a.length<2?c[0]?IU(c[0].x):AU(e):(e=c.length,function(l){for(var u=0,d;u<e;++u)a[(d=c[u]).i]=d.x(l);return a.join("")})}function bh(n,e){var t=typeof e,i;return e==null||t==="boolean"?xh(e):(t==="number"?Ti:t==="string"?(i=Ra(e))?(e=i,AC):RU:e instanceof Ra?AC:e instanceof Date?CU:wU(e)?EU:Array.isArray(e)?TU:typeof e.valueOf!="function"&&typeof e.toString!="function"||isNaN(e)?DU:Ti)(n,e)}function OC(n,e){return n=+n,e=+e,function(t){return Math.round(n*(1-t)+e*t)}}var IC=180/Math.PI,G_={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function LC(n,e,t,i,r,s){var o,a,c;return(o=Math.sqrt(n*n+e*e))&&(n/=o,e/=o),(c=n*t+e*i)&&(t-=n*c,i-=e*c),(a=Math.sqrt(t*t+i*i))&&(t/=a,i/=a,c/=a),n*i<e*t&&(n=-n,e=-e,c=-c,o=-o),{translateX:r,translateY:s,rotate:Math.atan2(e,n)*IC,skewX:Math.atan(c)*IC,scaleX:o,scaleY:a}}var _h;function NU(n){let e=new(typeof DOMMatrix=="function"?DOMMatrix:WebKitCSSMatrix)(n+"");return e.isIdentity?G_:LC(e.a,e.b,e.c,e.d,e.e,e.f)}function PU(n){return n==null||(_h||(_h=document.createElementNS("http://www.w3.org/2000/svg","g")),_h.setAttribute("transform",n),!(n=_h.transform.baseVal.consolidate()))?G_:(n=n.matrix,LC(n.a,n.b,n.c,n.d,n.e,n.f))}function kC(n,e,t,i){function r(l){return l.length?l.pop()+" ":""}function s(l,u,d,f,h,p){if(l!==d||u!==f){var v=h.push("translate(",null,e,null,t);p.push({i:v-4,x:Ti(l,d)},{i:v-2,x:Ti(u,f)})}else(d||f)&&h.push("translate("+d+e+f+t)}function o(l,u,d,f){l!==u?(l-u>180?u+=360:u-l>180&&(l+=360),f.push({i:d.push(r(d)+"rotate(",null,i)-2,x:Ti(l,u)})):u&&d.push(r(d)+"rotate("+u+i)}function a(l,u,d,f){l!==u?f.push({i:d.push(r(d)+"skewX(",null,i)-2,x:Ti(l,u)}):u&&d.push(r(d)+"skewX("+u+i)}function c(l,u,d,f,h,p){if(l!==d||u!==f){var v=h.push(r(h)+"scale(",null,",",null,")");p.push({i:v-4,x:Ti(l,d)},{i:v-2,x:Ti(u,f)})}else(d!==1||f!==1)&&h.push(r(h)+"scale("+d+","+f+")")}return function(l,u){var d=[],f=[];return l=n(l),u=n(u),s(l.translateX,l.translateY,u.translateX,u.translateY,d,f),o(l.rotate,u.rotate,d,f),a(l.skewX,u.skewX,d,f),c(l.scaleX,l.scaleY,u.scaleX,u.scaleY,d,f),l=u=null,function(h){for(var p=-1,v=f.length,m;++p<v;)d[(m=f[p]).i]=m.x(h);return d.join("")}}}var tte=kC(NU,"px, ","px)","deg)"),nte=kC(PU,", ",")",")"),FU=1e-12;function RC(n){return((n=Math.exp(n))+1/n)/2}function OU(n){return((n=Math.exp(n))-1/n)/2}function LU(n){return((n=Math.exp(2*n))-1)/(n+1)}var ite=(function n(e,t,i){function r(s,o){var a=s[0],c=s[1],l=s[2],u=o[0],d=o[1],f=o[2],h=u-a,p=d-c,v=h*h+p*p,m,g;if(v<FU)g=Math.log(f/l)/e,m=function(D){return[a+D*h,c+D*p,l*Math.exp(e*D*g)]};else{var M=Math.sqrt(v),w=(f*f-l*l+i*v)/(2*l*t*M),_=(f*f-l*l-i*v)/(2*f*t*M),S=Math.log(Math.sqrt(w*w+1)-w),E=Math.log(Math.sqrt(_*_+1)-_);g=(E-S)/e,m=function(D){var x=D*g,C=RC(S),F=l/(t*M)*(C*LU(e*x+S)-OU(S));return[a+F*h,c+F*p,l*C/RC(e*x+S)]}}return m.duration=Math.abs(g)*1e3*e/Math.SQRT2,m}return r.rho=function(s){var o=Math.max(.001,+s),a=o*o,c=a*a;return n(o,a,c)},r})(Math.SQRT2,2,4);function UC(n){return function(e,t){var i=n((e=mh(e)).h,(t=mh(t)).h),r=Gn(e.s,t.s),s=Gn(e.l,t.l),o=Gn(e.opacity,t.opacity);return function(a){return e.h=i(a),e.s=r(a),e.l=s(a),e.opacity=o(a),e+""}}}var rte=UC(j_),ste=UC(Gn);function BC(n){return function(e,t){var i=n((e=gh(e)).h,(t=gh(t)).h),r=Gn(e.c,t.c),s=Gn(e.l,t.l),o=Gn(e.opacity,t.opacity);return function(a){return e.h=i(a),e.c=r(a),e.l=s(a),e.opacity=o(a),e+""}}}var ote=BC(j_),ate=BC(Gn);function VC(n){return(function e(t){t=+t;function i(r,s){var o=n((r=vh(r)).h,(s=vh(s)).h),a=Gn(r.s,s.s),c=Gn(r.l,s.l),l=Gn(r.opacity,s.opacity);return function(u){return r.h=o(u),r.s=a(u),r.l=c(Math.pow(u,t)),r.opacity=l(u),r+""}}return i.gamma=e,i})(1)}var cte=VC(j_),lte=VC(Gn);var jl=Math.PI,W_=2*jl,lo=1e-6,kU=W_-lo;function HC(n){this._+=n[0];for(let e=1,t=n.length;e<t;++e)this._+=arguments[e]+n[e]}function UU(n){let e=Math.floor(n);if(!(e>=0))throw new Error(`invalid digits: ${n}`);if(e>15)return HC;let t=10**e;return function(i){this._+=i[0];for(let r=1,s=i.length;r<s;++r)this._+=Math.round(arguments[r]*t)/t+i[r]}}function zC(n,e,t,i){return n===t&&e===i}function BU(n){let e=Math.floor(n);if(!(e<=15))return zC;let t=10**e,i=function(r){return Math.round(r*t)};return function(r,s,o,a){return i(r)===i(o)&&i(s)===i(a)}}var Na=class{constructor(e){this._x0=this._y0=this._x1=this._y1=null,this._="",this._append=e==null?HC:UU(e),this._equal=e==null?zC:BU(e)}moveTo(e,t){this._append`M${this._x0=this._x1=+e},${this._y0=this._y1=+t}`}closePath(){this._x1!==null&&(this._x1=this._x0,this._y1=this._y0,this._append`Z`)}lineTo(e,t){this._append`L${this._x1=+e},${this._y1=+t}`}quadraticCurveTo(e,t,i,r){this._append`Q${+e},${+t},${this._x1=+i},${this._y1=+r}`}bezierCurveTo(e,t,i,r,s,o){this._append`C${+e},${+t},${+i},${+r},${this._x1=+s},${this._y1=+o}`}arcTo(e,t,i,r,s){if(e=+e,t=+t,i=+i,r=+r,s=+s,s<0)throw new Error(`negative radius: ${s}`);let o=this._x1,a=this._y1,c=i-e,l=r-t,u=o-e,d=a-t,f=u*u+d*d;if(this._x1===null)this._append`M${this._x1=e},${this._y1=t}`;else if(f>lo)if(!(Math.abs(d*c-l*u)>lo)||!s)this._append`L${this._x1=e},${this._y1=t}`;else{let h=i-o,p=r-a,v=c*c+l*l,m=h*h+p*p,g=Math.sqrt(v),M=Math.sqrt(f),w=s*Math.tan((jl-Math.acos((v+f-m)/(2*g*M)))/2),_=w/M,S=w/g;Math.abs(_-1)>lo&&this._append`L${e+_*u},${t+_*d}`,this._append`A${s},${s},0,0,${+(d*h>u*p)},${this._x1=e+S*c},${this._y1=t+S*l}`}}arc(e,t,i,r,s,o){if(e=+e,t=+t,i=+i,o=!!o,i<0)throw new Error(`negative radius: ${i}`);let a=i*Math.cos(r),c=i*Math.sin(r),l=e+a,u=t+c,d=1^o,f=o?r-s:s-r;if(this._x1===null?this._append`M${l},${u}`:(Math.abs(this._x1-l)>lo||Math.abs(this._y1-u)>lo)&&this._append`L${l},${u}`,!!i){if(f<0&&(f=f%W_+W_),f>kU)this._append`A${i},${i},0,1,${d},${e-a},${t-c}A${i},${i},0,1,${d},${this._x1=l},${this._y1=u}`;else if(f>lo){let h=e+i*Math.cos(s),p=t+i*Math.sin(s);if(f>=jl&&this._equal(l,u,h,p)){f/=2;let v=r+f;this._append`A${i},${i},0,${+(f>=jl)},${d},${e+i*Math.cos(v)},${t+i*Math.sin(v)}`}this._append`A${i},${i},0,${+(f>=jl)},${d},${this._x1=h},${this._y1=p}`}}}rect(e,t,i,r){this._append`M${this._x0=this._x1=+e},${this._y0=this._y1=+t}h${i=+i}v${+r}h${-i}Z`}toString(){return this._}};function VU(){return new Na}VU.prototype=Na.prototype;var GC={},$_={},q_=34,Wl=10,X_=13;function WC(n){return new Function("d","return {"+n.map(function(e,t){return JSON.stringify(e)+": d["+t+'] || ""'}).join(",")+"}")}function HU(n,e){var t=WC(n);return function(i,r){return e(t(i),r,n)}}function jC(n){var e=Object.create(null),t=[];return n.forEach(function(i){for(var r in i)r in e||t.push(e[r]=r)}),t}function jn(n,e){var t=n+"",i=t.length;return i<e?new Array(e-i+1).join(0)+t:t}function zU(n){return n<0?"-"+jn(-n,6):n>9999?"+"+jn(n,6):jn(n,4)}function GU(n){var e=n.getUTCHours(),t=n.getUTCMinutes(),i=n.getUTCSeconds(),r=n.getUTCMilliseconds();return isNaN(n)?"Invalid Date":zU(n.getUTCFullYear())+"-"+jn(n.getUTCMonth()+1,2)+"-"+jn(n.getUTCDate(),2)+(r?"T"+jn(e,2)+":"+jn(t,2)+":"+jn(i,2)+"."+jn(r,3)+"Z":i?"T"+jn(e,2)+":"+jn(t,2)+":"+jn(i,2)+"Z":t||e?"T"+jn(e,2)+":"+jn(t,2)+"Z":"")}function $C(n){var e=new RegExp('["'+n+`
\r]`),t=n.charCodeAt(0);function i(d,f){var h,p,v=r(d,function(m,g){if(h)return h(m,g-1);p=m,h=f?HU(m,f):WC(m)});return v.columns=p||[],v}function r(d,f){var h=[],p=d.length,v=0,m=0,g,M=p<=0,w=!1;d.charCodeAt(p-1)===Wl&&--p,d.charCodeAt(p-1)===X_&&--p;function _(){if(M)return $_;if(w)return w=!1,GC;var E,D=v,x;if(d.charCodeAt(D)===q_){for(;v++<p&&d.charCodeAt(v)!==q_||d.charCodeAt(++v)===q_;);return(E=v)>=p?M=!0:(x=d.charCodeAt(v++))===Wl?w=!0:x===X_&&(w=!0,d.charCodeAt(v)===Wl&&++v),d.slice(D+1,E-1).replace(/""/g,'"')}for(;v<p;){if((x=d.charCodeAt(E=v++))===Wl)w=!0;else if(x===X_)w=!0,d.charCodeAt(v)===Wl&&++v;else if(x!==t)continue;return d.slice(D,E)}return M=!0,d.slice(D,p)}for(;(g=_())!==$_;){for(var S=[];g!==GC&&g!==$_;)S.push(g),g=_();f&&(S=f(S,m++))==null||h.push(S)}return h}function s(d,f){return d.map(function(h){return f.map(function(p){return u(h[p])}).join(n)})}function o(d,f){return f==null&&(f=jC(d)),[f.map(u).join(n)].concat(s(d,f)).join(`
`)}function a(d,f){return f==null&&(f=jC(d)),s(d,f).join(`
`)}function c(d){return d.map(l).join(`
`)}function l(d){return d.map(u).join(n)}function u(d){return d==null?"":d instanceof Date?GU(d):e.test(d+="")?'"'+d.replace(/"/g,'""')+'"':d}return{parse:i,parseRows:r,format:o,formatBody:a,formatRows:c,formatRow:l,formatValue:u}}var uo=$C(","),fte=uo.parse,qC=uo.parseRows,hte=uo.format,pte=uo.formatBody,mte=uo.formatRows,gte=uo.formatRow,yte=uo.formatValue,fo=$C("	"),vte=fo.parse,_te=fo.parseRows,xte=fo.format,bte=fo.formatBody,Mte=fo.formatRows,Ste=fo.formatRow,Ete=fo.formatValue;var wte=new Date("2019-01-01T00:00").getHours()||new Date("2019-07-01T00:00").getHours();function jU(n){return Math.abs(n=Math.round(n))>=1e21?n.toLocaleString("en").replace(/,/g,""):n.toString(10)}function Sh(n,e){if(!isFinite(n)||n===0)return null;var t=(n=e?n.toExponential(e-1):n.toExponential()).indexOf("e"),i=n.slice(0,t);return[i.length>1?i[0]+i.slice(2):i,+n.slice(t+1)]}function Pa(n){return n=Sh(Math.abs(n)),n?n[1]:NaN}function WU(n,e){return function(t,i){for(var r=t.length,s=[],o=0,a=n[0],c=0;r>0&&a>0&&(c+a+1>i&&(a=Math.max(1,i-c)),s.push(t.substring(r-=a,r+a)),!((c+=a+1)>i));)a=n[o=(o+1)%n.length];return s.reverse().join(e)}}function $U(n){return function(e){return e.replace(/[0-9]/g,function(t){return n[+t]})}}var qU=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function $l(n){if(!(e=qU.exec(n)))throw new Error("invalid format: "+n);var e;return new Y_({fill:e[1],align:e[2],sign:e[3],symbol:e[4],zero:e[5],width:e[6],comma:e[7],precision:e[8]&&e[8].slice(1),trim:e[9],type:e[10]})}$l.prototype=Y_.prototype;function Y_(n){this.fill=n.fill===void 0?" ":n.fill+"",this.align=n.align===void 0?">":n.align+"",this.sign=n.sign===void 0?"-":n.sign+"",this.symbol=n.symbol===void 0?"":n.symbol+"",this.zero=!!n.zero,this.width=n.width===void 0?void 0:+n.width,this.comma=!!n.comma,this.precision=n.precision===void 0?void 0:+n.precision,this.trim=!!n.trim,this.type=n.type===void 0?"":n.type+""}Y_.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(this.width===void 0?"":Math.max(1,this.width|0))+(this.comma?",":"")+(this.precision===void 0?"":"."+Math.max(0,this.precision|0))+(this.trim?"~":"")+this.type};function XU(n){e:for(var e=n.length,t=1,i=-1,r;t<e;++t)switch(n[t]){case".":i=r=t;break;case"0":i===0&&(i=t),r=t;break;default:if(!+n[t])break e;i>0&&(i=0);break}return i>0?n.slice(0,i)+n.slice(r+1):n}var Eh;function YU(n,e){var t=Sh(n,e);if(!t)return Eh=void 0,n.toPrecision(e);var i=t[0],r=t[1],s=r-(Eh=Math.max(-8,Math.min(8,Math.floor(r/3)))*3)+1,o=i.length;return s===o?i:s>o?i+new Array(s-o+1).join("0"):s>0?i.slice(0,s)+"."+i.slice(s):"0."+new Array(1-s).join("0")+Sh(n,Math.max(0,e+s-1))[0]}function XC(n,e){var t=Sh(n,e);if(!t)return n+"";var i=t[0],r=t[1];return r<0?"0."+new Array(-r).join("0")+i:i.length>r+1?i.slice(0,r+1)+"."+i.slice(r+1):i+new Array(r-i.length+2).join("0")}var YC={"%":(n,e)=>(n*100).toFixed(e),b:n=>Math.round(n).toString(2),c:n=>n+"",d:jU,e:(n,e)=>n.toExponential(e),f:(n,e)=>n.toFixed(e),g:(n,e)=>n.toPrecision(e),o:n=>Math.round(n).toString(8),p:(n,e)=>XC(n*100,e),r:XC,s:YU,X:n=>Math.round(n).toString(16).toUpperCase(),x:n=>Math.round(n).toString(16)};function ZC(n){return n}var JC=Array.prototype.map,KC=["y","z","a","f","p","n","\xB5","m","","k","M","G","T","P","E","Z","Y"];function ZU(n){var e=n.grouping===void 0||n.thousands===void 0?ZC:WU(JC.call(n.grouping,Number),n.thousands+""),t=n.currency===void 0?"":n.currency[0]+"",i=n.currency===void 0?"":n.currency[1]+"",r=n.decimal===void 0?".":n.decimal+"",s=n.numerals===void 0?ZC:$U(JC.call(n.numerals,String)),o=n.percent===void 0?"%":n.percent+"",a=n.minus===void 0?"\u2212":n.minus+"",c=n.nan===void 0?"NaN":n.nan+"";function l(d,f){d=$l(d);var h=d.fill,p=d.align,v=d.sign,m=d.symbol,g=d.zero,M=d.width,w=d.comma,_=d.precision,S=d.trim,E=d.type;E==="n"?(w=!0,E="g"):YC[E]||(_===void 0&&(_=12),S=!0,E="g"),(g||h==="0"&&p==="=")&&(g=!0,h="0",p="=");var D=(f&&f.prefix!==void 0?f.prefix:"")+(m==="$"?t:m==="#"&&/[boxX]/.test(E)?"0"+E.toLowerCase():""),x=(m==="$"?i:/[%p]/.test(E)?o:"")+(f&&f.suffix!==void 0?f.suffix:""),C=YC[E],F=/[defgprs%]/.test(E);_=_===void 0?6:/[gprs]/.test(E)?Math.max(1,Math.min(21,_)):Math.max(0,Math.min(20,_));function L(P){var z=D,O=x,V,J,j;if(E==="c")O=C(P)+O,P="";else{P=+P;var te=P<0||1/P<0;if(P=isNaN(P)?c:C(Math.abs(P),_),S&&(P=XU(P)),te&&+P==0&&v!=="+"&&(te=!1),z=(te?v==="("?v:a:v==="-"||v==="("?"":v)+z,O=(E==="s"&&!isNaN(P)&&Eh!==void 0?KC[8+Eh/3]:"")+O+(te&&v==="("?")":""),F){for(V=-1,J=P.length;++V<J;)if(j=P.charCodeAt(V),48>j||j>57){O=(j===46?r+P.slice(V+1):P.slice(V))+O,P=P.slice(0,V);break}}}w&&!g&&(P=e(P,1/0));var W=z.length+P.length+O.length,Y=W<M?new Array(M-W+1).join(h):"";switch(w&&g&&(P=e(Y+P,Y.length?M-O.length:1/0),Y=""),p){case"<":P=z+P+O+Y;break;case"=":P=z+Y+P+O;break;case"^":P=Y.slice(0,W=Y.length>>1)+z+P+O+Y.slice(W);break;default:P=Y+z+P+O;break}return s(P)}return L.toString=function(){return d+""},L}function u(d,f){var h=Math.max(-8,Math.min(8,Math.floor(Pa(f)/3)))*3,p=Math.pow(10,-h),v=l((d=$l(d),d.type="f",d),{suffix:KC[8+h/3]});return function(m){return v(p*m)}}return{format:l,formatPrefix:u}}var Mh,Z_,J_;JU({thousands:",",grouping:[3],currency:["$",""]});function JU(n){return Mh=ZU(n),Z_=Mh.format,J_=Mh.formatPrefix,Mh}function QC(n){return Math.max(0,-Pa(Math.abs(n)))}function eD(n,e){return Math.max(0,Math.max(-8,Math.min(8,Math.floor(Pa(e)/3)))*3-Pa(Math.abs(n)))}function tD(n,e){return n=Math.abs(n),e=Math.abs(e)-n,Math.max(0,Pa(e)-Pa(n))+1}function iD(n,e){switch(arguments.length){case 0:break;case 1:this.range(n);break;default:this.range(e).domain(n);break}return this}function KU(n){return function(){return n}}function QU(n){return+n}var nD=[0,1];function Fa(n){return n}function K_(n,e){return(e-=n=+n)?function(t){return(t-n)/e}:KU(isNaN(e)?NaN:.5)}function eB(n,e){var t;return n>e&&(t=n,n=e,e=t),function(i){return Math.max(n,Math.min(e,i))}}function tB(n,e,t){var i=n[0],r=n[1],s=e[0],o=e[1];return r<i?(i=K_(r,i),s=t(o,s)):(i=K_(i,r),s=t(s,o)),function(a){return s(i(a))}}function nB(n,e,t){var i=Math.min(n.length,e.length)-1,r=new Array(i),s=new Array(i),o=-1;for(n[i]<n[0]&&(n=n.slice().reverse(),e=e.slice().reverse());++o<i;)r[o]=K_(n[o],n[o+1]),s[o]=t(e[o],e[o+1]);return function(a){var c=A_(n,a,1,i)-1;return s[c](r[c](a))}}function iB(n,e){return e.domain(n.domain()).range(n.range()).interpolate(n.interpolate()).clamp(n.clamp()).unknown(n.unknown())}function rB(){var n=nD,e=nD,t=bh,i,r,s,o=Fa,a,c,l;function u(){var f=Math.min(n.length,e.length);return o!==Fa&&(o=eB(n[0],n[f-1])),a=f>2?nB:tB,c=l=null,d}function d(f){return f==null||isNaN(f=+f)?s:(c||(c=a(n.map(i),e,t)))(i(o(f)))}return d.invert=function(f){return o(r((l||(l=a(e,n.map(i),Ti)))(f)))},d.domain=function(f){return arguments.length?(n=Array.from(f,QU),u()):n.slice()},d.range=function(f){return arguments.length?(e=Array.from(f),u()):e.slice()},d.rangeRound=function(f){return e=Array.from(f),t=OC,u()},d.clamp=function(f){return arguments.length?(o=f?!0:Fa,u()):o!==Fa},d.interpolate=function(f){return arguments.length?(t=f,u()):t},d.unknown=function(f){return arguments.length?(s=f,d):s},function(f,h){return i=f,r=h,u()}}function sB(){return rB()(Fa,Fa)}function oB(n,e,t,i){var r=$T(n,e,t),s;switch(i=$l(i??",f"),i.type){case"s":{var o=Math.max(Math.abs(n),Math.abs(e));return i.precision==null&&!isNaN(s=eD(r,o))&&(i.precision=s),J_(i,o)}case"":case"e":case"g":case"p":case"r":{i.precision==null&&!isNaN(s=tD(r,Math.max(Math.abs(n),Math.abs(e))))&&(i.precision=s-(i.type==="e"));break}case"f":case"%":{i.precision==null&&!isNaN(s=QC(r))&&(i.precision=s-(i.type==="%")*2);break}}return Z_(i)}function rD(n){var e=n.domain;return n.ticks=function(t){var i=e();return WT(i[0],i[i.length-1],t??10)},n.tickFormat=function(t,i){var r=e();return oB(r[0],r[r.length-1],t??10,i)},n.nice=function(t){t==null&&(t=10);var i=e(),r=0,s=i.length-1,o=i[r],a=i[s],c,l,u=10;for(a<o&&(l=o,o=a,a=l,l=r,r=s,s=l);u-- >0;){if(l=lh(o,a,t),l===c)return i[r]=o,i[s]=a,e(i);if(l>0)o=Math.floor(o/l)*l,a=Math.ceil(a/l)*l;else if(l<0)o=Math.ceil(o*l)/l,a=Math.floor(a*l)/l;else break;c=l}return n},n}function Oa(){var n=sB();return n.copy=function(){return iB(n,Oa())},iD.apply(n,arguments),rD(n)}function Q_(){var n=0,e=1,t=1,i=[.5],r=[0,1],s;function o(c){return c!=null&&c<=c?r[A_(i,c,0,t)]:s}function a(){var c=-1;for(i=new Array(t);++c<t;)i[c]=((c+1)*e-(c-t)*n)/(t+1);return o}return o.domain=function(c){return arguments.length?([n,e]=c,n=+n,e=+e,a()):[n,e]},o.range=function(c){return arguments.length?(t=(r=Array.from(c)).length-1,a()):r.slice()},o.invertExtent=function(c){var l=r.indexOf(c);return l<0?[NaN,NaN]:l<1?[n,i[0]]:l>=t?[i[t-1],e]:[i[l-1],i[l]]},o.unknown=function(c){return arguments.length&&(s=c),o},o.thresholds=function(){return i.slice()},o.copy=function(){return Q_().domain([n,e]).range(r).unknown(s)},iD.apply(rD(o),arguments)}function La(n){return function(){return n}}var aB=Math.cos;var t0=Math.sin,ka=Math.sqrt,sD=1e-12,wh=Math.PI,Ute=wh/2,uD=2*wh;function cB(n){let e=3;return n.digits=function(t){if(!arguments.length)return e;if(t==null)e=null;else{let i=Math.floor(t);if(!(i>=0))throw new RangeError(`invalid digits: ${t}`);e=i}return n},()=>new Na(e)}var Bte=Array.prototype.slice;function lB(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function dD(n){this._context=n}dD.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2;default:this._context.lineTo(n,e);break}}};function fD(n){return new dD(n)}function uB(n){return n[0]}function dB(n){return n[1]}function hD(n,e){var t=La(!0),i=null,r=fD,s=null,o=cB(a);n=typeof n=="function"?n:n===void 0?uB:La(n),e=typeof e=="function"?e:e===void 0?dB:La(e);function a(c){var l,u=(c=lB(c)).length,d,f=!1,h;for(i==null&&(s=r(h=o())),l=0;l<=u;++l)!(l<u&&t(d=c[l],l,c))===f&&((f=!f)?s.lineStart():s.lineEnd()),f&&s.point(+n(d,l,c),+e(d,l,c));if(h)return s=null,h+""||null}return a.x=function(c){return arguments.length?(n=typeof c=="function"?c:La(+c),a):n},a.y=function(c){return arguments.length?(e=typeof c=="function"?c:La(+c),a):e},a.defined=function(c){return arguments.length?(t=typeof c=="function"?c:La(!!c),a):t},a.curve=function(c){return arguments.length?(r=c,i!=null&&(s=r(i)),a):r},a.context=function(c){return arguments.length?(c==null?i=s=null:s=r(i=c),a):i},a}var Vte=fB(fD);function pD(n){this._curve=n}pD.prototype={areaStart:function(){this._curve.areaStart()},areaEnd:function(){this._curve.areaEnd()},lineStart:function(){this._curve.lineStart()},lineEnd:function(){this._curve.lineEnd()},point:function(n,e){this._curve.point(e*Math.sin(n),e*-Math.cos(n))}};function fB(n){function e(t){return new pD(n(t))}return e._curve=n,e}var Hte=ka(3);var hB=ka(1/3),zte=hB*2;var mD=t0(wh/10)/t0(7*wh/10),Gte=t0(uD/10)*mD,jte=-aB(uD/10)*mD;var Wte=ka(3);var $te=ka(3);var qte=ka(3)/2,pB=1/ka(12),Xte=(pB/2+1)*3;function os(){}function Th(n,e,t){n._context.bezierCurveTo((2*n._x0+n._x1)/3,(2*n._y0+n._y1)/3,(n._x0+2*n._x1)/3,(n._y0+2*n._y1)/3,(n._x0+4*n._x1+e)/6,(n._y0+4*n._y1+t)/6)}function Dh(n){this._context=n}Dh.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){switch(this._point){case 3:Th(this,this._x1,this._y1);case 2:this._context.lineTo(this._x1,this._y1);break}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2;break;case 2:this._point=3,this._context.lineTo((5*this._x0+this._x1)/6,(5*this._y0+this._y1)/6);default:Th(this,n,e);break}this._x0=this._x1,this._x1=n,this._y0=this._y1,this._y1=e}};function gD(n){return new Dh(n)}function mB(n){this._context=n}mB.prototype={areaStart:os,areaEnd:os,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._y0=this._y1=this._y2=this._y3=this._y4=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:{this._context.moveTo(this._x2,this._y2),this._context.closePath();break}case 2:{this._context.moveTo((this._x2+2*this._x3)/3,(this._y2+2*this._y3)/3),this._context.lineTo((this._x3+2*this._x2)/3,(this._y3+2*this._y2)/3),this._context.closePath();break}case 3:{this.point(this._x2,this._y2),this.point(this._x3,this._y3),this.point(this._x4,this._y4);break}}},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._x2=n,this._y2=e;break;case 1:this._point=2,this._x3=n,this._y3=e;break;case 2:this._point=3,this._x4=n,this._y4=e,this._context.moveTo((this._x0+4*this._x1+n)/6,(this._y0+4*this._y1+e)/6);break;default:Th(this,n,e);break}this._x0=this._x1,this._x1=n,this._y0=this._y1,this._y1=e}};function gB(n){this._context=n}gB.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===3)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3;var t=(this._x0+4*this._x1+n)/6,i=(this._y0+4*this._y1+e)/6;this._line?this._context.lineTo(t,i):this._context.moveTo(t,i);break;case 3:this._point=4;default:Th(this,n,e);break}this._x0=this._x1,this._x1=n,this._y0=this._y1,this._y1=e}};function yD(n,e){this._basis=new Dh(n),this._beta=e}yD.prototype={lineStart:function(){this._x=[],this._y=[],this._basis.lineStart()},lineEnd:function(){var n=this._x,e=this._y,t=n.length-1;if(t>0)for(var i=n[0],r=e[0],s=n[t]-i,o=e[t]-r,a=-1,c;++a<=t;)c=a/t,this._basis.point(this._beta*n[a]+(1-this._beta)*(i+c*s),this._beta*e[a]+(1-this._beta)*(r+c*o));this._x=this._y=null,this._basis.lineEnd()},point:function(n,e){this._x.push(+n),this._y.push(+e)}};var Yte=(function n(e){function t(i){return e===1?new Dh(i):new yD(i,e)}return t.beta=function(i){return n(+i)},t})(.85);function Ch(n,e,t){n._context.bezierCurveTo(n._x1+n._k*(n._x2-n._x0),n._y1+n._k*(n._y2-n._y0),n._x2+n._k*(n._x1-e),n._y2+n._k*(n._y1-t),n._x2,n._y2)}function i0(n,e){this._context=n,this._k=(1-e)/6}i0.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:Ch(this,this._x1,this._y1);break}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2,this._x1=n,this._y1=e;break;case 2:this._point=3;default:Ch(this,n,e);break}this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var Zte=(function n(e){function t(i){return new i0(i,e)}return t.tension=function(i){return n(+i)},t})(0);function r0(n,e){this._context=n,this._k=(1-e)/6}r0.prototype={areaStart:os,areaEnd:os,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:{this._context.moveTo(this._x3,this._y3),this._context.closePath();break}case 2:{this._context.lineTo(this._x3,this._y3),this._context.closePath();break}case 3:{this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5);break}}},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._x3=n,this._y3=e;break;case 1:this._point=2,this._context.moveTo(this._x4=n,this._y4=e);break;case 2:this._point=3,this._x5=n,this._y5=e;break;default:Ch(this,n,e);break}this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var Jte=(function n(e){function t(i){return new r0(i,e)}return t.tension=function(i){return n(+i)},t})(0);function s0(n,e){this._context=n,this._k=(1-e)/6}s0.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===3)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:Ch(this,n,e);break}this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var Kte=(function n(e){function t(i){return new s0(i,e)}return t.tension=function(i){return n(+i)},t})(0);function o0(n,e,t){var i=n._x1,r=n._y1,s=n._x2,o=n._y2;if(n._l01_a>sD){var a=2*n._l01_2a+3*n._l01_a*n._l12_a+n._l12_2a,c=3*n._l01_a*(n._l01_a+n._l12_a);i=(i*a-n._x0*n._l12_2a+n._x2*n._l01_2a)/c,r=(r*a-n._y0*n._l12_2a+n._y2*n._l01_2a)/c}if(n._l23_a>sD){var l=2*n._l23_2a+3*n._l23_a*n._l12_a+n._l12_2a,u=3*n._l23_a*(n._l23_a+n._l12_a);s=(s*l+n._x1*n._l23_2a-e*n._l12_2a)/u,o=(o*l+n._y1*n._l23_2a-t*n._l12_2a)/u}n._context.bezierCurveTo(i,r,s,o,n._x2,n._y2)}function vD(n,e){this._context=n,this._alpha=e}vD.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:this.point(this._x2,this._y2);break}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){if(n=+n,e=+e,this._point){var t=this._x2-n,i=this._y2-e;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(t*t+i*i,this._alpha))}switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2;break;case 2:this._point=3;default:o0(this,n,e);break}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var Qte=(function n(e){function t(i){return e?new vD(i,e):new i0(i,0)}return t.alpha=function(i){return n(+i)},t})(.5);function _D(n,e){this._context=n,this._alpha=e}_D.prototype={areaStart:os,areaEnd:os,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 1:{this._context.moveTo(this._x3,this._y3),this._context.closePath();break}case 2:{this._context.lineTo(this._x3,this._y3),this._context.closePath();break}case 3:{this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5);break}}},point:function(n,e){if(n=+n,e=+e,this._point){var t=this._x2-n,i=this._y2-e;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(t*t+i*i,this._alpha))}switch(this._point){case 0:this._point=1,this._x3=n,this._y3=e;break;case 1:this._point=2,this._context.moveTo(this._x4=n,this._y4=e);break;case 2:this._point=3,this._x5=n,this._y5=e;break;default:o0(this,n,e);break}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var ene=(function n(e){function t(i){return e?new _D(i,e):new r0(i,0)}return t.alpha=function(i){return n(+i)},t})(.5);function xD(n,e){this._context=n,this._alpha=e}xD.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){(this._line||this._line!==0&&this._point===3)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){if(n=+n,e=+e,this._point){var t=this._x2-n,i=this._y2-e;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(t*t+i*i,this._alpha))}switch(this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:o0(this,n,e);break}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=n,this._y0=this._y1,this._y1=this._y2,this._y2=e}};var tne=(function n(e){function t(i){return e?new xD(i,e):new s0(i,0)}return t.alpha=function(i){return n(+i)},t})(.5);function yB(n){this._context=n}yB.prototype={areaStart:os,areaEnd:os,lineStart:function(){this._point=0},lineEnd:function(){this._point&&this._context.closePath()},point:function(n,e){n=+n,e=+e,this._point?this._context.lineTo(n,e):(this._point=1,this._context.moveTo(n,e))}};function oD(n){return n<0?-1:1}function aD(n,e,t){var i=n._x1-n._x0,r=e-n._x1,s=(n._y1-n._y0)/(i||r<0&&-0),o=(t-n._y1)/(r||i<0&&-0),a=(s*r+o*i)/(i+r);return(oD(s)+oD(o))*Math.min(Math.abs(s),Math.abs(o),.5*Math.abs(a))||0}function cD(n,e){var t=n._x1-n._x0;return t?(3*(n._y1-n._y0)/t-e)/2:e}function e0(n,e,t){var i=n._x0,r=n._y0,s=n._x1,o=n._y1,a=(s-i)/3;n._context.bezierCurveTo(i+a,r+a*e,s-a,o-a*t,s,o)}function n0(n){this._context=n}n0.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:e0(this,this._t0,cD(this,this._t0));break}(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line=1-this._line},point:function(n,e){var t=NaN;if(n=+n,e=+e,!(n===this._x1&&e===this._y1)){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2;break;case 2:this._point=3,e0(this,cD(this,t=aD(this,n,e)),t);break;default:e0(this,this._t0,t=aD(this,n,e));break}this._x0=this._x1,this._x1=n,this._y0=this._y1,this._y1=e,this._t0=t}}};function vB(n){this._context=new bD(n)}(vB.prototype=Object.create(n0.prototype)).point=function(n,e){n0.prototype.point.call(this,e,n)};function bD(n){this._context=n}bD.prototype={moveTo:function(n,e){this._context.moveTo(e,n)},closePath:function(){this._context.closePath()},lineTo:function(n,e){this._context.lineTo(e,n)},bezierCurveTo:function(n,e,t,i,r,s){this._context.bezierCurveTo(e,n,i,t,s,r)}};function _B(n){this._context=n}_B.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var n=this._x,e=this._y,t=n.length;if(t)if(this._line?this._context.lineTo(n[0],e[0]):this._context.moveTo(n[0],e[0]),t===2)this._context.lineTo(n[1],e[1]);else for(var i=lD(n),r=lD(e),s=0,o=1;o<t;++s,++o)this._context.bezierCurveTo(i[0][s],r[0][s],i[1][s],r[1][s],n[o],e[o]);(this._line||this._line!==0&&t===1)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(n,e){this._x.push(+n),this._y.push(+e)}};function lD(n){var e,t=n.length-1,i,r=new Array(t),s=new Array(t),o=new Array(t);for(r[0]=0,s[0]=2,o[0]=n[0]+2*n[1],e=1;e<t-1;++e)r[e]=1,s[e]=4,o[e]=4*n[e]+2*n[e+1];for(r[t-1]=2,s[t-1]=7,o[t-1]=8*n[t-1]+n[t],e=1;e<t;++e)i=r[e]/s[e-1],s[e]-=i,o[e]-=i*o[e-1];for(r[t-1]=o[t-1]/s[t-1],e=t-2;e>=0;--e)r[e]=(o[e]-r[e+1])/s[e];for(s[t-1]=(n[t]+r[t-1])/2,e=0;e<t-1;++e)s[e]=2*n[e+1]-r[e+1];return[r,s]}function xB(n,e){this._context=n,this._t=e}xB.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&this._point===2&&this._context.lineTo(this._x,this._y),(this._line||this._line!==0&&this._point===1)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(n,e){switch(n=+n,e=+e,this._point){case 0:this._point=1,this._line?this._context.lineTo(n,e):this._context.moveTo(n,e);break;case 1:this._point=2;default:{if(this._t<=0)this._context.lineTo(this._x,e),this._context.lineTo(n,e);else{var t=this._x*(1-this._t)+n*this._t;this._context.lineTo(t,this._y),this._context.lineTo(t,e)}break}}this._x=n,this._y=e}};var ho=[{id:0,name:"Diverge",type:"numeric",group:"Diverging color scales",scale:Oa().domain([0,.5,1]).range(["#198FBD","#F7D529","#F7295B"])},{id:1,name:"Spectral",type:"numeric",group:"Diverging color scales",scale:Oa().domain([0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]).range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"])},{id:2,name:"Viridis",type:"numeric",group:"Sequential color scales",scale:Oa().domain([0,.2,.4,.6,.8,1]).range(["#440154","#3b528b","#21918c","#5ec962","#fde725"])},{id:3,name:"Plasma",type:"numeric",group:"Sequential color scales",scale:Oa().domain([0,.2,.4,.6,.8,1]).range(["#0d0887","#7e03a8","#cc4778","#f89540","#f0f921"])},{id:6,name:"Glasbey",type:"categorical",group:"Categorical color scales",scale:a0(["#D60000","#8C3BFF","#018700","#00ACC6","#E6A500","#FF7ED1","#6B004F","#573B00","#005659","#15E18C","#0000DD","#A17569"])},{id:7,name:"Tableau 10",type:"categorical",group:"Categorical color scales",scale:a0(["#4E79A7","#F28E2C","#E15759","#76B7B2","#59A14F","#EDC949","#AF7AA1","#FF9DA7","#9C755F","#576D07"])},{id:8,name:"Colorblind",type:"categorical",group:"Categorical color scales",scale:a0(["#0173B2","#DE8F05","#029E73","#D55E00","#CC78BC","#CA9161","#56B4E9","#FBAFE4"])}];function a0(n){return Q_().domain([0,1]).range(n)}function rne(n,e){return e||n==="categorical"?"categorical":"numeric"}var bB={4:6,5:7};function c0(n){return bB[n]??n}function sne(n){let e=c0(n);return ho.find(t=>t.id===e)??ho[0]}function MD(n){return(ho.find(e=>e.type===n)??ho[0]).id}function SD(n,e=10){let t=n.scale.domain(),i=t[0],r=t[t.length-1],s=[];for(let o=0;o<e;o++){let a=o/(e-1),c=i+a*(r-i);s.push(n.scale(c))}return`linear-gradient(to right, ${s.join(", ")})`}function l0(n){return typeof n.scale.range=="function"?n.scale.range():[]}function ED(n,e){let t=l0(n),i=t.length;return t[(Math.round(e)%i+i)%i]}function one(n=ho){let e=new Map;for(let t of n)e.has(t.group)||e.set(t.group,[]),e.get(t.group).push(t);return Array.from(e.entries()).map(([t,i])=>({group:t,scales:i}))}function wD(n,e){return!n.includes(e)&&n.length<8}function TD(n,e){return n.includes(e)&&n.length>3}function u0(n){if(typeof n=="string"&&n.indexOf("rgb")!==-1)return n;let e;if(typeof n=="number"?e=n.toString(16).padStart(6,"0"):e=n.replace(/^#/,""),e.length===3&&(e=e.split("").map(s=>s+s).join("")),e.length!==6)throw new Error(`Invalid hex color: ${n}`);let t=parseInt(e.slice(0,2),16),i=parseInt(e.slice(2,4),16),r=parseInt(e.slice(4,6),16);return`rgb(${t}, ${i}, ${r})`}var Ah=(i=>(i[i.Star=0]="Star",i[i.Flower=1]="Flower",i[i.Thumb=2]="Thumb",i))(Ah||{}),MB={0:"Star",1:"Flower",2:"Image"};function dne(n){return MB[n]??"Unknown"}function fne(n){return n===0||n===1}var Ih={min:2,max:20,default:6},SB=2,CD=class n{constructor(e=.3,t=8){this.baseContour=e;this.baseHitTolerance=t;this.update()}baseContour;baseHitTolerance;radii=new Map;contourThicknesses=new Map;hitTolerances=new Map;_itemSize=Ih.default;_reach=1;_currentZoomLevel=0;_currentRadius=1;_currentContour=0;_currentHitTolerance=0;clone(){let e=new n(this.baseContour,this.baseHitTolerance);return e.setSizes(this._itemSize,this._reach),e._currentZoomLevel=this._currentZoomLevel,e._currentRadius=this._currentRadius,e._currentContour=this._currentContour,e._currentHitTolerance=this._currentHitTolerance,e}update(){let e=window.devicePixelRatio||1,t=window.screen.pixelDepth/24,i=1.25,r=this._itemSize/2,s=r*SB/this._reach;this.radii.set(0,r),this.radii.set(1,s),this.radii.set(2,s),this.contourThicknesses.set(0,this.baseContour),this.contourThicknesses.set(1,this.baseContour),this.contourThicknesses.set(2,this.baseContour*i),this.hitTolerances.set(0,this.baseHitTolerance/t/e),this.hitTolerances.set(1,this.baseHitTolerance*4/t/e),this.hitTolerances.set(2,this.baseHitTolerance*16/t/e),this.updateInfo()}setSizes(e,t){return e===this._itemSize&&t===this._reach?!1:(this._itemSize=e,this._reach=t>0?t:1,this.update(),!0)}get itemSize(){return this._itemSize}get reach(){return this._reach}updateInfo(){this._currentRadius=this.getRadius(this._currentZoomLevel),this._currentContour=this.getContourThickness(this._currentZoomLevel),this._currentHitTolerance=this.getHitTolerance(this._currentZoomLevel)}set currentZoomLevel(e){this._currentZoomLevel=e,this.updateInfo()}get currentZoomLevel(){return this._currentZoomLevel}getRadius(e){return this.radii.get(e)??1}getContourThickness(e){return this.contourThicknesses.get(e)??this.baseContour}getHitTolerance(e){return this.hitTolerances.get(e)??this.baseHitTolerance}get radius(){return this._currentRadius}set radius(e){this._currentRadius=e}get contourThickness(){return this._currentContour}get hitTolerance(){return this._currentHitTolerance}set hitTolerance(e){this._currentHitTolerance=e}};var Rh=class{_useCoordinateSystem=!0;_useCategories=!0;_useBackground=!0;_useLabels=!0;_useContour=!0;_radius=0;_scaleLinear=!1;_itemSize=Ih.default;_glyphType=0;options=[{property:"useCoordinateSystem",label:"Coordinate system"},{property:"useBackground",label:"Circle background"},{property:"useContour",label:"Contour"}];get useCoordinateSystem(){return this._useCoordinateSystem}set useCoordinateSystem(e){this._useCoordinateSystem=e}get useBackground(){return this._useBackground}set useBackground(e){this._useBackground=e}get useCategories(){return this._useCategories}set useCategories(e){this._useCategories=e}get useContour(){return this._useContour}set useContour(e){this._useContour=e}get useLabels(){return this._useLabels}set useLabels(e){this._useLabels=e}get glyphOptions(){return this.options}set glyphOptions(e){this.options=e}get glyphType(){return this._glyphType}set glyphType(e){this._glyphType=e}get radius(){return this._radius}set radius(e){this._radius=e}get scaleLinear(){return this._scaleLinear}set scaleLinear(e){this._scaleLinear=e}get itemSize(){return this._itemSize}set itemSize(e){this._itemSize=EB(e,Ih)}};function EB(n,e){return Number.isFinite(n)?Math.min(e.max,Math.max(e.min,Math.round(n))):e.default}function wB(n,e,t,i){if(t[e]==="categorical"){let r=i[e];if(r!==void 0&&r>0)return n/r}return n}function TB(n,e){if(e<=1)return 0;let t=Math.min(1,Math.max(0,n));return Math.round(t*(e-1))}function Nh(n,e,t,i){let r=i.featureCategoryCounts[t]??0;return n.type==="categorical"&&r>0?ED(n,TB(e,r)):n.scale(wB(e,t,i.featureTypes,i.featureMaxValues))}var Ua=class n{colorScales=ho;_activeFeatures=[];_colorFeature="";_featureLabels={};_metadataLabels={};_featureTypes={};_featureMaxValues={};_featureCategoryCounts={};_selectedColorScale=0;modalOpenSubject=new Qt(!1);modalOpenSubject$=this.modalOpenSubject.asObservable();get modalOpen(){return this.modalOpenSubject.getValue()}set modalOpen(e){this.modalOpenSubject.next(e)}config=new Rh;removeCanvasSubject=new Qt(0);removeCanvasSubject$=this.removeCanvasSubject.asObservable();glyphConfigSubject=new Qt(this.config);glyphConfigSubject$=this.glyphConfigSubject.asObservable();commandSubject=new Ut;commandSubject$=this.commandSubject.asObservable();redrawGlyphSubject=new Ut;redrawGlyphSubject$=this.redrawGlyphSubject.asObservable();drawMagicLensGlyphsSubject=new Ut;drawMagicLensGlyphsSubject$=this.drawMagicLensGlyphsSubject.asObservable();animateGlyphSubject=new Ut;animateGlyphSubject$=this.animateGlyphSubject.asObservable();loadedDataSubject=new Qt("");loadedDataSubject$=this.loadedDataSubject.asObservable();redrawGlyph(e){this.redrawGlyphSubject.next(e)}reRender(){this.commandSubject.next(2)}removeCanvas(e){this.removeCanvasSubject.next(e)}drawMagicLensGlyphs(e){this.drawMagicLensGlyphsSubject.next(e)}animateGlyph(e){this.animateGlyphSubject.next(e)}loadData(e){this.loadedDataSubject.next(e)}get loadedData(){return this.loadedDataSubject.getValue()}redraw(){this.commandSubject.next(1)}toggleFitToScreen(){this.commandSubject.next(3)}exportImage(){this.commandSubject.next(5)}clearSelection(){this.commandSubject.next(4)}getRgbaColor(e){let t=this.colorScale;return e==null||!t?u0("#00cc88"):u0(Nh(t,e[1][this._colorFeature],this._colorFeature,this))}getConfiguration(){return this.config}updateConfiguration(){this.glyphConfigSubject.next(this.config)}replaceActiveFeatures(e){this.activeFeatures.splice(0,this.activeFeatures.length),this.activeFeatures.push(...e)}addGlyphAxis(e){return wD(this._activeFeatures,e)?(this._activeFeatures.push(e),this.updateConfiguration(),!0):!1}removeGlyphAxis(e){return TD(this._activeFeatures,e)?(this._activeFeatures.splice(this._activeFeatures.indexOf(e),1),this.updateConfiguration(),!0):!1}get colorScale(){return this.colorScales.find(e=>e.id===this._selectedColorScale)}get color(){return this.colorScale?.scale}get colorRange(){return this._selectedColorScale}set colorRange(e){this._selectedColorScale=c0(e)}get activeFeatures(){return this._activeFeatures}get featureLabels(){return this._featureLabels}set featureLabels(e){this._featureLabels=Ae({},e)}get metadataLabels(){return this._metadataLabels}set metadataLabels(e){this._metadataLabels=Ae({},e)}set colorFeature(e){this._colorFeature=e}get colorFeature(){return this._colorFeature}set featureTypes(e){this._featureTypes=Ae({},e)}get featureTypes(){return this._featureTypes}set featureMaxValues(e){this._featureMaxValues=Ae({},e)}get featureMaxValues(){return this._featureMaxValues}set featureCategoryCounts(e){this._featureCategoryCounts=Ae({},e)}get featureCategoryCounts(){return this._featureCategoryCounts}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var Ba=class n{worker=new Worker(new URL("worker-2VWQELSD.js",import.meta.url),{type:"module"});thumbCache=new Map;thumbSubjects=new Map;message$=new Ut;nextRequestId=0;processingProgress$=new Ut;constructor(){this.worker.onmessage=({data:e})=>{this.message$.next(e)},this.message$.subscribe(e=>{e.type==="thumb"?this.handleThumb(e.file,e.data):e.type==="error"?console.warn("[PyodideWorker]",e.message):e.type==="processingProgress"&&this.processingProgress$.next({step:e.step,progress:e.progress,message:e.message})})}unzip(e,t){return Pe(this,null,function*(){return(yield this.sendRequestUntil("unzipped",{type:"unzip",folder:e,buffer:yield t.arrayBuffer()})).images})}fetchJson(e){return Pe(this,null,function*(){return(yield this.sendRequestUntil("json",{type:"getJson",file:e},i=>i.file===e)).data})}profileData(e,t){return Pe(this,null,function*(){return(yield this.sendRequestUntil("dataProfile",{type:"profileData",fileName:e,buffer:t})).profile})}computeHistogram(e,t,i=50){return Pe(this,null,function*(){return(yield this.sendRequestUntil("histogram",{type:"computeHistogram",fileName:e,columnName:t,bins:i},s=>s.columnName===t)).data})}detectOutliers(e,t,i){return Pe(this,null,function*(){return(yield this.sendRequestUntil("outliers",{type:"detectOutliers",fileName:e,columnName:t,method:i},s=>s.columnName===t)).data})}detectDuplicates(e,t){return Pe(this,null,function*(){return(yield this.sendRequestUntil("duplicates",{type:"detectDuplicates",fileName:e,subsetColumns:t},r=>r.type==="duplicates")).data})}processWithConfig(e,t){return Pe(this,null,function*(){return(yield this.sendRequestUntil("processed",{type:"processWithConfig",fileName:e,config:t})).dataset})}getProcessedFeatures(){return Pe(this,null,function*(){return(yield this.sendRequestUntil("processedFeatures",{type:"getProcessedFeatures"})).data})}pruneFiles(e){return Pe(this,null,function*(){yield this.sendRequestUntil("filesPruned",{type:"pruneFiles",keep:e})})}get processingProgress(){return this.processingProgress$.asObservable()}requestThumb(e){if(this.thumbCache.has(e))return Lr(this.thumbCache.get(e));if(!this.thumbSubjects.has(e)){let t=new Qt(null);this.thumbSubjects.set(e,t),this.worker.postMessage({type:"getThumb",file:e})}return this.thumbSubjects.get(e).asObservable()}handleThumb(e,t){return Pe(this,null,function*(){try{let i=new Blob([new Uint8Array(t)],{type:this.guessMimeType(e)}),r=yield createImageBitmap(i);this.thumbCache.set(e,r);let s=this.thumbSubjects.get(e);s&&(s.next(r),s.complete())}catch(i){console.error(`Failed to decode thumbnail "${e}":`,i)}})}guessMimeType(e){return e.endsWith(".png")?"image/png":e.endsWith(".jpg")||e.endsWith(".jpeg")?"image/jpeg":e.endsWith(".webp")?"image/webp":"application/octet-stream"}sendRequestUntil(e,t,i=()=>!0,r=6e4){let s=++this.nextRequestId;return new Promise((o,a)=>{let c=setTimeout(()=>{l.unsubscribe(),a(new Error(`Worker request "${e}" timed out after ${r}ms`))},r),l=this.message$.subscribe(u=>{u.requestId===s&&(u.type==="error"?(clearTimeout(c),l.unsubscribe(),a(new Error(typeof u.message=="string"?u.message:"Worker reported an error"))):u.type===e&&i(u)&&(clearTimeout(c),l.unsubscribe(),o(u)))});this.worker.postMessage(st(Ae({},t),{requestId:s}))})}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var as={d:2};function f0(n){return n&&n>0?st(Ae({},as),{neighbors:n}):as}function CB(n){if(!n)throw new Error("UMAP requires config with neighbors and minDist");return st(Ae({},as),{n_neighbors:n.neighbors||15,min_dist:n.minDist??.1,local_connectivity:1})}function ID(n,e){switch(n){case"pca":return{className:"PCA",params:as};case"fastmap":return{className:"FASTMAP",params:as};case"isomap":return{className:"ISOMAP",params:f0(e?.isomapNeighbors)};case"umap":return{className:"UMAP",params:CB(e)};case"mds":return{className:"MDS",params:as};case"lle":return{className:"LLE",params:f0(e?.lleNeighbors)};case"ltsa":return{className:"LTSA",params:f0(e?.ltsaNeighbors)};case"trimap":return{className:"TriMap",params:as};case"topomap":return{className:"TopoMap",params:{}};case"sammon":return{className:"SAMMON",params:as};default:throw new Error(`Unknown projection method: ${n}`)}}function DB(n,e){return n.map((t,i)=>({id:e[i],x:t[0],y:t[1]}))}function RD(n,e,t,i){return Pe(this,null,function*(){let r=performance.now(),o=(yield n())[e.className];return{positions:DB(new o(t,e.params).transform(),i),computeTime:performance.now()-r}})}var h0=class extends Error{constructor(t){super(`${t} was cancelled`);this.method=t;this.name="ProjectionCancelledError"}method};function AB(){return import("./chunk-LCT6RGOE.js")}var ND=class n{constructor(e){this.ngZone=e}ngZone;backgroundStatus$=new Qt(new Map);jobs=new Map;requests=new Map;runFastMapSync(e,t){return Pe(this,null,function*(){try{let{positions:i,computeTime:r}=yield RD(AB,ID("fastmap"),e,t);return{method:"fastmap",positions:i,computeTime:Math.round(r)}}catch(i){throw new Error(`FastMap failed: ${i instanceof Error?i.message:String(i)}`,{cause:i})}})}runFastMap(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("fastmap",e,t)})}runIsoMap(e,t,i){return Pe(this,null,function*(){return this.runProjectionInWorker("isomap",e,t,i?{isomapNeighbors:i.neighbors}:void 0)})}runPCABackground(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("pca",e,t)})}runTSNE(e,t,i){return Pe(this,null,function*(){return this.runProjectionInWorker("tsne",e,t,i)})}runUMAP(e,t,i){return Pe(this,null,function*(){return this.runProjectionInWorker("umap",e,t,i)})}runMDS(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("mds",e,t)})}runLLE(e,t,i){return Pe(this,null,function*(){return this.runProjectionInWorker("lle",e,t,i?{lleNeighbors:i.neighbors}:void 0)})}runLTSA(e,t,i){return Pe(this,null,function*(){return this.runProjectionInWorker("ltsa",e,t,i?{ltsaNeighbors:i.neighbors}:void 0)})}runTriMap(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("trimap",e,t)})}runTopoMap(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("topomap",e,t)})}runSammon(e,t){return Pe(this,null,function*(){return this.runProjectionInWorker("sammon",e,t)})}runProjectionInWorker(e,t,i,r){return this.startJob({method:e,features:t,ids:i,config:r})}startJob(e){let{method:t}=e;return this.requests.set(t,e),new Promise((i,r)=>{let s=new Worker(new URL("worker-3JMNIJ3A.js",import.meta.url),{type:"module"}),o={worker:s,request:e,reject:r,ended:!1};this.jobs.set(t,o),this.updateBackgroundStatus(t,"running",0,`Starting ${t.toUpperCase()}...`),s.onmessage=({data:c})=>{this.ngZone.run(()=>this.handleWorkerMessage(o,c,i))},s.onerror=c=>{this.ngZone.run(()=>this.failJob(o,`${t} worker error`,c.message))};let a={type:"compute",method:t,features:e.features,ids:e.ids,config:e.config};s.postMessage(a)})}handleWorkerMessage(e,t,i){let{method:r}=e.request;e.ended||(t.type==="progress"?this.updateBackgroundStatus(r,"running",t.progress||0,t.message||`Computing ${r}...`):t.type==="result"?(this.endJob(e),this.requests.get(r)===e.request&&this.requests.delete(r),this.updateBackgroundStatus(r,"complete",100,`${r} complete`),i({method:r,positions:t.positions??[],computeTime:t.computeTime??0})):t.type==="error"&&this.failJob(e,`${r} failed`,t.error??"Unknown error"))}failJob(e,t,i){e.ended||(this.endJob(e),this.updateBackgroundStatus(e.request.method,"error",0,t,i),e.reject(new Error(`${t}: ${i}`)))}endJob(e){e.ended=!0,e.worker.terminate(),this.jobs.get(e.request.method)===e&&this.jobs.delete(e.request.method)}cancel(e){let t=this.jobs.get(e);return t?(this.endJob(t),t.reject(new h0(e)),this.updateBackgroundStatus(e,"cancelled",0,"Cancelled"),!0):!1}isRunning(e){return this.jobs.has(e)}canRetry(e){return!this.jobs.has(e)&&this.requests.has(e)}retry(e){let t=this.requests.get(e);return t?this.startJob(t):Promise.reject(new Error(`There is no previous ${e} run to retry`))}detachAll(){this.jobs.clear(),this.requests.clear()}parseCSVFeatures(e){try{let t=qC(e.trim());if(t.length<2)throw new Error("CSV file is empty or has no data rows");let i=[],r=[];for(let s of t.slice(1)){if(s.every(c=>!c.trim()))continue;if(s.length<2){console.warn("Skipping line with insufficient columns:",s.join(","));continue}let o=s[0];i.push(isNaN(Number(o))?o:Number(o));let a=s.slice(1).map(c=>{let l=parseFloat(c);if(isNaN(l))throw new Error(`Invalid numeric value in features: ${c}`);return l});r.push(a)}if(r.length===0)throw new Error("No valid feature data found in CSV");return{features:r,ids:i}}catch(t){throw new Error(`Failed to parse CSV features: ${t instanceof Error?t.message:String(t)}`,{cause:t})}}initializeBackgroundStatus(e){this.updateBackgroundStatus(e,"pending",0,"Waiting to start...")}updateBackgroundStatus(e,t,i,r,s){this.ngZone.run(()=>{let o=this.backgroundStatus$.value;o.set(e,{method:e,status:t,progress:i,message:r,error:s}),this.backgroundStatus$.next(new Map(o))})}getBackgroundStatus(e){return this.backgroundStatus$.value.get(e)}get backgroundStatusObservable(){return this.backgroundStatus$.asObservable()}clearBackgroundStatuses(){this.requests.clear(),this.backgroundStatus$.next(new Map)}terminateAllWorkers(){return Array.from(this.jobs.keys()).filter(e=>this.cancel(e))}static \u0275fac=function(t){return new(t||n)(Ye(Bt))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var IB="Can't undo \u2014 other changes were made since.",RB=5e3,PD=1e4,Ph=class n{toastsSubject=new Qt([]);toasts$=this.toastsSubject.asObservable();nextId=0;timers=new Map;show(e,t="info",i=RB,r){let s=r&&i>0?Math.max(i,PD):i,o={id:this.nextId++,message:e,type:t,duration:s,action:r},a=this.toastsSubject.getValue();this.toastsSubject.next([...a,o]),s>0&&this.startTimer(o.id,s)}showUndo(e,t,i=PD){this.show(e,"info",i,{label:"Undo",handler:()=>{t()||this.info(IB)}})}success(e,t){this.show(e,"success",t)}error(e,t){this.show(e,"error",t)}info(e,t){this.show(e,"info",t)}warning(e,t){this.show(e,"warning",t)}pause(e){let t=this.timers.get(e);if(!t||t.handle===null)return;clearTimeout(t.handle);let i=Date.now()-t.startedAt;this.timers.set(e,{handle:null,remaining:Math.max(0,t.remaining-i),startedAt:0})}resume(e){let t=this.timers.get(e);!t||t.handle!==null||this.startTimer(e,t.remaining)}remove(e){this.stopTimer(e);let t=this.toastsSubject.getValue();this.toastsSubject.next(t.filter(i=>i.id!==e))}clear(){[...this.timers.keys()].forEach(e=>this.stopTimer(e)),this.toastsSubject.next([])}startTimer(e,t){let i=setTimeout(()=>this.remove(e),t);this.timers.set(e,{handle:i,remaining:t,startedAt:Date.now()})}stopTimer(e){let t=this.timers.get(e)?.handle;t!=null&&clearTimeout(t),this.timers.delete(e)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var Fh=[{dataset:"wineqr",source:"local",items:[{algorithms:{feature:"wineqr.15012026.feature.json",position:{umap:"wineqr.15012026.position.umap.json",pca:"wineqr.15012026.position.pca.json",tsne:"wineqr.15012026.position.tsne.json"},meta:"wineqr.15012026.meta.json",schema:"wineqr.15012026.schema.json"},time:"15012026"}]},{dataset:"nutrients",source:"local",items:[{algorithms:{position:{umap:"nutrients.15012026.position.umap.json",pca:"nutrients.15012026.position.pca.json",tsne:"nutrients.15012026.position.tsne.json"},feature:"nutrients.15012026.feature.json",schema:"nutrients.15012026.schema.json",meta:"nutrients.15012026.meta.json"},time:"15012026"}]}];var Oh=class{pending;results=new Map;done=!1;constructor(e){this.pending=[...e]}succeeded(e,t){this.results.set(e,t),this.settle()}failed(e){this.results.set(e,null),this.settle()}settle(){for(;!this.done&&this.pending.length>0&&this.results.has(this.pending[0]);){let e=this.results.get(this.pending.shift());e&&(this.done=!0,e())}}};var PB="glyphspace-datasets",FB=2,Qi="datasets",cs="thumbnails",Va=class n{dbPromise=null;openDb(){return this.dbPromise||(this.dbPromise=new Promise((e,t)=>{let i=indexedDB.open(PB,FB);i.onupgradeneeded=()=>{let r=i.result;r.objectStoreNames.contains(Qi)||r.createObjectStore(Qi,{keyPath:"name"}),r.objectStoreNames.contains(cs)||r.createObjectStore(cs)},i.onsuccess=()=>e(i.result),i.onerror=()=>{this.dbPromise=null,t(i.error)}})),this.dbPromise}saveDataset(e){return Pe(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let s=t.transaction(Qi,"readwrite");s.objectStore(Qi).put(e),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}catch(t){console.warn("[DatasetStorage] Failed to save dataset:",t)}})}getDataset(e){return Pe(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let o=t.transaction(Qi,"readonly").objectStore(Qi).get(e);o.onsuccess=()=>i(o.result??void 0),o.onerror=()=>r(o.error)})}catch(t){console.warn("[DatasetStorage] Failed to get dataset:",t);return}})}getAllDatasets(){return Pe(this,null,function*(){try{let e=yield this.openDb();return new Promise((t,i)=>{let s=e.transaction(Qi,"readonly").objectStore(Qi).getAll();s.onsuccess=()=>t(s.result??[]),s.onerror=()=>i(s.error)})}catch(e){return console.warn("[DatasetStorage] Failed to get all datasets:",e),[]}})}deleteDataset(e){return Pe(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let s=t.transaction([Qi,cs],"readwrite");s.objectStore(Qi).delete(e),s.objectStore(cs).delete(e),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}catch(t){console.warn("[DatasetStorage] Failed to delete dataset:",t)}})}saveThumbnailArchive(e,t){return Pe(this,null,function*(){try{let i=yield this.openDb();return new Promise((r,s)=>{let o=i.transaction(cs,"readwrite");o.objectStore(cs).put(t,e),o.oncomplete=()=>r(),o.onerror=()=>s(o.error)})}catch(i){console.warn("[DatasetStorage] Failed to save the image archive:",i)}})}getThumbnailArchive(e){return Pe(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let s=t.transaction(cs,"readonly").objectStore(cs).get(e);s.onsuccess=()=>i(s.result??void 0),s.onerror=()=>r(s.error)})}catch(t){console.warn("[DatasetStorage] Failed to read the image archive:",t);return}})}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var Lh=class{_filterMode=0;set filterMode(e){this._filterMode=e}get filterMode(){return this._filterMode}};var kh=class extends Lh{_acceptableIds;constructor(e){super(),this._acceptableIds=e===void 0?[]:e}info(){return"Id Filter Length "+this._acceptableIds.length+" FilterMode: "+this.filterMode}empty(){return this._acceptableIds.length<=0}inFilter(e){return this._acceptableIds.indexOf(e.id)>=0}add(e){this._acceptableIds.indexOf(e)<0&&this._acceptableIds.push(e)}remove(e){let t=this._acceptableIds.indexOf(e);t>=0&&this._acceptableIds.splice(t,1)}toggle(e){let t=this._acceptableIds.indexOf(e);t>=0?this._acceptableIds.splice(t,1):this._acceptableIds.push(e)}get acceptableIds(){return this._acceptableIds}set acceptableIds(e){this._acceptableIds=e.sort()}clear(){this._acceptableIds.splice(0,this._acceptableIds.length)}addMultiple(e){e.forEach(t=>{this._acceptableIds.indexOf(t)<0&&this._acceptableIds.push(t)}),this._acceptableIds.sort()}};var Uh=class n{filters=[];activeGlyphData;filterChangedSubject=new Ut;filterChanged$=this.filterChangedSubject.asObservable();totalItems=0;filteredItems=0;setActiveGlyphData(e){this.activeGlyphData=e}getGlyphDataSync(){return this.activeGlyphData}clearFilters(){this.filters.forEach(e=>e.clear()),this.filters.splice(0,this.filters.length),this.refreshFilters()}getFilters(){return this.filters}ensureFilter(e){this.filters.includes(e)||this.filters.push(e)}clearIdFilters(){this.filters.forEach(e=>{e instanceof kh&&e.clear()})}refreshFilters(){let e=this.activeGlyphData;if(e==null)return;let t=0,i=this.filters.length===0||this.filters.every(s=>s.empty()),r=this.filters.filter(s=>s.filterMode===1).every(s=>s.empty());e.forEach(s=>{let o=!0,a=r;this.filters.forEach(c=>{c.empty()||(c.filterMode===1?a=a||c.inFilter(s):c.filterMode===0&&(o=o&&c.inFilter(s)))}),s.passive=i?!1:!(o&&a),s.passive||t++}),this.filteredItems=t,this.filterChangedSubject.next()}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var Ha=class n{dataSetCollectionSubject=new Qt(Fh);dataSetCollectionSubject$=this.dataSetCollectionSubject.asObservable();getCollection(){return this.dataSetCollectionSubject.getValue()}setDatasetCollection(e){let t=this.getCollection()??[],i=new Map;for(let r of t)i.set(r.dataset,st(Ae({},r),{items:[...r.items]}));for(let r of e){let s=i.get(r.dataset);if(s)for(let o of r.items){let a=s.items.find(c=>c.time===o.time);a?a.algorithms.position=Ae(Ae({},a.algorithms.position),o.algorithms.position):s.items.push(o)}else i.set(r.dataset,st(Ae({},r),{items:[...r.items]}))}this.dataSetCollectionSubject.next(Array.from(i.values()))}getCollectionEntry(e){if(e)return this.getCollection().find(t=>t.dataset===e)}getDataSetNames(){return(this.getCollection()??[]).map(t=>t.dataset)}getTimestamps(e){let t=[],i=this.getCollectionEntry(e);return i&&i.items.forEach(r=>{t.push(r.time)}),t}getPositions(e,t){let i=[],r=this.getCollectionEntry(e);if(r){let s=t?r.items.find(o=>o.time===t):r.items.at(0);s&&i.push(...Object.keys(s.algorithms.position))}return i}removeDataset(e){let t=this.getCollection().filter(i=>i.dataset!==e);this.dataSetCollectionSubject.next(t)}notifyChange(){this.dataSetCollectionSubject.next([...this.getCollection()])}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var dA=0,Y0=1,fA=2;var Fu=1,hA=2,hc=3,cr=0,Ln=1,qt=2,lr=0,pc=1,Z0=2,J0=3,K0=4,pA=5;var Mo=100,mA=101,gA=102,yA=103,vA=104,_A=200,xA=201,bA=202,MA=203,Q0=204,ex=205,SA=206,EA=207,wA=208,TA=209,CA=210,DA=211,AA=212,IA=213,RA=214,lp=0,up=1,dp=2,sc=3,fp=4,hp=5,pp=6,mp=7,tx=0,NA=1,PA=2,Fi=0,nx=1,ix=2,rx=3,sx=4,ox=5,ax=6,cx=7;var U0=300,bs=301,So=302,jp=303,Wp=304,Ou=306,gp=1e3,tr=1001,yp=1002,Ht=1003,FA=1004;var Lu=1005;var $t=1006,$p=1007;var Ms=1008;var ri=1009,lx=1010,ux=1011,mc=1012,qp=1013,Oi=1014,Li=1015,ki=1016,Xp=1017,Yp=1018,gc=1020,dx=35902,fx=35899,hx=1021,px=1022,mi=1023,ir=1026,Ss=1027,mx=1028,Zp=1029,Es=1030,Jp=1031;var Kp=1033,ku=33776,Uu=33777,Bu=33778,Vu=33779,Qp=35840,em=35841,tm=35842,nm=35843,im=36196,rm=37492,sm=37496,om=37488,am=37489,Hu=37490,cm=37491,lm=37808,um=37809,dm=37810,fm=37811,hm=37812,pm=37813,mm=37814,gm=37815,ym=37816,vm=37817,_m=37818,xm=37819,bm=37820,Mm=37821,Sm=36492,Em=36494,wm=36495,Tm=36283,Cm=36284,zu=36285,Dm=36286;var nu=2300,vp=2301,ap=2302,B0=2303,V0=2400,H0=2401,z0=2402;var OA=3200;var gx=0,LA=1,Nr="",Pn="srgb",iu="srgb-linear",ru="linear",ft="srgb";var cp=7680;var kA=519,UA=512,BA=513,VA=514,Am=515,HA=516,zA=517,Im=518,GA=519,yx=35044;var vx="300 es",Ni=2e3,su=2001;function kB(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function UB(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function ou(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function jA(){let n=ou("canvas");return n.style.display="block",n}var LD={},oc=null;function au(...n){let e="THREE."+n.shift();oc?oc("log",e,...n):console.log(e,...n)}function WA(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Le(...n){n=WA(n);let e="THREE."+n.shift();if(oc)oc("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Ue(...n){n=WA(n);let e="THREE."+n.shift();if(oc)oc("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function vo(...n){let e=n.join(" ");e in LD||(LD[e]=!0,Le(...n))}function $A(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}var qA={[lp]:up,[dp]:pp,[fp]:mp,[sc]:hp,[up]:lp,[pp]:dp,[mp]:fp,[hp]:sc},rr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}},Mn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kD=1234567,Kl=Math.PI/180,ac=180/Math.PI;function nr(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Mn[n&255]+Mn[n>>8&255]+Mn[n>>16&255]+Mn[n>>24&255]+"-"+Mn[e&255]+Mn[e>>8&255]+"-"+Mn[e>>16&15|64]+Mn[e>>24&255]+"-"+Mn[t&63|128]+Mn[t>>8&255]+"-"+Mn[t>>16&255]+Mn[t>>24&255]+Mn[i&255]+Mn[i>>8&255]+Mn[i>>16&255]+Mn[i>>24&255]).toLowerCase()}function Ge(n,e,t){return Math.max(e,Math.min(t,n))}function _x(n,e){return(n%e+e)%e}function BB(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function VB(n,e,t){return n!==e?(t-n)/(e-n):0}function Ql(n,e,t){return(1-t)*n+t*e}function HB(n,e,t,i){return Ql(n,e,1-Math.exp(-t*i))}function zB(n,e=1){return e-Math.abs(_x(n,e*2)-e)}function GB(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function jB(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function WB(n,e){return n+Math.floor(Math.random()*(e-n+1))}function $B(n,e){return n+Math.random()*(e-n)}function qB(n){return n*(.5-Math.random())}function XB(n){n!==void 0&&(kD=n);let e=kD+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function YB(n){return n*Kl}function ZB(n){return n*ac}function JB(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function KB(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function QB(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function eV(n,e,t,i,r){let s=Math.cos,o=Math.sin,a=s(t/2),c=o(t/2),l=s((e+i)/2),u=o((e+i)/2),d=s((e-i)/2),f=o((e-i)/2),h=s((i-e)/2),p=o((i-e)/2);switch(r){case"XYX":n.set(a*u,c*d,c*f,a*l);break;case"YZY":n.set(c*f,a*u,c*d,a*l);break;case"ZXZ":n.set(c*d,c*f,a*u,a*l);break;case"XZX":n.set(a*u,c*p,c*h,a*l);break;case"YXY":n.set(c*h,a*u,c*p,a*l);break;case"ZYZ":n.set(c*p,c*h,a*u,a*l);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Ri(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function pt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var xx={DEG2RAD:Kl,RAD2DEG:ac,generateUUID:nr,clamp:Ge,euclideanModulo:_x,mapLinear:BB,inverseLerp:VB,lerp:Ql,damp:HB,pingpong:zB,smoothstep:GB,smootherstep:jB,randInt:WB,randFloat:$B,randFloatSpread:qB,seededRandom:XB,degToRad:YB,radToDeg:ZB,isPowerOfTwo:JB,ceilPowerOfTwo:KB,floorPowerOfTwo:QB,setQuaternionFromProperEuler:eV,normalize:pt,denormalize:Ri},pe=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ge(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ge(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},sr=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let c=i[r+0],l=i[r+1],u=i[r+2],d=i[r+3],f=s[o+0],h=s[o+1],p=s[o+2],v=s[o+3];if(d!==v||c!==f||l!==h||u!==p){let m=c*f+l*h+u*p+d*v;m<0&&(f=-f,h=-h,p=-p,v=-v,m=-m);let g=1-a;if(m<.9995){let M=Math.acos(m),w=Math.sin(M);g=Math.sin(g*M)/w,a=Math.sin(a*M)/w,c=c*g+f*a,l=l*g+h*a,u=u*g+p*a,d=d*g+v*a}else{c=c*g+f*a,l=l*g+h*a,u=u*g+p*a,d=d*g+v*a;let M=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=M,l*=M,u*=M,d*=M}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,r,s,o){let a=i[r],c=i[r+1],l=i[r+2],u=i[r+3],d=s[o],f=s[o+1],h=s[o+2],p=s[o+3];return e[t]=a*p+u*d+c*h-l*f,e[t+1]=c*p+u*f+l*d-a*h,e[t+2]=l*p+u*h+a*f-c*d,e[t+3]=u*p-a*d-c*f-l*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(r/2),d=a(s/2),f=c(i/2),h=c(r/2),p=c(s/2);switch(o){case"XYZ":this._x=f*u*d+l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d-f*h*p;break;case"YXZ":this._x=f*u*d+l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d+f*h*p;break;case"ZXY":this._x=f*u*d-l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d-f*h*p;break;case"ZYX":this._x=f*u*d-l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d+f*h*p;break;case"YZX":this._x=f*u*d+l*h*p,this._y=l*h*d+f*u*p,this._z=l*u*p-f*h*d,this._w=l*u*d-f*h*p;break;case"XZY":this._x=f*u*d-l*h*p,this._y=l*h*d-f*u*p,this._z=l*u*p+f*h*d,this._w=l*u*d+f*h*p;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],d=t[10],f=i+a+d;if(f>0){let h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(u-c)*h,this._y=(s-l)*h,this._z=(o-r)*h}else if(i>a&&i>d){let h=2*Math.sqrt(1+i-a-d);this._w=(u-c)/h,this._x=.25*h,this._y=(r+o)/h,this._z=(s+l)/h}else if(a>d){let h=2*Math.sqrt(1+a-i-d);this._w=(s-l)/h,this._x=(r+o)/h,this._y=.25*h,this._z=(c+u)/h}else{let h=2*Math.sqrt(1+d-i-a);this._w=(o-r)/h,this._x=(s+l)/h,this._y=(c+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ge(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+o*a+r*l-s*c,this._y=r*u+o*c+s*a-i*l,this._z=s*u+o*l+i*c-r*a,this._w=o*u-i*a-r*c-s*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,r=e._y,s=e._z,o=e._w,a=this.dot(e);a<0&&(i=-i,r=-r,s=-s,o=-o,a=-a);let c=1-t;if(a<.9995){let l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+r*t,this._z=this._z*c+s*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+r*t,this._z=this._z*c+s*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},A=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(UD.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(UD.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*r-a*i),u=2*(a*t-s*r),d=2*(s*i-o*t);return this.x=t+c*l+o*d-a*u,this.y=i+c*u+a*l-s*d,this.z=r+c*d+s*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ge(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,c=t.z;return this.x=r*c-s*a,this.y=s*o-i*c,this.z=i*a-r*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return p0.copy(this).projectOnVector(e),this.sub(p0)}reflect(e){return this.sub(p0.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Ge(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},p0=new A,UD=new sr,He=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,r,s,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l)}set(e,t,i,r,s,o,a,c,l){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=s,u[5]=c,u[6]=i,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],u=i[4],d=i[7],f=i[2],h=i[5],p=i[8],v=r[0],m=r[3],g=r[6],M=r[1],w=r[4],_=r[7],S=r[2],E=r[5],D=r[8];return s[0]=o*v+a*M+c*S,s[3]=o*m+a*w+c*E,s[6]=o*g+a*_+c*D,s[1]=l*v+u*M+d*S,s[4]=l*m+u*w+d*E,s[7]=l*g+u*_+d*D,s[2]=f*v+h*M+p*S,s[5]=f*m+h*w+p*E,s[8]=f*g+h*_+p*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-i*s*u+i*a*c+r*s*l-r*o*c}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],d=u*o-a*l,f=a*c-u*s,h=l*s-o*c,p=t*d+i*f+r*h;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/p;return e[0]=d*v,e[1]=(r*l-u*i)*v,e[2]=(a*i-r*o)*v,e[3]=f*v,e[4]=(u*t-r*c)*v,e[5]=(r*s-a*t)*v,e[6]=h*v,e[7]=(i*c-l*t)*v,e[8]=(o*t-i*s)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+e,-r*l,r*c,-r*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return vo("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(m0.makeScale(e,t)),this}rotate(e){return vo("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(m0.makeRotation(-e)),this}translate(e,t){return vo("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(m0.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},m0=new He,BD=new He().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),VD=new He().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tV(){let n={enabled:!0,workingColorSpace:iu,spaces:{},convert:function(r,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ft&&(r.r=Rr(r.r),r.g=Rr(r.g),r.b=Rr(r.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(r.applyMatrix3(this.spaces[s].toXYZ),r.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ft&&(r.r=ic(r.r),r.g=ic(r.g),r.b=ic(r.b))),r},workingToColorSpace:function(r,s){return this.convert(r,this.workingColorSpace,s)},colorSpaceToWorking:function(r,s){return this.convert(r,s,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Nr?ru:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,s=this.workingColorSpace){return r.fromArray(this.spaces[s].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,s,o){return r.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,s){return vo("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,s)},toWorkingColorSpace:function(r,s){return vo("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,s)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[iu]:{primaries:e,whitePoint:i,transfer:ru,toXYZ:BD,fromXYZ:VD,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Pn},outputColorSpaceConfig:{drawingBufferColorSpace:Pn}},[Pn]:{primaries:e,whitePoint:i,transfer:ft,toXYZ:BD,fromXYZ:VD,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Pn}}}),n}var tt=tV();function Rr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ic(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var za,_p=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{za===void 0&&(za=ou("canvas")),za.width=e.width,za.height=e.height;let r=za.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=za}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ou("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=Rr(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Rr(t[i]/255)*255):t[i]=Rr(t[i]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},nV=0,cc=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:nV++}),this.uuid=nr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(g0(r[o].image)):s.push(g0(r[o]))}else s=g0(r);i.url=s}return t||(e.images[this.uuid]=i),i}};function g0(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?_p.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}var iV=0,y0=new A,gi=(()=>{class n extends rr{constructor(t=n.DEFAULT_IMAGE,i=n.DEFAULT_MAPPING,r=tr,s=tr,o=$t,a=Ms,c=mi,l=ri,u=n.DEFAULT_ANISOTROPY,d=Nr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:iV++}),this.uuid=nr(),this.name="",this.source=new cc(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=s,this.magFilter=o,this.minFilter=a,this.anisotropy=u,this.format=c,this.internalFormat=null,this.type=l,this.offset=new pe(0,0),this.repeat=new pe(1,1),this.center=new pe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new He,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(y0).x}get height(){return this.source.getSize(y0).y}get depth(){return this.source.getSize(y0).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let i in t){let r=t[i];if(r===void 0){Le(`Texture.setValues(): parameter '${i}' has value of undefined.`);continue}let s=this[i];if(s===void 0){Le(`Texture.setValues(): property '${i}' does not exist.`);continue}s&&r&&s.isVector2&&r.isVector2||s&&r&&s.isVector3&&r.isVector3||s&&r&&s.isMatrix3&&r.isMatrix3?s.copy(r):this[i]=r}}toJSON(t){let i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(t.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==U0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case gp:t.x=t.x-Math.floor(t.x);break;case tr:t.x=t.x<0?0:1;break;case yp:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case gp:t.y=t.y-Math.floor(t.y);break;case tr:t.y=t.y<0?0:1;break;case yp:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}return n.DEFAULT_IMAGE=null,n.DEFAULT_MAPPING=U0,n.DEFAULT_ANISOTROPY=1,n})(),mt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,r=1){this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s,c=e.elements,l=c[0],u=c[4],d=c[8],f=c[1],h=c[5],p=c[9],v=c[2],m=c[6],g=c[10];if(Math.abs(u-f)<.01&&Math.abs(d-v)<.01&&Math.abs(p-m)<.01){if(Math.abs(u+f)<.1&&Math.abs(d+v)<.1&&Math.abs(p+m)<.1&&Math.abs(l+h+g-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let w=(l+1)/2,_=(h+1)/2,S=(g+1)/2,E=(u+f)/4,D=(d+v)/4,x=(p+m)/4;return w>_&&w>S?w<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(w),r=E/i,s=D/i):_>S?_<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(_),i=E/r,s=x/r):S<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(S),i=D/s,r=x/s),this.set(i,r,s,t),this}let M=Math.sqrt((m-p)*(m-p)+(d-v)*(d-v)+(f-u)*(f-u));return Math.abs(M)<.001&&(M=1),this.x=(m-p)/M,this.y=(d-v)/M,this.z=(f-u)/M,this.w=Math.acos((l+h+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ge(this.x,e.x,t.x),this.y=Ge(this.y,e.y,t.y),this.z=Ge(this.z,e.z,t.z),this.w=Ge(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ge(this.x,e,t),this.y=Ge(this.y,e,t),this.z=Ge(this.z,e,t),this.w=Ge(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Ge(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},xp=class extends rr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:$t,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new mt(0,0,e,t),this.scissorTest=!1,this.viewport=new mt(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:i.depth},s=new gi(r),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:$t,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new cc(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},$n=class extends xp{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},cu=class extends gi{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ht,this.minFilter=Ht,this.wrapR=tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var bp=class extends gi{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=Ht,this.minFilter=Ht,this.wrapR=tr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Rt=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,r,s,o,a,c,l,u,d,f,h,p,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,c,l,u,d,f,h,p,v,m)}set(e,t,i,r,s,o,a,c,l,u,d,f,h,p,v,m){let g=this.elements;return g[0]=e,g[4]=t,g[8]=i,g[12]=r,g[1]=s,g[5]=o,g[9]=a,g[13]=c,g[2]=l,g[6]=u,g[10]=d,g[14]=f,g[3]=h,g[7]=p,g[11]=v,g[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,r=1/Ga.setFromMatrixColumn(e,0).length(),s=1/Ga.setFromMatrixColumn(e,1).length(),o=1/Ga.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(s),d=Math.sin(s);if(e.order==="XYZ"){let f=o*u,h=o*d,p=a*u,v=a*d;t[0]=c*u,t[4]=-c*d,t[8]=l,t[1]=h+p*l,t[5]=f-v*l,t[9]=-a*c,t[2]=v-f*l,t[6]=p+h*l,t[10]=o*c}else if(e.order==="YXZ"){let f=c*u,h=c*d,p=l*u,v=l*d;t[0]=f+v*a,t[4]=p*a-h,t[8]=o*l,t[1]=o*d,t[5]=o*u,t[9]=-a,t[2]=h*a-p,t[6]=v+f*a,t[10]=o*c}else if(e.order==="ZXY"){let f=c*u,h=c*d,p=l*u,v=l*d;t[0]=f-v*a,t[4]=-o*d,t[8]=p+h*a,t[1]=h+p*a,t[5]=o*u,t[9]=v-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let f=o*u,h=o*d,p=a*u,v=a*d;t[0]=c*u,t[4]=p*l-h,t[8]=f*l+v,t[1]=c*d,t[5]=v*l+f,t[9]=h*l-p,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let f=o*c,h=o*l,p=a*c,v=a*l;t[0]=c*u,t[4]=v-f*d,t[8]=p*d+h,t[1]=d,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=h*d+p,t[10]=f-v*d}else if(e.order==="XZY"){let f=o*c,h=o*l,p=a*c,v=a*l;t[0]=c*u,t[4]=-d,t[8]=l*u,t[1]=f*d+v,t[5]=o*u,t[9]=h*d-p,t[2]=p*d-h,t[6]=a*u,t[10]=v*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(rV,e,sV)}lookAt(e,t,i){let r=this.elements;return Qn.subVectors(e,t),Qn.lengthSq()===0&&(Qn.z=1),Qn.normalize(),ls.crossVectors(i,Qn),ls.lengthSq()===0&&(Math.abs(i.z)===1?Qn.x+=1e-4:Qn.z+=1e-4,Qn.normalize(),ls.crossVectors(i,Qn)),ls.normalize(),Bh.crossVectors(Qn,ls),r[0]=ls.x,r[4]=Bh.x,r[8]=Qn.x,r[1]=ls.y,r[5]=Bh.y,r[9]=Qn.y,r[2]=ls.z,r[6]=Bh.z,r[10]=Qn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],u=i[1],d=i[5],f=i[9],h=i[13],p=i[2],v=i[6],m=i[10],g=i[14],M=i[3],w=i[7],_=i[11],S=i[15],E=r[0],D=r[4],x=r[8],C=r[12],F=r[1],L=r[5],P=r[9],z=r[13],O=r[2],V=r[6],J=r[10],j=r[14],te=r[3],W=r[7],Y=r[11],ne=r[15];return s[0]=o*E+a*F+c*O+l*te,s[4]=o*D+a*L+c*V+l*W,s[8]=o*x+a*P+c*J+l*Y,s[12]=o*C+a*z+c*j+l*ne,s[1]=u*E+d*F+f*O+h*te,s[5]=u*D+d*L+f*V+h*W,s[9]=u*x+d*P+f*J+h*Y,s[13]=u*C+d*z+f*j+h*ne,s[2]=p*E+v*F+m*O+g*te,s[6]=p*D+v*L+m*V+g*W,s[10]=p*x+v*P+m*J+g*Y,s[14]=p*C+v*z+m*j+g*ne,s[3]=M*E+w*F+_*O+S*te,s[7]=M*D+w*L+_*V+S*W,s[11]=M*x+w*P+_*J+S*Y,s[15]=M*C+w*z+_*j+S*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],d=e[6],f=e[10],h=e[14],p=e[3],v=e[7],m=e[11],g=e[15],M=c*h-l*f,w=a*h-l*d,_=a*f-c*d,S=o*h-l*u,E=o*f-c*u,D=o*d-a*u;return t*(v*M-m*w+g*_)-i*(p*M-m*S+g*E)+r*(p*w-v*S+g*D)-s*(p*_-v*E+m*D)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],r=e[8],s=e[1],o=e[5],a=e[9],c=e[2],l=e[6],u=e[10];return t*(o*u-a*l)-i*(s*u-a*c)+r*(s*l-o*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],d=e[9],f=e[10],h=e[11],p=e[12],v=e[13],m=e[14],g=e[15],M=t*a-i*o,w=t*c-r*o,_=t*l-s*o,S=i*c-r*a,E=i*l-s*a,D=r*l-s*c,x=u*v-d*p,C=u*m-f*p,F=u*g-h*p,L=d*m-f*v,P=d*g-h*v,z=f*g-h*m,O=M*z-w*P+_*L+S*F-E*C+D*x;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let V=1/O;return e[0]=(a*z-c*P+l*L)*V,e[1]=(r*P-i*z-s*L)*V,e[2]=(v*D-m*E+g*S)*V,e[3]=(f*E-d*D-h*S)*V,e[4]=(c*F-o*z-l*C)*V,e[5]=(t*z-r*F+s*C)*V,e[6]=(m*_-p*D-g*w)*V,e[7]=(u*D-f*_+h*w)*V,e[8]=(o*P-a*F+l*x)*V,e[9]=(i*F-t*P-s*x)*V,e[10]=(p*E-v*_+g*M)*V,e[11]=(d*_-u*E-h*M)*V,e[12]=(a*C-o*L-c*x)*V,e[13]=(t*L-i*C+r*x)*V,e[14]=(v*w-p*S-m*M)*V,e[15]=(u*S-d*w+f*M)*V,this}scale(e){let t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,c=e.z,l=s*o,u=s*a;return this.set(l*o+i,l*a-r*c,l*c+r*a,0,l*a+r*c,u*a+i,u*c-r*o,0,l*c-r*a,u*c+r*o,s*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,s=t._x,o=t._y,a=t._z,c=t._w,l=s+s,u=o+o,d=a+a,f=s*l,h=s*u,p=s*d,v=o*u,m=o*d,g=a*d,M=c*l,w=c*u,_=c*d,S=i.x,E=i.y,D=i.z;return r[0]=(1-(v+g))*S,r[1]=(h+_)*S,r[2]=(p-w)*S,r[3]=0,r[4]=(h-_)*E,r[5]=(1-(f+g))*E,r[6]=(m+M)*E,r[7]=0,r[8]=(p+w)*D,r[9]=(m-M)*D,r[10]=(1-(f+v))*D,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),t.identity(),this;let o=Ga.set(r[0],r[1],r[2]).length(),a=Ga.set(r[4],r[5],r[6]).length(),c=Ga.set(r[8],r[9],r[10]).length();s<0&&(o=-o),Ci.copy(this);let l=1/o,u=1/a,d=1/c;return Ci.elements[0]*=l,Ci.elements[1]*=l,Ci.elements[2]*=l,Ci.elements[4]*=u,Ci.elements[5]*=u,Ci.elements[6]*=u,Ci.elements[8]*=d,Ci.elements[9]*=d,Ci.elements[10]*=d,t.setFromRotationMatrix(Ci),i.x=o,i.y=a,i.z=c,this}makePerspective(e,t,i,r,s,o,a=Ni,c=!1){let l=this.elements,u=2*s/(t-e),d=2*s/(i-r),f=(t+e)/(t-e),h=(i+r)/(i-r),p,v;if(c)p=s/(o-s),v=o*s/(o-s);else if(a===Ni)p=-(o+s)/(o-s),v=-2*o*s/(o-s);else if(a===su)p=-o/(o-s),v=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=Ni,c=!1){let l=this.elements,u=2/(t-e),d=2/(i-r),f=-(t+e)/(t-e),h=-(i+r)/(i-r),p,v;if(c)p=1/(o-s),v=o/(o-s);else if(a===Ni)p=-2/(o-s),v=-(o+s)/(o-s);else if(a===su)p=-1/(o-s),v=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=h,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},Ga=new A,Ci=new Rt,rV=new A(0,0,0),sV=new A(1,1,1),ls=new A,Bh=new A,Qn=new A,HD=new Rt,zD=new sr,lu=(()=>{class n{constructor(t=0,i=0,r=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=r,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,r,s=this._order){return this._x=t,this._y=i,this._z=r,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,r=!0){let s=t.elements,o=s[0],a=s[4],c=s[8],l=s[1],u=s[5],d=s[9],f=s[2],h=s[6],p=s[10];switch(i){case"XYZ":this._y=Math.asin(Ge(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,p),this._z=Math.atan2(-a,o)):(this._x=Math.atan2(h,u),this._z=0);break;case"YXZ":this._x=Math.asin(-Ge(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(c,p),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-f,o),this._z=0);break;case"ZXY":this._x=Math.asin(Ge(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,p),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,o));break;case"ZYX":this._y=Math.asin(-Ge(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,p),this._z=Math.atan2(l,o)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(Ge(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,u),this._y=Math.atan2(-f,o)):(this._x=0,this._y=Math.atan2(c,p));break;case"XZY":this._z=Math.asin(-Ge(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,u),this._y=Math.atan2(c,o)):(this._x=Math.atan2(-d,p),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,r){return HD.makeRotationFromQuaternion(t),this.setFromRotationMatrix(HD,i,r)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return zD.setFromEuler(this),this.setFromQuaternion(zD,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}return n.DEFAULT_ORDER="XYZ",n})(),uu=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},oV=0,GD=new A,ja=new sr,Tr=new Rt,Vh=new A,ql=new A,aV=new A,cV=new sr,jD=new A(1,0,0),WD=new A(0,1,0),$D=new A(0,0,1),qD={type:"added"},lV={type:"removed"},Wa={type:"childadded",child:null},v0={type:"childremoved",child:null},Eo=(()=>{class n extends rr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:oV++}),this.uuid=nr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new A,i=new lu,r=new sr,s=new A(1,1,1);function o(){r.setFromEuler(i,!1)}function a(){i.setFromQuaternion(r,void 0,!1)}i._onChange(o),r._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Rt},normalMatrix:{value:new He}}),this.matrix=new Rt,this.matrixWorld=new Rt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new uu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return ja.setFromAxisAngle(t,i),this.quaternion.multiply(ja),this}rotateOnWorldAxis(t,i){return ja.setFromAxisAngle(t,i),this.quaternion.premultiply(ja),this}rotateX(t){return this.rotateOnAxis(jD,t)}rotateY(t){return this.rotateOnAxis(WD,t)}rotateZ(t){return this.rotateOnAxis($D,t)}translateOnAxis(t,i){return GD.copy(t).applyQuaternion(this.quaternion),this.position.add(GD.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(jD,t)}translateY(t){return this.translateOnAxis(WD,t)}translateZ(t){return this.translateOnAxis($D,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Tr.copy(this.matrixWorld).invert())}lookAt(t,i,r){t.isVector3?Vh.copy(t):Vh.set(t,i,r);let s=this.parent;this.updateWorldMatrix(!0,!1),ql.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Tr.lookAt(ql,Vh,this.up):Tr.lookAt(Vh,ql,this.up),this.quaternion.setFromRotationMatrix(Tr),s&&(Tr.extractRotation(s.matrixWorld),ja.setFromRotationMatrix(Tr),this.quaternion.premultiply(ja.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(Ue("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(qD),Wa.child=t,this.dispatchEvent(Wa),Wa.child=null):Ue("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}let i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(lV),v0.child=t,this.dispatchEvent(v0),v0.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Tr.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Tr.multiply(t.parent.matrixWorld)),t.applyMatrix4(Tr),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(qD),Wa.child=t,this.dispatchEvent(Wa),Wa.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let r=0,s=this.children.length;r<s;r++){let a=this.children[r].getObjectByProperty(t,i);if(a!==void 0)return a}}getObjectsByProperty(t,i,r=[]){this[t]===i&&r.push(this);let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].getObjectsByProperty(t,i,r);return r}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ql,t,aV),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ql,cV,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let i=this.children;for(let r=0,s=i.length;r<s;r++)i[r].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let i=this.children;for(let r=0,s=i.length;r<s;r++)i[r].traverseVisible(t)}traverseAncestors(t){let i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let i=t.x,r=t.y,s=t.z,o=this.matrix.elements;o[12]+=i-o[0]*i-o[4]*r-o[8]*s,o[13]+=r-o[1]*i-o[5]*r-o[9]*s,o[14]+=s-o[2]*i-o[6]*r-o[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let i=this.children;for(let r=0,s=i.length;r<s;r++)i[r].updateMatrixWorld(t)}updateWorldMatrix(t,i,r=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||r)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,r=!0),i===!0){let o=this.children;for(let a=0,c=o.length;a<c;a++)o[a].updateWorldMatrix(!1,!0,r)}}toJSON(t){let i=t===void 0||typeof t=="string",r={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(c=>st(Ae({},c),{boundingBox:c.boundingBox?c.boundingBox.toJSON():void 0,boundingSphere:c.boundingSphere?c.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(c=>Ae({},c)),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function o(c,l){return c[l.uuid]===void 0&&(c[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=o(t.geometries,this.geometry);let c=this.geometry.parameters;if(c!==void 0&&c.shapes!==void 0){let l=c.shapes;if(Array.isArray(l))for(let u=0,d=l.length;u<d;u++){let f=l[u];o(t.shapes,f)}else o(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(o(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let c=[];for(let l=0,u=this.material.length;l<u;l++)c.push(o(t.materials,this.material[l]));s.material=c}else s.material=o(t.materials,this.material);if(this.children.length>0){s.children=[];for(let c=0;c<this.children.length;c++)s.children.push(this.children[c].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let c=0;c<this.animations.length;c++){let l=this.animations[c];s.animations.push(o(t.animations,l))}}if(i){let c=a(t.geometries),l=a(t.materials),u=a(t.textures),d=a(t.images),f=a(t.shapes),h=a(t.skeletons),p=a(t.animations),v=a(t.nodes);c.length>0&&(r.geometries=c),l.length>0&&(r.materials=l),u.length>0&&(r.textures=u),d.length>0&&(r.images=d),f.length>0&&(r.shapes=f),h.length>0&&(r.skeletons=h),p.length>0&&(r.animations=p),v.length>0&&(r.nodes=v)}return r.object=s,r;function a(c){let l=[];for(let u in c){let d=c[u];delete d.metadata,l.push(d)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let r=0;r<t.children.length;r++){let s=t.children[r];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}return n.DEFAULT_UP=new A(0,1,0),n.DEFAULT_MATRIX_AUTO_UPDATE=!0,n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0,n})(),Pi=class extends Eo{constructor(){super(),this.isGroup=!0,this.type="Group"}},uV={type:"move"},lc=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Pi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Pi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new A,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new A),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Pi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new A,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new A,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let v of e.hand.values()){let m=t.getJointPose(v,i),g=this._getHandJoint(l,v);m!==null&&(g.matrix.fromArray(m.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=m.radius),g.visible=m!==null}let u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=u.position.distanceTo(d.position),h=.02,p=.005;l.inputState.pinching&&f>h+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=h-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(uV)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Pi;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},XA={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},us={h:0,s:0,l:0},Hh={h:0,s:0,l:0};function _0(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var nt=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Pn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,tt.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=tt.workingColorSpace){if(e=_x(e,1),t=Ge(t,0,1),i=Ge(i,0,1),t===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=_0(o,s,e+1/3),this.g=_0(o,s,e),this.b=_0(o,s,e-1/3)}return tt.colorSpaceToWorking(this,r),this}setStyle(e,t=Pn){function i(s){s!==void 0&&parseFloat(s)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s,o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Pn){let i=XA[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Rr(e.r),this.g=Rr(e.g),this.b=Rr(e.b),this}copyLinearToSRGB(e){return this.r=ic(e.r),this.g=ic(e.g),this.b=ic(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Pn){return tt.workingToColorSpace(Sn.copy(this),e),Math.round(Ge(Sn.r*255,0,255))*65536+Math.round(Ge(Sn.g*255,0,255))*256+Math.round(Ge(Sn.b*255,0,255))}getHexString(e=Pn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(Sn.copy(this),t);let i=Sn.r,r=Sn.g,s=Sn.b,o=Math.max(i,r,s),a=Math.min(i,r,s),c,l,u=(a+o)/2;if(a===o)c=0,l=0;else{let d=o-a;switch(l=u<=.5?d/(o+a):d/(2-o-a),o){case i:c=(r-s)/d+(r<s?6:0);break;case r:c=(s-i)/d+2;break;case s:c=(i-r)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(Sn.copy(this),t),e.r=Sn.r,e.g=Sn.g,e.b=Sn.b,e}getStyle(e=Pn){tt.workingToColorSpace(Sn.copy(this),e);let t=Sn.r,i=Sn.g,r=Sn.b;return e!==Pn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(us),this.setHSL(us.h+e,us.s+t,us.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(us),e.getHSL(Hh);let i=Ql(us.h,Hh.h,t),r=Ql(us.s,Hh.s,t),s=Ql(us.l,Hh.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Sn=new nt;nt.NAMES=XA;var G0=class extends Eo{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new lu,this.environmentIntensity=1,this.environmentRotation=new lu,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Di=new A,Cr=new A,x0=new A,Dr=new A,$a=new A,qa=new A,XD=new A,b0=new A,M0=new A,S0=new A,E0=new mt,w0=new mt,T0=new mt,ps=class n{constructor(e=new A,t=new A,i=new A){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Di.subVectors(e,t),r.cross(Di);let s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Di.subVectors(r,t),Cr.subVectors(i,t),x0.subVectors(e,t);let o=Di.dot(Di),a=Di.dot(Cr),c=Di.dot(x0),l=Cr.dot(Cr),u=Cr.dot(x0),d=o*l-a*a;if(d===0)return s.set(0,0,0),null;let f=1/d,h=(l*c-a*u)*f,p=(o*u-a*c)*f;return s.set(1-h-p,p,h)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,Dr)===null?!1:Dr.x>=0&&Dr.y>=0&&Dr.x+Dr.y<=1}static getInterpolation(e,t,i,r,s,o,a,c){return this.getBarycoord(e,t,i,r,Dr)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,Dr.x),c.addScaledVector(o,Dr.y),c.addScaledVector(a,Dr.z),c)}static getInterpolatedAttribute(e,t,i,r,s,o){return E0.setScalar(0),w0.setScalar(0),T0.setScalar(0),E0.fromBufferAttribute(e,t),w0.fromBufferAttribute(e,i),T0.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(E0,s.x),o.addScaledVector(w0,s.y),o.addScaledVector(T0,s.z),o}static isFrontFacing(e,t,i,r){return Di.subVectors(i,t),Cr.subVectors(e,t),Di.cross(Cr).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Di.subVectors(this.c,this.b),Cr.subVectors(this.a,this.b),Di.cross(Cr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,s=this.c,o,a;$a.subVectors(r,i),qa.subVectors(s,i),b0.subVectors(e,i);let c=$a.dot(b0),l=qa.dot(b0);if(c<=0&&l<=0)return t.copy(i);M0.subVectors(e,r);let u=$a.dot(M0),d=qa.dot(M0);if(u>=0&&d<=u)return t.copy(r);let f=c*d-u*l;if(f<=0&&c>=0&&u<=0)return o=c/(c-u),t.copy(i).addScaledVector($a,o);S0.subVectors(e,s);let h=$a.dot(S0),p=qa.dot(S0);if(p>=0&&h<=p)return t.copy(s);let v=h*l-c*p;if(v<=0&&l>=0&&p<=0)return a=l/(l-p),t.copy(i).addScaledVector(qa,a);let m=u*p-h*d;if(m<=0&&d-u>=0&&h-p>=0)return XD.subVectors(s,r),a=(d-u)/(d-u+(h-p)),t.copy(r).addScaledVector(XD,a);let g=1/(m+v+f);return o=v*g,a=f*g,t.copy(i).addScaledVector($a,o).addScaledVector(qa,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ti=class{constructor(e=new A(1/0,1/0,1/0),t=new A(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Ai.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Ai.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Ai.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Ai):Ai.fromBufferAttribute(s,o),Ai.applyMatrix4(e.matrixWorld),this.expandByPoint(Ai);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),zh.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),zh.copy(i.boundingBox)),zh.applyMatrix4(e.matrixWorld),this.union(zh)}let r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ai),Ai.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Xl),Gh.subVectors(this.max,Xl),Xa.subVectors(e.a,Xl),Ya.subVectors(e.b,Xl),Za.subVectors(e.c,Xl),ds.subVectors(Ya,Xa),fs.subVectors(Za,Ya),po.subVectors(Xa,Za);let t=[0,-ds.z,ds.y,0,-fs.z,fs.y,0,-po.z,po.y,ds.z,0,-ds.x,fs.z,0,-fs.x,po.z,0,-po.x,-ds.y,ds.x,0,-fs.y,fs.x,0,-po.y,po.x,0];return!C0(t,Xa,Ya,Za,Gh)||(t=[1,0,0,0,1,0,0,0,1],!C0(t,Xa,Ya,Za,Gh))?!1:(jh.crossVectors(ds,fs),t=[jh.x,jh.y,jh.z],C0(t,Xa,Ya,Za,Gh))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ai).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ai).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ar[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ar[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ar[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ar[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ar[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ar[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ar[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ar[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ar),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ar=[new A,new A,new A,new A,new A,new A,new A,new A],Ai=new A,zh=new ti,Xa=new A,Ya=new A,Za=new A,ds=new A,fs=new A,po=new A,Xl=new A,Gh=new A,jh=new A,mo=new A;function C0(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){mo.fromArray(n,s);let a=r.x*Math.abs(mo.x)+r.y*Math.abs(mo.y)+r.z*Math.abs(mo.z),c=e.dot(mo),l=t.dot(mo),u=i.dot(mo);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Wt=new A,Wh=new pe,dV=0,Fn=class extends rr{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:dV++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=yx,this.updateRanges=[],this.gpuType=Li,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Wh.fromBufferAttribute(this,t),Wh.applyMatrix3(e),this.setXY(t,Wh.x,Wh.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Wt.fromBufferAttribute(this,t),Wt.applyMatrix3(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Wt.fromBufferAttribute(this,t),Wt.applyMatrix4(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Wt.fromBufferAttribute(this,t),Wt.applyNormalMatrix(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Wt.fromBufferAttribute(this,t),Wt.transformDirection(e),this.setXYZ(t,Wt.x,Wt.y,Wt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ri(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=pt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ri(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ri(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ri(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ri(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array),r=pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array),r=pt(r,this.array),s=pt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var du=class extends Fn{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var fu=class extends Fn{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var Ct=class extends Fn{constructor(e,t,i){super(new Float32Array(e),t,i)}},fV=new ti,Yl=new A,D0=new A,or=class{constructor(e=new A,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):fV.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Yl.subVectors(e,this.center);let t=Yl.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Yl,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(D0.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Yl.copy(e.center).add(D0)),this.expandByPoint(Yl.copy(e.center).sub(D0))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},hV=0,hi=new Rt,A0=new Eo,Ja=new A,ei=new ti,Zl=new ti,nn=new A,on=class n extends rr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:hV++}),this.uuid=nr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(kB(e)?fu:du)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new He().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return hi.makeRotationFromQuaternion(e),this.applyMatrix4(hi),this}rotateX(e){return hi.makeRotationX(e),this.applyMatrix4(hi),this}rotateY(e){return hi.makeRotationY(e),this.applyMatrix4(hi),this}rotateZ(e){return hi.makeRotationZ(e),this.applyMatrix4(hi),this}translate(e,t,i){return hi.makeTranslation(e,t,i),this.applyMatrix4(hi),this}scale(e,t,i){return hi.makeScale(e,t,i),this.applyMatrix4(hi),this}lookAt(e){return A0.lookAt(e),A0.updateMatrix(),this.applyMatrix4(A0.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ja).negate(),this.translate(Ja.x,Ja.y,Ja.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let r=0,s=e.length;r<s;r++){let o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ct(i,3))}else{let i=Math.min(e.length,t.count);for(let r=0;r<i;r++){let s=e[r];t.setXYZ(r,s.x,s.y,s.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new A(-1/0,-1/0,-1/0),new A(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let s=t[i];ei.setFromBufferAttribute(s),this.morphTargetsRelative?(nn.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(nn),nn.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(nn)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ue('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new or);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ue("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new A,1/0);return}if(e){let i=this.boundingSphere.center;if(ei.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){let a=t[s];Zl.setFromBufferAttribute(a),this.morphTargetsRelative?(nn.addVectors(ei.min,Zl.min),ei.expandByPoint(nn),nn.addVectors(ei.max,Zl.max),ei.expandByPoint(nn)):(ei.expandByPoint(Zl.min),ei.expandByPoint(Zl.max))}ei.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)nn.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(nn));if(t)for(let s=0,o=t.length;s<o;s++){let a=t[s],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)nn.fromBufferAttribute(a,l),c&&(Ja.fromBufferAttribute(e,l),nn.add(Ja)),r=Math.max(r,i.distanceToSquared(nn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Ue('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ue("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,s=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new Fn(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let x=0;x<i.count;x++)a[x]=new A,c[x]=new A;let l=new A,u=new A,d=new A,f=new pe,h=new pe,p=new pe,v=new A,m=new A;function g(x,C,F){l.fromBufferAttribute(i,x),u.fromBufferAttribute(i,C),d.fromBufferAttribute(i,F),f.fromBufferAttribute(s,x),h.fromBufferAttribute(s,C),p.fromBufferAttribute(s,F),u.sub(l),d.sub(l),h.sub(f),p.sub(f);let L=1/(h.x*p.y-p.x*h.y);isFinite(L)&&(v.copy(u).multiplyScalar(p.y).addScaledVector(d,-h.y).multiplyScalar(L),m.copy(d).multiplyScalar(h.x).addScaledVector(u,-p.x).multiplyScalar(L),a[x].add(v),a[C].add(v),a[F].add(v),c[x].add(m),c[C].add(m),c[F].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let x=0,C=M.length;x<C;++x){let F=M[x],L=F.start,P=F.count;for(let z=L,O=L+P;z<O;z+=3)g(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let w=new A,_=new A,S=new A,E=new A;function D(x){S.fromBufferAttribute(r,x),E.copy(S);let C=a[x];w.copy(C),w.sub(S.multiplyScalar(S.dot(C))).normalize(),_.crossVectors(E,C);let L=_.dot(c[x])<0?-1:1;o.setXYZW(x,w.x,w.y,w.z,L)}for(let x=0,C=M.length;x<C;++x){let F=M[x],L=F.start,P=F.count;for(let z=L,O=L+P;z<O;z+=3)D(e.getX(z+0)),D(e.getX(z+1)),D(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Fn(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,h=i.count;f<h;f++)i.setXYZ(f,0,0,0);let r=new A,s=new A,o=new A,a=new A,c=new A,l=new A,u=new A,d=new A;if(e)for(let f=0,h=e.count;f<h;f+=3){let p=e.getX(f+0),v=e.getX(f+1),m=e.getX(f+2);r.fromBufferAttribute(t,p),s.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),a.fromBufferAttribute(i,p),c.fromBufferAttribute(i,v),l.fromBufferAttribute(i,m),a.add(u),c.add(u),l.add(u),i.setXYZ(p,a.x,a.y,a.z),i.setXYZ(v,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,h=t.count;f<h;f+=3)r.fromBufferAttribute(t,f+0),s.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),u.subVectors(o,s),d.subVectors(r,s),u.cross(d),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)nn.fromBufferAttribute(e,t),nn.normalize(),e.setXYZ(t,nn.x,nn.y,nn.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,d=a.normalized,f=new l.constructor(c.length*u),h=0,p=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?h=c[v]*a.data.stride+a.offset:h=c[v]*u;for(let g=0;g<u;g++)f[p++]=l[h++]}return new Fn(f,u,d)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let c=r[a],l=e(c,i);t.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let c=[],l=s[a];for(let u=0,d=l.length;u<d;u++){let f=l[u],h=e(f,i);c.push(h)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let r={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let d=0,f=l.length;d<f;d++){let h=l[d];u.push(h.toJSON(e.data))}u.length>0&&(r[c]=u,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let r=e.attributes;for(let l in r){let u=r[l];this.setAttribute(l,u.clone(t))}let s=e.morphAttributes;for(let l in s){let u=[],d=s[l];for(let f=0,h=d.length;f<h;f++)u.push(d[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,u=o.length;l<u;l++){let d=o[l];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},hu=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=yx,this.updateRanges=[],this.version=0,this.uuid=nr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=nr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=nr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Nn=new A,pi=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Nn.fromBufferAttribute(this,t),Nn.applyMatrix4(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Nn.fromBufferAttribute(this,t),Nn.applyNormalMatrix(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Nn.fromBufferAttribute(this,t),Nn.transformDirection(e),this.setXYZ(t,Nn.x,Nn.y,Nn.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Ri(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=pt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ri(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ri(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ri(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ri(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array),r=pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),i=pt(i,this.array),r=pt(r,this.array),s=pt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){au("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Fn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){au("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},I0=new A,pV=new A,mV=new He,Ii=class{constructor(e=new A(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=I0.subVectors(i,t).cross(pV.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let r=e.delta(I0),s=this.normal.dot(r);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(r,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||mV.getNormalMatrix(e),r=this.coplanarPoint(I0).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},gV=0,_o=class extends rr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:gV++}),this.uuid=nr(),this.name="",this.type="Material",this.blending=pc,this.side=cr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Q0,this.blendDst=ex,this.blendEquation=Mo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new nt(0,0,0),this.blendAlpha=0,this.depthFunc=sc,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=kA,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=cp,this.stencilZFail=cp,this.stencilZPass=cp,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector2&&i&&i.isVector2||r&&r.isEuler&&i&&i.isEuler||r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){let o=[];for(let a in s){let c=s[a];delete c.metadata,o.push(c)}return o}if(t){let s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new nt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new Ii().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new pe().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new pe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Ir=new A,R0=new A,$h=new A,qh=new A,Mp=class{constructor(e=new A,t=new A(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ir)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ir.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ir.copy(this.origin).addScaledVector(this.direction,t),Ir.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){R0.copy(e).add(t).multiplyScalar(.5),$h.copy(t).sub(e).normalize(),qh.copy(this.origin).sub(R0);let s=e.distanceTo(t)*.5,o=-this.direction.dot($h),a=qh.dot(this.direction),c=-qh.dot($h),l=qh.lengthSq(),u=Math.abs(1-o*o),d,f,h,p;if(u>0)if(d=o*c-a,f=o*a-c,p=s*u,d>=0)if(f>=-p)if(f<=p){let v=1/u;d*=v,f*=v,h=d*(d+o*f+2*a)+f*(o*d+f+2*c)+l}else f=s,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;else f=-s,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;else f<=-p?(d=Math.max(0,-(-o*s+a)),f=d>0?-s:Math.min(Math.max(-s,-c),s),h=-d*d+f*(f+2*c)+l):f<=p?(d=0,f=Math.min(Math.max(-s,-c),s),h=f*(f+2*c)+l):(d=Math.max(0,-(o*s+a)),f=d>0?s:Math.min(Math.max(-s,-c),s),h=-d*d+f*(f+2*c)+l);else f=o>0?-s:s,d=Math.max(0,-(o*f+a)),h=-d*d+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(R0).addScaledVector($h,f),h}intersectSphere(e,t){if(e.radius<0)return null;Ir.subVectors(e.center,this.origin);let i=Ir.dot(this.direction),r=Ir.dot(Ir)-i*i,s=e.radius*e.radius;if(r>s)return null;let o=Math.sqrt(s-r),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,c,l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(i=(e.min.x-f.x)*l,r=(e.max.x-f.x)*l):(i=(e.max.x-f.x)*l,r=(e.min.x-f.x)*l),u>=0?(s=(e.min.y-f.y)*u,o=(e.max.y-f.y)*u):(s=(e.max.y-f.y)*u,o=(e.min.y-f.y)*u),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),d>=0?(a=(e.min.z-f.z)*d,c=(e.max.z-f.z)*d):(a=(e.max.z-f.z)*d,c=(e.min.z-f.z)*d),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Ir)!==null}intersectTriangle(e,t,i,r,s){let o=this.origin,a=this.direction,c=a.x,l=a.y,u=a.z,d=e.x-o.x,f=e.y-o.y,h=e.z-o.z,p=t.x-o.x,v=t.y-o.y,m=t.z-o.z,g=i.x-o.x,M=i.y-o.y,w=i.z-o.z,_=Math.abs(c),S=Math.abs(l),E=Math.abs(u),D,x,C,F,L,P,z,O,V,J,j,te;if(_>=S&&_>=E?(C=c,P=d,V=p,te=g,c>=0?(D=l,x=u,F=f,L=h,z=v,O=m,J=M,j=w):(D=u,x=l,F=h,L=f,z=m,O=v,J=w,j=M)):S>=E?(C=l,P=f,V=v,te=M,l>=0?(D=u,x=c,F=h,L=d,z=m,O=p,J=w,j=g):(D=c,x=u,F=d,L=h,z=p,O=m,J=g,j=w)):(C=u,P=h,V=m,te=w,u>=0?(D=c,x=l,F=d,L=f,z=p,O=v,J=g,j=M):(D=l,x=c,F=f,L=d,z=v,O=p,J=M,j=g)),C===0)return null;let W=D/C,Y=x/C,ne=1/C,Ne=F-W*P,Ce=L-Y*P,St=z-W*V,rt=O-Y*V,lt=J-W*te,q=j-Y*te,Q=lt*rt-q*St,_e=Ne*q-Ce*lt,ze=St*Ce-rt*Ne;if(r){if(Q<0||_e<0||ze<0)return null}else if((Q<0||_e<0||ze<0)&&(Q>0||_e>0||ze>0))return null;let ge=Q+_e+ze;if(ge===0)return null;let Xe=ne*(Q*P+_e*V+ze*te);return(ge>0?Xe<0:Xe>0)?null:this.at(Xe/ge,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},an=class extends _o{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new nt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new lu,this.combine=tx,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},YD=new Rt,go=new Mp,Xh=new or,ZD=new A,Yh=new A,Zh=new A,Jh=new A,N0=new A,Kh=new A,JD=new A,Qh=new A,vt=class extends Eo{constructor(e=new on,t=new an){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){let a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(s&&a){Kh.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let u=a[c],d=s[c];u!==0&&(N0.fromBufferAttribute(d,e),o?Kh.addScaledVector(N0,u):Kh.addScaledVector(N0.sub(t),u))}t.add(Kh)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Xh.copy(i.boundingSphere),Xh.applyMatrix4(s),go.copy(e.ray).recast(e.near),!(Xh.containsPoint(go.origin)===!1&&(go.intersectSphere(Xh,ZD)===null||go.origin.distanceToSquared(ZD)>(e.far-e.near)**2))&&(YD.copy(s).invert(),go.copy(e.ray).applyMatrix4(YD),!(i.boundingBox!==null&&go.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,go)))}_computeIntersections(e,t,i){let r,s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,u=s.attributes.uv1,d=s.attributes.normal,f=s.groups,h=s.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,v=f.length;p<v;p++){let m=f[p],g=o[m.materialIndex],M=Math.max(m.start,h.start),w=Math.min(a.count,Math.min(m.start+m.count,h.start+h.count));for(let _=M,S=w;_<S;_+=3){let E=a.getX(_),D=a.getX(_+1),x=a.getX(_+2);r=ep(this,g,e,i,l,u,d,E,D,x),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let p=Math.max(0,h.start),v=Math.min(a.count,h.start+h.count);for(let m=p,g=v;m<g;m+=3){let M=a.getX(m),w=a.getX(m+1),_=a.getX(m+2);r=ep(this,o,e,i,l,u,d,M,w,_),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,v=f.length;p<v;p++){let m=f[p],g=o[m.materialIndex],M=Math.max(m.start,h.start),w=Math.min(c.count,Math.min(m.start+m.count,h.start+h.count));for(let _=M,S=w;_<S;_+=3){let E=_,D=_+1,x=_+2;r=ep(this,g,e,i,l,u,d,E,D,x),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{let p=Math.max(0,h.start),v=Math.min(c.count,h.start+h.count);for(let m=p,g=v;m<g;m+=3){let M=m,w=m+1,_=m+2;r=ep(this,o,e,i,l,u,d,M,w,_),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}};function yV(n,e,t,i,r,s,o,a){let c;if(e.side===Ln?c=i.intersectTriangle(o,s,r,!0,a):c=i.intersectTriangle(r,s,o,e.side===cr,a),c===null)return null;Qh.copy(a),Qh.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Qh);return l<t.near||l>t.far?null:{distance:l,point:Qh.clone(),object:n}}function ep(n,e,t,i,r,s,o,a,c,l){n.getVertexPosition(a,Yh),n.getVertexPosition(c,Zh),n.getVertexPosition(l,Jh);let u=yV(n,e,t,i,Yh,Zh,Jh,JD);if(u){let d=new A;ps.getBarycoord(JD,Yh,Zh,Jh,d),r&&(u.uv=ps.getInterpolatedAttribute(r,a,c,l,d,new pe)),s&&(u.uv1=ps.getInterpolatedAttribute(s,a,c,l,d,new pe)),o&&(u.normal=ps.getInterpolatedAttribute(o,a,c,l,d,new A),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:c,c:l,normal:new A,materialIndex:0};ps.getNormal(Yh,Zh,Jh,f.normal),u.face=f,u.barycoord=d}return u}var Sp=class extends gi{constructor(e=null,t=1,i=1,r,s,o,a,c,l=Ht,u=Ht,d,f){super(null,o,a,c,l,u,r,s,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var yo=new or,vV=new pe(.5,.5),tp=new A,pu=class{constructor(e=new Ii,t=new Ii,i=new Ii,r=new Ii,s=new Ii,o=new Ii){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Ni,i=!1){let r=this.planes,s=e.elements,o=s[0],a=s[1],c=s[2],l=s[3],u=s[4],d=s[5],f=s[6],h=s[7],p=s[8],v=s[9],m=s[10],g=s[11],M=s[12],w=s[13],_=s[14],S=s[15];if(r[0].setComponents(l-o,h-u,g-p,S-M).normalize(),r[1].setComponents(l+o,h+u,g+p,S+M).normalize(),r[2].setComponents(l+a,h+d,g+v,S+w).normalize(),r[3].setComponents(l-a,h-d,g-v,S-w).normalize(),i)r[4].setComponents(c,f,m,_).normalize(),r[5].setComponents(l-c,h-f,g-m,S-_).normalize();else if(r[4].setComponents(l-c,h-f,g-m,S-_).normalize(),t===Ni)r[5].setComponents(l+c,h+f,g+m,S+_).normalize();else if(t===su)r[5].setComponents(c,f,m,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),yo.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),yo.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(yo)}intersectsSprite(e){yo.center.set(0,0,0);let t=vV.distanceTo(e.center);return yo.radius=.7071067811865476+t,yo.applyMatrix4(e.matrixWorld),this.intersectsSphere(yo)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(tp.x=r.normal.x>0?e.max.x:e.min.x,tp.y=r.normal.y>0?e.max.y:e.min.y,tp.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(tp)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var mu=class extends gi{constructor(e=[],t=bs,i,r,s,o,a,c,l,u){super(e,t,i,r,s,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},gu=class extends gi{constructor(e,t,i,r,s,o,a,c,l){super(e,t,i,r,s,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ms=class extends gi{constructor(e,t,i=Oi,r,s,o,a=Ht,c=Ht,l,u=ir,d=1){if(u!==ir&&u!==Ss)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:d};super(f,r,s,o,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new cc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ep=class extends ms{constructor(e,t=Oi,i=bs,r,s,o=Ht,a=Ht,c,l=ir){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,i,r,s,o,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},yu=class extends gi{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},uc=class n extends on{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};let a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);let c=[],l=[],u=[],d=[],f=0,h=0;p("z","y","x",-1,-1,i,t,e,o,s,0),p("z","y","x",1,-1,i,t,-e,o,s,1),p("x","z","y",1,1,e,i,t,r,o,2),p("x","z","y",1,-1,e,i,-t,r,o,3),p("x","y","z",1,-1,e,t,i,r,s,4),p("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(c),this.setAttribute("position",new Ct(l,3)),this.setAttribute("normal",new Ct(u,3)),this.setAttribute("uv",new Ct(d,2));function p(v,m,g,M,w,_,S,E,D,x,C){let F=_/D,L=S/x,P=_/2,z=S/2,O=E/2,V=D+1,J=x+1,j=0,te=0,W=new A;for(let Y=0;Y<J;Y++){let ne=Y*L-z;for(let Ne=0;Ne<V;Ne++){let Ce=Ne*F-P;W[v]=Ce*M,W[m]=ne*w,W[g]=O,l.push(W.x,W.y,W.z),W[v]=0,W[m]=0,W[g]=E>0?1:-1,u.push(W.x,W.y,W.z),d.push(Ne/D),d.push(1-Y/x),j+=1}}for(let Y=0;Y<x;Y++)for(let ne=0;ne<D;ne++){let Ne=f+ne+V*Y,Ce=f+ne+V*(Y+1),St=f+(ne+1)+V*(Y+1),rt=f+(ne+1)+V*Y;c.push(Ne,Ce,rt),c.push(Ce,St,rt),te+=6}a.addGroup(h,te,C),h+=te,f+=j}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var vu=class n extends on{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let s=[],o=[],a=[],c=[],l=new A,u=new pe;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let d=0,f=3;d<=t;d++,f+=3){let h=i+d/t*r;l.x=e*Math.cos(h),l.y=e*Math.sin(h),o.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(o[f]/e+1)/2,u.y=(o[f+1]/e+1)/2,c.push(u.x,u.y)}for(let d=1;d<=t;d++)s.push(d,d+1,0);this.setIndex(s),this.setAttribute("position",new Ct(o,3)),this.setAttribute("normal",new Ct(a,3)),this.setAttribute("uv",new Ct(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var ni=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Le("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),r=0,s=i.length,o;t?o=t:o=e*i[s-1];let a=0,c=s-1,l;for(;a<=c;)if(r=Math.floor(a+(c-a)/2),l=i[r]-o,l<0)a=r+1;else if(l>0)c=r-1;else{c=r;break}if(r=c,i[r]===o)return r/(s-1);let u=i[r],f=i[r+1]-u,h=(o-u)/f;return(r+h)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);let o=this.getPoint(r),a=this.getPoint(s),c=t||(o.isVector2?new pe:new A);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new A,r=[],s=[],o=[],a=new A,c=new Rt;for(let h=0;h<=e;h++){let p=h/e;r[h]=this.getTangentAt(p,new A)}s[0]=new A,o[0]=new A;let l=Number.MAX_VALUE,u=Math.abs(r[0].x),d=Math.abs(r[0].y),f=Math.abs(r[0].z);u<=l&&(l=u,i.set(1,0,0)),d<=l&&(l=d,i.set(0,1,0)),f<=l&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let h=1;h<=e;h++){if(s[h]=s[h-1].clone(),o[h]=o[h-1].clone(),a.crossVectors(r[h-1],r[h]),a.length()>Number.EPSILON){a.normalize();let p=Math.acos(Ge(r[h-1].dot(r[h]),-1,1));s[h].applyMatrix4(c.makeRotationAxis(a,p))}o[h].crossVectors(r[h],s[h])}if(t===!0){let h=Math.acos(Ge(s[0].dot(s[e]),-1,1));h/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(h=-h);for(let p=1;p<=e;p++)s[p].applyMatrix4(c.makeRotationAxis(r[p],h*p)),o[p].crossVectors(r[p],s[p])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},dc=class extends ni{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new pe){let i=t,r=Math.PI*2,s=this.aEndAngle-this.aStartAngle,o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);let a=this.aStartAngle+e*s,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=c-this.aX,h=l-this.aY;c=f*u-h*d+this.aX,l=f*d+h*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},wp=class extends dc{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}};function bx(){let n=0,e=0,t=0,i=0;function r(s,o,a,c){n=s,e=a,t=-3*s+3*o-2*a-c,i=2*s-2*o+a+c}return{initCatmullRom:function(s,o,a,c,l){r(o,a,l*(a-s),l*(c-o))},initNonuniformCatmullRom:function(s,o,a,c,l,u,d){let f=(o-s)/l-(a-s)/(l+u)+(a-o)/u,h=(a-o)/u-(c-o)/(u+d)+(c-a)/d;f*=u,h*=u,r(o,a,f,h)},calc:function(s){let o=s*s,a=o*s;return n+e*s+t*o+i*a}}}var KD=new A,QD=new A,P0=new bx,F0=new bx,O0=new bx,Tp=class extends ni{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new A){let i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:c===0&&a===s-1&&(a=s-2,c=1);let l,u;this.closed||a>0?l=r[(a-1)%s]:(QD.subVectors(r[0],r[1]).add(r[0]),l=QD);let d=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?u=r[(a+2)%s]:(KD.subVectors(r[s-1],r[s-2]).add(r[s-1]),u=KD),this.curveType==="centripetal"||this.curveType==="chordal"){let h=this.curveType==="chordal"?.5:.25,p=Math.pow(l.distanceToSquared(d),h),v=Math.pow(d.distanceToSquared(f),h),m=Math.pow(f.distanceToSquared(u),h);v<1e-4&&(v=1),p<1e-4&&(p=v),m<1e-4&&(m=v),P0.initNonuniformCatmullRom(l.x,d.x,f.x,u.x,p,v,m),F0.initNonuniformCatmullRom(l.y,d.y,f.y,u.y,p,v,m),O0.initNonuniformCatmullRom(l.z,d.z,f.z,u.z,p,v,m)}else this.curveType==="catmullrom"&&(P0.initCatmullRom(l.x,d.x,f.x,u.x,this.tension),F0.initCatmullRom(l.y,d.y,f.y,u.y,this.tension),O0.initCatmullRom(l.z,d.z,f.z,u.z,this.tension));return i.set(P0.calc(c),F0.calc(c),O0.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new A().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function eA(n,e,t,i,r){let s=(i-e)*.5,o=(r-t)*.5,a=n*n,c=n*a;return(2*t-2*i+s+o)*c+(-3*t+3*i-2*s-o)*a+s*n+t}function _V(n,e){let t=1-n;return t*t*e}function xV(n,e){return 2*(1-n)*n*e}function bV(n,e){return n*n*e}function eu(n,e,t,i){return _V(n,e)+xV(n,t)+bV(n,i)}function MV(n,e){let t=1-n;return t*t*t*e}function SV(n,e){let t=1-n;return 3*t*t*n*e}function EV(n,e){return 3*(1-n)*n*n*e}function wV(n,e){return n*n*n*e}function tu(n,e,t,i,r){return MV(n,e)+SV(n,t)+EV(n,i)+wV(n,r)}var _u=class extends ni{constructor(e=new pe,t=new pe,i=new pe,r=new pe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new pe){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(tu(e,r.x,s.x,o.x,a.x),tu(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Cp=class extends ni{constructor(e=new A,t=new A,i=new A,r=new A){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new A){let i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(tu(e,r.x,s.x,o.x,a.x),tu(e,r.y,s.y,o.y,a.y),tu(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},xu=class extends ni{constructor(e=new pe,t=new pe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new pe){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new pe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Dp=class extends ni{constructor(e=new A,t=new A){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new A){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new A){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},bu=class extends ni{constructor(e=new pe,t=new pe,i=new pe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new pe){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(eu(e,r.x,s.x,o.x),eu(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ap=class extends ni{constructor(e=new A,t=new A,i=new A){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new A){let i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(eu(e,r.x,s.x,o.x),eu(e,r.y,s.y,o.y),eu(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Mu=class extends ni{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new pe){let i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,c=r[o===0?o:o-1],l=r[o],u=r[o>r.length-2?r.length-1:o+1],d=r[o>r.length-3?r.length-1:o+2];return i.set(eA(a,c.x,l.x,u.x,d.x),eA(a,c.y,l.y,u.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new pe().fromArray(r))}return this}},tA=Object.freeze({__proto__:null,ArcCurve:wp,CatmullRomCurve3:Tp,CubicBezierCurve:_u,CubicBezierCurve3:Cp,EllipseCurve:dc,LineCurve:xu,LineCurve3:Dp,QuadraticBezierCurve:bu,QuadraticBezierCurve3:Ap,SplineCurve:Mu}),Ip=class extends ni{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new tA[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),s=0;for(;s<r.length;){if(r[s]>=i){let o=r[s]-i,a=this.curves[s],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}s++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,s=this.curves;r<s.length;r++){let o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new tA[r.type]().fromJSON(r))}return this}},Su=class extends Ip{constructor(e){super(),this.type="Path",this.currentPoint=new pe,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new xu(this.currentPoint.clone(),new pe(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let s=new bu(this.currentPoint.clone(),new pe(e,t),new pe(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){let a=new _u(this.currentPoint.clone(),new pe(e,t),new pe(i,r),new pe(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Mu(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,r,s,o,a,c),this}absellipse(e,t,i,r,s,o,a,c){let l=new dc(e,t,i,r,s,o,a,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},gs=class extends Su{constructor(e){super(e),this.uuid=nr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new Su().fromJSON(r))}return this}};function TV(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,s=YA(n,0,r,t,!0),o=[];if(!s||s.next===s.prev)return o;let a,c,l;if(i&&(s=RV(n,e,s,t)),n.length>80*t){a=n[0],c=n[1];let u=a,d=c;for(let f=t;f<r;f+=t){let h=n[f],p=n[f+1];h<a&&(a=h),p<c&&(c=p),h>u&&(u=h),p>d&&(d=p)}l=Math.max(u-a,d-c),l=l!==0?32767/l:0}return Eu(s,o,t,a,c,l,0),o}function YA(n,e,t,i,r){let s;if(r===zV(n,e,t,i)>0)for(let o=e;o<t;o+=i)s=nA(o/i|0,n[o],n[o+1],s);else for(let o=t-i;o>=e;o-=i)s=nA(o/i|0,n[o],n[o+1],s);return s&&fc(s,s.next)&&(Tu(s),s=s.next),s}function xo(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(fc(t,t.next)||Pt(t.prev,t,t.next)===0)){if(Tu(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Eu(n,e,t,i,r,s,o){if(!n)return;!o&&s&&LV(n,i,r,s);let a=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(s?DV(n,i,r,s):CV(n)){e.push(c.i,n.i,l.i),Tu(n),n=l.next,a=l.next;continue}if(n=l,n===a){o?o===1?(n=AV(xo(n),e),Eu(n,e,t,i,r,s,2)):o===2&&IV(n,e,t,i,r,s):Eu(xo(n),e,t,i,r,s,1);break}}}function CV(n){let e=n.prev,t=n,i=n.next;if(Pt(e,t,i)>=0)return!1;let r=e.x,s=t.x,o=i.x,a=e.y,c=t.y,l=i.y,u=Math.min(r,s,o),d=Math.min(a,c,l),f=Math.max(r,s,o),h=Math.max(a,c,l),p=i.next;for(;p!==e;){if(p.x>=u&&p.x<=f&&p.y>=d&&p.y<=h&&Jl(r,a,s,c,o,l,p.x,p.y)&&Pt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function DV(n,e,t,i){let r=n.prev,s=n,o=n.next;if(Pt(r,s,o)>=0)return!1;let a=r.x,c=s.x,l=o.x,u=r.y,d=s.y,f=o.y,h=Math.min(a,c,l),p=Math.min(u,d,f),v=Math.max(a,c,l),m=Math.max(u,d,f),g=j0(h,p,e,t,i),M=j0(v,m,e,t,i),w=n.prevZ,_=n.nextZ;for(;w&&w.z>=g&&_&&_.z<=M;){if(w.x>=h&&w.x<=v&&w.y>=p&&w.y<=m&&w!==r&&w!==o&&Jl(a,u,c,d,l,f,w.x,w.y)&&Pt(w.prev,w,w.next)>=0||(w=w.prevZ,_.x>=h&&_.x<=v&&_.y>=p&&_.y<=m&&_!==r&&_!==o&&Jl(a,u,c,d,l,f,_.x,_.y)&&Pt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;w&&w.z>=g;){if(w.x>=h&&w.x<=v&&w.y>=p&&w.y<=m&&w!==r&&w!==o&&Jl(a,u,c,d,l,f,w.x,w.y)&&Pt(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;_&&_.z<=M;){if(_.x>=h&&_.x<=v&&_.y>=p&&_.y<=m&&_!==r&&_!==o&&Jl(a,u,c,d,l,f,_.x,_.y)&&Pt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function AV(n,e){let t=n;do{let i=t.prev,r=t.next.next;!fc(i,r)&&JA(i,t,t.next,r)&&wu(i,r)&&wu(r,i)&&(e.push(i.i,t.i,r.i),Tu(t),Tu(t.next),t=n=r),t=t.next}while(t!==n);return xo(t)}function IV(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&BV(o,a)){let c=KA(o,a);o=xo(o,o.next),c=xo(c,c.next),Eu(o,e,t,i,r,s,0),Eu(c,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function RV(n,e,t,i){let r=[];for(let s=0,o=e.length;s<o;s++){let a=e[s]*i,c=s<o-1?e[s+1]*i:n.length,l=YA(n,a,c,i,!1);l===l.next&&(l.steiner=!0),r.push(UV(l))}r.sort(NV);for(let s=0;s<r.length;s++)t=PV(r[s],t);return t}function NV(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=i-r}return t}function PV(n,e){let t=FV(n,e);if(!t)return e;let i=KA(t,n);return xo(i,i.next),xo(t,t.next)}function FV(n,e){let t=e,i=n.x,r=n.y,s=-1/0,o;if(fc(n,t))return t;do{if(fc(n,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){let d=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>s&&(s=d,o=t.x<t.next.x?t:t.next,d===i))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,c=o.x,l=o.y,u=1/0;t=o;do{if(i>=t.x&&t.x>=c&&i!==t.x&&ZA(r<l?i:s,r,c,l,r<l?s:i,r,t.x,t.y)){let d=Math.abs(r-t.y)/(i-t.x);wu(t,n)&&(d<u||d===u&&(t.x>o.x||t.x===o.x&&OV(o,t)))&&(o=t,u=d)}t=t.next}while(t!==a);return o}function OV(n,e){return Pt(n.prev,n,e.prev)<0&&Pt(e.next,n,n.next)<0}function LV(n,e,t,i){let r=n;do r.z===0&&(r.z=j0(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,kV(r)}function kV(n){let e,t=1;do{let i=n,r;n=null;let s=null;for(e=0;i;){e++;let o=i,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||i.z<=o.z)?(r=i,i=i.nextZ,a--):(r=o,o=o.nextZ,c--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;i=o}s.nextZ=null,t*=2}while(e>1);return n}function j0(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function UV(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function ZA(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function Jl(n,e,t,i,r,s,o,a){return!(n===o&&e===a)&&ZA(n,e,t,i,r,s,o,a)}function BV(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!VV(n,e)&&(wu(n,e)&&wu(e,n)&&HV(n,e)&&(Pt(n.prev,n,e.prev)||Pt(n,e.prev,e))||fc(n,e)&&Pt(n.prev,n,n.next)>0&&Pt(e.prev,e,e.next)>0)}function Pt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function fc(n,e){return n.x===e.x&&n.y===e.y}function JA(n,e,t,i){let r=ip(Pt(n,e,t)),s=ip(Pt(n,e,i)),o=ip(Pt(t,i,n)),a=ip(Pt(t,i,e));return!!(r!==s&&o!==a||r===0&&np(n,t,e)||s===0&&np(n,i,e)||o===0&&np(t,n,i)||a===0&&np(t,e,i))}function np(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function ip(n){return n>0?1:n<0?-1:0}function VV(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&JA(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function wu(n,e){return Pt(n.prev,n,n.next)<0?Pt(n,e,n.next)>=0&&Pt(n,n.prev,e)>=0:Pt(n,e,n.prev)<0||Pt(n,n.next,e)<0}function HV(n,e){let t=n,i=!1,r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function KA(n,e){let t=W0(n.i,n.x,n.y),i=W0(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function nA(n,e,t,i){let r=W0(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Tu(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function W0(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function zV(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}var $0=class{static triangulate(e,t,i=2){return TV(e,t,i)}},rc=class n{static area(e){let t=e.length,i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],s=[];iA(e),rA(i,e);let o=e.length;t.forEach(iA);for(let c=0;c<t.length;c++)r.push(o),o+=t[c].length,rA(i,t[c]);let a=$0.triangulate(i,r);for(let c=0;c<a.length;c+=3)s.push(a.slice(c,c+3));return s}};function iA(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function rA(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var ar=class n extends on{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let s=e/2,o=t/2,a=Math.floor(i),c=Math.floor(r),l=a+1,u=c+1,d=e/a,f=t/c,h=[],p=[],v=[],m=[];for(let g=0;g<u;g++){let M=g*f-o;for(let w=0;w<l;w++){let _=w*d-s;p.push(_,-M,0),v.push(0,0,1),m.push(w/a),m.push(1-g/c)}}for(let g=0;g<c;g++)for(let M=0;M<a;M++){let w=M+l*g,_=M+l*(g+1),S=M+1+l*(g+1),E=M+1+l*g;h.push(w,_,E),h.push(_,S,E)}this.setIndex(h),this.setAttribute("position",new Ct(p,3)),this.setAttribute("normal",new Ct(v,3)),this.setAttribute("uv",new Ct(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Cu=class n extends on{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);let a=[],c=[],l=[],u=[],d=e,f=(t-e)/r,h=new A,p=new pe;for(let v=0;v<=r;v++){for(let m=0;m<=i;m++){let g=s+m/i*o;h.x=d*Math.cos(g),h.y=d*Math.sin(g),c.push(h.x,h.y,h.z),l.push(0,0,1),p.x=(h.x/t+1)/2,p.y=(h.y/t+1)/2,u.push(p.x,p.y)}d+=f}for(let v=0;v<r;v++){let m=v*(i+1);for(let g=0;g<i;g++){let M=g+m,w=M,_=M+i+1,S=M+i+2,E=M+1;a.push(w,_,E),a.push(_,S,E)}}this.setIndex(a),this.setAttribute("position",new Ct(c,3)),this.setAttribute("normal",new Ct(l,3)),this.setAttribute("uv",new Ct(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},bo=class n extends on{constructor(e=new gs([new pe(0,.5),new pe(-.5,-.5),new pe(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],s=[],o=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(i),this.setAttribute("position",new Ct(r,3)),this.setAttribute("normal",new Ct(s,3)),this.setAttribute("uv",new Ct(o,2));function l(u){let d=r.length/3,f=u.extractPoints(t),h=f.shape,p=f.holes;rc.isClockWise(h)===!1&&(h=h.reverse());for(let m=0,g=p.length;m<g;m++){let M=p[m];rc.isClockWise(M)===!0&&(p[m]=M.reverse())}let v=rc.triangulateShape(h,p);for(let m=0,g=p.length;m<g;m++){let M=p[m];h=h.concat(M)}for(let m=0,g=h.length;m<g;m++){let M=h[m];r.push(M.x,M.y,0),s.push(0,0,1),o.push(M.x,M.y)}for(let m=0,g=v.length;m<g;m++){let M=v[m],w=M[0]+d,_=M[1]+d,S=M[2]+d;i.push(w,_,S),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return GV(t,e)}static fromJSON(e,t){let i=[];for(let r=0,s=e.shapes.length;r<s;r++){let o=t[e.shapes[r]];i.push(o)}return new n(i,e.curveSegments)}};function GV(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var Du=class extends on{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,r=new A,s=new A;if(e.index!==null){let o=e.attributes.position,a=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){let d=c[l],f=d.start,h=d.count;for(let p=f,v=f+h;p<v;p+=3)for(let m=0;m<3;m++){let g=a.getX(p+m),M=a.getX(p+(m+1)%3);r.fromBufferAttribute(o,g),s.fromBufferAttribute(o,M),sA(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}}else{let o=e.attributes.position;for(let a=0,c=o.count/3;a<c;a++)for(let l=0;l<3;l++){let u=3*a+l,d=3*a+(l+1)%3;r.fromBufferAttribute(o,u),s.fromBufferAttribute(o,d),sA(r,s,i)===!0&&(t.push(r.x,r.y,r.z),t.push(s.x,s.y,s.z))}}this.setAttribute("position",new Ct(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function sA(n,e,t){let i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(r)===!0?!1:(t.add(i),t.add(r),!0)}function wo(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];if(oA(r))r.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone();else if(Array.isArray(r))if(oA(r[0])){let s=[];for(let o=0,a=r.length;o<a;o++)s[o]=r[o].clone();e[t][i]=s}else e[t][i]=r.slice();else e[t][i]=r}}return e}function En(n){let e={};for(let t=0;t<n.length;t++){let i=wo(n[t]);for(let r in i)e[r]=i[r]}return e}function oA(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function jV(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Mx(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var Gu={clone:wo,merge:En},WV=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$V=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,On=class extends _o{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=WV,this.fragmentShader=$V,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=wo(e.uniforms),this.uniformsGroups=jV(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let r=e.uniforms[i];switch(this.uniforms[i]={},r.type){case"t":this.uniforms[i].value=t[r.value]||null;break;case"c":this.uniforms[i].value=new nt().setHex(r.value);break;case"v2":this.uniforms[i].value=new pe().fromArray(r.value);break;case"v3":this.uniforms[i].value=new A().fromArray(r.value);break;case"v4":this.uniforms[i].value=new mt().fromArray(r.value);break;case"m3":this.uniforms[i].value=new He().fromArray(r.value);break;case"m4":this.uniforms[i].value=new Rt().fromArray(r.value);break;default:this.uniforms[i].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Rp=class extends On{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Np=class extends _o{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=OA,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Pp=class extends _o{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ka(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function L0(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var ys=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],s=t[i-1];e:{t:{let o;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break t}o=t.length;break n}if(!(e>=s)){let a=t[1];e<a&&(i=2,s=a);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(r=s,s=t[--i-1],e>=s)break t}o=i,i=0;break n}break e}for(;i<o;){let a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Fp=class extends ys{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:V0,endingEnd:V0}}intervalChanged_(e,t,i){let r=this.parameterPositions,s=e-2,o=e+1,a=r[s],c=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case H0:s=e,a=2*t-i;break;case z0:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case H0:o=e,c=2*i-t;break;case z0:o=1,c=i+r[1]-r[0];break;default:o=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=s*u,this._offsetNext=o*u}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,h=this._weightNext,p=(i-t)/(r-t),v=p*p,m=v*p,g=-f*m+2*f*v-f*p,M=(1+f)*m+(-1.5-2*f)*v+(-.5+f)*p+1,w=(-1-h)*m+(1.5+h)*v+.5*p,_=h*m-h*v;for(let S=0;S!==a;++S)s[S]=g*o[u+S]+M*o[l+S]+w*o[c+S]+_*o[d+S];return s}},Op=class extends ys{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(r-t),d=1-u;for(let f=0;f!==a;++f)s[f]=o[l+f]*d+o[c+f]*u;return s}},Lp=class extends ys{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},kp=class extends ys{interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let p=(i-t)/(r-t),v=1-p;for(let m=0;m!==a;++m)s[m]=o[l+m]*v+o[c+m]*p;return s}let f=a*2,h=e-1;for(let p=0;p!==a;++p){let v=o[l+p],m=o[c+p],g=h*f+p*2,M=d[g],w=d[g+1],_=e*f+p*2,S=u[_],E=u[_+1],D=XV(i,t,M,S,r);s[p]=QA(D,v,w,E,m)}return s}};function QA(n,e,t,i,r){let s=1-n;return s*s*s*e+3*s*s*n*t+3*s*n*n*i+n*n*n*r}function qV(n,e,t,i,r){let s=1-n;return 3*s*s*(t-e)+6*s*n*(i-t)+3*n*n*(r-i)}function XV(n,e,t,i,r){let s=(n-e)/(r-e);for(let o=0;o<8;o++){let a=QA(s,e,t,i,r)-n;if(Math.abs(a)<1e-10)break;let c=qV(s,e,t,i,r);if(Math.abs(c)<1e-10)break;s=Math.max(0,Math.min(1,s-a/c))}return s}var ii=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ka(t,this.TimeBufferType),this.values=Ka(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ka(e.times,Array),values:Ka(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r),L0(e.settings)&&(i.settings={inTangents:Ka(e.settings.inTangents,Array),outTangents:Ka(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Lp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Op(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Fp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new kp(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case nu:t=this.InterpolantFactoryMethodDiscrete;break;case vp:t=this.InterpolantFactoryMethodLinear;break;case ap:t=this.InterpolantFactoryMethodSmooth;break;case B0:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Le("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return nu;case this.InterpolantFactoryMethodLinear:return vp;case this.InterpolantFactoryMethodSmooth:return ap;case this.InterpolantFactoryMethodBezier:return B0}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e;L0(this.settings)&&(aA(this.settings.inTangents,e),aA(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,r=i.length,s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ue("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,s=i.length;s===0&&(Ue("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){Ue("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){Ue("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(r!==void 0&&UB(r))for(let a=0,c=r.length;a!==c;++a){let l=r[a];if(isNaN(l)){Ue("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===ap,s=e.length-1,o=1;for(let a=1;a<s;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(r)c=!0;else{let d=a*i,f=d-i,h=d+i;for(let p=0;p!==i;++p){let v=t[d+p];if(v!==t[f+p]||v!==t[h+p]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let d=a*i,f=o*i;for(let h=0;h!==i;++h)t[f+h]=t[d+h]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,c=o*i,l=0;l!==i;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,L0(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function aA(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}ii.prototype.ValueTypeName="";ii.prototype.TimeBufferType=Float32Array;ii.prototype.ValueBufferType=Float32Array;ii.prototype.DefaultInterpolation=vp;var vs=class extends ii{constructor(e,t,i){super(e,t,i)}};vs.prototype.ValueTypeName="bool";vs.prototype.ValueBufferType=Array;vs.prototype.DefaultInterpolation=nu;vs.prototype.InterpolantFactoryMethodLinear=void 0;vs.prototype.InterpolantFactoryMethodSmooth=void 0;var Up=class extends ii{constructor(e,t,i,r){super(e,t,i,r)}};Up.prototype.ValueTypeName="color";var Bp=class extends ii{constructor(e,t,i,r){super(e,t,i,r)}};Bp.prototype.ValueTypeName="number";var Vp=class extends ys{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-t)/(r-t),l=e*a;for(let u=l+a;l!==u;l+=4)sr.slerpFlat(s,0,o,l-a,o,l,c);return s}},Au=class extends ii{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new Vp(this.times,this.values,this.getValueSize(),e)}};Au.prototype.ValueTypeName="quaternion";Au.prototype.InterpolantFactoryMethodSmooth=void 0;var _s=class extends ii{constructor(e,t,i){super(e,t,i)}};_s.prototype.ValueTypeName="string";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=nu;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;var Hp=class extends ii{constructor(e,t,i,r){super(e,t,i,r)}};Hp.prototype.ValueTypeName="vector";var rp=new A,sp=new sr,er=new A,Iu=class extends Eo{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Rt,this.projectionMatrix=new Rt,this.projectionMatrixInverse=new Rt,this.coordinateSystem=Ni,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(rp,sp,er),er.x===1&&er.y===1&&er.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(rp,sp,er.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(rp,sp,er),er.x===1&&er.y===1&&er.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(rp,sp,er.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hs=new A,cA=new pe,lA=new pe,Wn=class extends Iu{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ac*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Kl*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ac*2*Math.atan(Math.tan(Kl*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){hs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(hs.x,hs.y).multiplyScalar(-e/hs.z),hs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(hs.x,hs.y).multiplyScalar(-e/hs.z)}getViewSize(e,t){return this.getViewBounds(e,cA,lA),t.subVectors(lA,cA)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Kl*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*r/c,t-=o.offsetY*i/l,r*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Ru=class extends Iu{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,s=i-e,o=i+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var Nu=class extends on{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};var Qa=-90,ec=1,zp=class extends Eo{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Wn(Qa,ec,e,t);r.layers=this.layers,this.add(r);let s=new Wn(Qa,ec,e,t);s.layers=this.layers,this.add(s);let o=new Wn(Qa,ec,e,t);o.layers=this.layers,this.add(o);let a=new Wn(Qa,ec,e,t);a.layers=this.layers,this.add(a);let c=new Wn(Qa,ec,e,t);c.layers=this.layers,this.add(c);let l=new Wn(Qa,ec,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,c]=t;for(let l of t)this.remove(l);if(e===Ni)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===su)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,c,l,u]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(i,0,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,1,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,2,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,r),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,f,h),e.xr.enabled=p,i.texture.needsPMREMUpdate=!0}},Gp=class extends Wn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Sx="\\[\\]\\.:\\/",YV=new RegExp("["+Sx+"]","g"),Ex="[^"+Sx+"]",ZV="[^"+Sx.replace("\\.","")+"]",JV=/((?:WC+[\/:])*)/.source.replace("WC",Ex),KV=/(WCOD+)?/.source.replace("WCOD",ZV),QV=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ex),eH=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ex),tH=new RegExp("^"+JV+KV+QV+eH+"$"),nH=["material","materials","bones","map"],q0=class{constructor(e,t,i){let r=i||Lt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Lt=(()=>{class n{constructor(t,i,r){this.path=i,this.parsedPath=r||n.parseTrackName(i),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,i,r){return t&&t.isAnimationObjectGroup?new n.Composite(t,i,r):new n(t,i,r)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(YV,"")}static parseTrackName(t){let i=tH.exec(t);if(i===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let r={nodeName:i[2],objectName:i[3],objectIndex:i[4],propertyName:i[5],propertyIndex:i[6]},s=r.nodeName&&r.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let o=r.nodeName.substring(s+1);nH.indexOf(o)!==-1&&(r.nodeName=r.nodeName.substring(0,s),r.objectName=o)}if(r.propertyName===null||r.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return r}static findNode(t,i){if(i===void 0||i===""||i==="."||i===-1||i===t.name||i===t.uuid)return t;if(t.skeleton){let r=t.skeleton.getBoneByName(i);if(r!==void 0)return r}if(t.children){let r=function(o){for(let a=0;a<o.length;a++){let c=o[a];if(c.name===i||c.uuid===i)return c;let l=r(c.children);if(l)return l}return null},s=r(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,i){t[i]=this.targetObject[this.propertyName]}_getValue_array(t,i){let r=this.resolvedProperty;for(let s=0,o=r.length;s!==o;++s)t[i++]=r[s]}_getValue_arrayElement(t,i){t[i]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,i){this.resolvedProperty.toArray(t,i)}_setValue_direct(t,i){this.targetObject[this.propertyName]=t[i]}_setValue_direct_setNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,i){let r=this.resolvedProperty;for(let s=0,o=r.length;s!==o;++s)r[s]=t[i++]}_setValue_array_setNeedsUpdate(t,i){let r=this.resolvedProperty;for(let s=0,o=r.length;s!==o;++s)r[s]=t[i++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,i){let r=this.resolvedProperty;for(let s=0,o=r.length;s!==o;++s)r[s]=t[i++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,i){this.resolvedProperty[this.propertyIndex]=t[i]}_setValue_arrayElement_setNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,i){this.resolvedProperty.fromArray(t,i)}_setValue_fromArray_setNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,i){this.bind(),this.getValue(t,i)}_setValue_unbound(t,i){this.bind(),this.setValue(t,i)}bind(){let t=this.node,i=this.parsedPath,r=i.objectName,s=i.propertyName,o=i.propertyIndex;if(t||(t=n.findNode(this.rootNode,i.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Le("PropertyBinding: No target node found for track: "+this.path+".");return}if(r){let u=i.objectIndex;switch(r){case"materials":if(!t.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ue("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ue("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let d=0;d<t.length;d++)if(t[d].name===u){u=d;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ue("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ue("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[r]===void 0){Ue("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[r]}if(u!==void 0){if(t[u]===void 0){Ue("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[u]}}let a=t[s];if(a===void 0){let u=i.nodeName;Ue("PropertyBinding: Trying to update property for track: "+u+"."+s+" but it wasn't found.",t);return}let c=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?c=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(o!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ue("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[o]!==void 0&&(o=t.morphTargetDictionary[o])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=o}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}return n.Composite=q0,n})();Lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Lt.prototype.GetterByBindingType=[Lt.prototype._getValue_direct,Lt.prototype._getValue_array,Lt.prototype._getValue_arrayElement,Lt.prototype._getValue_toArray];Lt.prototype.SetterByBindingTypeAndVersioning=[[Lt.prototype._setValue_direct,Lt.prototype._setValue_direct_setNeedsUpdate,Lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_array,Lt.prototype._setValue_array_setNeedsUpdate,Lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_arrayElement,Lt.prototype._setValue_arrayElement_setNeedsUpdate,Lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Lt.prototype._setValue_fromArray,Lt.prototype._setValue_fromArray_setNeedsUpdate,Lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var aie=new Float32Array(1);var xs=class extends hu{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}};var X0=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){let s=this.elements;return s[0]=e,s[2]=t,s[1]=i,s[3]=r,this}};var uA=new A,op=new A,tc=new A,nc=new A,k0=new A,iH=new A,rH=new A,Pu=class{constructor(e=new A,t=new A){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){uA.subVectors(e,this.start),op.subVectors(this.end,this.start);let i=op.dot(op);if(i===0)return 0;let s=op.dot(uA)/i;return t&&(s=Ge(s,0,1)),s}closestPointToPoint(e,t,i){let r=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=iH,i=rH){let r=10000000000000001e-32,s,o,a=this.start,c=e.start,l=this.end,u=e.end;tc.subVectors(l,a),nc.subVectors(u,c),k0.subVectors(a,c);let d=tc.dot(tc),f=nc.dot(nc),h=nc.dot(k0);if(d<=r&&f<=r)return t.copy(a),i.copy(c),t.sub(i),t.dot(t);if(d<=r)s=0,o=h/f,o=Ge(o,0,1);else{let p=tc.dot(k0);if(f<=r)o=0,s=Ge(-p/d,0,1);else{let v=tc.dot(nc),m=d*f-v*v;m!==0?s=Ge((v*h-p*f)/m,0,1):s=0,o=(v*s+h)/f,o<0?(o=0,s=Ge(-p/d,0,1)):o>1&&(o=1,s=Ge((v-p)/d,0,1))}}return t.copy(a).addScaledVector(tc,s),i.copy(c).addScaledVector(nc,o),t.distanceToSquared(i)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};function wx(n,e,t,i){let r=sH(i);switch(t){case hx:return n*e;case mx:return n*e/r.components*r.byteLength;case Zp:return n*e/r.components*r.byteLength;case Es:return n*e*2/r.components*r.byteLength;case Jp:return n*e*2/r.components*r.byteLength;case px:return n*e*3/r.components*r.byteLength;case mi:return n*e*4/r.components*r.byteLength;case Kp:return n*e*4/r.components*r.byteLength;case ku:case Uu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Bu:case Vu:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case em:case nm:return Math.max(n,16)*Math.max(e,8)/4;case Qp:case tm:return Math.max(n,8)*Math.max(e,8)/2;case im:case rm:case om:case am:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case sm:case Hu:case cm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case lm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case um:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case dm:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case fm:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case hm:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case pm:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case mm:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case gm:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case ym:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case vm:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case _m:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case xm:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case bm:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case Mm:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Sm:case Em:case wm:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Tm:case Cm:return Math.ceil(n/4)*Math.ceil(e/4)*8;case zu:case Dm:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function sH(n){switch(n){case ri:case lx:return{byteLength:1,components:1};case mc:case ux:case ki:return{byteLength:2,components:1};case Xp:case Yp:return{byteLength:2,components:4};case Oi:case qp:case Li:return{byteLength:4,components:1};case dx:case fx:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function MI(){let n=null,e=!1,t=null,i=null;function r(s,o){i=n.requestAnimationFrame(r),t(s,o)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function dH(n){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,d=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,u),a.onUploadCallback();let h;if(l instanceof Float32Array)h=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)h=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?h=n.HALF_FLOAT:h=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)h=n.SHORT;else if(l instanceof Uint32Array)h=n.UNSIGNED_INT;else if(l instanceof Int32Array)h=n.INT;else if(l instanceof Int8Array)h=n.BYTE;else if(l instanceof Uint8Array)h=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)h=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:h,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,c,l){let u=c.array,d=c.updateRanges;if(n.bindBuffer(l,a),d.length===0)n.bufferSubData(l,0,u);else{d.sort((h,p)=>h.start-p.start);let f=0;for(let h=1;h<d.length;h++){let p=d[f],v=d[h];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++f,d[f]=v)}d.length=f+1;for(let h=0,p=d.length;h<p;h++){let v=d[h];n.bufferSubData(l,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:r,remove:s,update:o}}var fH=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,hH=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,pH=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mH=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gH=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,yH=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vH=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,_H=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xH=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,bH=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,MH=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,SH=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,EH=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wH=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,TH=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,CH=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,DH=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,AH=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,IH=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,RH=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,NH=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,PH=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,FH=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,OH=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,LH=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,kH=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,UH=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,BH=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,VH=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,HH=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,zH="gl_FragColor = linearToOutputTexel( gl_FragColor );",GH=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,jH=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,WH=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,$H=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,qH=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,XH=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,YH=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ZH=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,JH=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,KH=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,QH=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ez=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,tz=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nz=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,iz=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,rz=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,sz=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,oz=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,az=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,cz=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lz=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,uz=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,dz=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,fz=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,hz=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pz=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,mz=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,gz=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,yz=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vz=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,_z=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,xz=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,bz=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Mz=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sz=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ez=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wz=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Tz=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cz=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Dz=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Az=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Iz=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Rz=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Nz=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pz=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fz=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Oz=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Lz=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,kz=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Uz=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Bz=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vz=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Hz=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,zz=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Gz=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jz=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Wz=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,$z=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qz=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Xz=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Yz=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Zz=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jz=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Kz=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qz=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,eG=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,tG=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,nG=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,iG=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,rG=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,sG=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,oG=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,aG=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,cG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,lG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,dG=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,fG=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,hG=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,mG=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yG=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vG=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,_G=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,xG=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,bG=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,MG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,SG=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,EG=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,wG=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,TG=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,CG=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,DG=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,AG=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,IG=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,RG=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,NG=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,PG=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,FG=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,OG=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,LG=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,kG=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,UG=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,BG=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,VG=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,HG=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,zG=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,GG=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,jG=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,WG=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qe={alphahash_fragment:fH,alphahash_pars_fragment:hH,alphamap_fragment:pH,alphamap_pars_fragment:mH,alphatest_fragment:gH,alphatest_pars_fragment:yH,aomap_fragment:vH,aomap_pars_fragment:_H,batching_pars_vertex:xH,batching_vertex:bH,begin_vertex:MH,beginnormal_vertex:SH,bsdfs:EH,iridescence_fragment:wH,bumpmap_pars_fragment:TH,clipping_planes_fragment:CH,clipping_planes_pars_fragment:DH,clipping_planes_pars_vertex:AH,clipping_planes_vertex:IH,color_fragment:RH,color_pars_fragment:NH,color_pars_vertex:PH,color_vertex:FH,common:OH,cube_uv_reflection_fragment:LH,defaultnormal_vertex:kH,displacementmap_pars_vertex:UH,displacementmap_vertex:BH,emissivemap_fragment:VH,emissivemap_pars_fragment:HH,colorspace_fragment:zH,colorspace_pars_fragment:GH,envmap_fragment:jH,envmap_common_pars_fragment:WH,envmap_pars_fragment:$H,envmap_pars_vertex:qH,envmap_physical_pars_fragment:rz,envmap_vertex:XH,fog_vertex:YH,fog_pars_vertex:ZH,fog_fragment:JH,fog_pars_fragment:KH,gradientmap_pars_fragment:QH,lightmap_pars_fragment:ez,lights_lambert_fragment:tz,lights_lambert_pars_fragment:nz,lights_pars_begin:iz,lights_toon_fragment:sz,lights_toon_pars_fragment:oz,lights_phong_fragment:az,lights_phong_pars_fragment:cz,lights_physical_fragment:lz,lights_physical_pars_fragment:uz,lights_fragment_begin:dz,lights_fragment_maps:fz,lights_fragment_end:hz,lightprobes_pars_fragment:pz,logdepthbuf_fragment:mz,logdepthbuf_pars_fragment:gz,logdepthbuf_pars_vertex:yz,logdepthbuf_vertex:vz,map_fragment:_z,map_pars_fragment:xz,map_particle_fragment:bz,map_particle_pars_fragment:Mz,metalnessmap_fragment:Sz,metalnessmap_pars_fragment:Ez,morphinstance_vertex:wz,morphcolor_vertex:Tz,morphnormal_vertex:Cz,morphtarget_pars_vertex:Dz,morphtarget_vertex:Az,normal_fragment_begin:Iz,normal_fragment_maps:Rz,normal_pars_fragment:Nz,normal_pars_vertex:Pz,normal_vertex:Fz,normalmap_pars_fragment:Oz,clearcoat_normal_fragment_begin:Lz,clearcoat_normal_fragment_maps:kz,clearcoat_pars_fragment:Uz,iridescence_pars_fragment:Bz,opaque_fragment:Vz,packing:Hz,premultiplied_alpha_fragment:zz,project_vertex:Gz,dithering_fragment:jz,dithering_pars_fragment:Wz,roughnessmap_fragment:$z,roughnessmap_pars_fragment:qz,shadowmap_pars_fragment:Xz,shadowmap_pars_vertex:Yz,shadowmap_vertex:Zz,shadowmask_pars_fragment:Jz,skinbase_vertex:Kz,skinning_pars_vertex:Qz,skinning_vertex:eG,skinnormal_vertex:tG,specularmap_fragment:nG,specularmap_pars_fragment:iG,tonemapping_fragment:rG,tonemapping_pars_fragment:sG,transmission_fragment:oG,transmission_pars_fragment:aG,uv_pars_fragment:cG,uv_pars_vertex:lG,uv_vertex:uG,worldpos_vertex:dG,background_vert:fG,background_frag:hG,backgroundCube_vert:pG,backgroundCube_frag:mG,cube_vert:gG,cube_frag:yG,depth_vert:vG,depth_frag:_G,distance_vert:xG,distance_frag:bG,equirect_vert:MG,equirect_frag:SG,linedashed_vert:EG,linedashed_frag:wG,meshbasic_vert:TG,meshbasic_frag:CG,meshlambert_vert:DG,meshlambert_frag:AG,meshmatcap_vert:IG,meshmatcap_frag:RG,meshnormal_vert:NG,meshnormal_frag:PG,meshphong_vert:FG,meshphong_frag:OG,meshphysical_vert:LG,meshphysical_frag:kG,meshtoon_vert:UG,meshtoon_frag:BG,points_vert:VG,points_frag:HG,shadow_vert:zG,shadow_frag:GG,sprite_vert:jG,sprite_frag:WG},re={common:{diffuse:{value:new nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new He}},envmap:{envMap:{value:null},envMapRotation:{value:new He},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new He}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new He}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new He},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new He},normalScale:{value:new pe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new He},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new He}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new He}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new He}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new A},probesMax:{value:new A},probesResolution:{value:new A}},points:{diffuse:{value:new nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0},uvTransform:{value:new He}},sprite:{diffuse:{value:new nt(16777215)},opacity:{value:1},center:{value:new pe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}}},kn={basic:{uniforms:En([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:qe.meshbasic_vert,fragmentShader:qe.meshbasic_frag},lambert:{uniforms:En([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new nt(0)},envMapIntensity:{value:1}}]),vertexShader:qe.meshlambert_vert,fragmentShader:qe.meshlambert_frag},phong:{uniforms:En([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new nt(0)},specular:{value:new nt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qe.meshphong_vert,fragmentShader:qe.meshphong_frag},standard:{uniforms:En([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag},toon:{uniforms:En([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new nt(0)}}]),vertexShader:qe.meshtoon_vert,fragmentShader:qe.meshtoon_frag},matcap:{uniforms:En([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:qe.meshmatcap_vert,fragmentShader:qe.meshmatcap_frag},points:{uniforms:En([re.points,re.fog]),vertexShader:qe.points_vert,fragmentShader:qe.points_frag},dashed:{uniforms:En([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qe.linedashed_vert,fragmentShader:qe.linedashed_frag},depth:{uniforms:En([re.common,re.displacementmap]),vertexShader:qe.depth_vert,fragmentShader:qe.depth_frag},normal:{uniforms:En([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:qe.meshnormal_vert,fragmentShader:qe.meshnormal_frag},sprite:{uniforms:En([re.sprite,re.fog]),vertexShader:qe.sprite_vert,fragmentShader:qe.sprite_frag},background:{uniforms:{uvTransform:{value:new He},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qe.background_vert,fragmentShader:qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new He}},vertexShader:qe.backgroundCube_vert,fragmentShader:qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qe.cube_vert,fragmentShader:qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qe.equirect_vert,fragmentShader:qe.equirect_frag},distance:{uniforms:En([re.common,re.displacementmap,{referencePosition:{value:new A},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qe.distance_vert,fragmentShader:qe.distance_frag},shadow:{uniforms:En([re.lights,re.fog,{color:{value:new nt(0)},opacity:{value:1}}]),vertexShader:qe.shadow_vert,fragmentShader:qe.shadow_frag}};kn.physical={uniforms:En([kn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new He},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new He},clearcoatNormalScale:{value:new pe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new He},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new He},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new He},sheen:{value:0},sheenColor:{value:new nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new He},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new He},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new He},transmissionSamplerSize:{value:new pe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new He},attenuationDistance:{value:0},attenuationColor:{value:new nt(0)},specularColor:{value:new nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new He},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new He},anisotropyVector:{value:new pe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new He}}]),vertexShader:qe.meshphysical_vert,fragmentShader:qe.meshphysical_frag};var Rm={r:0,b:0,g:0},$G=new Rt,SI=new He;SI.set(-1,0,0,0,1,0,0,0,1);function qG(n,e,t,i,r,s){let o=new nt(0),a=r===!0?0:1,c,l,u=null,d=0,f=null;function h(M){let w=M.isScene===!0?M.background:null;if(w&&w.isTexture){let _=M.backgroundBlurriness>0;w=e.get(w,_)}return w}function p(M){let w=!1,_=h(M);_===null?m(o,a):_&&_.isColor&&(m(_,1),w=!0);let S=n.xr.getEnvironmentBlendMode();S==="additive"?t.buffers.color.setClear(0,0,0,1,s):S==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,s),(n.autoClear||w)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function v(M,w){let _=h(w);_&&(_.isCubeTexture||_.mapping===Ou)?(l===void 0&&(l=new vt(new uc(1,1,1),new On({name:"BackgroundCubeMaterial",uniforms:wo(kn.backgroundCube.uniforms),vertexShader:kn.backgroundCube.vertexShader,fragmentShader:kn.backgroundCube.fragmentShader,side:Ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(S,E,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=_,l.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4($G.makeRotationFromEuler(w.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(SI),l.material.toneMapped=tt.getTransfer(_.colorSpace)!==ft,(u!==_||d!==_.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,u=_,d=_.version,f=n.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new vt(new ar(2,2),new On({name:"BackgroundMaterial",uniforms:wo(kn.background.uniforms),vertexShader:kn.background.vertexShader,fragmentShader:kn.background.fragmentShader,side:cr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.toneMapped=tt.getTransfer(_.colorSpace)!==ft,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,f=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null))}function m(M,w){M.getRGB(Rm,Mx(n)),t.buffers.color.setClear(Rm.r,Rm.g,Rm.b,w,s)}function g(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(M,w=1){o.set(M),a=w,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(M){a=M,m(o,a)},render:p,addToRenderList:v,dispose:g}}function XG(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=f(null),s=r,o=!1;function a(L,P,z,O,V){let J=!1,j=d(L,O,z,P);s!==j&&(s=j,l(s.object)),J=h(L,O,z,V),J&&p(L,O,z,V),V!==null&&e.update(V,n.ELEMENT_ARRAY_BUFFER),(J||o)&&(o=!1,_(L,P,z,O),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function c(){return n.createVertexArray()}function l(L){return n.bindVertexArray(L)}function u(L){return n.deleteVertexArray(L)}function d(L,P,z,O){let V=O.wireframe===!0,J=i[P.id];J===void 0&&(J={},i[P.id]=J);let j=L.isInstancedMesh===!0?L.id:0,te=J[j];te===void 0&&(te={},J[j]=te);let W=te[z.id];W===void 0&&(W={},te[z.id]=W);let Y=W[V];return Y===void 0&&(Y=f(c()),W[V]=Y),Y}function f(L){let P=[],z=[],O=[];for(let V=0;V<t;V++)P[V]=0,z[V]=0,O[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:z,attributeDivisors:O,object:L,attributes:{},index:null}}function h(L,P,z,O){let V=s.attributes,J=P.attributes,j=0,te=z.getAttributes();for(let W in te)if(te[W].location>=0){let ne=V[W],Ne=J[W];if(Ne===void 0&&(W==="instanceMatrix"&&L.instanceMatrix&&(Ne=L.instanceMatrix),W==="instanceColor"&&L.instanceColor&&(Ne=L.instanceColor)),ne===void 0||ne.attribute!==Ne||Ne&&ne.data!==Ne.data)return!0;j++}return s.attributesNum!==j||s.index!==O}function p(L,P,z,O){let V={},J=P.attributes,j=0,te=z.getAttributes();for(let W in te)if(te[W].location>=0){let ne=J[W];ne===void 0&&(W==="instanceMatrix"&&L.instanceMatrix&&(ne=L.instanceMatrix),W==="instanceColor"&&L.instanceColor&&(ne=L.instanceColor));let Ne={};Ne.attribute=ne,ne&&ne.data&&(Ne.data=ne.data),V[W]=Ne,j++}s.attributes=V,s.attributesNum=j,s.index=O}function v(){let L=s.newAttributes;for(let P=0,z=L.length;P<z;P++)L[P]=0}function m(L){g(L,0)}function g(L,P){let z=s.newAttributes,O=s.enabledAttributes,V=s.attributeDivisors;z[L]=1,O[L]===0&&(n.enableVertexAttribArray(L),O[L]=1),V[L]!==P&&(n.vertexAttribDivisor(L,P),V[L]=P)}function M(){let L=s.newAttributes,P=s.enabledAttributes;for(let z=0,O=P.length;z<O;z++)P[z]!==L[z]&&(n.disableVertexAttribArray(z),P[z]=0)}function w(L,P,z,O,V,J,j){j===!0?n.vertexAttribIPointer(L,P,z,V,J):n.vertexAttribPointer(L,P,z,O,V,J)}function _(L,P,z,O){v();let V=O.attributes,J=z.getAttributes(),j=P.defaultAttributeValues;for(let te in J){let W=J[te];if(W.location>=0){let Y=V[te];if(Y===void 0&&(te==="instanceMatrix"&&L.instanceMatrix&&(Y=L.instanceMatrix),te==="instanceColor"&&L.instanceColor&&(Y=L.instanceColor)),Y!==void 0){let ne=Y.normalized,Ne=Y.itemSize,Ce=e.get(Y);if(Ce===void 0)continue;let St=Ce.buffer,rt=Ce.type,lt=Ce.bytesPerElement,q=rt===n.INT||rt===n.UNSIGNED_INT||Y.gpuType===qp;if(Y.isInterleavedBufferAttribute){let Q=Y.data,_e=Q.stride,ze=Y.offset;if(Q.isInstancedInterleavedBuffer){for(let ge=0;ge<W.locationSize;ge++)g(W.location+ge,Q.meshPerAttribute);L.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let ge=0;ge<W.locationSize;ge++)m(W.location+ge);n.bindBuffer(n.ARRAY_BUFFER,St);for(let ge=0;ge<W.locationSize;ge++)w(W.location+ge,Ne/W.locationSize,rt,ne,_e*lt,(ze+Ne/W.locationSize*ge)*lt,q)}else{if(Y.isInstancedBufferAttribute){for(let Q=0;Q<W.locationSize;Q++)g(W.location+Q,Y.meshPerAttribute);L.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let Q=0;Q<W.locationSize;Q++)m(W.location+Q);n.bindBuffer(n.ARRAY_BUFFER,St);for(let Q=0;Q<W.locationSize;Q++)w(W.location+Q,Ne/W.locationSize,rt,ne,Ne*lt,Ne/W.locationSize*Q*lt,q)}}else if(j!==void 0){let ne=j[te];if(ne!==void 0)switch(ne.length){case 2:n.vertexAttrib2fv(W.location,ne);break;case 3:n.vertexAttrib3fv(W.location,ne);break;case 4:n.vertexAttrib4fv(W.location,ne);break;default:n.vertexAttrib1fv(W.location,ne)}}}}M()}function S(){C();for(let L in i){let P=i[L];for(let z in P){let O=P[z];for(let V in O){let J=O[V];for(let j in J)u(J[j].object),delete J[j];delete O[V]}}delete i[L]}}function E(L){if(i[L.id]===void 0)return;let P=i[L.id];for(let z in P){let O=P[z];for(let V in O){let J=O[V];for(let j in J)u(J[j].object),delete J[j];delete O[V]}}delete i[L.id]}function D(L){for(let P in i){let z=i[P];for(let O in z){let V=z[O];if(V[L.id]===void 0)continue;let J=V[L.id];for(let j in J)u(J[j].object),delete J[j];delete V[L.id]}}}function x(L){for(let P in i){let z=i[P],O=L.isInstancedMesh===!0?L.id:0,V=z[O];if(V!==void 0){for(let J in V){let j=V[J];for(let te in j)u(j[te].object),delete j[te];delete V[J]}delete z[O],Object.keys(z).length===0&&delete i[P]}}}function C(){F(),o=!0,s!==r&&(s=r,l(s.object))}function F(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:C,resetDefaultState:F,dispose:S,releaseStatesOfGeometry:E,releaseStatesOfObject:x,releaseStatesOfProgram:D,initAttributes:v,enableAttribute:m,disableUnusedAttributes:M}}function YG(n,e,t){let i;function r(c){i=c}function s(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function o(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function a(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let f=0;for(let h=0;h<u;h++)f+=l[h];t.update(f,i,1)}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function ZG(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let D=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(D){return!(D!==mi&&i.convert(D)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(D){let x=D===ki&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(D!==ri&&D!==Li&&!x&&i.convert(D)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function c(D){if(D==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";D="mediump"}return D==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(Le("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let d=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),p=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),g=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),w=n.getParameter(n.MAX_VARYING_VECTORS),_=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),S=n.getParameter(n.MAX_SAMPLES),E=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:h,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:m,maxAttributes:g,maxVertexUniforms:M,maxVaryings:w,maxFragmentUniforms:_,maxSamples:S,samples:E}}function JG(n){let e=this,t=null,i=0,r=!1,s=!1,o=new Ii,a=new He,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){let h=d.length!==0||f||i!==0||r;return r=f,i=d.length,h},this.beginShadows=function(){s=!0,u(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(d,f){t=u(d,f,0)},this.setState=function(d,f,h){let p=d.clippingPlanes,v=d.clipIntersection,m=d.clipShadows,g=n.get(d);if(!r||p===null||p.length===0||s&&!m)s?u(null):l();else{let M=s?0:i,w=M*4,_=g.clippingState||null;c.value=_,_=u(p,f,w,h);for(let S=0;S!==w;++S)_[S]=t[S];g.clippingState=_,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=M}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,f,h,p){let v=d!==null?d.length:0,m=null;if(v!==0){if(m=c.value,p!==!0||m===null){let g=h+v*4,M=f.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<g)&&(m=new Float32Array(g));for(let w=0,_=h;w!==v;++w,_+=4)o.copy(d[w]).applyMatrix4(M,a),o.normal.toArray(m,_),m[_+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}var vc=4,KG=6,QG=20,e4=256,ju=new Ru,eI=new nt,Tx=null,Cx=0,Dx=0,Ax=!1,t4=new A,To=new A,Pm=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,s={}){let{size:o=256,position:a=t4}=s;Tx=this._renderer.getRenderTarget(),Cx=this._renderer.getActiveCubeFace(),Dx=this._renderer.getActiveMipmapLevel(),Ax=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,r,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=iI(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=nI(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Tx,Cx,Dx),this._renderer.xr.enabled=Ax,e.scissorTest=!1,yc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===bs||e.mapping===So?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Tx=this._renderer.getRenderTarget(),Cx=this._renderer.getActiveCubeFace(),Dx=this._renderer.getActiveMipmapLevel(),Ax=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:$t,minFilter:$t,generateMipmaps:!1,type:ki,format:mi,colorSpace:iu,depthBuffer:!1},r=tI(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=tI(e,t,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=n4(s)),this._blurMaterial=r4(s,e,t),this._ggxMaterial=i4(s,e,t)}return r}_compileMaterial(e){let t=new vt(new on,e);this._renderer.compile(t,ju)}_sceneToCubeUV(e,t,i,r,s){let c=new Wn(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,f=d.autoClear,h=d.toneMapping;d.getClearColor(eI),d.toneMapping=Fi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(r),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new vt(new uc,new an({name:"PMREM.Background",side:Ln,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,g=!1,M=e.background;M?M.isColor&&(m.color.copy(M),e.background=null,g=!0):(m.color.copy(eI),g=!0);for(let w=0;w<6;w++){let _=w%3;_===0?(c.up.set(0,l[w],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+u[w],s.y,s.z)):_===1?(c.up.set(0,0,l[w]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+u[w],s.z)):(c.up.set(0,l[w],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+u[w]));let S=this._cubeSize;yc(r,_*S,w>2?S:0,S,S),d.setRenderTarget(r),g&&d.render(v,c),d.render(e,c)}d.toneMapping=h,d.autoClear=f,e.background=M}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===bs||e.mapping===So;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=iI()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=nI());let s=r?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=e;let c=this._cubeSize;yc(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(o,ju)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let s=1;s<r;s++)this._applyGGXFilter(e,s-1,s);t.autoClear=i}_applyGGXFilter(e,t,i){let r=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let c=o.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-u*u),f=l*1.25,h=d*f,{_lodMax:p}=this,v=this._sizeLods[i],m=3*v*(i>p-vc?i-p+vc:0),g=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=h,c.mipInt.value=p-t,yc(s,m,g,3*v,2*v),r.setRenderTarget(s),r.render(a,ju),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=p-i,yc(e,m,g,3*v,2*v),r.setRenderTarget(e),r.render(a,ju)}_blur(e,t,i,r){let s=this._pingPongRenderTarget,o=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,s,t,i,o),this._blurPass(s,e,i,i,o)}_blurPass(e,t,i,r,s){let o=this._renderer,a=this._blurMaterial,c=this._lodMeshes[r];c.material=a;let l=a.uniforms;l.envMap.value=e.texture,l.sigma.value=s,l.mipInt.value=this._lodMax-i;let u=this._sizeLods[r],d=3*u*(r>this._lodMax-vc?r-this._lodMax+vc:0),f=4*(this._cubeSize-u);yc(t,d,f,3*u,2*u),o.setRenderTarget(t),o.render(c,ju)}};function n4(n){let e=[],t=[],i=n,r=n-vc+1+KG;for(let s=0;s<r;s++){let o=Math.pow(2,i);e.push(o);let a=1/(o-2),c=-a,l=1+a,u=[c,c,l,c,l,l,c,c,l,l,c,l],d=6,f=6,h=3,p=new Float32Array(h*f*d),v=new Float32Array(h*f*d);for(let g=0;g<d;g++){let M=g%3*2/3-1,w=g>2?0:-1,_=[M,w,0,M+2/3,w,0,M+2/3,w+1,0,M,w,0,M+2/3,w+1,0,M,w+1,0];p.set(_,h*f*g);for(let S=0;S<f;S++){let E=u[S*2]*2-1,D=u[S*2+1]*2-1;g===0?To.set(1,D,E):g===1?To.set(-E,1,-D):g===2?To.set(-E,D,1):g===3?To.set(-1,D,-E):g===4?To.set(-E,-1,D):To.set(E,D,-1),To.toArray(v,(g*f+S)*h)}}let m=new on;m.setAttribute("position",new Fn(p,h)),m.setAttribute("outputDirection",new Fn(v,h)),t.push(new vt(m,null)),i>vc&&i--}return{lodMeshes:t,sizeLods:e}}function tI(n,e,t){let i=new $n(n,e,t);return i.texture.mapping=Ou,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function yc(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function i4(n,e,t){return new On({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:e4,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Om(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:lr,depthTest:!1,depthWrite:!1})}function r4(n,e,t){return new On({name:"SphericalGaussianBlur",defines:{SAMPLES:QG,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Om(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:lr,depthTest:!1,depthWrite:!1})}function nI(){return new On({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Om(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:lr,depthTest:!1,depthWrite:!1})}function iI(){return new On({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Om(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:lr,depthTest:!1,depthWrite:!1})}function Om(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Fm=class extends $n{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new mu(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new uc(5,5,5),s=new On({name:"CubemapFromEquirect",uniforms:wo(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ln,blending:lr});s.uniforms.tEquirect.value=t;let o=new vt(r,s),a=t.minFilter;return t.minFilter===Ms&&(t.minFilter=$t),new zp(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){let s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}};function s4(n){let e=new WeakMap,t=new WeakMap,i=null;function r(f,h=!1){return f==null?null:h?o(f):s(f)}function s(f){if(f&&f.isTexture){let h=f.mapping;if(h===jp||h===Wp)if(e.has(f)){let p=e.get(f).texture;return a(p,f.mapping)}else{let p=f.image;if(p&&p.height>0){let v=new Fm(p.height);return v.fromEquirectangularTexture(n,f),e.set(f,v),f.addEventListener("dispose",l),a(v.texture,f.mapping)}else return null}}return f}function o(f){if(f&&f.isTexture){let h=f.mapping,p=h===jp||h===Wp,v=h===bs||h===So;if(p||v){let m=t.get(f),g=m!==void 0?m.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==g)return i===null&&(i=new Pm(n)),m=p?i.fromEquirectangular(f,m):i.fromCubemap(f,m),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),m.texture;if(m!==void 0)return m.texture;{let M=f.image;return p&&M&&M.height>0||v&&M&&c(M)?(i===null&&(i=new Pm(n)),m=p?i.fromEquirectangular(f):i.fromCubemap(f),m.texture.pmremVersion=f.pmremVersion,t.set(f,m),f.addEventListener("dispose",u),m.texture):null}}}return f}function a(f,h){return h===jp?f.mapping=bs:h===Wp&&(f.mapping=So),f}function c(f){let h=0,p=6;for(let v=0;v<p;v++)f[v]!==void 0&&h++;return h===p}function l(f){let h=f.target;h.removeEventListener("dispose",l);let p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function u(f){let h=f.target;h.removeEventListener("dispose",u);let p=t.get(h);p!==void 0&&(t.delete(h),p.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:d}}function o4(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&vo("WebGLRenderer: "+i+" extension not supported."),r}}}function a4(n,e,t,i){let r={},s=new WeakMap;function o(d){let f=d.target;f.index!==null&&e.remove(f.index);for(let p in f.attributes)e.remove(f.attributes[p]);f.removeEventListener("dispose",o),delete r[f.id];let h=s.get(f);h&&(e.remove(h),s.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(d,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,t.memory.geometries++),f}function c(d){let f=d.attributes;for(let h in f)e.update(f[h],n.ARRAY_BUFFER)}function l(d){let f=[],h=d.index,p=d.attributes.position,v=0;if(p===void 0)return;if(h!==null){let M=h.array;v=h.version;for(let w=0,_=M.length;w<_;w+=3){let S=M[w+0],E=M[w+1],D=M[w+2];f.push(S,E,E,D,D,S)}}else{let M=p.array;v=p.version;for(let w=0,_=M.length/3-1;w<_;w+=3){let S=w+0,E=w+1,D=w+2;f.push(S,E,E,D,D,S)}}let m=new(p.count>=65535?fu:du)(f,1);m.version=v;let g=s.get(d);g&&e.remove(g),s.set(d,m)}function u(d){let f=s.get(d);if(f){let h=d.index;h!==null&&f.version<h.version&&l(d)}else l(d);return s.get(d)}return{get:a,update:c,getWireframeAttribute:u}}function c4(n,e,t){let i;function r(d){i=d}let s,o;function a(d){s=d.type,o=d.bytesPerElement}function c(d,f){n.drawElements(i,f,s,d*o),t.update(f,i,1)}function l(d,f,h){h!==0&&(n.drawElementsInstanced(i,f,s,d*o,h),t.update(f,i,h))}function u(d,f,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,s,d,0,h);let v=0;for(let m=0;m<h;m++)v+=f[m];t.update(v,i,1)}this.setMode=r,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function l4(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:Ue("WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function u4(n,e,t){let i=new WeakMap,r=new mt;function s(o,a,c){let l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,f=i.get(a);if(f===void 0||f.count!==d){let F=function(){x.dispose(),i.delete(a),a.removeEventListener("dispose",F)};var h=F;f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,v=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],M=a.morphAttributes.normal||[],w=a.morphAttributes.color||[],_=0;p===!0&&(_=1),v===!0&&(_=2),m===!0&&(_=3);let S=a.attributes.position.count*_,E=1;S>e.maxTextureSize&&(E=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);let D=new Float32Array(S*E*4*d),x=new cu(D,S,E,d);x.type=Li,x.needsUpdate=!0;let C=_*4;for(let L=0;L<d;L++){let P=g[L],z=M[L],O=w[L],V=S*E*4*L;for(let J=0;J<P.count;J++){let j=J*C;p===!0&&(r.fromBufferAttribute(P,J),D[V+j+0]=r.x,D[V+j+1]=r.y,D[V+j+2]=r.z,D[V+j+3]=0),v===!0&&(r.fromBufferAttribute(z,J),D[V+j+4]=r.x,D[V+j+5]=r.y,D[V+j+6]=r.z,D[V+j+7]=0),m===!0&&(r.fromBufferAttribute(O,J),D[V+j+8]=r.x,D[V+j+9]=r.y,D[V+j+10]=r.z,D[V+j+11]=O.itemSize===4?r.w:1)}}f={count:d,texture:x,size:new pe(S,E)},i.set(a,f),a.addEventListener("dispose",F)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let p=0;for(let m=0;m<l.length;m++)p+=l[m];let v=a.morphTargetsRelative?1:1-p;c.getUniforms().setValue(n,"morphTargetBaseInfluence",v),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:s}}function d4(n,e,t,i,r){let s=new WeakMap;function o(l){let u=r.render.frame,d=l.geometry,f=e.get(l,d);if(s.get(f)!==u&&(e.update(f),s.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,u))),l.isSkinnedMesh){let h=l.skeleton;s.get(h)!==u&&(h.update(),s.set(h,u))}return f}function a(){s=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}var f4={[nx]:"LINEAR_TONE_MAPPING",[ix]:"REINHARD_TONE_MAPPING",[rx]:"CINEON_TONE_MAPPING",[sx]:"ACES_FILMIC_TONE_MAPPING",[ax]:"AGX_TONE_MAPPING",[cx]:"NEUTRAL_TONE_MAPPING",[ox]:"CUSTOM_TONE_MAPPING"};function h4(n,e,t,i,r,s){let o=new $n(e,t,{type:n,depthBuffer:r,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new on;l.setAttribute("position",new Ct([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Ct([0,2,0,0,2,0],2));let u=new Rp({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new vt(l,u),f=new Ru(-1,1,1,-1,0,1),h=null,p=null,v=!1,m,g=null,M=[],w=!1;this.setSize=function(_,S){o.setSize(_,S),a!==null&&a.setSize(_,S),c!==null&&c.setSize(_,S);for(let E=0;E<M.length;E++){let D=M[E];D.setSize&&D.setSize(_,S)}},this.setEffects=function(_){M=_,w=M.length>0&&M[0].isRenderPass===!0;let S=o.width,E=o.height;M.length>0&&a===null&&(a=new $n(S,E,{type:ki,depthBuffer:!1,stencilBuffer:!1}),c=new $n(S,E,{type:ki,depthBuffer:!1,stencilBuffer:!1}));for(let D=0;D<M.length;D++){let x=M[D];x.setSize&&x.setSize(S,E)}},this.begin=function(_,S){if(v||_.toneMapping===Fi&&M.length===0)return!1;if(g=S,S!==null){let E=S.width,D=S.height;(o.width!==E||o.height!==D)&&this.setSize(E,D)}return w===!1&&_.setRenderTarget(o),m=_.toneMapping,_.toneMapping=Fi,!0},this.hasRenderPass=function(){return w},this.end=function(_,S){_.toneMapping=m,v=!0;let E=o,D=a;for(let x=0;x<M.length;x++){let C=M[x];C.enabled!==!1&&(C.render(_,D,E,S),C.needsSwap!==!1&&(E=D,D=D===a?c:a))}if(h!==_.outputColorSpace||p!==_.toneMapping){h=_.outputColorSpace,p=_.toneMapping,u.defines={},tt.getTransfer(h)===ft&&(u.defines.SRGB_TRANSFER="");let x=f4[p];x&&(u.defines[x]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=E.texture,_.setRenderTarget(g),_.render(d,f),g=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var EI=new gi,Nx=new ms(1,1),wI=new cu,TI=new bp,CI=new mu,rI=[],sI=[],oI=new Float32Array(16),aI=new Float32Array(9),cI=new Float32Array(4);function xc(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,s=rI[r];if(s===void 0&&(s=new Float32Array(r),rI[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Zt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function Jt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Lm(n,e){let t=sI[e];t===void 0&&(t=new Int32Array(e),sI[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function p4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function m4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Zt(t,e))return;n.uniform2fv(this.addr,e),Jt(t,e)}}function g4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Zt(t,e))return;n.uniform3fv(this.addr,e),Jt(t,e)}}function y4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Zt(t,e))return;n.uniform4fv(this.addr,e),Jt(t,e)}}function v4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Zt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),Jt(t,e)}else{if(Zt(t,i))return;cI.set(i),n.uniformMatrix2fv(this.addr,!1,cI),Jt(t,i)}}function _4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Zt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),Jt(t,e)}else{if(Zt(t,i))return;aI.set(i),n.uniformMatrix3fv(this.addr,!1,aI),Jt(t,i)}}function x4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(Zt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),Jt(t,e)}else{if(Zt(t,i))return;oI.set(i),n.uniformMatrix4fv(this.addr,!1,oI),Jt(t,i)}}function b4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function M4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Zt(t,e))return;n.uniform2iv(this.addr,e),Jt(t,e)}}function S4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Zt(t,e))return;n.uniform3iv(this.addr,e),Jt(t,e)}}function E4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Zt(t,e))return;n.uniform4iv(this.addr,e),Jt(t,e)}}function w4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function T4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Zt(t,e))return;n.uniform2uiv(this.addr,e),Jt(t,e)}}function C4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Zt(t,e))return;n.uniform3uiv(this.addr,e),Jt(t,e)}}function D4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Zt(t,e))return;n.uniform4uiv(this.addr,e),Jt(t,e)}}function A4(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(Nx.compareFunction=t.isReversedDepthBuffer()?Im:Am,s=Nx):s=EI,t.setTexture2D(e||s,r)}function I4(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||TI,r)}function R4(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||CI,r)}function N4(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||wI,r)}function P4(n){switch(n){case 5126:return p4;case 35664:return m4;case 35665:return g4;case 35666:return y4;case 35674:return v4;case 35675:return _4;case 35676:return x4;case 5124:case 35670:return b4;case 35667:case 35671:return M4;case 35668:case 35672:return S4;case 35669:case 35673:return E4;case 5125:return w4;case 36294:return T4;case 36295:return C4;case 36296:return D4;case 35678:case 36198:case 36298:case 36306:case 35682:return A4;case 35679:case 36299:case 36307:return I4;case 35680:case 36300:case 36308:case 36293:return R4;case 36289:case 36303:case 36311:case 36292:return N4}}function F4(n,e){n.uniform1fv(this.addr,e)}function O4(n,e){let t=xc(e,this.size,2);n.uniform2fv(this.addr,t)}function L4(n,e){let t=xc(e,this.size,3);n.uniform3fv(this.addr,t)}function k4(n,e){let t=xc(e,this.size,4);n.uniform4fv(this.addr,t)}function U4(n,e){let t=xc(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function B4(n,e){let t=xc(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function V4(n,e){let t=xc(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function H4(n,e){n.uniform1iv(this.addr,e)}function z4(n,e){n.uniform2iv(this.addr,e)}function G4(n,e){n.uniform3iv(this.addr,e)}function j4(n,e){n.uniform4iv(this.addr,e)}function W4(n,e){n.uniform1uiv(this.addr,e)}function $4(n,e){n.uniform2uiv(this.addr,e)}function q4(n,e){n.uniform3uiv(this.addr,e)}function X4(n,e){n.uniform4uiv(this.addr,e)}function Y4(n,e,t){let i=this.cache,r=e.length,s=Lm(t,r);Zt(i,s)||(n.uniform1iv(this.addr,s),Jt(i,s));let o;this.type===n.SAMPLER_2D_SHADOW?o=Nx:o=EI;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||o,s[a])}function Z4(n,e,t){let i=this.cache,r=e.length,s=Lm(t,r);Zt(i,s)||(n.uniform1iv(this.addr,s),Jt(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||TI,s[o])}function J4(n,e,t){let i=this.cache,r=e.length,s=Lm(t,r);Zt(i,s)||(n.uniform1iv(this.addr,s),Jt(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||CI,s[o])}function K4(n,e,t){let i=this.cache,r=e.length,s=Lm(t,r);Zt(i,s)||(n.uniform1iv(this.addr,s),Jt(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||wI,s[o])}function Q4(n){switch(n){case 5126:return F4;case 35664:return O4;case 35665:return L4;case 35666:return k4;case 35674:return U4;case 35675:return B4;case 35676:return V4;case 5124:case 35670:return H4;case 35667:case 35671:return z4;case 35668:case 35672:return G4;case 35669:case 35673:return j4;case 5125:return W4;case 36294:return $4;case 36295:return q4;case 36296:return X4;case 35678:case 36198:case 36298:case 36306:case 35682:return Y4;case 35679:case 36299:case 36307:return Z4;case 35680:case 36300:case 36308:case 36293:return J4;case 36289:case 36303:case 36311:case 36292:return K4}}var Px=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=P4(t.type)}},Fx=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Q4(t.type)}},Ox=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let s=0,o=r.length;s!==o;++s){let a=r[s];a.setValue(e,t[a.id],i)}}},Ix=/(\w+)(\])?(\[|\.)?/g;function lI(n,e){n.seq.push(e),n.map[e.id]=e}function e5(n,e,t){let i=n.name,r=i.length;for(Ix.lastIndex=0;;){let s=Ix.exec(i),o=Ix.lastIndex,a=s[1],c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===r){lI(t,l===void 0?new Px(a,n,e):new Fx(a,n,e));break}else{let d=t.map[a];d===void 0&&(d=new Ox(a),lI(t,d)),t=d}}}var _c=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);e5(a,c,this)}let r=[],s=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(o):s.push(o);r.length>0&&(this.seq=r.concat(s))}setValue(e,t,i,r){let s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){let a=t[s],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,s=e.length;r!==s;++r){let o=e[r];o.id in t&&i.push(o)}return i}};function uI(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var t5=37297,n5=0;function i5(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){let a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}var dI=new He;function r5(n){tt._getMatrix(dI,tt.workingColorSpace,n);let e=`mat3( ${dI.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(n)){case ru:return[e,"LinearTransferOETF"];case ft:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function fI(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),s=(n.getShaderInfoLog(e)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+s+`

`+i5(n.getShaderSource(e),a)}else return s}function s5(n,e){let t=r5(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var o5={[nx]:"Linear",[ix]:"Reinhard",[rx]:"Cineon",[sx]:"ACESFilmic",[ax]:"AgX",[cx]:"Neutral",[ox]:"Custom"};function a5(n,e){let t=o5[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Nm=new A;function c5(){tt.getLuminanceCoefficients(Nm);let n=Nm.x.toFixed(4),e=Nm.y.toFixed(4),t=Nm.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function l5(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($u).join(`
`)}function u5(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function d5(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let s=n.getActiveAttrib(e,r),o=s.name,a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function $u(n){return n!==""}function hI(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function pI(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var f5=/^[ \t]*#include +<([\w\d./]+)>/gm;function Lx(n){return n.replace(f5,p5)}var h5=new Map;function p5(n,e){let t=qe[e];if(t===void 0){let i=h5.get(e);if(i!==void 0)t=qe[i],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Lx(t)}var m5=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function mI(n){return n.replace(m5,g5)}function g5(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function gI(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var y5={[Fu]:"SHADOWMAP_TYPE_PCF",[hc]:"SHADOWMAP_TYPE_VSM"};function v5(n){return y5[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var _5={[bs]:"ENVMAP_TYPE_CUBE",[So]:"ENVMAP_TYPE_CUBE",[Ou]:"ENVMAP_TYPE_CUBE_UV"};function x5(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":_5[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var b5={[So]:"ENVMAP_MODE_REFRACTION"};function M5(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":b5[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var S5={[tx]:"ENVMAP_BLENDING_MULTIPLY",[NA]:"ENVMAP_BLENDING_MIX",[PA]:"ENVMAP_BLENDING_ADD"};function E5(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":S5[n.combine]||"ENVMAP_BLENDING_NONE"}function w5(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function T5(n,e,t,i){let r=n.getContext(),s=t.defines,o=t.vertexShader,a=t.fragmentShader,c=v5(t),l=x5(t),u=M5(t),d=E5(t),f=w5(t),h=l5(t),p=u5(s),v=r.createProgram(),m,g,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter($u).join(`
`),m.length>0&&(m+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p].filter($u).join(`
`),g.length>0&&(g+=`
`)):(m=[gI(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($u).join(`
`),g=[gI(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,p,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Fi?"#define TONE_MAPPING":"",t.toneMapping!==Fi?qe.tonemapping_pars_fragment:"",t.toneMapping!==Fi?a5("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",qe.colorspace_pars_fragment,s5("linearToOutputTexel",t.outputColorSpace),c5(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($u).join(`
`)),o=Lx(o),o=hI(o,t),o=pI(o,t),a=Lx(a),a=hI(a,t),a=pI(a,t),o=mI(o),a=mI(a),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,g=["#define varying in",t.glslVersion===vx?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===vx?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let w=M+m+o,_=M+g+a,S=uI(r,r.VERTEX_SHADER,w),E=uI(r,r.FRAGMENT_SHADER,_);r.attachShader(v,S),r.attachShader(v,E),t.index0AttributeName!==void 0?r.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(v,0,"position"),r.linkProgram(v);function D(L){if(n.debug.checkShaderErrors){let P=r.getProgramInfoLog(v)||"",z=r.getShaderInfoLog(S)||"",O=r.getShaderInfoLog(E)||"",V=P.trim(),J=z.trim(),j=O.trim(),te=!0,W=!0;if(r.getProgramParameter(v,r.LINK_STATUS)===!1)if(te=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,v,S,E);else{let Y=fI(r,S,"vertex"),ne=fI(r,E,"fragment");Ue("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(v,r.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+V+`
`+Y+`
`+ne)}else V!==""?Le("WebGLProgram: Program Info Log:",V):(J===""||j==="")&&(W=!1);W&&(L.diagnostics={runnable:te,programLog:V,vertexShader:{log:J,prefix:m},fragmentShader:{log:j,prefix:g}})}r.deleteShader(S),r.deleteShader(E),x=new _c(r,v),C=d5(r,v)}let x;this.getUniforms=function(){return x===void 0&&D(this),x};let C;this.getAttributes=function(){return C===void 0&&D(this),C};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=r.getProgramParameter(v,t5)),F},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=n5++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=S,this.fragmentShader=E,this}var C5=0,kx=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(i)===!1&&(r.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Ux(e),t.set(e,i)),i}},Ux=class{constructor(e){this.id=C5++,this.code=e,this.usedTimes=0}};function D5(n){return n===Es||n===Hu||n===zu}function A5(n,e,t,i,r,s){let o=new uu,a=new kx,c=new Set,l=[],u=new Map,d=i.logarithmicDepthBuffer,f=i.precision,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function p(x){return c.add(x),x===0?"uv":`uv${x}`}function v(x,C,F,L,P,z){let O=L.fog,V=P.geometry,J=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?L.environment:null,j=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,te=e.get(x.envMap||J,j),W=te&&te.mapping===Ou?te.image.height:null,Y=h[x.type];x.precision!==null&&(f=i.getMaxPrecision(x.precision),f!==x.precision&&Le("WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));let ne=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,Ne=ne!==void 0?ne.length:0,Ce=0;V.morphAttributes.position!==void 0&&(Ce=1),V.morphAttributes.normal!==void 0&&(Ce=2),V.morphAttributes.color!==void 0&&(Ce=3);let St,rt,lt,q;if(Y){let wt=kn[Y];St=wt.vertexShader,rt=wt.fragmentShader}else{St=x.vertexShader,rt=x.fragmentShader;let wt=a.getVertexShaderStage(x),ut=a.getFragmentShaderStage(x);a.update(x,wt,ut),lt=wt.id,q=ut.id}let Q=n.getRenderTarget(),_e=n.state.buffers.depth.getReversed(),ze=P.isInstancedMesh===!0,ge=P.isBatchedMesh===!0,Xe=!!x.map,Xt=!!x.matcap,Ze=!!te,at=!!x.aoMap,Et=!!x.lightMap,Ke=!!x.bumpMap&&x.wireframe===!1,It=!!x.normalMap,Kt=!!x.displacementMap,Un=!!x.emissiveMap,Nt=!!x.metalnessMap,zt=!!x.roughnessMap,N=x.anisotropy>0,dn=x.clearcoat>0,ht=x.dispersion>0,T=x.retroreflectivity>0,y=x.iridescence>0,k=x.sheen>0,H=x.transmission>0,$=N&&!!x.anisotropyMap,ie=dn&&!!x.clearcoatMap,se=dn&&!!x.clearcoatNormalMap,X=dn&&!!x.clearcoatRoughnessMap,K=y&&!!x.iridescenceMap,oe=y&&!!x.iridescenceThicknessMap,we=k&&!!x.sheenColorMap,ue=k&&!!x.sheenRoughnessMap,ae=!!x.specularMap,Te=!!x.specularColorMap,Oe=!!x.specularIntensityMap,je=H&&!!x.transmissionMap,R=H&&!!x.thicknessMap,ce=!!x.gradientMap,Z=!!x.alphaMap,le=x.alphaTest>0,he=!!x.alphaHash,ee=!!x.extensions,De=Fi;x.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(De=n.toneMapping);let Se={shaderID:Y,shaderType:x.type,shaderName:x.name,vertexShader:St,fragmentShader:rt,defines:x.defines,customVertexShaderID:lt,customFragmentShaderID:q,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:ge,batchingColor:ge&&P._colorsTexture!==null,instancing:ze,instancingColor:ze&&P.instanceColor!==null,instancingMorph:ze&&P.morphTexture!==null,outputColorSpace:Q===null?n.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:tt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Xe,matcap:Xt,envMap:Ze,envMapMode:Ze&&te.mapping,envMapCubeUVHeight:W,aoMap:at,lightMap:Et,bumpMap:Ke,normalMap:It,displacementMap:Kt,emissiveMap:Un,normalMapObjectSpace:It&&x.normalMapType===LA,normalMapTangentSpace:It&&x.normalMapType===gx,packedNormalMap:It&&x.normalMapType===gx&&D5(x.normalMap.format),metalnessMap:Nt,roughnessMap:zt,anisotropy:N,anisotropyMap:$,clearcoat:dn,clearcoatMap:ie,clearcoatNormalMap:se,clearcoatRoughnessMap:X,dispersion:ht,retroreflection:T,iridescence:y,iridescenceMap:K,iridescenceThicknessMap:oe,sheen:k,sheenColorMap:we,sheenRoughnessMap:ue,specularMap:ae,specularColorMap:Te,specularIntensityMap:Oe,transmission:H,transmissionMap:je,thicknessMap:R,gradientMap:ce,opaque:x.transparent===!1&&x.blending===pc&&x.alphaToCoverage===!1,alphaMap:Z,alphaTest:le,alphaHash:he,combine:x.combine,mapUv:Xe&&p(x.map.channel),aoMapUv:at&&p(x.aoMap.channel),lightMapUv:Et&&p(x.lightMap.channel),bumpMapUv:Ke&&p(x.bumpMap.channel),normalMapUv:It&&p(x.normalMap.channel),displacementMapUv:Kt&&p(x.displacementMap.channel),emissiveMapUv:Un&&p(x.emissiveMap.channel),metalnessMapUv:Nt&&p(x.metalnessMap.channel),roughnessMapUv:zt&&p(x.roughnessMap.channel),anisotropyMapUv:$&&p(x.anisotropyMap.channel),clearcoatMapUv:ie&&p(x.clearcoatMap.channel),clearcoatNormalMapUv:se&&p(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:X&&p(x.clearcoatRoughnessMap.channel),iridescenceMapUv:K&&p(x.iridescenceMap.channel),iridescenceThicknessMapUv:oe&&p(x.iridescenceThicknessMap.channel),sheenColorMapUv:we&&p(x.sheenColorMap.channel),sheenRoughnessMapUv:ue&&p(x.sheenRoughnessMap.channel),specularMapUv:ae&&p(x.specularMap.channel),specularColorMapUv:Te&&p(x.specularColorMap.channel),specularIntensityMapUv:Oe&&p(x.specularIntensityMap.channel),transmissionMapUv:je&&p(x.transmissionMap.channel),thicknessMapUv:R&&p(x.thicknessMap.channel),alphaMapUv:Z&&p(x.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(It||N),vertexNormals:!!V.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!V.attributes.uv&&(Xe||Z),fog:!!O,useFog:x.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||V.attributes.normal===void 0&&It===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:_e,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:V.attributes.position!==void 0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:Ne,morphTextureStride:Ce,numSunLights:C.sun.length,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numSunLightShadows:C.sunShadowMap.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:De,decodeVideoTexture:Xe&&x.map.isVideoTexture===!0&&tt.getTransfer(x.map.colorSpace)===ft,decodeVideoTextureEmissive:Un&&x.emissiveMap.isVideoTexture===!0&&tt.getTransfer(x.emissiveMap.colorSpace)===ft,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===qt,flipSided:x.side===Ln,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ee&&x.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ee&&x.extensions.multiDraw===!0||ge)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Se.vertexUv1s=c.has(1),Se.vertexUv2s=c.has(2),Se.vertexUv3s=c.has(3),c.clear(),Se}function m(x){let C=[];if(x.shaderID?C.push(x.shaderID):(C.push(x.customVertexShaderID),C.push(x.customFragmentShaderID)),x.defines!==void 0)for(let F in x.defines)C.push(F),C.push(x.defines[F]);return x.isRawShaderMaterial===!1&&(g(C,x),M(C,x),C.push(n.outputColorSpace)),C.push(x.customProgramCacheKey),C.join()}function g(x,C){x.push(C.precision),x.push(C.outputColorSpace),x.push(C.envMapMode),x.push(C.envMapCubeUVHeight),x.push(C.mapUv),x.push(C.alphaMapUv),x.push(C.lightMapUv),x.push(C.aoMapUv),x.push(C.bumpMapUv),x.push(C.normalMapUv),x.push(C.displacementMapUv),x.push(C.emissiveMapUv),x.push(C.metalnessMapUv),x.push(C.roughnessMapUv),x.push(C.anisotropyMapUv),x.push(C.clearcoatMapUv),x.push(C.clearcoatNormalMapUv),x.push(C.clearcoatRoughnessMapUv),x.push(C.iridescenceMapUv),x.push(C.iridescenceThicknessMapUv),x.push(C.sheenColorMapUv),x.push(C.sheenRoughnessMapUv),x.push(C.specularMapUv),x.push(C.specularColorMapUv),x.push(C.specularIntensityMapUv),x.push(C.transmissionMapUv),x.push(C.thicknessMapUv),x.push(C.combine),x.push(C.fogExp2),x.push(C.sizeAttenuation),x.push(C.morphTargetsCount),x.push(C.morphAttributeCount),x.push(C.numSunLights),x.push(C.numDirLights),x.push(C.numPointLights),x.push(C.numSpotLights),x.push(C.numSpotLightMaps),x.push(C.numHemiLights),x.push(C.numRectAreaLights),x.push(C.numSunLightShadows),x.push(C.numDirLightShadows),x.push(C.numPointLightShadows),x.push(C.numSpotLightShadows),x.push(C.numSpotLightShadowsWithMaps),x.push(C.numLightProbes),x.push(C.shadowMapType),x.push(C.toneMapping),x.push(C.numClippingPlanes),x.push(C.numClipIntersection),x.push(C.depthPacking)}function M(x,C){o.disableAll(),C.instancing&&o.enable(0),C.instancingColor&&o.enable(1),C.instancingMorph&&o.enable(2),C.matcap&&o.enable(3),C.envMap&&o.enable(4),C.normalMapObjectSpace&&o.enable(5),C.normalMapTangentSpace&&o.enable(6),C.clearcoat&&o.enable(7),C.iridescence&&o.enable(8),C.alphaTest&&o.enable(9),C.vertexColors&&o.enable(10),C.vertexAlphas&&o.enable(11),C.vertexUv1s&&o.enable(12),C.vertexUv2s&&o.enable(13),C.vertexUv3s&&o.enable(14),C.vertexTangents&&o.enable(15),C.anisotropy&&o.enable(16),C.alphaHash&&o.enable(17),C.batching&&o.enable(18),C.dispersion&&o.enable(19),C.retroreflection&&o.enable(24),C.batchingColor&&o.enable(20),C.gradientMap&&o.enable(21),C.packedNormalMap&&o.enable(22),C.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),C.fog&&o.enable(0),C.useFog&&o.enable(1),C.flatShading&&o.enable(2),C.logarithmicDepthBuffer&&o.enable(3),C.reversedDepthBuffer&&o.enable(4),C.skinning&&o.enable(5),C.morphTargets&&o.enable(6),C.morphNormals&&o.enable(7),C.morphColors&&o.enable(8),C.premultipliedAlpha&&o.enable(9),C.shadowMapEnabled&&o.enable(10),C.doubleSided&&o.enable(11),C.flipSided&&o.enable(12),C.useDepthPacking&&o.enable(13),C.dithering&&o.enable(14),C.transmission&&o.enable(15),C.sheen&&o.enable(16),C.opaque&&o.enable(17),C.pointsUvs&&o.enable(18),C.decodeVideoTexture&&o.enable(19),C.decodeVideoTextureEmissive&&o.enable(20),C.alphaToCoverage&&o.enable(21),C.numLightProbeGrids>0&&o.enable(22),C.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function w(x){let C=h[x.type],F;if(C){let L=kn[C];F=Gu.clone(L.uniforms)}else F=x.uniforms;return F}function _(x,C){let F=u.get(C);return F!==void 0?++F.usedTimes:(F=new T5(n,C,x,r),l.push(F),u.set(C,F)),F}function S(x){if(--x.usedTimes===0){let C=l.indexOf(x);l[C]=l[l.length-1],l.pop(),u.delete(x.cacheKey),x.destroy()}}function E(x){a.remove(x)}function D(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:w,acquireProgram:_,releaseProgram:S,releaseShaderCache:E,programs:l,dispose:D}}function I5(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,c){n.get(o)[a]=c}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function R5(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function yI(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function vI(){let n=[],e=0,t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(f){let h=0;return f.isInstancedMesh&&(h+=2),f.isSkinnedMesh&&(h+=1),h}function a(f,h,p,v,m,g){let M=n[e];return M===void 0?(M={id:f.id,object:f,geometry:h,material:p,materialVariant:o(f),groupOrder:v,renderOrder:f.renderOrder,z:m,group:g},n[e]=M):(M.id=f.id,M.object=f,M.geometry=h,M.material=p,M.materialVariant=o(f),M.groupOrder=v,M.renderOrder=f.renderOrder,M.z=m,M.group=g),e++,M}function c(f,h,p,v,m,g,M){M.reversedDepth===!0&&(m=-m);let w=a(f,h,p,v,m,g);p.transmission>0?i.push(w):p.transparent===!0?r.push(w):t.push(w)}function l(f,h,p,v,m,g){let M=a(f,h,p,v,m,g);p.transmission>0?i.unshift(M):p.transparent===!0?r.unshift(M):t.unshift(M)}function u(f,h){t.length>1&&t.sort(f||R5),i.length>1&&i.sort(h||yI),r.length>1&&r.sort(h||yI)}function d(){for(let f=e,h=n.length;f<h;f++){let p=n[f];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:c,unshift:l,finish:d,sort:u}}function N5(){let n=new WeakMap;function e(i,r){let s=n.get(i),o;return s===void 0?(o=new vI,n.set(i,[o])):r>=s.length?(o=new vI,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function P5(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new A,color:new nt};break;case"SpotLight":t={position:new A,direction:new A,color:new nt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new A,color:new nt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new A,skyColor:new nt,groundColor:new nt};break;case"RectAreaLight":t={color:new nt,position:new A,halfWidth:new A,halfHeight:new A};break}return n[e.id]=t,t}}}function F5(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var O5=0;function L5(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function k5(n){let e=new P5,t=F5(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new A);let r=new A,s=new Rt,o=new Rt;function a(l){let u=0,d=0,f=0;for(let P=0;P<9;P++)i.probe[P].set(0,0,0);let h=0,p=0,v=0,m=0,g=0,M=0,w=0,_=0,S=0,E=0,D=0,x=0,C=0,F=0;l.sort(L5);for(let P=0,z=l.length;P<z;P++){let O=l[P],V=O.color,J=O.intensity,j=O.distance,te=null;if(O.shadow&&O.shadow.map&&(O.shadow.map.texture.format===Es?te=O.shadow.map.texture:te=O.shadow.map.depthTexture||O.shadow.map.texture),O.isAmbientLight)u+=V.r*J,d+=V.g*J,f+=V.b*J;else if(O.isLightProbe){for(let W=0;W<9;W++)i.probe[W].addScaledVector(O.sh.coefficients[W],J);F++}else if(O.isSunLight){let W=e.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let Y=O.shadow,ne=t.get(O);ne.shadowIntensity=Y.intensity,ne.shadowBias=Y.bias,ne.shadowNormalBias=Y.normalBias,ne.shadowRadius=Y.radius,ne.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),i.sunShadow[p]=ne,i.sunShadowMap[p]=te;let Ne=Y.getViewportCount();for(let Ce=0;Ce<Ne;Ce++)i.sunShadowMatrix[v+Ce]=Y.getMatrix(Ce),i.sunShadowCascade[v+Ce]=Y._cascadeData[Ce];v+=Ne,p++}i.sun[h]=W,h++}else if(O.isDirectionalLight){let W=e.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let Y=O.shadow,ne=t.get(O);ne.shadowIntensity=Y.intensity,ne.shadowBias=Y.bias,ne.shadowNormalBias=Y.normalBias,ne.shadowRadius=Y.radius,ne.shadowMapSize=Y.mapSize,i.directionalShadow[m]=ne,i.directionalShadowMap[m]=te,i.directionalShadowMatrix[m]=O.shadow.matrix,S++}i.directional[m]=W,m++}else if(O.isSpotLight){let W=e.get(O);W.position.setFromMatrixPosition(O.matrixWorld),W.color.copy(V).multiplyScalar(J),W.distance=j,W.coneCos=Math.cos(O.angle),W.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),W.decay=O.decay,i.spot[M]=W;let Y=O.shadow;if(O.map&&(i.spotLightMap[x]=O.map,x++,Y.updateMatrices(O),O.castShadow&&C++),i.spotLightMatrix[M]=Y.matrix,O.castShadow){let ne=t.get(O);ne.shadowIntensity=Y.intensity,ne.shadowBias=Y.bias,ne.shadowNormalBias=Y.normalBias,ne.shadowRadius=Y.radius,ne.shadowMapSize=Y.mapSize,i.spotShadow[M]=ne,i.spotShadowMap[M]=te,D++}M++}else if(O.isRectAreaLight){let W=e.get(O);W.color.copy(V).multiplyScalar(J),W.halfWidth.set(O.width*.5,0,0),W.halfHeight.set(0,O.height*.5,0),i.rectArea[w]=W,w++}else if(O.isPointLight){let W=e.get(O);if(W.color.copy(O.color).multiplyScalar(O.intensity),W.distance=O.distance,W.decay=O.decay,O.castShadow){let Y=O.shadow,ne=t.get(O);ne.shadowIntensity=Y.intensity,ne.shadowBias=Y.bias,ne.shadowNormalBias=Y.normalBias,ne.shadowRadius=Y.radius,ne.shadowMapSize=Y.mapSize,ne.shadowCameraNear=Y.camera.near,ne.shadowCameraFar=Y.camera.far,i.pointShadow[g]=ne,i.pointShadowMap[g]=te,i.pointShadowMatrix[g]=O.shadow.matrix,E++}i.point[g]=W,g++}else if(O.isHemisphereLight){let W=e.get(O);W.skyColor.copy(O.color).multiplyScalar(J),W.groundColor.copy(O.groundColor).multiplyScalar(J),i.hemi[_]=W,_++}}w>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=re.LTC_FLOAT_1,i.rectAreaLTC2=re.LTC_FLOAT_2):(i.rectAreaLTC1=re.LTC_HALF_1,i.rectAreaLTC2=re.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=f;let L=i.hash;(L.sunLength!==h||L.directionalLength!==m||L.pointLength!==g||L.spotLength!==M||L.rectAreaLength!==w||L.hemiLength!==_||L.numSunShadows!==p||L.numDirectionalShadows!==S||L.numPointShadows!==E||L.numSpotShadows!==D||L.numSpotMaps!==x||L.numLightProbes!==F)&&(i.sun.length=h,i.directional.length=m,i.spot.length=M,i.rectArea.length=w,i.point.length=g,i.hemi.length=_,i.sunShadow.length=p,i.sunShadowMap.length=p,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.directionalShadowMatrix.length=S,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=D,i.spotShadowMap.length=D,i.spotLightMatrix.length=D+x-C,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=F,L.sunLength=h,L.directionalLength=m,L.pointLength=g,L.spotLength=M,L.rectAreaLength=w,L.hemiLength=_,L.numSunShadows=p,L.numDirectionalShadows=S,L.numPointShadows=E,L.numSpotShadows=D,L.numSpotMaps=x,L.numLightProbes=F,i.version=O5++)}function c(l,u){let d=0,f=0,h=0,p=0,v=0,m=0,g=u.matrixWorldInverse;for(let M=0,w=l.length;M<w;M++){let _=l[M];if(_.isSunLight){let S=i.sun[d];S.direction.setFromMatrixPosition(_.matrixWorld),S.direction.transformDirection(g),d++}else if(_.isDirectionalLight){let S=i.directional[f];S.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(g),f++}else if(_.isSpotLight){let S=i.spot[p];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(g),S.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),S.direction.sub(r),S.direction.transformDirection(g),p++}else if(_.isRectAreaLight){let S=i.rectArea[v];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(g),o.identity(),s.copy(_.matrixWorld),s.premultiply(g),o.extractRotation(s),S.halfWidth.set(_.width*.5,0,0),S.halfHeight.set(0,_.height*.5,0),S.halfWidth.applyMatrix4(o),S.halfHeight.applyMatrix4(o),v++}else if(_.isPointLight){let S=i.point[h];S.position.setFromMatrixPosition(_.matrixWorld),S.position.applyMatrix4(g),h++}else if(_.isHemisphereLight){let S=i.hemi[m];S.direction.setFromMatrixPosition(_.matrixWorld),S.direction.transformDirection(g),m++}}}return{setup:a,setupView:c,state:i}}function _I(n){let e=new k5(n),t=[],i=[],r=[];function s(f){d.camera=f,t.length=0,i.length=0,r.length=0}function o(f){t.push(f)}function a(f){i.push(f)}function c(f){r.push(f)}function l(){e.setup(t)}function u(f){e.setupView(t,f)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:d,setupLights:l,setupLightsView:u,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function U5(n){let e=new WeakMap;function t(r,s=0){let o=e.get(r),a;return o===void 0?(a=new _I(n),e.set(r,[a])):s>=o.length?(a=new _I(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var B5=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,V5=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,H5=[new A(1,0,0),new A(-1,0,0),new A(0,1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1)],z5=[new A(0,-1,0),new A(0,-1,0),new A(0,0,1),new A(0,0,-1),new A(0,-1,0),new A(0,-1,0)],xI=new Rt,Wu=new A,Rx=new A;function G5(n,e,t){let i=new pu,r=new pe,s=new pe,o=new mt,a=new Np,c=new Pp,l={},u=t.maxTextureSize,d={[cr]:Ln,[Ln]:cr,[qt]:qt},f=new On({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pe},radius:{value:4}},vertexShader:B5,fragmentShader:V5}),h=f.clone();h.defines.HORIZONTAL_PASS=1;let p=new on;p.setAttribute("position",new Fn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new vt(p,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fu;let g=this.type;this.render=function(E,D,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===hA&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Fu);let C=n.getRenderTarget(),F=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),P=n.state;P.setBlending(lr),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let z=g!==this.type;z&&D.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(V=>V.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,V=E.length;O<V;O++){let J=E[O],j=J.shadow;if(j===void 0){Le("WebGLShadowMap:",J,"has no shadow.");continue}if(j.autoUpdate===!1&&j.needsUpdate===!1)continue;r.copy(j.mapSize);let te=j.getFrameExtents();r.multiply(te),s.copy(j.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(s.x=Math.floor(u/te.x),r.x=s.x*te.x,j.mapSize.x=s.x),r.y>u&&(s.y=Math.floor(u/te.y),r.y=s.y*te.y,j.mapSize.y=s.y));let W=n.state.buffers.depth.getReversed();if(j.camera._reversedDepth=W,j.map===null||z===!0){if(j.map!==null&&(j.map.depthTexture!==null&&(j.map.depthTexture.dispose(),j.map.depthTexture=null),j.map.dispose()),this.type===hc){if(J.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}j.map=new $n(r.x,r.y,{format:Es,type:ki,minFilter:$t,magFilter:$t,generateMipmaps:!1}),j.map.texture.name=J.name+".shadowMap",j.map.depthTexture=new ms(r.x,r.y,Li),j.map.depthTexture.name=J.name+".shadowMapDepth",j.map.depthTexture.format=ir,j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=Ht,j.map.depthTexture.magFilter=Ht}else J.isPointLight?(j.map=new Fm(r.x),j.map.depthTexture=new Ep(r.x,Oi)):(j.map=new $n(r.x,r.y),j.map.depthTexture=new ms(r.x,r.y,Oi)),j.map.depthTexture.name=J.name+".shadowMap",j.map.depthTexture.format=ir,this.type===Fu?(j.map.depthTexture.compareFunction=W?Im:Am,j.map.depthTexture.minFilter=$t,j.map.depthTexture.magFilter=$t):(j.map.depthTexture.compareFunction=null,j.map.depthTexture.minFilter=Ht,j.map.depthTexture.magFilter=Ht);j.camera.updateProjectionMatrix()}j.map.isWebGLCubeRenderTarget!==!0&&(j.map.width!==r.x||j.map.height!==r.y)&&j.map.setSize(r.x,r.y);let Y=j.map.isWebGLCubeRenderTarget?6:j.getViewportCount();J.isPointLight!==!0&&j.updateMatrices(J,x);for(let ne=0;ne<Y;ne++){let Ne=j.getCamera(ne);if(J.isPointLight){let Ce=j.camera,St=j.matrix,rt=J.distance||Ce.far;rt!==Ce.far&&(Ce.far=rt,Ce.updateProjectionMatrix()),Wu.setFromMatrixPosition(J.matrixWorld),Ce.position.copy(Wu),Rx.copy(Ce.position),Rx.add(H5[ne]),Ce.up.copy(z5[ne]),Ce.lookAt(Rx),Ce.updateMatrixWorld(),St.makeTranslation(-Wu.x,-Wu.y,-Wu.z),xI.multiplyMatrices(Ce.projectionMatrix,Ce.matrixWorldInverse),j._frustum.setFromProjectionMatrix(xI,Ce.coordinateSystem,Ce.reversedDepth)}if(j.map.isWebGLCubeRenderTarget)n.setRenderTarget(j.map,ne),n.clear();else{ne===0&&(n.setRenderTarget(j.map),n.clear());let Ce=j.getViewport(ne);o.set(s.x*Ce.x,s.y*Ce.y,s.x*Ce.z,s.y*Ce.w),P.viewport(o)}i=j.getFrustum(ne),_(D,x,Ne,J,this.type)}j.isPointLightShadow!==!0&&this.type===hc&&M(j,x),j.needsUpdate=!1}g=this.type,m.needsUpdate=!1,n.setRenderTarget(C,F,L)};function M(E,D){let x=e.update(v);f.defines.VSM_SAMPLES!==E.blurSamples&&(f.defines.VSM_SAMPLES=E.blurSamples,h.defines.VSM_SAMPLES=E.blurSamples,f.needsUpdate=!0,h.needsUpdate=!0),E.mapPass===null?E.mapPass=new $n(r.x,r.y,{format:Es,type:ki}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),f.uniforms.shadow_pass.value=E.map.depthTexture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,n.setRenderTarget(E.mapPass),n.clear(),n.renderBufferDirect(D,null,x,f,v,null),h.uniforms.shadow_pass.value=E.mapPass.texture,h.uniforms.resolution.value.set(E.map.width,E.map.height),h.uniforms.radius.value=E.radius,n.setRenderTarget(E.map),n.clear(),n.renderBufferDirect(D,null,x,h,v,null)}function w(E,D,x,C){let F=null,L=x.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)F=L;else if(F=x.isPointLight===!0?c:a,n.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){let P=F.uuid,z=D.uuid,O=l[P];O===void 0&&(O={},l[P]=O);let V=O[z];V===void 0&&(V=F.clone(),O[z]=V,D.addEventListener("dispose",S)),F=V}if(F.visible=D.visible,F.wireframe=D.wireframe,C===hc?F.side=D.shadowSide!==null?D.shadowSide:D.side:F.side=D.shadowSide!==null?D.shadowSide:d[D.side],F.alphaMap=D.alphaMap,F.alphaTest=D.alphaToCoverage===!0?.5:D.alphaTest,F.map=D.map,F.clipShadows=D.clipShadows,F.clippingPlanes=D.clippingPlanes,F.clipIntersection=D.clipIntersection,F.displacementMap=D.displacementMap,F.displacementScale=D.displacementScale,F.displacementBias=D.displacementBias,F.wireframeLinewidth=D.wireframeLinewidth,F.linewidth=D.linewidth,x.isPointLight===!0&&F.isMeshDistanceMaterial===!0){let P=n.properties.get(F);P.light=x}return F}function _(E,D,x,C,F){if(E.visible===!1)return;if(E.layers.test(D.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&F===hc)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,E.matrixWorld);let z=e.update(E),O=E.material;if(Array.isArray(O)){let V=z.groups;for(let J=0,j=V.length;J<j;J++){let te=V[J],W=O[te.materialIndex];if(W&&W.visible){let Y=w(E,W,C,F);E.onBeforeShadow(n,E,D,x,z,Y,te),n.renderBufferDirect(x,null,z,Y,E,te),E.onAfterShadow(n,E,D,x,z,Y,te)}}}else if(O.visible){let V=w(E,O,C,F);E.onBeforeShadow(n,E,D,x,z,V,null),n.renderBufferDirect(x,null,z,V,E,null),E.onAfterShadow(n,E,D,x,z,V,null)}}let P=E.children;for(let z=0,O=P.length;z<O;z++)_(P[z],D,x,C,F)}function S(E){E.target.removeEventListener("dispose",S);for(let x in l){let C=l[x],F=E.target.uuid;F in C&&(C[F].dispose(),delete C[F])}}}function j5(n,e){function t(){let R=!1,ce=new mt,Z=null,le=new mt(0,0,0,0);return{setMask:function(he){Z!==he&&!R&&(n.colorMask(he,he,he,he),Z=he)},setLocked:function(he){R=he},setClear:function(he,ee,De,Se,wt){wt===!0&&(he*=Se,ee*=Se,De*=Se),ce.set(he,ee,De,Se),le.equals(ce)===!1&&(n.clearColor(he,ee,De,Se),le.copy(ce))},reset:function(){R=!1,Z=null,le.set(-1,0,0,0)}}}function i(){let R=!1,ce=!1,Z=null,le=null,he=null;return{setReversed:function(ee){if(ce!==ee){let De=e.get("EXT_clip_control");ee?De.clipControlEXT(De.LOWER_LEFT_EXT,De.ZERO_TO_ONE_EXT):De.clipControlEXT(De.LOWER_LEFT_EXT,De.NEGATIVE_ONE_TO_ONE_EXT),ce=ee;let Se=he;he=null,this.setClear(Se)}},getReversed:function(){return ce},setTest:function(ee){ee?Q(n.DEPTH_TEST):_e(n.DEPTH_TEST)},setMask:function(ee){Z!==ee&&!R&&(n.depthMask(ee),Z=ee)},setFunc:function(ee){if(ce&&(ee=qA[ee]),le!==ee){switch(ee){case lp:n.depthFunc(n.NEVER);break;case up:n.depthFunc(n.ALWAYS);break;case dp:n.depthFunc(n.LESS);break;case sc:n.depthFunc(n.LEQUAL);break;case fp:n.depthFunc(n.EQUAL);break;case hp:n.depthFunc(n.GEQUAL);break;case pp:n.depthFunc(n.GREATER);break;case mp:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}le=ee}},setLocked:function(ee){R=ee},setClear:function(ee){he!==ee&&(he=ee,ce&&(ee=1-ee),n.clearDepth(ee))},reset:function(){R=!1,Z=null,le=null,he=null,ce=!1}}}function r(){let R=!1,ce=null,Z=null,le=null,he=null,ee=null,De=null,Se=null,wt=null;return{setTest:function(ut){R||(ut?Q(n.STENCIL_TEST):_e(n.STENCIL_TEST))},setMask:function(ut){ce!==ut&&!R&&(n.stencilMask(ut),ce=ut)},setFunc:function(ut,yi,Ui){(Z!==ut||le!==yi||he!==Ui)&&(n.stencilFunc(ut,yi,Ui),Z=ut,le=yi,he=Ui)},setOp:function(ut,yi,Ui){(ee!==ut||De!==yi||Se!==Ui)&&(n.stencilOp(ut,yi,Ui),ee=ut,De=yi,Se=Ui)},setLocked:function(ut){R=ut},setClear:function(ut){wt!==ut&&(n.clearStencil(ut),wt=ut)},reset:function(){R=!1,ce=null,Z=null,le=null,he=null,ee=null,De=null,Se=null,wt=null}}}let s=new t,o=new i,a=new r,c=new WeakMap,l=new WeakMap,u={},d={},f={},h=new WeakMap,p=[],v=null,m=!1,g=null,M=null,w=null,_=null,S=null,E=null,D=null,x=new nt(0,0,0),C=0,F=!1,L=null,P=null,z=null,O=null,V=null,J=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),j=!1,te=0,W=n.getParameter(n.VERSION);W.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(W)[1]),j=te>=1):W.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),j=te>=2);let Y=null,ne={},Ne=n.getParameter(n.SCISSOR_BOX),Ce=n.getParameter(n.VIEWPORT),St=new mt().fromArray(Ne),rt=new mt().fromArray(Ce);function lt(R,ce,Z,le){let he=new Uint8Array(4),ee=n.createTexture();n.bindTexture(R,ee),n.texParameteri(R,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(R,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let De=0;De<Z;De++)R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY?n.texImage3D(ce,0,n.RGBA,1,1,le,0,n.RGBA,n.UNSIGNED_BYTE,he):n.texImage2D(ce+De,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,he);return ee}let q={};q[n.TEXTURE_2D]=lt(n.TEXTURE_2D,n.TEXTURE_2D,1),q[n.TEXTURE_CUBE_MAP]=lt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[n.TEXTURE_2D_ARRAY]=lt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),q[n.TEXTURE_3D]=lt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(n.DEPTH_TEST),o.setFunc(sc),Ke(!1),It(Y0),Q(n.CULL_FACE),at(lr);function Q(R){u[R]!==!0&&(n.enable(R),u[R]=!0)}function _e(R){u[R]!==!1&&(n.disable(R),u[R]=!1)}function ze(R,ce){return f[R]!==ce?(n.bindFramebuffer(R,ce),f[R]=ce,R===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=ce),R===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=ce),!0):!1}function ge(R,ce){let Z=p,le=!1;if(R){Z=h.get(ce),Z===void 0&&(Z=[],h.set(ce,Z));let he=R.textures;if(Z.length!==he.length||Z[0]!==n.COLOR_ATTACHMENT0){for(let ee=0,De=he.length;ee<De;ee++)Z[ee]=n.COLOR_ATTACHMENT0+ee;Z.length=he.length,le=!0}}else Z[0]!==n.BACK&&(Z[0]=n.BACK,le=!0);le&&n.drawBuffers(Z)}function Xe(R){return v!==R?(n.useProgram(R),v=R,!0):!1}let Xt={[Mo]:n.FUNC_ADD,[mA]:n.FUNC_SUBTRACT,[gA]:n.FUNC_REVERSE_SUBTRACT};Xt[yA]=n.MIN,Xt[vA]=n.MAX;let Ze={[_A]:n.ZERO,[xA]:n.ONE,[bA]:n.SRC_COLOR,[Q0]:n.SRC_ALPHA,[CA]:n.SRC_ALPHA_SATURATE,[wA]:n.DST_COLOR,[SA]:n.DST_ALPHA,[MA]:n.ONE_MINUS_SRC_COLOR,[ex]:n.ONE_MINUS_SRC_ALPHA,[TA]:n.ONE_MINUS_DST_COLOR,[EA]:n.ONE_MINUS_DST_ALPHA,[DA]:n.CONSTANT_COLOR,[AA]:n.ONE_MINUS_CONSTANT_COLOR,[IA]:n.CONSTANT_ALPHA,[RA]:n.ONE_MINUS_CONSTANT_ALPHA};function at(R,ce,Z,le,he,ee,De,Se,wt,ut){if(R===lr){m===!0&&(_e(n.BLEND),m=!1);return}if(m===!1&&(Q(n.BLEND),m=!0),R!==pA){if(R!==g||ut!==F){if((M!==Mo||S!==Mo)&&(n.blendEquation(n.FUNC_ADD),M=Mo,S=Mo),ut)switch(R){case pc:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Z0:n.blendFunc(n.ONE,n.ONE);break;case J0:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case K0:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Ue("WebGLState: Invalid blending: ",R);break}else switch(R){case pc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Z0:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case J0:Ue("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case K0:Ue("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ue("WebGLState: Invalid blending: ",R);break}w=null,_=null,E=null,D=null,x.set(0,0,0),C=0,g=R,F=ut}return}he=he||ce,ee=ee||Z,De=De||le,(ce!==M||he!==S)&&(n.blendEquationSeparate(Xt[ce],Xt[he]),M=ce,S=he),(Z!==w||le!==_||ee!==E||De!==D)&&(n.blendFuncSeparate(Ze[Z],Ze[le],Ze[ee],Ze[De]),w=Z,_=le,E=ee,D=De),(Se.equals(x)===!1||wt!==C)&&(n.blendColor(Se.r,Se.g,Se.b,wt),x.copy(Se),C=wt),g=R,F=!1}function Et(R,ce){R.side===qt?_e(n.CULL_FACE):Q(n.CULL_FACE);let Z=R.side===Ln;ce&&(Z=!Z),Ke(Z),R.blending===pc&&R.transparent===!1?at(lr):at(R.blending,R.blendEquation,R.blendSrc,R.blendDst,R.blendEquationAlpha,R.blendSrcAlpha,R.blendDstAlpha,R.blendColor,R.blendAlpha,R.premultipliedAlpha),o.setFunc(R.depthFunc),o.setTest(R.depthTest),o.setMask(R.depthWrite),s.setMask(R.colorWrite);let le=R.stencilWrite;a.setTest(le),le&&(a.setMask(R.stencilWriteMask),a.setFunc(R.stencilFunc,R.stencilRef,R.stencilFuncMask),a.setOp(R.stencilFail,R.stencilZFail,R.stencilZPass)),Un(R.polygonOffset,R.polygonOffsetFactor,R.polygonOffsetUnits),R.alphaToCoverage===!0?Q(n.SAMPLE_ALPHA_TO_COVERAGE):_e(n.SAMPLE_ALPHA_TO_COVERAGE)}function Ke(R){L!==R&&(R?n.frontFace(n.CW):n.frontFace(n.CCW),L=R)}function It(R){R!==dA?(Q(n.CULL_FACE),R!==P&&(R===Y0?n.cullFace(n.BACK):R===fA?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):_e(n.CULL_FACE),P=R}function Kt(R){R!==z&&(j&&n.lineWidth(R),z=R)}function Un(R,ce,Z){R?(Q(n.POLYGON_OFFSET_FILL),(O!==ce||V!==Z)&&(O=ce,V=Z,o.getReversed()&&(ce=-ce),n.polygonOffset(ce,Z))):_e(n.POLYGON_OFFSET_FILL)}function Nt(R){R?Q(n.SCISSOR_TEST):_e(n.SCISSOR_TEST)}function zt(R){R===void 0&&(R=n.TEXTURE0+J-1),Y!==R&&(n.activeTexture(R),Y=R)}function N(R,ce,Z){Z===void 0&&(Y===null?Z=n.TEXTURE0+J-1:Z=Y);let le=ne[Z];le===void 0&&(le={type:void 0,texture:void 0},ne[Z]=le),(le.type!==R||le.texture!==ce)&&(Y!==Z&&(n.activeTexture(Z),Y=Z),n.bindTexture(R,ce||q[R]),le.type=R,le.texture=ce)}function dn(){let R=ne[Y];R!==void 0&&R.type!==void 0&&(n.bindTexture(R.type,null),R.type=void 0,R.texture=void 0)}function ht(){try{n.compressedTexImage2D(...arguments)}catch(R){Ue("WebGLState:",R)}}function T(){try{n.compressedTexImage3D(...arguments)}catch(R){Ue("WebGLState:",R)}}function y(){try{n.texSubImage2D(...arguments)}catch(R){Ue("WebGLState:",R)}}function k(){try{n.texSubImage3D(...arguments)}catch(R){Ue("WebGLState:",R)}}function H(){try{n.compressedTexSubImage2D(...arguments)}catch(R){Ue("WebGLState:",R)}}function $(){try{n.compressedTexSubImage3D(...arguments)}catch(R){Ue("WebGLState:",R)}}function ie(){try{n.texStorage2D(...arguments)}catch(R){Ue("WebGLState:",R)}}function se(){try{n.texStorage3D(...arguments)}catch(R){Ue("WebGLState:",R)}}function X(){try{n.texImage2D(...arguments)}catch(R){Ue("WebGLState:",R)}}function K(){try{n.texImage3D(...arguments)}catch(R){Ue("WebGLState:",R)}}function oe(R){return d[R]!==void 0?d[R]:n.getParameter(R)}function we(R,ce){d[R]!==ce&&(n.pixelStorei(R,ce),d[R]=ce)}function ue(R){St.equals(R)===!1&&(n.scissor(R.x,R.y,R.z,R.w),St.copy(R))}function ae(R){rt.equals(R)===!1&&(n.viewport(R.x,R.y,R.z,R.w),rt.copy(R))}function Te(R,ce){let Z=l.get(ce);Z===void 0&&(Z=new WeakMap,l.set(ce,Z));let le=Z.get(R);le===void 0&&(le=n.getUniformBlockIndex(ce,R.name),Z.set(R,le))}function Oe(R,ce){let le=l.get(ce).get(R);c.get(ce)!==le&&(n.uniformBlockBinding(ce,le,R.__bindingPointIndex),c.set(ce,le))}function je(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},d={},Y=null,ne={},f={},h=new WeakMap,p=[],v=null,m=!1,g=null,M=null,w=null,_=null,S=null,E=null,D=null,x=new nt(0,0,0),C=0,F=!1,L=null,P=null,z=null,O=null,V=null,St.set(0,0,n.canvas.width,n.canvas.height),rt.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:Q,disable:_e,bindFramebuffer:ze,drawBuffers:ge,useProgram:Xe,setBlending:at,setMaterial:Et,setFlipSided:Ke,setCullFace:It,setLineWidth:Kt,setPolygonOffset:Un,setScissorTest:Nt,activeTexture:zt,bindTexture:N,unbindTexture:dn,compressedTexImage2D:ht,compressedTexImage3D:T,texImage2D:X,texImage3D:K,pixelStorei:we,getParameter:oe,updateUBOMapping:Te,uniformBlockBinding:Oe,texStorage2D:ie,texStorage3D:se,texSubImage2D:y,texSubImage3D:k,compressedTexSubImage2D:H,compressedTexSubImage3D:$,scissor:ue,viewport:ae,reset:je}}function W5(n,e,t,i,r,s,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new pe,u=new WeakMap,d=new Set,f,h=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(T){}function v(T,y){return p?new OffscreenCanvas(T,y):ou("canvas")}function m(T,y,k){let H=1,$=ht(T);if(($.width>k||$.height>k)&&(H=k/Math.max($.width,$.height)),H<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let ie=Math.floor(H*$.width),se=Math.floor(H*$.height);f===void 0&&(f=v(ie,se));let X=y?v(ie,se):f;return X.width=ie,X.height=se,X.getContext("2d").drawImage(T,0,0,ie,se),Le("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+ie+"x"+se+")."),X}else return"data"in T&&Le("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),T;return T}function g(T){return T.generateMipmaps}function M(T){n.generateMipmap(T)}function w(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function _(T,y,k,H,$,ie=!1){if(T!==null){if(n[T]!==void 0)return n[T];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let se;H&&(se=e.get("EXT_texture_norm16"),se||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let X=y;if(y===n.RED&&(k===n.FLOAT&&(X=n.R32F),k===n.HALF_FLOAT&&(X=n.R16F),k===n.UNSIGNED_BYTE&&(X=n.R8),k===n.UNSIGNED_SHORT&&se&&(X=se.R16_EXT),k===n.SHORT&&se&&(X=se.R16_SNORM_EXT)),y===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(X=n.R8UI),k===n.UNSIGNED_SHORT&&(X=n.R16UI),k===n.UNSIGNED_INT&&(X=n.R32UI),k===n.BYTE&&(X=n.R8I),k===n.SHORT&&(X=n.R16I),k===n.INT&&(X=n.R32I)),y===n.RG&&(k===n.FLOAT&&(X=n.RG32F),k===n.HALF_FLOAT&&(X=n.RG16F),k===n.UNSIGNED_BYTE&&(X=n.RG8),k===n.UNSIGNED_SHORT&&se&&(X=se.RG16_EXT),k===n.SHORT&&se&&(X=se.RG16_SNORM_EXT)),y===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(X=n.RG8UI),k===n.UNSIGNED_SHORT&&(X=n.RG16UI),k===n.UNSIGNED_INT&&(X=n.RG32UI),k===n.BYTE&&(X=n.RG8I),k===n.SHORT&&(X=n.RG16I),k===n.INT&&(X=n.RG32I)),y===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(X=n.RGB8UI),k===n.UNSIGNED_SHORT&&(X=n.RGB16UI),k===n.UNSIGNED_INT&&(X=n.RGB32UI),k===n.BYTE&&(X=n.RGB8I),k===n.SHORT&&(X=n.RGB16I),k===n.INT&&(X=n.RGB32I)),y===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(X=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(X=n.RGBA16UI),k===n.UNSIGNED_INT&&(X=n.RGBA32UI),k===n.BYTE&&(X=n.RGBA8I),k===n.SHORT&&(X=n.RGBA16I),k===n.INT&&(X=n.RGBA32I)),y===n.RGB&&(k===n.UNSIGNED_SHORT&&se&&(X=se.RGB16_EXT),k===n.SHORT&&se&&(X=se.RGB16_SNORM_EXT),k===n.UNSIGNED_INT_5_9_9_9_REV&&(X=n.RGB9_E5),k===n.UNSIGNED_INT_10F_11F_11F_REV&&(X=n.R11F_G11F_B10F)),y===n.RGBA){let K=ie?ru:tt.getTransfer($);k===n.FLOAT&&(X=n.RGBA32F),k===n.HALF_FLOAT&&(X=n.RGBA16F),k===n.UNSIGNED_BYTE&&(X=K===ft?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT&&se&&(X=se.RGBA16_EXT),k===n.SHORT&&se&&(X=se.RGBA16_SNORM_EXT),k===n.UNSIGNED_SHORT_4_4_4_4&&(X=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(X=n.RGB5_A1)}return(X===n.R16F||X===n.R32F||X===n.RG16F||X===n.RG32F||X===n.RGBA16F||X===n.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function S(T,y){let k;return T?y===null||y===Oi||y===gc?k=n.DEPTH24_STENCIL8:y===Li?k=n.DEPTH32F_STENCIL8:y===mc&&(k=n.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===Oi||y===gc?k=n.DEPTH_COMPONENT24:y===Li?k=n.DEPTH_COMPONENT32F:y===mc&&(k=n.DEPTH_COMPONENT16),k}function E(T,y){return g(T)===!0||T.isFramebufferTexture&&T.minFilter!==Ht&&T.minFilter!==$t?Math.log2(Math.max(y.width,y.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?y.mipmaps.length:1}function D(T){let y=T.target;y.removeEventListener("dispose",D),C(y),y.isVideoTexture&&u.delete(y),y.isHTMLTexture&&d.delete(y)}function x(T){let y=T.target;y.removeEventListener("dispose",x),L(y)}function C(T){let y=i.get(T);if(y.__webglInit===void 0)return;let k=T.source,H=h.get(k);if(H){let $=H[y.__cacheKey];$.usedTimes--,$.usedTimes===0&&F(T),Object.keys(H).length===0&&h.delete(k)}i.remove(T)}function F(T){let y=i.get(T);n.deleteTexture(y.__webglTexture);let k=T.source,H=h.get(k);delete H[y.__cacheKey],o.memory.textures--}function L(T){let y=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let H=0;H<6;H++){if(Array.isArray(y.__webglFramebuffer[H]))for(let $=0;$<y.__webglFramebuffer[H].length;$++)n.deleteFramebuffer(y.__webglFramebuffer[H][$]);else n.deleteFramebuffer(y.__webglFramebuffer[H]);y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer[H])}else{if(Array.isArray(y.__webglFramebuffer))for(let H=0;H<y.__webglFramebuffer.length;H++)n.deleteFramebuffer(y.__webglFramebuffer[H]);else n.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&n.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let H=0;H<y.__webglColorRenderbuffer.length;H++)y.__webglColorRenderbuffer[H]&&n.deleteRenderbuffer(y.__webglColorRenderbuffer[H]);y.__webglDepthRenderbuffer&&n.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let k=T.textures;for(let H=0,$=k.length;H<$;H++){let ie=i.get(k[H]);ie.__webglTexture&&(n.deleteTexture(ie.__webglTexture),o.memory.textures--),i.remove(k[H])}i.remove(T)}let P=0;function z(){P=0}function O(){return P}function V(T){P=T}function J(){let T=P;return T>=r.maxTextures&&Le("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+r.maxTextures),P+=1,T}function j(T){let y=[];return y.push(T.wrapS),y.push(T.wrapT),y.push(T.wrapR||0),y.push(T.magFilter),y.push(T.minFilter),y.push(T.anisotropy),y.push(T.internalFormat),y.push(T.format),y.push(T.type),y.push(T.generateMipmaps),y.push(T.premultiplyAlpha),y.push(T.flipY),y.push(T.unpackAlignment),y.push(T.colorSpace),y.join()}function te(T,y){let k=i.get(T);if(T.isVideoTexture&&N(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&k.__version!==T.version){let H=T.image;if(H===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(H.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{_e(k,T,y);return}}else T.isExternalTexture&&(k.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+y)}function W(T,y){let k=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){_e(k,T,y);return}else T.isExternalTexture&&(k.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+y)}function Y(T,y){let k=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&k.__version!==T.version){_e(k,T,y);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+y)}function ne(T,y){let k=i.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&k.__version!==T.version){ze(k,T,y);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+y)}let Ne={[gp]:n.REPEAT,[tr]:n.CLAMP_TO_EDGE,[yp]:n.MIRRORED_REPEAT},Ce={[Ht]:n.NEAREST,[FA]:n.NEAREST_MIPMAP_NEAREST,[Lu]:n.NEAREST_MIPMAP_LINEAR,[$t]:n.LINEAR,[$p]:n.LINEAR_MIPMAP_NEAREST,[Ms]:n.LINEAR_MIPMAP_LINEAR},St={[UA]:n.NEVER,[GA]:n.ALWAYS,[BA]:n.LESS,[Am]:n.LEQUAL,[VA]:n.EQUAL,[Im]:n.GEQUAL,[HA]:n.GREATER,[zA]:n.NOTEQUAL};function rt(T,y){if(y.type===Li&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===$t||y.magFilter===$p||y.magFilter===Lu||y.magFilter===Ms||y.minFilter===$t||y.minFilter===$p||y.minFilter===Lu||y.minFilter===Ms)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,Ne[y.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,Ne[y.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,Ne[y.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,Ce[y.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,Ce[y.minFilter]),y.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,St[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ht||y.minFilter!==Lu&&y.minFilter!==Ms||y.type===Li&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){let k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(T,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,r.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function lt(T,y){let k=!1;T.__webglInit===void 0&&(T.__webglInit=!0,y.addEventListener("dispose",D));let H=y.source,$=h.get(H);$===void 0&&($={},h.set(H,$));let ie=j(y);if(ie!==T.__cacheKey){$[ie]===void 0&&($[ie]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),$[ie].usedTimes++;let se=$[T.__cacheKey];se!==void 0&&($[T.__cacheKey].usedTimes--,se.usedTimes===0&&F(y)),T.__cacheKey=ie,T.__webglTexture=$[ie].texture}return k}function q(T,y,k){return Math.floor(Math.floor(T/k)/y)}function Q(T,y,k,H){let ie=T.updateRanges;if(ie.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,y.width,y.height,k,H,y.data);else{ie.sort((we,ue)=>we.start-ue.start);let se=0;for(let we=1;we<ie.length;we++){let ue=ie[se],ae=ie[we],Te=ue.start+ue.count,Oe=q(ae.start,y.width,4),je=q(ue.start,y.width,4);ae.start<=Te+1&&Oe===je&&q(ae.start+ae.count-1,y.width,4)===Oe?ue.count=Math.max(ue.count,ae.start+ae.count-ue.start):(++se,ie[se]=ae)}ie.length=se+1;let X=t.getParameter(n.UNPACK_ROW_LENGTH),K=t.getParameter(n.UNPACK_SKIP_PIXELS),oe=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,y.width);for(let we=0,ue=ie.length;we<ue;we++){let ae=ie[we],Te=Math.floor(ae.start/4),Oe=Math.ceil(ae.count/4),je=Te%y.width,R=Math.floor(Te/y.width),ce=Oe,Z=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,je),t.pixelStorei(n.UNPACK_SKIP_ROWS,R),t.texSubImage2D(n.TEXTURE_2D,0,je,R,ce,Z,k,H,y.data)}T.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,X),t.pixelStorei(n.UNPACK_SKIP_PIXELS,K),t.pixelStorei(n.UNPACK_SKIP_ROWS,oe)}}function _e(T,y,k){let H=n.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(H=n.TEXTURE_2D_ARRAY),y.isData3DTexture&&(H=n.TEXTURE_3D);let $=lt(T,y),ie=y.source;t.bindTexture(H,T.__webglTexture,n.TEXTURE0+k);let se=i.get(ie);if(ie.version!==se.__version||$===!0){if(t.activeTexture(n.TEXTURE0+k),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let Z=tt.getPrimaries(tt.workingColorSpace),le=y.colorSpace===Nr?null:tt.getPrimaries(y.colorSpace),he=y.colorSpace===Nr||Z===le?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,he)}t.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment);let K=m(y.image,!1,r.maxTextureSize);K=dn(y,K);let oe=s.convert(y.format,y.colorSpace),we=s.convert(y.type),ue=_(y.internalFormat,oe,we,y.normalized,y.colorSpace,y.isVideoTexture);rt(H,y);let ae,Te=y.mipmaps,Oe=y.isVideoTexture!==!0,je=se.__version===void 0||$===!0,R=ie.dataReady,ce=E(y,K);if(y.isDepthTexture)ue=S(y.format===Ss,y.type),je&&(Oe?t.texStorage2D(n.TEXTURE_2D,1,ue,K.width,K.height):t.texImage2D(n.TEXTURE_2D,0,ue,K.width,K.height,0,oe,we,null));else if(y.isDataTexture)if(Te.length>0){Oe&&je&&t.texStorage2D(n.TEXTURE_2D,ce,ue,Te[0].width,Te[0].height);for(let Z=0,le=Te.length;Z<le;Z++)ae=Te[Z],Oe?R&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,ae.width,ae.height,oe,we,ae.data):t.texImage2D(n.TEXTURE_2D,Z,ue,ae.width,ae.height,0,oe,we,ae.data);y.generateMipmaps=!1}else Oe?(je&&t.texStorage2D(n.TEXTURE_2D,ce,ue,K.width,K.height),R&&Q(y,K,oe,we)):t.texImage2D(n.TEXTURE_2D,0,ue,K.width,K.height,0,oe,we,K.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Oe&&je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,ue,Te[0].width,Te[0].height,K.depth);for(let Z=0,le=Te.length;Z<le;Z++)if(ae=Te[Z],y.format!==mi)if(oe!==null)if(Oe){if(R)if(y.layerUpdates.size>0){let he=wx(ae.width,ae.height,y.format,y.type);for(let ee of y.layerUpdates){let De=ae.data.subarray(ee*he/ae.data.BYTES_PER_ELEMENT,(ee+1)*he/ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,ee,ae.width,ae.height,1,oe,De)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,ae.width,ae.height,K.depth,oe,ae.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Z,ue,ae.width,ae.height,K.depth,0,ae.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Oe?R&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Z,0,0,0,ae.width,ae.height,K.depth,oe,we,ae.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Z,ue,ae.width,ae.height,K.depth,0,oe,we,ae.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Oe&&je&&t.texStorage2D(n.TEXTURE_2D,ce,ue,Te[0].width,Te[0].height);for(let Z=0,le=Te.length;Z<le;Z++)ae=Te[Z],y.format!==mi?oe!==null?Oe?R&&t.compressedTexSubImage2D(n.TEXTURE_2D,Z,0,0,ae.width,ae.height,oe,ae.data):t.compressedTexImage2D(n.TEXTURE_2D,Z,ue,ae.width,ae.height,0,ae.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Oe?R&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,ae.width,ae.height,oe,we,ae.data):t.texImage2D(n.TEXTURE_2D,Z,ue,ae.width,ae.height,0,oe,we,ae.data)}else if(y.isDataArrayTexture)if(Oe){if(je&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,ue,K.width,K.height,K.depth),R)if(y.layerUpdates.size>0){let Z=wx(K.width,K.height,y.format,y.type);for(let le of y.layerUpdates){let he=K.data.subarray(le*Z/K.data.BYTES_PER_ELEMENT,(le+1)*Z/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,le,K.width,K.height,1,oe,we,he)}y.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,oe,we,K.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ue,K.width,K.height,K.depth,0,oe,we,K.data);else if(y.isData3DTexture)Oe?(je&&t.texStorage3D(n.TEXTURE_3D,ce,ue,K.width,K.height,K.depth),R&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,oe,we,K.data)):t.texImage3D(n.TEXTURE_3D,0,ue,K.width,K.height,K.depth,0,oe,we,K.data);else if(y.isFramebufferTexture){if(je)if(Oe)t.texStorage2D(n.TEXTURE_2D,ce,ue,K.width,K.height);else{let Z=K.width,le=K.height;for(let he=0;he<ce;he++)t.texImage2D(n.TEXTURE_2D,he,ue,Z,le,0,oe,we,null),Z>>=1,le>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in n){let Z=n.canvas;if(Z.hasAttribute("layoutsubtree")||Z.setAttribute("layoutsubtree","true"),K.parentNode!==Z){Z.appendChild(K),d.add(y),Z.onpaint=le=>{let he=le.changedElements;for(let ee of d)he.includes(ee.image)&&(ee.needsUpdate=!0)},Z.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,K);else{let he=n.RGBA,ee=n.RGBA,De=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,he,ee,De,K)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Te.length>0){if(Oe&&je){let Z=ht(Te[0]);t.texStorage2D(n.TEXTURE_2D,ce,ue,Z.width,Z.height)}for(let Z=0,le=Te.length;Z<le;Z++)ae=Te[Z],Oe?R&&t.texSubImage2D(n.TEXTURE_2D,Z,0,0,oe,we,ae):t.texImage2D(n.TEXTURE_2D,Z,ue,oe,we,ae);y.generateMipmaps=!1}else if(Oe){if(je){let Z=ht(K);t.texStorage2D(n.TEXTURE_2D,ce,ue,Z.width,Z.height)}R&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,oe,we,K)}else t.texImage2D(n.TEXTURE_2D,0,ue,oe,we,K);g(y)&&M(H),se.__version=ie.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function ze(T,y,k){if(y.image.length!==6)return;let H=lt(T,y),$=y.source;t.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+k);let ie=i.get($);if($.version!==ie.__version||H===!0){t.activeTexture(n.TEXTURE0+k);let se=tt.getPrimaries(tt.workingColorSpace),X=y.colorSpace===Nr?null:tt.getPrimaries(y.colorSpace),K=y.colorSpace===Nr||se===X?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let oe=y.isCompressedTexture||y.image[0].isCompressedTexture,we=y.image[0]&&y.image[0].isDataTexture,ue=[];for(let ee=0;ee<6;ee++)!oe&&!we?ue[ee]=m(y.image[ee],!0,r.maxCubemapSize):ue[ee]=we?y.image[ee].image:y.image[ee],ue[ee]=dn(y,ue[ee]);let ae=ue[0],Te=s.convert(y.format,y.colorSpace),Oe=s.convert(y.type),je=_(y.internalFormat,Te,Oe,y.normalized,y.colorSpace),R=y.isVideoTexture!==!0,ce=ie.__version===void 0||H===!0,Z=$.dataReady,le=E(y,ae);rt(n.TEXTURE_CUBE_MAP,y);let he;if(oe){R&&ce&&t.texStorage2D(n.TEXTURE_CUBE_MAP,le,je,ae.width,ae.height);for(let ee=0;ee<6;ee++){he=ue[ee].mipmaps;for(let De=0;De<he.length;De++){let Se=he[De];y.format!==mi?Te!==null?R?Z&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De,0,0,Se.width,Se.height,Te,Se.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De,je,Se.width,Se.height,0,Se.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):R?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De,0,0,Se.width,Se.height,Te,Oe,Se.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De,je,Se.width,Se.height,0,Te,Oe,Se.data)}}}else{if(he=y.mipmaps,R&&ce){he.length>0&&le++;let ee=ht(ue[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,le,je,ee.width,ee.height)}for(let ee=0;ee<6;ee++)if(we){R?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,ue[ee].width,ue[ee].height,Te,Oe,ue[ee].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,je,ue[ee].width,ue[ee].height,0,Te,Oe,ue[ee].data);for(let De=0;De<he.length;De++){let wt=he[De].image[ee].image;R?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De+1,0,0,wt.width,wt.height,Te,Oe,wt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De+1,je,wt.width,wt.height,0,Te,Oe,wt.data)}}else{R?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,0,0,Te,Oe,ue[ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0,je,Te,Oe,ue[ee]);for(let De=0;De<he.length;De++){let Se=he[De];R?Z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De+1,0,0,Te,Oe,Se.image[ee]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ee,De+1,je,Te,Oe,Se.image[ee])}}}g(y)&&M(n.TEXTURE_CUBE_MAP),ie.__version=$.version,y.onUpdate&&y.onUpdate(y)}T.__version=y.version}function ge(T,y,k,H,$,ie){let se=s.convert(k.format,k.colorSpace),X=s.convert(k.type),K=_(k.internalFormat,se,X,k.normalized,k.colorSpace),oe=i.get(y),we=i.get(k);if(we.__renderTarget=y,!oe.__hasExternalTextures){let ue=Math.max(1,y.width>>ie),ae=Math.max(1,y.height>>ie);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?t.texImage3D($,ie,K,ue,ae,y.depth,0,se,X,null):t.texImage2D($,ie,K,ue,ae,0,se,X,null)}t.bindFramebuffer(n.FRAMEBUFFER,T),zt(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,H,$,we.__webglTexture,0,Nt(y)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,H,$,we.__webglTexture,ie),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Xe(T,y,k){if(n.bindRenderbuffer(n.RENDERBUFFER,T),y.depthBuffer){let H=y.depthTexture,$=H&&H.isDepthTexture?H.type:null,ie=S(y.stencilBuffer,$),se=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;zt(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Nt(y),ie,y.width,y.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Nt(y),ie,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,ie,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,T)}else{let H=y.textures;for(let $=0;$<H.length;$++){let ie=H[$],se=s.convert(ie.format,ie.colorSpace),X=s.convert(ie.type),K=_(ie.internalFormat,se,X,ie.normalized,ie.colorSpace);zt(y)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Nt(y),K,y.width,y.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,Nt(y),K,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,K,y.width,y.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Xt(T,y,k){let H=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,T),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=i.get(y.depthTexture);if($.__renderTarget=y,(!$.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),H){if($.__webglInit===void 0&&($.__webglInit=!0,y.depthTexture.addEventListener("dispose",D)),$.__webglTexture===void 0){$.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),rt(n.TEXTURE_CUBE_MAP,y.depthTexture);let oe=s.convert(y.depthTexture.format),we=s.convert(y.depthTexture.type),ue;y.depthTexture.format===ir?ue=n.DEPTH_COMPONENT24:y.depthTexture.format===Ss&&(ue=n.DEPTH24_STENCIL8);for(let ae=0;ae<6;ae++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,ue,y.width,y.height,0,oe,we,null)}}else te(y.depthTexture,0);let ie=$.__webglTexture,se=Nt(y),X=H?n.TEXTURE_CUBE_MAP_POSITIVE_X+k:n.TEXTURE_2D,K=y.depthTexture.format===Ss?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(y.depthTexture.format===ir)zt(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,K,X,ie,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,K,X,ie,0);else if(y.depthTexture.format===Ss)zt(y)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,K,X,ie,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,K,X,ie,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ze(T){let y=i.get(T),k=T.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==T.depthTexture){let H=T.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),H){let $=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,H.removeEventListener("dispose",$)};H.addEventListener("dispose",$),y.__depthDisposeCallback=$}y.__boundDepthTexture=H}if(T.depthTexture&&!y.__autoAllocateDepthBuffer)if(k)for(let H=0;H<6;H++)Xt(y.__webglFramebuffer[H],T,H);else{let H=T.texture.mipmaps;H&&H.length>0?Xt(y.__webglFramebuffer[0],T,0):Xt(y.__webglFramebuffer,T,0)}else if(k){y.__webglDepthbuffer=[];for(let H=0;H<6;H++)if(t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[H]),y.__webglDepthbuffer[H]===void 0)y.__webglDepthbuffer[H]=n.createRenderbuffer(),Xe(y.__webglDepthbuffer[H],T,!1);else{let $=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=y.__webglDepthbuffer[H];n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ie)}}else{let H=T.texture.mipmaps;if(H&&H.length>0?t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=n.createRenderbuffer(),Xe(y.__webglDepthbuffer,T,!1);else{let $=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=y.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ie)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function at(T,y,k){let H=i.get(T);y!==void 0&&ge(H.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&Ze(T)}function Et(T){let y=T.texture,k=i.get(T),H=i.get(y);T.addEventListener("dispose",x);let $=T.textures,ie=T.isWebGLCubeRenderTarget===!0,se=$.length>1;if(se||(H.__webglTexture===void 0&&(H.__webglTexture=n.createTexture()),H.__version=y.version,o.memory.textures++),ie){k.__webglFramebuffer=[];for(let X=0;X<6;X++)if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer[X]=[];for(let K=0;K<y.mipmaps.length;K++)k.__webglFramebuffer[X][K]=n.createFramebuffer()}else k.__webglFramebuffer[X]=n.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){k.__webglFramebuffer=[];for(let X=0;X<y.mipmaps.length;X++)k.__webglFramebuffer[X]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(se)for(let X=0,K=$.length;X<K;X++){let oe=i.get($[X]);oe.__webglTexture===void 0&&(oe.__webglTexture=n.createTexture(),o.memory.textures++)}if(T.samples>0&&zt(T)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let X=0;X<$.length;X++){let K=$[X];k.__webglColorRenderbuffer[X]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[X]);let oe=s.convert(K.format,K.colorSpace),we=s.convert(K.type),ue=_(K.internalFormat,oe,we,K.normalized,K.colorSpace,T.isXRRenderTarget===!0),ae=Nt(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,ae,ue,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+X,n.RENDERBUFFER,k.__webglColorRenderbuffer[X])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),Xe(k.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ie){t.bindTexture(n.TEXTURE_CUBE_MAP,H.__webglTexture),rt(n.TEXTURE_CUBE_MAP,y);for(let X=0;X<6;X++)if(y.mipmaps&&y.mipmaps.length>0)for(let K=0;K<y.mipmaps.length;K++)ge(k.__webglFramebuffer[X][K],T,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+X,K);else ge(k.__webglFramebuffer[X],T,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+X,0);g(y)&&M(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){for(let X=0,K=$.length;X<K;X++){let oe=$[X],we=i.get(oe),ue=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(ue=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ue,we.__webglTexture),rt(ue,oe),ge(k.__webglFramebuffer,T,oe,n.COLOR_ATTACHMENT0+X,ue,0),g(oe)&&M(ue)}t.unbindTexture()}else{let X=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(X=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(X,H.__webglTexture),rt(X,y),y.mipmaps&&y.mipmaps.length>0)for(let K=0;K<y.mipmaps.length;K++)ge(k.__webglFramebuffer[K],T,y,n.COLOR_ATTACHMENT0,X,K);else ge(k.__webglFramebuffer,T,y,n.COLOR_ATTACHMENT0,X,0);g(y)&&M(X),t.unbindTexture()}T.depthBuffer&&Ze(T)}function Ke(T){let y=T.textures;for(let k=0,H=y.length;k<H;k++){let $=y[k];if(g($)){let ie=w(T),se=i.get($).__webglTexture;t.bindTexture(ie,se),M(ie),t.unbindTexture()}}}let It=[],Kt=[];function Un(T){if(T.samples>0){if(zt(T)===!1){let y=T.textures,k=T.width,H=T.height,$=n.COLOR_BUFFER_BIT,ie=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,se=i.get(T),X=y.length>1;if(X)for(let oe=0;oe<y.length;oe++)t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer);let K=T.texture.mipmaps;K&&K.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let oe=0;oe<y.length;oe++){if(T.resolveDepthBuffer&&(T.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),X){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,se.__webglColorRenderbuffer[oe]);let we=i.get(y[oe]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,we,0)}n.blitFramebuffer(0,0,k,H,0,0,k,H,$,n.NEAREST),c===!0&&(It.length=0,Kt.length=0,It.push(n.COLOR_ATTACHMENT0+oe),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&(It.push(ie),Kt.push(ie),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Kt)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,It))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),X)for(let oe=0;oe<y.length;oe++){t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.RENDERBUFFER,se.__webglColorRenderbuffer[oe]);let we=i.get(y[oe]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+oe,n.TEXTURE_2D,we,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&c){let y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[y])}}}function Nt(T){return Math.min(r.maxSamples,T.samples)}function zt(T){let y=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function N(T){let y=o.render.frame;u.get(T)!==y&&(u.set(T,y),T.update())}function dn(T,y){let k=T.colorSpace,H=T.format,$=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||k!==iu&&k!==Nr&&(tt.getTransfer(k)===ft?(H!==mi||$!==ri)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ue("WebGLTextures: Unsupported texture color space:",k)),y}function ht(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=J,this.resetTextureUnits=z,this.getTextureUnits=O,this.setTextureUnits=V,this.setTexture2D=te,this.setTexture2DArray=W,this.setTexture3D=Y,this.setTextureCube=ne,this.rebindTextures=at,this.setupRenderTarget=Et,this.updateRenderTargetMipmap=Ke,this.updateMultisampleRenderTarget=Un,this.setupDepthRenderbuffer=Ze,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=zt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function $5(n,e){function t(i,r=Nr){let s,o=tt.getTransfer(r);if(i===ri)return n.UNSIGNED_BYTE;if(i===Xp)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Yp)return n.UNSIGNED_SHORT_5_5_5_1;if(i===dx)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===fx)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===lx)return n.BYTE;if(i===ux)return n.SHORT;if(i===mc)return n.UNSIGNED_SHORT;if(i===qp)return n.INT;if(i===Oi)return n.UNSIGNED_INT;if(i===Li)return n.FLOAT;if(i===ki)return n.HALF_FLOAT;if(i===hx)return n.ALPHA;if(i===px)return n.RGB;if(i===mi)return n.RGBA;if(i===ir)return n.DEPTH_COMPONENT;if(i===Ss)return n.DEPTH_STENCIL;if(i===mx)return n.RED;if(i===Zp)return n.RED_INTEGER;if(i===Es)return n.RG;if(i===Jp)return n.RG_INTEGER;if(i===Kp)return n.RGBA_INTEGER;if(i===ku||i===Uu||i===Bu||i===Vu)if(o===ft)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===ku)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Uu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Bu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Vu)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===ku)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Uu)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Bu)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Vu)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Qp||i===em||i===tm||i===nm)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Qp)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===em)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===tm)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===nm)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===im||i===rm||i===sm||i===om||i===am||i===Hu||i===cm)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===im||i===rm)return o===ft?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===sm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===om)return s.COMPRESSED_R11_EAC;if(i===am)return s.COMPRESSED_SIGNED_R11_EAC;if(i===Hu)return s.COMPRESSED_RG11_EAC;if(i===cm)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===lm||i===um||i===dm||i===fm||i===hm||i===pm||i===mm||i===gm||i===ym||i===vm||i===_m||i===xm||i===bm||i===Mm)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===lm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===um)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===dm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===fm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===hm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===pm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===mm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===gm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===ym)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===vm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===_m)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===xm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===bm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Mm)return o===ft?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Sm||i===Em||i===wm)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===Sm)return o===ft?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Em)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===wm)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Tm||i===Cm||i===zu||i===Dm)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===Tm)return s.COMPRESSED_RED_RGTC1_EXT;if(i===Cm)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===zu)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Dm)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===gc?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var q5=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,X5=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Bx=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new yu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new On({vertexShader:q5,fragmentShader:X5,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new vt(new ar(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Vx=class extends rr{constructor(e,t){super();let i=this,r=null,s=1,o=null,a="local-floor",c=1,l=null,u=null,d=null,f=null,h=null,p=null,v=typeof XRWebGLBinding<"u",m=new Bx,g={},M=t.getContextAttributes(),w=null,_=null,S=[],E=[],D=new pe,x=null,C=null,F=new Wn;F.viewport=new mt;let L=new Wn;L.viewport=new mt;let P=[F,L],z=new Gp,O=null,V=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Q=S[q];return Q===void 0&&(Q=new lc,S[q]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(q){let Q=S[q];return Q===void 0&&(Q=new lc,S[q]=Q),Q.getGripSpace()},this.getHand=function(q){let Q=S[q];return Q===void 0&&(Q=new lc,S[q]=Q),Q.getHandSpace()};function J(q){let Q=E.indexOf(q.inputSource);if(Q===-1)return;let _e=S[Q];_e!==void 0&&(_e.update(q.inputSource,q.frame,l||o),_e.dispatchEvent({type:q.type,data:q.inputSource}))}function j(){r.removeEventListener("select",J),r.removeEventListener("selectstart",J),r.removeEventListener("selectend",J),r.removeEventListener("squeeze",J),r.removeEventListener("squeezestart",J),r.removeEventListener("squeezeend",J),r.removeEventListener("end",j),r.removeEventListener("inputsourceschange",te);for(let q=0;q<S.length;q++){let Q=E[q];Q!==null&&(E[q]=null,S[q].disconnect(Q))}O=null,V=null,m.reset();for(let q in g)delete g[q];if(e.setRenderTarget(w),h=null,f=null,d=null,r=null,_=null,lt.stop(),i.isPresenting=!1,e.setPixelRatio(x),e.setSize(D.width,D.height,!1),C!==null){let q=C.camera;q.fov=C.fov,q.zoom=C.zoom,q.updateProjectionMatrix(),C=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return d===null&&v&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=function(q){return Pe(this,null,function*(){if(r=q,r!==null){if(w=e.getRenderTarget(),r.addEventListener("select",J),r.addEventListener("selectstart",J),r.addEventListener("selectend",J),r.addEventListener("squeeze",J),r.addEventListener("squeezestart",J),r.addEventListener("squeezeend",J),r.addEventListener("end",j),r.addEventListener("inputsourceschange",te),M.xrCompatible!==!0&&(yield t.makeXRCompatible()),x=e.getPixelRatio(),e.getSize(D),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let _e=null,ze=null,ge=null;M.depth&&(ge=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,_e=M.stencil?Ss:ir,ze=M.stencil?gc:Oi);let Xe={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:s};d=this.getBinding(),f=d.createProjectionLayer(Xe),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new $n(f.textureWidth,f.textureHeight,{format:mi,type:ri,depthTexture:new ms(f.textureWidth,f.textureHeight,ze,void 0,void 0,void 0,void 0,void 0,void 0,_e),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let _e={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:s};h=new XRWebGLLayer(r,t,_e),r.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),_=new $n(h.framebufferWidth,h.framebufferHeight,{format:mi,type:ri,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=yield r.requestReferenceSpace(a),lt.setContext(r),lt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}})},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function te(q){for(let Q=0;Q<q.removed.length;Q++){let _e=q.removed[Q],ze=E.indexOf(_e);ze>=0&&(E[ze]=null,S[ze].disconnect(_e))}for(let Q=0;Q<q.added.length;Q++){let _e=q.added[Q],ze=E.indexOf(_e);if(ze===-1){for(let Xe=0;Xe<S.length;Xe++)if(Xe>=E.length){E.push(_e),ze=Xe;break}else if(E[Xe]===null){E[Xe]=_e,ze=Xe;break}if(ze===-1)break}let ge=S[ze];ge&&ge.connect(_e)}}let W=new A,Y=new A;function ne(q,Q,_e){W.setFromMatrixPosition(Q.matrixWorld),Y.setFromMatrixPosition(_e.matrixWorld);let ze=W.distanceTo(Y),ge=Q.projectionMatrix.elements,Xe=_e.projectionMatrix.elements,Xt=ge[14]/(ge[10]-1),Ze=ge[14]/(ge[10]+1),at=(ge[9]+1)/ge[5],Et=(ge[9]-1)/ge[5],Ke=(ge[8]-1)/ge[0],It=(Xe[8]+1)/Xe[0],Kt=Xt*Ke,Un=Xt*It,Nt=ze/(-Ke+It),zt=Nt*-Ke;if(Q.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(zt),q.translateZ(Nt),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),ge[10]===-1)q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let N=Xt+Nt,dn=Ze+Nt,ht=Kt-zt,T=Un+(ze-zt),y=at*Ze/dn*N,k=Et*Ze/dn*N;q.projectionMatrix.makePerspective(ht,T,y,k,N,dn),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function Ne(q,Q){Q===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Q.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(r===null)return;let Q=q.near,_e=q.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(_e=m.depthFar)),z.near=L.near=F.near=Q,z.far=L.far=F.far=_e,(O!==z.near||V!==z.far)&&(r.updateRenderState({depthNear:z.near,depthFar:z.far}),O=z.near,V=z.far),z.layers.mask=q.layers.mask|6,F.layers.mask=z.layers.mask&-5,L.layers.mask=z.layers.mask&-3;let ze=q.parent,ge=z.cameras;Ne(z,ze);for(let Xe=0;Xe<ge.length;Xe++)Ne(ge[Xe],ze);ge.length===2?ne(z,F,L):z.projectionMatrix.copy(F.projectionMatrix),C===null&&q.isPerspectiveCamera&&(C={camera:q,fov:q.fov,zoom:q.zoom}),Ce(q,z,ze)};function Ce(q,Q,_e){_e===null?q.matrix.copy(Q.matrixWorld):(q.matrix.copy(_e.matrixWorld),q.matrix.invert(),q.matrix.multiply(Q.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Q.projectionMatrix),q.projectionMatrixInverse.copy(Q.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ac*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(f===null&&h===null))return c},this.setFoveation=function(q){c=q,f!==null&&(f.fixedFoveation=q),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=q)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(z)},this.getCameraTexture=function(q){return g[q]};let St=null;function rt(q,Q){if(u=Q.getViewerPose(l||o),p=Q,u!==null){let _e=u.views;h!==null&&(e.setRenderTargetFramebuffer(_,h.framebuffer),e.setRenderTarget(_));let ze=!1;_e.length!==z.cameras.length&&(z.cameras.length=0,ze=!0);for(let Ze=0;Ze<_e.length;Ze++){let at=_e[Ze],Et=null;if(h!==null)Et=h.getViewport(at);else{let It=d.getViewSubImage(f,at);Et=It.viewport,Ze===0&&(e.setRenderTargetTextures(_,It.colorTexture,It.depthStencilTexture),e.setRenderTarget(_))}let Ke=P[Ze];Ke===void 0&&(Ke=new Wn,Ke.layers.enable(Ze),Ke.viewport=new mt,P[Ze]=Ke),Ke.matrix.fromArray(at.transform.matrix),Ke.matrix.decompose(Ke.position,Ke.quaternion,Ke.scale),Ke.projectionMatrix.fromArray(at.projectionMatrix),Ke.projectionMatrixInverse.copy(Ke.projectionMatrix).invert(),Ke.viewport.set(Et.x,Et.y,Et.width,Et.height),Ze===0&&(z.matrix.copy(Ke.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),ze===!0&&z.cameras.push(Ke)}let ge=r.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&v){d=i.getBinding();let Ze=d.getDepthInformation(_e[0]);Ze&&Ze.isValid&&Ze.texture&&m.init(Ze,r.renderState)}if(ge&&ge.includes("camera-access")&&v){e.state.unbindTexture(),d=i.getBinding();for(let Ze=0;Ze<_e.length;Ze++){let at=_e[Ze].camera;if(at){let Et=g[at];Et||(Et=new yu,g[at]=Et);let Ke=d.getCameraImage(at);Et.sourceTexture=Ke}}}}for(let _e=0;_e<S.length;_e++){let ze=E[_e],ge=S[_e];ze!==null&&ge!==void 0&&ge.update(ze,Q,l||o)}St&&St(q,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),p=null}let lt=new MI;lt.setAnimationLoop(rt),this.setAnimationLoop=function(q){St=q},this.dispose=function(){}}},Y5=new Rt,DI=new He;DI.set(-1,0,0,0,1,0,0,0,1);function Z5(n,e){function t(m,g){m.matrixAutoUpdate===!0&&m.updateMatrix(),g.value.copy(m.matrix)}function i(m,g){g.color.getRGB(m.fogColor.value,Mx(n)),g.isFog?(m.fogNear.value=g.near,m.fogFar.value=g.far):g.isFogExp2&&(m.fogDensity.value=g.density)}function r(m,g,M,w,_){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?s(m,g):g.isMeshLambertMaterial?(s(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(s(m,g),d(m,g)):g.isMeshPhongMaterial?(s(m,g),u(m,g),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(s(m,g),f(m,g),g.isMeshPhysicalMaterial&&h(m,g,_)):g.isMeshMatcapMaterial?(s(m,g),p(m,g)):g.isMeshDepthMaterial?s(m,g):g.isMeshDistanceMaterial?(s(m,g),v(m,g)):g.isMeshNormalMaterial?s(m,g):g.isLineBasicMaterial?(o(m,g),g.isLineDashedMaterial&&a(m,g)):g.isPointsMaterial?c(m,g,M,w):g.isSpriteMaterial?l(m,g):g.isShadowMaterial?(m.color.value.copy(g.color),m.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function s(m,g){m.opacity.value=g.opacity,g.color&&m.diffuse.value.copy(g.color),g.emissive&&m.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.bumpMap&&(m.bumpMap.value=g.bumpMap,t(g.bumpMap,m.bumpMapTransform),m.bumpScale.value=g.bumpScale,g.side===Ln&&(m.bumpScale.value*=-1)),g.normalMap&&(m.normalMap.value=g.normalMap,t(g.normalMap,m.normalMapTransform),m.normalScale.value.copy(g.normalScale),g.side===Ln&&m.normalScale.value.negate()),g.displacementMap&&(m.displacementMap.value=g.displacementMap,t(g.displacementMap,m.displacementMapTransform),m.displacementScale.value=g.displacementScale,m.displacementBias.value=g.displacementBias),g.emissiveMap&&(m.emissiveMap.value=g.emissiveMap,t(g.emissiveMap,m.emissiveMapTransform)),g.specularMap&&(m.specularMap.value=g.specularMap,t(g.specularMap,m.specularMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest);let M=e.get(g),w=M.envMap,_=M.envMapRotation;w&&(m.envMap.value=w,m.envMapRotation.value.setFromMatrix4(Y5.makeRotationFromEuler(_)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(DI),m.reflectivity.value=g.reflectivity,m.ior.value=g.ior,m.refractionRatio.value=g.refractionRatio),g.lightMap&&(m.lightMap.value=g.lightMap,m.lightMapIntensity.value=g.lightMapIntensity,t(g.lightMap,m.lightMapTransform)),g.aoMap&&(m.aoMap.value=g.aoMap,m.aoMapIntensity.value=g.aoMapIntensity,t(g.aoMap,m.aoMapTransform))}function o(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform))}function a(m,g){m.dashSize.value=g.dashSize,m.totalSize.value=g.dashSize+g.gapSize,m.scale.value=g.scale}function c(m,g,M,w){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.size.value=g.size*M,m.scale.value=w*.5,g.map&&(m.map.value=g.map,t(g.map,m.uvTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function l(m,g){m.diffuse.value.copy(g.color),m.opacity.value=g.opacity,m.rotation.value=g.rotation,g.map&&(m.map.value=g.map,t(g.map,m.mapTransform)),g.alphaMap&&(m.alphaMap.value=g.alphaMap,t(g.alphaMap,m.alphaMapTransform)),g.alphaTest>0&&(m.alphaTest.value=g.alphaTest)}function u(m,g){m.specular.value.copy(g.specular),m.shininess.value=Math.max(g.shininess,1e-4)}function d(m,g){g.gradientMap&&(m.gradientMap.value=g.gradientMap)}function f(m,g){m.metalness.value=g.metalness,g.metalnessMap&&(m.metalnessMap.value=g.metalnessMap,t(g.metalnessMap,m.metalnessMapTransform)),m.roughness.value=g.roughness,g.roughnessMap&&(m.roughnessMap.value=g.roughnessMap,t(g.roughnessMap,m.roughnessMapTransform)),g.envMap&&(m.envMapIntensity.value=g.envMapIntensity)}function h(m,g,M){m.ior.value=g.ior,g.sheen>0&&(m.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),m.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(m.sheenColorMap.value=g.sheenColorMap,t(g.sheenColorMap,m.sheenColorMapTransform)),g.sheenRoughnessMap&&(m.sheenRoughnessMap.value=g.sheenRoughnessMap,t(g.sheenRoughnessMap,m.sheenRoughnessMapTransform))),g.clearcoat>0&&(m.clearcoat.value=g.clearcoat,m.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(m.clearcoatMap.value=g.clearcoatMap,t(g.clearcoatMap,m.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,t(g.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(m.clearcoatNormalMap.value=g.clearcoatNormalMap,t(g.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Ln&&m.clearcoatNormalScale.value.negate())),g.dispersion>0&&(m.dispersion.value=g.dispersion),g.retroreflectivity>0&&(m.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(m.iridescence.value=g.iridescence,m.iridescenceIOR.value=g.iridescenceIOR,m.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(m.iridescenceMap.value=g.iridescenceMap,t(g.iridescenceMap,m.iridescenceMapTransform)),g.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=g.iridescenceThicknessMap,t(g.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),g.transmission>0&&(m.transmission.value=g.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),g.transmissionMap&&(m.transmissionMap.value=g.transmissionMap,t(g.transmissionMap,m.transmissionMapTransform)),m.thickness.value=g.thickness,g.thicknessMap&&(m.thicknessMap.value=g.thicknessMap,t(g.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=g.attenuationDistance,m.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(m.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(m.anisotropyMap.value=g.anisotropyMap,t(g.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=g.specularIntensity,m.specularColor.value.copy(g.specularColor),g.specularColorMap&&(m.specularColorMap.value=g.specularColorMap,t(g.specularColorMap,m.specularColorMapTransform)),g.specularIntensityMap&&(m.specularIntensityMap.value=g.specularIntensityMap,t(g.specularIntensityMap,m.specularIntensityMapTransform))}function p(m,g){g.matcap&&(m.matcap.value=g.matcap)}function v(m,g){let M=e.get(g).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function J5(n,e,t,i){let r={},s={},o=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(_,S){let E=S.program;i.uniformBlockBinding(_,E)}function l(_,S){let E=r[_.id];E===void 0&&(m(_),E=u(_),r[_.id]=E,_.addEventListener("dispose",M));let D=S.program;i.updateUBOMapping(_,D);let x=e.render.frame;s[_.id]!==x&&(f(_),s[_.id]=x)}function u(_){let S=d();_.__bindingPointIndex=S;let E=n.createBuffer(),D=_.__size,x=_.usage;return n.bindBuffer(n.UNIFORM_BUFFER,E),n.bufferData(n.UNIFORM_BUFFER,D,x),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,S,E),E}function d(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return Ue("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let S=r[_.id],E=_.uniforms,D=_.__cache;n.bindBuffer(n.UNIFORM_BUFFER,S);for(let x=0,C=E.length;x<C;x++){let F=E[x];if(Array.isArray(F))for(let L=0,P=F.length;L<P;L++)h(F[L],x,L,D);else h(F,x,0,D)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function h(_,S,E,D){if(v(_,S,E,D)===!0){let x=_.__offset,C=_.value;if(Array.isArray(C)){let F=0;for(let L=0;L<C.length;L++){let P=C[L],z=g(P);p(P,_.__data,F),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(F+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else p(C,_.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,x,_.__data)}}function p(_,S,E){typeof _=="number"||typeof _=="boolean"?S[0]=_:_.isMatrix3?(S[0]=_.elements[0],S[1]=_.elements[1],S[2]=_.elements[2],S[3]=0,S[4]=_.elements[3],S[5]=_.elements[4],S[6]=_.elements[5],S[7]=0,S[8]=_.elements[6],S[9]=_.elements[7],S[10]=_.elements[8],S[11]=0):ArrayBuffer.isView(_)?S.set(new _.constructor(_.buffer,_.byteOffset,S.length)):_.toArray(S,E)}function v(_,S,E,D){let x=_.value,C=S+"_"+E;if(D[C]===void 0)return typeof x=="number"||typeof x=="boolean"?D[C]=x:ArrayBuffer.isView(x)?D[C]=x.slice():D[C]=x.clone(),!0;{let F=D[C];if(typeof x=="number"||typeof x=="boolean"){if(F!==x)return D[C]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(F.equals(x)===!1)return F.copy(x),!0}}return!1}function m(_){let S=_.uniforms,E=0,D=16;for(let C=0,F=S.length;C<F;C++){let L=Array.isArray(S[C])?S[C]:[S[C]];for(let P=0,z=L.length;P<z;P++){let O=L[P],V=Array.isArray(O.value)?O.value:[O.value];for(let J=0,j=V.length;J<j;J++){let te=V[J],W=g(te),Y=E%D,ne=Y%W.boundary,Ne=Y+ne;E+=ne,Ne!==0&&D-Ne<W.storage&&(E+=D-Ne),O.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=E,E+=W.storage}}}let x=E%D;return x>0&&(E+=D-x),_.__size=E,_.__cache={},this}function g(_){let S={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(S.boundary=4,S.storage=4):_.isVector2?(S.boundary=8,S.storage=8):_.isVector3||_.isColor?(S.boundary=16,S.storage=12):_.isVector4?(S.boundary=16,S.storage=16):_.isMatrix3?(S.boundary=48,S.storage=48):_.isMatrix4?(S.boundary=64,S.storage=64):_.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(S.boundary=16,S.storage=_.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",_),S}function M(_){let S=_.target;S.removeEventListener("dispose",M);let E=o.indexOf(S.__bindingPointIndex);o.splice(E,1),n.deleteBuffer(r[S.id]),delete r[S.id],delete s[S.id]}function w(){for(let _ in r)n.deleteBuffer(r[_]);o=[],r={},s={}}return{bind:c,update:l,dispose:w}}var K5=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ur=null;function Q5(){return ur===null&&(ur=new Sp(K5,16,16,Es,ki),ur.name="DFG_LUT",ur.minFilter=$t,ur.magFilter=$t,ur.wrapS=tr,ur.wrapT=tr,ur.generateMipmaps=!1,ur.needsUpdate=!0),ur}var bI=class{constructor(e={}){let{canvas:t=jA(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:h=ri}=e;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=o;let v=h,m=new Set([Kp,Jp,Zp]),g=new Set([ri,Oi,mc,gc,Xp,Yp]),M=new Uint32Array(4),w=new Int32Array(4),_=new A,S=null,E=null,D=[],x=[],C=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Fi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let F=this,L=!1,P=null,z=null,O=null,V=null;this._outputColorSpace=Pn;let J=0,j=0,te=null,W=-1,Y=null,ne=new mt,Ne=new mt,Ce=null,St=new nt(0),rt=0,lt=t.width,q=t.height,Q=1,_e=null,ze=null,ge=new mt(0,0,lt,q),Xe=new mt(0,0,lt,q),Xt=!1,Ze=new pu,at=!1,Et=!1,Ke=new Rt,It=new A,Kt=new mt,Un={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Nt=!1;function zt(){return te===null?Q:1}let N=i;function dn(b,I){return t.getContext(b,I)}let ht,T,y,k,H,$,ie,se,X,K,oe,we,ue,ae,Te,Oe,je,R,ce,Z,le,he,ee;try{let b={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",wt,!1),t.addEventListener("webglcontextrestored",ut,!1),t.addEventListener("webglcontextcreationerror",yi,!1),N===null){let I="webgl2";if(N=dn(I,b),N===null)throw dn(I)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}De()}catch(b){throw t.removeEventListener("webglcontextlost",wt,!1),t.removeEventListener("webglcontextrestored",ut,!1),t.removeEventListener("webglcontextcreationerror",yi,!1),Ue("WebGLRenderer: "+b.message),b}function De(){ht=new o4(N),ht.init(),le=new $5(N,ht),T=new ZG(N,ht,e,le),y=new j5(N,ht),T.reversedDepthBuffer&&f&&y.buffers.depth.setReversed(!0),z=N.createFramebuffer(),O=N.createFramebuffer(),V=N.createFramebuffer(),k=new l4(N),H=new I5,$=new W5(N,ht,y,H,T,le,k),ie=new s4(F),se=new dH(N),he=new XG(N,se),X=new a4(N,se,k,he),K=new d4(N,X,se,he,k),R=new u4(N,T,$),Te=new JG(H),oe=new A5(F,ie,ht,T,he,Te),we=new Z5(F,H),ue=new N5,ae=new U5(ht),je=new qG(F,ie,y,K,p,c),Oe=new G5(F,K,T),ee=new J5(N,k,T,y),ce=new YG(N,ht,k),Z=new c4(N,ht,k),k.programs=oe.programs,F.capabilities=T,F.extensions=ht,F.properties=H,F.renderLists=ue,F.shadowMap=Oe,F.state=y,F.info=k}v!==ri&&(C=new h4(v,t.width,t.height,a,r,s));let Se=new Vx(F,N);this.xr=Se,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let b=ht.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=ht.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(b){b!==void 0&&(Q=b,this.setSize(lt,q,!1))},this.getSize=function(b){return b.set(lt,q)},this.setSize=function(b,I,G=!0){if(Se.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}lt=b,q=I,t.width=Math.floor(b*Q),t.height=Math.floor(I*Q),G===!0&&(t.style.width=b+"px",t.style.height=I+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,b,I)},this.getDrawingBufferSize=function(b){return b.set(lt*Q,q*Q).floor()},this.setDrawingBufferSize=function(b,I,G){lt=b,q=I,Q=G,t.width=Math.floor(b*G),t.height=Math.floor(I*G),this.setViewport(0,0,b,I)},this.setEffects=function(b){if(v===ri){Ue("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let I=0;I<b.length;I++)if(b[I].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(ne)},this.getViewport=function(b){return b.copy(ge)},this.setViewport=function(b,I,G,U){b.isVector4?ge.set(b.x,b.y,b.z,b.w):ge.set(b,I,G,U),y.viewport(ne.copy(ge).multiplyScalar(Q).round())},this.getScissor=function(b){return b.copy(Xe)},this.setScissor=function(b,I,G,U){b.isVector4?Xe.set(b.x,b.y,b.z,b.w):Xe.set(b,I,G,U),y.scissor(Ne.copy(Xe).multiplyScalar(Q).round())},this.getScissorTest=function(){return Xt},this.setScissorTest=function(b){y.setScissorTest(Xt=b)},this.setOpaqueSort=function(b){_e=b},this.setTransparentSort=function(b){ze=b},this.getClearColor=function(b){return b.copy(je.getClearColor())},this.setClearColor=function(){je.setClearColor(...arguments)},this.getClearAlpha=function(){return je.getClearAlpha()},this.setClearAlpha=function(){je.setClearAlpha(...arguments)},this.clear=function(b=!0,I=!0,G=!0){let U=0;if(b){let B=!1;if(te!==null){let fe=te.texture.format;B=m.has(fe)}if(B){let fe=te.texture.type,ye=g.has(fe),de=je.getClearColor(),be=je.getClearAlpha(),Ee=de.r,$e=de.g,Je=de.b;ye?(M[0]=Ee,M[1]=$e,M[2]=Je,M[3]=be,N.clearBufferuiv(N.COLOR,0,M)):(w[0]=Ee,w[1]=$e,w[2]=Je,w[3]=be,N.clearBufferiv(N.COLOR,0,w))}else U|=N.COLOR_BUFFER_BIT}I&&(U|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),G&&(U|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U!==0&&N.clear(U)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),P=b},this.dispose=function(){t.removeEventListener("webglcontextlost",wt,!1),t.removeEventListener("webglcontextrestored",ut,!1),t.removeEventListener("webglcontextcreationerror",yi,!1),je.dispose(),ue.dispose(),ae.dispose(),H.dispose(),ie.dispose(),K.dispose(),he.dispose(),ee.dispose(),oe.dispose(),Se.dispose(),Se.removeEventListener("sessionstart",Zx),Se.removeEventListener("sessionend",Jx),Cs.stop()};function wt(b){b.preventDefault(),au("WebGLRenderer: Context Lost."),L=!0}function ut(){au("WebGLRenderer: Context Restored."),L=!1;let b=k.autoReset,I=Oe.enabled,G=Oe.autoUpdate,U=Oe.needsUpdate,B=Oe.type;De(),k.autoReset=b,Oe.enabled=I,Oe.autoUpdate=G,Oe.needsUpdate=U,Oe.type=B}function yi(b){Ue("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Ui(b){let I=b.target;I.removeEventListener("dispose",Ui),KI(I)}function KI(b){QI(b),H.remove(b)}function QI(b){let I=H.get(b).programs;I!==void 0&&(I.forEach(function(G){oe.releaseProgram(G)}),b.isShaderMaterial&&oe.releaseShaderCache(b))}this.renderBufferDirect=function(b,I,G,U,B,fe){I===null&&(I=Un);let ye=B.isMesh&&B.matrixWorld.determinantAffine()<0,de=n1(b,I,G,U,B);y.setMaterial(U,ye);let be=G.index,Ee=1;if(U.wireframe===!0){if(be=X.getWireframeAttribute(G),be===void 0)return;Ee=2}let $e=G.drawRange,Je=G.attributes.position,Me=$e.start*Ee,dt=($e.start+$e.count)*Ee;fe!==null&&(Me=Math.max(Me,fe.start*Ee),dt=Math.min(dt,(fe.start+fe.count)*Ee)),be!==null?(Me=Math.max(Me,0),dt=Math.min(dt,be.count)):Je!=null&&(Me=Math.max(Me,0),dt=Math.min(dt,Je.count));let Gt=dt-Me;if(Gt<0||Gt===1/0)return;he.setup(B,U,de,G,be);let Dt,_t=ce;if(be!==null&&(Dt=se.get(be),_t=Z,_t.setIndex(Dt)),B.isMesh)U.wireframe===!0?(y.setLineWidth(U.wireframeLinewidth*zt()),_t.setMode(N.LINES)):_t.setMode(N.TRIANGLES);else if(B.isLine){let fn=U.linewidth;fn===void 0&&(fn=1),y.setLineWidth(fn*zt()),B.isLineSegments?_t.setMode(N.LINES):B.isLineLoop?_t.setMode(N.LINE_LOOP):_t.setMode(N.LINE_STRIP)}else B.isPoints?_t.setMode(N.POINTS):B.isSprite&&_t.setMode(N.TRIANGLES);if(B.isBatchedMesh)if(ht.get("WEBGL_multi_draw"))_t.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{let fn=B._multiDrawStarts,me=B._multiDrawCounts,wn=B._multiDrawCount,ot=be?se.get(be).bytesPerElement:1,si=H.get(U).currentProgram.getUniforms();for(let Bi=0;Bi<wn;Bi++)si.setValue(N,"_gl_DrawID",Bi),_t.render(fn[Bi]/ot,me[Bi])}else if(B.isInstancedMesh)_t.renderInstances(Me,Gt,B.count);else if(G.isInstancedBufferGeometry){let fn=G._maxInstanceCount!==void 0?G._maxInstanceCount:1/0,me=Math.min(G.instanceCount,fn);_t.renderInstances(Me,Gt,me)}else _t.render(Me,Gt)};function Yx(b,I,G,U){P!==null&&b.isNodeMaterial&&P.setObject(U,b),at===!0&&Te.setState(b,G,!1),b.transparent===!0&&b.side===qt&&b.forceSinglePass===!1?(b.side=Ln,b.needsUpdate=!0,Yu(b,I,U),b.side=cr,b.needsUpdate=!0,Yu(b,I,U),b.side=qt):Yu(b,I,U)}this.compile=function(b,I,G=null){G===null&&(G=b),P!==null&&P.renderStart(b,I,G),E=ae.get(G),E.init(I),x.push(E),G.traverseVisible(function(B){B.isLight&&B.layers.test(I.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),b!==G&&b.traverseVisible(function(B){B.isLight&&B.layers.test(I.layers)&&(E.pushLight(B),B.castShadow&&E.pushShadow(B))}),E.setupLights(),P!==null&&P.updateLights(E.state.lightsArray),Et=this.localClippingEnabled,at=Te.init(this.clippingPlanes,Et),at===!0&&Te.setGlobalState(this.clippingPlanes,I),P!==null&&Oe.render(E.state.shadowsArray,G,I);let U=new Set;return b.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;let fe=B.material;if(fe)if(Array.isArray(fe))for(let ye=0;ye<fe.length;ye++){let de=fe[ye];Yx(de,G,I,B),U.add(de)}else Yx(fe,G,I,B),U.add(fe)}),E=x.pop(),P!==null&&P.renderEnd(),U},this.compileAsync=function(b,I,G=null){let U=this.compile(b,I,G);return new Promise(B=>{function fe(){if(U.forEach(function(ye){let be=H.get(ye).currentProgram;(be===void 0||be.isReady())&&U.delete(ye)}),U.size===0){B(b);return}setTimeout(fe,10)}ht.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let tg=null;function e1(b){tg&&tg(b)}function Zx(){Cs.stop()}function Jx(){Cs.start()}let Cs=new MI;Cs.setAnimationLoop(e1),typeof self<"u"&&Cs.setContext(self),this.setAnimationLoop=function(b){tg=b,Se.setAnimationLoop(b),b===null?Cs.stop():Cs.start()},Se.addEventListener("sessionstart",Zx),Se.addEventListener("sessionend",Jx),this.render=function(b,I){if(I!==void 0&&I.isCamera!==!0){Ue("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;P!==null&&P.renderStart(b,I);let G=Se.enabled===!0&&Se.isPresenting===!0,U=C!==null&&(te===null||G)&&C.begin(F,te);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),Se.enabled===!0&&Se.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(Se.cameraAutoUpdate===!0&&Se.updateCamera(I),I=Se.getCamera()),b.isScene===!0&&b.onBeforeRender(F,b,I,te),E=ae.get(b,x.length),E.init(I),E.state.textureUnits=$.getTextureUnits(),x.push(E),Ke.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),Ze.setFromProjectionMatrix(Ke,Ni,I.reversedDepth),Et=this.localClippingEnabled,at=Te.init(this.clippingPlanes,Et),S=ue.get(b,D.length),S.init(),D.push(S),Se.enabled===!0&&Se.isPresenting===!0){let ye=F.xr.getDepthSensingMesh();ye!==null&&ng(ye,I,-1/0,F.sortObjects)}ng(b,I,0,F.sortObjects),S.finish(),P!==null&&P.updateLights(E.state.lightsArray),F.sortObjects===!0&&S.sort(_e,ze),Nt=Se.enabled===!1||Se.isPresenting===!1||Se.hasDepthSensing()===!1,Nt&&je.addToRenderList(S,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),at===!0&&Te.beginShadows();let B=E.state.shadowsArray;if(Oe.render(B,b,I),at===!0&&Te.endShadows(),(U&&C.hasRenderPass())===!1){let ye=S.opaque,de=S.transmissive;if(E.setupLights(),I.isArrayCamera){let be=I.cameras;if(de.length>0)for(let Ee=0,$e=be.length;Ee<$e;Ee++){let Je=be[Ee];Qx(ye,de,b,Je)}Nt&&je.render(b);for(let Ee=0,$e=be.length;Ee<$e;Ee++){let Je=be[Ee];Kx(S,b,Je,Je.viewport)}}else de.length>0&&Qx(ye,de,b,I),Nt&&je.render(b),Kx(S,b,I)}te!==null&&j===0&&($.updateMultisampleRenderTarget(te),$.updateRenderTargetMipmap(te)),U&&C.end(F),b.isScene===!0&&b.onAfterRender(F,b,I),he.resetDefaultState(),W=-1,Y=null,x.pop(),x.length>0?(E=x[x.length-1],$.setTextureUnits(E.state.textureUnits),at===!0&&Te.setGlobalState(F.clippingPlanes,E.state.camera)):E=null,D.pop(),D.length>0?S=D[D.length-1]:S=null,P!==null&&P.renderEnd()};function ng(b,I,G,U){if(b.visible===!1)return;if(b.layers.test(I.layers)){if(b.isGroup)G=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(I);else if(b.isLightProbeGrid)E.pushLightProbeGrid(b);else if(b.isLight)E.pushLight(b),b.castShadow&&E.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(Ze)){U&&Kt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Ke);let ye=K.update(b),de=b.material;de.visible&&S.push(b,ye,de,G,Kt.z,null,I)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(Ze))){let ye=K.update(b),de=b.material;if(U&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Kt.copy(b.boundingSphere.center)):(ye.boundingSphere===null&&ye.computeBoundingSphere(),Kt.copy(ye.boundingSphere.center)),Kt.applyMatrix4(b.matrixWorld).applyMatrix4(Ke)),Array.isArray(de)){let be=ye.groups;for(let Ee=0,$e=be.length;Ee<$e;Ee++){let Je=be[Ee],Me=de[Je.materialIndex];Me&&Me.visible&&S.push(b,ye,Me,G,Kt.z,Je,I)}}else de.visible&&S.push(b,ye,de,G,Kt.z,null,I)}}let fe=b.children;for(let ye=0,de=fe.length;ye<de;ye++)ng(fe[ye],I,G,U)}function Kx(b,I,G,U){let{opaque:B,transmissive:fe,transparent:ye}=b;E.setupLightsView(G),at===!0&&Te.setGlobalState(F.clippingPlanes,G),U&&y.viewport(ne.copy(U)),B.length>0&&Xu(B,I,G),fe.length>0&&Xu(fe,I,G),ye.length>0&&Xu(ye,I,G),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function Qx(b,I,G,U){if((G.isScene===!0?G.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[U.id]===void 0){let Me=ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[U.id]=new $n(1,1,{generateMipmaps:!0,type:Me?ki:ri,minFilter:Ms,samples:Math.max(4,T.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tt.workingColorSpace})}let fe=E.state.transmissionRenderTarget[U.id],ye=U.viewport||ne;fe.setSize(ye.z*F.transmissionResolutionScale,ye.w*F.transmissionResolutionScale);let de=F.getRenderTarget(),be=F.getActiveCubeFace(),Ee=F.getActiveMipmapLevel();F.setRenderTarget(fe),F.getClearColor(St),rt=F.getClearAlpha(),rt<1&&F.setClearColor(16777215,.5),F.clear(),Nt&&je.render(G);let $e=F.toneMapping;F.toneMapping=Fi;let Je=U.viewport;if(U.viewport!==void 0&&(U.viewport=void 0),E.setupLightsView(U),at===!0&&Te.setGlobalState(F.clippingPlanes,U),Xu(b,G,U),$.updateMultisampleRenderTarget(fe),$.updateRenderTargetMipmap(fe),ht.has("WEBGL_multisampled_render_to_texture")===!1){let Me=!1;for(let dt=0,Gt=I.length;dt<Gt;dt++){let Dt=I[dt],{object:_t,geometry:fn,material:me,group:wn}=Dt;if(me.side===qt&&_t.layers.test(U.layers)){let ot=me.side;me.side=Ln,me.needsUpdate=!0,eb(_t,G,U,fn,me,wn),me.side=ot,me.needsUpdate=!0,Me=!0}}Me===!0&&($.updateMultisampleRenderTarget(fe),$.updateRenderTargetMipmap(fe))}F.setRenderTarget(de,be,Ee),F.setClearColor(St,rt),Je!==void 0&&(U.viewport=Je),F.toneMapping=$e}function Xu(b,I,G){let U=I.isScene===!0?I.overrideMaterial:null;for(let B=0,fe=b.length;B<fe;B++){let ye=b[B],{object:de,geometry:be,group:Ee}=ye,$e=ye.material;$e.allowOverride===!0&&U!==null&&($e=U),de.layers.test(G.layers)&&eb(de,I,G,be,$e,Ee)}}function eb(b,I,G,U,B,fe){P!==null&&B.isNodeMaterial&&P.setObject(b,B),b.onBeforeRender(F,I,G,U,B,fe),b.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),B.onBeforeRender(F,I,G,U,b,fe),B.transparent===!0&&B.side===qt&&B.forceSinglePass===!1?(B.side=Ln,B.needsUpdate=!0,F.renderBufferDirect(G,I,U,B,b,fe),B.side=cr,B.needsUpdate=!0,F.renderBufferDirect(G,I,U,B,b,fe),B.side=qt):F.renderBufferDirect(G,I,U,B,b,fe),b.onAfterRender(F,I,G,U,B,fe)}function Yu(b,I,G){I.isScene!==!0&&(I=Un);let U=H.get(b),B=E.state.lights,fe=E.state.shadowsArray,ye=B.state.version,de=oe.getParameters(b,B.state,fe,I,G,E.state.lightProbeGridArray),be=oe.getProgramCacheKey(de),Ee=U.programs;U.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?I.environment:null,U.fog=I.fog;let $e=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;U.envMap=ie.get(b.envMap||U.environment,$e),U.envMapRotation=U.environment!==null&&b.envMap===null?I.environmentRotation:b.envMapRotation,Ee===void 0&&(b.addEventListener("dispose",Ui),Ee=new Map,U.programs=Ee);let Je=Ee.get(be);if(Je!==void 0){if(U.currentProgram===Je&&U.lightsStateVersion===ye)return nb(b,de),Je}else de.uniforms=oe.getUniforms(b),P!==null&&b.isNodeMaterial&&P.build(b,G,de),b.onBeforeCompile(de,F),Je=oe.acquireProgram(de,be),Ee.set(be,Je),U.uniforms=de.uniforms;let Me=U.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Me.clippingPlanes=Te.uniform),nb(b,de),U.needsLights=r1(b),U.lightsStateVersion=ye,U.needsLights&&(Me.ambientLightColor.value=B.state.ambient,Me.lightProbe.value=B.state.probe,Me.sunLights.value=B.state.sun,Me.sunLightShadows.value=B.state.sunShadow,Me.directionalLights.value=B.state.directional,Me.directionalLightShadows.value=B.state.directionalShadow,Me.spotLights.value=B.state.spot,Me.spotLightShadows.value=B.state.spotShadow,Me.rectAreaLights.value=B.state.rectArea,Me.ltc_1.value=B.state.rectAreaLTC1,Me.ltc_2.value=B.state.rectAreaLTC2,Me.pointLights.value=B.state.point,Me.pointLightShadows.value=B.state.pointShadow,Me.hemisphereLights.value=B.state.hemi,Me.sunShadowMatrix.value=B.state.sunShadowMatrix,Me.sunShadowCascade.value=B.state.sunShadowCascade,Me.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Me.spotLightMatrix.value=B.state.spotLightMatrix,Me.spotLightMap.value=B.state.spotLightMap,Me.pointShadowMatrix.value=B.state.pointShadowMatrix),U.lightProbeGrid=E.state.lightProbeGridArray.length>0,U.currentProgram=Je,U.uniformsList=null,Je}function tb(b){if(b.uniformsList===null){let I=b.currentProgram.getUniforms();b.uniformsList=_c.seqWithValue(I.seq,b.uniforms)}return b.uniformsList}function nb(b,I){let G=H.get(b);G.outputColorSpace=I.outputColorSpace,G.batching=I.batching,G.batchingColor=I.batchingColor,G.instancing=I.instancing,G.instancingColor=I.instancingColor,G.instancingMorph=I.instancingMorph,G.skinning=I.skinning,G.morphTargets=I.morphTargets,G.morphNormals=I.morphNormals,G.morphColors=I.morphColors,G.morphTargetsCount=I.morphTargetsCount,G.numClippingPlanes=I.numClippingPlanes,G.numIntersection=I.numClipIntersection,G.vertexAlphas=I.vertexAlphas,G.vertexTangents=I.vertexTangents,G.toneMapping=I.toneMapping}function t1(b,I){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;_.setFromMatrixPosition(I.matrixWorld);for(let G=0,U=b.length;G<U;G++){let B=b[G];if(B.texture!==null&&B.boundingBox.containsPoint(_))return B}return null}function n1(b,I,G,U,B){I.isScene!==!0&&(I=Un),$.resetTextureUnits();let fe=I.fog,ye=U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial?I.environment:null,de=te===null?F.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:tt.workingColorSpace,be=U.isMeshStandardMaterial||U.isMeshLambertMaterial&&!U.envMap||U.isMeshPhongMaterial&&!U.envMap,Ee=ie.get(U.envMap||ye,be),$e=U.vertexColors===!0&&!!G.attributes.color&&G.attributes.color.itemSize===4,Je=!!G.attributes.tangent&&(!!U.normalMap||U.anisotropy>0),Me=!!G.morphAttributes.position,dt=!!G.morphAttributes.normal,Gt=!!G.morphAttributes.color,Dt=Fi;U.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Dt=F.toneMapping);let _t=G.morphAttributes.position||G.morphAttributes.normal||G.morphAttributes.color,fn=_t!==void 0?_t.length:0,me=H.get(U),wn=E.state.lights;if(at===!0&&(Et===!0||b!==Y)){let Tt=b===Y&&U.id===W;Te.setState(U,b,Tt)}let ot=!1;U.version===me.__version?(me.needsLights&&me.lightsStateVersion!==wn.state.version||me.outputColorSpace!==de||B.isBatchedMesh&&me.batching===!1||!B.isBatchedMesh&&me.batching===!0||B.isBatchedMesh&&me.batchingColor===!0&&B._colorsTexture===null||B.isBatchedMesh&&me.batchingColor===!1&&B._colorsTexture!==null||B.isInstancedMesh&&me.instancing===!1||!B.isInstancedMesh&&me.instancing===!0||B.isSkinnedMesh&&me.skinning===!1||!B.isSkinnedMesh&&me.skinning===!0||B.isInstancedMesh&&me.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&me.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&me.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&me.instancingMorph===!1&&B.morphTexture!==null||me.envMap!==Ee||U.fog===!0&&me.fog!==fe||me.numClippingPlanes!==void 0&&(me.numClippingPlanes!==Te.numPlanes||me.numIntersection!==Te.numIntersection)||me.vertexAlphas!==$e||me.vertexTangents!==Je||me.morphTargets!==Me||me.morphNormals!==dt||me.morphColors!==Gt||me.toneMapping!==Dt||me.morphTargetsCount!==fn||!!me.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(ot=!0):(ot=!0,me.__version=U.version);let si=me.currentProgram;ot===!0&&(si=Yu(U,I,B),P&&U.isNodeMaterial&&P.onUpdateProgram(U,si,me));let Bi=!1,Pr=!1,Do=!1,gt=si.getUniforms(),kt=me.uniforms;if(y.useProgram(si.program)&&(Bi=!0,Pr=!0,Do=!0),U.id!==W&&(W=U.id,Pr=!0),me.needsLights){let Tt=t1(E.state.lightProbeGridArray,B);me.lightProbeGrid!==Tt&&(me.lightProbeGrid=Tt,Pr=!0)}if(Bi||Y!==b){y.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),gt.setValue(N,"projectionMatrix",b.projectionMatrix),gt.setValue(N,"viewMatrix",b.matrixWorldInverse);let Or=gt.map.cameraPosition;Or!==void 0&&Or.setValue(N,It.setFromMatrixPosition(b.matrixWorld)),T.logarithmicDepthBuffer&&gt.setValue(N,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(U.isMeshPhongMaterial||U.isMeshToonMaterial||U.isMeshLambertMaterial||U.isMeshBasicMaterial||U.isMeshStandardMaterial||U.isShaderMaterial)&&gt.setValue(N,"isOrthographic",b.isOrthographicCamera===!0),Y!==b&&(Y=b,Pr=!0,Do=!0)}if(me.needsLights&&(wn.state.sunShadowMap.length>0&&gt.setValue(N,"sunShadowMap",wn.state.sunShadowMap,$),wn.state.directionalShadowMap.length>0&&gt.setValue(N,"directionalShadowMap",wn.state.directionalShadowMap,$),wn.state.spotShadowMap.length>0&&gt.setValue(N,"spotShadowMap",wn.state.spotShadowMap,$),wn.state.pointShadowMap.length>0&&gt.setValue(N,"pointShadowMap",wn.state.pointShadowMap,$)),B.isSkinnedMesh){gt.setOptional(N,B,"bindMatrix"),gt.setOptional(N,B,"bindMatrixInverse");let Tt=B.skeleton;Tt&&(Tt.boneTexture===null&&Tt.computeBoneTexture(),gt.setValue(N,"boneTexture",Tt.boneTexture,$))}B.isBatchedMesh&&(gt.setOptional(N,B,"batchingTexture"),gt.setValue(N,"batchingTexture",B._matricesTexture,$),gt.setOptional(N,B,"batchingIdTexture"),gt.setValue(N,"batchingIdTexture",B._indirectTexture,$),gt.setOptional(N,B,"batchingColorTexture"),B._colorsTexture!==null&&gt.setValue(N,"batchingColorTexture",B._colorsTexture,$));let Fr=G.morphAttributes;if((Fr.position!==void 0||Fr.normal!==void 0||Fr.color!==void 0)&&R.update(B,G,si),(Pr||me.receiveShadow!==B.receiveShadow)&&(me.receiveShadow=B.receiveShadow,gt.setValue(N,"receiveShadow",B.receiveShadow)),(U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial)&&U.envMap===null&&I.environment!==null&&(kt.envMapIntensity.value=I.environmentIntensity),kt.dfgLUT!==void 0&&(kt.dfgLUT.value=Q5()),Pr){if(gt.setValue(N,"toneMappingExposure",F.toneMappingExposure),me.needsLights&&i1(kt,Do),fe&&U.fog===!0&&we.refreshFogUniforms(kt,fe),we.refreshMaterialUniforms(kt,U,Q,q,E.state.transmissionRenderTarget[b.id]),me.needsLights&&me.lightProbeGrid){let Tt=me.lightProbeGrid;kt.probesSH.value=Tt.texture,kt.probesMin.value.copy(Tt.boundingBox.min),kt.probesMax.value.copy(Tt.boundingBox.max),kt.probesResolution.value.copy(Tt.resolution)}_c.upload(N,tb(me),kt,$)}if(U.isShaderMaterial&&U.uniformsNeedUpdate===!0&&(_c.upload(N,tb(me),kt,$),U.uniformsNeedUpdate=!1),U.isSpriteMaterial&&gt.setValue(N,"center",B.center),gt.setValue(N,"modelViewMatrix",B.modelViewMatrix),gt.setValue(N,"normalMatrix",B.normalMatrix),gt.setValue(N,"modelMatrix",B.matrixWorld),U.uniformsGroups!==void 0){let Tt=U.uniformsGroups;for(let Or=0,Ao=Tt.length;Or<Ao;Or++){let rb=Tt[Or];ee.update(rb,si),ee.bind(rb,si)}}return si}function i1(b,I){b.ambientLightColor.needsUpdate=I,b.lightProbe.needsUpdate=I,b.sunLights.needsUpdate=I,b.sunLightShadows.needsUpdate=I,b.directionalLights.needsUpdate=I,b.directionalLightShadows.needsUpdate=I,b.pointLights.needsUpdate=I,b.pointLightShadows.needsUpdate=I,b.spotLights.needsUpdate=I,b.spotLightShadows.needsUpdate=I,b.rectAreaLights.needsUpdate=I,b.hemisphereLights.needsUpdate=I}function r1(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return J},this.getActiveMipmapLevel=function(){return j},this.getRenderTarget=function(){return te},this.setRenderTargetTextures=function(b,I,G){let U=H.get(b);U.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,U.__autoAllocateDepthBuffer===!1&&(U.__useRenderToTexture=!1),H.get(b.texture).__webglTexture=I,H.get(b.depthTexture).__webglTexture=U.__autoAllocateDepthBuffer?void 0:G,U.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,I){let G=H.get(b);G.__webglFramebuffer=I,G.__useDefaultFramebuffer=I===void 0},this.setRenderTarget=function(b,I=0,G=0){te=b,J=I,j=G;let U=null,B=!1,fe=!1;if(b){let de=H.get(b);if(de.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(N.FRAMEBUFFER,de.__webglFramebuffer),ne.copy(b.viewport),Ne.copy(b.scissor),Ce=b.scissorTest,y.viewport(ne),y.scissor(Ne),y.setScissorTest(Ce),W=-1;return}else if(de.__webglFramebuffer===void 0)$.setupRenderTarget(b);else if(de.__hasExternalTextures)$.rebindTextures(b,H.get(b.texture).__webglTexture,H.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let $e=b.depthTexture;if(de.__boundDepthTexture!==$e){if($e!==null&&H.has($e)&&(b.width!==$e.image.width||b.height!==$e.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(b)}}let be=b.texture;(be.isData3DTexture||be.isDataArrayTexture||be.isCompressedArrayTexture)&&(fe=!0);let Ee=H.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ee[I])?U=Ee[I][G]:U=Ee[I],B=!0):b.samples>0&&$.useMultisampledRTT(b)===!1?U=H.get(b).__webglMultisampledFramebuffer:Array.isArray(Ee)?U=Ee[G]:U=Ee,ne.copy(b.viewport),Ne.copy(b.scissor),Ce=b.scissorTest}else ne.copy(ge).multiplyScalar(Q).floor(),Ne.copy(Xe).multiplyScalar(Q).floor(),Ce=Xt;if(G!==0&&(U=z),y.bindFramebuffer(N.FRAMEBUFFER,U)&&y.drawBuffers(b,U),y.viewport(ne),y.scissor(Ne),y.setScissorTest(Ce),B){let de=H.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+I,de.__webglTexture,G)}else if(fe){let de=I;for(let be=0;be<b.textures.length;be++){let Ee=H.get(b.textures[be]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+be,Ee.__webglTexture,G,de)}}else if(b!==null&&G!==0){let de=H.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,de.__webglTexture,G)}W=-1};function ib(b){let I=H.get(b);return(I.__readFormat!==b.format||I.__readType!==b.type)&&(I.__readFormat=b.format,I.__readType=b.type,I.__formatReadable=T.textureFormatReadable(b.format),I.__typeReadable=T.textureTypeReadable(b.type)),I}this.readRenderTargetPixels=function(b,I,G,U,B,fe,ye,de=0){if(!(b&&b.isWebGLRenderTarget)){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let be=H.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be){y.bindFramebuffer(N.FRAMEBUFFER,be);try{let Ee=b.textures[de],$e=Ee.format,Je=Ee.type;b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+de);let Me=ib(Ee);if(Me.__formatReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Me.__typeReadable===!1){Ue("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=b.width-U&&G>=0&&G<=b.height-B&&N.readPixels(I,G,U,B,le.convert($e),le.convert(Je),fe)}finally{let Ee=te!==null?H.get(te).__webglFramebuffer:null;y.bindFramebuffer(N.FRAMEBUFFER,Ee)}}},this.readRenderTargetPixelsAsync=function(b,I,G,U,B,fe,ye,de=0){return Pe(this,null,function*(){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let be=H.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&ye!==void 0&&(be=be[ye]),be)if(I>=0&&I<=b.width-U&&G>=0&&G<=b.height-B){y.bindFramebuffer(N.FRAMEBUFFER,be);let Ee=b.textures[de],$e=Ee.format,Je=Ee.type;b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+de);let Me=ib(Ee);if(Me.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Me.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let dt=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,dt),N.bufferData(N.PIXEL_PACK_BUFFER,fe.byteLength,N.STREAM_READ),N.readPixels(I,G,U,B,le.convert($e),le.convert(Je),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);let Gt=te!==null?H.get(te).__webglFramebuffer:null;y.bindFramebuffer(N.FRAMEBUFFER,Gt);let Dt=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),yield $A(N,Dt,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,dt),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,fe),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(dt),N.deleteSync(Dt),fe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")})},this.copyFramebufferToTexture=function(b,I=null,G=0){let U=Math.pow(2,-G),B=Math.floor(b.image.width*U),fe=Math.floor(b.image.height*U),ye=I!==null?I.x:0,de=I!==null?I.y:0;$.setTexture2D(b,0),N.copyTexSubImage2D(N.TEXTURE_2D,G,0,0,ye,de,B,fe),y.unbindTexture()},this.copyTextureToTexture=function(b,I,G=null,U=null,B=0,fe=0){let ye,de,be,Ee,$e,Je,Me,dt,Gt,Dt=b.isCompressedTexture?b.mipmaps[fe]:b.image;if(G!==null)ye=G.max.x-G.min.x,de=G.max.y-G.min.y,be=G.isBox3?G.max.z-G.min.z:1,Ee=G.min.x,$e=G.min.y,Je=G.isBox3?G.min.z:0;else{let kt=Math.pow(2,-B);ye=Math.floor(Dt.width*kt),de=Math.floor(Dt.height*kt),b.isDataArrayTexture?be=Dt.depth:b.isData3DTexture?be=Math.floor(Dt.depth*kt):be=1,Ee=0,$e=0,Je=0}U!==null?(Me=U.x,dt=U.y,Gt=U.z):(Me=0,dt=0,Gt=0);let _t=le.convert(I.format),fn=le.convert(I.type),me;I.isData3DTexture?($.setTexture3D(I,0),me=N.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?($.setTexture2DArray(I,0),me=N.TEXTURE_2D_ARRAY):($.setTexture2D(I,0),me=N.TEXTURE_2D),y.activeTexture(N.TEXTURE0),y.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,I.flipY),y.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),y.pixelStorei(N.UNPACK_ALIGNMENT,I.unpackAlignment);let wn=y.getParameter(N.UNPACK_ROW_LENGTH),ot=y.getParameter(N.UNPACK_IMAGE_HEIGHT),si=y.getParameter(N.UNPACK_SKIP_PIXELS),Bi=y.getParameter(N.UNPACK_SKIP_ROWS),Pr=y.getParameter(N.UNPACK_SKIP_IMAGES);y.pixelStorei(N.UNPACK_ROW_LENGTH,Dt.width),y.pixelStorei(N.UNPACK_IMAGE_HEIGHT,Dt.height),y.pixelStorei(N.UNPACK_SKIP_PIXELS,Ee),y.pixelStorei(N.UNPACK_SKIP_ROWS,$e),y.pixelStorei(N.UNPACK_SKIP_IMAGES,Je);let Do=b.isDataArrayTexture||b.isData3DTexture,gt=I.isDataArrayTexture||I.isData3DTexture;if(b.isDepthTexture){let kt=H.get(b),Fr=H.get(I),Tt=H.get(kt.__renderTarget),Or=H.get(Fr.__renderTarget);y.bindFramebuffer(N.READ_FRAMEBUFFER,Tt.__webglFramebuffer),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,Or.__webglFramebuffer);for(let Ao=0;Ao<be;Ao++)Do&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,H.get(b).__webglTexture,B,Je+Ao),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,H.get(I).__webglTexture,fe,Gt+Ao)),N.blitFramebuffer(Ee,$e,ye,de,Me,dt,ye,de,N.DEPTH_BUFFER_BIT,N.NEAREST);y.bindFramebuffer(N.READ_FRAMEBUFFER,null),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(B!==0||b.isRenderTargetTexture||H.has(b)){let kt=H.get(b),Fr=H.get(I);y.bindFramebuffer(N.READ_FRAMEBUFFER,O),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,V);for(let Tt=0;Tt<be;Tt++)Do?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,kt.__webglTexture,B,Je+Tt):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,kt.__webglTexture,B),gt?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Fr.__webglTexture,fe,Gt+Tt):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Fr.__webglTexture,fe),B!==0?N.blitFramebuffer(Ee,$e,ye,de,Me,dt,ye,de,N.COLOR_BUFFER_BIT,N.NEAREST):gt?N.copyTexSubImage3D(me,fe,Me,dt,Gt+Tt,Ee,$e,ye,de):N.copyTexSubImage2D(me,fe,Me,dt,Ee,$e,ye,de);y.bindFramebuffer(N.READ_FRAMEBUFFER,null),y.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else gt?b.isDataTexture||b.isData3DTexture?N.texSubImage3D(me,fe,Me,dt,Gt,ye,de,be,_t,fn,Dt.data):I.isCompressedArrayTexture?N.compressedTexSubImage3D(me,fe,Me,dt,Gt,ye,de,be,_t,Dt.data):N.texSubImage3D(me,fe,Me,dt,Gt,ye,de,be,_t,fn,Dt):b.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,fe,Me,dt,ye,de,_t,fn,Dt.data):b.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,fe,Me,dt,Dt.width,Dt.height,_t,Dt.data):N.texSubImage2D(N.TEXTURE_2D,fe,Me,dt,ye,de,_t,fn,Dt);y.pixelStorei(N.UNPACK_ROW_LENGTH,wn),y.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ot),y.pixelStorei(N.UNPACK_SKIP_PIXELS,si),y.pixelStorei(N.UNPACK_SKIP_ROWS,Bi),y.pixelStorei(N.UNPACK_SKIP_IMAGES,Pr),fe===0&&I.generateMipmaps&&N.generateMipmap(me),y.unbindTexture()},this.initRenderTarget=function(b){H.get(b).__webglFramebuffer===void 0&&$.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?$.setTextureCube(b,0):b.isData3DTexture?$.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?$.setTexture2DArray(b,0):$.setTexture2D(b,0),y.unbindTexture()},this.resetState=function(){J=0,j=0,te=null,y.reset(),he.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ni}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};var km=class{id;position;index;x;y;vx;vy;fx;fy;visible=!0;isClustered=!1;isClusterRepresentative=!1;_cachedMesh=void 0;constructor(e,t){this.id=e,this.position=t,this.x=t.x,this.y=t.y}get mesh(){return this._cachedMesh}set mesh(e){this._cachedMesh=e}};var AI=new Map;function Hx(n,e){AI.set(n,e)}function zx(n){return AI.get(n)}function II(n=16,e=136){let t=new OffscreenCanvas(n,n),i=t.getContext("2d");i.fillStyle=`rgb(${e}, ${e}, ${e})`,i.fillRect(0,0,n,n);let r=new gu(t);return r.minFilter=$t,r.magFilter=$t,r.generateMipmaps=!1,r.needsUpdate=!0,r}function RI(n,e){return{x:(n.clientX-e.left)/e.width*2-1,y:-((n.clientY-e.top)/e.height)*2+1}}function NI(n,e,t,i,r){let s=e.domElement.getBoundingClientRect(),o=RI(n,s),a=null,c=1/0,l=r.hitTolerance,u=new A;for(let d of t){d.getWorldPosition(u).project(i);let f=(o.x-u.x)*s.width/2,h=(o.y-u.y)*s.height/2,p=Math.sqrt(f*f+h*h);p<l&&p<c&&(a=d,c=p)}return a}function Aoe(n,e,t,i,r){return NI(n,e,t.children,i,r)}function Ioe(n,e,t,i,r){return t.length===0?null:NI(n,e,t,i,r)}function Roe(n,e,t){let i=e.domElement.getBoundingClientRect(),r=RI(n,i),s=t.position.x+r.x*(t.right-t.left)/2/t.zoom,o=t.position.y+r.y*(t.top-t.bottom)/2/t.zoom;return{x:s,y:o}}function Noe(n,e,t,i){let r=t.clientX-e.x,s=t.clientY-e.y,o=.8,a=1/n.zoom,c=-r*a*o,l=s*a*o,u=new A,d=new A(1,0,0),f=new A(0,1,0);u.add(d.multiplyScalar(c)),u.add(f.multiplyScalar(l)),n.position.add(u),i.add(u),n.lookAt(i),n.updateProjectionMatrix()}function Poe(n,e,t){let i=new A;n.getWorldPosition(i);let r=t.getBoundingClientRect(),s=i.clone().project(e),o=(s.x+1)/2*r.width+r.left,a=(-s.y+1)/2*r.height+r.top;return new pe(o,a)}function Foe(n,e,t,i,r,s=50){let o=t.maxX-t.minX,a=t.maxY-t.minY;if(o===0||a===0)return{x:0,y:0};let l=(n-t.minX)/o*s,u=s/o,d=(e-t.minY)*u,f=(l-s/2)*(i/s),h=(d-a*u/2)*(r/(a*u));return{x:f,y:h}}function Ooe(n,e,t=.01){return Math.abs(n-e)<t}function Loe(n,e,t,i){if(!n||!e||!t)return;let{filename:r="three-scene.png",scaleFactor:s=1,restoreAfterExport:o=!0,canvasElement:a=n.domElement}=i||{},c=a.clientWidth,l=a.clientHeight,u=new pe;n.getSize(u);let d=n.getPixelRatio();n.setPixelRatio(window.devicePixelRatio*s),n.setSize(c,l,!1),n.render(e,t);let f=n.domElement.toDataURL("image/png"),h=document.createElement("a");h.href=f,h.download=r,document.body.appendChild(h),h.click(),document.body.removeChild(h),o&&(n.setPixelRatio(d),n.setSize(u.x,u.y,!1),n.render(e,t))}var Um=class{constructor(e,t){this.glyphId=e;this.renderConfig=t}glyphId;renderConfig;render(e,t,i){let r=II(),s=new ar(t.radius*2,t.radius*2),o=new an({map:r,transparent:!0}),a=new vt(s,o);return this.renderConfig.thumbnailResolver?.requestThumb(this.renderConfig.loadedData,this.glyphId).subscribe(c=>{c&&this.applyThumbnailTexture(c,a,o,t)}),a}applyThumbnailTexture(e,t,i,r){let s=e.width,o=e.height,a=r.radius*3,c=a/s,l=a/o,u=Math.min(c,l,1),d=s*u,f=o*u,h=new ar(d,f);t.geometry.dispose(),t.geometry=h;let p=new gi(e);p.needsUpdate=!0,p.minFilter=Ht,p.magFilter=Ht,p.colorSpace=Pn,i.map=p,i.needsUpdate=!0,this.renderConfig.onReRender?.()}};function FI(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,c=new on,l=0;for(let u=0;u<n.length;++u){let d=n[u],f=0;if(t!==(d.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let h in d.attributes){if(!i.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+'. All geometries must have compatible attributes; make sure "'+h+'" attribute exists among all geometries, or in none of them.'),null;s[h]===void 0&&(s[h]=[]),s[h].push(d.attributes[h]),f++}if(f!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". Make sure all geometries have the same number of attributes."),null;if(a!==d.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let h in d.morphAttributes){if(!r.has(h))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+".  .morphAttributes must be consistent throughout all geometries."),null;o[h]===void 0&&(o[h]=[]),o[h].push(d.morphAttributes[h])}if(e){let h;if(t)h=d.index.count;else if(d.attributes.position!==void 0)h=d.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+u+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,h,u),l+=h}}if(t){let u=0,d=[];for(let f=0;f<n.length;++f){let h=n[f].index;for(let p=0;p<h.count;++p)d.push(h.getX(p)+u);u+=n[f].attributes.position.count}c.setIndex(d)}for(let u in s){let d=PI(s[u]);if(!d)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" attribute."),null;c.setAttribute(u,d)}for(let u in o){let d=o[u][0].length;if(d!==0){c.morphAttributes=c.morphAttributes||{},c.morphAttributes[u]=[];for(let f=0;f<d;++f){let h=[];for(let v=0;v<o[u].length;++v)h.push(o[u][v][f]);let p=PI(h);if(!p)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+u+" morphAttribute."),null;c.morphAttributes[u].push(p)}}}return c}function PI(n){let e,t,i,r=-1,s=0;for(let l=0;l<n.length;++l){let u=n[l];if(e===void 0&&(e=u.array.constructor),e!==u.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=u.itemSize),t!==u.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=u.normalized),i!==u.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=u.gpuType),r!==u.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=u.count*t}let o=new e(s),a=new Fn(o,t,i),c=0;for(let l=0;l<n.length;++l){let u=n[l];if(u.isInterleavedBufferAttribute){let d=c/t;for(let f=0,h=u.count;f<h;f++)for(let p=0;p<t;p++){let v=u.getComponent(f,p);a.setComponent(f+d,p,v)}}else o.set(u.array,c);c+=u.count*t}return r!==void 0&&(a.gpuType=r),a}re.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new pe},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};kn.line={uniforms:Gu.merge([re.common,re.fog,re.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var ws=class extends On{constructor(e){super({type:"LineMaterial",uniforms:Gu.clone(kn.line.uniforms),vertexShader:kn.line.vertexShader,fragmentShader:kn.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};function qu(n,e){return Math.PI/2-n/e*2*Math.PI}function OI(n,e,t){let i=qu(n,e);return[Math.cos(i)*t,Math.sin(i)*t]}function Sc(n,e,t){return t?n:n/(e||1)}function LI(n,e){return n.map((t,i)=>OI(i,n.length,e*t))}var Bm=.23,ej=[[0,0],[10/19,.2*Bm],[.89,Bm],[1.03,0],[.89,-Bm],[10/19,-.2*Bm],[0,0]];function kI(n,e){let t=Math.cos(e),i=Math.sin(e);return ej.map(([r,s])=>[(r*t-s*i)*n,(r*i+s*t)*n])}var Gx=hD().x(n=>n[0]).y(n=>n[1]).curve(gD);function UI(n,e,t){Gx.context(n)(kI(e,t)),Gx.context(null)}function Woe(n,e,t=0,i=0){return Gx(BI(kI(n,e),t,i))??""}function $oe(n,e=0,t=0){return n.length===0?"":`M${BI(n,e,t).map(([i,r])=>`${Mc(i)},${Mc(r)}`).join("L")}Z`}function qoe(n,e,t=0,i=0){return Array.from({length:n},(r,s)=>{let[o,a]=OI(s,n,e);return`M${Mc(t)},${Mc(i)}L${Mc(t+o)},${Mc(i-a)}`}).join("")}function BI(n,e,t){return n.map(([i,r])=>[e+i,t-r])}function Mc(n){return Math.round(n*100)/100}var tj=15987699,nj=14737632,ij=.01,rj=13948116,sj=.015,Ec={circles:new Map,rings:new Map,spokes:new Map},VI=new Map,HI=new Map;function Vm(n,e){let t=`${n}_${e}`,i=HI.get(t);return i||(i=new ws({color:n,linewidth:e,transparent:!0,opacity:.9}),HI.set(t,i)),i}function jx(n,e){let t=`${n}_${e?.side??cr}_${e?.transparent??!1}_${e?.opacity??1}_${e?.depthTest??!0}`,i=VI.get(t);return i||(i=new an(Ae({color:n},e)),VI.set(t,i)),i}function Hm(n,e=32){let t=`${n.toFixed(2)}_${e}`,i=Ec.circles.get(t);return i||(i=new vu(n,e),Ec.circles.set(t,i)),i}function Wx(n,e,t=32){let i=`${n.toFixed(2)}_${e.toFixed(2)}_${t}`,r=Ec.rings.get(i);return r||(r=new Cu(n,e,t),Ec.rings.set(i,r)),r}function zm(n,e,t){if(!(e.currentZoomLevel===2&&t.useBackground))return;let r=Hm(e.radius,32),s=new an({color:tj});if(t.highlighted){let o=new nt(t.highlightColor);o.lerp(new nt(16777215),.6),s.color.copy(o)}if(n.add(new vt(r,s)),t.useContour){let o=e.radius*ij,a=Wx(e.radius-o,e.radius,32),c=new an({color:nj,side:qt});n.add(new vt(a,c))}}function Gm(n,e,t,i){if(!(t.currentZoomLevel===2&&i.useCoordinateSystem))return;let s=new an({color:rj,side:qt});n.add(new vt(oj(e,t.radius),s))}function oj(n,e){let t=`${n}_${e.toFixed(2)}`,i=Ec.spokes.get(t);if(!i){let r=Array.from({length:n},(s,o)=>{let a=new ar(e*sj,e);return a.translate(0,e/2,0),a.rotateZ(qu(o,n)-Math.PI/2),a});i=FI(r),r.forEach(s=>s.dispose()),Ec.spokes.set(t,i)}return i}function jm(n,e,t,i){if(e.every(r=>r<=.001)){let r=Hm(t.getRadius(0)/4,16),s=new an({color:i,side:qt,transparent:!0,opacity:.6});return n.add(new vt(r,s)),!0}return!1}var zI=new ti,Wm=new A,wc=class extends Nu{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Ct(e,3)),this.setAttribute("uv",new Ct(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new xs(t,6,1);return this.setAttribute("instanceStart",new pi(i,3,0)),this.setAttribute("instanceEnd",new pi(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new xs(t,6,1);return this.setAttribute("instanceColorStart",new pi(i,3,0)),this.setAttribute("instanceColorEnd",new pi(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Du(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ti);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),zI.setFromBufferAttribute(t),this.boundingBox.union(zI))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new or),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Wm.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Wm)),Wm.fromBufferAttribute(t,s),r=Math.max(r,i.distanceToSquared(Wm));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};var $x=new mt,GI=new A,jI=new A,cn=new mt,ln=new mt,dr=new mt,qx=new A,Xx=new Rt,un=new Pu,WI=new A,$m=new ti,qm=new or,fr=new mt,hr,Co;function $I(n,e,t){return fr.set(0,0,-e,1).applyMatrix4(n.projectionMatrix),fr.multiplyScalar(1/fr.w),fr.x=Co/t.width,fr.y=Co/t.height,fr.applyMatrix4(n.projectionMatrixInverse),fr.multiplyScalar(1/fr.w),Math.abs(Math.max(fr.x,fr.y))}function aj(n,e){let t=n.matrixWorld,i=n.geometry,r=i.attributes.instanceStart,s=i.attributes.instanceEnd,o=Math.min(i.instanceCount,r.count);for(let a=0,c=o;a<c;a++){un.start.fromBufferAttribute(r,a),un.end.fromBufferAttribute(s,a),un.applyMatrix4(t);let l=new A,u=new A;hr.distanceSqToSegment(un.start,un.end,u,l),u.distanceTo(l)<Co*.5&&e.push({point:u,pointOnLine:l,distance:hr.origin.distanceTo(u),object:n,face:null,faceIndex:a,uv:null,uv1:null})}}function cj(n,e,t){let i=e.projectionMatrix,s=n.material.resolution,o=n.matrixWorld,a=n.geometry,c=a.attributes.instanceStart,l=a.attributes.instanceEnd,u=Math.min(a.instanceCount,c.count),d=-e.near;hr.at(1,dr),dr.w=1,dr.applyMatrix4(e.matrixWorldInverse),dr.applyMatrix4(i),dr.multiplyScalar(1/dr.w),dr.x*=s.x/2,dr.y*=s.y/2,dr.z=0,qx.copy(dr),Xx.multiplyMatrices(e.matrixWorldInverse,o);for(let f=0,h=u;f<h;f++){if(cn.fromBufferAttribute(c,f),ln.fromBufferAttribute(l,f),cn.w=1,ln.w=1,cn.applyMatrix4(Xx),ln.applyMatrix4(Xx),cn.z>d&&ln.z>d)continue;if(cn.z>d){let w=cn.z-ln.z,_=(cn.z-d)/w;cn.lerp(ln,_)}else if(ln.z>d){let w=ln.z-cn.z,_=(ln.z-d)/w;ln.lerp(cn,_)}cn.applyMatrix4(i),ln.applyMatrix4(i),cn.multiplyScalar(1/cn.w),ln.multiplyScalar(1/ln.w),cn.x*=s.x/2,cn.y*=s.y/2,ln.x*=s.x/2,ln.y*=s.y/2,un.start.copy(cn),un.start.z=0,un.end.copy(ln),un.end.z=0;let v=un.closestPointToPointParameter(qx,!0);un.at(v,WI);let m=xx.lerp(cn.z,ln.z,v),g=m>=-1&&m<=1,M=qx.distanceTo(WI)<Co*.5;if(g&&M){un.start.fromBufferAttribute(c,f),un.end.fromBufferAttribute(l,f),un.start.applyMatrix4(o),un.end.applyMatrix4(o);let w=new A,_=new A;hr.distanceSqToSegment(un.start,un.end,_,w),t.push({point:_,pointOnLine:w,distance:hr.origin.distanceTo(_),object:n,face:null,faceIndex:f,uv:null,uv1:null})}}}var Xm=class extends vt{constructor(e=new wc,t=new ws({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let o=0,a=0,c=t.count;o<c;o++,a+=2)GI.fromBufferAttribute(t,o),jI.fromBufferAttribute(i,o),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+GI.distanceTo(jI);let s=new xs(r,2,1);return e.setAttribute("instanceDistanceStart",new pi(s,1,0)),e.setAttribute("instanceDistanceEnd",new pi(s,1,1)),this}raycast(e,t){let i=this.material.worldUnits,r=e.camera;if(r===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let s=e.params.Line2!==void 0&&e.params.Line2.threshold||0;hr=e.ray;let o=this.matrixWorld,a=this.geometry,c=this.material;Co=c.linewidth+s,a.boundingSphere===null&&a.computeBoundingSphere(),qm.copy(a.boundingSphere).applyMatrix4(o);let l;if(i)l=Co*.5;else{let d=Math.max(r.near,qm.distanceToPoint(hr.origin));l=$I(r,d,c.resolution)}if(qm.radius+=l,hr.intersectsSphere(qm)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),$m.copy(a.boundingBox).applyMatrix4(o);let u;if(i)u=Co*.5;else{let d=Math.max(r.near,$m.distanceToPoint(hr.origin));u=$I(r,d,c.resolution)}$m.expandByScalar(u),hr.intersectsBox($m)!==!1&&(i?aj(this,t):cj(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport($x),this.material.uniforms.resolution.value.set($x.z,$x.w))}};var Ts=class extends wc{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setPositions(i),this}setColors(e){let t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setColors(i),this}setFromPoints(e){let t=e.length-1,i=new Float32Array(6*t);for(let r=0;r<t;r++)i[6*r]=e[r].x,i[6*r+1]=e[r].y,i[6*r+2]=e[r].z||0,i[6*r+3]=e[r+1].x,i[6*r+4]=e[r+1].y,i[6*r+5]=e[r+1].z||0;return super.setPositions(i),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}};var Tc=class extends Xm{constructor(e=new Ts,t=new ws({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}};var Ym=class{render(e,t,i){let r=new Pi;zm(r,t,e);let{featureMap:s,keys:o,values:a,featureMaxValues:c,segments:l,color:u}=e;if(o.length===0||(Gm(r,l,t,e),jm(r,a,t,u)))return r;let d=o.map((v,m)=>Sc(+s[v]||0,c[m],i)),f=LI(d,t.radius).map(([v,m])=>new pe(v,m)),h=new gs(f),p=new an({color:u,side:qt,transparent:!0,opacity:.6});if(r.add(new vt(new bo(h),p)),e.useContour){let v=[...f.map(w=>new A(w.x,w.y,0))];v.push(v[0].clone());let m=[];v.forEach(w=>m.push(w.x,w.y,w.z));let g=new Ts;g.setPositions(m);let M=new Tc(g,Vm(u,t.contourThickness));M.computeLineDistances(),M.scale.set(1,1,1),r.add(M)}return r}};var lj=.85,uj={0:3,1:3,2:6},Zm=class{render(e,t,i){let r=new Pi;zm(r,t,e);let{featureMap:s,keys:o,values:a,featureMaxValues:c,segments:l,color:u}=e;if(o.length===0||(Gm(r,l,t,e),jm(r,a,t,u)))return r;let d=[];if(o.forEach((p,v)=>{let m=+s[p]||0;if(m<=0)return;let g=new gs;UI(g,t.radius*Sc(m,c[v],i),qu(v,l)),d.push(g)}),d.length===0)return r;let f=uj[t.currentZoomLevel],h=new an({color:u,transparent:!0,opacity:lj,side:qt});if(r.add(new vt(new bo(d,f),h)),e.useContour&&t.currentZoomLevel===2){let p=d.flatMap(g=>g.getPoints(f).flatMap(M=>[M.x,M.y,0])),v=new Ts;v.setPositions(p);let m=new Tc(v,Vm(u,t.contourThickness));m.computeLineDistances(),r.add(m)}return r}};Hx(0,new Ym);Hx(1,new Zm);var Jm=class{id;positions={};defaultcontext=0;features;values;metadata;currentContext=1;renderCache=new Map;passive=!1;highlighted=!1;isInLense=!1;lensCenter=new A(0,0,0);highlightColor=10168141;passivecolor=14737632;constructor(e){this.id=e}getPosition(e,t){return this.positions[e][t]}clearCache(e){this.renderCache.delete(e)}getCacheObject(e=0,t,i){let r=this.renderCache.get(e);return r==null&&(r=new km(this.id,Ae({},this.getPosition(t,i))),this.renderCache.set(e,r)),r}getMesh(e,t,i=0){return this.getCacheObject(i,e,t).mesh}setHighlighted(e){this.highlighted!==e&&(this.highlighted=e)}getCurrentColor(e,t=!0){if(this.highlighted&&t)return this.highlightColor;if(this.passive)return this.passivecolor;let i=e.colorScale;return this.features==null||!i?52360:Nh(i,this.features[1][e.colorFeature],e.colorFeature,e)}axisLengths(e,t,i){let r=this.features?.[this.currentContext]??{};return e.map(s=>Sc(+r[s]||0,t[s],i))}render(e,t,i,r,s,o){let a=this.renderGlyph(e,t,i,r,s,o),c=this.getCacheObject(r,t,i);return a&&(c.mesh=a),a}renderGlyph(e,t,i,r,s,o){let a=this.getCacheObject(r,t,i),c=a.mesh,l;if(e.currentZoomLevel===0){if(s&&a.isClustered&&!a.isClusterRepresentative)return null;let f=this.getCurrentColor(o);if(a.isClusterRepresentative&&s){let h=Wx(e.radius-1,e.radius,24),p=jx(f,{side:qt});l=new vt(h,p)}else{let h=Hm(e.radius,24),p=jx(f);l=new vt(h,p)}}else{let f=o.glyphType;if(f===2)l=new Um(this.id,o).render(this.buildRenderContext(e,o),e,o.scaleLinear);else{let h=zx(f);h?l=h.render(this.buildRenderContext(e,o),e,o.scaleLinear):l=zx(1).render(this.buildRenderContext(e,o),e,o.scaleLinear)}}let u=c?c.position.x:a.x??0,d=c?c.position.y:a.y??0;return l.position.set(u,d,0),l.userData={item:new WeakRef(this)},l.renderOrder=this.passive?1:99,l}buildRenderContext(e,t){let i=this.getFeatureContext(this.currentContext,t),r=this.getCurrentColor(t,e.currentZoomLevel!==2);return{featureMap:i?.featureMap??{},keys:i?.keys??[],values:i?.values??[],featureMaxValues:i?.featureMaxValues??[],segments:i?.segments??0,color:r,useContour:t.useContour,useBackground:t.useBackground,useCoordinateSystem:t.useCoordinateSystem,highlighted:this.highlighted,highlightColor:this.highlightColor}}getFeatureContext(e,t){if(!this.features)return null;let i=this.features[e]||{},r=t.activeFeatures.filter(d=>d in i),s=Object.fromEntries(r.map(d=>[d,i[d]])),o=r.map(d=>+s[d]),a=t.featureMaxValues,c=r.map(d=>a[d]??1),l=Math.max(...o)||1,u=r.length;return{featureMap:s,keys:r,values:o,featureMaxValues:c,localMaxValue:l,segments:u}}};var Km=class n{glyphCache=new Map;metaCache=new Map;schemaCache=new Map;getGlyphMap(e){return this.glyphCache.get(e)}getSchemaMap(e){return this.schemaCache.get(e)}getMetaMap(e){return this.metaCache.get(e)}deleteDataset(e){this.glyphCache.delete(e),this.schemaCache.delete(e),this.metaCache.delete(e)}buildDataSet(e,t,i,r,s,o){this.getOrCreateSubMap(this.schemaCache,e).set(t,i),this.getOrCreateSubMap(this.metaCache,e).set(t,r);let l=this.getOrCreateSubMap(this.glyphCache,e);for(let[u,d]of l)delete d.positions[t],Object.keys(d.positions).length===0&&l.delete(u);for(let u of s){let d=String(u.id),f=l.get(d);f||(f=new Jm(d),f.positions={},l.set(d,f)),f.features=u.features,f.values=u.values,f.metadata=u.metadata,f.defaultcontext=u.defaultcontext?parseInt(u.defaultcontext):1,f.renderCache.clear(),f.positions[t]={}}for(let[u,d]of o)for(let f of d){let h=String(f.id),p=l.get(h);p&&(p.positions[t][u]=Ae({},f.position))}return l.size}getOrCreateSubMap(e,t){let i=e.get(t);return i||(i=new Map,e.set(t,i)),i}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var Qm=class n{constructor(e){this.config=e}config;applySchemaToConfig(e,t){this.config.colorFeature=e.color,this.config.featureCategoryCounts=fj(t),this.config.replaceActiveFeatures(e.glyph),this.config.featureLabels=e.label,this.config.metadataLabels=e.metadata??{},e.colorScaleId!==void 0?this.config.colorRange=e.colorScaleId:e.colorRange!==void 0&&(this.config.colorRange=MD(e.colorRange?"numeric":"categorical")),e.types&&(this.config.featureTypes=e.types)}calculateFeatureMaxValues(e){let t=this.config.featureTypes,i={};e.forEach(r=>{let s=r.features[1];s&&Object.keys(t).forEach(o=>{if(t[o]==="categorical"){let a=s[o];a!==void 0&&(i[o]=Math.max(i[o]||0,a))}})}),this.config.featureMaxValues=i}extractFeatureMaxValuesFromMeta(e){if(!e||!e.features)return;let t={};Object.entries(e.features).forEach(([i,r])=>{r.max!==void 0&&(t[i]=r.max)}),this.config.featureMaxValues=t}static \u0275fac=function(t){return new(t||n)(Ye(Ua))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};function fj(n){let e={};return Object.entries(n?.features??{}).forEach(([t,i])=>{i.categories?.length&&(e[t]=i.categories.length)}),e}var pj=/^(.+)\.(jpe?g|png|webp)$/i;function mj(n,e){let t=new Map;for(let i of[...e].sort()){let r=pj.exec(i)?.[1];r!==void 0&&!t.has(r)&&t.set(r,`${n}/${i}`)}return t}var eg=class n{constructor(e,t,i){this.dataProcessor=e;this.storage=t;this.collections=i}dataProcessor;storage;collections;archives=new Map;nextFolder=0;attachArchive(e,t){return Pe(this,null,function*(){let i=this.unpack(t);return this.archives.set(e,i),yield this.storage.saveThumbnailArchive(e,t),(yield i)?.size??0})}forget(e){this.archives.delete(e)}requestThumb(e,t){return this.collections.getCollectionEntry(e)?.source==="local"?this.bundledThumb(e,t):Rs(this.archiveOf(e)).pipe(Fo(i=>{let r=i?.get(t);return r?this.dataProcessor.requestThumb(r):Lr(null)}))}archiveOf(e){let t=this.archives.get(e);return t||(t=this.storage.getThumbnailArchive(e).then(i=>i?this.unpack(i):null),this.archives.set(e,t)),t}unpack(e){return Pe(this,null,function*(){let t=`thumbnails-${this.nextFolder++}`;try{return mj(t,yield this.dataProcessor.unzip(t,e))}catch(i){return console.warn("[ThumbnailService] The image archive could not be unpacked:",i),null}})}bundledThumb(e,t){return new At(i=>{let r=new Image;r.crossOrigin="anonymous",r.onload=()=>{i.next(r),i.complete()},r.onerror=()=>{i.next(null),i.complete()},r.src=`assets/thumbnails/${encodeURIComponent(e)}/${encodeURIComponent(t)}.jpg`})}static \u0275fac=function(t){return new(t||n)(Ye(Ba),Ye(Va),Ye(Ha))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var qI=class n{constructor(e,t,i,r,s,o,a,c,l,u){this.http=e;this.config=t;this.dataProcessor=i;this.datasetStorage=r;this.toast=s;this.filterService=o;this.collectionSvc=a;this.cacheSvc=c;this.schemaSyncSvc=l;this.thumbnails=u;this.dataSetCollectionSubject$=this.collectionSvc.dataSetCollectionSubject$,this.loadDatasets(Fh),this.loadSavedDatasets()}http;config;dataProcessor;datasetStorage;toast;filterService;collectionSvc;cacheSvc;schemaSyncSvc;thumbnails;dataSetCollectionSubject$;loadDatasets(e){let t=(r,s)=>JSON.stringify([r,s]),i=new Oh(e.flatMap(r=>r.items.map(s=>t(r.dataset,s.time))));e.forEach(r=>{r.items.forEach(s=>{let o="assets/data/",a=s.algorithms,c=r.dataset,l=s.time,u={schema:this.http.get(o+a.schema),meta:this.http.get(o+a.meta),feature:this.http.get(o+a.feature)},d=Object.keys(a.position);d.forEach(f=>{u[f]=this.http.get(o+a.position[f])}),Ac(u).subscribe({next:f=>{let h=f.schema,p=f.meta,v=f.feature,m=new Map;d.forEach(M=>{m.set(M,f[M])});let g=this.cacheSvc.buildDataSet(c,l,h,p,v,m);i.succeeded(t(c,l),()=>{this.filterService.totalItems||(this.filterService.totalItems=g,this.filterService.filteredItems=g,this.schemaSyncSvc.applySchemaToConfig(h,p),this.config.updateConfiguration(),this.config.loadData(c))})},error:f=>{console.error(`[DataLoader] Failed to load dataset "${c}":`,f),this.toast.error(`Failed to load dataset "${c}"`),i.failed(t(c,l))}})})})}loadSavedDatasets(){return Pe(this,null,function*(){try{let e=yield this.datasetStorage.getAllDatasets();for(let t of e){let i=new Map;for(let[o,a]of Object.entries(t.positions))i.set(o,a);this.cacheSvc.buildDataSet(t.name,t.timestamp,t.schema,t.meta,t.features,i);let r={};for(let o of Object.keys(t.positions))r[o]=`memory://${t.name}/${t.timestamp}/${o}`;let s={dataset:t.name,source:"indexeddb",items:[{time:t.timestamp,algorithms:{schema:`memory://${t.name}/${t.timestamp}/schema`,meta:`memory://${t.name}/${t.timestamp}/meta`,feature:`memory://${t.name}/${t.timestamp}/features`,position:r}}]};this.collectionSvc.setDatasetCollection([s])}}catch(e){console.warn("[DataLoader] Failed to load saved datasets from IndexedDB:",e)}})}saveDatasetToStorage(e,t){return Pe(this,null,function*(){try{let i=this.cacheSvc.getSchemaMap(e)?.get(t),r=this.cacheSvc.getMetaMap(e)?.get(t);if(!i||!r){console.warn("[DataLoader] Cannot save to IndexedDB - missing schema or meta for:",e);return}let s=this.cacheSvc.getGlyphMap(e);if(!s)return;let o=[],a={};s.forEach(u=>{if(o.push(Ae({id:u.id,defaultcontext:String(u.defaultcontext),features:u.features,values:u.values??{}},u.metadata?{metadata:u.metadata}:{})),u.positions[t])for(let[d,f]of Object.entries(u.positions[t]))a[d]||(a[d]=[]),a[d].push({id:u.id,position:f})});let c={name:e,timestamp:t,savedAt:Date.now(),schema:i,meta:r,features:o,positions:a};yield this.datasetStorage.saveDataset(c);let l=this.collectionSvc.getCollectionEntry(e);l&&(l.source="indexeddb",this.collectionSvc.notifyChange())}catch(i){console.warn("[DataLoader] Failed to save dataset to IndexedDB:",i)}})}attachThumbnails(e,t){return Pe(this,null,function*(){let i=yield this.thumbnails.attachArchive(e,t);return this.config.loadedData===e&&this.config.updateConfiguration(),i})}deleteDataset(e){return Pe(this,null,function*(){let t=this.collectionSvc.getCollectionEntry(e);if(!t||t.source==="local")return!1;yield this.datasetStorage.deleteDataset(e),this.thumbnails.forget(e),this.cacheSvc.deleteDataset(e),this.collectionSvc.removeDataset(e);let i=this.collectionSvc.getCollection();return this.config.loadedData===e&&i.length>0&&this.config.loadData(i[0].dataset),!0})}getGlyphDataSync(){return this.cacheSvc.getGlyphMap(this.config.loadedData)}getGlyphData(e,t,i){return Pe(this,null,function*(){let r=this.resolveDatasetParams(e,t||void 0);if(!r)return;let s=this.cacheSvc.getGlyphMap(r.name);return s||(yield this.loadDataSet(r.name,r.timestamp),s=this.cacheSvc.getGlyphMap(r.name)),s&&(this.filterService.totalItems=s.size,this.filterService.setActiveGlyphData(s)),this.filterService.filteredItems=this.filterService.totalItems,s?Array.from(s.values()):void 0})}getMetaData(e,t){return Pe(this,null,function*(){let i=this.resolveDatasetParams(e,t);if(!i)return;let r=this.cacheSvc.getMetaMap(i.name);return r||(yield this.loadDataSet(i.name,i.timestamp),r=this.cacheSvc.getMetaMap(i.name)),r?.get(i.timestamp)})}getSchema(e,t){return Pe(this,null,function*(){let i=this.resolveDatasetParams(e,t);if(!i)return;let r=this.cacheSvc.getSchemaMap(i.name);r||(yield this.loadDataSet(i.name,i.timestamp),r=this.cacheSvc.getSchemaMap(i.name));let s=r?.get(i.timestamp);if(s){this.schemaSyncSvc.applySchemaToConfig(s,this.cacheSvc.getMetaMap(i.name)?.get(i.timestamp));let o=this.cacheSvc.getGlyphMap(i.name);o&&this.schemaSyncSvc.calculateFeatureMaxValues(o)}return s})}getTimestamps(e){return this.collectionSvc.getTimestamps(e)}getPositions(e,t){return this.collectionSvc.getPositions(e,t)}getDataSetNames(){return this.collectionSvc.getDataSetNames()}getGlyphMap(e){return this.cacheSvc.getGlyphMap(e)}getSchemaMap(e){return this.cacheSvc.getSchemaMap(e)}setDatasetCollection(e){this.collectionSvc.setDatasetCollection(e)}loadProcessedDataset(e,t,i){this.filterService.clearFilters();let r=e.schema,s=e.meta,o=e.features,a=new Map;e.projections&&Array.isArray(e.projections)?e.projections.forEach(d=>{let f=d.data.map(h=>({id:h.id,position:{x:h.x,y:h.y}}));a.set(d.name,f)}):e.positions&&Object.entries(e.positions).forEach(([d,f])=>{a.set(d,f)}),this.cacheSvc.buildDataSet(t,i,r,s,o,a),this.schemaSyncSvc.applySchemaToConfig(r,s);let l=this.cacheSvc.getMetaMap(t)?.get(i);l&&this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(l),this.config.updateConfiguration(),this.config.loadData(t);let u=this.cacheSvc.getGlyphMap(t);u&&(this.filterService.totalItems=u.size,this.filterService.filteredItems=this.filterService.totalItems,this.filterService.setActiveGlyphData(u))}addProcessedDatasetToCollection(e,t,i){let r={};i.projections&&Array.isArray(i.projections)?i.projections.forEach(o=>{r[o.name]=`memory://${e}/${t}/${o.name}`}):i.positions&&Object.keys(i.positions).forEach(o=>{r[o]=`memory://${e}/${t}/${o}`});let s={dataset:e,source:"wasm",items:[{time:t,algorithms:{schema:`memory://${e}/${t}/schema`,meta:`memory://${e}/${t}/meta`,feature:`memory://${e}/${t}/features`,position:r}}]};this.collectionSvc.setDatasetCollection([s])}addPositionsToLoadedDataset(e,t,i,r){let s=this.cacheSvc.getGlyphMap(e);if(!s)return console.warn(`[DataLoader] Cannot add positions - dataset ${e} not in cache`),!1;let o=0;for(let c of r){let l=String(c.id),u=s.get(l);u&&(u.positions[t]||(u.positions[t]={}),u.positions[t][i]=Ae({},c.position),o++)}let a=this.collectionSvc.getCollectionEntry(e);if(a){let c=a.items.find(l=>l.time===t);c&&!c.algorithms.position[i]&&(c.algorithms.position[i]=`memory://${e}/${t}/${i}`,this.collectionSvc.notifyChange())}return this.config.updateConfiguration(),o>0}loadDataSet(e,t){return Pe(this,null,function*(){this.filterService.clearFilters();let i=this.collectionSvc.getCollectionEntry(e),r=i?.items.find(s=>s.time===t);if(r&&i?.source==="wasm"){let s=yield this.dataProcessor.fetchJson(r.algorithms.schema),o=yield this.dataProcessor.fetchJson(r.algorithms.meta),a=yield this.dataProcessor.fetchJson(r.algorithms.feature),c=new Map;for(let[u,d]of Object.entries(r.algorithms.position)){let f=yield this.dataProcessor.fetchJson(d);c.set(u,f)}this.schemaSyncSvc.applySchemaToConfig(s,o),this.config.updateConfiguration();let l=this.cacheSvc.buildDataSet(e,t,s,o,a,c);this.filterService.totalItems=l,this.filterService.filteredItems=l}else if(r&&i?.source==="indexeddb"){let s=yield this.datasetStorage.getDataset(e);if(s){let o=new Map;for(let[u,d]of Object.entries(s.positions))o.set(u,d);this.schemaSyncSvc.applySchemaToConfig(s.schema,s.meta),this.config.updateConfiguration();let a=this.cacheSvc.buildDataSet(e,s.timestamp,s.schema,s.meta,s.features,o);this.filterService.totalItems=a,this.filterService.filteredItems=a;let l=this.cacheSvc.getMetaMap(e)?.get(s.timestamp);l&&this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(l)}}})}resolveDatasetParams(e,t){if(e===void 0&&(e=this.config.loadedData),t===void 0&&(t=this.collectionSvc.getCollectionEntry(e)?.items.at(0)?.time),!(e===void 0||t===void 0))return{name:e,timestamp:t}}static \u0275fac=function(t){return new(t||n)(Ye(th),Ye(Ua),Ye(Ba),Ye(Va),Ye(Ph),Ye(Uh),Ye(Ha),Ye(Km),Ye(Qm),Ye(eg))};static \u0275prov=Ie({token:n,factory:n.\u0275fac,providedIn:"root"})};var yj=(n,e)=>e.group,vj=(n,e)=>e.id;function _j(n,e){if(n&1&&is(0,"span",5),n&2){let t=Jn();Qs("background",t.getContinuousGradient(t.selectedScale))}}function xj(n,e){if(n&1&&is(0,"span",7),n&2){let t=e.$implicit;Qs("background",t)}}function bj(n,e){if(n&1&&pa(0,xj,1,2,"span",6,jf),n&2){let t=Jn();ma(t.getCategoricalColors(t.selectedScale))}}function Mj(n,e){if(n&1&&is(0,"span",5),n&2){let t=Jn().$implicit,i=Jn(3);Qs("background",i.getContinuousGradient(t))}}function Sj(n,e){if(n&1&&is(0,"span",7),n&2){let t=e.$implicit;Qs("background",t)}}function Ej(n,e){if(n&1&&pa(0,Sj,1,2,"span",6,jf),n&2){let t=Jn().$implicit,i=Jn(3);ma(i.getCategoricalColors(t))}}function wj(n,e){if(n&1){let t=r_();Yi(0,"div",12),wl("click",function(){let r=Zc(t).$implicit,s=Jn(3);return Jc(s.selectScale(r.id))})("keydown",function(r){Zc(t);let s=Jn(3);return Jc(s.onListKeydown(r))}),Yi(1,"span",13),Tl(2),fi(),fa(3,Mj,1,2,"span",3)(4,Ej,2,0),fi()}if(n&2){let t=e.$implicit,i=Jn(3);ya("active",t.id===i.selectedScale.id),ns("aria-selected",t.id===i.selectedScale.id),zn(2),va(t.name),zn(),ha(t.type==="numeric"?3:4)}}function Tj(n,e){n&1&&is(0,"div",11)}function Cj(n,e){if(n&1&&(Yi(0,"div",8)(1,"div",9),Tl(2),fi(),pa(3,wj,5,5,"div",10,vj),fi(),fa(5,Tj,1,0,"div",11)),n&2){let t=e.$implicit,i=e.$index,r=Jn(2);ns("aria-labelledby",r.groupLabelId(i)),zn(),ga("id",r.groupLabelId(i)),zn(),va(t.group),zn(),ma(t.scales),zn(2),ha(i<r.groupedColorScales.length-1?5:-1)}}function Dj(n,e){if(n&1&&(Yi(0,"div",4),pa(1,Cj,6,4,null,null,yj),fi()),n&2){let t=Jn();ga("id",t.listboxId),ns("aria-labelledby",t.triggerLabelledby)("aria-label",t.ariaLabelledby?null:t.ariaLabel),zn(),ma(t.groupedColorScales)}}var Aj=0,XI=class n{constructor(e,t){this.host=e;this.cdr=t}host;cdr;groupedColorScales=[];selectedScale;ariaLabel="Color scale";ariaLabelledby=null;scaleSelected=new Dn;uid=Aj++;listboxId=`color-scale-listbox-${this.uid}`;valueId=`color-scale-value-${this.uid}`;dropdownOpen=!1;getContinuousGradient=SD;getCategoricalColors=l0;get triggerLabelledby(){return this.ariaLabelledby?`${this.ariaLabelledby} ${this.valueId}`:null}get triggerLabel(){return this.ariaLabelledby?null:`${this.ariaLabel}: ${this.selectedScale.name}`}groupLabelId(e){return`${this.listboxId}-group-${e}`}toggleDropdown(){this.dropdownOpen?this.close(!0):this.open()}selectScale(e){this.scaleSelected.emit(e),this.close(!0)}onTriggerKeydown(e){e.key==="ArrowDown"||e.key==="ArrowUp"?(e.preventDefault(),this.open()):e.key==="Escape"&&this.dropdownOpen&&(e.preventDefault(),this.close(!0))}onListKeydown(e){let t=this.options(),i=t.findIndex(r=>r===document.activeElement);switch(e.key){case"ArrowDown":this.focusOption(Math.min(i+1,t.length-1));break;case"ArrowUp":this.focusOption(Math.max(i-1,0));break;case"Home":this.focusOption(0);break;case"End":this.focusOption(t.length-1);break;case"Enter":case" ":this.selectFocused(i);break;case"Escape":this.close(!0);break;default:return}e.preventDefault(),e.stopPropagation()}onHostClick(e){e.stopPropagation()}onDocumentClick(){this.dropdownOpen=!1}onFocusOut(e){let t=e.relatedTarget;this.dropdownOpen&&!(t instanceof Node&&this.host.nativeElement.contains(t))&&(this.dropdownOpen=!1)}open(){this.dropdownOpen=!0,this.cdr.detectChanges();let e=this.flatScales().findIndex(t=>t.id===this.selectedScale.id);this.focusOption(Math.max(e,0))}close(e){this.dropdownOpen=!1,e&&(this.cdr.detectChanges(),this.host.nativeElement.querySelector(".selected-scale")?.focus())}selectFocused(e){let t=this.flatScales()[e];t&&this.selectScale(t.id)}flatScales(){return this.groupedColorScales.flatMap(e=>e.scales)}options(){return Array.from(this.host.nativeElement.querySelectorAll('[role="option"]'))}focusOption(e){this.options()[e]?.focus()}static \u0275fac=function(t){return new(t||n)(et(Rn),et(to))};static \u0275cmp=Yv({type:n,selectors:[["app-color-scale-selector"]],hostBindings:function(t,i){t&1&&Sr("click",function(s){return i.onHostClick(s)})("click",function(){return i.onDocumentClick()},wv)("focusout",function(s){return i.onFocusOut(s)})},inputs:{groupedColorScales:"groupedColorScales",selectedScale:"selectedScale",ariaLabel:"ariaLabel",ariaLabelledby:"ariaLabelledby"},outputs:{scaleSelected:"scaleSelected"},decls:7,vars:8,consts:[[1,"color-scale-select"],["type","button","aria-haspopup","listbox",1,"selected-scale",3,"click","keydown"],[1,"visually-hidden",3,"id"],["aria-hidden","true",1,"color-gradient",3,"background"],["role","listbox",1,"color-scale-options",3,"id"],["aria-hidden","true",1,"color-gradient"],["aria-hidden","true",1,"color-box",3,"background"],["aria-hidden","true",1,"color-box"],["role","group"],["role","presentation",1,"color-scale-group-label",3,"id"],["role","option","tabindex","-1",1,"color-scale-option",3,"active"],["aria-hidden","true",1,"color-scale-group-divider"],["role","option","tabindex","-1",1,"color-scale-option",3,"click","keydown"],[1,"visually-hidden"]],template:function(t,i){t&1&&(Yi(0,"div",0)(1,"button",1),wl("click",function(){return i.toggleDropdown()})("keydown",function(s){return i.onTriggerKeydown(s)}),Yi(2,"span",2),Tl(3),fi(),fa(4,_j,1,2,"span",3)(5,bj,2,0),fi(),fa(6,Dj,3,3,"div",4),fi()),t&2&&(zn(),ns("aria-expanded",i.dropdownOpen)("aria-controls",i.listboxId)("aria-labelledby",i.triggerLabelledby)("aria-label",i.triggerLabel),zn(),ga("id",i.valueId),zn(),va(i.selectedScale.name),zn(),ha(i.selectedScale.type==="numeric"?4:5),zn(2),ha(i.dropdownOpen?6:-1))},styles:[`.color-scale-select[_ngcontent-%COMP%]{position:relative;cursor:pointer;-webkit-user-select:none;user-select:none}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;padding:6px 8px;border-radius:8px;border:1px solid #d0d0d0;background:#fff}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:after{content:"";display:inline-block;width:12px;height:12px;margin-left:auto;flex-shrink:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center;background-size:12px 12px}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:hover{border-color:#a0a0a0}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]   .color-gradient[_ngcontent-%COMP%], .color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]   .color-box[_ngcontent-%COMP%]{flex:1;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-options[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;width:95%;background:#fff;border:1px solid #d0d0d0;border-radius:8px;box-shadow:0 4px 12px #0000001f;z-index:20;padding:4px;margin-top:4px;display:flex;flex-direction:column}.color-scale-select[_ngcontent-%COMP%]   .color-scale-group-label[_ngcontent-%COMP%]{font-size:.6875rem;font-weight:500;color:#666;letter-spacing:.06em;text-transform:uppercase;padding:4px 6px 2px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-group-divider[_ngcontent-%COMP%]{height:1px;background:#e0e0e0;margin:6px 0}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]{display:flex;gap:4px;padding:4px;border-radius:6px;cursor:pointer}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]:hover{background:#f0f5ff}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option.active[_ngcontent-%COMP%]{background:#00bcd414;outline:1px solid #00737d}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]   .color-gradient[_ngcontent-%COMP%]{width:100%;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]   .color-box[_ngcontent-%COMP%]{flex:1;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]{width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:focus-visible{outline:2px solid #00737d;outline-offset:2px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]:focus-visible{outline:2px solid #00737d;outline-offset:-2px}.color-scale-select[_ngcontent-%COMP%]   .visually-hidden[_ngcontent-%COMP%]{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}`]})};function ace(n,e,t=40){return(n==="categorical"||n==="text")&&e>t?"numeric":!n||n==="unknown"?e<=10?"categorical":"numeric":n==="categorical"||n==="boolean"||n==="text"?"categorical":"numeric"}function cce(n,e){let{gap:t=1,minWidth:i=6,availableWidth:r}=e,s=Object.keys(n).map(o=>({bin:+o,value:n[o]})).filter(o=>o.value>0).sort((o,a)=>o.bin-a.bin);return JI(s,r,t,i)}function lce(n,e,t){let{gap:i=1,minWidth:r=3,availableWidth:s}=t,o=n.map((a,c)=>({bin:c,value:a,label:e&&e[c]?e[c]:`Bin ${c}`})).filter(a=>a.value>0).sort((a,c)=>a.bin-c.bin);return JI(o,s,i,r)}function JI(n,e,t,i){let r=n.length;if(r===0)return[];let s=n.reduce((d,f)=>d+f.value,0),o=t*(r-1),a=e-o,c=n.map(d=>Math.max(d.value/s*a,i)),l=c.reduce((d,f)=>d+f,0);if(l>a){let d=a/l;c=c.map(f=>f*d)}let u=0;return n.map((d,f)=>{let h=u,p=h+c[f];return u=p+t,st(Ae({},d),{x0:h,x1:p})})}function uce(n,e){let t=n.length;if(t<=e)return n;let i=new Array(e).fill(0),r=t/e;for(let s=0;s<t;s++){let o=Math.floor(s/r);o<e&&(i[o]+=n[s])}return i}var Ij=0,Rj=4102444800;function Nj(n){return n>Ij&&n<Rj}function YI(n){return new Date(n*1e3).toLocaleDateString("en-US",{month:"short",year:"numeric"})}function ZI(n){return Number.isInteger(n)&&Math.abs(n)<1e4?n.toString():Math.abs(n)>=1e3?n.toLocaleString("en-US",{maximumFractionDigits:1}):n.toFixed(2)}function dce(n,e,t,i,r){let s=(i-t)/e,o=t+n*s,a=t+(n+1)*s;return r==="date"&&Nj(o)?`${YI(o)} \u2013 ${YI(a)}`:`${ZI(o)} \u2013 ${ZI(a)}`}function fce(n,e){if(!e?.length)return new Map;let t=Object.keys(n).map(Number);if(t.length===e.length)return new Map(t.map(r=>[r,e[r]]));let i=Object.entries(n).filter(([,r])=>r!==0).map(([r])=>Number(r));return new Map(i.filter((r,s)=>s<e.length).map((r,s)=>[r,e[s]]))}export{rn as a,Ut as b,Qt as c,Tn as d,l1 as e,d1 as f,Fe as g,zi as h,Ie as i,Be as j,Ye as k,ve as l,Xg as m,Zc as n,Jc as o,wM as p,TM as q,_i as r,Zr as s,Dn as t,Bt as u,Ls as v,js as w,yl as x,Rn as y,$R as z,qR as A,GS as B,YR as C,jS as D,qs as E,RN as F,wv as G,zn as H,na as I,cl as J,es as K,Nv as L,dl as M,et as N,Yv as O,iw as P,rw as Q,fO as R,vO as S,_O as T,ns as U,fa as V,ha as W,bO as X,jf as Y,pa as Z,ma as _,vw as $,Df as aa,t_ as ba,_w as ca,Yi as da,fi as ea,is as fa,bw as ga,r_ as ha,ga as ia,Sr as ja,wl as ka,Jn as la,Ew as ma,RO as na,NO as oa,ww as pa,PO as qa,FO as ra,Qs as sa,ya as ta,qO as ua,YO as va,Tl as wa,va as xa,s_ as ya,Bw as za,Vw as Aa,Hw as Ba,aL as Ca,zw as Da,jw as Ea,cL as Fa,lL as Ga,uL as Ha,dL as Ia,eo as Ja,yL as Ka,_L as La,bL as Ma,rK as Na,sK as Oa,oK as Pa,to as Qa,cK as Ra,no as Sa,$L as Ta,f_ as Ua,t2 as Va,n2 as Wa,i2 as Xa,o2 as Ya,a2 as Za,u2 as _a,__ as $a,Rl as ab,AQ as bb,I2 as cb,P2 as db,DT as eb,Iee as fb,ok as gb,BT as hb,Nee as ib,Pee as jb,Fee as kb,xx as lb,pe as mb,A as nb,Pi as ob,nt as pb,G0 as qb,ti as rb,Ru as sb,bI as tb,Gee as ub,jee as vb,XT as wb,ZT as xb,Dk as yb,Rk as zb,y3 as Ab,nU as Bb,Xee as Cb,Yee as Db,Ra as Eb,AC as Fb,Ti as Gb,RU as Hb,bh as Ib,tte as Jb,nte as Kb,Oa as Lb,Aoe as Mb,Ioe as Nb,Roe as Ob,Noe as Pb,Poe as Qb,Foe as Rb,Ooe as Sb,Loe as Tb,Ah as Ub,dne as Vb,fne as Wb,Ih as Xb,CD as Yb,ho as Zb,rne as _b,c0 as $b,sne as ac,MD as bc,SD as cc,l0 as dc,ED as ec,one as fc,wD as gc,TD as hc,Ua as ic,Ba as jc,eg as kc,Lh as lc,kh as mc,Uh as nc,h0 as oc,ND as pc,Ph as qc,qu as rc,OI as sc,LI as tc,Woe as uc,$oe as vc,qoe as wc,qI as xc,ace as yc,cce as zc,lce as Ac,uce as Bc,dce as Cc,fce as Dc,XI as Ec};
