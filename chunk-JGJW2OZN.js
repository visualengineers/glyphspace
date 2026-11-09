import{a as Re,b as at,c as Ve}from"./chunk-WASERODV.js";function tt(n){return typeof n=="function"}function ld(n){let t=n(i=>{Error.call(i),i.stack=new Error().stack});return t.prototype=Object.create(Error.prototype),t.prototype.constructor=t,t}var ud=ld(n=>function(t){n(this),this.message=t?`${t.length} errors occurred during unsubscription:
${t.map((i,r)=>`${r+1}) ${i.toString()}`).join(`
  `)}`:"",this.name="UnsubscriptionError",this.errors=t});function Ic(n,e){if(n){let t=n.indexOf(e);0<=t&&n.splice(t,1)}}var an=class n{constructor(e){this.initialTeardown=e,this.closed=!1,this._parentage=null,this._finalizers=null}unsubscribe(){let e;if(!this.closed){this.closed=!0;let{_parentage:t}=this;if(t)if(this._parentage=null,Array.isArray(t))for(let o of t)o.remove(this);else t.remove(this);let{initialTeardown:i}=this;if(tt(i))try{i()}catch(o){e=o instanceof ud?o.errors:[o]}let{_finalizers:r}=this;if(r){this._finalizers=null;for(let o of r)try{$b(o)}catch(s){e=e??[],s instanceof ud?e=[...e,...s.errors]:e.push(s)}}if(e)throw new ud(e)}}add(e){var t;if(e&&e!==this)if(this.closed)$b(e);else{if(e instanceof n){if(e.closed||e._hasParent(this))return;e._addParent(this)}(this._finalizers=(t=this._finalizers)!==null&&t!==void 0?t:[]).push(e)}}_hasParent(e){let{_parentage:t}=this;return t===e||Array.isArray(t)&&t.includes(e)}_addParent(e){let{_parentage:t}=this;this._parentage=Array.isArray(t)?(t.push(e),t):t?[t,e]:e}_removeParent(e){let{_parentage:t}=this;t===e?this._parentage=null:Array.isArray(t)&&Ic(t,e)}remove(e){let{_finalizers:t}=this;t&&Ic(t,e),e instanceof n&&e._removeParent(this)}};an.EMPTY=(()=>{let n=new an;return n.closed=!0,n})();var Fg=an.EMPTY;function dd(n){return n instanceof an||n&&"closed"in n&&tt(n.remove)&&tt(n.add)&&tt(n.unsubscribe)}function $b(n){tt(n)?n():n.unsubscribe()}function vR(n){return tt(n?.lift)}function gn(n){return e=>{if(vR(e))return e.lift(function(t){try{return n(t,this)}catch(i){this.error(i)}});throw new TypeError("Unable to lift unknown Observable type")}}var Mi={onUnhandledError:null,onStoppedNotification:null,Promise:void 0,useDeprecatedSynchronousErrorHandling:!1,useDeprecatedNextContext:!1};var Hs={setTimeout(n,e,...t){let{delegate:i}=Hs;return i?.setTimeout?i.setTimeout(n,e,...t):setTimeout(n,e,...t)},clearTimeout(n){let{delegate:e}=Hs;return(e?.clearTimeout||clearTimeout)(n)},delegate:void 0};function fd(n){Hs.setTimeout(()=>{let{onUnhandledError:e}=Mi;if(e)e(n);else throw n})}function Og(){}var qb=Lg("C",void 0,void 0);function Xb(n){return Lg("E",void 0,n)}function Yb(n){return Lg("N",n,void 0)}function Lg(n,e,t){return{kind:n,value:e,error:t}}var Ho=null;function zs(n){if(Mi.useDeprecatedSynchronousErrorHandling){let e=!Ho;if(e&&(Ho={errorThrown:!1,error:null}),n(),e){let{errorThrown:t,error:i}=Ho;if(Ho=null,t)throw i}}else n()}function Zb(n){Mi.useDeprecatedSynchronousErrorHandling&&Ho&&(Ho.errorThrown=!0,Ho.error=n)}var zo=class extends an{constructor(e){super(),this.isStopped=!1,e?(this.destination=e,dd(e)&&e.add(this)):this.destination=bR}static create(e,t,i){return new Gs(e,t,i)}next(e){this.isStopped?Ug(Yb(e),this):this._next(e)}error(e){this.isStopped?Ug(Xb(e),this):(this.isStopped=!0,this._error(e))}complete(){this.isStopped?Ug(qb,this):(this.isStopped=!0,this._complete())}unsubscribe(){this.closed||(this.isStopped=!0,super.unsubscribe(),this.destination=null)}_next(e){this.destination.next(e)}_error(e){try{this.destination.error(e)}finally{this.unsubscribe()}}_complete(){try{this.destination.complete()}finally{this.unsubscribe()}}},_R=Function.prototype.bind;function kg(n,e){return _R.call(n,e)}var Bg=class{constructor(e){this.partialObserver=e}next(e){let{partialObserver:t}=this;if(t.next)try{t.next(e)}catch(i){hd(i)}}error(e){let{partialObserver:t}=this;if(t.error)try{t.error(e)}catch(i){hd(i)}else hd(e)}complete(){let{partialObserver:e}=this;if(e.complete)try{e.complete()}catch(t){hd(t)}}},Gs=class extends zo{constructor(e,t,i){super();let r;if(tt(e)||!e)r={next:e??void 0,error:t??void 0,complete:i??void 0};else{let o;this&&Mi.useDeprecatedNextContext?(o=Object.create(e),o.unsubscribe=()=>this.unsubscribe(),r={next:e.next&&kg(e.next,o),error:e.error&&kg(e.error,o),complete:e.complete&&kg(e.complete,o)}):r=e}this.destination=new Bg(r)}};function hd(n){Mi.useDeprecatedSynchronousErrorHandling?Zb(n):fd(n)}function xR(n){throw n}function Ug(n,e){let{onStoppedNotification:t}=Mi;t&&Hs.setTimeout(()=>t(n,e))}var bR={closed:!0,next:Og,error:xR,complete:Og};function yn(n,e,t,i,r){return new Vg(n,e,t,i,r)}var Vg=class extends zo{constructor(e,t,i,r,o,s){super(e),this.onFinalize=o,this.shouldUnsubscribe=s,this._next=t?function(a){try{t(a)}catch(c){e.error(c)}}:super._next,this._error=r?function(a){try{r(a)}catch(c){e.error(c)}finally{this.unsubscribe()}}:super._error,this._complete=i?function(){try{i()}catch(a){e.error(a)}finally{this.unsubscribe()}}:super._complete}unsubscribe(){var e;if(!this.shouldUnsubscribe||this.shouldUnsubscribe()){let{closed:t}=this;super.unsubscribe(),!t&&((e=this.onFinalize)===null||e===void 0||e.call(this))}}};function An(n,e){return gn((t,i)=>{let r=0;t.subscribe(yn(i,o=>{i.next(n.call(e,o,r++))}))})}function pd(n){return n}function SR(n,e=pd){return n=n??MR,gn((t,i)=>{let r,o=!0;t.subscribe(yn(i,s=>{let a=e(s);(o||!n(r,a))&&(o=!1,r=a,i.next(s))}))})}function MR(n,e){return n===e}function Rc(n,e){return gn((t,i)=>{let r=0;t.subscribe(yn(i,o=>n.call(e,o,r++)&&i.next(o)))})}function ER(n){return Rc((e,t)=>n<=t)}var js=typeof Symbol=="function"&&Symbol.observable||"@@observable";function Jb(n){return n.length===0?pd:n.length===1?n[0]:function(t){return n.reduce((i,r)=>r(i),t)}}var Ot=(()=>{class n{constructor(t){t&&(this._subscribe=t)}lift(t){let i=new n;return i.source=this,i.operator=t,i}subscribe(t,i,r){let o=CR(t)?t:new Gs(t,i,r);return zs(()=>{let{operator:s,source:a}=this;o.add(s?s.call(o,a):a?this._subscribe(o):this._trySubscribe(o))}),o}_trySubscribe(t){try{return this._subscribe(t)}catch(i){t.error(i)}}forEach(t,i){return i=Kb(i),new i((r,o)=>{let s=new Gs({next:a=>{try{t(a)}catch(c){o(c),s.unsubscribe()}},error:o,complete:r});this.subscribe(s)})}_subscribe(t){var i;return(i=this.source)===null||i===void 0?void 0:i.subscribe(t)}[js](){return this}pipe(...t){return Jb(t)(this)}toPromise(t){return t=Kb(t),new t((i,r)=>{let o;this.subscribe(s=>o=s,s=>r(s),()=>i(o))})}}return n.create=e=>new n(e),n})();function Kb(n){var e;return(e=n??Mi.Promise)!==null&&e!==void 0?e:Promise}function wR(n){return n&&tt(n.next)&&tt(n.error)&&tt(n.complete)}function CR(n){return n&&n instanceof zo||wR(n)&&dd(n)}var Qb=ld(n=>function(){n(this),this.name="ObjectUnsubscribedError",this.message="object unsubscribed"});var Gt=(()=>{class n extends Ot{constructor(){super(),this.closed=!1,this.currentObservers=null,this.observers=[],this.isStopped=!1,this.hasError=!1,this.thrownError=null}lift(t){let i=new md(this,this);return i.operator=t,i}_throwIfClosed(){if(this.closed)throw new Qb}next(t){zs(()=>{if(this._throwIfClosed(),!this.isStopped){this.currentObservers||(this.currentObservers=Array.from(this.observers));for(let i of this.currentObservers)i.next(t)}})}error(t){zs(()=>{if(this._throwIfClosed(),!this.isStopped){this.hasError=this.isStopped=!0,this.thrownError=t;let{observers:i}=this;for(;i.length;)i.shift().error(t)}})}complete(){zs(()=>{if(this._throwIfClosed(),!this.isStopped){this.isStopped=!0;let{observers:t}=this;for(;t.length;)t.shift().complete()}})}unsubscribe(){this.isStopped=this.closed=!0,this.observers=this.currentObservers=null}get observed(){var t;return((t=this.observers)===null||t===void 0?void 0:t.length)>0}_trySubscribe(t){return this._throwIfClosed(),super._trySubscribe(t)}_subscribe(t){return this._throwIfClosed(),this._checkFinalizedStatuses(t),this._innerSubscribe(t)}_innerSubscribe(t){let{hasError:i,isStopped:r,observers:o}=this;return i||r?Fg:(this.currentObservers=null,o.push(t),new an(()=>{this.currentObservers=null,Ic(o,t)}))}_checkFinalizedStatuses(t){let{hasError:i,thrownError:r,isStopped:o}=this;i?t.error(r):o&&t.complete()}asObservable(){let t=new Ot;return t.source=this,t}}return n.create=(e,t)=>new md(e,t),n})(),md=class extends Gt{constructor(e,t){super(),this.destination=e,this.source=t}next(e){var t,i;(i=(t=this.destination)===null||t===void 0?void 0:t.next)===null||i===void 0||i.call(t,e)}error(e){var t,i;(i=(t=this.destination)===null||t===void 0?void 0:t.error)===null||i===void 0||i.call(t,e)}complete(){var e,t;(t=(e=this.destination)===null||e===void 0?void 0:e.complete)===null||t===void 0||t.call(e)}_subscribe(e){var t,i;return(i=(t=this.source)===null||t===void 0?void 0:t.subscribe(e))!==null&&i!==void 0?i:Fg}};var nn=class extends Gt{constructor(e){super(),this._value=e}get value(){return this.getValue()}_subscribe(e){let t=super._subscribe(e);return!t.closed&&e.next(this._value),t}getValue(){let{hasError:e,thrownError:t,_value:i}=this;if(e)throw t;return this._throwIfClosed(),i}next(e){super.next(this._value=e)}};function eS(n){return n&&tt(n.schedule)}function tS(n){return n[n.length-1]}function nS(n){return tt(tS(n))?n.pop():void 0}function iS(n){return eS(tS(n))?n.pop():void 0}function oS(n,e,t,i){function r(o){return o instanceof t?o:new t(function(s){s(o)})}return new(t||(t=Promise))(function(o,s){function a(u){try{l(i.next(u))}catch(d){s(d)}}function c(u){try{l(i.throw(u))}catch(d){s(d)}}function l(u){u.done?o(u.value):r(u.value).then(a,c)}l((i=i.apply(n,e||[])).next())})}function rS(n){var e=typeof Symbol=="function"&&Symbol.iterator,t=e&&n[e],i=0;if(t)return t.call(n);if(n&&typeof n.length=="number")return{next:function(){return n&&i>=n.length&&(n=void 0),{value:n&&n[i++],done:!n}}};throw new TypeError(e?"Object is not iterable.":"Symbol.iterator is not defined.")}function Go(n){return this instanceof Go?(this.v=n,this):new Go(n)}function sS(n,e,t){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var i=t.apply(n,e||[]),r,o=[];return r=Object.create((typeof AsyncIterator=="function"?AsyncIterator:Object).prototype),a("next"),a("throw"),a("return",s),r[Symbol.asyncIterator]=function(){return this},r;function s(h){return function(g){return Promise.resolve(g).then(h,d)}}function a(h,g){i[h]&&(r[h]=function(y){return new Promise(function(p,m){o.push([h,y,p,m])>1||c(h,y)})},g&&(r[h]=g(r[h])))}function c(h,g){try{l(i[h](g))}catch(y){f(o[0][3],y)}}function l(h){h.value instanceof Go?Promise.resolve(h.value.v).then(u,d):f(o[0][2],h)}function u(h){c("next",h)}function d(h){c("throw",h)}function f(h,g){h(g),o.shift(),o.length&&c(o[0][0],o[0][1])}}function aS(n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var e=n[Symbol.asyncIterator],t;return e?e.call(n):(n=typeof rS=="function"?rS(n):n[Symbol.iterator](),t={},i("next"),i("throw"),i("return"),t[Symbol.asyncIterator]=function(){return this},t);function i(o){t[o]=n[o]&&function(s){return new Promise(function(a,c){s=n[o](s),r(a,c,s.done,s.value)})}}function r(o,s,a,c){Promise.resolve(c).then(function(l){o({value:l,done:a})},s)}}var gd=n=>n&&typeof n.length=="number"&&typeof n!="function";function yd(n){return tt(n?.then)}function vd(n){return tt(n[js])}function _d(n){return Symbol.asyncIterator&&tt(n?.[Symbol.asyncIterator])}function xd(n){return new TypeError(`You provided ${n!==null&&typeof n=="object"?"an invalid object":`'${n}'`} where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.`)}function TR(){return typeof Symbol!="function"||!Symbol.iterator?"@@iterator":Symbol.iterator}var bd=TR();function Sd(n){return tt(n?.[bd])}function Md(n){return sS(this,arguments,function*(){let t=n.getReader();try{for(;;){let{value:i,done:r}=yield Go(t.read());if(r)return yield Go(void 0);yield yield Go(i)}}finally{t.releaseLock()}})}function Ed(n){return tt(n?.getReader)}function jn(n){if(n instanceof Ot)return n;if(n!=null){if(vd(n))return DR(n);if(gd(n))return AR(n);if(yd(n))return IR(n);if(_d(n))return cS(n);if(Sd(n))return RR(n);if(Ed(n))return NR(n)}throw xd(n)}function DR(n){return new Ot(e=>{let t=n[js]();if(tt(t.subscribe))return t.subscribe(e);throw new TypeError("Provided object does not correctly implement Symbol.observable")})}function AR(n){return new Ot(e=>{for(let t=0;t<n.length&&!e.closed;t++)e.next(n[t]);e.complete()})}function IR(n){return new Ot(e=>{n.then(t=>{e.closed||(e.next(t),e.complete())},t=>e.error(t)).then(null,fd)})}function RR(n){return new Ot(e=>{for(let t of n)if(e.next(t),e.closed)return;e.complete()})}function cS(n){return new Ot(e=>{PR(n,e).catch(t=>e.error(t))})}function NR(n){return cS(Md(n))}function PR(n,e){var t,i,r,o;return oS(this,void 0,void 0,function*(){try{for(t=aS(n);i=yield t.next(),!i.done;){let s=i.value;if(e.next(s),e.closed)return}}catch(s){r={error:s}}finally{try{i&&!i.done&&(o=t.return)&&(yield o.call(t))}finally{if(r)throw r.error}}e.complete()})}function ui(n,e,t,i=0,r=!1){let o=e.schedule(function(){t(),r?n.add(this.schedule(null,i)):this.unsubscribe()},i);if(n.add(o),!r)return o}function wd(n,e=0){return gn((t,i)=>{t.subscribe(yn(i,r=>ui(i,n,()=>i.next(r),e),()=>ui(i,n,()=>i.complete(),e),r=>ui(i,n,()=>i.error(r),e)))})}function Cd(n,e=0){return gn((t,i)=>{i.add(n.schedule(()=>t.subscribe(i),e))})}function lS(n,e){return jn(n).pipe(Cd(e),wd(e))}function uS(n,e){return jn(n).pipe(Cd(e),wd(e))}function dS(n,e){return new Ot(t=>{let i=0;return e.schedule(function(){i===n.length?t.complete():(t.next(n[i++]),t.closed||this.schedule())})})}function fS(n,e){return new Ot(t=>{let i;return ui(t,e,()=>{i=n[bd](),ui(t,e,()=>{let r,o;try{({value:r,done:o}=i.next())}catch(s){t.error(s);return}o?t.complete():t.next(r)},0,!0)}),()=>tt(i?.return)&&i.return()})}function Td(n,e){if(!n)throw new Error("Iterable cannot be null");return new Ot(t=>{ui(t,e,()=>{let i=n[Symbol.asyncIterator]();ui(t,e,()=>{i.next().then(r=>{r.done?t.complete():t.next(r.value)})},0,!0)})})}function hS(n,e){return Td(Md(n),e)}function pS(n,e){if(n!=null){if(vd(n))return lS(n,e);if(gd(n))return dS(n,e);if(yd(n))return uS(n,e);if(_d(n))return Td(n,e);if(Sd(n))return fS(n,e);if(Ed(n))return hS(n,e)}throw xd(n)}function Nc(n,e){return e?pS(n,e):jn(n)}function Ws(...n){let e=iS(n);return Nc(n,e)}var{isArray:FR}=Array;function OR(n,e){return FR(e)?n(...e):n(e)}function mS(n){return An(e=>OR(n,e))}var{isArray:LR}=Array,{getPrototypeOf:kR,prototype:UR,keys:BR}=Object;function gS(n){if(n.length===1){let e=n[0];if(LR(e))return{args:e,keys:null};if(VR(e)){let t=BR(e);return{args:t.map(i=>e[i]),keys:t}}}return{args:n,keys:null}}function VR(n){return n&&typeof n=="object"&&kR(n)===UR}function yS(n,e){return n.reduce((t,i,r)=>(t[i]=e[r],t),{})}function vS(n,e,t,i,r,o,s,a){let c=[],l=0,u=0,d=!1,f=()=>{d&&!c.length&&!l&&e.complete()},h=y=>l<i?g(y):c.push(y),g=y=>{o&&e.next(y),l++;let p=!1;jn(t(y,u++)).subscribe(yn(e,m=>{r?.(m),o?h(m):e.next(m)},()=>{p=!0},void 0,()=>{if(p)try{for(l--;c.length&&l<i;){let m=c.shift();s?ui(e,s,()=>g(m)):g(m)}f()}catch(m){e.error(m)}}))};return n.subscribe(yn(e,h,()=>{d=!0,f()})),()=>{a?.()}}function Dd(n,e,t=1/0){return tt(e)?Dd((i,r)=>An((o,s)=>e(i,o,r,s))(jn(n(i,r))),t):(typeof e=="number"&&(t=e),gn((i,r)=>vS(i,r,n,t)))}function Pc(...n){let e=nS(n),{args:t,keys:i}=gS(n),r=new Ot(o=>{let{length:s}=t;if(!s){o.complete();return}let a=new Array(s),c=s,l=s;for(let u=0;u<s;u++){let d=!1;jn(t[u]).subscribe(yn(o,f=>{d||(d=!0,l--),a[u]=f},()=>c--,void 0,()=>{(!c||!d)&&(l||o.next(i?yS(i,a):a),o.complete())}))}});return e?r.pipe(mS(e)):r}function Hg(n,e){return tt(e)?Dd(n,e,1):Dd(n,1)}function zg(n){return gn((e,t)=>{try{e.subscribe(t)}finally{t.add(n)}})}function Gg(n,e){return gn((t,i)=>{let r=null,o=0,s=!1,a=()=>s&&!r&&i.complete();t.subscribe(yn(i,c=>{r?.unsubscribe();let l=0,u=o++;jn(n(c,u)).subscribe(r=yn(i,d=>i.next(e?e(c,d,u,l++):d),()=>{r=null,a()}))},()=>{s=!0,a()}))})}var vn=null,Ad=!1,jg=1,HR=null,_n=Symbol("SIGNAL");function Ue(n){let e=vn;return vn=n,e}function Pd(){return vn}var $s={version:0,lastCleanEpoch:0,dirty:!1,producers:void 0,producersTail:void 0,consumers:void 0,consumersTail:void 0,recomputing:!1,consumerAllowSignalWrites:!1,consumerIsAlwaysLive:!1,kind:"unknown",producerMustRecompute:()=>!1,producerRecomputeValue:()=>{},consumerMarkedDirty:()=>{},consumerOnSignalRead:()=>{}};function Fd(n){if(Ad)throw new Error("");if(vn===null)return;vn.consumerOnSignalRead(n);let e=vn.producersTail;if(e!==void 0&&e.producer===n)return;let t,i=vn.recomputing;if(i&&(t=e!==void 0?e.nextProducer:vn.producers,t!==void 0&&t.producer===n)){vn.producersTail=t,t.lastReadVersion=n.version;return}let r=n.consumersTail;if(r!==void 0&&r.consumer===vn&&(!i||GR(r,vn)))return;let o=qs(vn),s={producer:n,consumer:vn,nextProducer:t,prevConsumer:r,lastReadVersion:n.version,nextConsumer:void 0};vn.producersTail=s,e!==void 0?e.nextProducer=s:vn.producers=s,o&&SS(n,s)}function _S(){jg++}function Od(n){if(!(qs(n)&&!n.dirty)&&!(!n.dirty&&n.lastCleanEpoch===jg)){if(!n.producerMustRecompute(n)&&!qg(n)){Nd(n);return}n.producerRecomputeValue(n),Nd(n)}}function Wg(n){if(n.consumers===void 0)return;let e=Ad;Ad=!0;try{for(let t=n.consumers;t!==void 0;t=t.nextConsumer){let i=t.consumer;i.dirty||zR(i)}}finally{Ad=e}}function $g(){return vn?.consumerAllowSignalWrites!==!1}function zR(n){n.dirty=!0,Wg(n),n.consumerMarkedDirty?.(n)}function Nd(n){n.dirty=!1,n.lastCleanEpoch=jg}function Oc(n){return n&&xS(n),Ue(n)}function xS(n){n.producersTail=void 0,n.recomputing=!0}function Ld(n,e){Ue(e),n&&bS(n)}function bS(n){n.recomputing=!1;let e=n.producersTail,t=e!==void 0?e.nextProducer:n.producers;if(t!==void 0){if(qs(n))do t=Xg(t);while(t!==void 0);e!==void 0?e.nextProducer=void 0:n.producers=void 0}}function qg(n){for(let e=n.producers;e!==void 0;e=e.nextProducer){let t=e.producer,i=e.lastReadVersion;if(i!==t.version||(Od(t),i!==t.version))return!0}return!1}function kd(n){if(qs(n)){let e=n.producers;for(;e!==void 0;)e=Xg(e)}n.producers=void 0,n.producersTail=void 0,n.consumers=void 0,n.consumersTail=void 0}function SS(n,e){let t=n.consumersTail,i=qs(n);if(t!==void 0?(e.nextConsumer=t.nextConsumer,t.nextConsumer=e):(e.nextConsumer=void 0,n.consumers=e),e.prevConsumer=t,n.consumersTail=e,!i)for(let r=n.producers;r!==void 0;r=r.nextProducer)SS(r.producer,r)}function Xg(n){let e=n.producer,t=n.nextProducer,i=n.nextConsumer,r=n.prevConsumer;if(n.nextConsumer=void 0,n.prevConsumer=void 0,i!==void 0?i.prevConsumer=r:e.consumersTail=r,r!==void 0)r.nextConsumer=i;else if(e.consumers=i,!qs(e)){let o=e.producers;for(;o!==void 0;)o=Xg(o)}return t}function qs(n){return n.consumerIsAlwaysLive||n.consumers!==void 0}function Ud(n){HR?.(n)}function GR(n,e){let t=e.producersTail;if(t!==void 0){let i=e.producers;do{if(i===n)return!0;if(i===t)break;i=i.nextProducer}while(i!==void 0)}return!1}function Bd(n,e){return Object.is(n,e)}function Lc(n,e){let t=Object.create(jR);t.computation=n,e!==void 0&&(t.equal=e);let i=()=>{if(Od(t),Fd(t),t.value===Fc)throw t.error;return t.value};return i[_n]=t,Ud(t),i}var Id=Symbol("UNSET"),Rd=Symbol("COMPUTING"),Fc=Symbol("ERRORED"),jR=at(Re({},$s),{value:Id,dirty:!0,error:null,equal:Bd,kind:"computed",producerMustRecompute(n){return n.value===Id||n.value===Rd},producerRecomputeValue(n){if(n.value===Rd)throw new Error("");let e=n.value;n.value=Rd;let t=Oc(n),i,r=!1;try{i=n.computation(),Ue(null),r=e!==Id&&e!==Fc&&i!==Fc&&n.equal(e,i)}catch(o){i=Fc,n.error=o}finally{Ld(n,t)}if(r){n.value=e;return}n.value=i,n.version++}});function WR(){throw new Error}var MS=WR;function ES(n){MS(n)}function Yg(n){MS=n}var $R=null;function Zg(n,e){let t=Object.create(CS);t.value=n,e!==void 0&&(t.equal=e);let i=()=>wS(t);return i[_n]=t,Ud(t),[i,s=>Vd(t,s),s=>Jg(t,s)]}function wS(n){return Fd(n),n.value}function Vd(n,e){$g()||ES(n),n.equal(n.value,e)||(n.value=e,qR(n))}function Jg(n,e){$g()||ES(n),Vd(n,e(n.value))}var CS=at(Re({},$s),{equal:Bd,value:void 0,kind:"signal"});function qR(n){n.version++,_S(),Wg(n),$R?.(n)}var Kg;function Hd(){return Kg}function qi(n){let e=Kg;return Kg=n,e}var TS=Symbol("NotFound");function Xs(n){return n===TS||n?.name==="\u0275NotFound"}function DS(n){let e=Ue(null);try{return n()}finally{Ue(e)}}var qd="https://angular.dev/best-practices/security#preventing-cross-site-scripting-xss",Ne=class extends Error{code;constructor(e,t){super(Gc(e,t)),this.code=e}};function ZR(n){return`NG0${Math.abs(n)}`}function Gc(n,e){return`${ZR(n)}${e?": "+e:""}`}var Xi=globalThis;function bt(n){for(let e in n)if(n[e]===bt)return e;throw Error("")}function PS(n,e){for(let t in e)e.hasOwnProperty(t)&&!n.hasOwnProperty(t)&&(n[t]=e[t])}function Xd(n){if(typeof n=="string")return n;if(Array.isArray(n))return`[${n.map(Xd).join(", ")}]`;if(n==null)return""+n;let e=n.overriddenName||n.name;if(e)return`${e}`;let t=n.toString();if(t==null)return""+t;let i=t.indexOf(`
`);return i>=0?t.slice(0,i):t}function Yd(n,e){return n?e?`${n} ${e}`:n:e||""}var JR=bt({__forward_ref__:bt});function Yi(n){return n.__forward_ref__=Yi,n}function cn(n){return hy(n)?n():n}function hy(n){return typeof n=="function"&&n.hasOwnProperty(JR)&&n.__forward_ref__===Yi}function Pe(n){return{token:n.token,providedIn:n.providedIn||null,factory:n.factory,value:void 0}}function Jr(n){return{providers:n.providers||[],imports:n.imports||[]}}function Zd(n){return KR(n,Jd)}function KR(n,e){return n.hasOwnProperty(e)&&n[e]||null}function QR(n){let e=n?.[Jd]??null;return e||null}function ey(n){return n&&n.hasOwnProperty(jd)?n[jd]:null}var Jd=bt({\u0275prov:bt}),jd=bt({\u0275inj:bt}),He=class{_desc;ngMetadataName="InjectionToken";\u0275prov;constructor(e,t){this._desc=e,this.\u0275prov=void 0,typeof t=="number"?this.__NG_ELEMENT_ID__=t:t!==void 0&&(this.\u0275prov=Pe({token:this,providedIn:t.providedIn||"root",factory:t.factory}))}get multi(){return this}toString(){return`InjectionToken ${this._desc}`}};function py(n){return n&&!!n.\u0275providers}var jc=bt({\u0275cmp:bt}),Wc=bt({\u0275dir:bt}),my=bt({\u0275pipe:bt});var Uc=bt({\u0275fac:bt}),Yo=bt({__NG_ELEMENT_ID__:bt}),AS=bt({__NG_ENV_ID__:bt});function Kr(n){return yy(n,"@Component"),n[jc]||null}function Kd(n){return yy(n,"@Directive"),n[Wc]||null}function gy(n){return yy(n,"@Pipe"),n[my]||null}function yy(n,e){if(n==null)throw new Ne(-919,!1)}function Zs(n){return typeof n=="string"?n:n==null?"":String(n)}var FS=bt({ngErrorCode:bt}),eN=bt({ngErrorMessage:bt}),tN=bt({ngTokenPath:bt});function vy(n,e){return OS("",-200,e)}function Qd(n,e){throw new Ne(-201,!1)}function OS(n,e,t){let i=new Ne(e,n);return i[FS]=e,i[eN]=n,t&&(i[tN]=t),i}function nN(n){return n[FS]}var ty;function LS(){return ty}function In(n){let e=ty;return ty=n,e}function _y(n,e,t){let i=Zd(n);if(i&&i.providedIn=="root")return i.value===void 0?i.value=i.factory():i.value;if(t&8)return null;if(e!==void 0)return e;Qd(n,"")}var iN={},jo=iN,rN="__NG_DI_FLAG__",ny=class{injector;constructor(e){this.injector=e}retrieve(e,t){let i=Wo(t)||0;try{return this.injector.get(e,i&8?null:jo,i)}catch(r){if(Xs(r))return r;throw r}}};function oN(n,e=0){let t=Hd();if(t===void 0)throw new Ne(-203,!1);if(t===null)return _y(n,void 0,e);{let i=sN(e),r=t.retrieve(n,i);if(Xs(r)){if(i.optional)return null;throw r}return r}}function lt(n,e=0){return(LS()||oN)(cn(n),e)}function be(n,e){return lt(n,Wo(e))}function Wo(n){return typeof n>"u"||typeof n=="number"?n:0|(n.optional&&8)|(n.host&&1)|(n.self&&2)|(n.skipSelf&&4)}function sN(n){return{optional:!!(n&8),host:!!(n&1),self:!!(n&2),skipSelf:!!(n&4)}}function iy(n){let e=[];for(let t=0;t<n.length;t++){let i=cn(n[t]);if(Array.isArray(i)){if(i.length===0)throw new Ne(900,!1);let r,o=0;for(let s=0;s<i.length;s++){let a=i[s],c=aN(a);typeof c=="number"?c===-1?r=a.token:o|=c:r=a}e.push(lt(r,o))}else e.push(lt(i))}return e}function aN(n){return n[rN]}function Yr(n,e){let t=n.hasOwnProperty(Uc);return t?n[Uc]:null}function kS(n,e,t){if(n.length!==e.length)return!1;for(let i=0;i<n.length;i++){let r=n[i],o=e[i];if(t&&(r=t(r),o=t(o)),o!==r)return!1}return!0}function US(n){return n.flat(Number.POSITIVE_INFINITY)}function ef(n,e){n.forEach(t=>Array.isArray(t)?ef(t,e):e(t))}function xy(n,e,t){e>=n.length?n.push(t):n.splice(e,0,t)}function $c(n,e){return e>=n.length-1?n.pop():n.splice(e,1)[0]}function by(n,e,t){let i=n.length-t;for(;e<i;)n[e]=n[e+t],e++;for(;t--;)n.pop()}function Sy(n,e,t,i){let r=n.length;if(r==e)n.push(t,i);else if(r===1)n.push(i,n[0]),n[0]=t;else{for(r--,n.push(n[r-1],n[r]);r>e;){let o=r-2;n[r]=n[o],r--}n[e]=t,n[e+1]=i}}function tf(n,e,t){let i=Js(n,e);return i>=0?n[i|1]=t:(i=~i,Sy(n,i,e,t)),i}function nf(n,e){let t=Js(n,e);if(t>=0)return n[t|1]}function Js(n,e){return cN(n,e,1)}function cN(n,e,t){let i=0,r=n.length>>t;for(;r!==i;){let o=i+(r-i>>1),s=n[o<<t];if(e===s)return o<<t;s>e?r=o:i=o+1}return~(r<<t)}var Qr={},xn=[],Zo=new He(""),My=new He("",-1),Ey=new He(""),Bc=class{get(e,t=jo){if(t===jo){let r=OS("",-201);throw r.name="\u0275NotFound",r}return t}};function qc(n){return{\u0275providers:n}}function BS(...n){return{\u0275providers:rf(!0,n),\u0275fromNgModule:!0}}function rf(n,...e){let t=[],i=new Set,r,o=s=>{t.push(s)};return ef(e,s=>{let a=s;Wd(a,o,[],i)&&(r||=[],r.push(a))}),r!==void 0&&VS(r,o),t}function VS(n,e){for(let t=0;t<n.length;t++){let{ngModule:i,providers:r}=n[t];wy(r,o=>{e(o,i)})}}function Wd(n,e,t,i){if(n=cn(n),!n)return!1;let r=null,o=ey(n),s=!o&&Kr(n);if(!o&&!s){let c=n.ngModule;if(o=ey(c),o)r=c;else return!1}else{if(s&&!s.standalone)return!1;r=n}let a=i.has(r);if(s){if(a)return!1;if(i.add(r),s.dependencies){let c=typeof s.dependencies=="function"?s.dependencies():s.dependencies;for(let l of c)Wd(l,e,t,i)}}else if(o){if(o.imports!=null&&!a){i.add(r);let l;ef(o.imports,u=>{Wd(u,e,t,i)&&(l||=[],l.push(u))}),l!==void 0&&VS(l,e)}if(!a){let l=Yr(r)||(()=>new r);e({provide:r,useFactory:l,deps:xn},r),e({provide:Ey,useValue:r,multi:!0},r),e({provide:Zo,useValue:()=>lt(r),multi:!0},r)}let c=o.providers;if(c!=null&&!a){let l=n;wy(c,u=>{e(u,l)})}}else return!1;return r!==n&&n.providers!==void 0}function wy(n,e){for(let t of n)py(t)&&(t=t.\u0275providers),Array.isArray(t)?wy(t,e):e(t)}var lN=bt({provide:String,useValue:bt});function HS(n){return n!==null&&typeof n=="object"&&lN in n}function uN(n){return!!(n&&n.useExisting)}function dN(n){return!!(n&&n.useFactory)}function $o(n){return typeof n=="function"}function zS(n){return!!n.useClass}var Cy=new He(""),zd={},IS={},Qg;function Xc(){return Qg===void 0&&(Qg=new Bc),Qg}var bn=class{},qo=class extends bn{parent;source;scopes;records=new Map;_ngOnDestroyHooks=new Set;_onDestroyHooks=[];get destroyed(){return this._destroyed}_destroyed=!1;injectorDefTypes;constructor(e,t,i,r){super(),this.parent=t,this.source=i,this.scopes=r,oy(e,s=>this.processProvider(s)),this.records.set(My,Ys(void 0,this)),r.has("environment")&&this.records.set(bn,Ys(void 0,this));let o=this.records.get(Cy);o!=null&&typeof o.value=="string"&&this.scopes.add(o.value),this.injectorDefTypes=new Set(this.get(Ey,xn,{self:!0}))}retrieve(e,t){let i=Wo(t)||0;try{return this.get(e,jo,i)}catch(r){if(Xs(r))return r;throw r}}destroy(){kc(this),this._destroyed=!0;let e=Ue(null);try{for(let i of this._ngOnDestroyHooks)i.ngOnDestroy();let t=this._onDestroyHooks;this._onDestroyHooks=[];for(let i of t)i()}finally{this.records.clear(),this._ngOnDestroyHooks.clear(),this.injectorDefTypes.clear(),Ue(e)}}onDestroy(e){return kc(this),this._onDestroyHooks.push(e),()=>this.removeOnDestroy(e)}runInContext(e){kc(this);let t=qi(this),i=In(void 0),r;try{return e()}finally{qi(t),In(i)}}get(e,t=jo,i){if(kc(this),e.hasOwnProperty(AS))return e[AS](this);let r=Wo(i),o,s=qi(this),a=In(void 0);try{if(!(r&4)){let l=this.records.get(e);if(l===void 0){let u=gN(e)&&Zd(e);u&&this.injectableDefInScope(u)?l=Ys(ry(e),zd):l=null,this.records.set(e,l)}if(l!=null)return this.hydrate(e,l,r)}let c=r&2?Xc():this.parent;return t=r&8&&t===jo?null:t,c.get(e,t)}catch(c){let l=nN(c);throw l===-200||l===-201?new Ne(l,null):c}finally{In(a),qi(s)}}resolveInjectorInitializers(){let e=Ue(null),t=qi(this),i=In(void 0),r;try{let o=this.get(Zo,xn,{self:!0});for(let s of o)s()}finally{qi(t),In(i),Ue(e)}}toString(){return"R3Injector[...]"}processProvider(e){e=cn(e);let t=$o(e)?e:cn(e&&e.provide),i=hN(e);if(!$o(e)&&e.multi===!0){let r=this.records.get(t);r||(r=Ys(void 0,zd,!0),r.factory=()=>iy(r.multi),this.records.set(t,r)),t=e,r.multi.push(e)}this.records.set(t,i)}hydrate(e,t,i){let r=Ue(null);try{if(t.value===IS)throw vy("");return t.value===zd&&(t.value=IS,t.value=t.factory(void 0,i)),typeof t.value=="object"&&t.value&&mN(t.value)&&this._ngOnDestroyHooks.add(t.value),t.value}finally{Ue(r)}}injectableDefInScope(e){if(!e.providedIn)return!1;let t=cn(e.providedIn);return typeof t=="string"?t==="any"||this.scopes.has(t):this.injectorDefTypes.has(t)}removeOnDestroy(e){let t=this._onDestroyHooks.indexOf(e);t!==-1&&this._onDestroyHooks.splice(t,1)}};function ry(n){let e=Zd(n),t=e!==null?e.factory:Yr(n);if(t!==null)return t;if(n instanceof He)throw new Ne(-204,!1);if(n instanceof Function)return fN(n);throw new Ne(-204,!1)}function fN(n){if(n.length>0)throw new Ne(-204,!1);let t=QR(n);return t!==null?()=>t.factory(n):()=>new n}function hN(n){if(HS(n))return Ys(void 0,n.useValue);{let e=Ty(n);return Ys(e,zd)}}function Ty(n,e,t){let i;if($o(n)){let r=cn(n);return Yr(r)||ry(r)}else if(HS(n))i=()=>cn(n.useValue);else if(dN(n))i=()=>n.useFactory(...iy(n.deps||[]));else if(uN(n))i=(r,o)=>lt(cn(n.useExisting),o!==void 0&&o&8?8:void 0);else{let r=cn(n&&(n.useClass||n.provide));if(pN(n))i=()=>new r(...iy(n.deps));else return Yr(r)||ry(r)}return i}function kc(n){if(n.destroyed)throw new Ne(-205,!1)}function Ys(n,e,t=!1){return{factory:n,value:e,multi:t?[]:void 0}}function pN(n){return!!n.deps}function mN(n){return n!==null&&typeof n=="object"&&typeof n.ngOnDestroy=="function"}function gN(n){return typeof n=="function"||typeof n=="object"&&n.ngMetadataName==="InjectionToken"}function oy(n,e){for(let t of n)Array.isArray(t)?oy(t,e):t&&py(t)?oy(t.\u0275providers,e):e(t)}function Ks(n,e){let t;n instanceof qo?(kc(n),t=n):t=new ny(n);let i,r=qi(t),o=In(void 0);try{return e()}finally{qi(r),In(o)}}function GS(){return LS()!==void 0||Hd()!=null}var wi=0,Se=1,ze=2,Yt=3,di=4,fi=5,Qs=6,ea=7,Wt=8,Nn=9,Ci=10,Et=11,ta=12,Dy=13,Jo=14,Kn=15,eo=16,Ko=17,Zi=18,Mr=19,Ay=20,br=21,of=22,Yc=23,Qn=24,Qo=25,to=26,Dt=27,jS=1,no=6,io=7,Zc=8,es=9,kt=10;function Er(n){return Array.isArray(n)&&typeof n[jS]=="object"}function Ti(n){return Array.isArray(n)&&n[jS]===!0}function Iy(n){return(n.flags&4)!==0}function wr(n){return n.componentOffset>-1}function na(n){return(n.flags&1)===1}function Ji(n){return!!n.template}function ia(n){return(n[ze]&512)!==0}function ro(n){return(n[ze]&256)===256}var Wn=(function(n){return n[n.NONE=0]="NONE",n[n.HTML=1]="HTML",n[n.STYLE=2]="STYLE",n[n.SCRIPT=3]="SCRIPT",n[n.URL=4]="URL",n[n.RESOURCE_URL=5]="RESOURCE_URL",n[n.ATTRIBUTE_NO_BINDING=6]="ATTRIBUTE_NO_BINDING",n})(Wn||{}),Gd,Vc="svg",Ry="math";function WS(){return Gd||(Gd={},Xr(Wn.HTML,void 0,[["iframe",["srcdoc"]],["*",["innerHTML","outerHTML"]]]),Xr(Wn.STYLE,void 0,[["*",["style"]]]),Xr(Wn.URL,void 0,[["*",["formAction"]],["area",["href"]],["a",["href","xlink:href"]],["form",["action"]],["img",["src"]],["video",["src"]]]),Xr(Wn.URL,Ry,[["*",["href","xlink:href"]],["annotation",["href","xlink:href"]],["annotation-xml",["href","xlink:href"]],["maction",["href","xlink:href"]],["malignmark",["href","xlink:href"]],["math",["href","xlink:href"]],["mroot",["href","xlink:href"]],["msqrt",["href","xlink:href"]],["merror",["href","xlink:href"]],["mfrac",["href","xlink:href"]],["mglyph",["href","xlink:href"]],["msub",["href","xlink:href"]],["msup",["href","xlink:href"]],["msubsup",["href","xlink:href"]],["mmultiscripts",["href","xlink:href"]],["mprescripts",["href","xlink:href"]],["mi",["href","xlink:href"]],["mn",["href","xlink:href"]],["mo",["href","xlink:href"]],["mpadded",["href","xlink:href"]],["mphantom",["href","xlink:href"]],["mrow",["href","xlink:href"]],["ms",["href","xlink:href"]],["mspace",["href","xlink:href"]],["mstyle",["href","xlink:href"]],["mtable",["href","xlink:href"]],["mtd",["href","xlink:href"]],["mtr",["href","xlink:href"]],["mtext",["href","xlink:href"]],["mover",["href","xlink:href"]],["munder",["href","xlink:href"]],["munderover",["href","xlink:href"]],["semantics",["href","xlink:href"]],["none",["href","xlink:href"]]]),Xr(Wn.RESOURCE_URL,void 0,[["base",["href"]],["embed",["src"]],["frame",["src"]],["iframe",["src"]],["link",["href"]],["object",["codebase","data"]]]),Xr(Wn.URL,Vc,[["a",["href","xlink:href"]]]),Xr(Wn.ATTRIBUTE_NO_BINDING,Vc,[["animate",["attributeName","values","to","from"]],["set",["to","attributeName"]],["animateMotion",["attributeName"]],["animateTransform",["attributeName"]]]),Xr(Wn.ATTRIBUTE_NO_BINDING,void 0,[["unknown",["attributeName","values","to","from","sandbox","allow","allowFullscreen","referrerPolicy","csp","fetchPriority"]],["iframe",["sandbox","allow","allowFullscreen","referrerPolicy","csp","fetchPriority"]]])),Gd}function Xr(n,e,t){for(let[i,r]of t){let o=e&&i!=="unknown"?`:${e}:${i}`:i;o=o.toLowerCase();for(let s of r)Gd[`${o}|${s.toLowerCase()}`]=n}}function $S(n,e,t){let i=WS(),r=n.toLowerCase(),o=e.toLowerCase(),s=t&&r!=="*"&&r!=="unknown"?i[`:${t}:${r}|${o}`]:void 0,a=t?i[`:${t}:*|${o}`]:void 0;return s??a??i[`${r}|${o}`]??i[`*|${o}`]??Wn.NONE}function hi(n){for(;Array.isArray(n);)n=n[wi];return n}function Ny(n,e){return hi(e[n])}function pi(n,e){return hi(e[n.index])}function ra(n,e){return n.data[e]}function Py(n,e){return n[e]}function Fy(n,e,t,i){t>=n.data.length&&(n.data[t]=null,n.blueprint[t]=null),e[t]=i}function mi(n,e){let t=e[n];return Er(t)?t:t[wi]}function qS(n){return(n[ze]&4)===4}function sf(n){return(n[ze]&128)===128}function XS(n){return Ti(n[Yt])}function Pn(n,e){return e==null?null:n[e]}function Oy(n){n[Ko]=0}function Ly(n){n[ze]&1024||(n[ze]|=1024,sf(n)&&oa(n))}function YS(n,e){for(;n>0;)e=e[Jo],n--;return e}function Jc(n){return!!(n[ze]&9216||n[Qn]?.dirty)}function af(n){n[Ci].changeDetectionScheduler?.notify(8),n[ze]&64&&(n[ze]|=1024),Jc(n)&&oa(n)}function oa(n){n[Ci].changeDetectionScheduler?.notify(0);let e=Zr(n);for(;e!==null&&!(e[ze]&8192||(e[ze]|=8192,!sf(e)));)e=Zr(e)}function cf(n,e){if(ro(n))throw new Ne(911,!1);n[br]===null&&(n[br]=[]),n[br].push(e)}function ky(n,e){if(n[br]===null)return;let t=n[br].indexOf(e);t!==-1&&n[br].splice(t,1)}function Zr(n){let e=n[Yt];return Ti(e)?e[Yt]:e}function Uy(n){return n[ea]??=[]}function By(n){return n.cleanup??=[]}function ZS(n,e,t,i){let r=Uy(e);r.push(t),n.firstCreatePass&&By(n).push(i,r.length-1)}var qe={lFrame:dM(null),bindingsEnabled:!0,skipHydrationRootTNode:null};var sy=!1;function JS(){return qe.lFrame.elementDepthCount}function KS(){qe.lFrame.elementDepthCount++}function Vy(){qe.lFrame.elementDepthCount--}function lf(){return qe.bindingsEnabled}function QS(){return qe.skipHydrationRootTNode!==null}function Hy(n){return qe.skipHydrationRootTNode===n}function zy(){qe.skipHydrationRootTNode=null}function Oe(){return qe.lFrame.lView}function At(){return qe.lFrame.tView}function Kc(n){return qe.lFrame.contextLView=n,n[Wt]}function Qc(n){return qe.lFrame.contextLView=null,n}function rn(){let n=Gy();for(;n!==null&&n.type===64;)n=n.parent;return n}function Gy(){return qe.lFrame.currentTNode}function eM(){let n=qe.lFrame,e=n.currentTNode;return n.isParent?e:e.parent}function sa(n,e){let t=qe.lFrame;t.currentTNode=n,t.isParent=e}function jy(){return qe.lFrame.isParent}function tM(){qe.lFrame.isParent=!1}function nM(){return qe.lFrame.contextLView}function Wy(){return sy}function $y(n){let e=sy;return sy=n,e}function iM(){let n=qe.lFrame,e=n.bindingRootIndex;return e===-1&&(e=n.bindingRootIndex=n.tView.bindingStartIndex),e}function rM(){return qe.lFrame.bindingIndex}function oM(n){return qe.lFrame.bindingIndex=n}function oo(){return qe.lFrame.bindingIndex++}function uf(n){let e=qe.lFrame,t=e.bindingIndex;return e.bindingIndex=e.bindingIndex+n,t}function sM(){return qe.lFrame.inI18n}function aM(n,e){let t=qe.lFrame;t.bindingIndex=t.bindingRootIndex=n,df(e)}function cM(){return qe.lFrame.currentDirectiveIndex}function df(n){qe.lFrame.currentDirectiveIndex=n}function lM(n){let e=qe.lFrame.currentDirectiveIndex;return e===-1?null:n[e]}function ff(){return qe.lFrame.currentQueryIndex}function el(n){qe.lFrame.currentQueryIndex=n}function yN(n){let e=n[Se];return e.type===2?e.declTNode:e.type===1?n[fi]:null}function qy(n,e,t){if(t&4){let r=e,o=n;for(;r=r.parent,r===null&&!(t&1);)if(r=yN(o),r===null||(o=o[Jo],r.type&10))break;if(r===null)return!1;e=r,n=o}let i=qe.lFrame=uM();return i.currentTNode=e,i.lView=n,!0}function hf(n){let e=uM(),t=n[Se];qe.lFrame=e,e.currentTNode=t.firstChild,e.lView=n,e.tView=t,e.contextLView=n,e.bindingIndex=t.bindingStartIndex,e.inI18n=!1}function uM(){let n=qe.lFrame,e=n===null?null:n.child;return e===null?dM(n):e}function dM(n){let e={currentTNode:null,isParent:!0,lView:null,tView:null,selectedIndex:-1,contextLView:null,elementDepthCount:0,currentNamespace:null,currentDirectiveIndex:-1,bindingRootIndex:-1,bindingIndex:-1,currentQueryIndex:0,parent:n,child:null,inI18n:!1};return n!==null&&(n.child=e),e}function fM(){let n=qe.lFrame;return qe.lFrame=n.parent,n.currentTNode=null,n.lView=null,n}var Xy=fM;function pf(){let n=fM();n.isParent=!0,n.tView=null,n.selectedIndex=-1,n.contextLView=null,n.elementDepthCount=0,n.currentDirectiveIndex=-1,n.currentNamespace=null,n.bindingRootIndex=-1,n.bindingIndex=-1,n.currentQueryIndex=0}function hM(n){return(qe.lFrame.contextLView=YS(n,qe.lFrame.contextLView))[Wt]}function Di(){return qe.lFrame.selectedIndex}function so(n){qe.lFrame.selectedIndex=n}function aa(){let n=qe.lFrame;return ra(n.tView,n.selectedIndex)}function pM(){qe.lFrame.currentNamespace=Vc}function mM(){vN()}function vN(){qe.lFrame.currentNamespace=null}function Yy(){return qe.lFrame.currentNamespace}var gM=!0;function mf(){return gM}function tl(n){gM=n}function ay(n,e=null,t=null,i){let r=yM(n,e,t,i);return r.resolveInjectorInitializers(),r}function yM(n,e=null,t=null,i,r=new Set){let o=[t||xn,BS(n)],s;return new qo(o,e||Xc(),s||null,r)}var Ei=class n{static THROW_IF_NOT_FOUND=jo;static NULL=new Bc;static create(e,t){if(Array.isArray(e))return ay({name:""},t,e,"");{let i=e.name??"";return ay({name:i},e.parent,e.providers,i)}}static \u0275prov=Pe({token:n,providedIn:"any",factory:()=>lt(My)});static __NG_ELEMENT_ID__=-1},ao=new He(""),co=(()=>{class n{static __NG_ELEMENT_ID__=_N;static __NG_ENV_ID__=t=>t}return n})(),cy=class extends co{_lView;constructor(e){super(),this._lView=e}get destroyed(){return ro(this._lView)}onDestroy(e){let t=this._lView;return cf(t,e),()=>ky(t,e)}};function _N(){return new cy(Oe())}var Zy=!1,vM=new He(""),lo=(()=>{class n{taskId=0;pendingTasks=new Set;destroyed=!1;pendingTask=new nn(!1);debugTaskTracker=be(vM,{optional:!0});get hasPendingTasks(){return this.destroyed?!1:this.pendingTask.value}get hasPendingTasksObservable(){return this.destroyed?new Ot(t=>{t.next(!1),t.complete()}):this.pendingTask}add(){!this.hasPendingTasks&&!this.destroyed&&this.pendingTask.next(!0);let t=this.taskId++;return this.pendingTasks.add(t),this.debugTaskTracker?.add(t),t}has(t){return this.pendingTasks.has(t)}remove(t){this.pendingTasks.delete(t),this.debugTaskTracker?.remove(t),this.pendingTasks.size===0&&this.hasPendingTasks&&this.pendingTask.next(!1)}ngOnDestroy(){this.pendingTasks.clear(),this.hasPendingTasks&&this.pendingTask.next(!1),this.destroyed=!0,this.pendingTask.unsubscribe()}static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new n})}return n})(),ly=class extends Gt{__isAsync;destroyRef=void 0;pendingTasks=void 0;constructor(e=!1){super(),this.__isAsync=e,GS()&&(this.destroyRef=be(co,{optional:!0})??void 0,this.pendingTasks=be(lo,{optional:!0})??void 0)}emit(e){let t=Ue(null);try{super.next(e)}finally{Ue(t)}}subscribe(e,t,i){let r=e,o=t||(()=>null),s=i;if(e&&typeof e=="object"){let c=e;r=c.next?.bind(c),o=c.error?.bind(c),s=c.complete?.bind(c)}this.__isAsync&&(o=this.wrapInTimeout(o),r&&(r=this.wrapInTimeout(r)),s&&(s=this.wrapInTimeout(s)));let a=super.subscribe({next:r,error:o,complete:s});return e instanceof an&&e.add(a),a}wrapInTimeout(e){return t=>{let i=this.pendingTasks?.add();setTimeout(()=>{try{e(t)}finally{i!==void 0&&this.pendingTasks?.remove(i)}})}}},Rn=ly;function $d(...n){}function Jy(n){let e,t;function i(){n=$d;try{t!==void 0&&typeof cancelAnimationFrame=="function"&&cancelAnimationFrame(t),e!==void 0&&clearTimeout(e)}catch(r){}}return e=setTimeout(()=>{n(),i()}),typeof requestAnimationFrame=="function"&&(t=requestAnimationFrame(()=>{n(),i()})),()=>i()}function _M(n){return queueMicrotask(()=>n()),()=>{n=$d}}var Ky="isAngularZone",Hc=Ky+"_ID",xN=0,jt=class n{hasPendingMacrotasks=!1;hasPendingMicrotasks=!1;isStable=!0;onUnstable=new Rn(!1);onMicrotaskEmpty=new Rn(!1);onStable=new Rn(!1);onError=new Rn(!1);constructor(e){let{enableLongStackTrace:t=!1,shouldCoalesceEventChangeDetection:i=!1,shouldCoalesceRunChangeDetection:r=!1,scheduleInRootZone:o=Zy}=e;if(typeof Zone>"u")throw new Ne(908,!1);Zone.assertZonePatched();let s=this;s._nesting=0,s._outer=s._inner=Zone.current,Zone.TaskTrackingZoneSpec&&(s._inner=s._inner.fork(new Zone.TaskTrackingZoneSpec)),t&&Zone.longStackTraceZoneSpec&&(s._inner=s._inner.fork(Zone.longStackTraceZoneSpec)),s.shouldCoalesceEventChangeDetection=!r&&i,s.shouldCoalesceRunChangeDetection=r,s.callbackScheduled=!1,s.scheduleInRootZone=o,MN(s)}static isInAngularZone(){return typeof Zone<"u"&&Zone.current.get(Ky)===!0}static assertInAngularZone(){if(!n.isInAngularZone())throw new Ne(909,!1)}static assertNotInAngularZone(){if(n.isInAngularZone())throw new Ne(909,!1)}run(e,t,i){return this._inner.run(e,t,i)}runTask(e,t,i,r){let o=this._inner,s=o.scheduleEventTask("NgZoneEvent: "+r,e,bN,$d,$d);try{return o.runTask(s,t,i)}finally{o.cancelTask(s)}}runGuarded(e,t,i){return this._inner.runGuarded(e,t,i)}runOutsideAngular(e){return this._outer.run(e)}},bN={};function Qy(n){if(n._nesting==0&&!n.hasPendingMicrotasks&&!n.isStable)try{n._nesting++,n.onMicrotaskEmpty.emit(null)}finally{if(n._nesting--,!n.hasPendingMicrotasks)try{n.runOutsideAngular(()=>n.onStable.emit(null))}finally{n.isStable=!0}}}function SN(n){if(n.isCheckStableRunning||n.callbackScheduled)return;n.callbackScheduled=!0;function e(){Jy(()=>{n.callbackScheduled=!1,uy(n),n.isCheckStableRunning=!0,Qy(n),n.isCheckStableRunning=!1})}n.scheduleInRootZone?Zone.root.run(()=>{e()}):n._outer.run(()=>{e()}),uy(n)}function MN(n){let e=()=>{SN(n)},t=xN++;n._inner=n._inner.fork({name:"angular",properties:{[Ky]:!0,[Hc]:t,[Hc+t]:!0},onInvokeTask:(i,r,o,s,a,c)=>{if(EN(c))return i.invokeTask(o,s,a,c);try{return RS(n),i.invokeTask(o,s,a,c)}finally{(n.shouldCoalesceEventChangeDetection&&s.type==="eventTask"||n.shouldCoalesceRunChangeDetection)&&e(),NS(n)}},onInvoke:(i,r,o,s,a,c,l)=>{try{return RS(n),i.invoke(o,s,a,c,l)}finally{n.shouldCoalesceRunChangeDetection&&!n.callbackScheduled&&!wN(c)&&e(),NS(n)}},onHasTask:(i,r,o,s)=>{i.hasTask(o,s),r===o&&(s.change=="microTask"?(n._hasPendingMicrotasks=s.microTask,uy(n),Qy(n)):s.change=="macroTask"&&(n.hasPendingMacrotasks=s.macroTask))},onHandleError:(i,r,o,s)=>(i.handleError(o,s),n.runOutsideAngular(()=>n.onError.emit(s)),!1)})}function uy(n){n._hasPendingMicrotasks||(n.shouldCoalesceEventChangeDetection||n.shouldCoalesceRunChangeDetection)&&n.callbackScheduled===!0?n.hasPendingMicrotasks=!0:n.hasPendingMicrotasks=!1}function RS(n){n._nesting++,n.isStable&&(n.isStable=!1,n.onUnstable.emit(null))}function NS(n){n._nesting--,Qy(n)}var zc=class{hasPendingMicrotasks=!1;hasPendingMacrotasks=!1;isStable=!0;onUnstable=new Rn;onMicrotaskEmpty=new Rn;onStable=new Rn;onError=new Rn;run(e,t,i){return e.apply(t,i)}runGuarded(e,t,i){return e.apply(t,i)}runOutsideAngular(e){return e()}runTask(e,t,i,r){return e.apply(t,i)}};function EN(n){return xM(n,"__ignore_ng_zone__")}function wN(n){return xM(n,"__scheduler_tick__")}function xM(n,e){return!Array.isArray(n)||n.length!==1?!1:n[0]?.data?.[e]===!0}var Xo=class{_console=console;handleError(e){this._console.error("ERROR",e)}},Ki=new He("",{factory:()=>{let n=be(jt),e=be(bn),t;return i=>{n.runOutsideAngular(()=>{e.destroyed&&!t?setTimeout(()=>{throw i}):(t??=e.get(Xo),t.handleError(i))})}}}),bM={provide:Zo,useValue:()=>{let n=be(Xo,{optional:!0})},multi:!0};function ts(n,e){let[t,i,r]=Zg(n,e?.equal),o=t,s=o[_n];return o.set=i,o.update=r,o.asReadonly=SM.bind(o),o}function SM(){let n=this[_n];if(n.readonlyFn===void 0){let e=()=>this();e[_n]=n,n.readonlyFn=e}return n.readonlyFn}var gf=(()=>{class n{view;node;constructor(t,i){this.view=t,this.node=i}static __NG_ELEMENT_ID__=CN}return n})();function CN(){return new gf(Oe(),rn())}var Sr=class{},ca=new He("",{factory:()=>!0});var yf=new He(""),nl=(()=>{class n{internalPendingTasks=be(lo);scheduler=be(Sr);errorHandler=be(Ki);add(){let t=this.internalPendingTasks.add();return()=>{this.internalPendingTasks.has(t)&&(this.scheduler.notify(11),this.internalPendingTasks.remove(t))}}run(t){let i=this.add();t().catch(this.errorHandler).finally(i)}static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new n})}return n})(),ev=(()=>{class n{static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new dy})}return n})(),dy=class{dirtyEffectCount=0;queues=new Map;add(e){this.enqueue(e),this.schedule(e)}schedule(e){e.dirty&&this.dirtyEffectCount++}remove(e){let t=e.zone,i=this.queues.get(t);i.has(e)&&(i.delete(e),e.dirty&&this.dirtyEffectCount--)}enqueue(e){let t=e.zone;this.queues.has(t)||this.queues.set(t,new Set);let i=this.queues.get(t);i.has(e)||i.add(e)}flush(){for(;this.dirtyEffectCount>0;){let e=!1;for(let[t,i]of this.queues)t===null?e||=this.flushQueue(i):e||=t.run(()=>this.flushQueue(i));e||(this.dirtyEffectCount=0)}}flushQueue(e){let t=!1;for(let i of e)i.dirty&&(this.dirtyEffectCount--,t=!0,i.run());return t}},fy=class{[_n];constructor(e){this[_n]=e}destroy(){this[_n].destroy()}};function yl(n){return{toString:n}.toString()}function ON(n){return typeof n=="function"}function cE(n,e,t,i){e!==null?e.applyValueToInputSignal(e,i):n[t]=i}var Af=class{previousValue;currentValue;firstChange;constructor(e,t,i){this.previousValue=e,this.currentValue=t,this.firstChange=i}isFirstChange(){return this.firstChange}},vl=(()=>{let n=()=>lE;return n.ngInherit=!0,n})();function lE(n){return n.type.prototype.ngOnChanges&&(n.setInput=kN),LN}function LN(){let n=dE(this),e=n?.current;if(e){let t=n.previous;if(t===Qr)n.previous=e;else for(let i in e)t[i]=e[i];n.current=null,this.ngOnChanges(e)}}function kN(n,e,t,i,r){let o=this.declaredInputs[i],s=dE(n)||UN(n,{previous:Qr,current:null}),a=s.current||(s.current={}),c=s.previous,l=c[o];a[o]=new Af(l&&l.currentValue,t,c===Qr),cE(n,e,r,t)}var uE="__ngSimpleChanges__";function dE(n){return n[uE]||null}function UN(n,e){return n[uE]=e}var MM=[];var ut=function(n,e=null,t){for(let i=0;i<MM.length;i++){let r=MM[i];r(n,e,t)}},ot=(function(n){return n[n.TemplateCreateStart=0]="TemplateCreateStart",n[n.TemplateCreateEnd=1]="TemplateCreateEnd",n[n.TemplateUpdateStart=2]="TemplateUpdateStart",n[n.TemplateUpdateEnd=3]="TemplateUpdateEnd",n[n.LifecycleHookStart=4]="LifecycleHookStart",n[n.LifecycleHookEnd=5]="LifecycleHookEnd",n[n.OutputStart=6]="OutputStart",n[n.OutputEnd=7]="OutputEnd",n[n.BootstrapApplicationStart=8]="BootstrapApplicationStart",n[n.BootstrapApplicationEnd=9]="BootstrapApplicationEnd",n[n.BootstrapComponentStart=10]="BootstrapComponentStart",n[n.BootstrapComponentEnd=11]="BootstrapComponentEnd",n[n.ChangeDetectionStart=12]="ChangeDetectionStart",n[n.ChangeDetectionEnd=13]="ChangeDetectionEnd",n[n.ChangeDetectionSyncStart=14]="ChangeDetectionSyncStart",n[n.ChangeDetectionSyncEnd=15]="ChangeDetectionSyncEnd",n[n.AfterRenderHooksStart=16]="AfterRenderHooksStart",n[n.AfterRenderHooksEnd=17]="AfterRenderHooksEnd",n[n.ComponentStart=18]="ComponentStart",n[n.ComponentEnd=19]="ComponentEnd",n[n.DeferBlockStateStart=20]="DeferBlockStateStart",n[n.DeferBlockStateEnd=21]="DeferBlockStateEnd",n[n.DynamicComponentStart=22]="DynamicComponentStart",n[n.DynamicComponentEnd=23]="DynamicComponentEnd",n[n.HostBindingsUpdateStart=24]="HostBindingsUpdateStart",n[n.HostBindingsUpdateEnd=25]="HostBindingsUpdateEnd",n})(ot||{});function BN(n,e,t){let{ngOnChanges:i,ngOnInit:r,ngDoCheck:o}=e.type.prototype;if(i){let s=lE(e);(t.preOrderHooks??=[]).push(n,s),(t.preOrderCheckHooks??=[]).push(n,s)}r&&(t.preOrderHooks??=[]).push(0-n,r),o&&((t.preOrderHooks??=[]).push(n,o),(t.preOrderCheckHooks??=[]).push(n,o))}function fE(n,e){for(let t=e.directiveStart,i=e.directiveEnd;t<i;t++){let o=n.data[t].type.prototype,{ngAfterContentInit:s,ngAfterContentChecked:a,ngAfterViewInit:c,ngAfterViewChecked:l,ngOnDestroy:u}=o;s&&(n.contentHooks??=[]).push(-t,s),a&&((n.contentHooks??=[]).push(t,a),(n.contentCheckHooks??=[]).push(t,a)),c&&(n.viewHooks??=[]).push(-t,c),l&&((n.viewHooks??=[]).push(t,l),(n.viewCheckHooks??=[]).push(t,l)),u!=null&&(n.destroyHooks??=[]).push(t,u)}}function Mf(n,e,t){hE(n,e,3,t)}function Ef(n,e,t,i){(n[ze]&3)===t&&hE(n,e,t,i)}function tv(n,e){let t=n[ze];(t&3)===e&&(t&=16383,t+=1,n[ze]=t)}function hE(n,e,t,i){let r=i!==void 0?n[Ko]&65535:0,o=i??-1,s=e.length-1,a=0;for(let c=r;c<s;c++)if(typeof e[c+1]=="number"){if(a=e[c],i!=null&&a>=i)break}else e[c]<0&&(n[Ko]+=65536),(a<o||o==-1)&&(VN(n,t,e,c),n[Ko]=(n[Ko]&4294901760)+c+2),c++}function EM(n,e){ut(ot.LifecycleHookStart,n,e);let t=Ue(null);try{e.call(n)}finally{Ue(t),ut(ot.LifecycleHookEnd,n,e)}}function VN(n,e,t,i){let r=t[i]<0,o=t[i+1],s=r?-t[i]:t[i],a=n[s];r?n[ze]>>14<n[Ko]>>16&&(n[ze]&3)===e&&(n[ze]+=16384,EM(a,o)):EM(a,o)}var ua=-1,is=class{factory;name;injectImpl;resolving=!1;canSeeViewProviders;multi;componentProviders;index;providerFactory;constructor(e,t,i,r){this.factory=e,this.name=r,this.canSeeViewProviders=t,this.injectImpl=i}};function HN(n){return(n.flags&8)!==0}function zN(n){return(n.flags&16)!==0}function GN(n,e,t){let i=0;for(;i<t.length;){let r=t[i];if(typeof r=="number"){if(r!==0)break;i++;let o=t[i++],s=t[i++],a=t[i++];n.setAttribute(e,s,a,o)}else{let o=r,s=t[++i];WN(o)?n.setProperty(e,o,s):n.setAttribute(e,o,s),i++}}return i}function jN(n){return n===3||n===4||n===6}function WN(n){return n.charCodeAt(0)===64}function ha(n,e){if(!(e===null||e.length===0))if(n===null||n.length===0)n=e.slice();else{let t=-1;for(let i=0;i<e.length;i++){let r=e[i];typeof r=="number"?t=r:t===0||(t===-1||t===2?wM(n,t,r,null,e[++i]):wM(n,t,r,null,null))}}return n}function wM(n,e,t,i,r){let o=0,s=n.length;if(e===-1)s=-1;else for(;o<n.length;){let a=n[o++];if(typeof a=="number"){if(a===e){s=-1;break}else if(a>e){s=o-1;break}}}for(;o<n.length;){let a=n[o];if(typeof a=="number")break;if(a===t){r!==null&&(n[o+1]=r);return}o++,r!==null&&o++}s!==-1&&(n.splice(s,0,e),o=s+1),n.splice(o++,0,t),r!==null&&n.splice(o++,0,r)}function pE(n){return n!==ua}function If(n){return n&32767}function $N(n){return n>>16}function Rf(n,e){let t=$N(n),i=e;for(;t>0;)i=i[Jo],t--;return i}var pv=!0;function Nf(n){let e=pv;return pv=n,e}var qN=256,mE=qN-1,gE=5,XN=0,Qi={};function YN(n,e,t){let i;typeof t=="string"?i=t.charCodeAt(0)||0:t.hasOwnProperty(Yo)&&(i=t[Yo]),i==null&&(i=t[Yo]=XN++);let r=i&mE,o=1<<r;e.data[n+(r>>gE)]|=o}function Pf(n,e){let t=yE(n,e);if(t!==-1)return t;let i=e[Se];i.firstCreatePass&&(n.injectorIndex=e.length,nv(i.data,n),nv(e,null),nv(i.blueprint,null));let r=Zv(n,e),o=n.injectorIndex;if(pE(r)){let s=If(r),a=Rf(r,e),c=a[Se].data;for(let l=0;l<8;l++)e[o+l]=a[s+l]|c[s+l]}return e[o+8]=r,o}function nv(n,e){n.push(0,0,0,0,0,0,0,0,e)}function yE(n,e){return n.injectorIndex===-1||n.parent&&n.parent.injectorIndex===n.injectorIndex||e[n.injectorIndex+8]===null?-1:n.injectorIndex}function Zv(n,e){if(n.parent&&n.parent.injectorIndex!==-1)return n.parent.injectorIndex;let t=0,i=null,r=e;for(;r!==null;){if(i=SE(r),i===null)return ua;if(t++,r=r[Jo],i.injectorIndex!==-1)return i.injectorIndex|t<<16}return ua}function mv(n,e,t){YN(n,e,t)}function vE(n,e,t){if(t&8||n!==void 0)return n;Qd(e,"NodeInjector")}function _E(n,e,t,i){if(t&8&&i===void 0&&(i=null),(t&3)===0){let r=n[Nn],o=In(void 0);try{return r?r.get(e,i,t&8):_y(e,i,t&8)}finally{In(o)}}return vE(i,e,t)}function xE(n,e,t,i=0,r){if(n!==null){if(e[ze]&2048&&!(i&2)){let s=QN(n,e,t,i,Qi);if(s!==Qi)return s}let o=bE(n,e,t,i,Qi);if(o!==Qi)return o}return _E(e,t,i,r)}function bE(n,e,t,i,r){let o=JN(t);if(typeof o=="function"){if(!qy(e,n,i))return i&1?vE(r,t,i):_E(e,t,i,r);try{let s;if(s=o(i),s==null&&!(i&8))Qd(t);else return s}finally{Xy()}}else if(typeof o=="number"){let s=null,a=yE(n,e),c=ua,l=i&1?e[Kn][fi]:null;for((a===-1||i&4)&&(c=a===-1?Zv(n,e):e[a+8],c===ua||!TM(i,!1)?a=-1:(s=e[Se],a=If(c),e=Rf(c,e)));a!==-1;){let u=e[Se];if(CM(o,a,u.data)){let d=ZN(a,e,t,s,i,l);if(d!==Qi)return d}c=e[a+8],c!==ua&&TM(i,e[Se].data[a+8]===l)&&CM(o,a,e)?(s=u,a=If(c),e=Rf(c,e)):a=-1}}return r}function ZN(n,e,t,i,r,o){let s=e[Se],a=s.data[n+8],c=i==null?wr(a)&&pv:i!=s&&(a.type&3)!==0,l=r&1&&o===a,u=wf(a,s,t,c,l);return u!==null?cl(e,s,u,a,r):Qi}function wf(n,e,t,i,r){let o=n.providerIndexes,s=e.data,a=o&1048575,c=n.directiveStart,l=n.directiveEnd,u=o>>20,d=i?a:a+u,f=r?a+u:l;for(let h=d;h<f;h++){let g=s[h];if(h<c&&t===g||h>=c&&g.type===t)return h}if(r){let h=s[c];if(h&&Ji(h)&&h.type===t)return c}return null}function cl(n,e,t,i,r){let o=n[t],s=e.data;if(o instanceof is){let a=o;if(a.resolving)throw vy("");let c=Nf(a.canSeeViewProviders);a.resolving=!0;let l=s[t].type||s[t],u,d=a.injectImpl?In(a.injectImpl):null,f=qy(n,i,0);try{o=n[t]=a.factory(void 0,r,s,n,i),e.firstCreatePass&&t>=i.directiveStart&&BN(t,s[t],e)}finally{d!==null&&In(d),Nf(c),a.resolving=!1,Xy()}}return o}function JN(n){if(typeof n=="string")return n.charCodeAt(0)||0;let e=n.hasOwnProperty(Yo)?n[Yo]:void 0;return typeof e=="number"?e>=0?e&mE:KN:e}function CM(n,e,t){let i=1<<n;return!!(t[e+(n>>gE)]&i)}function TM(n,e){return!(n&2)&&!(n&1&&e)}var ns=class{_tNode;_lView;constructor(e,t){this._tNode=e,this._lView=t}get(e,t,i){return xE(this._tNode,this._lView,e,Wo(i),t)}};function KN(){return new ns(rn(),Oe())}function xa(n){return yl(()=>{let e=n.prototype.constructor,t=e[Uc]||gv(e),i=Object.prototype,r=Object.getPrototypeOf(n.prototype).constructor;for(;r&&r!==i;){let o=r[Uc]||gv(r);if(o&&o!==t)return o;r=Object.getPrototypeOf(r)}return o=>new o})}function gv(n){return hy(n)?()=>{let e=gv(cn(n));return e&&e()}:Yr(n)}function QN(n,e,t,i,r){let o=n,s=e;for(;o!==null&&s!==null&&s[ze]&2048&&!ia(s);){let a=bE(o,s,t,i|2,Qi);if(a!==Qi)return a;let c=o.parent;if(!c){let l=s[Ay];if(l){let u=l.get(t,Qi,i&-5);if(u!==Qi)return u}c=SE(s),s=s[Jo]}o=c}return r}function SE(n){let e=n[Se],t=e.type;return t===2?e.declTNode:t===1?n[fi]:null}function eP(){return ba(rn(),Oe())}function ba(n,e){return new Fn(pi(n,e))}var Fn=(()=>{class n{nativeElement;constructor(t){this.nativeElement=t}static __NG_ELEMENT_ID__=eP}return n})();function ME(n){return n instanceof Fn?n.nativeElement:n}function tP(){return this._results[Symbol.iterator]()}var Ff=class{_emitDistinctChangesOnly;dirty=!0;_onDirty=void 0;_results=[];_changesDetected=!1;_changes=void 0;length=0;first=void 0;last=void 0;get changes(){return this._changes??=new Gt}constructor(e=!1){this._emitDistinctChangesOnly=e}get(e){return this._results[e]}map(e){return this._results.map(e)}filter(e){return this._results.filter(e)}find(e){return this._results.find(e)}reduce(e,t){return this._results.reduce(e,t)}forEach(e){this._results.forEach(e)}some(e){return this._results.some(e)}toArray(){return this._results.slice()}toString(){return this._results.toString()}reset(e,t){this.dirty=!1;let i=US(e);(this._changesDetected=!kS(this._results,i,t))&&(this._results=i,this.length=i.length,this.last=i[this.length-1],this.first=i[0])}notifyOnChanges(){this._changes!==void 0&&(this._changesDetected||!this._emitDistinctChangesOnly)&&this._changes.next(this)}onDirty(e){this._onDirty=e}setDirty(){this.dirty=!0,this._onDirty?.()}destroy(){this._changes!==void 0&&(this._changes.complete(),this._changes.unsubscribe())}[Symbol.iterator]=tP};function EE(n){return(n.flags&128)===128}var Jv=(function(n){return n[n.OnPush=0]="OnPush",n[n.Eager=1]="Eager",n[n.Default=1]="Default",n})(Jv||{}),wE=new Map,nP=0;function iP(){return nP++}function rP(n){wE.set(n[Mr],n)}function yv(n){wE.delete(n[Mr])}var DM="__ngContext__";function pa(n,e){Er(e)?(n[DM]=e[Mr],rP(e)):n[DM]=e}function CE(n){return DE(n[ta])}function TE(n){return DE(n[di])}function DE(n){for(;n!==null&&!Ti(n);)n=n[di];return n}var vv;function oP(n){vv=n}function AE(){if(vv!==void 0)return vv;if(typeof document<"u")return document;throw new Ne(210,!1)}var sP=new He("",{factory:()=>aP}),aP="ng";var IE=new He(""),cP=new He("",{providedIn:"platform",factory:()=>"unknown"});var RE=new He("",{factory:()=>be(ao).body?.querySelector("[ngCspNonce]")?.getAttribute("ngCspNonce")||null});var NE="r";var Kv="di",Qv="s";var PE=!1,FE=new He("",{factory:()=>PE});var OE=new He("");var AM=new WeakMap;function lP(n,e){if(n==null||typeof n!="object")return;let t=AM.get(n);t||(t=new WeakSet,AM.set(n,t)),t.add(e)}var uP=(n,e,t,i)=>{};function dP(n,e,t,i){uP(n,e,t,i)}var LE=new He("");function e_(n){return(n.flags&32)===32}var fP=()=>null;function kE(n,e,t=!1){return fP(n,e,t)}function t_(n){return n.get(OE,!1,{optional:!0})}function UE(n,e){let t=n.contentQueries;if(t!==null){let i=Ue(null);try{for(let r=0;r<t.length;r+=2){let o=t[r],s=t[r+1];if(s!==-1){let a=n.data[s];el(o),a.contentQueries(2,e[s],s)}}}finally{Ue(i)}}}function _v(n,e,t){el(0);let i=Ue(null);try{e(n,t)}finally{Ue(i)}}function n_(n,e,t){if(Iy(e)){let i=Ue(null);try{let r=e.directiveStart,o=e.directiveEnd;for(let s=r;s<o;s++){let a=n.data[s];if(a.contentQueries){let c=t[s];a.contentQueries(1,c,s)}}}finally{Ue(i)}}}var rs=(function(n){return n[n.Emulated=0]="Emulated",n[n.None=2]="None",n[n.ShadowDom=3]="ShadowDom",n[n.ExperimentalIsolatedShadowDom=4]="ExperimentalIsolatedShadowDom",n})(rs||{});var hP="svg",pP="math",mP={"http://www.w3.org/2000/svg":hP,"http://www.w3.org/1998/Math/MathML":pP},vf;function gP(){if(vf===void 0&&(vf=null,Xi.trustedTypes))try{vf=Xi.trustedTypes.createPolicy("angular",{createHTML:n=>n,createScript:n=>n,createScriptURL:n=>n})}catch(n){}return vf}function jf(n){return gP()?.createHTML(n)||n}var _f;function yP(){if(_f===void 0&&(_f=null,Xi.trustedTypes))try{_f=Xi.trustedTypes.createPolicy("angular#unsafe-bypass",{createHTML:n=>n,createScript:n=>n,createScriptURL:n=>n})}catch(n){}return _f}function IM(n){return yP()?.createHTML(n)||n}var Of=class{changingThisBreaksApplicationSecurity;constructor(e){this.changingThisBreaksApplicationSecurity=e}toString(){return`SafeValue must use [property]=binding: ${this.changingThisBreaksApplicationSecurity} (see ${qd})`}};function Wf(n){return n instanceof Of?n.changingThisBreaksApplicationSecurity:n}function BE(n,e){let t=VE(n);if(t!=null&&t!==e){if(t==="ResourceURL"&&e==="URL")return!0;throw new Error(`Required a safe ${e}, got a ${t} (see ${qd})`)}return t===e}function VE(n){return n instanceof Of&&n.getTypeName()||null}function vP(n){let e=new bv(n);return _P()?new xv(e):e}var xv=class{inertDocumentHelper;constructor(e){this.inertDocumentHelper=e}getInertBodyElement(e){e="<body><remove></remove>"+e;try{let t=new window.DOMParser().parseFromString(jf(e),"text/html").body;return t===null?this.inertDocumentHelper.getInertBodyElement(e):(t.firstChild?.remove(),t)}catch(t){return null}}},bv=class{defaultDoc;inertDocument;constructor(e){this.defaultDoc=e,this.inertDocument=this.defaultDoc.implementation.createHTMLDocument("sanitization-inert")}getInertBodyElement(e){let t=this.inertDocument.createElement("template");return t.innerHTML=jf(e),t}};function _P(){try{return!!new window.DOMParser().parseFromString(jf(""),"text/html")}catch(n){return!1}}var xP=/^(?!javascript:)(?:[a-z0-9+.-]+:|[^&:\/?#]*(?:[\/?#]|$))/i;function HE(n){return n=String(n),n.match(xP)?n:"unsafe:"+n}function Tr(n){let e={};for(let t of n.split(","))e[t]=!0;return e}function _l(...n){let e={};for(let t of n)for(let i in t)t.hasOwnProperty(i)&&(e[i]=!0);return e}var zE=Tr("area,br,col,hr,img,wbr"),GE=Tr("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),jE=Tr("rp,rt"),bP=_l(jE,GE),SP=_l(GE,Tr("address,article,aside,blockquote,caption,center,del,details,dialog,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,main,map,menu,nav,ol,pre,section,summary,table,ul")),MP=_l(jE,Tr("a,abbr,acronym,audio,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,picture,q,ruby,rp,rt,s,samp,small,source,span,strike,strong,sub,sup,time,track,tt,u,var,video")),RM=_l(zE,SP,MP,bP),WE=Tr("background,cite,href,itemtype,longdesc,poster,src,xlink:href"),EP=Tr("abbr,accesskey,align,alt,autoplay,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,controls,coords,datetime,default,dir,download,face,headers,height,hidden,hreflang,hspace,ismap,itemscope,itemprop,kind,label,lang,language,loop,media,muted,nohref,nowrap,open,preload,rel,rev,role,rows,rowspan,rules,scope,scrolling,shape,size,sizes,span,srclang,srcset,start,summary,tabindex,target,title,translate,type,usemap,valign,value,vspace,width"),wP=Tr("aria-activedescendant,aria-atomic,aria-autocomplete,aria-busy,aria-checked,aria-colcount,aria-colindex,aria-colspan,aria-controls,aria-current,aria-describedby,aria-details,aria-disabled,aria-dropeffect,aria-errormessage,aria-expanded,aria-flowto,aria-grabbed,aria-haspopup,aria-hidden,aria-invalid,aria-keyshortcuts,aria-label,aria-labelledby,aria-level,aria-live,aria-modal,aria-multiline,aria-multiselectable,aria-orientation,aria-owns,aria-placeholder,aria-posinset,aria-pressed,aria-readonly,aria-relevant,aria-required,aria-roledescription,aria-rowcount,aria-rowindex,aria-rowspan,aria-selected,aria-setsize,aria-sort,aria-valuemax,aria-valuemin,aria-valuenow,aria-valuetext"),CP=_l(WE,EP,wP),TP=Tr("script,style,template"),Sv=class{sanitizedSomething=!1;buf=[];sanitizeChildren(e){let t=e.firstChild,i=!0,r=[];for(;t;){if(t.nodeType===Node.ELEMENT_NODE?i=this.startElement(t):t.nodeType===Node.TEXT_NODE?this.chars(t.nodeValue):this.sanitizedSomething=!0,i&&t.firstChild){r.push(t),t=IP(t);continue}for(;t;){t.nodeType===Node.ELEMENT_NODE&&this.endElement(t);let o=AP(t);if(o){t=o;break}t=r.pop()}}return this.buf.join("")}startElement(e){let t=NM(e).toLowerCase();if(!RM.hasOwnProperty(t))return this.sanitizedSomething=!0,!TP.hasOwnProperty(t);this.buf.push("<"),this.buf.push(t);let i=e.attributes;for(let r=0;r<i.length;r++){let o=i.item(r),s=o.name,a=s.toLowerCase();if(!CP.hasOwnProperty(a)){this.sanitizedSomething=!0;continue}let c=o.value;WE[a]&&(c=HE(c)),this.buf.push(" ",s,'="',PM(c),'"')}return this.buf.push(">"),!0}endElement(e){let t=NM(e).toLowerCase();RM.hasOwnProperty(t)&&!zE.hasOwnProperty(t)&&(this.buf.push("</"),this.buf.push(t),this.buf.push(">"))}chars(e){this.buf.push(PM(e))}};function DP(n,e){return(n.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_CONTAINED_BY)!==Node.DOCUMENT_POSITION_CONTAINED_BY}function AP(n){let e=n.nextSibling;if(e&&n!==e.previousSibling)throw $E(e);return e}function IP(n){let e=n.firstChild;if(e&&DP(n,e))throw $E(e);return e}function NM(n){let e=n.nodeName;return typeof e=="string"?e:"FORM"}function $E(n){return new Error(`Failed to sanitize html because the element is clobbered: ${n.outerHTML}`)}var RP=/[\uD800-\uDBFF][\uDC00-\uDFFF]/g,NP=/([^\#-~ |!])/g;function PM(n){return n.replace(/&/g,"&amp;").replace(RP,function(e){let t=e.charCodeAt(0),i=e.charCodeAt(1);return"&#"+((t-55296)*1024+(i-56320)+65536)+";"}).replace(NP,function(e){return"&#"+e.charCodeAt(0)+";"}).replace(/</g,"&lt;").replace(/>/g,"&gt;")}var xf;function qE(n,e){let t=null;try{xf=xf||vP(n);let i=e?String(e):"";t=xf.getInertBodyElement(i);let r=5,o=i;do{if(r===0)throw new Error("Failed to sanitize html because the input is unstable");r--,i=o,o=t.innerHTML,t=xf.getInertBodyElement(i)}while(i!==o);let a=new Sv().sanitizeChildren(FM(t)||t);return jf(a)}finally{if(t){let i=FM(t)||t;for(;i.firstChild;)i.firstChild.remove()}}}function FM(n){return"content"in n&&PP(n)?n.content:null}function PP(n){return n.nodeType===Node.ELEMENT_NODE&&n.nodeName==="TEMPLATE"}var FP=/^>|^->|<!--|-->|--!>|<!-$/g,OP=/(<|>)/g,LP="\u200B$1\u200B";function kP(n){return n.replace(FP,e=>e.replace(OP,LP))}function UP(n,e){return n.createText(e)}function BP(n,e,t){n.setValue(e,t)}function VP(n,e){return n.createComment(kP(e))}function XE(n,e,t){return n.createElement(e,t)}function Lf(n,e,t,i,r){n.insertBefore(e,t,i,r)}function YE(n,e,t){n.appendChild(e,t)}function OM(n,e,t,i,r){i!==null?Lf(n,e,t,i,r):YE(n,e,t)}function ZE(n,e,t,i){n.removeChild(null,e,t,i)}function HP(n,e,t){n.setAttribute(e,"style",t)}function zP(n,e,t){t===""?n.removeAttribute(e,"class"):n.setAttribute(e,"class",t)}function JE(n,e,t){let{mergedAttrs:i,classes:r,styles:o}=t;i!==null&&GN(n,e,i),r!==null&&zP(n,e,r),o!==null&&HP(n,e,o)}function GP(n,e=!0){if(n[0]!=":")return[null,n];let t=n.indexOf(":",1);if(t===-1){if(e)throw new Error(`Unsupported format "${n}" expecting ":namespace:name"`);return[null,n]}return[n.slice(1,t),n.slice(t+1)]}function jP(n,e,t){if(e!==void 0&&t!==void 0&&$P(e,t)!==Wn.HTML)return n;let i=WP();return i?IM(i.sanitize(Wn.HTML,n)||""):BE(n,"HTML")?IM(Wf(n)):qE(AE(),Zs(n))}function WP(){let n=Oe();return n&&n[Ci].sanitizer}function $P(n,e){let[t,i]=qP(n);return $S(i,e,t)}function qP(n){n=n.toLowerCase();let e=GP(n,!1);if(e[0])return e;let i=Di()===-1?null:aa(),r=i?.namespace;if(n==="#host"&&i?.type===2){let o=pi(i,Oe());if(o.tagName&&(n=o.tagName.toLowerCase()),r==null){let s=o.namespaceURI;r=s&&mP[s]}}return[r,n]}function i_(n){return n.ownerDocument}function XP(n,e,t){let i=n.length;for(;;){let r=n.indexOf(e,t);if(r===-1)return r;if(r===0||n.charCodeAt(r-1)<=32){let o=e.length;if(r+o===i||n.charCodeAt(r+o)<=32)return r}t=r+1}}var KE="ng-template";function YP(n,e,t,i){let r=0;if(i){for(;r<e.length&&typeof e[r]=="string";r+=2)if(e[r]==="class"&&XP(e[r+1].toLowerCase(),t,0)!==-1)return!0}else if(r_(n))return!1;if(r=e.indexOf(1,r),r>-1){let o;for(;++r<e.length&&typeof(o=e[r])=="string";)if(o.toLowerCase()===t)return!0}return!1}function r_(n){return n.type===4&&n.value!==KE}function ZP(n,e,t){let i=n.type===4&&!t?KE:n.value;return e===i}function JP(n,e,t){let i=4,r=n.attrs,o=r!==null?eF(r):0,s=!1;for(let a=0;a<e.length;a++){let c=e[a];if(typeof c=="number"){if(!s&&!Ai(i)&&!Ai(c))return!1;if(s&&Ai(c))continue;s=!1,i=c|i&1;continue}if(!s)if(i&4){if(i=2|i&1,c!==""&&!ZP(n,c,t)||c===""&&e.length===1){if(Ai(i))return!1;s=!0}}else if(i&8){if(r===null||!YP(n,r,c,t)){if(Ai(i))return!1;s=!0}}else{let l=e[++a],u=KP(c,r,r_(n),t);if(u===-1){if(Ai(i))return!1;s=!0;continue}if(l!==""){let d;if(u>o?d="":d=r[u+1].toLowerCase(),i&2&&l!==d){if(Ai(i))return!1;s=!0}}}}return Ai(i)||s}function Ai(n){return(n&1)===0}function KP(n,e,t,i){if(e===null)return-1;let r=0;if(i||!t){let o=!1;for(;r<e.length;){let s=e[r];if(s===n)return r;if(s===3||s===6)o=!0;else if(s===1||s===2){let a=e[++r];for(;typeof a=="string";)a=e[++r];continue}else{if(s===4)break;if(s===0){r+=4;continue}}r+=o?1:2}return-1}else return tF(e,n)}function QP(n,e,t=!1){for(let i=0;i<e.length;i++)if(JP(n,e[i],t))return!0;return!1}function eF(n){for(let e=0;e<n.length;e++){let t=n[e];if(jN(t))return e}return n.length}function tF(n,e){let t=n.indexOf(4);if(t>-1)for(t++;t<n.length;){let i=n[t];if(typeof i=="number")return-1;if(i===e)return t;t++}return-1}function LM(n,e){return n?":not("+e.trim()+")":e}function nF(n){let e=n[0],t=1,i=2,r="",o=!1;for(;t<n.length;){let s=n[t];if(typeof s=="string")if(i&2){let a=n[++t];r+="["+s+(a.length>0?'="'+a+'"':"")+"]"}else i&8?r+="."+s:i&4&&(r+=" "+s);else r!==""&&!Ai(s)&&(e+=LM(o,r),r=""),i=s,o=o||!Ai(i);t++}return r!==""&&(e+=LM(o,r)),e}function iF(n){return n.map(nF).join(",")}function rF(n){let e=[],t=[],i=1,r=2;for(;i<n.length;){let o=n[i];if(typeof o=="string")r===2?o!==""&&e.push(o,n[++i]):r===8&&t.push(o);else{if(!Ai(r))break;r=o}i++}return t.length&&e.push(1,...t),e}var qn={};function o_(n,e,t,i,r,o,s,a,c,l,u){let d=Dt+i,f=d+r,h=oF(d,f),g=typeof l=="function"?l():l;return h[Se]={type:n,blueprint:h,template:t,queries:null,viewQuery:a,declTNode:e,data:h.slice().fill(null,d),bindingStartIndex:d,expandoStartIndex:f,hostBindingOpCodes:null,firstCreatePass:!0,firstUpdatePass:!0,staticViewQueries:!1,staticContentQueries:!1,preOrderHooks:null,preOrderCheckHooks:null,contentHooks:null,contentCheckHooks:null,viewHooks:null,viewCheckHooks:null,destroyHooks:null,cleanup:null,contentQueries:null,components:null,directiveRegistry:typeof o=="function"?o():o,pipeRegistry:typeof s=="function"?s():s,firstChild:null,schemas:c,consts:g,incompleteFirstPass:!1,ssrId:u}}function oF(n,e){let t=[];for(let i=0;i<e;i++)t.push(i<n?null:qn);return t}function sF(n){let e=n.tView;return e===null||e.incompleteFirstPass?n.tView=o_(1,null,n.template,n.decls,n.vars,n.directiveDefs,n.pipeDefs,n.viewQuery,n.schemas,n.consts,n.id):e}function s_(n,e,t,i,r,o,s,a,c,l,u){let d=e.blueprint.slice();return d[wi]=r,d[ze]=i|4|128|8|64|1024,(l!==null||n&&n[ze]&2048)&&(d[ze]|=2048),Oy(d),d[Yt]=d[Jo]=n,d[Wt]=t,d[Ci]=s||n&&n[Ci],d[Et]=a||n&&n[Et],d[Nn]=c||n&&n[Nn]||null,d[fi]=o,d[Mr]=iP(),d[Qs]=u,d[Ay]=l,d[Kn]=e.type==2?n[Kn]:d,d}function aF(n,e,t){let i=pi(e,n),r=sF(t),o=n[Ci].rendererFactory,s=a_(n,s_(n,r,null,QE(t),i,e,null,o.createRenderer(i,t),null,null,null));return n[e.index]=s}function QE(n){let e=16;return n.signals?e=4096:n.onPush&&(e=64),e}function ew(n,e,t,i){if(t===0)return-1;let r=e.length;for(let o=0;o<t;o++)e.push(i),n.blueprint.push(i),n.data.push(null);return r}function a_(n,e){return n[ta]?n[Dy][di]=e:n[ta]=e,n[Dy]=e,e}function Xn(n=1){tw(At(),Oe(),Di()+n,!1)}function tw(n,e,t,i){if(!i)if((e[ze]&3)===3){let o=n.preOrderCheckHooks;o!==null&&Mf(e,o,t)}else{let o=n.preOrderHooks;o!==null&&Ef(e,o,0,t)}so(t)}var $f=(function(n){return n[n.None=0]="None",n[n.SignalBased=1]="SignalBased",n[n.HasDecoratorInputTransform=2]="HasDecoratorInputTransform",n})($f||{});function Mv(n,e,t,i){let r=Ue(null);try{let[o,s,a]=n.inputs[t],c=null;(s&$f.SignalBased)!==0&&(c=e[o][_n]),c!==null&&c.transformFn!==void 0?i=c.transformFn(i):a!==null&&(i=a.call(e,i)),n.setInput!==null?n.setInput(e,c,i,t,o):cE(e,c,o,i)}finally{Ue(r)}}var ma=(function(n){return n[n.Important=1]="Important",n[n.DashCase=2]="DashCase",n})(ma||{}),cF;function c_(n,e){return cF(n,e)}var dq=typeof document<"u"&&typeof document?.documentElement?.getAnimations=="function";var Ev=new WeakMap,rl=new WeakSet;function lF(n,e){let t=Ev.get(n);if(!t||t.length===0)return;let i=e.parentNode,r=e.previousSibling;for(let o=t.length-1;o>=0;o--){let s=t[o],a=s.parentNode;s===e?(t.splice(o,1),rl.add(s),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}}))):(r&&s===r||a&&i&&a!==i)&&(t.splice(o,1),s.dispatchEvent(new CustomEvent("animationend",{detail:{cancel:!0}})),s.parentNode?.removeChild(s))}}function uF(n,e){let t=Ev.get(n);t?t.includes(e)||t.push(e):Ev.set(n,[e])}var ll=new Set,qf=(function(n){return n[n.CHANGE_DETECTION=0]="CHANGE_DETECTION",n[n.AFTER_NEXT_RENDER=1]="AFTER_NEXT_RENDER",n})(qf||{}),fo=new He(""),kM=new Set;function Dr(n){kM.has(n)||(kM.add(n),performance?.mark?.("mark_feature_usage",{detail:{feature:n}}))}var l_=(()=>{class n{impl=null;execute(){this.impl?.execute()}static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new n})}return n})(),nw=[0,1,2,3],iw=(()=>{class n{ngZone=be(jt);scheduler=be(Sr);errorHandler=be(Xo,{optional:!0});sequences=new Set;deferredRegistrations=new Set;executing=!1;constructor(){be(fo,{optional:!0})}execute(){let t=this.sequences.size>0;t&&ut(ot.AfterRenderHooksStart),this.executing=!0;for(let i of nw)for(let r of this.sequences)if(!(r.erroredOrDestroyed||!r.hooks[i]))try{r.pipelinedValue=this.ngZone.runOutsideAngular(()=>this.maybeTrace(()=>{let o=r.hooks[i];return o(r.pipelinedValue)},r.snapshot))}catch(o){r.erroredOrDestroyed=!0,this.errorHandler?.handleError(o)}this.executing=!1;for(let i of this.sequences)i.afterRun(),i.once&&(this.sequences.delete(i),i.destroy());for(let i of this.deferredRegistrations)this.sequences.add(i);this.deferredRegistrations.size>0&&this.scheduler.notify(7),this.deferredRegistrations.clear(),t&&ut(ot.AfterRenderHooksEnd)}register(t){let{view:i}=t;i!==void 0?((i[Qo]??=[]).push(t),oa(i),i[ze]|=8192):this.executing?this.deferredRegistrations.add(t):this.addSequence(t)}addSequence(t){this.sequences.add(t),this.scheduler.notify(7)}unregister(t){this.executing&&this.sequences.has(t)?(t.erroredOrDestroyed=!0,t.pipelinedValue=void 0,t.once=!0):(this.sequences.delete(t),this.deferredRegistrations.delete(t))}maybeTrace(t,i){return i?i.run(qf.AFTER_NEXT_RENDER,t):t()}static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new n})}return n})(),kf=class{impl;hooks;view;once;snapshot;erroredOrDestroyed=!1;pipelinedValue=void 0;unregisterOnDestroy;constructor(e,t,i,r,o,s=null){this.impl=e,this.hooks=t,this.view=i,this.once=r,this.snapshot=s,this.unregisterOnDestroy=o?.onDestroy(()=>this.destroy())}afterRun(){this.erroredOrDestroyed=!1,this.pipelinedValue=void 0,this.snapshot?.dispose(),this.snapshot=null}destroy(){this.impl.unregister(this),this.unregisterOnDestroy?.();let e=this.view?.[Qo];e&&(this.view[Qo]=e.filter(t=>t!==this))}};function u_(n,e){let t=e?.injector??be(Ei);return Dr("NgAfterNextRender"),fF(n,t,e,!0)}function dF(n){return n instanceof Function?[void 0,void 0,n,void 0]:[n.earlyRead,n.write,n.mixedReadWrite,n.read]}function fF(n,e,t,i){let r=e.get(l_);r.impl??=e.get(iw);let o=e.get(fo,null,{optional:!0}),s=t?.manualCleanup!==!0?e.get(co):null,a=e.get(gf,null,{optional:!0}),c=new kf(r.impl,dF(n),a?.view,i,s,o?.snapshot(null));return r.impl.register(c),c}var rw=new He("",{factory:()=>({queue:new Set,isScheduled:!1,scheduler:null,injector:be(bn)})});function ow(n,e,t){let i=n.get(rw);if(Array.isArray(e))for(let r of e)i.queue.add(r),t?.detachedLeaveAnimationFns?.push(r);else i.queue.add(e),t?.detachedLeaveAnimationFns?.push(e);i.scheduler&&i.scheduler(n)}function hF(n,e){let t=n.get(rw);if(e.detachedLeaveAnimationFns){for(let i of e.detachedLeaveAnimationFns)t.queue.delete(i);e.detachedLeaveAnimationFns=void 0}}function pF(n,e){for(let[t,i]of e)ow(n,i.animateFns)}function UM(n,e,t,i){let r=n?.[to]?.enter;e!==null&&r&&r.has(t.index)&&pF(i,r)}function la(n,e,t,i,r,o,s,a){if(r!=null){let c,l=!1;Ti(r)?c=r:Er(r)&&(l=!0,r=r[wi]);let u=hi(r);n===0&&i!==null?(UM(a,i,o,t),s==null?YE(e,i,u):Lf(e,i,u,s||null,!0)):n===1&&i!==null?(UM(a,i,o,t),Lf(e,i,u,s||null,!0),lF(o,u)):n===2?(a?.[to]?.leave?.has(o.index)&&uF(o,u),rl.delete(u),BM(a,o,t,d=>{if(rl.has(u)){rl.delete(u);return}ZE(e,u,l,d)})):n===3&&(rl.delete(u),BM(a,o,t,()=>{e.destroyNode(u)})),c!=null&&TF(e,n,t,c,o,i,s)}}function mF(n,e){sw(n,e),e[wi]=null,e[fi]=null}function gF(n,e,t,i,r,o){i[wi]=r,i[fi]=e,Yf(n,i,t,1,r,o)}function sw(n,e){e[Ci].changeDetectionScheduler?.notify(9),Yf(n,e,e[Et],2,null,null)}function yF(n){let e=n[ta];if(!e)return iv(n[Se],n);for(;e;){let t=null;if(Er(e))t=e[ta];else{let i=e[kt];i&&(t=i)}if(!t){for(;e&&!e[di]&&e!==n;)Er(e)&&iv(e[Se],e),e=e[Yt];e===null&&(e=n),Er(e)&&iv(e[Se],e),t=e&&e[di]}e=t}}function d_(n,e){let t=n[es],i=t.indexOf(e);t.splice(i,1)}function Xf(n,e){if(ro(e))return;let t=e[Et];t.destroyNode&&Yf(n,e,t,3,null,null),yF(e)}function iv(n,e){if(ro(e))return;let t=Ue(null);try{e[ze]&=-129,e[ze]|=256,e[Qn]&&kd(e[Qn]),xF(n,e),_F(n,e),e[Se].type===1&&e[Et].destroy();let i=e[eo];if(i!==null&&Ti(e[Yt])){i!==e[Yt]&&d_(i,e);let r=e[Zi];r!==null&&r.detachView(n)}yv(e)}finally{Ue(t)}}function BM(n,e,t,i){let r=n?.[to];if(r==null||r.leave==null||!r.leave.has(e.index))return i(!1);n&&ll.add(n[Mr]),ow(t,()=>{if(r.leave&&r.leave.has(e.index)){let s=r.leave.get(e.index),a=[];if(s){for(let c=0;c<s.animateFns.length;c++){let l=s.animateFns[c],{promise:u}=l();a.push(u)}r.detachedLeaveAnimationFns=void 0}r.running=Promise.allSettled(a),vF(n,i)}else n&&ll.delete(n[Mr]),i(!1)},r)}function vF(n,e){let t=n[to]?.running;if(t){t.then(()=>{n[to].running=void 0,ll.delete(n[Mr]),e(!0)});return}e(!1)}function _F(n,e){let t=n.cleanup,i=e[ea];if(t!==null)for(let s=0;s<t.length-1;s+=2)if(typeof t[s]=="string"){let a=t[s+3];a>=0?i[a]():i[-a].unsubscribe(),s+=2}else{let a=i[t[s+1]];t[s].call(a)}i!==null&&(e[ea]=null);let r=e[br];if(r!==null){e[br]=null;for(let s=0;s<r.length;s++){let a=r[s];a()}}let o=e[Yc];if(o!==null){e[Yc]=null;for(let s of o)s.destroy()}}function xF(n,e){let t;if(n!=null&&(t=n.destroyHooks)!=null)for(let i=0;i<t.length;i+=2){let r=e[t[i]];if(!(r instanceof is)){let o=t[i+1];if(Array.isArray(o))for(let s=0;s<o.length;s+=2){let a=r[o[s]],c=o[s+1];ut(ot.LifecycleHookStart,a,c);try{c.call(a)}finally{ut(ot.LifecycleHookEnd,a,c)}}else{ut(ot.LifecycleHookStart,r,o);try{o.call(r)}finally{ut(ot.LifecycleHookEnd,r,o)}}}}}function bF(n,e,t){return SF(n,e.parent,t)}function SF(n,e,t){let i=e;for(;i!==null&&i.type&168;)e=i,i=e.parent;if(i===null)return t[wi];if(wr(i)){let{encapsulation:r}=n.data[i.directiveStart+i.componentOffset];if(r===rs.None||r===rs.Emulated)return null}return pi(i,t)}function MF(n,e,t){return wF(n,e,t)}function EF(n,e,t){return n.type&40?pi(n,t):null}var wF=EF,VM;function f_(n,e,t,i){let r=bF(n,i,e),o=e[Et],s=i.parent||e[fi],a=MF(s,i,e);if(r!=null)if(Array.isArray(t))for(let c=0;c<t.length;c++)OM(o,r,t[c],a,!1);else OM(o,r,t,a,!1);VM!==void 0&&VM(o,i,e,t,r)}function ol(n,e){if(e!==null){let t=e.type;if(t&3)return pi(e,n);if(t&4)return wv(-1,n[e.index]);if(t&8){let i=e.child;if(i!==null)return ol(n,i);{let r=n[e.index];return Ti(r)?wv(-1,r):hi(r)}}else{if(t&128)return ol(n,e.next);if(t&32)return c_(e,n)()||hi(n[e.index]);{let i=aw(n,e);if(i!==null){if(Array.isArray(i))return i[0];let r=Zr(n[Kn]);return ol(r,i)}else return ol(n,e.next)}}}return null}function aw(n,e){if(e!==null){let i=n[Kn][fi],r=e.projection;return i.projection[r]}return null}function wv(n,e){let t=kt+n+1;if(t<e.length){let i=e[t],r=i[Se].firstChild;if(r!==null)return ol(i,r)}return e[io]}function h_(n,e,t,i,r,o,s){for(;t!=null;){let a=i[Nn];if(t.type===128){t=t.next;continue}let c=i[t.index],l=t.type;if(s&&e===0&&(c&&pa(hi(c),i),t.flags|=2),!e_(t))if(l&8)h_(n,e,t.child,i,r,o,!1),la(e,n,a,r,c,t,o,i);else if(l&32){let u=c_(t,i),d;for(;d=u();)la(e,n,a,r,d,t,o,i);la(e,n,a,r,c,t,o,i)}else l&16?CF(n,e,i,t,r,o):la(e,n,a,r,c,t,o,i);t=s?t.projectionNext:t.next}}function Yf(n,e,t,i,r,o){h_(t,i,n.firstChild,e,r,o,!1)}function CF(n,e,t,i,r,o){let s=t[Kn],c=s[fi].projection[i.projection];if(Array.isArray(c))for(let l=0;l<c.length;l++){let u=c[l];la(e,n,t[Nn],r,u,i,o,t)}else{let l=c,u=s[Yt];EE(i)&&(l.flags|=128),h_(n,e,l,u,r,o,!0)}}function TF(n,e,t,i,r,o,s){let a=i[io],c=hi(i);a!==c&&la(e,n,t,o,a,r,s);for(let l=kt;l<i.length;l++){let u=i[l];Yf(u[Se],u,n,e,o,a)}}function DF(n,e,t,i,r){if(e)r?n.addClass(t,i):n.removeClass(t,i);else{let o=i.indexOf("-")===-1?void 0:ma.DashCase;r==null?n.removeStyle(t,i,o):(typeof r=="string"&&r.endsWith("!important")&&(r=r.slice(0,-10),o|=ma.Important),n.setStyle(t,i,r,o))}}function cw(n,e,t,i,r){let o=Di(),s=i&2;try{so(-1),s&&e.length>Dt&&tw(n,e,Dt,!1);let a=s?ot.TemplateUpdateStart:ot.TemplateCreateStart;ut(a,r,t),t(i,r)}finally{so(o);let a=s?ot.TemplateUpdateEnd:ot.TemplateCreateEnd;ut(a,r,t)}}function Zf(n,e,t){FF(n,e,t),(t.flags&64)===64&&OF(n,e,t)}function xl(n,e,t=pi){let i=e.localNames;if(i!==null){let r=e.index+1;for(let o=0;o<i.length;o+=2){let s=i[o+1],a=s===-1?t(e,n):n[s];n[r++]=a}}}function AF(n,e,t,i){let o=i.get(FE,PE)||t===rs.ShadowDom||t===rs.ExperimentalIsolatedShadowDom,s=n.selectRootElement(e,o);return IF(s),s}function IF(n){RF(n)}var RF=()=>null;function NF(n){return n==="class"?"className":n==="for"?"htmlFor":n==="formaction"?"formAction":n==="innerHtml"?"innerHTML":n==="readonly"?"readOnly":n==="tabindex"?"tabIndex":n}function lw(n,e,t,i,r,o){let s=e[Se];if(v_(n,s,e,t,i)){wr(n)&&PF(e,n.index);return}n.type&3&&(t=NF(t)),uw(n,e,t,i,r,o)}function uw(n,e,t,i,r,o){if(n.type&3){let s=pi(n,e);i=o!=null?o(i,n.value||"",t):i,r.setProperty(s,t,i)}else n.type&12}function PF(n,e){let t=mi(e,n);t[ze]&16||(t[ze]|=64)}function FF(n,e,t){let i=t.directiveStart,r=t.directiveEnd;wr(t)&&aF(e,t,n.data[i+t.componentOffset]),n.firstCreatePass||Pf(t,e);let o=t.initialInputs;for(let s=i;s<r;s++){let a=n.data[s],c=cl(e,n,s,t);if(pa(c,e),o!==null&&BF(e,s-i,c,a,t,o),Ji(a)){let l=mi(t.index,e);l[Wt]=cl(e,n,s,t)}}}function OF(n,e,t){let i=t.directiveStart,r=t.directiveEnd,o=t.index,s=cM();try{so(o);for(let a=i;a<r;a++){let c=n.data[a],l=e[a];df(a),(c.hostBindings!==null||c.hostVars!==0||c.hostAttrs!==null)&&LF(c,l)}}finally{so(-1),df(s)}}function LF(n,e){n.hostBindings!==null&&n.hostBindings(1,e)}function p_(n,e){let t=n.directiveRegistry,i=null;if(t)for(let r=0;r<t.length;r++){let o=t[r];QP(e,o.selectors,!1)&&(i??=[],Ji(o)?i.unshift(o):i.push(o))}return i}function kF(n,e,t,i,r,o){let s=pi(n,e);UF(e[Et],s,o,n.value,t,i,r)}function UF(n,e,t,i,r,o,s){if(o==null)n.removeAttribute(e,r,t);else{let a=s==null?Zs(o):s(o,i||"",r);n.setAttribute(e,r,a,t)}}function BF(n,e,t,i,r,o){let s=o[e];if(s!==null)for(let a=0;a<s.length;a+=2){let c=s[a],l=s[a+1];Mv(i,t,c,l)}}function m_(n,e,t,i,r){let o=Dt+t,s=e[Se],a=r(s,e,n,i,t);e[o]=a,sa(n,!0);let c=n.type===2;return c?(JE(e[Et],a,n),(JS()===0||na(n))&&pa(a,e),KS()):pa(a,e),mf()&&(!c||!e_(n))&&f_(s,e,a,n),n}function g_(n){let e=n;return jy()?tM():(e=e.parent,sa(e,!1)),e}function y_(n,e){let t=n[Nn];if(!t)return;let i;try{i=t.get(Ki,null)}catch(r){i=null}i?.(e)}function v_(n,e,t,i,r){let o=n.inputs?.[i],s=n.hostDirectiveInputs?.[i],a=!1;if(s)for(let c=0;c<s.length;c+=2){let l=s[c],u=s[c+1],d=e.data[l];Mv(d,t[l],u,r),a=!0}if(o)for(let c of o){let l=t[c],u=e.data[c];Mv(u,l,i,r),a=!0}return a}function VF(n,e){let t=mi(e,n),i=t[Se];HF(i,t);let r=t[wi];r!==null&&t[Qs]===null&&(t[Qs]=kE(r,t[Nn])),ut(ot.ComponentStart);try{__(i,t,t[Wt])}finally{ut(ot.ComponentEnd,t[Wt])}}function HF(n,e){for(let t=e.length;t<n.blueprint.length;t++)e.push(n.blueprint[t])}function __(n,e,t){hf(e);try{let i=n.viewQuery;i!==null&&_v(1,i,t);let r=n.template;r!==null&&cw(n,e,r,1,t),n.firstCreatePass&&(n.firstCreatePass=!1),e[Zi]?.finishViewCreation(n),n.staticContentQueries&&UE(n,e),n.staticViewQueries&&_v(2,n.viewQuery,t);let o=n.components;o!==null&&zF(e,o)}catch(i){throw n.firstCreatePass&&(n.incompleteFirstPass=!0,n.firstCreatePass=!1),i}finally{e[ze]&=-5,pf()}}function zF(n,e){for(let t=0;t<e.length;t++)VF(n,e[t])}function bl(n,e,t,i){let r=Ue(null);try{let o=e.tView,a=n[ze]&4096?4096:16,c=s_(n,o,t,a,null,e,null,null,i?.injector??null,i?.embeddedViewInjector??null,i?.dehydratedView??null),l=n[e.index];c[eo]=l;let u=n[Zi];return u!==null&&(c[Zi]=u.createEmbeddedView(o)),__(o,c,t),c}finally{Ue(r)}}function ga(n,e){return!e||e.firstChild===null||EE(n)}function ul(n,e,t,i,r=!1){for(;t!==null;){if(t.type===128){t=r?t.projectionNext:t.next;continue}let o=e[t.index];o!==null&&i.push(hi(o)),Ti(o)&&dw(o,i);let s=t.type;if(s&8)ul(n,e,t.child,i);else if(s&32){let a=c_(t,e),c;for(;c=a();)i.push(c)}else if(s&16){let a=aw(e,t);if(Array.isArray(a))i.push(...a);else{let c=Zr(e[Kn]);ul(c[Se],c,a,i,!0)}}t=r?t.projectionNext:t.next}return i}function dw(n,e){for(let t=kt;t<n.length;t++){let i=n[t],r=i[Se].firstChild;r!==null&&ul(i[Se],i,r,e)}n[io]!==n[wi]&&e.push(n[io])}function fw(n){if(n[Qo]!==null){for(let e of n[Qo])e.impl.addSequence(e);n[Qo].length=0}}var hw=[];function GF(n){return n[Qn]??jF(n)}function jF(n){let e=hw.pop()??Object.create($F);return e.lView=n,e}function WF(n){n.lView[Qn]!==n&&(n.lView=null,hw.push(n))}var $F=at(Re({},$s),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:n=>{oa(n.lView)},consumerOnSignalRead(){this.lView[Qn]=this}});function qF(n){let e=n[Qn]??Object.create(XF);return e.lView=n,e}var XF=at(Re({},$s),{consumerIsAlwaysLive:!0,kind:"template",consumerMarkedDirty:n=>{let e=Zr(n.lView);for(;e&&!pw(e[Se]);)e=Zr(e);e&&Ly(e)},consumerOnSignalRead(){this.lView[Qn]=this}});function pw(n){return n.type!==2}function mw(n){if(n[Yc]===null)return;let e=!0;for(;e;){let t=!1;for(let i of n[Yc])i.dirty&&(t=!0,i.zone===null||Zone.current===i.zone?i.run():i.zone.run(()=>i.run()));e=t&&!!(n[ze]&8192)}}var YF=100;function gw(n,e=0){let i=n[Ci].rendererFactory,r=!1;r||i.begin?.();try{ZF(n,e)}finally{r||i.end?.()}}function ZF(n,e){let t=Wy();try{$y(!0),Cv(n,e);let i=0;for(;Jc(n);){if(i===YF)throw new Ne(103,!1);i++,Cv(n,1)}}finally{$y(t)}}function JF(n,e,t,i){if(ro(e))return;let r=e[ze],o=!1,s=!1;hf(e);let a=!0,c=null,l=null;o||(pw(n)?(l=GF(e),c=Oc(l)):Pd()===null?(a=!1,l=qF(e),c=Oc(l)):e[Qn]&&(kd(e[Qn]),e[Qn]=null));try{Oy(e),oM(n.bindingStartIndex),t!==null&&cw(n,e,t,2,i);let u=(r&3)===3;if(!o)if(u){let h=n.preOrderCheckHooks;h!==null&&Mf(e,h,null)}else{let h=n.preOrderHooks;h!==null&&Ef(e,h,0,null),tv(e,0)}if(s||KF(e),mw(e),yw(e,0),n.contentQueries!==null&&UE(n,e),!o)if(u){let h=n.contentCheckHooks;h!==null&&Mf(e,h)}else{let h=n.contentHooks;h!==null&&Ef(e,h,1),tv(e,1)}eO(n,e);let d=n.components;d!==null&&_w(e,d,0);let f=n.viewQuery;if(f!==null&&_v(2,f,i),!o)if(u){let h=n.viewCheckHooks;h!==null&&Mf(e,h)}else{let h=n.viewHooks;h!==null&&Ef(e,h,2),tv(e,2)}if(n.firstUpdatePass===!0&&(n.firstUpdatePass=!1),e[of]){for(let h of e[of])h();e[of]=null}o||(fw(e),e[ze]&=-73)}catch(u){throw o||oa(e),u}finally{l!==null&&(Ld(l,c),a&&WF(l)),pf()}}function yw(n,e){for(let t=CE(n);t!==null;t=TE(t))for(let i=kt;i<t.length;i++){let r=t[i];vw(r,e)}}function KF(n){for(let e=CE(n);e!==null;e=TE(e)){if(!(e[ze]&2))continue;let t=e[es];for(let i=0;i<t.length;i++){let r=t[i];Ly(r)}}}function QF(n,e,t){ut(ot.ComponentStart);let i=mi(e,n);try{vw(i,t)}finally{ut(ot.ComponentEnd,i[Wt])}}function vw(n,e){sf(n)&&Cv(n,e)}function Cv(n,e){let i=n[Se],r=n[ze],o=n[Qn],s=!!(e===0&&r&16);if(s||=!!(r&64&&e===0),s||=!!(r&1024),s||=!!(o?.dirty&&qg(o)),s||=!1,o&&(o.dirty=!1),n[ze]&=-9217,s)JF(i,n,i.template,n[Wt]);else if(r&8192){let a=Ue(null);try{mw(n),yw(n,1);let c=i.components;c!==null&&_w(n,c,1),fw(n)}finally{Ue(a)}}}function _w(n,e,t){for(let i=0;i<e.length;i++)QF(n,e[i],t)}function eO(n,e){let t=n.hostBindingOpCodes;if(t!==null)try{for(let i=0;i<t.length;i++){let r=t[i];if(r<0)so(~r);else{let o=r,s=t[++i],a=t[++i];aM(s,o);let c=e[o];ut(ot.HostBindingsUpdateStart,c);try{a(2,c)}finally{ut(ot.HostBindingsUpdateEnd,c)}}}}finally{so(-1)}}function Jf(n,e){let t=Wy()?64:1088;for(n[Ci].changeDetectionScheduler?.notify(e);n;){n[ze]|=t;let i=Zr(n);if(ia(n)&&!i)return n;n=i}return null}function xw(n,e,t,i){return[n,!0,0,e,null,i,null,t,null,null]}function bw(n,e){let t=kt+e;if(t<n.length)return n[t]}function Sl(n,e,t,i=!0){let r=e[Se];if(tO(r,e,n,t),i){let s=wv(t,n),a=e[Et],c=a.parentNode(n[io]);c!==null&&gF(r,n[fi],a,e,c,s)}let o=e[Qs];o!==null&&o.firstChild!==null&&(o.firstChild=null)}function x_(n,e){let t=dl(n,e);return t!==void 0&&Xf(t[Se],t),t}function dl(n,e){if(n.length<=kt)return;let t=kt+e,i=n[t];if(i){let r=i[eo];r!==null&&r!==n&&d_(r,i),e>0&&(n[t-1][di]=i[di]);let o=$c(n,kt+e);mF(i[Se],i);let s=o[Zi];s!==null&&s.detachView(o[Se]),i[Yt]=null,i[di]=null,i[ze]&=-129}return i}function tO(n,e,t,i){let r=kt+i,o=t.length;i>0&&(t[r-1][di]=e),i<o-kt?(e[di]=t[r],xy(t,kt+i,e)):(t.push(e),e[di]=null),e[Yt]=t;let s=e[eo];s!==null&&t!==s&&Sw(s,e);let a=e[Zi];a!==null&&a.insertView(n),af(e),e[ze]|=128}function Sw(n,e){let t=n[es],i=e[Yt];if(Er(i))n[ze]|=2;else{let r=i[Yt][Kn];e[Kn]!==r&&(n[ze]|=2)}t===null?n[es]=[e]:t.push(e)}var uo=class{_lView;_cdRefInjectingView;_appRef=null;_attachedToViewContainer=!1;exhaustive;get rootNodes(){let e=this._lView,t=e[Se];return ul(t,e,t.firstChild,[])}constructor(e,t){this._lView=e,this._cdRefInjectingView=t}get context(){return this._lView[Wt]}set context(e){this._lView[Wt]=e}get destroyed(){return ro(this._lView)}destroy(){if(this._appRef)this._appRef.detachView(this);else if(this._attachedToViewContainer){let e=this._lView[Yt];if(Ti(e)){let t=e[Zc],i=t?t.indexOf(this):-1;i>-1&&(dl(e,i),$c(t,i))}this._attachedToViewContainer=!1}Xf(this._lView[Se],this._lView)}onDestroy(e){cf(this._lView,e)}markForCheck(){Jf(this._cdRefInjectingView||this._lView,4)}detach(){this._lView[ze]&=-129}reattach(){af(this._lView),this._lView[ze]|=128}detectChanges(){this._lView[ze]|=1024,gw(this._lView)}checkNoChanges(){}attachToViewContainerRef(){if(this._appRef)throw new Ne(902,!1);this._attachedToViewContainer=!0}detachFromAppRef(){this._appRef=null;let e=ia(this._lView),t=this._lView[eo];t!==null&&!e&&d_(t,this._lView),sw(this._lView[Se],this._lView)}attachToAppRef(e){if(this._attachedToViewContainer)throw new Ne(902,!1);this._appRef=e;let t=ia(this._lView),i=this._lView[eo];i!==null&&!t&&Sw(i,this._lView),af(this._lView)}};var ya=(()=>{class n{_declarationLView;_declarationTContainer;elementRef;static __NG_ELEMENT_ID__=nO;constructor(t,i,r){this._declarationLView=t,this._declarationTContainer=i,this.elementRef=r}get ssrId(){return this._declarationTContainer.tView?.ssrId||null}createEmbeddedView(t,i){return this.createEmbeddedViewImpl(t,i)}createEmbeddedViewImpl(t,i,r){let o=bl(this._declarationLView,this._declarationTContainer,t,{embeddedViewInjector:i,dehydratedView:r});return new uo(o)}}return n})();function nO(){return Kf(rn(),Oe())}function Kf(n,e){return n.type&4?new ya(e,n,ba(n,e)):null}function Ml(n,e,t,i,r){let o=n.data[e];if(o===null)o=iO(n,e,t,i,r),sM()&&(o.flags|=32);else if(o.type&64){o.type=t,o.value=i,o.attrs=r;let s=eM();o.injectorIndex=s===null?-1:s.injectorIndex}return sa(o,!0),o}function iO(n,e,t,i,r){let o=Gy(),s=jy(),a=s?o:o&&o.parent,c=n.data[e]=oO(n,a,t,e,i,r);return rO(n,c,o,s),c}function rO(n,e,t,i){n.firstChild===null&&(n.firstChild=e),t!==null&&(i?t.child==null&&e.parent!==null&&(t.child=e):t.next===null&&(t.next=e,e.prev=t))}function oO(n,e,t,i,r,o){let s=e?e.injectorIndex:-1,a=0;return QS()&&(a|=128),{type:t,index:i,insertBeforeIndex:null,injectorIndex:s,directiveStart:-1,directiveEnd:-1,directiveStylingLast:-1,componentOffset:-1,controlDirectiveIndex:-1,customControlIndex:-1,propertyBindings:null,flags:a,providerIndexes:0,value:r,namespace:Yy(),attrs:o,mergedAttrs:null,localNames:null,initialInputs:null,inputs:null,hostDirectiveInputs:null,outputs:null,hostDirectiveOutputs:null,directiveToIndex:null,tView:null,next:null,prev:null,projectionNext:null,child:null,parent:e,projection:null,styles:null,stylesWithoutHost:null,residualStyles:void 0,classes:null,classesWithoutHost:null,residualClasses:void 0,classBindings:0,styleBindings:0}}function sO(n){let e=n[no]??[],i=n[Yt][Et],r=[];for(let o of e)o.data[Kv]!==void 0?r.push(o):aO(o,i);n[no]=r}function aO(n,e){let t=0,i=n.firstChild;if(i){let r=n.data[NE];for(;t<r;){let o=i.nextSibling;ZE(e,i,!1),i=o,t++}}}var cO=()=>null,lO=()=>null;function Tv(n,e){return cO(n,e)}function Mw(n,e,t){return lO(n,e,t)}var Ew=class{},Qf=class{},Dv=class{resolveComponentFactory(e){throw new Ne(917,!1)}},eh=class{static NULL=new Dv},fl=class{},Ar=(()=>{class n{destroyNode=null;static __NG_ELEMENT_ID__=()=>uO()}return n})();function uO(){let n=Oe(),e=rn(),t=mi(e.index,n);return(Er(t)?t:n)[Et]}var ww=(()=>{class n{static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>null})}return n})();var Cf={},da=class{injector;parentInjector;constructor(e,t){this.injector=e,this.parentInjector=t}get(e,t,i){let r=this.injector.get(e,Cf,i);return r!==Cf||t===Cf?r:this.parentInjector.get(e,t,i)}};function Uf(n,e,t){let i=t?n.styles:null,r=t?n.classes:null,o=0;if(e!==null)for(let s=0;s<e.length;s++){let a=e[s];if(typeof a=="number")o=a;else if(o==1)r=Yd(r,a);else if(o==2){let c=a,l=e[++s];i=Yd(i,c+": "+l+";")}}t?n.styles=i:n.stylesWithoutHost=i,t?n.classes=r:n.classesWithoutHost=r}function nt(n,e=0){let t=Oe();if(t===null)return lt(n,e);let i=rn();return xE(i,t,cn(n),e)}function Cw(n,e,t,i,r){let o=i===null?null:{"":-1},s=r(n,t);if(s!==null){let a=s,c=null,l=null;for(let u of s)if(u.resolveHostDirectives!==null){[a,c,l]=u.resolveHostDirectives(s);break}hO(n,e,t,a,o,c,l)}o!==null&&i!==null&&dO(t,i,o)}function dO(n,e,t){let i=n.localNames=[];for(let r=0;r<e.length;r+=2){let o=t[e[r+1]];if(o==null)throw new Ne(-301,!1);i.push(e[r],o)}}function fO(n,e,t){e.componentOffset=t,(n.components??=[]).push(e.index)}function hO(n,e,t,i,r,o,s){let a=i.length,c=null;for(let f=0;f<a;f++){let h=i[f];c===null&&Ji(h)&&(c=h,fO(n,t,f)),mv(Pf(t,e),n,h.type)}_O(t,n.data.length,a),c?.viewProvidersResolver&&c.viewProvidersResolver(c);for(let f=0;f<a;f++){let h=i[f];h.providersResolver&&h.providersResolver(h)}let l=!1,u=!1,d=ew(n,e,a,null);a>0&&(t.directiveToIndex=new Map);for(let f=0;f<a;f++){let h=i[f];if(t.mergedAttrs=ha(t.mergedAttrs,h.hostAttrs),mO(n,t,e,d,h),vO(d,h,r),s!==null&&s.has(h)){let[y,p]=s.get(h);t.directiveToIndex.set(h.type,[d,y+t.directiveStart,p+t.directiveStart])}else(o===null||!o.has(h))&&t.directiveToIndex.set(h.type,d);h.contentQueries!==null&&(t.flags|=4),(h.hostBindings!==null||h.hostAttrs!==null||h.hostVars!==0)&&(t.flags|=64);let g=h.type.prototype;!l&&(g.ngOnChanges||g.ngOnInit||g.ngDoCheck)&&((n.preOrderHooks??=[]).push(t.index),l=!0),!u&&(g.ngOnChanges||g.ngDoCheck)&&((n.preOrderCheckHooks??=[]).push(t.index),u=!0),d++}pO(n,t,o)}function pO(n,e,t){for(let i=e.directiveStart;i<e.directiveEnd;i++){let r=n.data[i];if(t===null||!t.has(r))HM(0,e,r,i),HM(1,e,r,i),GM(e,i,!1);else{let o=t.get(r);zM(0,e,o,i),zM(1,e,o,i),GM(e,i,!0)}}}function HM(n,e,t,i){let r=n===0?t.inputs:t.outputs;for(let o in r)if(r.hasOwnProperty(o)){let s;n===0?s=e.inputs??={}:s=e.outputs??={},s[o]??=[],s[o].push(i),Tw(e,o)}}function zM(n,e,t,i){let r=n===0?t.inputs:t.outputs;for(let o in r)if(r.hasOwnProperty(o)){let s=r[o],a;n===0?a=e.hostDirectiveInputs??={}:a=e.hostDirectiveOutputs??={},a[s]??=[],a[s].push(i,o),Tw(e,s)}}function Tw(n,e){e==="class"?n.flags|=8:e==="style"&&(n.flags|=16)}function GM(n,e,t){let{attrs:i,inputs:r,hostDirectiveInputs:o}=n;if(i===null||!t&&r===null||t&&o===null||r_(n)){n.initialInputs??=[],n.initialInputs.push(null);return}let s=null,a=0;for(;a<i.length;){let c=i[a];if(c===0){a+=4;continue}else if(c===5){a+=2;continue}else if(typeof c=="number")break;if(!t&&r.hasOwnProperty(c)){let l=r[c];for(let u of l)if(u===e){s??=[],s.push(c,i[a+1]);break}}else if(t&&o.hasOwnProperty(c)){let l=o[c];for(let u=0;u<l.length;u+=2)if(l[u]===e){s??=[],s.push(l[u+1],i[a+1]);break}}a+=2}n.initialInputs??=[],n.initialInputs.push(s)}function mO(n,e,t,i,r){n.data[i]=r;let o=r.factory||(r.factory=Yr(r.type,!0)),s=new is(o,Ji(r),nt,null);n.blueprint[i]=s,t[i]=s,gO(n,e,i,ew(n,t,r.hostVars,qn),r)}function gO(n,e,t,i,r){let o=r.hostBindings;if(o){let s=n.hostBindingOpCodes;s===null&&(s=n.hostBindingOpCodes=[]);let a=~e.index;yO(s)!=a&&s.push(a),s.push(t,i,o)}}function yO(n){let e=n.length;for(;e>0;){let t=n[--e];if(typeof t=="number"&&t<0)return t}return 0}function vO(n,e,t){if(t){if(e.exportAs)for(let i=0;i<e.exportAs.length;i++)t[e.exportAs[i]]=n;Ji(e)&&(t[""]=n)}}function _O(n,e,t){n.flags|=1,n.directiveStart=e,n.directiveEnd=e+t,n.providerIndexes=e}function b_(n,e,t,i,r,o,s,a){let c=e[Se],l=c.consts,u=Pn(l,s),d=Ml(c,n,t,i,u);return o&&Cw(c,e,d,Pn(l,a),r),d.mergedAttrs=ha(d.mergedAttrs,d.attrs),d.attrs!==null&&Uf(d,d.attrs,!1),d.mergedAttrs!==null&&Uf(d,d.mergedAttrs,!0),c.queries!==null&&c.queries.elementStart(c,d),d}function S_(n,e){fE(n,e),Iy(e)&&n.queries.elementEnd(e)}function xO(n,e,t,i,r,o){let s=e.consts,a=Pn(s,r),c=Ml(e,n,t,i,a);if(c.mergedAttrs=ha(c.mergedAttrs,c.attrs),o!=null){let l=Pn(s,o);c.localNames=[];for(let u=0;u<l.length;u+=2)c.localNames.push(l[u],-1)}return c.attrs!==null&&Uf(c,c.attrs,!1),c.mergedAttrs!==null&&Uf(c,c.mergedAttrs,!0),e.queries!==null&&e.queries.elementStart(e,c),c}function M_(n){return n!==null&&(typeof n=="function"||typeof n=="object")}function bO(n,e,t){return n[e]=t}function gi(n,e,t){if(t===qn)return!1;let i=n[e];return Object.is(i,t)?!1:(n[e]=t,!0)}function SO(n,e,t,i){let r=gi(n,e,t);return gi(n,e+1,i)||r}function Tf(n,e,t){return function i(r){let o=i.__ngNativeEl__;o!==void 0&&lP(r,o);let s=wr(n)?mi(n.index,e):e;Jf(s,5);let a=e[Wt],c=jM(e,a,t,r),l=i.__ngNextListenerFn__;for(;l;)c=jM(e,a,l,r)&&c,l=l.__ngNextListenerFn__;return c}}function jM(n,e,t,i){let r=Ue(null);try{return ut(ot.OutputStart,e,t),t(i)!==!1}catch(o){return y_(n,o),!1}finally{ut(ot.OutputEnd,e,t),Ue(r)}}function Dw(n,e,t,i,r,o,s,a){let c=na(n),l=!1,u=null;if(!i&&c&&(u=EO(e,t,o,n.index)),u!==null){let d=u.__ngLastListenerFn__||u;d.__ngNextListenerFn__=s,u.__ngLastListenerFn__=s,l=!0}else{let d=pi(n,t),f=i?i(d):d;dP(t,f,o,a),i||(a.__ngNativeEl__=d);let h=r.listen(f,o,a);if(!MO(o)){let g=i?y=>i(hi(y[n.index])):n.index;Aw(g,e,t,o,a,h,!1)}}return l}function MO(n){return n.startsWith("animation")||n.startsWith("transition")}function EO(n,e,t,i){let r=n.cleanup;if(r!=null)for(let o=0;o<r.length-1;o+=2){let s=r[o];if(s===t&&r[o+1]===i){let a=e[ea],c=r[o+2];return a&&a.length>c?a[c]:null}typeof s=="string"&&(o+=2)}return null}function Aw(n,e,t,i,r,o,s){let a=e.firstCreatePass?By(e):null,c=Uy(t),l=c.length;c.push(r,o),a&&a.push(i,n,l,(l+1)*(s?-1:1))}function WM(n,e,t,i,r,o){let s=e[t],a=e[Se],l=a.data[t].outputs[i],d=s[l].subscribe(o);Aw(n.index,a,e,r,o,d,!0)}var Av=Symbol("BINDING");function Iw(n){return n.debugInfo?.className||n.type.name||null}var Iv=class extends eh{ngModule;constructor(e){super(),this.ngModule=e}resolveComponentFactory(e){let t=Kr(e);return new hl(t,this.ngModule)}};function wO(n){return Object.keys(n).map(e=>{let[t,i,r]=n[e],o={propName:t,templateName:e,isSignal:(i&$f.SignalBased)!==0};return r&&(o.transform=r),o})}function CO(n){return Object.keys(n).map(e=>({propName:n[e],templateName:e}))}function TO(n,e,t){let i=e instanceof bn?e:e?.injector;return i&&n.getStandaloneInjector!==null&&(i=n.getStandaloneInjector(i)||i),i?new da(t,i):t}function DO(n){let e=n.get(fl,null);if(e===null)throw new Ne(407,!1);let t=n.get(ww,null),i=n.get(Sr,null),r=n.get(fo,null,{optional:!0});return{rendererFactory:e,sanitizer:t,changeDetectionScheduler:i,ngReflect:!1,tracingService:r}}function AO(n,e){let t=Rw(n);return XE(e,t,t==="svg"?Vc:t==="math"?Ry:null)}function IO(n){if(n?.toLowerCase()==="script")throw new Ne(905,!1)}function Rw(n){return(n.selectors[0][0]||"div").toLowerCase()}var hl=class extends Qf{componentDef;ngModule;selector;componentType;ngContentSelectors;isBoundToModule;cachedInputs=null;cachedOutputs=null;get inputs(){return this.cachedInputs??=wO(this.componentDef.inputs),this.cachedInputs}get outputs(){return this.cachedOutputs??=CO(this.componentDef.outputs),this.cachedOutputs}constructor(e,t){super(),this.componentDef=e,this.ngModule=t,this.componentType=e.type,this.selector=iF(e.selectors),this.ngContentSelectors=e.ngContentSelectors??[],this.isBoundToModule=!!t}create(e,t,i,r,o,s){ut(ot.DynamicComponentStart);let a=Ue(null);try{let c=this.componentDef,l=TO(c,r||this.ngModule,e),u=DO(l),d=u.tracingService;return d&&d.componentCreate?d.componentCreate(Iw(c),()=>this.createComponentRef(u,l,t,i,o,s)):this.createComponentRef(u,l,t,i,o,s)}finally{Ue(a)}}createComponentRef(e,t,i,r,o,s){let a=this.componentDef,c=RO(r,a,s,o),l=e.rendererFactory.createRenderer(null,a),u=r?AF(l,r,a.encapsulation,t):AO(a,l);IO(u?.tagName);let d=s?.some($M)||o?.some(g=>typeof g!="function"&&g.bindings.some($M)),f=s_(null,c,null,512|QE(a),null,null,e,l,t,null,kE(u,t,!0));f[Dt]=u,hf(f);let h=null;try{let g=b_(Dt,f,2,"#host",()=>c.directiveRegistry,!0,0);JE(l,u,g),pa(u,f),Zf(c,f,g),n_(c,g,f),S_(c,g),i!==void 0&&PO(g,this.ngContentSelectors,i),h=mi(g.index,f),f[Wt]=h[Wt],__(c,f,null)}catch(g){throw h!==null&&yv(h),yv(f),g}finally{ut(ot.DynamicComponentEnd),pf()}return new Bf(this.componentType,f,!!d)}};function RO(n,e,t,i){let r=n?["ng-version","21.2.24"]:rF(e.selectors[0]),o=null,s=null,a=0;if(t)for(let u of t)a+=u[Av].requiredVars,u.create&&(u.targetIdx=0,(o??=[]).push(u)),u.update&&(u.targetIdx=0,(s??=[]).push(u));if(i)for(let u=0;u<i.length;u++){let d=i[u];if(typeof d!="function")for(let f of d.bindings){a+=f[Av].requiredVars;let h=u+1;f.create&&(f.targetIdx=h,(o??=[]).push(f)),f.update&&(f.targetIdx=h,(s??=[]).push(f))}}let c=[e];if(i)for(let u of i){let d=typeof u=="function"?u:u.type,f=Kd(d);c.push(f)}return o_(0,null,NO(o,s),1,a,c,null,null,null,[r],null)}function NO(n,e){return!n&&!e?null:t=>{if(t&1&&n)for(let i of n)i.create();if(t&2&&e)for(let i of e)i.update()}}function $M(n){let e=n[Av].kind;return e==="input"||e==="twoWay"}var Bf=class extends Ew{_rootLView;_hasInputBindings;instance;hostView;changeDetectorRef;componentType;location;previousInputValues=null;_tNode;constructor(e,t,i){super(),this._rootLView=t,this._hasInputBindings=i,this._tNode=ra(t[Se],Dt),this.location=ba(this._tNode,t),this.instance=mi(this._tNode.index,t)[Wt],this.hostView=this.changeDetectorRef=new uo(t,void 0),this.componentType=e}setInput(e,t){this._hasInputBindings;let i=this._tNode;if(this.previousInputValues??=new Map,this.previousInputValues.has(e)&&Object.is(this.previousInputValues.get(e),t))return;let r=this._rootLView,o=v_(i,r[Se],r,e,t);this.previousInputValues.set(e,t);let s=mi(i.index,r);Jf(s,1)}get injector(){return new ns(this._tNode,this._rootLView)}destroy(){this.hostView.destroy()}onDestroy(e){this.hostView.onDestroy(e)}};function PO(n,e,t){let i=n.projection=[];for(let r=0;r<e.length;r++){let o=t[r];i.push(o!=null&&o.length?Array.from(o):null)}}var Sa=(()=>{class n{static __NG_ELEMENT_ID__=FO}return n})();function FO(){let n=rn();return Nw(n,Oe())}var Rv=class n extends Sa{_lContainer;_hostTNode;_hostLView;constructor(e,t,i){super(),this._lContainer=e,this._hostTNode=t,this._hostLView=i}get element(){return ba(this._hostTNode,this._hostLView)}get injector(){return new ns(this._hostTNode,this._hostLView)}get parentInjector(){let e=Zv(this._hostTNode,this._hostLView);if(pE(e)){let t=Rf(e,this._hostLView),i=If(e),r=t[Se].data[i+8];return new ns(r,t)}else return new ns(null,this._hostLView)}clear(){for(;this.length>0;)this.remove(this.length-1)}get(e){let t=qM(this._lContainer);return t!==null&&t[e]||null}get length(){return this._lContainer.length-kt}createEmbeddedView(e,t,i){let r,o;typeof i=="number"?r=i:i!=null&&(r=i.index,o=i.injector);let s=Tv(this._lContainer,e.ssrId),a=e.createEmbeddedViewImpl(t||{},o,s);return this.insertImpl(a,r,ga(this._hostTNode,s)),a}createComponent(e,t,i,r,o,s,a){let c=e&&!ON(e),l;if(c)l=t;else{let p=t||{};l=p.index,i=p.injector,r=p.projectableNodes,o=p.environmentInjector||p.ngModuleRef,s=p.directives,a=p.bindings}let u=c?e:new hl(Kr(e)),d=i||this.parentInjector;if(!o&&u.ngModule==null){let m=(c?d:this.parentInjector).get(bn,null);m&&(o=m)}let f=Kr(u.componentType??{}),h=Tv(this._lContainer,f?.id??null),g=h?.firstChild??null,y=u.create(d,r,g,o,s,a);return this.insertImpl(y.hostView,l,ga(this._hostTNode,h)),y}insert(e,t){return this.insertImpl(e,t,!0)}insertImpl(e,t,i){let r=e._lView;if(XS(r)){let a=this.indexOf(e);if(a!==-1)this.detach(a);else{let c=r[Yt],l=new n(c,c[fi],c[Yt]);l.detach(l.indexOf(e))}}let o=this._adjustIndex(t),s=this._lContainer;return Sl(s,r,o,i),e.attachToViewContainerRef(),xy(rv(s),o,e),e}move(e,t){return this.insert(e,t)}indexOf(e){let t=qM(this._lContainer);return t!==null?t.indexOf(e):-1}remove(e){let t=this._adjustIndex(e,-1),i=dl(this._lContainer,t);i&&($c(rv(this._lContainer),t),Xf(i[Se],i))}detach(e){let t=this._adjustIndex(e,-1),i=dl(this._lContainer,t);return i&&$c(rv(this._lContainer),t)!=null?new uo(i):null}_adjustIndex(e,t=0){return e??this.length+t}};function qM(n){return n[Zc]}function rv(n){return n[Zc]||(n[Zc]=[])}function Nw(n,e){let t,i=e[n.index];return Ti(i)?t=i:(t=xw(i,e,null,n),e[n.index]=t,a_(e,t)),LO(t,e,n,i),new Rv(t,n,e)}function OO(n,e){let t=n[Et],i=t.createComment(""),r=pi(e,n),o=t.parentNode(r);return Lf(t,o,i,t.nextSibling(r),!1),i}var LO=UO,kO=()=>!1;function Pw(n,e,t){return kO(n,e,t)}function UO(n,e,t,i){if(n[io])return;let r;t.type&8?r=hi(i):r=OO(e,t),n[io]=r}var Nv=class n{queryList;matches=null;constructor(e){this.queryList=e}clone(){return new n(this.queryList)}setDirty(){this.queryList.setDirty()}},Pv=class n{queries;constructor(e=[]){this.queries=e}createEmbeddedView(e){let t=e.queries;if(t!==null){let i=e.contentQueries!==null?e.contentQueries[0]:t.length,r=[];for(let o=0;o<i;o++){let s=t.getByIndex(o),a=this.queries[s.indexInDeclarationView];r.push(a.clone())}return new n(r)}return null}insertView(e){this.dirtyQueriesWithMatches(e)}detachView(e){this.dirtyQueriesWithMatches(e)}finishViewCreation(e){this.dirtyQueriesWithMatches(e)}dirtyQueriesWithMatches(e){for(let t=0;t<this.queries.length;t++)w_(e,t).matches!==null&&this.queries[t].setDirty()}},Fv=class{flags;read;predicate;constructor(e,t,i=null){this.flags=t,this.read=i,typeof e=="string"?this.predicate=jO(e):this.predicate=e}},Ov=class n{queries;constructor(e=[]){this.queries=e}elementStart(e,t){for(let i=0;i<this.queries.length;i++)this.queries[i].elementStart(e,t)}elementEnd(e){for(let t=0;t<this.queries.length;t++)this.queries[t].elementEnd(e)}embeddedTView(e){let t=null;for(let i=0;i<this.length;i++){let r=t!==null?t.length:0,o=this.getByIndex(i).embeddedTView(e,r);o&&(o.indexInDeclarationView=i,t!==null?t.push(o):t=[o])}return t!==null?new n(t):null}template(e,t){for(let i=0;i<this.queries.length;i++)this.queries[i].template(e,t)}getByIndex(e){return this.queries[e]}get length(){return this.queries.length}track(e){this.queries.push(e)}},Lv=class n{metadata;matches=null;indexInDeclarationView=-1;crossesNgTemplate=!1;_declarationNodeIndex;_appliesToNextNode=!0;constructor(e,t=-1){this.metadata=e,this._declarationNodeIndex=t}elementStart(e,t){this.isApplyingToNode(t)&&this.matchTNode(e,t)}elementEnd(e){this._declarationNodeIndex===e.index&&(this._appliesToNextNode=!1)}template(e,t){this.elementStart(e,t)}embeddedTView(e,t){return this.isApplyingToNode(e)?(this.crossesNgTemplate=!0,this.addMatch(-e.index,t),new n(this.metadata)):null}isApplyingToNode(e){if(this._appliesToNextNode&&(this.metadata.flags&1)!==1){let t=this._declarationNodeIndex,i=e.parent;for(;i!==null&&i.type&8&&i.index!==t;)i=i.parent;return t===(i!==null?i.index:-1)}return this._appliesToNextNode}matchTNode(e,t){let i=this.metadata.predicate;if(Array.isArray(i))for(let r=0;r<i.length;r++){let o=i[r];this.matchTNodeWithReadOption(e,t,BO(t,o)),this.matchTNodeWithReadOption(e,t,wf(t,e,o,!1,!1))}else i===ya?t.type&4&&this.matchTNodeWithReadOption(e,t,-1):this.matchTNodeWithReadOption(e,t,wf(t,e,i,!1,!1))}matchTNodeWithReadOption(e,t,i){if(i!==null){let r=this.metadata.read;if(r!==null)if(r===Fn||r===Sa||r===ya&&t.type&4)this.addMatch(t.index,-2);else{let o=wf(t,e,r,!1,!1);o!==null&&this.addMatch(t.index,o)}else this.addMatch(t.index,i)}}addMatch(e,t){this.matches===null?this.matches=[e,t]:this.matches.push(e,t)}};function BO(n,e){let t=n.localNames;if(t!==null){for(let i=0;i<t.length;i+=2)if(t[i]===e)return t[i+1]}return null}function VO(n,e){return n.type&11?ba(n,e):n.type&4?Kf(n,e):null}function HO(n,e,t,i){return t===-1?VO(e,n):t===-2?zO(n,e,i):cl(n,n[Se],t,e)}function zO(n,e,t){if(t===Fn)return ba(e,n);if(t===ya)return Kf(e,n);if(t===Sa)return Nw(e,n)}function Fw(n,e,t,i){let r=e[Zi].queries[i];if(r.matches===null){let o=n.data,s=t.matches,a=[];for(let c=0;s!==null&&c<s.length;c+=2){let l=s[c];if(l<0)a.push(null);else{let u=o[l];a.push(HO(e,u,s[c+1],t.metadata.read))}}r.matches=a}return r.matches}function kv(n,e,t,i){let r=n.queries.getByIndex(t),o=r.matches;if(o!==null){let s=Fw(n,e,r,t);for(let a=0;a<o.length;a+=2){let c=o[a];if(c>0)i.push(s[a/2]);else{let l=o[a+1],u=e[-c];for(let d=kt;d<u.length;d++){let f=u[d];f[eo]===f[Yt]&&kv(f[Se],f,l,i)}if(u[es]!==null){let d=u[es];for(let f=0;f<d.length;f++){let h=d[f];kv(h[Se],h,l,i)}}}}}return i}function E_(n,e){return n[Zi].queries[e].queryList}function GO(n,e,t){let i=new Ff((t&4)===4);return ZS(n,e,i,i.destroy),(e[Zi]??=new Pv).queries.push(new Nv(i))-1}function Ow(n,e,t){let i=At();return i.firstCreatePass&&(WO(i,new Fv(n,e,t),-1),(e&2)===2&&(i.staticViewQueries=!0)),GO(i,Oe(),e)}function jO(n){return n.split(",").map(e=>e.trim())}function WO(n,e,t){n.queries===null&&(n.queries=new Ov),n.queries.track(new Lv(e,t))}function w_(n,e){return n.queries.getByIndex(e)}function Lw(n,e){let t=n[Se],i=w_(t,e);return i.crossesNgTemplate?kv(t,n,e,[]):Fw(t,n,i,e)}function kw(n,e,t){let i,r=Lc(()=>{i._dirtyCounter();let o=qO(i,n);if(e&&o===void 0)throw new Ne(-951,!1);return o});return i=r[_n],i._dirtyCounter=ts(0),i._flatValue=void 0,r}function Uw(n){return kw(!0,!1,n)}function Bw(n){return kw(!0,!0,n)}function $O(n,e){let t=n[_n];t._lView=Oe(),t._queryIndex=e,t._queryList=E_(t._lView,e),t._queryList.onDirty(()=>t._dirtyCounter.update(i=>i+1))}function qO(n,e){let t=n._lView,i=n._queryIndex;if(t===void 0||i===void 0||t[ze]&4)return e?void 0:xn;let r=E_(t,i),o=Lw(t,i);return r.reset(o,ME),e?r.first:r._changesDetected||n._flatValue===void 0?n._flatValue=r.toArray():n._flatValue}var pl=class{};var ml=class extends pl{injector;componentFactoryResolver=new Iv(this);instance=null;constructor(e){super();let t=new qo([...e.providers,{provide:pl,useValue:this},{provide:eh,useValue:this.componentFactoryResolver}],e.parent||Xc(),e.debugName,new Set(["environment"]));this.injector=t,e.runEnvironmentInitializers&&t.resolveInjectorInitializers()}destroy(){this.injector.destroy()}onDestroy(e){this.injector.onDestroy(e)}};function C_(n,e,t=null){return new ml({providers:n,parent:e,debugName:t,runEnvironmentInitializers:!0}).injector}var XO=(()=>{class n{_injector;cachedInjectors=new Map;constructor(t){this._injector=t}getOrCreateStandaloneInjector(t){if(!t.standalone)return null;if(!this.cachedInjectors.has(t)){let i=rf(!1,t.type),r=i.length>0?C_([i],this._injector,""):null;this.cachedInjectors.set(t,r)}return this.cachedInjectors.get(t)}ngOnDestroy(){try{for(let t of this.cachedInjectors.values())t!==null&&t.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=Pe({token:n,providedIn:"environment",factory:()=>new n(lt(bn))})}return n})();function T_(n){return yl(()=>{let e=Vw(n),t=at(Re({},e),{decls:n.decls,vars:n.vars,template:n.template,consts:n.consts||null,ngContentSelectors:n.ngContentSelectors,onPush:n.changeDetection===Jv.OnPush,directiveDefs:null,pipeDefs:null,dependencies:e.standalone&&n.dependencies||null,getStandaloneInjector:e.standalone?r=>r.get(XO).getOrCreateStandaloneInjector(t):null,getExternalStyles:null,signals:n.signals??!1,data:n.data||{},encapsulation:n.encapsulation||rs.Emulated,styles:n.styles||xn,_:null,schemas:n.schemas||null,tView:null,id:""});e.standalone&&Dr("NgStandalone"),Hw(t);let i=n.dependencies;return t.directiveDefs=XM(i,YO),t.pipeDefs=XM(i,gy),t.id=KO(t),t})}function YO(n){return Kr(n)||Kd(n)}function ss(n){return yl(()=>({type:n.type,bootstrap:n.bootstrap||xn,declarations:n.declarations||xn,imports:n.imports||xn,exports:n.exports||xn,transitiveCompileScopes:null,schemas:n.schemas||null,id:n.id||null}))}function ZO(n,e){if(n==null)return Qr;let t={};for(let i in n)if(n.hasOwnProperty(i)){let r=n[i],o,s,a,c;Array.isArray(r)?(a=r[0],o=r[1],s=r[2]??o,c=r[3]||null):(o=r,s=r,a=$f.None,c=null),t[o]=[i,a,c],e[o]=s}return t}function JO(n){if(n==null)return Qr;let e={};for(let t in n)n.hasOwnProperty(t)&&(e[n[t]]=t);return e}function Sn(n){return yl(()=>{let e=Vw(n);return Hw(e),e})}function th(n){return{type:n.type,name:n.name,factory:null,pure:n.pure!==!1,standalone:n.standalone??!0,onDestroy:n.type.prototype.ngOnDestroy||null}}function Vw(n){let e={};return{type:n.type,providersResolver:null,viewProvidersResolver:null,factory:null,hostBindings:n.hostBindings||null,hostVars:n.hostVars||0,hostAttrs:n.hostAttrs||null,contentQueries:n.contentQueries||null,declaredInputs:e,inputConfig:n.inputs||Qr,exportAs:n.exportAs||null,standalone:n.standalone??!0,signals:n.signals===!0,selectors:n.selectors||xn,viewQuery:n.viewQuery||null,features:n.features||null,setInput:null,resolveHostDirectives:null,hostDirectives:null,controlDef:null,inputs:ZO(n.inputs,e),outputs:JO(n.outputs),debugInfo:null}}function Hw(n){n.features?.forEach(e=>e(n))}function XM(n,e){return n?()=>{let t=typeof n=="function"?n():n,i=[];for(let r of t){let o=e(r);o!==null&&i.push(o)}return i}:null}function KO(n){let e=0,t=typeof n.consts=="function"?"":n.consts,i=[n.selectors,n.ngContentSelectors,n.hostVars,n.hostAttrs,t,n.vars,n.decls,n.encapsulation,n.standalone,n.signals,n.exportAs,JSON.stringify(n.inputs),JSON.stringify(n.outputs),Object.getOwnPropertyNames(n.type.prototype),!!n.contentQueries,!!n.viewQuery];for(let o of i.join("|"))e=Math.imul(31,e)+o.charCodeAt(0)<<0;return e+=2147483648,"c"+e}function QO(n){return Object.getPrototypeOf(n.prototype).constructor}function er(n){let e=QO(n.type),t=!0,i=[n];for(;e&&e!==Function.prototype&&e!==Object.prototype;){let r,o=Object.hasOwn(e,jc)?e[jc]:void 0,s=Object.hasOwn(e,Wc)?e[Wc]:void 0;if(Ji(n))r=o??s;else{if(o)throw new Ne(903,!1);r=s}if(r){if(t){i.push(r);let c=n;c.inputs=ov(n.inputs),c.declaredInputs=ov(n.declaredInputs),c.outputs=ov(n.outputs);let l=r.hostBindings;l&&rL(n,l);let u=r.viewQuery,d=r.contentQueries;if(u&&nL(n,u),d&&iL(n,d),eL(n,r),PS(n.outputs,r.outputs),Ji(r)&&r.data.animation){let f=n.data;f.animation=(f.animation||[]).concat(r.data.animation)}}let a=r.features;if(a)for(let c=0;c<a.length;c++){let l=a[c];l&&l.ngInherit&&l(n),l===er&&(t=!1)}}e=Object.getPrototypeOf(e)}tL(i)}function eL(n,e){for(let t in e.inputs){if(!e.inputs.hasOwnProperty(t)||n.inputs.hasOwnProperty(t))continue;let i=e.inputs[t];i!==void 0&&(n.inputs[t]=i,n.declaredInputs[t]=e.declaredInputs[t])}}function tL(n){let e=0,t=null;for(let i=n.length-1;i>=0;i--){let r=n[i];r.hostVars=e+=r.hostVars,r.hostAttrs=ha(r.hostAttrs,t=ha(t,r.hostAttrs))}}function ov(n){return n===Qr?{}:n===xn?[]:n}function nL(n,e){let t=n.viewQuery;t?n.viewQuery=(i,r)=>{e(i,r),t(i,r)}:n.viewQuery=e}function iL(n,e){let t=n.contentQueries;t?n.contentQueries=(i,r,o)=>{e(i,r,o),t(i,r,o)}:n.contentQueries=e}function rL(n,e){let t=n.hostBindings;t?n.hostBindings=(i,r)=>{e(i,r),t(i,r)}:n.hostBindings=e}function zw(n,e,t,i,r,o,s,a){if(t.firstCreatePass){n.mergedAttrs=ha(n.mergedAttrs,n.attrs);let u=n.tView=o_(2,n,r,o,s,t.directiveRegistry,t.pipeRegistry,null,t.schemas,t.consts,null);t.queries!==null&&(t.queries.template(t,n),u.queries=t.queries.embeddedTView(n))}a&&(n.flags|=a),sa(n,!1);let c=sL(t,e,n,i);mf()&&f_(t,e,c,n),pa(c,e);let l=xw(c,e,c,n);e[i+Dt]=l,a_(e,l),Pw(l,n,e)}function oL(n,e,t,i,r,o,s,a,c,l,u){let d=t+Dt,f;return e.firstCreatePass?(f=Ml(e,d,4,s||null,a||null),lf()&&Cw(e,n,f,Pn(e.consts,l),p_),fE(e,f)):f=e.data[d],zw(f,n,e,t,i,r,o,c),na(f)&&Zf(e,n,f),l!=null&&xl(n,f,u),f}function va(n,e,t,i,r,o,s,a,c,l,u){let d=t+Dt,f;if(e.firstCreatePass){if(f=Ml(e,d,4,s||null,a||null),l!=null){let h=Pn(e.consts,l);f.localNames=[];for(let g=0;g<h.length;g+=2)f.localNames.push(h[g],-1)}}else f=e.data[d];return zw(f,n,e,t,i,r,o,c),l!=null&&xl(n,f,u),f}function Gw(n,e,t,i,r,o,s,a){let c=Oe(),l=At(),u=Pn(l.consts,o);return oL(c,l,n,e,t,i,r,u,void 0,s,a),Gw}function jw(n,e,t,i,r,o,s,a){let c=Oe(),l=At(),u=Pn(l.consts,o);return va(c,l,n,e,t,i,r,u,void 0,s,a),jw}var sL=aL;function aL(n,e,t,i){return tl(!0),e[Et].createComment("")}var $n=(function(n){return n[n.NOT_STARTED=0]="NOT_STARTED",n[n.IN_PROGRESS=1]="IN_PROGRESS",n[n.COMPLETE=2]="COMPLETE",n[n.FAILED=3]="FAILED",n})($n||{}),YM=0,cL=1,Ut=(function(n){return n[n.Placeholder=0]="Placeholder",n[n.Loading=1]="Loading",n[n.Complete=2]="Complete",n[n.Error=3]="Error",n})(Ut||{}),Ww=(function(n){return n[n.Initial=-1]="Initial",n})(Ww||{}),fa=0,nh=1,sl=2,bf=3,lL=4,uL=5,dL=6,fL=7,sv=8,hL=9,D_=(function(n){return n[n.Manual=0]="Manual",n[n.Playthrough=1]="Playthrough",n})(D_||{});function pL(n,e,t){let i=qw(n);e[i]===null&&(e[i]=[]),e[i].push(t)}function Df(n,e){let t=qw(n),i=e[t];if(i!==null){for(let r of i)r();e[t]=null}}function $w(n){Df(1,n),Df(0,n),Df(2,n)}function qw(n){let e=lL;return n===1?e=uL:n===2&&(e=hL),e}function ih(n){return n+1}function El(n,e){let t=n[Se],i=ih(e.index);return n[i]}function mL(n,e,t){let i=n[Se],r=ih(e);n[r]=t}function ho(n,e){let t=ih(e.index);return n.data[t]}function gL(n,e,t){let i=ih(e);n.data[i]=t}function yL(n,e,t){let i=e[Se],r=ho(i,t);switch(n){case Ut.Complete:return r.primaryTmplIndex;case Ut.Loading:return r.loadingTmplIndex;case Ut.Error:return r.errorTmplIndex;case Ut.Placeholder:return r.placeholderTmplIndex;default:return null}}function Uv(n,e){return e===Ut.Placeholder?n.placeholderBlockConfig?.[YM]??null:e===Ut.Loading?n.loadingBlockConfig?.[YM]??null:null}function Xw(n){return n.loadingBlockConfig?.[cL]??null}function ZM(n,e){if(!n||n.length===0)return e;let t=new Set(n);for(let i of e)t.add(i);return n.length===t.size?n:Array.from(t)}function vL(n,e){let t=e.primaryTmplIndex+Dt;return ra(n,t)}function _L(n,e,t){let i=t.get(Yw),r=t.get(jt),o=()=>i.remove(e);return i.add(n,e,r),o}var Yw=(()=>{class n{executingCallbacks=!1;timeoutId=null;invokeTimerAt=null;current=[];deferred=[];add(t,i,r){let o=this.executingCallbacks?this.deferred:this.current;this.addToQueue(o,Date.now()+t,i),this.scheduleTimer(r)}remove(t){let{current:i,deferred:r}=this;this.removeFromQueue(i,t)===-1&&this.removeFromQueue(r,t),i.length===0&&r.length===0&&this.clearTimeout()}addToQueue(t,i,r){let o=t.length;for(let s=0;s<t.length;s+=2)if(t[s]>i){o=s;break}Sy(t,o,i,r)}removeFromQueue(t,i){let r=-1;for(let o=0;o<t.length;o+=2)if(t[o+1]===i){r=o;break}return r>-1&&by(t,r,2),r}scheduleTimer(t){let i=()=>{this.clearTimeout(),this.executingCallbacks=!0;let o=[...this.current],s=Date.now();for(let c=0;c<o.length;c+=2){let l=o[c],u=o[c+1];if(l<=s)u();else break}let a=-1;for(let c=0;c<this.current.length&&this.current[c]<=s;c+=2)a=c+1;if(a>=0&&by(this.current,0,a+1),this.executingCallbacks=!1,this.deferred.length>0){for(let c=0;c<this.deferred.length;c+=2){let l=this.deferred[c],u=this.deferred[c+1];this.addToQueue(this.current,l,u)}this.deferred.length=0}this.scheduleTimer(t)};if(this.current.length>0){let o=Date.now(),s=this.current[0];if(this.timeoutId===null||this.invokeTimerAt&&this.invokeTimerAt-s>16){this.clearTimeout();let a=Math.max(s-o,16);this.invokeTimerAt=s,this.timeoutId=t.runOutsideAngular(()=>setTimeout(()=>t.run(i),a))}}}clearTimeout(){this.timeoutId!==null&&(clearTimeout(this.timeoutId),this.timeoutId=null)}ngOnDestroy(){this.clearTimeout(),this.current.length=0,this.deferred.length=0}static \u0275prov=Pe({token:n,providedIn:"root",factory:()=>new n})}return n})(),xL=(()=>{class n{cachedInjectors=new Map;getOrCreateInjector(t,i,r,o){if(!this.cachedInjectors.has(t)){let s=r.length>0?C_(r,i,o):null;this.cachedInjectors.set(t,s)}return this.cachedInjectors.get(t)}ngOnDestroy(){try{for(let t of this.cachedInjectors.values())t!==null&&t.destroy()}finally{this.cachedInjectors.clear()}}static \u0275prov=Pe({token:n,providedIn:"environment",factory:()=>new n})}return n})();var Zw=new He("");function av(n,e,t){return n.get(xL).getOrCreateInjector(e,n,t,"")}function bL(n,e,t){if(n instanceof da){let r=n.injector,o=n.parentInjector,s=av(o,e,t);return new da(r,s)}let i=n.get(bn);if(i!==n){let r=av(i,e,t);return new da(n,r)}return av(n,e,t)}function Cr(n,e,t,i=!1){let r=t[Yt],o=r[Se];if(ro(r))return;let s=El(r,e),a=s[nh],c=s[fL];if(!(c!==null&&n<c)&&KM(a,n)&&KM(s[fa]??-1,n)){let l=ho(o,e),d=!i&&!0&&(Xw(l)!==null||Uv(l,Ut.Loading)!==null||Uv(l,Ut.Placeholder))?Bv:Jw;try{d(n,s,t,e,r)}catch(f){y_(r,f)}}}function SL(n,e){let t=n[no]?.findIndex(r=>r.data[Qv]===e[nh])??-1;return{dehydratedView:t>-1?n[no][t]:null,dehydratedViewIx:t}}function Jw(n,e,t,i,r){ut(ot.DeferBlockStateStart);let o=yL(n,r,i);if(o!==null){e[nh]=n;let s=r[Se],a=o+Dt,c=ra(s,a),l=0;x_(t,l);let u;if(n===Ut.Complete){let g=ho(s,i),y=g.providers;y&&y.length>0&&(u=bL(r[Nn],g,y))}let{dehydratedView:d,dehydratedViewIx:f}=SL(t,e),h=bl(r,c,null,{injector:u,dehydratedView:d});if(Sl(t,h,l,ga(c,d)),Jf(h,2),f>-1&&t[no]?.splice(f,1),(n===Ut.Complete||n===Ut.Error)&&Array.isArray(e[sv])){for(let g of e[sv])g();e[sv]=null}}ut(ot.DeferBlockStateEnd)}function ML(n,e,t,i,r){let o=Date.now(),s=r[Se],a=ho(s,i);if(e[sl]===null||e[sl]<=o){e[sl]=null;let c=Xw(a),l=e[bf]!==null;if(n===Ut.Loading&&c!==null&&!l){e[fa]=n;let u=JM(c,e,i,t,r);e[bf]=u}else{n>Ut.Loading&&l&&(e[bf](),e[bf]=null,e[fa]=null),Jw(n,e,t,i,r);let u=Uv(a,n);u!==null&&(e[sl]=o+u,JM(u,e,i,t,r))}}else e[fa]=n}function JM(n,e,t,i,r){return _L(n,()=>{let s=e[fa];e[sl]=null,e[fa]=null,s!==null&&Cr(s,t,i)},r[Nn])}function KM(n,e){return n<e}function EL(n,e){let t=n[e.index];Cr(Ut.Placeholder,e,t)}function QM(n,e,t){n.loadingPromise.then(()=>{n.loadingState===$n.COMPLETE?Cr(Ut.Complete,e,t):n.loadingState===$n.FAILED&&Cr(Ut.Error,e,t)})}var Bv=null;function wL(n,e,t,i){let r=n.consts;t!=null&&(e.placeholderBlockConfig=Pn(r,t)),i!=null&&(e.loadingBlockConfig=Pn(r,i)),Bv===null&&(Bv=ML)}function A_(n){return typeof n=="function"&&n[_n]!==void 0}function I_(n){return A_(n)&&typeof n.set=="function"}var Kw=new He("");function as(n){return!!n&&typeof n.then=="function"}function rh(n){return!!n&&typeof n.subscribe=="function"}var Qw=new He("");var R_=(()=>{class n{resolve;reject;initialized=!1;done=!1;donePromise=new Promise((t,i)=>{this.resolve=t,this.reject=i});appInits=be(Qw,{optional:!0})??[];injector=be(Ei);constructor(){}runInitializers(){if(this.initialized)return;let t=[];for(let r of this.appInits){let o=Ks(this.injector,r);if(as(o))t.push(o);else if(rh(o)){let s=new Promise((a,c)=>{o.subscribe({complete:a,error:c})});t.push(s)}}let i=()=>{this.done=!0,this.resolve()};Promise.all(t).then(()=>{i()}).catch(r=>{this.reject(r)}),t.length===0&&i(),this.initialized=!0}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),eC=new He("");function tC(){Yg(()=>{let n="";throw new Ne(600,n)})}function nC(n){return n.isBoundToModule}var CL=10;var cs=(()=>{class n{_runningTick=!1;_destroyed=!1;_destroyListeners=[];_views=[];internalErrorHandler=be(Ki);afterRenderManager=be(l_);zonelessEnabled=be(ca);rootEffectScheduler=be(ev);dirtyFlags=0;tracingSnapshot=null;allTestViews=new Set;autoDetectTestViews=new Set;includeAllTestViews=!1;afterTick=new Gt;get allViews(){return[...(this.includeAllTestViews?this.allTestViews:this.autoDetectTestViews).keys(),...this._views]}get destroyed(){return this._destroyed}componentTypes=[];components=[];internalPendingTask=be(lo);get isStable(){return this.internalPendingTask.hasPendingTasksObservable.pipe(An(t=>!t))}constructor(){be(fo,{optional:!0})}whenStable(){let t;return new Promise(i=>{t=this.isStable.subscribe({next:r=>{r&&i()}})}).finally(()=>{t.unsubscribe()})}_injector=be(bn);_rendererFactory=null;get injector(){return this._injector}bootstrap(t,i){return this.bootstrapImpl(t,i)}bootstrapImpl(t,i,r=Ei.NULL){return this._injector.get(jt).run(()=>{ut(ot.BootstrapComponentStart);let s=t instanceof Qf;if(!this._injector.get(R_).done){let g="";throw new Ne(405,g)}let c;s?c=t:c=this._injector.get(eh).resolveComponentFactory(t),this.componentTypes.push(c.componentType);let l=nC(c)?void 0:this._injector.get(pl),u=i||c.selector,d=c.create(r,[],u,l),f=d.location.nativeElement,h=d.injector.get(Kw,null);return h?.registerApplication(f),d.onDestroy(()=>{this.detachView(d.hostView),al(this.components,d),h?.unregisterApplication(f)}),this._loadComponent(d),ut(ot.BootstrapComponentEnd,d),d})}tick(){this.zonelessEnabled||(this.dirtyFlags|=1),this._tick()}_tick(){ut(ot.ChangeDetectionStart),this.tracingSnapshot!==null?this.tracingSnapshot.run(qf.CHANGE_DETECTION,this.tickImpl):this.tickImpl()}tickImpl=()=>{if(this._runningTick)throw ut(ot.ChangeDetectionEnd),new Ne(101,!1);let t=Ue(null);try{this._runningTick=!0,this.synchronize()}finally{this._runningTick=!1,this.tracingSnapshot?.dispose(),this.tracingSnapshot=null,Ue(t),this.afterTick.next(),ut(ot.ChangeDetectionEnd)}};synchronize(){this._rendererFactory===null&&!this._injector.destroyed&&(this._rendererFactory=this._injector.get(fl,null,{optional:!0}));let t=0;for(;this.dirtyFlags!==0&&t++<CL;){ut(ot.ChangeDetectionSyncStart);try{this.synchronizeOnce()}finally{ut(ot.ChangeDetectionSyncEnd)}}}synchronizeOnce(){this.dirtyFlags&16&&(this.dirtyFlags&=-17,this.rootEffectScheduler.flush());let t=!1;if(this.dirtyFlags&7){let i=!!(this.dirtyFlags&1);this.dirtyFlags&=-8,this.dirtyFlags|=8;for(let{_lView:r}of this.allViews){if(!i&&!Jc(r))continue;let o=i&&!this.zonelessEnabled?0:1;gw(r,o),t=!0}if(this.dirtyFlags&=-5,this.syncDirtyFlagsWithViews(),this.dirtyFlags&23)return}t||(this._rendererFactory?.begin?.(),this._rendererFactory?.end?.()),this.dirtyFlags&8&&(this.dirtyFlags&=-9,this.afterRenderManager.execute()),this.syncDirtyFlagsWithViews()}syncDirtyFlagsWithViews(){if(this.allViews.some(({_lView:t})=>Jc(t))){this.dirtyFlags|=2;return}else this.dirtyFlags&=-8}attachView(t){let i=t;this._views.push(i),i.attachToAppRef(this)}detachView(t){let i=t;al(this._views,i),i.detachFromAppRef()}_loadComponent(t){this.attachView(t.hostView);try{this.tick()}catch(r){this.internalErrorHandler(r)}this.components.push(t),this._injector.get(eC,[]).forEach(r=>r(t))}ngOnDestroy(){if(!this._destroyed)try{this._destroyListeners.forEach(t=>t()),this._views.slice().forEach(t=>t.destroy())}finally{this._destroyed=!0,this._views=[],this._destroyListeners=[]}}onDestroy(t){return this._destroyListeners.push(t),()=>al(this._destroyListeners,t)}destroy(){if(this._destroyed)throw new Ne(406,!1);let t=this._injector;t.destroy&&!t.destroyed&&t.destroy()}get viewCount(){return this._views.length}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function al(n,e){let t=n.indexOf(e);t>-1&&n.splice(t,1)}function iC(n,e,t){let i=e[Nn],r=e[Se];if(n.loadingState!==$n.NOT_STARTED)return n.loadingPromise??Promise.resolve();let o=El(e,t),s=vL(r,n);n.loadingState=$n.IN_PROGRESS,Df(1,o);let a=n.dependencyResolverFn,c=i.get(nl).add();return a?(n.loadingPromise=Promise.allSettled(a()).then(l=>{let u=!1,d=null,f=[],h=[];for(let g=0;g<l.length;g++){let y=l[g];if(y.status==="fulfilled"){let p=y.value,m=Kr(p)||Kd(p);if(m)f.push(m);else{let x=gy(p);x&&h.push(x)}}else{u=!0,d=y.reason instanceof Error?y.reason:new Error(String(y.reason));break}}if(u){if(n.loadingState=$n.FAILED,n.errorTmplIndex===null){let y="",p=new Ne(-750,y);y_(e,p)}}else{n.loadingState=$n.COMPLETE;let g=s.tView;if(f.length>0){g.directiveRegistry=ZM(g.directiveRegistry,f);let y=f.map(m=>m.type),p=rf(!1,...y);n.providers=p}h.length>0&&(g.pipeRegistry=ZM(g.pipeRegistry,h))}}),n.loadingPromise.finally(()=>{n.loadingPromise=null,c()})):(n.loadingPromise=Promise.resolve().then(()=>{n.loadingPromise=null,n.loadingState=$n.COMPLETE,c()}),n.loadingPromise)}function TL(n,e){return e[Nn].get(Zw,null,{optional:!0})?.behavior!==D_.Manual}function DL(n,e,t){let i=e[Se],r=e[t.index];if(!TL(n,e))return;let o=El(e,t),s=ho(i,t);switch($w(o),s.loadingState){case $n.NOT_STARTED:Cr(Ut.Loading,t,r),iC(s,e,t),s.loadingState===$n.IN_PROGRESS&&QM(s,t,r);break;case $n.IN_PROGRESS:Cr(Ut.Loading,t,r),QM(s,t,r);break;case $n.COMPLETE:Cr(Ut.Complete,t,r);break;case $n.FAILED:Cr(Ut.Error,t,r);break;default:}}function AL(n,e,t){return n===0?eE(e,t):n===2?!eE(e,t):!0}function IL(n){return n!=null&&(n&1)===1}function eE(n,e){let t=n[Nn],i=ho(n[Se],e),r=t_(t),o=IL(i.flags),a=El(n,e)[dL]!==null;return!(o&&a&&r)}function RL(n,e,t,i,r,o,s,a,c,l){let u=Oe(),d=At(),f=n+Dt,h=va(u,d,n,null,0,0),g=u[Nn],y=t_(g);if(d.firstCreatePass){Dr("NgDefer");let w={primaryTmplIndex:e,loadingTmplIndex:i??null,placeholderTmplIndex:r??null,errorTmplIndex:o??null,placeholderBlockConfig:null,loadingBlockConfig:null,dependencyResolverFn:t??null,loadingState:$n.NOT_STARTED,loadingPromise:null,providers:null,hydrateTriggers:null,debug:null,flags:l??0};c?.(d,w,a,s),gL(d,f,w)}let p=u[f];Pw(p,h,u);let m=null,x=null;if(p[no]?.length>0){let w=p[no][0].data;x=w[Kv]??null,m=w[Qv]}let E=[null,Ww.Initial,null,null,null,null,x,m,null,null];mL(u,f,E);let _=null;x!==null&&y&&(_=g.get(LE),_.add(x,{lView:u,tNode:h,lContainer:p}));let M=()=>{$w(E),x!==null&&_?.cleanup([x])};pL(0,E,()=>ky(u,M)),cf(u,M)}function NL(){let n=Oe(),e=rn();if(!AL(0,n,e))return;ho(n[Se],e).loadingTmplIndex===null&&EL(n,e),DL(0,n,e)}function po(n,e,t,i){let r=Oe(),o=oo();if(gi(r,o,e)){let s=At(),a=aa();kF(a,r,n,e,t,i)}return po}var Vv=class{destroy(e){}updateValue(e,t){}swap(e,t){let i=Math.min(e,t),r=Math.max(e,t),o=this.detach(r);if(r-i>1){let s=this.detach(i);this.attach(i,o),this.attach(r,s)}else this.attach(i,o)}move(e,t){this.attach(t,this.detach(e))}};function cv(n,e,t,i,r){return n===t&&Object.is(e,i)?1:Object.is(r(n,e),r(t,i))?-1:0}function PL(n,e,t,i){let r,o,s=0,a=n.length-1,c=void 0;if(Array.isArray(e)){Ue(i);let l=e.length-1;for(Ue(null);s<=a&&s<=l;){let u=n.at(s),d=e[s],f=cv(s,u,s,d,t);if(f!==0){f<0&&n.updateValue(s,d),s++;continue}let h=n.at(a),g=e[l],y=cv(a,h,l,g,t);if(y!==0){y<0&&n.updateValue(a,g),a--,l--;continue}let p=t(s,u),m=t(a,h),x=t(s,d);if(Object.is(x,m)){let E=t(l,g);Object.is(E,p)?(n.swap(s,a),n.updateValue(a,g),l--,a--):n.move(a,s),n.updateValue(s,d),s++;continue}if(r??=new Vf,o??=nE(n,s,a,t),Hv(n,r,s,x))n.updateValue(s,d),s++,a++;else if(o.has(x))r.set(p,n.detach(s)),a--;else{let E=n.create(s,e[s]);n.attach(s,E),s++,a++}}for(;s<=l;)tE(n,r,t,s,e[s]),s++}else if(e!=null){Ue(i);let l=e[Symbol.iterator]();Ue(null);let u=l.next();for(;!u.done&&s<=a;){let d=n.at(s),f=u.value,h=cv(s,d,s,f,t);if(h!==0)h<0&&n.updateValue(s,f),s++,u=l.next();else{r??=new Vf,o??=nE(n,s,a,t);let g=t(s,f);if(Hv(n,r,s,g))n.updateValue(s,f),s++,a++,u=l.next();else if(!o.has(g))n.attach(s,n.create(s,f)),s++,a++,u=l.next();else{let y=t(s,d);r.set(y,n.detach(s)),a--}}}for(;!u.done;)tE(n,r,t,n.length,u.value),u=l.next()}for(;s<=a;)n.destroy(n.detach(a--));r?.forEach(l=>{n.destroy(l)})}function Hv(n,e,t,i){return e!==void 0&&e.has(i)?(n.attach(t,e.get(i)),e.delete(i),!0):!1}function tE(n,e,t,i,r){if(Hv(n,e,i,t(i,r)))n.updateValue(i,r);else{let o=n.create(i,r);n.attach(i,o)}}function nE(n,e,t,i){let r=new Set;for(let o=e;o<=t;o++)r.add(i(o,n.at(o)));return r}var Vf=class{kvMap=new Map;_vMap=void 0;has(e){return this.kvMap.has(e)}delete(e){if(!this.has(e))return!1;let t=this.kvMap.get(e);return this._vMap!==void 0&&this._vMap.has(t)?(this.kvMap.set(e,this._vMap.get(t)),this._vMap.delete(t)):this.kvMap.delete(e),!0}get(e){return this.kvMap.get(e)}set(e,t){if(this.kvMap.has(e)){let i=this.kvMap.get(e);this._vMap===void 0&&(this._vMap=new Map);let r=this._vMap;for(;r.has(i);)i=r.get(i);r.set(i,t)}else this.kvMap.set(e,t)}forEach(e){for(let[t,i]of this.kvMap)if(e(i,t),this._vMap!==void 0){let r=this._vMap;for(;r.has(i);)i=r.get(i),e(i,t)}}};function Ma(n,e,t,i,r,o,s,a){Dr("NgControlFlow");let c=Oe(),l=At(),u=Pn(l.consts,o);return va(c,l,n,e,t,i,r,u,256,s,a),N_}function N_(n,e,t,i,r,o,s,a){Dr("NgControlFlow");let c=Oe(),l=At(),u=Pn(l.consts,o);return va(c,l,n,e,t,i,r,u,512,s,a),N_}function Ea(n,e){Dr("NgControlFlow");let t=Oe(),i=oo(),r=t[i]!==qn?t[i]:-1,o=r!==-1?Hf(t,Dt+r):void 0,s=0;if(gi(t,i,n)){let a=Ue(null);try{if(o!==void 0&&x_(o,s),n!==-1){let c=Dt+n,l=Hf(t,c),u=Wv(t[Se],c),d=Mw(l,u,t),f=bl(t,u,e,{dehydratedView:d});Sl(l,f,s,ga(u,d))}}finally{Ue(a)}}else if(o!==void 0){let a=bw(o,s);a!==void 0&&(a[Wt]=e)}}var zv=class{lContainer;$implicit;$index;constructor(e,t,i){this.lContainer=e,this.$implicit=t,this.$index=i}get $count(){return this.lContainer.length-kt}};function FL(n){return n}function oh(n,e){return e}var Gv=class{hasEmptyBlock;trackByFn;liveCollection;constructor(e,t,i){this.hasEmptyBlock=e,this.trackByFn=t,this.liveCollection=i}};function wa(n,e,t,i,r,o,s,a,c,l,u,d,f){Dr("NgControlFlow");let h=Oe(),g=At(),y=c!==void 0,p=Oe(),m=a?s.bind(p[Kn][Wt]):s,x=new Gv(y,m);p[Dt+n]=x,va(h,g,n+1,e,t,i,r,Pn(g.consts,o),256),y&&va(h,g,n+2,c,l,u,d,Pn(g.consts,f),512)}var jv=class extends Vv{lContainer;hostLView;templateTNode;operationsCounter=void 0;needsIndexUpdate=!1;constructor(e,t,i){super(),this.lContainer=e,this.hostLView=t,this.templateTNode=i}get length(){return this.lContainer.length-kt}at(e){return this.getLView(e)[Wt].$implicit}attach(e,t){let i=t[Qs];this.needsIndexUpdate||=e!==this.length,Sl(this.lContainer,t,e,ga(this.templateTNode,i)),OL(this.lContainer,e)}detach(e){return this.needsIndexUpdate||=e!==this.length-1,LL(this.lContainer,e),kL(this.lContainer,e)}create(e,t){let i=Tv(this.lContainer,this.templateTNode.tView.ssrId);return bl(this.hostLView,this.templateTNode,new zv(this.lContainer,t,e),{dehydratedView:i})}destroy(e){Xf(e[Se],e)}updateValue(e,t){this.getLView(e)[Wt].$implicit=t}reset(){this.needsIndexUpdate=!1}updateIndexes(){if(this.needsIndexUpdate)for(let e=0;e<this.length;e++)this.getLView(e)[Wt].$index=e}getLView(e){return UL(this.lContainer,e)}};function Ca(n){let e=Ue(null),t=Di();try{let i=Oe(),r=i[Se],o=i[t],s=t+1,a=Hf(i,s);if(o.liveCollection===void 0){let l=Wv(r,s);o.liveCollection=new jv(a,i,l)}else o.liveCollection.reset();let c=o.liveCollection;if(PL(c,n,o.trackByFn,e),c.updateIndexes(),o.hasEmptyBlock){let l=oo(),u=c.length===0;if(gi(i,l,u)){let d=t+2,f=Hf(i,d);if(u){let h=Wv(r,d),g=Mw(f,h,i),y=bl(i,h,void 0,{dehydratedView:g});Sl(f,y,0,ga(h,g))}else r.firstUpdatePass&&sO(f),x_(f,0)}}}finally{Ue(e)}}function Hf(n,e){return n[e]}function OL(n,e){if(n.length<=kt)return;let t=kt+e,i=n[t],r=i?i[to]:void 0;if(i&&r&&r.detachedLeaveAnimationFns&&r.detachedLeaveAnimationFns.length>0){let o=i[Nn];hF(o,r),ll.delete(i[Mr]),r.detachedLeaveAnimationFns=void 0}}function LL(n,e){if(n.length<=kt)return;let t=kt+e,i=n[t],r=i?i[to]:void 0;r&&r.leave&&r.leave.size>0&&(r.detachedLeaveAnimationFns=[])}function kL(n,e){return dl(n,e)}function UL(n,e){return bw(n,e)}function Wv(n,e){return ra(n,e)}function rC(n,e,t){let i=Oe(),r=oo();if(gi(i,r,e)){let o=At(),s=aa();lw(s,i,n,e,i[Et],t)}return rC}function $v(n,e,t,i,r){v_(e,n,t,r?"class":"style",i)}function zf(n,e,t,i){let r=Oe(),o=r[Se],s=n+Dt,a=o.firstCreatePass?b_(s,r,2,e,p_,lf(),t,i):o.data[s];if(wr(a)){let c=r[Ci].tracingService;if(c&&c.componentCreate){let l=o.data[a.directiveStart+a.componentOffset];return c.componentCreate(Iw(l),()=>(iE(n,e,r,a,i),zf))}}return iE(n,e,r,a,i),zf}function iE(n,e,t,i,r){if(m_(i,t,n,e,sC),na(i)){let o=t[Se];Zf(o,t,i),n_(o,i,t)}r!=null&&xl(t,i)}function P_(){let n=At(),e=rn(),t=g_(e);return n.firstCreatePass&&S_(n,t),Hy(t)&&zy(),Vy(),t.classesWithoutHost!=null&&HN(t)&&$v(n,t,Oe(),t.classesWithoutHost,!0),t.stylesWithoutHost!=null&&zN(t)&&$v(n,t,Oe(),t.stylesWithoutHost,!1),P_}function oC(n,e,t,i){return zf(n,e,t,i),P_(),oC}function tr(n,e,t,i){let r=Oe(),o=r[Se],s=n+Dt,a=o.firstCreatePass?xO(s,o,2,e,t,i):o.data[s];return m_(a,r,n,e,sC),i!=null&&xl(r,a),tr}function yi(){let n=rn(),e=g_(n);return Hy(e)&&zy(),Vy(),yi}function mo(n,e,t,i){return tr(n,e,t,i),yi(),mo}var sC=(n,e,t,i,r)=>(tl(!0),XE(e[Et],i,Yy()));function F_(n,e,t){let i=Oe(),r=i[Se],o=n+Dt,s=r.firstCreatePass?b_(o,i,8,"ng-container",p_,lf(),e,t):r.data[o];if(m_(s,i,n,"ng-container",BL),na(s)){let a=i[Se];Zf(a,i,s),n_(a,s,i)}return t!=null&&xl(i,s),F_}function O_(){let n=At(),e=rn(),t=g_(e);return n.firstCreatePass&&S_(n,t),O_}function aC(n,e,t){return F_(n,e,t),O_(),aC}var BL=(n,e,t,i,r)=>(tl(!0),VP(e[Et],""));function L_(){return Oe()}function Ta(n,e,t){let i=Oe(),r=oo();if(gi(i,r,e)){let o=At(),s=aa();uw(s,i,n,e,i[Et],t)}return Ta}var il=void 0;function VL(n){let e=Math.floor(Math.abs(n)),t=n.toString().replace(/^[^.]*\.?/,"").length;return e===1&&t===0?1:5}var HL=["en",[["a","p"],["AM","PM"]],[["AM","PM"]],[["S","M","T","W","T","F","S"],["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],["Su","Mo","Tu","We","Th","Fr","Sa"]],il,[["J","F","M","A","M","J","J","A","S","O","N","D"],["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],["January","February","March","April","May","June","July","August","September","October","November","December"]],il,[["B","A"],["BC","AD"],["Before Christ","Anno Domini"]],0,[6,0],["M/d/yy","MMM d, y","MMMM d, y","EEEE, MMMM d, y"],["h:mm\u202Fa","h:mm:ss\u202Fa","h:mm:ss\u202Fa z","h:mm:ss\u202Fa zzzz"],["{1}, {0}",il,il,il],[".",",",";","%","+","-","E","\xD7","\u2030","\u221E","NaN",":"],["#,##0.###","#,##0%","\xA4#,##0.00","#E0"],"USD","$","US Dollar",{},"ltr",VL],lv=Object.create(null);function sh(n){let e=zL(n),t=rE(e);if(t)return t;let i=e.split("-")[0];if(t=rE(i),t)return t;if(i==="en")return HL;throw new Ne(701,!1)}function rE(n){if(!(n in lv)){let e=Xi.ng&&Xi.ng.common&&Xi.ng.common.locales&&Xi.ng.common.locales[n];return e!==void 0&&(lv[n]=e),e}return lv[n]}var ls=(function(n){return n[n.LocaleId=0]="LocaleId",n[n.DayPeriodsFormat=1]="DayPeriodsFormat",n[n.DayPeriodsStandalone=2]="DayPeriodsStandalone",n[n.DaysFormat=3]="DaysFormat",n[n.DaysStandalone=4]="DaysStandalone",n[n.MonthsFormat=5]="MonthsFormat",n[n.MonthsStandalone=6]="MonthsStandalone",n[n.Eras=7]="Eras",n[n.FirstDayOfWeek=8]="FirstDayOfWeek",n[n.WeekendRange=9]="WeekendRange",n[n.DateFormat=10]="DateFormat",n[n.TimeFormat=11]="TimeFormat",n[n.DateTimeFormat=12]="DateTimeFormat",n[n.NumberSymbols=13]="NumberSymbols",n[n.NumberFormats=14]="NumberFormats",n[n.CurrencyCode=15]="CurrencyCode",n[n.CurrencySymbol=16]="CurrencySymbol",n[n.CurrencyName=17]="CurrencyName",n[n.Currencies=18]="Currencies",n[n.Directionality=19]="Directionality",n[n.PluralCase=20]="PluralCase",n[n.ExtraData=21]="ExtraData",n})(ls||{});function zL(n){return n.toLowerCase().replace(/_/g,"-")}var wl="en-US";var GL=wl;function cC(n){typeof n=="string"&&(GL=n.toLowerCase().replace(/_/g,"-"))}function Ir(n,e,t){let i=Oe(),r=At(),o=rn();return lC(r,i,i[Et],o,n,e,t),Ir}function Cl(n,e,t){let i=Oe(),r=At(),o=rn();return(o.type&3||t)&&Dw(o,r,i,t,i[Et],n,e,Tf(o,i,e)),Cl}function lC(n,e,t,i,r,o,s){let a=!0,c=null;if((i.type&3||s)&&(c??=Tf(i,e,o),Dw(i,n,e,s,t,r,o,c)&&(a=!1)),a){let l=i.outputs?.[r],u=i.hostDirectiveOutputs?.[r];if(u&&u.length)for(let d=0;d<u.length;d+=2){let f=u[d],h=u[d+1];c??=Tf(i,e,o),WM(i,e,f,h,r,c)}if(l&&l.length)for(let d of l)c??=Tf(i,e,o),WM(i,e,d,r,r,c)}}function ei(n=1){return hM(n)}function uC(n,e,t){return Ow(n,e,t),uC}function jL(n){let e=Oe(),t=At(),i=ff();el(i+1);let r=w_(t,i);if(n.dirty&&qS(e)===((r.metadata.flags&2)===2)){if(r.matches===null)n.reset([]);else{let o=Lw(e,i);n.reset(o,ME),n.notifyOnChanges()}return!0}return!1}function WL(){return E_(Oe(),ff())}function dC(n,e,t,i){return $O(n,Ow(e,t,i)),dC}function $L(n=1){el(ff()+n)}function qL(n){let e=nM();return Py(e,Dt+n)}function Sf(n,e){return n<<17|e<<2}function os(n){return n>>17&32767}function XL(n){return(n&2)==2}function YL(n,e){return n&131071|e<<17}function qv(n){return n|2}function _a(n){return(n&131068)>>2}function uv(n,e){return n&-131069|e<<2}function ZL(n){return(n&1)===1}function Xv(n){return n|1}function JL(n,e,t,i,r,o){let s=o?e.classBindings:e.styleBindings,a=os(s),c=_a(s);n[i]=t;let l=!1,u;if(Array.isArray(t)){let d=t;u=d[1],(u===null||Js(d,u)>0)&&(l=!0)}else u=t;if(r)if(c!==0){let f=os(n[a+1]);n[i+1]=Sf(f,a),f!==0&&(n[f+1]=uv(n[f+1],i)),n[a+1]=YL(n[a+1],i)}else n[i+1]=Sf(a,0),a!==0&&(n[a+1]=uv(n[a+1],i)),a=i;else n[i+1]=Sf(c,0),a===0?a=i:n[c+1]=uv(n[c+1],i),c=i;l&&(n[i+1]=qv(n[i+1])),oE(n,u,i,!0),oE(n,u,i,!1),KL(e,u,n,i,o),s=Sf(a,c),o?e.classBindings=s:e.styleBindings=s}function KL(n,e,t,i,r){let o=r?n.residualClasses:n.residualStyles;o!=null&&typeof e=="string"&&Js(o,e)>=0&&(t[i+1]=Xv(t[i+1]))}function oE(n,e,t,i){let r=n[t+1],o=e===null,s=i?os(r):_a(r),a=!1;for(;s!==0&&(a===!1||o);){let c=n[s],l=n[s+1];QL(c,e)&&(a=!0,n[s+1]=i?Xv(l):qv(l)),s=i?os(l):_a(l)}a&&(n[t+1]=i?qv(r):Xv(r))}function QL(n,e){return n===null||e==null||(Array.isArray(n)?n[1]:n)===e?!0:Array.isArray(n)&&typeof e=="string"?Js(n,e)>=0:!1}var Ii={textEnd:0,key:0,keyEnd:0,value:0,valueEnd:0};function e2(n){return n.substring(Ii.key,Ii.keyEnd)}function t2(n){return n2(n),fC(n,hC(n,0,Ii.textEnd))}function fC(n,e){let t=Ii.textEnd;return t===e?-1:(e=Ii.keyEnd=i2(n,Ii.key=e,t),hC(n,e,t))}function n2(n){Ii.key=0,Ii.keyEnd=0,Ii.value=0,Ii.valueEnd=0,Ii.textEnd=n.length}function hC(n,e,t){for(;e<t&&n.charCodeAt(e)<=32;)e++;return e}function i2(n,e,t){for(;e<t&&n.charCodeAt(e)>32;)e++;return e}function us(n,e,t){return pC(n,e,t,!1),us}function Da(n,e){return pC(n,e,null,!0),Da}function r2(n){s2(f2,o2,n,!0)}function o2(n,e){for(let t=t2(e);t>=0;t=fC(e,t))tf(n,e2(e),!0)}function pC(n,e,t,i){let r=Oe(),o=At(),s=uf(2);if(o.firstUpdatePass&&gC(o,n,s,i),e!==qn&&gi(r,s,e)){let a=o.data[Di()];yC(o,a,r,r[Et],n,r[s+1]=p2(e,t),i,s)}}function s2(n,e,t,i){let r=At(),o=uf(2);r.firstUpdatePass&&gC(r,null,o,i);let s=Oe();if(t!==qn&&gi(s,o,t)){let a=r.data[Di()];if(vC(a,i)&&!mC(r,o)){let c=i?a.classesWithoutHost:a.stylesWithoutHost;c!==null&&(t=Yd(c,t||"")),$v(r,a,s,t,i)}else h2(r,a,s,s[Et],s[o+1],s[o+1]=d2(n,e,t),i,o)}}function mC(n,e){return e>=n.expandoStartIndex}function gC(n,e,t,i){let r=n.data;if(r[t+1]===null){let o=r[Di()],s=mC(n,t);vC(o,i)&&e===null&&!s&&(e=!1),e=a2(r,o,e,i),JL(r,o,e,t,s,i)}}function a2(n,e,t,i){let r=lM(n),o=i?e.residualClasses:e.residualStyles;if(r===null)(i?e.classBindings:e.styleBindings)===0&&(t=dv(null,n,e,t,i),t=gl(t,e.attrs,i),o=null);else{let s=e.directiveStylingLast;if(s===-1||n[s]!==r)if(t=dv(r,n,e,t,i),o===null){let c=c2(n,e,i);c!==void 0&&Array.isArray(c)&&(c=dv(null,n,e,c[1],i),c=gl(c,e.attrs,i),l2(n,e,i,c))}else o=u2(n,e,i)}return o!==void 0&&(i?e.residualClasses=o:e.residualStyles=o),t}function c2(n,e,t){let i=t?e.classBindings:e.styleBindings;if(_a(i)!==0)return n[os(i)]}function l2(n,e,t,i){let r=t?e.classBindings:e.styleBindings;n[os(r)]=i}function u2(n,e,t){let i,r=e.directiveEnd;for(let o=1+e.directiveStylingLast;o<r;o++){let s=n[o].hostAttrs;i=gl(i,s,t)}return gl(i,e.attrs,t)}function dv(n,e,t,i,r){let o=null,s=t.directiveEnd,a=t.directiveStylingLast;for(a===-1?a=t.directiveStart:a++;a<s&&(o=e[a],i=gl(i,o.hostAttrs,r),o!==n);)a++;return n!==null&&(t.directiveStylingLast=a),i}function gl(n,e,t){let i=t?1:2,r=-1;if(e!==null)for(let o=0;o<e.length;o++){let s=e[o];typeof s=="number"?r=s:r===i&&(Array.isArray(n)||(n=n===void 0?[]:["",n]),tf(n,s,t?!0:e[++o]))}return n===void 0?null:n}function d2(n,e,t){if(t==null||t==="")return xn;let i=[],r=Wf(t);if(Array.isArray(r))for(let o=0;o<r.length;o++)n(i,r[o],!0);else if(r instanceof Set)for(let o of r)n(i,o,!0);else if(typeof r=="object")for(let o in r)r.hasOwnProperty(o)&&n(i,o,r[o]);else typeof r=="string"&&e(i,r);return i}function f2(n,e,t){let i=String(e);i!==""&&!i.includes(" ")&&tf(n,i,t)}function h2(n,e,t,i,r,o,s,a){r===qn&&(r=xn);let c=0,l=0,u=0<r.length?r[0]:null,d=0<o.length?o[0]:null;for(;u!==null||d!==null;){let f=c<r.length?r[c+1]:void 0,h=l<o.length?o[l+1]:void 0,g=null,y;u===d?(c+=2,l+=2,f!==h&&(g=d,y=h)):d===null||u!==null&&u<d?(c+=2,g=u):(l+=2,g=d,y=h),g!==null&&yC(n,e,t,i,g,y,s,a),u=c<r.length?r[c]:null,d=l<o.length?o[l]:null}}function yC(n,e,t,i,r,o,s,a){if(!(e.type&3))return;let c=n.data,l=c[a+1],u=ZL(l)?sE(c,e,t,r,_a(l),s):void 0;if(!Gf(u)){Gf(o)||XL(l)&&(o=sE(c,null,t,r,a,s));let d=Ny(Di(),t);DF(i,s,d,r,o)}}function sE(n,e,t,i,r,o){let s=e===null,a;for(;r>0;){let c=n[r],l=Array.isArray(c),u=l?c[1]:c,d=u===null,f=t[r+1];f===qn&&(f=d?xn:void 0);let h=d?nf(f,i):u===i?f:void 0;if(l&&!Gf(h)&&(h=nf(c,i)),Gf(h)&&(a=h,s))return a;let g=n[r+1];r=s?os(g):_a(g)}if(e!==null){let c=o?e.residualClasses:e.residualStyles;c!=null&&(a=nf(c,i))}return a}function Gf(n){return n!==void 0}function p2(n,e){return n==null||n===""||(typeof e=="string"?n=n+e:typeof n=="object"&&(n=Xd(Wf(n)))),n}function vC(n,e){return(n.flags&(e?8:16))!==0}function Tl(n,e=""){let t=Oe(),i=At(),r=n+Dt,o=i.firstCreatePass?Ml(i,r,1,e,null):i.data[r],s=m2(i,t,o,e);t[r]=s,mf()&&f_(i,t,s,o),sa(o,!1)}var m2=(n,e,t,i)=>(tl(!0),UP(e[Et],i));function _C(n,e,t,i=""){return gi(n,oo(),t)?e+Zs(t)+i:qn}function xC(n,e,t,i,r,o=""){let s=rM(),a=SO(n,s,t,r);return uf(2),a?e+Zs(t)+i+Zs(r)+o:qn}function Aa(n){return k_("",n),Aa}function k_(n,e,t){let i=Oe(),r=_C(i,n,e,t);return r!==qn&&SC(i,Di(),r),k_}function bC(n,e,t,i,r){let o=Oe(),s=xC(o,n,e,t,i,r);return s!==qn&&SC(o,Di(),s),bC}function SC(n,e,t){let i=Ny(e,n);BP(n[Et],i,t)}function MC(n,e,t){I_(e)&&(e=e());let i=Oe(),r=oo();if(gi(i,r,e)){let o=At(),s=aa();lw(s,i,n,e,i[Et],t)}return MC}function g2(n,e){let t=I_(n);return t&&n.set(e),t}function EC(n,e){let t=Oe(),i=At(),r=rn();return lC(i,t,t[Et],r,n,e),EC}function y2(n,e,t=""){return _C(Oe(),n,e,t)}function v2(n,e,t,i,r=""){return xC(Oe(),n,e,t,i,r)}function aE(n,e,t){let i=At();i.firstCreatePass&&wC(e,i.data,i.blueprint,Ji(n),t)}function wC(n,e,t,i,r){if(n=cn(n),Array.isArray(n))for(let o=0;o<n.length;o++)wC(n[o],e,t,i,r);else{let o=At(),s=Oe(),a=rn(),c=$o(n)?n:cn(n.provide),l=Ty(n),u=a.providerIndexes&1048575,d=a.directiveStart,f=a.providerIndexes>>20;if($o(n)||!n.multi){let h=new is(l,r,nt,null),g=hv(c,e,r?u:u+f,d);g===-1?(mv(Pf(a,s),o,c),fv(o,n,e.length),e.push(c),a.directiveStart++,a.directiveEnd++,r&&(a.providerIndexes+=1048576),t.push(h),s.push(h)):(t[g]=h,s[g]=h)}else{let h=hv(c,e,u+f,d),g=hv(c,e,u,u+f),y=h>=0&&t[h],p=g>=0&&t[g];if(r&&!p||!r&&!y){mv(Pf(a,s),o,c);let m=b2(r?x2:_2,t.length,r,i,l,n);!r&&p&&(t[g].providerFactory=m),fv(o,n,e.length,0),e.push(c),a.directiveStart++,a.directiveEnd++,r&&(a.providerIndexes+=1048576),t.push(m),s.push(m)}else{let m=CC(t[r?g:h],l,!r&&i);fv(o,n,h>-1?h:g,m)}!r&&i&&p&&t[g].componentProviders++}}}function fv(n,e,t,i){let r=$o(e),o=zS(e);if(r||o){let c=(o?cn(e.useClass):e).prototype.ngOnDestroy;if(c){let l=n.destroyHooks||(n.destroyHooks=[]);if(!r&&e.multi){let u=l.indexOf(t);u===-1?l.push(t,[i,c]):l[u+1].push(i,c)}else l.push(t,c)}}}function CC(n,e,t){return t&&n.componentProviders++,n.multi.push(e)-1}function hv(n,e,t,i){for(let r=t;r<i;r++)if(e[r]===n)return r;return-1}function _2(n,e,t,i,r){return Yv(this.multi,[])}function x2(n,e,t,i,r){let o=this.multi,s;if(this.providerFactory){let a=this.providerFactory.componentProviders,c=cl(i,i[Se],this.providerFactory.index,r);s=c.slice(0,a),Yv(o,s);for(let l=a;l<c.length;l++)s.push(c[l])}else s=[],Yv(o,s);return s}function Yv(n,e){for(let t=0;t<n.length;t++){let i=n[t];e.push(i())}return e}function b2(n,e,t,i,r,o){let s=new is(n,t,nt,null);return s.multi=[],s.index=e,s.componentProviders=0,CC(s,r,i&&!t),s}function ds(n,e){return t=>{t.providersResolver=(i,r)=>aE(i,r?r(n):n,!1),e&&(t.viewProvidersResolver=(i,r)=>aE(i,r?r(e):e,!0))}}function S2(n,e){let t=n[e];return t===qn?void 0:t}function M2(n,e,t,i,r,o){let s=e+t;return gi(n,s,r)?bO(n,s+1,o?i.call(o,r):i(r)):S2(n,s+1)}function E2(n,e){let t=At(),i,r=n+Dt;t.firstCreatePass?(i=w2(e,t.pipeRegistry),t.data[r]=i,i.onDestroy&&(t.destroyHooks??=[]).push(r,i.onDestroy)):i=t.data[r];let o=i.factory||(i.factory=Yr(i.type,!0)),s,a=In(nt);try{let c=Nf(!1),l=o();return Nf(c),Fy(t,Oe(),r,l),l}finally{In(a)}}function w2(n,e){if(e)for(let t=e.length-1;t>=0;t--){let i=e[t];if(n===i.name)return i}}function C2(n,e,t){let i=n+Dt,r=Oe(),o=Py(r,i);return T2(r,i)?M2(r,iM(),e,o.transform,t,o):o.transform(t)}function T2(n,e){return n[Se].data[e].pure}function D2(n,e){return Kf(n,e)}var TC=(()=>{class n{applicationErrorHandler=be(Ki);appRef=be(cs);taskService=be(lo);ngZone=be(jt);zonelessEnabled=be(ca);tracing=be(fo,{optional:!0});zoneIsDefined=typeof Zone<"u"&&!!Zone.root.run;schedulerTickApplyArgs=[{data:{__scheduler_tick__:!0}}];subscriptions=new an;angularZoneId=this.zoneIsDefined?this.ngZone._inner?.get(Hc):null;scheduleInRootZone=!this.zonelessEnabled&&this.zoneIsDefined&&(be(yf,{optional:!0})??!1);cancelScheduledCallback=null;useMicrotaskScheduler=!1;runningTick=!1;pendingRenderTaskId=null;constructor(){this.subscriptions.add(this.appRef.afterTick.subscribe(()=>{let t=this.taskService.add();if(!this.runningTick&&(this.cleanup(),!this.zonelessEnabled||this.appRef.includeAllTestViews)){this.taskService.remove(t);return}this.switchToMicrotaskScheduler(),this.taskService.remove(t)})),this.subscriptions.add(this.ngZone.onUnstable.subscribe(()=>{this.runningTick||this.cleanup()}))}switchToMicrotaskScheduler(){this.ngZone.runOutsideAngular(()=>{let t=this.taskService.add();this.useMicrotaskScheduler=!0,queueMicrotask(()=>{this.useMicrotaskScheduler=!1,this.taskService.remove(t)})})}notify(t){if(!this.zonelessEnabled&&t===5)return;switch(t){case 0:{this.appRef.dirtyFlags|=2;break}case 3:case 2:case 4:case 5:case 1:{this.appRef.dirtyFlags|=4;break}case 6:{this.appRef.dirtyFlags|=2;break}case 12:{this.appRef.dirtyFlags|=16;break}case 13:{this.appRef.dirtyFlags|=2;break}case 11:break;default:this.appRef.dirtyFlags|=8}if(this.appRef.tracingSnapshot=this.tracing?.snapshot(this.appRef.tracingSnapshot)??null,!this.shouldScheduleTick())return;let i=this.useMicrotaskScheduler?_M:Jy;this.pendingRenderTaskId=this.taskService.add(),this.scheduleInRootZone?this.cancelScheduledCallback=Zone.root.run(()=>i(()=>this.tick())):this.cancelScheduledCallback=this.ngZone.runOutsideAngular(()=>i(()=>this.tick()))}shouldScheduleTick(){return!(this.appRef.destroyed||this.pendingRenderTaskId!==null||this.runningTick||this.appRef._runningTick||!this.zonelessEnabled&&this.zoneIsDefined&&Zone.current.get(Hc+this.angularZoneId))}tick(){if(this.runningTick||this.appRef.destroyed)return;if(this.appRef.dirtyFlags===0){this.cleanup();return}!this.zonelessEnabled&&this.appRef.dirtyFlags&7&&(this.appRef.dirtyFlags|=1);let t=this.taskService.add();try{this.ngZone.run(()=>{this.runningTick=!0,this.appRef._tick()},void 0,this.schedulerTickApplyArgs)}catch(i){this.applicationErrorHandler(i)}finally{this.taskService.remove(t),this.cleanup()}}ngOnDestroy(){this.subscriptions.unsubscribe(),this.cleanup()}cleanup(){if(this.runningTick=!1,this.cancelScheduledCallback?.(),this.cancelScheduledCallback=null,this.pendingRenderTaskId!==null){let t=this.pendingRenderTaskId;this.pendingRenderTaskId=null,this.taskService.remove(t)}}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function DC(){return[{provide:Sr,useExisting:TC},{provide:jt,useClass:zc},{provide:ca,useValue:!0}]}function A2(){return typeof $localize<"u"&&$localize.locale||wl}var Dl=new He("",{factory:()=>be(Dl,{optional:!0,skipSelf:!0})||A2()});function Ri(n){return DS(n)}function Al(n,e){return Lc(n,e?.equal)}function AC(n,e){return Uw(e)}function U2(n,e){return Bw(e)}var xK=(AC.required=U2,AC);var B2=(()=>{class n{zone=be(jt);changeDetectionScheduler=be(Sr);applicationRef=be(cs);applicationErrorHandler=be(Ki);_onMicrotaskEmptySubscription;initialize(){this._onMicrotaskEmptySubscription||(this._onMicrotaskEmptySubscription=this.zone.onMicrotaskEmpty.subscribe({next:()=>{this.changeDetectionScheduler.runningTick||this.zone.run(()=>{try{this.applicationRef.dirtyFlags|=1,this.applicationRef._tick()}catch(t){this.applicationErrorHandler(t)}})}}))}ngOnDestroy(){this._onMicrotaskEmptySubscription?.unsubscribe()}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),V2=new He("",{factory:()=>!1});function H2({ngZoneFactory:n,scheduleInRootZone:e}){return n??=()=>new jt(at(Re({},RC()),{scheduleInRootZone:e})),[{provide:ca,useValue:!1},{provide:jt,useFactory:n},{provide:Zo,multi:!0,useFactory:()=>{let t=be(B2,{optional:!0});return()=>t.initialize()}},{provide:Zo,multi:!0,useFactory:()=>{let t=be(z2);return()=>{t.initialize()}}},{provide:yf,useValue:e??Zy}]}function bK(n){let e=n?.scheduleInRootZone,t=H2({ngZoneFactory:()=>{let i=RC(n);return i.scheduleInRootZone=e,i.shouldCoalesceEventChangeDetection&&Dr("NgZone_CoalesceEvent"),new jt(i)},scheduleInRootZone:e});return qc([{provide:V2,useValue:!0},t])}function RC(n){return{enableLongStackTrace:!1,shouldCoalesceEventChangeDetection:n?.eventCoalescing??!1,shouldCoalesceRunChangeDetection:n?.runCoalescing??!1}}var z2=(()=>{class n{subscription=new an;initialized=!1;zone=be(jt);pendingTasks=be(lo);initialize(){if(this.initialized)return;this.initialized=!0;let t=null;!this.zone.isStable&&!this.zone.hasPendingMacrotasks&&!this.zone.hasPendingMicrotasks&&(t=this.pendingTasks.add()),this.zone.runOutsideAngular(()=>{this.subscription.add(this.zone.onStable.subscribe(()=>{jt.assertNotInAngularZone(),queueMicrotask(()=>{t!==null&&!this.zone.hasPendingMacrotasks&&!this.zone.hasPendingMicrotasks&&(this.pendingTasks.remove(t),t=null)})}))}),this.subscription.add(this.zone.onUnstable.subscribe(()=>{jt.assertInAngularZone(),t??=this.pendingTasks.add()}))}ngOnDestroy(){this.subscription.unsubscribe()}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();var U_=new He(""),G2=new He("");function Il(n){return!n.moduleRef}function j2(n){let e=Il(n)?n.r3Injector:n.moduleRef.injector,t=e.get(jt);return t.run(()=>{Il(n)?n.r3Injector.resolveInjectorInitializers():n.moduleRef.resolveInjectorInitializers();let i=e.get(Ki),r;if(t.runOutsideAngular(()=>{r=t.onError.subscribe({next:i})}),Il(n)){let o=()=>e.destroy(),s=n.platformInjector.get(U_);s.add(o),e.onDestroy(()=>{r.unsubscribe(),s.delete(o)})}else{let o=()=>n.moduleRef.destroy(),s=n.platformInjector.get(U_);s.add(o),n.moduleRef.onDestroy(()=>{al(n.allPlatformModules,n.moduleRef),r.unsubscribe(),s.delete(o)})}return $2(i,t,()=>{let o=e.get(lo),s=o.add(),a=e.get(R_);return a.runInitializers(),a.donePromise.then(()=>{let c=e.get(Dl,wl);if(cC(c||wl),!e.get(G2,!0))return Il(n)?e.get(cs):(n.allPlatformModules.push(n.moduleRef),n.moduleRef);if(Il(n)){let u=e.get(cs);return n.rootComponent!==void 0&&u.bootstrap(n.rootComponent),u}else return W2?.(n.moduleRef,n.allPlatformModules),n.moduleRef}).finally(()=>{o.remove(s)})})})}var W2;function $2(n,e,t){try{let i=t();return as(i)?i.catch(r=>{throw e.runOutsideAngular(()=>n(r)),r}):i}catch(i){throw e.runOutsideAngular(()=>n(i)),i}}var ah=null;function q2(n=[],e){return Ei.create({name:e,providers:[{provide:Cy,useValue:"platform"},{provide:U_,useValue:new Set([()=>ah=null])},...n]})}function X2(n=[]){if(ah)return ah;let e=q2(n);return ah=e,tC(),Y2(e),e}function Y2(n){let e=n.get(IE,null);Ks(n,()=>{e?.forEach(t=>t())})}function SK(){return!1}var Z2=1e4;var MK=Z2-1e3;var fs=(()=>{class n{static __NG_ELEMENT_ID__=J2}return n})();function J2(n){return K2(rn(),Oe(),(n&16)===16)}function K2(n,e,t){if(wr(n)&&!t){let i=mi(n.index,e);return new uo(i,i)}else if(n.type&175){let i=e[Kn];return new uo(i,e)}return null}var B_=class{supports(e){return e instanceof Map||M_(e)}create(){return new V_}},V_=class{_records=new Map;_mapHead=null;_appendAfter=null;_previousMapHead=null;_changesHead=null;_changesTail=null;_additionsHead=null;_additionsTail=null;_removalsHead=null;get isDirty(){return this._additionsHead!==null||this._changesHead!==null||this._removalsHead!==null}forEachItem(e){let t;for(t=this._mapHead;t!==null;t=t._next)e(t)}forEachPreviousItem(e){let t;for(t=this._previousMapHead;t!==null;t=t._nextPrevious)e(t)}forEachChangedItem(e){let t;for(t=this._changesHead;t!==null;t=t._nextChanged)e(t)}forEachAddedItem(e){let t;for(t=this._additionsHead;t!==null;t=t._nextAdded)e(t)}forEachRemovedItem(e){let t;for(t=this._removalsHead;t!==null;t=t._nextRemoved)e(t)}diff(e){if(!e)e=new Map;else if(!(e instanceof Map||M_(e)))throw new Ne(900,!1);return this.check(e)?this:null}check(e){this._reset();let t=this._mapHead;if(this._appendAfter=null,this._forEach(e,(i,r)=>{if(t&&t.key===r)this._maybeAddToChanges(t,i),this._appendAfter=t,t=t._next;else{let o=this._getOrCreateRecordForKey(r,i);t=this._insertBeforeOrAppend(t,o)}}),t){t._prev&&(t._prev._next=null),this._removalsHead=t;for(let i=t;i!==null;i=i._nextRemoved)i===this._mapHead&&(this._mapHead=null),this._records.delete(i.key),i._nextRemoved=i._next,i.previousValue=i.currentValue,i.currentValue=null,i._prev=null,i._next=null}return this._changesTail&&(this._changesTail._nextChanged=null),this._additionsTail&&(this._additionsTail._nextAdded=null),this.isDirty}_insertBeforeOrAppend(e,t){if(e){let i=e._prev;return t._next=e,t._prev=i,e._prev=t,i&&(i._next=t),e===this._mapHead&&(this._mapHead=t),this._appendAfter=e,e}return this._appendAfter?(this._appendAfter._next=t,t._prev=this._appendAfter):this._mapHead=t,this._appendAfter=t,null}_getOrCreateRecordForKey(e,t){if(this._records.has(e)){let r=this._records.get(e);this._maybeAddToChanges(r,t);let o=r._prev,s=r._next;return o&&(o._next=s),s&&(s._prev=o),r._next=null,r._prev=null,r}let i=new H_(e);return this._records.set(e,i),i.currentValue=t,this._addToAdditions(i),i}_reset(){if(this.isDirty){let e;for(this._previousMapHead=this._mapHead,e=this._previousMapHead;e!==null;e=e._next)e._nextPrevious=e._next;for(e=this._changesHead;e!==null;e=e._nextChanged)e.previousValue=e.currentValue;for(e=this._additionsHead;e!=null;e=e._nextAdded)e.previousValue=e.currentValue;this._changesHead=this._changesTail=null,this._additionsHead=this._additionsTail=null,this._removalsHead=null}}_maybeAddToChanges(e,t){Object.is(t,e.currentValue)||(e.previousValue=e.currentValue,e.currentValue=t,this._addToChanges(e))}_addToAdditions(e){this._additionsHead===null?this._additionsHead=this._additionsTail=e:(this._additionsTail._nextAdded=e,this._additionsTail=e)}_addToChanges(e){this._changesHead===null?this._changesHead=this._changesTail=e:(this._changesTail._nextChanged=e,this._changesTail=e)}_forEach(e,t){e instanceof Map?e.forEach(t):Object.keys(e).forEach(i=>t(e[i],i))}},H_=class{key;previousValue=null;currentValue=null;_nextPrevious=null;_next=null;_prev=null;_nextAdded=null;_nextRemoved=null;_nextChanged=null;constructor(e){this.key=e}};function IC(){return new z_([new B_])}var z_=(()=>{class n{static \u0275prov=Pe({token:n,providedIn:"root",factory:IC});factories;constructor(t){this.factories=t}static create(t,i){if(i){let r=i.factories.slice();t=t.concat(r)}return new n(t)}static extend(t){return{provide:n,useFactory:()=>{let i=be(n,{optional:!0,skipSelf:!0});return n.create(t,i||IC())}}}find(t){let i=this.factories.find(r=>r.supports(t));if(i)return i;throw new Ne(901,!1)}}return n})();function EK(n){let{rootComponent:e,appProviders:t,platformProviders:i,platformRef:r}=n;ut(ot.BootstrapApplicationStart);try{let o=r?.injector??X2(i),s=[DC(),bM,...t||[]],a=new ml({providers:s,parent:o,debugName:"",runEnvironmentInitializers:!1});return j2({r3Injector:a.injector,platformInjector:o,rootComponent:e})}catch(o){return Promise.reject(o)}finally{ut(ot.BootstrapApplicationEnd)}}function NC(n){return typeof n=="boolean"?n:n!=null&&n!=="false"}var PC=null;function hs(){return PC}function Q2(n){PC??=n}var G_=class{},ch=(()=>{class n{historyGo(t){throw new Error("")}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:()=>be(FC),providedIn:"platform"})}return n})();var FC=(()=>{class n extends ch{_location;_history;_doc=be(ao);constructor(){super(),this._location=window.location,this._history=window.history}getBaseHrefFromDOM(){return hs().getBaseHref(this._doc)}onPopState(t){let i=hs().getGlobalEventTarget(this._doc,"window");return i.addEventListener("popstate",t,!1),()=>i.removeEventListener("popstate",t)}onHashChange(t){let i=hs().getGlobalEventTarget(this._doc,"window");return i.addEventListener("hashchange",t,!1),()=>i.removeEventListener("hashchange",t)}get href(){return this._location.href}get protocol(){return this._location.protocol}get hostname(){return this._location.hostname}get port(){return this._location.port}get pathname(){return this._location.pathname}get search(){return this._location.search}get hash(){return this._location.hash}set pathname(t){this._location.pathname=t}pushState(t,i,r){this._history.pushState(t,i,r)}replaceState(t,i,r){this._history.replaceState(t,i,r)}forward(){this._history.forward()}back(){this._history.back()}historyGo(t=0){this._history.go(t)}getState(){return this._history.state}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:()=>new n,providedIn:"platform"})}return n})();var Y_=(function(n){return n[n.Decimal=0]="Decimal",n[n.Percent=1]="Percent",n[n.Currency=2]="Currency",n[n.Scientific=3]="Scientific",n})(Y_||{});var nr={Decimal:0,Group:1,List:2,PercentSign:3,PlusSign:4,MinusSign:5,Exponential:6,SuperscriptingExponent:7,PerMille:8,Infinity:9,NaN:10,TimeSeparator:11,CurrencyDecimal:12,CurrencyGroup:13};function Ia(n,e){let t=sh(n),i=t[ls.NumberSymbols][e];if(typeof i>"u"){if(e===nr.CurrencyDecimal)return t[ls.NumberSymbols][nr.Decimal];if(e===nr.CurrencyGroup)return t[ls.NumberSymbols][nr.Group]}return i}function kC(n,e){return sh(n)[ls.NumberFormats][e]}var ek=/^(\d+)?\.((\d+)(-(\d+))?)?$/,OC=22,lh=".",Rl="0",tk=";",nk=",",j_="#";function ik(n,e,t,i,r,o,s=!1){let a="",c=!1;if(!isFinite(n))a=Ia(t,nr.Infinity);else{let l=sk(n);s&&(l=ok(l));let u=e.minInt,d=e.minFrac,f=e.maxFrac;if(o){let x=o.match(ek);if(x===null)throw new Ne(2306,!1);let E=x[1],_=x[3],M=x[5];E!=null&&(u=W_(E)),_!=null&&(d=W_(_)),M!=null?f=W_(M):_!=null&&d>f&&(f=d);let w=100;if(u>w||d>w||f>w)throw new Ne(2306,!1)}ak(l,d,f);let h=l.digits,g=l.integerLen,y=l.exponent,p=[];for(c=h.every(x=>!x);g<u;g++)h.unshift(0);for(;g<0;g++)h.unshift(0);g>0?p=h.splice(g,h.length):(p=h,h=[0]);let m=[];for(h.length>=e.lgSize&&m.unshift(h.splice(-e.lgSize,h.length).join(""));h.length>e.gSize;)m.unshift(h.splice(-e.gSize,h.length).join(""));h.length&&m.unshift(h.join("")),a=m.join(Ia(t,i)),p.length&&(a+=Ia(t,r)+p.join("")),y&&(a+=Ia(t,nr.Exponential)+"+"+y)}return n<0&&!c?a=e.negPre+a+e.negSuf:a=e.posPre+a+e.posSuf,a}function UC(n,e,t){let i=kC(e,Y_.Decimal),r=rk(i,Ia(e,nr.MinusSign));return ik(n,r,e,nr.Group,nr.Decimal,t)}function rk(n,e="-"){let t={minInt:1,minFrac:0,maxFrac:0,posPre:"",posSuf:"",negPre:"",negSuf:"",gSize:0,lgSize:0},i=n.split(tk),r=i[0],o=i[1],s=r.indexOf(lh)!==-1?r.split(lh):[r.substring(0,r.lastIndexOf(Rl)+1),r.substring(r.lastIndexOf(Rl)+1)],a=s[0],c=s[1]||"";t.posPre=a.substring(0,a.indexOf(j_));for(let u=0;u<c.length;u++){let d=c.charAt(u);d===Rl?t.minFrac=t.maxFrac=u+1:d===j_?t.maxFrac=u+1:t.posSuf+=d}let l=a.split(nk);if(t.gSize=l[1]?l[1].length:0,t.lgSize=l[2]||l[1]?(l[2]||l[1]).length:0,o){let u=r.length-t.posPre.length-t.posSuf.length,d=o.indexOf(j_);t.negPre=o.substring(0,d).replace(/'/g,""),t.negSuf=o.slice(d+u).replace(/'/g,"")}else t.negPre=e+t.posPre,t.negSuf=t.posSuf;return t}function ok(n){if(n.digits[0]===0)return n;let e=n.digits.length-n.integerLen;return n.exponent?n.exponent+=2:(e===0?n.digits.push(0,0):e===1&&n.digits.push(0),n.integerLen+=2),n}function sk(n){let e=Math.abs(n)+"",t=0,i,r,o,s,a;for((r=e.indexOf(lh))>-1&&(e=e.replace(lh,"")),(o=e.search(/e/i))>0?(r<0&&(r=o),r+=+e.slice(o+1),e=e.substring(0,o)):r<0&&(r=e.length),o=0;e.charAt(o)===Rl;o++);if(o===(a=e.length))i=[0],r=1;else{for(a--;e.charAt(a)===Rl;)a--;for(r-=o,i=[],s=0;o<=a;o++,s++)i[s]=Number(e.charAt(o))}return r>OC&&(i=i.splice(0,OC-1),t=r-1,r=1),{digits:i,exponent:t,integerLen:r}}function ak(n,e,t){if(e>t)throw new Ne(2307,!1);let i=n.digits,r=i.length-n.integerLen,o=Math.min(Math.max(e,r),t),s=o+n.integerLen,a=i[s];if(s>0){i.splice(Math.max(n.integerLen,s));for(let d=s;d<i.length;d++)i[d]=0}else{r=Math.max(0,r),n.integerLen=1,i.length=Math.max(1,s=o+1),i[0]=0;for(let d=1;d<s;d++)i[d]=0}if(a>=5)if(s-1<0){for(let d=0;d>s;d--)i.unshift(0),n.integerLen++;i.unshift(1),n.integerLen++}else i[s-1]++;for(;r<Math.max(0,o);r++)i.push(0);let c=o!==0,l=e+n.integerLen,u=i.reduceRight(function(d,f,h,g){return f=f+d,g[h]=f<10?f:f-10,c&&(g[h]===0&&h>=l?g.pop():c=!1),f>=10?1:0},0);u&&(i.unshift(u),n.integerLen++)}function W_(n){let e=parseInt(n);if(isNaN(e))throw new Ne(2305,!1);return e}var $_=/\s+/,LC=[],ck=(()=>{class n{_ngEl;_renderer;initialClasses=LC;rawClass;stateMap=new Map;constructor(t,i){this._ngEl=t,this._renderer=i}set klass(t){this.initialClasses=t!=null?t.trim().split($_):LC}set ngClass(t){this.rawClass=typeof t=="string"?t.trim().split($_):t}ngDoCheck(){for(let i of this.initialClasses)this._updateState(i,!0);let t=this.rawClass;if(Array.isArray(t)||t instanceof Set)for(let i of t)this._updateState(i,!0);else if(t!=null)for(let i of Object.keys(t))this._updateState(i,!!t[i]);this._applyStateDiff()}_updateState(t,i){let r=this.stateMap.get(t);r!==void 0?(r.enabled!==i&&(r.changed=!0,r.enabled=i),r.touched=!0):this.stateMap.set(t,{enabled:i,changed:!0,touched:!0})}_applyStateDiff(){for(let t of this.stateMap){let i=t[0],r=t[1];r.changed?(this._toggleClass(i,r.enabled),r.changed=!1):r.touched||(r.enabled&&this._toggleClass(i,!1),this.stateMap.delete(i)),r.touched=!1}}_toggleClass(t,i){t=t.trim(),t.length>0&&t.split($_).forEach(r=>{i?this._renderer.addClass(this._ngEl.nativeElement,r):this._renderer.removeClass(this._ngEl.nativeElement,r)})}static \u0275fac=function(i){return new(i||n)(nt(Fn),nt(Ar))};static \u0275dir=Sn({type:n,selectors:[["","ngClass",""]],inputs:{klass:[0,"class","klass"],ngClass:"ngClass"}})}return n})();var lk=(()=>{class n{_ngEl;_differs;_renderer;_ngStyle=null;_differ=null;constructor(t,i,r){this._ngEl=t,this._differs=i,this._renderer=r}set ngStyle(t){this._ngStyle=t,!this._differ&&t&&(this._differ=this._differs.find(t).create())}ngDoCheck(){if(this._differ){let t=this._differ.diff(this._ngStyle);t&&this._applyChanges(t)}}_setStyle(t,i){let[r,o]=t.split("."),s=r.indexOf("-")===-1?void 0:ma.DashCase;i!=null?this._renderer.setStyle(this._ngEl.nativeElement,r,o?`${i}${o}`:i,s):this._renderer.removeStyle(this._ngEl.nativeElement,r,s)}_applyChanges(t){t.forEachRemovedItem(i=>this._setStyle(i.key,null)),t.forEachAddedItem(i=>this._setStyle(i.key,i.currentValue)),t.forEachChangedItem(i=>this._setStyle(i.key,i.currentValue))}static \u0275fac=function(i){return new(i||n)(nt(Fn),nt(z_),nt(Ar))};static \u0275dir=Sn({type:n,selectors:[["","ngStyle",""]],inputs:{ngStyle:"ngStyle"}})}return n})(),uk=(()=>{class n{_viewContainerRef;_viewRef=null;ngTemplateOutletContext=null;ngTemplateOutlet=null;ngTemplateOutletInjector=null;injector=be(Ei);constructor(t){this._viewContainerRef=t}ngOnChanges(t){if(this._shouldRecreateView(t)){let i=this._viewContainerRef;if(this._viewRef&&i.remove(i.indexOf(this._viewRef)),!this.ngTemplateOutlet){this._viewRef=null;return}let r=this._createContextForwardProxy();this._viewRef=i.createEmbeddedView(this.ngTemplateOutlet,r,{injector:this._getInjector()})}}_getInjector(){return this.ngTemplateOutletInjector==="outlet"?this.injector:this.ngTemplateOutletInjector??void 0}_shouldRecreateView(t){return!!t.ngTemplateOutlet||!!t.ngTemplateOutletInjector}_createContextForwardProxy(){return new Proxy({},{set:(t,i,r)=>this.ngTemplateOutletContext?Reflect.set(this.ngTemplateOutletContext,i,r):!1,get:(t,i,r)=>{if(this.ngTemplateOutletContext)return Reflect.get(this.ngTemplateOutletContext,i,r)}})}static \u0275fac=function(i){return new(i||n)(nt(Sa))};static \u0275dir=Sn({type:n,selectors:[["","ngTemplateOutlet",""]],inputs:{ngTemplateOutletContext:"ngTemplateOutletContext",ngTemplateOutlet:"ngTemplateOutlet",ngTemplateOutletInjector:"ngTemplateOutletInjector"},features:[vl]})}return n})();function BC(n,e){return new Ne(2100,!1)}var q_=class{createSubscription(e,t,i){return Ri(()=>e.subscribe({next:t,error:i}))}dispose(e){Ri(()=>e.unsubscribe())}},X_=class{createSubscription(e,t,i){return e.then(r=>t?.(r),r=>i?.(r)),{unsubscribe:()=>{t=null,i=null}}}dispose(e){e.unsubscribe()}},dk=new X_,fk=new q_,hk=(()=>{class n{_ref;_latestValue=null;markForCheckOnValueUpdate=!0;_subscription=null;_obj=null;_strategy=null;applicationErrorHandler=be(Ki);constructor(t){this._ref=t}ngOnDestroy(){this._subscription&&this._dispose(),this._ref=null}transform(t){if(!this._obj){if(t)try{this.markForCheckOnValueUpdate=!1,this._subscribe(t)}finally{this.markForCheckOnValueUpdate=!0}return this._latestValue}return t!==this._obj?(this._dispose(),this.transform(t)):this._latestValue}_subscribe(t){this._obj=t,this._strategy=this._selectStrategy(t),this._subscription=this._strategy.createSubscription(t,i=>this._updateLatestValue(t,i),i=>this.applicationErrorHandler(i))}_selectStrategy(t){if(as(t))return dk;if(rh(t))return fk;throw BC(n,t)}_dispose(){this._strategy.dispose(this._subscription),this._latestValue=null,this._subscription=null,this._obj=null}_updateLatestValue(t,i){t===this._obj&&(this._latestValue=i,this.markForCheckOnValueUpdate&&this._ref?.markForCheck())}static \u0275fac=function(i){return new(i||n)(nt(fs,16))};static \u0275pipe=th({name:"async",type:n,pure:!1})}return n})();var pk=(()=>{class n{_locale;constructor(t){this._locale=t}transform(t,i,r){if(!mk(t))return null;r||=this._locale;try{let o=gk(t);return UC(o,r,i)}catch(o){throw BC(n,o.message)}}static \u0275fac=function(i){return new(i||n)(nt(Dl,16))};static \u0275pipe=th({name:"number",type:n,pure:!0})}return n})();function mk(n){return!(n==null||n===""||n!==n)}function gk(n){if(typeof n=="string"&&!isNaN(Number(n)-parseFloat(n)))return Number(n);if(typeof n!="number")throw new Ne(2309,!1);return n}var yk=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=ss({type:n});static \u0275inj=Jr({})}return n})();function Z_(n,e){e=encodeURIComponent(e);for(let t of n.split(";")){let i=t.indexOf("="),[r,o]=i==-1?[t,""]:[t.slice(0,i),t.slice(i+1)];if(r.trim()===e)return decodeURIComponent(o)}return null}var Nl=class{};var WQ="browser";var go=class n{headers;normalizedNames=new Map;lazyInit;lazyUpdate=null;constructor(e){e?typeof e=="string"?this.lazyInit=()=>{this.headers=new Map,e.split(`
`).forEach(t=>{let i=t.indexOf(":");if(i>0){let r=t.slice(0,i),o=t.slice(i+1).trim();this.addHeaderEntry(r,o)}})}:typeof Headers<"u"&&e instanceof Headers?(this.headers=new Map,e.forEach((t,i)=>{this.addHeaderEntry(i,t)})):this.lazyInit=()=>{this.headers=new Map,Object.entries(e).forEach(([t,i])=>{this.setHeaderEntries(t,i)})}:this.headers=new Map}has(e){return this.init(),this.headers.has(e.toLowerCase())}get(e){this.init();let t=this.headers.get(e.toLowerCase());return t&&t.length>0?t[0]:null}keys(){return this.init(),Array.from(this.normalizedNames.values())}getAll(e){return this.init(),this.headers.get(e.toLowerCase())||null}append(e,t){return this.clone({name:e,value:t,op:"a"})}set(e,t){return this.clone({name:e,value:t,op:"s"})}delete(e,t){return this.clone({name:e,value:t,op:"d"})}maybeSetNormalizedName(e,t){this.normalizedNames.has(t)||this.normalizedNames.set(t,e)}init(){this.lazyInit&&(this.lazyInit instanceof n?this.copyFrom(this.lazyInit):this.lazyInit(),this.lazyInit=null,this.lazyUpdate&&(this.lazyUpdate.forEach(e=>this.applyUpdate(e)),this.lazyUpdate=null))}copyFrom(e){e.init();for(let[t,i]of e.headers.entries())this.headers.set(t,i),this.normalizedNames.set(t,e.normalizedNames.get(t))}clone(e){let t=new n;return t.lazyInit=this.lazyInit&&this.lazyInit instanceof n?this.lazyInit:this,t.lazyUpdate=(this.lazyUpdate||[]).concat([e]),t}applyUpdate(e){let t=e.name.toLowerCase();switch(e.op){case"a":case"s":let i=e.value;if(typeof i=="string"&&(i=[i]),i.length===0)return;this.maybeSetNormalizedName(e.name,t);let r=e.op==="a"?(this.headers.get(t)||[]).slice():[];r.push(...i),this.headers.set(t,r);break;case"d":let o=e.value;if(o===void 0)this.headers.delete(t),this.normalizedNames.delete(t);else{let s=Array.isArray(o)?o:[o],a=this.headers.get(t);if(!a)return;a=a.filter(c=>s.indexOf(c)===-1),a.length===0?(this.headers.delete(t),this.normalizedNames.delete(t)):this.headers.set(t,a)}break}}addHeaderEntry(e,t){let i=e.toLowerCase();this.maybeSetNormalizedName(e,i),this.headers.has(i)?this.headers.get(i).push(t):this.headers.set(i,[t])}setHeaderEntries(e,t){let i=(Array.isArray(t)?t:[t]).map(o=>o.toString()),r=e.toLowerCase();this.headers.set(r,i),this.maybeSetNormalizedName(e,r)}forEach(e){this.init(),Array.from(this.normalizedNames.keys()).forEach(t=>e(this.normalizedNames.get(t),this.headers.get(t)))}};var dh=class{map=new Map;set(e,t){return this.map.set(e,t),this}get(e){return this.map.has(e)||this.map.set(e,e.defaultValue()),this.map.get(e)}delete(e){return this.map.delete(e),this}has(e){return this.map.has(e)}keys(){return this.map.keys()}},fh=class{encodeKey(e){return VC(e)}encodeValue(e){return VC(e)}decodeKey(e){return decodeURIComponent(e)}decodeValue(e){return decodeURIComponent(e)}};function _k(n,e){let t=new Map;return n.length>0&&n.replace(/^\?/,"").split("&").forEach(r=>{let o=r.indexOf("="),[s,a]=o==-1?[e.decodeKey(r),""]:[e.decodeKey(r.slice(0,o)),e.decodeValue(r.slice(o+1))],c=t.get(s)||[];c.push(a),t.set(s,c)}),t}var xk=/%(\d[a-f0-9])/gi,bk={40:"@","3A":":",24:"$","2C":",","3B":";","3D":"=","3F":"?","2F":"/"};function VC(n){return encodeURIComponent(n).replace(xk,(e,t)=>bk[t]??e)}function uh(n){return`${n}`}var Rr=class n{map;encoder;updates=null;cloneFrom=null;constructor(e={}){if(this.encoder=e.encoder||new fh,e.fromString){if(e.fromObject)throw new Ne(2805,!1);this.map=_k(e.fromString,this.encoder)}else e.fromObject?(this.map=new Map,Object.keys(e.fromObject).forEach(t=>{let i=e.fromObject[t],r=Array.isArray(i)?i.map(uh):[uh(i)];this.map.set(t,r)})):this.map=null}has(e){return this.init(),this.map.has(e)}get(e){this.init();let t=this.map.get(e);return t?t[0]:null}getAll(e){return this.init(),this.map.get(e)||null}keys(){return this.init(),Array.from(this.map.keys())}append(e,t){return this.clone({param:e,value:t,op:"a"})}appendAll(e){let t=[];return Object.keys(e).forEach(i=>{let r=e[i];Array.isArray(r)?r.forEach(o=>{t.push({param:i,value:o,op:"a"})}):t.push({param:i,value:r,op:"a"})}),this.clone(t)}set(e,t){return this.clone({param:e,value:t,op:"s"})}delete(e,t){return this.clone({param:e,value:t,op:"d"})}toString(){return this.init(),this.keys().map(e=>{let t=this.encoder.encodeKey(e);return this.map.get(e).map(i=>t+"="+this.encoder.encodeValue(i)).join("&")}).filter(e=>e!=="").join("&")}clone(e){let t=new n({encoder:this.encoder});return t.cloneFrom=this.cloneFrom||this,t.updates=(this.updates||[]).concat(e),t}init(){if(this.map===null&&(this.map=new Map),this.cloneFrom!==null){this.cloneFrom.init();for(let[e,t]of this.cloneFrom.map.entries())this.map.set(e,t);this.updates.forEach(e=>{switch(e.op){case"a":case"s":let t=e.op==="a"?(this.map.get(e.param)||[]).slice():[];t.push(uh(e.value)),this.map.set(e.param,t);break;case"d":if(e.value!==void 0){let i=(this.map.get(e.param)||[]).slice(),r=i.indexOf(uh(e.value));r!==-1&&i.splice(r,1),i.length>0?this.map.set(e.param,i):this.map.delete(e.param)}else{this.map.delete(e.param);break}}}),this.cloneFrom=this.updates=null}}};function Sk(n){switch(n){case"DELETE":case"GET":case"HEAD":case"OPTIONS":case"JSONP":return!1;default:return!0}}function HC(n){return typeof ArrayBuffer<"u"&&n instanceof ArrayBuffer}function zC(n){return typeof Blob<"u"&&n instanceof Blob}function GC(n){return typeof FormData<"u"&&n instanceof FormData}function Mk(n){return typeof URLSearchParams<"u"&&n instanceof URLSearchParams}var jC="Content-Type",WC="Accept",$C="text/plain",qC="application/json",Ek=`${qC}, ${$C}, */*`,Ra=class n{url;body=null;headers;context;reportProgress=!1;withCredentials=!1;credentials;keepalive=!1;cache;priority;mode;redirect;referrer;integrity;referrerPolicy;responseType="json";method;params;urlWithParams;transferCache;timeout;constructor(e,t,i,r){this.url=t,this.method=e.toUpperCase();let o;if(Sk(this.method)||r?(this.body=i!==void 0?i:null,o=r):o=i,o){if(this.reportProgress=!!o.reportProgress,this.withCredentials=!!o.withCredentials,this.keepalive=!!o.keepalive,o.responseType&&(this.responseType=o.responseType),o.headers&&(this.headers=o.headers),o.context&&(this.context=o.context),o.params&&(this.params=o.params),o.priority&&(this.priority=o.priority),o.cache&&(this.cache=o.cache),o.credentials&&(this.credentials=o.credentials),typeof o.timeout=="number"){if(o.timeout<1||!Number.isInteger(o.timeout))throw new Ne(2822,"");this.timeout=o.timeout}o.mode&&(this.mode=o.mode),o.redirect&&(this.redirect=o.redirect),o.integrity&&(this.integrity=o.integrity),o.referrer!==void 0&&(this.referrer=o.referrer),o.referrerPolicy&&(this.referrerPolicy=o.referrerPolicy),this.transferCache=o.transferCache}if(this.headers??=new go,this.context??=new dh,!this.params)this.params=new Rr,this.urlWithParams=t;else{let s=this.params.toString();if(s.length===0)this.urlWithParams=t;else{let a=t.indexOf("?"),c=a===-1?"?":a<t.length-1?"&":"";this.urlWithParams=t+c+s}}}serializeBody(){return this.body===null?null:typeof this.body=="string"||HC(this.body)||zC(this.body)||GC(this.body)||Mk(this.body)?this.body:this.body instanceof Rr?this.body.toString():typeof this.body=="object"||typeof this.body=="boolean"||Array.isArray(this.body)?JSON.stringify(this.body):this.body.toString()}detectContentTypeHeader(){return this.body===null||GC(this.body)?null:zC(this.body)?this.body.type||null:HC(this.body)?null:typeof this.body=="string"?$C:this.body instanceof Rr?"application/x-www-form-urlencoded;charset=UTF-8":typeof this.body=="object"||typeof this.body=="number"||typeof this.body=="boolean"?qC:null}clone(e={}){let t=e.method||this.method,i=e.url||this.url,r=e.responseType||this.responseType,o=e.keepalive??this.keepalive,s=e.priority||this.priority,a=e.cache||this.cache,c=e.mode||this.mode,l=e.redirect||this.redirect,u=e.credentials||this.credentials,d=e.referrer??this.referrer,f=e.integrity||this.integrity,h=e.referrerPolicy||this.referrerPolicy,g=e.transferCache??this.transferCache,y=e.timeout??this.timeout,p=e.body!==void 0?e.body:this.body,m=e.withCredentials??this.withCredentials,x=e.reportProgress??this.reportProgress,E=e.headers||this.headers,_=e.params||this.params,M=e.context??this.context;return e.setHeaders!==void 0&&(E=Object.keys(e.setHeaders).reduce((w,D)=>w.set(D,e.setHeaders[D]),E)),e.setParams&&(_=Object.keys(e.setParams).reduce((w,D)=>w.set(D,e.setParams[D]),_)),new n(t,i,p,{params:_,headers:E,context:M,reportProgress:x,responseType:r,withCredentials:m,transferCache:g,keepalive:o,cache:a,priority:s,timeout:y,mode:c,redirect:l,credentials:u,referrer:d,integrity:f,referrerPolicy:h})}},ps=(function(n){return n[n.Sent=0]="Sent",n[n.UploadProgress=1]="UploadProgress",n[n.ResponseHeader=2]="ResponseHeader",n[n.DownloadProgress=3]="DownloadProgress",n[n.Response=4]="Response",n[n.User=5]="User",n})(ps||{}),Pa=class{headers;status;statusText;url;ok;type;redirected;responseType;constructor(e,t=200,i="OK"){this.headers=e.headers||new go,this.status=e.status!==void 0?e.status:t,this.statusText=e.statusText||i,this.url=e.url||null,this.redirected=e.redirected,this.responseType=e.responseType,this.ok=this.status>=200&&this.status<300}},hh=class n extends Pa{constructor(e={}){super(e)}type=ps.ResponseHeader;clone(e={}){return new n({headers:e.headers||this.headers,status:e.status!==void 0?e.status:this.status,statusText:e.statusText||this.statusText,url:e.url||this.url||void 0})}},Pl=class n extends Pa{body;constructor(e={}){super(e),this.body=e.body!==void 0?e.body:null}type=ps.Response;clone(e={}){return new n({body:e.body!==void 0?e.body:this.body,headers:e.headers||this.headers,status:e.status!==void 0?e.status:this.status,statusText:e.statusText||this.statusText,url:e.url||this.url||void 0,redirected:e.redirected??this.redirected,responseType:e.responseType??this.responseType})}},Na=class extends Pa{name="HttpErrorResponse";message;error;ok=!1;constructor(e){super(e,0,"Unknown Error"),this.status>=200&&this.status<300?this.message=`Http failure during parsing for ${e.url||"(unknown url)"}`:this.message=`Http failure response for ${e.url||"(unknown url)"}: ${e.status} ${e.statusText}`,this.error=e.error||null}},wk=200,Ck=204;var Tk=new He("");var Dk=/^\)\]\}',?\n/;var K_=(()=>{class n{xhrFactory;tracingService=be(fo,{optional:!0});constructor(t){this.xhrFactory=t}maybePropagateTrace(t){return this.tracingService?.propagate?this.tracingService.propagate(t):t}handle(t){if(t.method==="JSONP")throw new Ne(-2800,!1);let i=this.xhrFactory;return Ws(null).pipe(Gg(()=>new Ot(o=>{let s=i.build();if(s.open(t.method,t.urlWithParams),t.withCredentials&&(s.withCredentials=!0),t.headers.forEach((p,m)=>s.setRequestHeader(p,m.join(","))),t.headers.has(WC)||s.setRequestHeader(WC,Ek),!t.headers.has(jC)){let p=t.detectContentTypeHeader();p!==null&&s.setRequestHeader(jC,p)}if(t.timeout&&(s.timeout=t.timeout),t.responseType){let p=t.responseType.toLowerCase();s.responseType=p!=="json"?p:"text"}let a=t.serializeBody(),c=null,l=()=>{if(c!==null)return c;let p=s.statusText||"OK",m=new go(s.getAllResponseHeaders()),x=s.responseURL||t.url;return c=new hh({headers:m,status:s.status,statusText:p,url:x}),c},u=this.maybePropagateTrace(()=>{let{headers:p,status:m,statusText:x,url:E}=l(),_=null;m!==Ck&&(_=typeof s.response>"u"?s.responseText:s.response),m===0&&(m=_?wk:0);let M=m>=200&&m<300;if(t.responseType==="json"&&typeof _=="string"){let w=_;_=_.replace(Dk,"");try{_=_!==""?JSON.parse(_):null}catch(D){_=w,M&&(M=!1,_={error:D,text:_})}}M?(o.next(new Pl({body:_,headers:p,status:m,statusText:x,url:E||void 0})),o.complete()):o.error(new Na({error:_,headers:p,status:m,statusText:x,url:E||void 0}))}),d=this.maybePropagateTrace(p=>{let{url:m}=l(),x=new Na({error:p,status:s.status||0,statusText:s.statusText||"Unknown Error",url:m||void 0});o.error(x)}),f=d;t.timeout&&(f=this.maybePropagateTrace(p=>{let{url:m}=l(),x=new Na({error:new DOMException("Request timed out","TimeoutError"),status:s.status||0,statusText:s.statusText||"Request timeout",url:m||void 0});o.error(x)}));let h=!1,g=this.maybePropagateTrace(p=>{h||(o.next(l()),h=!0);let m={type:ps.DownloadProgress,loaded:p.loaded};p.lengthComputable&&(m.total=p.total),t.responseType==="text"&&s.responseText&&(m.partialText=s.responseText),o.next(m)}),y=this.maybePropagateTrace(p=>{let m={type:ps.UploadProgress,loaded:p.loaded};p.lengthComputable&&(m.total=p.total),o.next(m)});return s.addEventListener("load",u),s.addEventListener("error",d),s.addEventListener("timeout",f),s.addEventListener("abort",d),t.reportProgress&&(s.addEventListener("progress",g),a!==null&&s.upload&&s.upload.addEventListener("progress",y)),s.send(a),o.next({type:ps.Sent}),()=>{s.removeEventListener("error",d),s.removeEventListener("abort",d),s.removeEventListener("load",u),s.removeEventListener("timeout",f),t.reportProgress&&(s.removeEventListener("progress",g),a!==null&&s.upload&&s.upload.removeEventListener("progress",y)),s.readyState!==s.DONE&&s.abort()}})))}static \u0275fac=function(i){return new(i||n)(lt(Nl))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),Ak=new He("",{factory:()=>!0}),Ik="XSRF-TOKEN",Rk=new He("",{factory:()=>Ik}),Nk="X-XSRF-TOKEN",Pk=new He("",{factory:()=>Nk}),Fk=(()=>{class n{cookieName=be(Rk);doc=be(ao);lastCookieString="";lastToken=null;parseCount=0;getToken(){let t=this.doc.cookie||"";return t!==this.lastCookieString&&(this.parseCount++,this.lastToken=Z_(t,this.cookieName),this.lastCookieString=t),this.lastToken}static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),XC=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=lt(Fk),r},providedIn:"root"})}return n})();function YC(n,e){if(!be(Ak)||n.method==="GET"||n.method==="HEAD")return e(n);try{let r=be(ch).href,{origin:o}=new URL(r),{origin:s}=new URL(n.url,o);if(o!==s)return e(n)}catch(r){return e(n)}let t=be(XC).getToken(),i=be(Pk);return t!=null&&!n.headers.has(i)&&(n=n.clone({headers:n.headers.set(i,t)})),e(n)}function Ok(n,e){return e(n)}function Lk(n,e,t){return(i,r)=>Ks(t,()=>e(i,o=>n(o,r)))}var ZC=new He("",{factory:()=>[YC]}),JC=new He(""),KC=new He("",{factory:()=>!0});var Q_=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=lt(K_),r},providedIn:"root"})}return n})();var ph=(()=>{class n{backend;injector;chain=null;pendingTasks=be(nl);contributeToStability=be(KC);constructor(t,i){this.backend=t,this.injector=i}handle(t){if(this.chain===null){let i=this.injector.get(mh,null,{skipSelf:!0}),r=i!==null&&this.backend===i,o=this.injector.get(JC,[],r?{self:!0}:void 0),s=Array.from(new Set([...this.injector.get(ZC),...o]));this.chain=s.reduceRight((a,c)=>Lk(a,c,this.injector),Ok)}if(this.contributeToStability){let i=this.pendingTasks.add();return this.chain(t,r=>this.backend.handle(r)).pipe(zg(i))}else return this.chain(t,i=>this.backend.handle(i))}static \u0275fac=function(i){return new(i||n)(lt(Q_),lt(bn))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})(),mh=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275prov=Pe({token:n,factory:function(i){let r=null;return i?r=new(i||n):r=lt(ph),r},providedIn:"root"})}return n})();function J_(n,e){return{body:e,headers:n.headers,context:n.context,observe:n.observe,params:n.params,reportProgress:n.reportProgress,responseType:n.responseType,withCredentials:n.withCredentials,credentials:n.credentials,transferCache:n.transferCache,timeout:n.timeout,keepalive:n.keepalive,priority:n.priority,cache:n.cache,mode:n.mode,redirect:n.redirect,integrity:n.integrity,referrer:n.referrer,referrerPolicy:n.referrerPolicy}}var gh=(()=>{class n{handler;constructor(t){this.handler=t}request(t,i,r={}){let o;if(t instanceof Ra)o=t;else{let c;r.headers instanceof go?c=r.headers:c=new go(r.headers);let l;r.params&&(r.params instanceof Rr?l=r.params:l=new Rr({fromObject:r.params})),o=new Ra(t,i,r.body!==void 0?r.body:null,{headers:c,context:r.context,params:l,reportProgress:r.reportProgress,responseType:r.responseType||"json",withCredentials:r.withCredentials,transferCache:r.transferCache,keepalive:r.keepalive,priority:r.priority,cache:r.cache,mode:r.mode,redirect:r.redirect,credentials:r.credentials,referrer:r.referrer,referrerPolicy:r.referrerPolicy,integrity:r.integrity,timeout:r.timeout})}let s=Ws(o).pipe(Hg(c=>this.handler.handle(c)));if(t instanceof Ra||r.observe==="events")return s;let a=s.pipe(Rc(c=>c instanceof Pl));switch(r.observe||"body"){case"body":switch(o.responseType){case"arraybuffer":return a.pipe(An(c=>{if(c.body!==null&&!(c.body instanceof ArrayBuffer))throw new Ne(2806,!1);return c.body}));case"blob":return a.pipe(An(c=>{if(c.body!==null&&!(c.body instanceof Blob))throw new Ne(2807,!1);return c.body}));case"text":return a.pipe(An(c=>{if(c.body!==null&&typeof c.body!="string")throw new Ne(2808,!1);return c.body}));default:return a.pipe(An(c=>c.body))}case"response":return a;default:throw new Ne(2809,!1)}}delete(t,i={}){return this.request("DELETE",t,i)}get(t,i={}){return this.request("GET",t,i)}head(t,i={}){return this.request("HEAD",t,i)}jsonp(t,i){return this.request("JSONP",t,{params:new Rr().append(i,"JSONP_CALLBACK"),observe:"body",responseType:"json"})}options(t,i={}){return this.request("OPTIONS",t,i)}patch(t,i,r={}){return this.request("PATCH",t,J_(r,i))}post(t,i,r={}){return this.request("POST",t,J_(r,i))}put(t,i,r={}){return this.request("PUT",t,J_(r,i))}static \u0275fac=function(i){return new(i||n)(lt(mh))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})}return n})();function kk(...n){let e=[gh,ph,{provide:mh,useExisting:ph},{provide:Q_,useFactory:()=>be(Tk,{optional:!0})??be(K_)},{provide:ZC,useValue:YC,multi:!0}];for(let t of n)e.push(...t.\u0275providers);return qc(e)}var aT=(()=>{class n{_renderer;_elementRef;onChange=t=>{};onTouched=()=>{};constructor(t,i){this._renderer=t,this._elementRef=i}setProperty(t,i){this._renderer.setProperty(this._elementRef.nativeElement,t,i)}registerOnTouched(t){this.onTouched=t}registerOnChange(t){this.onChange=t}setDisabledState(t){this.setProperty("disabled",t)}static \u0275fac=function(i){return new(i||n)(nt(Ar),nt(Fn))};static \u0275dir=Sn({type:n})}return n})(),bh=(()=>{class n extends aT{static \u0275fac=(()=>{let t;return function(r){return(t||(t=xa(n)))(r||n)}})();static \u0275dir=Sn({type:n,features:[er]})}return n})(),Bl=new He(""),Bk={provide:Bl,useExisting:Yi(()=>Vk),multi:!0},Vk=(()=>{class n extends bh{writeValue(t){this.setProperty("checked",t)}static \u0275fac=(()=>{let t;return function(r){return(t||(t=xa(n)))(r||n)}})();static \u0275dir=Sn({type:n,selectors:[["input","type","checkbox","formControlName",""],["input","type","checkbox","formControl",""],["input","type","checkbox","ngModel",""]],hostBindings:function(i,r){i&1&&Ir("change",function(s){return r.onChange(s.target.checked)})("blur",function(){return r.onTouched()})},standalone:!1,features:[ds([Bk]),er]})}return n})(),Hk={provide:Bl,useExisting:Yi(()=>cT),multi:!0};function zk(){let n=hs()?hs().getUserAgent():"";return/android (\d+)/.test(n.toLowerCase())}var Gk=new He(""),cT=(()=>{class n extends aT{_compositionMode;_composing=!1;constructor(t,i,r){super(t,i),this._compositionMode=r,this._compositionMode==null&&(this._compositionMode=!zk())}writeValue(t){let i=t??"";this.setProperty("value",i)}_handleInput(t){(!this._compositionMode||this._compositionMode&&!this._composing)&&this.onChange(t)}_compositionStart(){this._composing=!0}_compositionEnd(t){this._composing=!1,this._compositionMode&&this.onChange(t)}static \u0275fac=function(i){return new(i||n)(nt(Ar),nt(Fn),nt(Gk,8))};static \u0275dir=Sn({type:n,selectors:[["input","formControlName","",3,"type","checkbox"],["textarea","formControlName",""],["input","formControl","",3,"type","checkbox"],["textarea","formControl",""],["input","ngModel","",3,"type","checkbox"],["textarea","ngModel",""],["","ngDefaultControl",""]],hostBindings:function(i,r){i&1&&Ir("input",function(s){return r._handleInput(s.target.value)})("blur",function(){return r.onTouched()})("compositionstart",function(){return r._compositionStart()})("compositionend",function(s){return r._compositionEnd(s.target.value)})},standalone:!1,features:[ds([Hk]),er]})}return n})();var jk=new He(""),Wk=new He("");function lT(n){return n!=null}function uT(n){return as(n)?Nc(n):n}function dT(n){let e={};return n.forEach(t=>{e=t!=null?Re(Re({},e),t):e}),Object.keys(e).length===0?null:e}function fT(n,e){return e.map(t=>t(n))}function $k(n){return!n.validate}function hT(n){return n.map(e=>$k(e)?e:t=>e.validate(t))}function qk(n){if(!n)return null;let e=n.filter(lT);return e.length==0?null:function(t){return dT(fT(t,e))}}function pT(n){return n!=null?qk(hT(n)):null}function Xk(n){if(!n)return null;let e=n.filter(lT);return e.length==0?null:function(t){let i=fT(t,e).map(uT);return Pc(i).pipe(An(dT))}}function mT(n){return n!=null?Xk(hT(n)):null}function QC(n,e){return n===null?[e]:Array.isArray(n)?[...n,e]:[n,e]}function Yk(n){return n._rawValidators}function Zk(n){return n._rawAsyncValidators}function e0(n){return n?Array.isArray(n)?n:[n]:[]}function vh(n,e){return Array.isArray(n)?n.includes(e):n===e}function eT(n,e){let t=e0(e);return e0(n).forEach(r=>{vh(t,r)||t.push(r)}),t}function tT(n,e){return e0(e).filter(t=>!vh(n,t))}var _h=class{get value(){return this.control?this.control.value:null}get valid(){return this.control?this.control.valid:null}get invalid(){return this.control?this.control.invalid:null}get pending(){return this.control?this.control.pending:null}get disabled(){return this.control?this.control.disabled:null}get enabled(){return this.control?this.control.enabled:null}get errors(){return this.control?this.control.errors:null}get pristine(){return this.control?this.control.pristine:null}get dirty(){return this.control?this.control.dirty:null}get touched(){return this.control?this.control.touched:null}get status(){return this.control?this.control.status:null}get untouched(){return this.control?this.control.untouched:null}get statusChanges(){return this.control?this.control.statusChanges:null}get valueChanges(){return this.control?this.control.valueChanges:null}get path(){return null}_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators=[];_rawAsyncValidators=[];_setValidators(e){this._rawValidators=e||[],this._composedValidatorFn=pT(this._rawValidators)}_setAsyncValidators(e){this._rawAsyncValidators=e||[],this._composedAsyncValidatorFn=mT(this._rawAsyncValidators)}get validator(){return this._composedValidatorFn||null}get asyncValidator(){return this._composedAsyncValidatorFn||null}_onDestroyCallbacks=[];_registerOnDestroy(e){this._onDestroyCallbacks.push(e)}_invokeOnDestroyCallbacks(){this._onDestroyCallbacks.forEach(e=>e()),this._onDestroyCallbacks=[]}reset(e=void 0){this.control?.reset(e)}hasError(e,t){return this.control?this.control.hasError(e,t):!1}getError(e,t){return this.control?this.control.getError(e,t):null}},t0=class extends _h{name;get formDirective(){return null}get path(){return null}},Ul=class extends _h{_parent=null;name=null;valueAccessor=null},n0=class{_cd;constructor(e){this._cd=e}get isTouched(){return this._cd?.control?._touched?.(),!!this._cd?.control?.touched}get isUntouched(){return!!this._cd?.control?.untouched}get isPristine(){return this._cd?.control?._pristine?.(),!!this._cd?.control?.pristine}get isDirty(){return!!this._cd?.control?.dirty}get isValid(){return this._cd?.control?._status?.(),!!this._cd?.control?.valid}get isInvalid(){return!!this._cd?.control?.invalid}get isPending(){return!!this._cd?.control?.pending}get isSubmitted(){return this._cd?._submitted?.(),!!this._cd?.submitted}};var $ee=(()=>{class n extends n0{constructor(t){super(t)}static \u0275fac=function(i){return new(i||n)(nt(Ul,2))};static \u0275dir=Sn({type:n,selectors:[["","formControlName",""],["","ngModel",""],["","formControl",""]],hostVars:14,hostBindings:function(i,r){i&2&&Da("ng-untouched",r.isUntouched)("ng-touched",r.isTouched)("ng-pristine",r.isPristine)("ng-dirty",r.isDirty)("ng-valid",r.isValid)("ng-invalid",r.isInvalid)("ng-pending",r.isPending)},standalone:!1,features:[er]})}return n})();var Fl="VALID",yh="INVALID",Fa="PENDING",Ol="DISABLED",ms=class{},xh=class extends ms{value;source;constructor(e,t){super(),this.value=e,this.source=t}},Ll=class extends ms{pristine;source;constructor(e,t){super(),this.pristine=e,this.source=t}},kl=class extends ms{touched;source;constructor(e,t){super(),this.touched=e,this.source=t}},Oa=class extends ms{status;source;constructor(e,t){super(),this.status=e,this.source=t}};var i0=class extends ms{source;constructor(e){super(),this.source=e}};function Jk(n){return(Sh(n)?n.validators:n)||null}function Kk(n){return Array.isArray(n)?pT(n):n||null}function Qk(n,e){return(Sh(e)?e.asyncValidators:n)||null}function e3(n){return Array.isArray(n)?mT(n):n||null}function Sh(n){return n!=null&&!Array.isArray(n)&&typeof n=="object"}var r0=class{_pendingDirty=!1;_hasOwnPendingAsyncValidator=null;_pendingTouched=!1;_onCollectionChange=()=>{};_updateOn;_parent=null;_asyncValidationSubscription;_composedValidatorFn;_composedAsyncValidatorFn;_rawValidators;_rawAsyncValidators;value;constructor(e,t){this._assignValidators(e),this._assignAsyncValidators(t)}get validator(){return this._composedValidatorFn}set validator(e){this._rawValidators=this._composedValidatorFn=e}get asyncValidator(){return this._composedAsyncValidatorFn}set asyncValidator(e){this._rawAsyncValidators=this._composedAsyncValidatorFn=e}get parent(){return this._parent}get status(){return Ri(this.statusReactive)}set status(e){Ri(()=>this.statusReactive.set(e))}_status=Al(()=>this.statusReactive());statusReactive=ts(void 0);get valid(){return this.status===Fl}get invalid(){return this.status===yh}get pending(){return this.status===Fa}get disabled(){return this.status===Ol}get enabled(){return this.status!==Ol}errors;get pristine(){return Ri(this.pristineReactive)}set pristine(e){Ri(()=>this.pristineReactive.set(e))}_pristine=Al(()=>this.pristineReactive());pristineReactive=ts(!0);get dirty(){return!this.pristine}get touched(){return Ri(this.touchedReactive)}set touched(e){Ri(()=>this.touchedReactive.set(e))}_touched=Al(()=>this.touchedReactive());touchedReactive=ts(!1);get untouched(){return!this.touched}_events=new Gt;events=this._events.asObservable();valueChanges;statusChanges;get updateOn(){return this._updateOn?this._updateOn:this.parent?this.parent.updateOn:"change"}setValidators(e){this._assignValidators(e)}setAsyncValidators(e){this._assignAsyncValidators(e)}addValidators(e){this.setValidators(eT(e,this._rawValidators))}addAsyncValidators(e){this.setAsyncValidators(eT(e,this._rawAsyncValidators))}removeValidators(e){this.setValidators(tT(e,this._rawValidators))}removeAsyncValidators(e){this.setAsyncValidators(tT(e,this._rawAsyncValidators))}hasValidator(e){return vh(this._rawValidators,e)}hasAsyncValidator(e){return vh(this._rawAsyncValidators,e)}clearValidators(){this.validator=null}clearAsyncValidators(){this.asyncValidator=null}markAsTouched(e={}){let t=this.touched===!1;this.touched=!0;let i=e.sourceControl??this;e.onlySelf||this._parent?.markAsTouched(at(Re({},e),{sourceControl:i})),t&&e.emitEvent!==!1&&this._events.next(new kl(!0,i))}markAllAsDirty(e={}){this.markAsDirty({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsDirty(e))}markAllAsTouched(e={}){this.markAsTouched({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:this}),this._forEachChild(t=>t.markAllAsTouched(e))}markAsUntouched(e={}){let t=this.touched===!0;this.touched=!1,this._pendingTouched=!1;let i=e.sourceControl??this;this._forEachChild(r=>{r.markAsUntouched({onlySelf:!0,emitEvent:e.emitEvent,sourceControl:i})}),e.onlySelf||this._parent?._updateTouched(e,i),t&&e.emitEvent!==!1&&this._events.next(new kl(!1,i))}markAsDirty(e={}){let t=this.pristine===!0;this.pristine=!1;let i=e.sourceControl??this;e.onlySelf||this._parent?.markAsDirty(at(Re({},e),{sourceControl:i})),t&&e.emitEvent!==!1&&this._events.next(new Ll(!1,i))}markAsPristine(e={}){let t=this.pristine===!1;this.pristine=!0,this._pendingDirty=!1;let i=e.sourceControl??this;this._forEachChild(r=>{r.markAsPristine({onlySelf:!0,emitEvent:e.emitEvent})}),e.onlySelf||this._parent?._updatePristine(e,i),t&&e.emitEvent!==!1&&this._events.next(new Ll(!0,i))}markAsPending(e={}){this.status=Fa;let t=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new Oa(this.status,t)),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.markAsPending(at(Re({},e),{sourceControl:t}))}disable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=Ol,this.errors=null,this._forEachChild(r=>{r.disable(at(Re({},e),{onlySelf:!0}))}),this._updateValue();let i=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new xh(this.value,i)),this._events.next(new Oa(this.status,i)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),this._updateAncestors(at(Re({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(r=>r(!0))}enable(e={}){let t=this._parentMarkedDirty(e.onlySelf);this.status=Fl,this._forEachChild(i=>{i.enable(at(Re({},e),{onlySelf:!0}))}),this.updateValueAndValidity({onlySelf:!0,emitEvent:e.emitEvent}),this._updateAncestors(at(Re({},e),{skipPristineCheck:t}),this),this._onDisabledChange.forEach(i=>i(!1))}_updateAncestors(e,t){e.onlySelf||(this._parent?.updateValueAndValidity(e),e.skipPristineCheck||this._parent?._updatePristine({},t),this._parent?._updateTouched({},t))}setParent(e){this._parent=e}getRawValue(){return this.value}updateValueAndValidity(e={}){if(this._setInitialStatus(),this._updateValue(),this.enabled){let i=this._cancelExistingSubscription();this.errors=this._runValidator(),this.status=this._calculateStatus(),(this.status===Fl||this.status===Fa)&&this._runAsyncValidator(i,e.emitEvent)}let t=e.sourceControl??this;e.emitEvent!==!1&&(this._events.next(new xh(this.value,t)),this._events.next(new Oa(this.status,t)),this.valueChanges.emit(this.value),this.statusChanges.emit(this.status)),e.onlySelf||this._parent?.updateValueAndValidity(at(Re({},e),{sourceControl:t}))}_updateTreeValidity(e={emitEvent:!0}){this._forEachChild(t=>t._updateTreeValidity(e)),this.updateValueAndValidity({onlySelf:!0,emitEvent:e.emitEvent})}_setInitialStatus(){this.status=this._allControlsDisabled()?Ol:Fl}_runValidator(){return this.validator?this.validator(this):null}_runAsyncValidator(e,t){if(this.asyncValidator){this.status=Fa,this._hasOwnPendingAsyncValidator={emitEvent:t!==!1,shouldHaveEmitted:e!==!1};let i=uT(this.asyncValidator(this));this._asyncValidationSubscription=i.subscribe(r=>{this._hasOwnPendingAsyncValidator=null,this.setErrors(r,{emitEvent:t,shouldHaveEmitted:e})})}}_cancelExistingSubscription(){if(this._asyncValidationSubscription){this._asyncValidationSubscription.unsubscribe();let e=(this._hasOwnPendingAsyncValidator?.emitEvent||this._hasOwnPendingAsyncValidator?.shouldHaveEmitted)??!1;return this._hasOwnPendingAsyncValidator=null,e}return!1}setErrors(e,t={}){this.errors=e,this._updateControlsErrors(t.emitEvent!==!1,this,t.shouldHaveEmitted)}get(e){let t=e;return t==null||(Array.isArray(t)||(t=t.split(".")),t.length===0)?null:t.reduce((i,r)=>i&&i._find(r),this)}getError(e,t){let i=t?this.get(t):this;return i?.errors?i.errors[e]:null}hasError(e,t){return!!this.getError(e,t)}get root(){let e=this;for(;e._parent;)e=e._parent;return e}_updateControlsErrors(e,t,i){this.status=this._calculateStatus(),e&&this.statusChanges.emit(this.status),(e||i)&&this._events.next(new Oa(this.status,t)),this._parent&&this._parent._updateControlsErrors(e,t,i)}_initObservables(){this.valueChanges=new Rn,this.statusChanges=new Rn}_calculateStatus(){return this._allControlsDisabled()?Ol:this.errors?yh:this._hasOwnPendingAsyncValidator||this._anyControlsHaveStatus(Fa)?Fa:this._anyControlsHaveStatus(yh)?yh:Fl}_anyControlsHaveStatus(e){return this._anyControls(t=>t.status===e)}_anyControlsDirty(){return this._anyControls(e=>e.dirty)}_anyControlsTouched(){return this._anyControls(e=>e.touched)}_updatePristine(e,t){let i=!this._anyControlsDirty(),r=this.pristine!==i;this.pristine=i,e.onlySelf||this._parent?._updatePristine(e,t),r&&this._events.next(new Ll(this.pristine,t))}_updateTouched(e={},t){this.touched=this._anyControlsTouched(),this._events.next(new kl(this.touched,t)),e.onlySelf||this._parent?._updateTouched(e,t)}_onDisabledChange=[];_registerOnCollectionChange(e){this._onCollectionChange=e}_setUpdateStrategy(e){Sh(e)&&e.updateOn!=null&&(this._updateOn=e.updateOn)}_parentMarkedDirty(e){return!e&&!!this._parent?.dirty&&!this._parent._anyControlsDirty()}_find(e){return null}_assignValidators(e){this._rawValidators=Array.isArray(e)?e.slice():e,this._composedValidatorFn=Kk(this._rawValidators)}_assignAsyncValidators(e){this._rawAsyncValidators=Array.isArray(e)?e.slice():e,this._composedAsyncValidatorFn=e3(this._rawAsyncValidators)}};var gT=new He("",{factory:()=>o0}),o0="always";function t3(n,e){return[...e.path,n]}function n3(n,e,t=o0){r3(n,e),e.valueAccessor.writeValue(n.value),(n.disabled||t==="always")&&e.valueAccessor.setDisabledState?.(n.disabled),o3(n,e),a3(n,e),s3(n,e),i3(n,e)}function nT(n,e){n.forEach(t=>{t.registerOnValidatorChange&&t.registerOnValidatorChange(e)})}function i3(n,e){if(e.valueAccessor.setDisabledState){let t=i=>{e.valueAccessor.setDisabledState(i)};n.registerOnDisabledChange(t),e._registerOnDestroy(()=>{n._unregisterOnDisabledChange(t)})}}function r3(n,e){let t=Yk(n);e.validator!==null?n.setValidators(QC(t,e.validator)):typeof t=="function"&&n.setValidators([t]);let i=Zk(n);e.asyncValidator!==null?n.setAsyncValidators(QC(i,e.asyncValidator)):typeof i=="function"&&n.setAsyncValidators([i]);let r=()=>n.updateValueAndValidity();nT(e._rawValidators,r),nT(e._rawAsyncValidators,r)}function o3(n,e){e.valueAccessor.registerOnChange(t=>{n._pendingValue=t,n._pendingChange=!0,n._pendingDirty=!0,n.updateOn==="change"&&yT(n,e)})}function s3(n,e){e.valueAccessor.registerOnTouched(()=>{n._pendingTouched=!0,n.updateOn==="blur"&&n._pendingChange&&yT(n,e),n.updateOn!=="submit"&&n.markAsTouched()})}function yT(n,e){n._pendingDirty&&n.markAsDirty(),n.setValue(n._pendingValue,{emitModelToViewChange:!1}),e.viewToModelUpdate(n._pendingValue),n._pendingChange=!1}function a3(n,e){let t=(i,r)=>{e.valueAccessor.writeValue(i),r&&e.viewToModelUpdate(i)};n.registerOnChange(t),e._registerOnDestroy(()=>{n._unregisterOnChange(t)})}function c3(n,e){if(!n.hasOwnProperty("model"))return!1;let t=n.model;return t.isFirstChange()?!0:!Object.is(e,t.currentValue)}function l3(n){return Object.getPrototypeOf(n.constructor)===bh}function u3(n,e){if(!e)return null;Array.isArray(e);let t,i,r;return e.forEach(o=>{o.constructor===cT?t=o:l3(o)?i=o:r=o}),r||i||t||null}function iT(n,e){let t=n.indexOf(e);t>-1&&n.splice(t,1)}function rT(n){return typeof n=="object"&&n!==null&&Object.keys(n).length===2&&"value"in n&&"disabled"in n}var d3=class extends r0{defaultValue=null;_onChange=[];_pendingValue;_pendingChange=!1;constructor(e=null,t,i){super(Jk(t),Qk(i,t)),this._applyFormState(e),this._setUpdateStrategy(t),this._initObservables(),this.updateValueAndValidity({onlySelf:!0,emitEvent:!!this.asyncValidator}),Sh(t)&&(t.nonNullable||t.initialValueIsDefault)&&(rT(e)?this.defaultValue=e.value:this.defaultValue=e)}setValue(e,t={}){this.value=this._pendingValue=e,this._onChange.length&&t.emitModelToViewChange!==!1&&this._onChange.forEach(i=>i(this.value,t.emitViewToModelChange!==!1)),this.updateValueAndValidity(t)}patchValue(e,t={}){this.setValue(e,t)}reset(e=this.defaultValue,t={}){this._applyFormState(e),this.markAsPristine(t),this.markAsUntouched(t),this.setValue(this.value,t),t.overwriteDefaultValue&&(this.defaultValue=this.value),this._pendingChange=!1,t?.emitEvent!==!1&&this._events.next(new i0(this))}_updateValue(){}_anyControls(e){return!1}_allControlsDisabled(){return this.disabled}registerOnChange(e){this._onChange.push(e)}_unregisterOnChange(e){iT(this._onChange,e)}registerOnDisabledChange(e){this._onDisabledChange.push(e)}_unregisterOnDisabledChange(e){iT(this._onDisabledChange,e)}_forEachChild(e){}_syncPendingControls(){return this.updateOn==="submit"&&(this._pendingDirty&&this.markAsDirty(),this._pendingTouched&&this.markAsTouched(),this._pendingChange)?(this.setValue(this._pendingValue,{onlySelf:!0,emitModelToViewChange:!1}),!0):!1}_applyFormState(e){rT(e)?(this.value=this._pendingValue=e.value,e.disabled?this.disable({onlySelf:!0,emitEvent:!1}):this.enable({onlySelf:!0,emitEvent:!1})):this.value=this._pendingValue=e}};var f3={provide:Ul,useExisting:Yi(()=>h3)},oT=Promise.resolve(),h3=(()=>{class n extends Ul{_changeDetectorRef;callSetDisabledState;control=new d3;static ngAcceptInputType_isDisabled;_registered=!1;viewModel;name="";isDisabled;model;options;update=new Rn;constructor(t,i,r,o,s,a){super(),this._changeDetectorRef=s,this.callSetDisabledState=a,this._parent=t,this._setValidators(i),this._setAsyncValidators(r),this.valueAccessor=u3(this,o)}ngOnChanges(t){if(this._checkForErrors(),!this._registered||"name"in t){if(this._registered&&(this._checkName(),this.formDirective)){let i=t.name.previousValue;this.formDirective.removeControl({name:i,path:this._getPath(i)})}this._setUpControl()}"isDisabled"in t&&this._updateDisabled(t),c3(t,this.viewModel)&&(this._updateValue(this.model),this.viewModel=this.model)}ngOnDestroy(){this.formDirective?.removeControl(this)}get path(){return this._getPath(this.name)}get formDirective(){return this._parent?this._parent.formDirective:null}viewToModelUpdate(t){this.viewModel=t,this.update.emit(t)}_setUpControl(){this._setUpdateStrategy(),this._isStandalone()?this._setUpStandalone():this.formDirective.addControl(this),this._registered=!0}_setUpdateStrategy(){this.options&&this.options.updateOn!=null&&(this.control._updateOn=this.options.updateOn)}_isStandalone(){return!this._parent||!!(this.options&&this.options.standalone)}_setUpStandalone(){n3(this.control,this,this.callSetDisabledState),this.control.updateValueAndValidity({emitEvent:!1})}_checkForErrors(){this._checkName()}_checkName(){this.options&&this.options.name&&(this.name=this.options.name),!this._isStandalone()&&this.name}_updateValue(t){oT.then(()=>{this.control.setValue(t,{emitViewToModelChange:!1}),this._changeDetectorRef?.markForCheck()})}_updateDisabled(t){let i=t.isDisabled.currentValue,r=i!==0&&NC(i);oT.then(()=>{r&&!this.control.disabled?this.control.disable():!r&&this.control.disabled&&this.control.enable(),this._changeDetectorRef?.markForCheck()})}_getPath(t){return this._parent?t3(t,this._parent):[t]}static \u0275fac=function(i){return new(i||n)(nt(t0,9),nt(jk,10),nt(Wk,10),nt(Bl,10),nt(fs,8),nt(gT,8))};static \u0275dir=Sn({type:n,selectors:[["","ngModel","",3,"formControlName","",3,"formControl",""]],inputs:{name:"name",isDisabled:[0,"disabled","isDisabled"],model:[0,"ngModel","model"],options:[0,"ngModelOptions","options"]},outputs:{update:"ngModelChange"},exportAs:["ngModel"],standalone:!1,features:[ds([f3]),er,vl]})}return n})();var p3={provide:Bl,useExisting:Yi(()=>_T),multi:!0};function vT(n,e){return n==null?`${e}`:(e&&typeof e=="object"&&(e="Object"),`${n}: ${e}`.slice(0,50))}function m3(n){return n.split(":")[0]}var _T=(()=>{class n extends bh{value;_optionMap=new Map;_idCounter=0;set compareWith(t){this._compareWith=t}_compareWith=Object.is;appRefInjector=be(cs).injector;destroyRef=be(co);cdr=be(fs);_queuedWrite=!1;_writeValueAfterRender(){this._queuedWrite||this.appRefInjector.destroyed||(this._queuedWrite=!0,u_({write:()=>{this.destroyRef.destroyed||(this._queuedWrite=!1,this.writeValue(this.value))}},{injector:this.appRefInjector}))}writeValue(t){this.cdr.markForCheck(),this.value=t;let i=this._getOptionId(t),r=vT(i,t);this.setProperty("value",r)}registerOnChange(t){this.onChange=i=>{this.value=this._getOptionValue(i),t(this.value)}}_registerOption(){return(this._idCounter++).toString()}_getOptionId(t){for(let i of this._optionMap.keys())if(this._compareWith(this._optionMap.get(i),t))return i;return null}_getOptionValue(t){let i=m3(t);return this._optionMap.has(i)?this._optionMap.get(i):t}static \u0275fac=(()=>{let t;return function(r){return(t||(t=xa(n)))(r||n)}})();static \u0275dir=Sn({type:n,selectors:[["select","formControlName","",3,"multiple",""],["select","formControl","",3,"multiple",""],["select","ngModel","",3,"multiple",""]],hostBindings:function(i,r){i&1&&Ir("change",function(s){return r.onChange(s.target.value)})("blur",function(){return r.onTouched()})},inputs:{compareWith:"compareWith"},standalone:!1,features:[ds([p3]),er]})}return n})(),Xee=(()=>{class n{_element;_renderer;_select;id;constructor(t,i,r){this._element=t,this._renderer=i,this._select=r,this._select&&(this.id=this._select._registerOption())}set ngValue(t){this._select!=null&&(this._select._optionMap.set(this.id,t),this._setElementValue(vT(this.id,t)),this._select._writeValueAfterRender())}set value(t){this._setElementValue(t),this._select?._writeValueAfterRender()}_setElementValue(t){this._renderer.setProperty(this._element.nativeElement,"value",t)}ngOnDestroy(){this._select?._optionMap.delete(this.id),this._select?._writeValueAfterRender()}static \u0275fac=function(i){return new(i||n)(nt(Fn),nt(Ar),nt(_T,9))};static \u0275dir=Sn({type:n,selectors:[["option"]],inputs:{ngValue:"ngValue",value:"value"},standalone:!1})}return n})(),g3={provide:Bl,useExisting:Yi(()=>xT),multi:!0};function sT(n,e){return n==null?`${e}`:(typeof e=="string"&&(e=`'${e}'`),e&&typeof e=="object"&&(e="Object"),`${n}: ${e}`.slice(0,50))}function y3(n){return n.split(":")[0]}var xT=(()=>{class n extends bh{value;_optionMap=new Map;_idCounter=0;set compareWith(t){this._compareWith=t}_compareWith=Object.is;writeValue(t){this.value=t;let i;if(Array.isArray(t)){let r=t.map(o=>this._getOptionId(o));i=(o,s)=>{o._setSelected(r.indexOf(s)>-1)}}else i=r=>{r._setSelected(!1)};this._optionMap.forEach(i)}registerOnChange(t){this.onChange=i=>{let r=[],o=i.selectedOptions;if(o!==void 0){let s=o;for(let a=0;a<s.length;a++){let c=s[a],l=this._getOptionValue(c.value);r.push(l)}}else{let s=i.options;for(let a=0;a<s.length;a++){let c=s[a];if(c.selected){let l=this._getOptionValue(c.value);r.push(l)}}}this.value=r,t(r)}}_registerOption(t){let i=(this._idCounter++).toString();return this._optionMap.set(i,t),i}_getOptionId(t){for(let i of this._optionMap.keys())if(this._compareWith(this._optionMap.get(i)._value,t))return i;return null}_getOptionValue(t){let i=y3(t);return this._optionMap.has(i)?this._optionMap.get(i)._value:t}static \u0275fac=(()=>{let t;return function(r){return(t||(t=xa(n)))(r||n)}})();static \u0275dir=Sn({type:n,selectors:[["select","multiple","","formControlName",""],["select","multiple","","formControl",""],["select","multiple","","ngModel",""]],hostBindings:function(i,r){i&1&&Ir("change",function(s){return r.onChange(s.target)})("blur",function(){return r.onTouched()})},inputs:{compareWith:"compareWith"},standalone:!1,features:[ds([g3]),er]})}return n})(),Yee=(()=>{class n{_element;_renderer;_select;id;_value;constructor(t,i,r){this._element=t,this._renderer=i,this._select=r,this._select&&(this.id=this._select._registerOption(this))}set ngValue(t){this._select!=null&&(this._value=t,this._setElementValue(sT(this.id,t)),this._select.writeValue(this._select.value))}set value(t){this._select?(this._value=t,this._setElementValue(sT(this.id,t)),this._select.writeValue(this._select.value)):this._setElementValue(t)}_setElementValue(t){this._renderer.setProperty(this._element.nativeElement,"value",t)}_setSelected(t){this._renderer.setProperty(this._element.nativeElement,"selected",t)}ngOnDestroy(){this._select&&(this._select._optionMap.delete(this.id),this._select.writeValue(this._select.value))}static \u0275fac=function(i){return new(i||n)(nt(Fn),nt(Ar),nt(xT,9))};static \u0275dir=Sn({type:n,selectors:[["option"]],inputs:{ngValue:"ngValue",value:"value"},standalone:!1})}return n})();var v3=(()=>{class n{static \u0275fac=function(i){return new(i||n)};static \u0275mod=ss({type:n});static \u0275inj=Jr({})}return n})();var Zee=(()=>{class n{static withConfig(t){return{ngModule:n,providers:[{provide:gT,useValue:t.callSetDisabledState??o0}]}}static \u0275fac=function(i){return new(i||n)};static \u0275mod=ss({type:n});static \u0275inj=Jr({imports:[v3]})}return n})();function gs(n,e){return n==null||e==null?NaN:n<e?-1:n>e?1:n>=e?0:NaN}function s0(n,e){return n==null||e==null?NaN:e<n?-1:e>n?1:e>=n?0:NaN}function Mh(n){let e,t,i;n.length!==2?(e=gs,t=(a,c)=>gs(n(a),c),i=(a,c)=>n(a)-c):(e=n===gs||n===s0?n:_3,t=n,i=n);function r(a,c,l=0,u=a.length){if(l<u){if(e(c,c)!==0)return u;do{let d=l+u>>>1;t(a[d],c)<0?l=d+1:u=d}while(l<u)}return l}function o(a,c,l=0,u=a.length){if(l<u){if(e(c,c)!==0)return u;do{let d=l+u>>>1;t(a[d],c)<=0?l=d+1:u=d}while(l<u)}return l}function s(a,c,l=0,u=a.length){let d=r(a,c,l,u-1);return d>l&&i(a[d-1],c)>-i(a[d],c)?d-1:d}return{left:r,center:s,right:o}}function _3(){return 0}function a0(n){return n===null?NaN:+n}var bT=Mh(gs),ST=bT.right,x3=bT.left,b3=Mh(a0).center,Vl=ST;var S3=Math.sqrt(50),M3=Math.sqrt(10),E3=Math.sqrt(2);function Eh(n,e,t){let i=(e-n)/Math.max(0,t),r=Math.floor(Math.log10(i)),o=i/Math.pow(10,r),s=o>=S3?10:o>=M3?5:o>=E3?2:1,a,c,l;return r<0?(l=Math.pow(10,-r)/s,a=Math.round(n*l),c=Math.round(e*l),a/l<n&&++a,c/l>e&&--c,l=-l):(l=Math.pow(10,r)*s,a=Math.round(n/l),c=Math.round(e/l),a*l<n&&++a,c*l>e&&--c),c<a&&.5<=t&&t<2?Eh(n,e,t*2):[a,c,l]}function wh(n,e,t){if(e=+e,n=+n,t=+t,!(t>0))return[];if(n===e)return[n];let i=e<n,[r,o,s]=i?Eh(e,n,t):Eh(n,e,t);if(!(o>=r))return[];let a=o-r+1,c=new Array(a);if(i)if(s<0)for(let l=0;l<a;++l)c[l]=(o-l)/-s;else for(let l=0;l<a;++l)c[l]=(o-l)*s;else if(s<0)for(let l=0;l<a;++l)c[l]=(r+l)/-s;else for(let l=0;l<a;++l)c[l]=(r+l)*s;return c}function Hl(n,e,t){return e=+e,n=+n,t=+t,Eh(n,e,t)[2]}function c0(n,e,t){e=+e,n=+n,t=+t;let i=e<n,r=i?Hl(e,n,t):Hl(n,e,t);return(i?-1:1)*(r<0?1/-r:r)}function MT(n,e){let t;if(e===void 0)for(let i of n)i!=null&&(t<i||t===void 0&&i>=i)&&(t=i);else{let i=-1;for(let r of n)(r=e(r,++i,n))!=null&&(t<r||t===void 0&&r>=r)&&(t=r)}return t}function ET(n,e){let t;if(e===void 0)for(let i of n)i!=null&&(t>i||t===void 0&&i>=i)&&(t=i);else{let i=-1;for(let r of n)(r=e(r,++i,n))!=null&&(t>r||t===void 0&&r>=r)&&(t=r)}return t}var w3={value:()=>{}};function CT(){for(var n=0,e=arguments.length,t={},i;n<e;++n){if(!(i=arguments[n]+"")||i in t||/[\s.]/.test(i))throw new Error("illegal type: "+i);t[i]=[]}return new Ch(t)}function Ch(n){this._=n}function C3(n,e){return n.trim().split(/^|\s+/).map(function(t){var i="",r=t.indexOf(".");if(r>=0&&(i=t.slice(r+1),t=t.slice(0,r)),t&&!e.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:i}})}Ch.prototype=CT.prototype={constructor:Ch,on:function(n,e){var t=this._,i=C3(n+"",t),r,o=-1,s=i.length;if(arguments.length<2){for(;++o<s;)if((r=(n=i[o]).type)&&(r=T3(t[r],n.name)))return r;return}if(e!=null&&typeof e!="function")throw new Error("invalid callback: "+e);for(;++o<s;)if(r=(n=i[o]).type)t[r]=wT(t[r],n.name,e);else if(e==null)for(r in t)t[r]=wT(t[r],n.name,null);return this},copy:function(){var n={},e=this._;for(var t in e)n[t]=e[t].slice();return new Ch(n)},call:function(n,e){if((r=arguments.length-2)>0)for(var t=new Array(r),i=0,r,o;i<r;++i)t[i]=arguments[i+2];if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(o=this._[n],i=0,r=o.length;i<r;++i)o[i].value.apply(e,t)},apply:function(n,e,t){if(!this._.hasOwnProperty(n))throw new Error("unknown type: "+n);for(var i=this._[n],r=0,o=i.length;r<o;++r)i[r].value.apply(e,t)}};function T3(n,e){for(var t=0,i=n.length,r;t<i;++t)if((r=n[t]).name===e)return r.value}function wT(n,e,t){for(var i=0,r=n.length;i<r;++i)if(n[i].name===e){n[i]=w3,n=n.slice(0,i).concat(n.slice(i+1));break}return t!=null&&n.push({name:e,value:t}),n}var ys=CT;var Th="http://www.w3.org/1999/xhtml",l0={svg:"http://www.w3.org/2000/svg",xhtml:Th,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"};function Nr(n){var e=n+="",t=e.indexOf(":");return t>=0&&(e=n.slice(0,t))!=="xmlns"&&(n=n.slice(t+1)),l0.hasOwnProperty(e)?{space:l0[e],local:n}:n}function D3(n){return function(){var e=this.ownerDocument,t=this.namespaceURI;return t===Th&&e.documentElement.namespaceURI===Th?e.createElement(n):e.createElementNS(t,n)}}function A3(n){return function(){return this.ownerDocument.createElementNS(n.space,n.local)}}function Dh(n){var e=Nr(n);return(e.local?A3:D3)(e)}function I3(){}function vs(n){return n==null?I3:function(){return this.querySelector(n)}}function TT(n){typeof n!="function"&&(n=vs(n));for(var e=this._groups,t=e.length,i=new Array(t),r=0;r<t;++r)for(var o=e[r],s=o.length,a=i[r]=new Array(s),c,l,u=0;u<s;++u)(c=o[u])&&(l=n.call(c,c.__data__,u,o))&&("__data__"in c&&(l.__data__=c.__data__),a[u]=l);return new Bt(i,this._parents)}function u0(n){return n==null?[]:Array.isArray(n)?n:Array.from(n)}function R3(){return[]}function zl(n){return n==null?R3:function(){return this.querySelectorAll(n)}}function N3(n){return function(){return u0(n.apply(this,arguments))}}function DT(n){typeof n=="function"?n=N3(n):n=zl(n);for(var e=this._groups,t=e.length,i=[],r=[],o=0;o<t;++o)for(var s=e[o],a=s.length,c,l=0;l<a;++l)(c=s[l])&&(i.push(n.call(c,c.__data__,l,s)),r.push(c));return new Bt(i,r)}function Gl(n){return function(){return this.matches(n)}}function Ah(n){return function(e){return e.matches(n)}}var P3=Array.prototype.find;function F3(n){return function(){return P3.call(this.children,n)}}function O3(){return this.firstElementChild}function AT(n){return this.select(n==null?O3:F3(typeof n=="function"?n:Ah(n)))}var L3=Array.prototype.filter;function k3(){return Array.from(this.children)}function U3(n){return function(){return L3.call(this.children,n)}}function IT(n){return this.selectAll(n==null?k3:U3(typeof n=="function"?n:Ah(n)))}function RT(n){typeof n!="function"&&(n=Gl(n));for(var e=this._groups,t=e.length,i=new Array(t),r=0;r<t;++r)for(var o=e[r],s=o.length,a=i[r]=[],c,l=0;l<s;++l)(c=o[l])&&n.call(c,c.__data__,l,o)&&a.push(c);return new Bt(i,this._parents)}function Ih(n){return new Array(n.length)}function NT(){return new Bt(this._enter||this._groups.map(Ih),this._parents)}function jl(n,e){this.ownerDocument=n.ownerDocument,this.namespaceURI=n.namespaceURI,this._next=null,this._parent=n,this.__data__=e}jl.prototype={constructor:jl,appendChild:function(n){return this._parent.insertBefore(n,this._next)},insertBefore:function(n,e){return this._parent.insertBefore(n,e)},querySelector:function(n){return this._parent.querySelector(n)},querySelectorAll:function(n){return this._parent.querySelectorAll(n)}};function PT(n){return function(){return n}}function B3(n,e,t,i,r,o){for(var s=0,a,c=e.length,l=o.length;s<l;++s)(a=e[s])?(a.__data__=o[s],i[s]=a):t[s]=new jl(n,o[s]);for(;s<c;++s)(a=e[s])&&(r[s]=a)}function V3(n,e,t,i,r,o,s){var a,c,l=new Map,u=e.length,d=o.length,f=new Array(u),h;for(a=0;a<u;++a)(c=e[a])&&(f[a]=h=s.call(c,c.__data__,a,e)+"",l.has(h)?r[a]=c:l.set(h,c));for(a=0;a<d;++a)h=s.call(n,o[a],a,o)+"",(c=l.get(h))?(i[a]=c,c.__data__=o[a],l.delete(h)):t[a]=new jl(n,o[a]);for(a=0;a<u;++a)(c=e[a])&&l.get(f[a])===c&&(r[a]=c)}function H3(n){return n.__data__}function FT(n,e){if(!arguments.length)return Array.from(this,H3);var t=e?V3:B3,i=this._parents,r=this._groups;typeof n!="function"&&(n=PT(n));for(var o=r.length,s=new Array(o),a=new Array(o),c=new Array(o),l=0;l<o;++l){var u=i[l],d=r[l],f=d.length,h=z3(n.call(u,u&&u.__data__,l,i)),g=h.length,y=a[l]=new Array(g),p=s[l]=new Array(g),m=c[l]=new Array(f);t(u,d,y,p,m,h,e);for(var x=0,E=0,_,M;x<g;++x)if(_=y[x]){for(x>=E&&(E=x+1);!(M=p[E])&&++E<g;);_._next=M||null}}return s=new Bt(s,i),s._enter=a,s._exit=c,s}function z3(n){return typeof n=="object"&&"length"in n?n:Array.from(n)}function OT(){return new Bt(this._exit||this._groups.map(Ih),this._parents)}function LT(n,e,t){var i=this.enter(),r=this,o=this.exit();return typeof n=="function"?(i=n(i),i&&(i=i.selection())):i=i.append(n+""),e!=null&&(r=e(r),r&&(r=r.selection())),t==null?o.remove():t(o),i&&r?i.merge(r).order():r}function kT(n){for(var e=n.selection?n.selection():n,t=this._groups,i=e._groups,r=t.length,o=i.length,s=Math.min(r,o),a=new Array(r),c=0;c<s;++c)for(var l=t[c],u=i[c],d=l.length,f=a[c]=new Array(d),h,g=0;g<d;++g)(h=l[g]||u[g])&&(f[g]=h);for(;c<r;++c)a[c]=t[c];return new Bt(a,this._parents)}function UT(){for(var n=this._groups,e=-1,t=n.length;++e<t;)for(var i=n[e],r=i.length-1,o=i[r],s;--r>=0;)(s=i[r])&&(o&&s.compareDocumentPosition(o)^4&&o.parentNode.insertBefore(s,o),o=s);return this}function BT(n){n||(n=G3);function e(d,f){return d&&f?n(d.__data__,f.__data__):!d-!f}for(var t=this._groups,i=t.length,r=new Array(i),o=0;o<i;++o){for(var s=t[o],a=s.length,c=r[o]=new Array(a),l,u=0;u<a;++u)(l=s[u])&&(c[u]=l);c.sort(e)}return new Bt(r,this._parents).order()}function G3(n,e){return n<e?-1:n>e?1:n>=e?0:NaN}function VT(){var n=arguments[0];return arguments[0]=this,n.apply(null,arguments),this}function HT(){return Array.from(this)}function zT(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],r=0,o=i.length;r<o;++r){var s=i[r];if(s)return s}return null}function GT(){let n=0;for(let e of this)++n;return n}function jT(){return!this.node()}function WT(n){for(var e=this._groups,t=0,i=e.length;t<i;++t)for(var r=e[t],o=0,s=r.length,a;o<s;++o)(a=r[o])&&n.call(a,a.__data__,o,r);return this}function j3(n){return function(){this.removeAttribute(n)}}function W3(n){return function(){this.removeAttributeNS(n.space,n.local)}}function $3(n,e){return function(){this.setAttribute(n,e)}}function q3(n,e){return function(){this.setAttributeNS(n.space,n.local,e)}}function X3(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttribute(n):this.setAttribute(n,t)}}function Y3(n,e){return function(){var t=e.apply(this,arguments);t==null?this.removeAttributeNS(n.space,n.local):this.setAttributeNS(n.space,n.local,t)}}function $T(n,e){var t=Nr(n);if(arguments.length<2){var i=this.node();return t.local?i.getAttributeNS(t.space,t.local):i.getAttribute(t)}return this.each((e==null?t.local?W3:j3:typeof e=="function"?t.local?Y3:X3:t.local?q3:$3)(t,e))}function Rh(n){return n.ownerDocument&&n.ownerDocument.defaultView||n.document&&n||n.defaultView}function Z3(n){return function(){this.style.removeProperty(n)}}function J3(n,e,t){return function(){this.style.setProperty(n,e,t)}}function K3(n,e,t){return function(){var i=e.apply(this,arguments);i==null?this.style.removeProperty(n):this.style.setProperty(n,i,t)}}function qT(n,e,t){return arguments.length>1?this.each((e==null?Z3:typeof e=="function"?K3:J3)(n,e,t??"")):yo(this.node(),n)}function yo(n,e){return n.style.getPropertyValue(e)||Rh(n).getComputedStyle(n,null).getPropertyValue(e)}function Q3(n){return function(){delete this[n]}}function eU(n,e){return function(){this[n]=e}}function tU(n,e){return function(){var t=e.apply(this,arguments);t==null?delete this[n]:this[n]=t}}function XT(n,e){return arguments.length>1?this.each((e==null?Q3:typeof e=="function"?tU:eU)(n,e)):this.node()[n]}function YT(n){return n.trim().split(/^|\s+/)}function d0(n){return n.classList||new ZT(n)}function ZT(n){this._node=n,this._names=YT(n.getAttribute("class")||"")}ZT.prototype={add:function(n){var e=this._names.indexOf(n);e<0&&(this._names.push(n),this._node.setAttribute("class",this._names.join(" ")))},remove:function(n){var e=this._names.indexOf(n);e>=0&&(this._names.splice(e,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(n){return this._names.indexOf(n)>=0}};function JT(n,e){for(var t=d0(n),i=-1,r=e.length;++i<r;)t.add(e[i])}function KT(n,e){for(var t=d0(n),i=-1,r=e.length;++i<r;)t.remove(e[i])}function nU(n){return function(){JT(this,n)}}function iU(n){return function(){KT(this,n)}}function rU(n,e){return function(){(e.apply(this,arguments)?JT:KT)(this,n)}}function QT(n,e){var t=YT(n+"");if(arguments.length<2){for(var i=d0(this.node()),r=-1,o=t.length;++r<o;)if(!i.contains(t[r]))return!1;return!0}return this.each((typeof e=="function"?rU:e?nU:iU)(t,e))}function oU(){this.textContent=""}function sU(n){return function(){this.textContent=n}}function aU(n){return function(){var e=n.apply(this,arguments);this.textContent=e??""}}function eD(n){return arguments.length?this.each(n==null?oU:(typeof n=="function"?aU:sU)(n)):this.node().textContent}function cU(){this.innerHTML=""}function lU(n){return function(){this.innerHTML=n}}function uU(n){return function(){var e=n.apply(this,arguments);this.innerHTML=e??""}}function tD(n){return arguments.length?this.each(n==null?cU:(typeof n=="function"?uU:lU)(n)):this.node().innerHTML}function dU(){this.nextSibling&&this.parentNode.appendChild(this)}function nD(){return this.each(dU)}function fU(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function iD(){return this.each(fU)}function rD(n){var e=typeof n=="function"?n:Dh(n);return this.select(function(){return this.appendChild(e.apply(this,arguments))})}function hU(){return null}function oD(n,e){var t=typeof n=="function"?n:Dh(n),i=e==null?hU:typeof e=="function"?e:vs(e);return this.select(function(){return this.insertBefore(t.apply(this,arguments),i.apply(this,arguments)||null)})}function pU(){var n=this.parentNode;n&&n.removeChild(this)}function sD(){return this.each(pU)}function mU(){var n=this.cloneNode(!1),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function gU(){var n=this.cloneNode(!0),e=this.parentNode;return e?e.insertBefore(n,this.nextSibling):n}function aD(n){return this.select(n?gU:mU)}function cD(n){return arguments.length?this.property("__data__",n):this.node().__data__}function yU(n){return function(e){n.call(this,e,this.__data__)}}function vU(n){return n.trim().split(/^|\s+/).map(function(e){var t="",i=e.indexOf(".");return i>=0&&(t=e.slice(i+1),e=e.slice(0,i)),{type:e,name:t}})}function _U(n){return function(){var e=this.__on;if(e){for(var t=0,i=-1,r=e.length,o;t<r;++t)o=e[t],(!n.type||o.type===n.type)&&o.name===n.name?this.removeEventListener(o.type,o.listener,o.options):e[++i]=o;++i?e.length=i:delete this.__on}}}function xU(n,e,t){return function(){var i=this.__on,r,o=yU(e);if(i){for(var s=0,a=i.length;s<a;++s)if((r=i[s]).type===n.type&&r.name===n.name){this.removeEventListener(r.type,r.listener,r.options),this.addEventListener(r.type,r.listener=o,r.options=t),r.value=e;return}}this.addEventListener(n.type,o,t),r={type:n.type,name:n.name,value:e,listener:o,options:t},i?i.push(r):this.__on=[r]}}function lD(n,e,t){var i=vU(n+""),r,o=i.length,s;if(arguments.length<2){var a=this.node().__on;if(a){for(var c=0,l=a.length,u;c<l;++c)for(r=0,u=a[c];r<o;++r)if((s=i[r]).type===u.type&&s.name===u.name)return u.value}return}for(a=e?xU:_U,r=0;r<o;++r)this.each(a(i[r],e,t));return this}function uD(n,e,t){var i=Rh(n),r=i.CustomEvent;typeof r=="function"?r=new r(e,t):(r=i.document.createEvent("Event"),t?(r.initEvent(e,t.bubbles,t.cancelable),r.detail=t.detail):r.initEvent(e,!1,!1)),n.dispatchEvent(r)}function bU(n,e){return function(){return uD(this,n,e)}}function SU(n,e){return function(){return uD(this,n,e.apply(this,arguments))}}function dD(n,e){return this.each((typeof e=="function"?SU:bU)(n,e))}function*fD(){for(var n=this._groups,e=0,t=n.length;e<t;++e)for(var i=n[e],r=0,o=i.length,s;r<o;++r)(s=i[r])&&(yield s)}var f0=[null];function Bt(n,e){this._groups=n,this._parents=e}function hD(){return new Bt([[document.documentElement]],f0)}function MU(){return this}Bt.prototype=hD.prototype={constructor:Bt,select:TT,selectAll:DT,selectChild:AT,selectChildren:IT,filter:RT,data:FT,enter:NT,exit:OT,join:LT,merge:kT,selection:MU,order:UT,sort:BT,call:VT,nodes:HT,node:zT,size:GT,empty:jT,each:WT,attr:$T,style:qT,property:XT,classed:QT,text:eD,html:tD,raise:nD,lower:iD,append:rD,insert:oD,remove:sD,clone:aD,datum:cD,on:lD,dispatch:dD,[Symbol.iterator]:fD};var Pr=hD;function ir(n){return typeof n=="string"?new Bt([[document.querySelector(n)]],[document.documentElement]):new Bt([[n]],f0)}function pD(n){let e;for(;e=n.sourceEvent;)n=e;return n}function Nh(n,e){if(n=pD(n),e===void 0&&(e=n.currentTarget),e){var t=e.ownerSVGElement||e;if(t.createSVGPoint){var i=t.createSVGPoint();return i.x=n.clientX,i.y=n.clientY,i=i.matrixTransform(e.getScreenCTM().inverse()),[i.x,i.y]}if(e.getBoundingClientRect){var r=e.getBoundingClientRect();return[n.clientX-r.left-e.clientLeft,n.clientY-r.top-e.clientTop]}}return[n.pageX,n.pageY]}var Ph={capture:!0,passive:!1};function Fh(n){n.preventDefault(),n.stopImmediatePropagation()}function h0(n){var e=n.document.documentElement,t=ir(n).on("dragstart.drag",Fh,Ph);"onselectstart"in e?t.on("selectstart.drag",Fh,Ph):(e.__noselect=e.style.MozUserSelect,e.style.MozUserSelect="none")}function p0(n,e){var t=n.document.documentElement,i=ir(n).on("dragstart.drag",null);e&&(i.on("click.drag",Fh,Ph),setTimeout(function(){i.on("click.drag",null)},0)),"onselectstart"in t?i.on("selectstart.drag",null):(t.style.MozUserSelect=t.__noselect,delete t.__noselect)}function Oh(n,e,t){n.prototype=e.prototype=t,t.constructor=n}function m0(n,e){var t=Object.create(n.prototype);for(var i in e)t[i]=e[i];return t}function ql(){}var Wl=.7,Uh=1/Wl,La="\\s*([+-]?\\d+)\\s*",$l="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",rr="\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",EU=/^#([0-9a-f]{3,8})$/,wU=new RegExp(`^rgb\\(${La},${La},${La}\\)$`),CU=new RegExp(`^rgb\\(${rr},${rr},${rr}\\)$`),TU=new RegExp(`^rgba\\(${La},${La},${La},${$l}\\)$`),DU=new RegExp(`^rgba\\(${rr},${rr},${rr},${$l}\\)$`),AU=new RegExp(`^hsl\\(${$l},${rr},${rr}\\)$`),IU=new RegExp(`^hsla\\(${$l},${rr},${rr},${$l}\\)$`),mD={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};Oh(ql,Pi,{copy(n){return Object.assign(new this.constructor,this,n)},displayable(){return this.rgb().displayable()},hex:gD,formatHex:gD,formatHex8:RU,formatHsl:NU,formatRgb:yD,toString:yD});function gD(){return this.rgb().formatHex()}function RU(){return this.rgb().formatHex8()}function NU(){return MD(this).formatHsl()}function yD(){return this.rgb().formatRgb()}function Pi(n){var e,t;return n=(n+"").trim().toLowerCase(),(e=EU.exec(n))?(t=e[1].length,e=parseInt(e[1],16),t===6?vD(e):t===3?new Yn(e>>8&15|e>>4&240,e>>4&15|e&240,(e&15)<<4|e&15,1):t===8?Lh(e>>24&255,e>>16&255,e>>8&255,(e&255)/255):t===4?Lh(e>>12&15|e>>8&240,e>>8&15|e>>4&240,e>>4&15|e&240,((e&15)<<4|e&15)/255):null):(e=wU.exec(n))?new Yn(e[1],e[2],e[3],1):(e=CU.exec(n))?new Yn(e[1]*255/100,e[2]*255/100,e[3]*255/100,1):(e=TU.exec(n))?Lh(e[1],e[2],e[3],e[4]):(e=DU.exec(n))?Lh(e[1]*255/100,e[2]*255/100,e[3]*255/100,e[4]):(e=AU.exec(n))?bD(e[1],e[2]/100,e[3]/100,1):(e=IU.exec(n))?bD(e[1],e[2]/100,e[3]/100,e[4]):mD.hasOwnProperty(n)?vD(mD[n]):n==="transparent"?new Yn(NaN,NaN,NaN,0):null}function vD(n){return new Yn(n>>16&255,n>>8&255,n&255,1)}function Lh(n,e,t,i){return i<=0&&(n=e=t=NaN),new Yn(n,e,t,i)}function PU(n){return n instanceof ql||(n=Pi(n)),n?(n=n.rgb(),new Yn(n.r,n.g,n.b,n.opacity)):new Yn}function ka(n,e,t,i){return arguments.length===1?PU(n):new Yn(n,e,t,i??1)}function Yn(n,e,t,i){this.r=+n,this.g=+e,this.b=+t,this.opacity=+i}Oh(Yn,ka,m0(ql,{brighter(n){return n=n==null?Uh:Math.pow(Uh,n),new Yn(this.r*n,this.g*n,this.b*n,this.opacity)},darker(n){return n=n==null?Wl:Math.pow(Wl,n),new Yn(this.r*n,this.g*n,this.b*n,this.opacity)},rgb(){return this},clamp(){return new Yn(xs(this.r),xs(this.g),xs(this.b),Bh(this.opacity))},displayable(){return-.5<=this.r&&this.r<255.5&&-.5<=this.g&&this.g<255.5&&-.5<=this.b&&this.b<255.5&&0<=this.opacity&&this.opacity<=1},hex:_D,formatHex:_D,formatHex8:FU,formatRgb:xD,toString:xD}));function _D(){return`#${_s(this.r)}${_s(this.g)}${_s(this.b)}`}function FU(){return`#${_s(this.r)}${_s(this.g)}${_s(this.b)}${_s((isNaN(this.opacity)?1:this.opacity)*255)}`}function xD(){let n=Bh(this.opacity);return`${n===1?"rgb(":"rgba("}${xs(this.r)}, ${xs(this.g)}, ${xs(this.b)}${n===1?")":`, ${n})`}`}function Bh(n){return isNaN(n)?1:Math.max(0,Math.min(1,n))}function xs(n){return Math.max(0,Math.min(255,Math.round(n)||0))}function _s(n){return n=xs(n),(n<16?"0":"")+n.toString(16)}function bD(n,e,t,i){return i<=0?n=e=t=NaN:t<=0||t>=1?n=e=NaN:e<=0&&(n=NaN),new Ni(n,e,t,i)}function MD(n){if(n instanceof Ni)return new Ni(n.h,n.s,n.l,n.opacity);if(n instanceof ql||(n=Pi(n)),!n)return new Ni;if(n instanceof Ni)return n;n=n.rgb();var e=n.r/255,t=n.g/255,i=n.b/255,r=Math.min(e,t,i),o=Math.max(e,t,i),s=NaN,a=o-r,c=(o+r)/2;return a?(e===o?s=(t-i)/a+(t<i)*6:t===o?s=(i-e)/a+2:s=(e-t)/a+4,a/=c<.5?o+r:2-o-r,s*=60):a=c>0&&c<1?0:s,new Ni(s,a,c,n.opacity)}function ED(n,e,t,i){return arguments.length===1?MD(n):new Ni(n,e,t,i??1)}function Ni(n,e,t,i){this.h=+n,this.s=+e,this.l=+t,this.opacity=+i}Oh(Ni,ED,m0(ql,{brighter(n){return n=n==null?Uh:Math.pow(Uh,n),new Ni(this.h,this.s,this.l*n,this.opacity)},darker(n){return n=n==null?Wl:Math.pow(Wl,n),new Ni(this.h,this.s,this.l*n,this.opacity)},rgb(){var n=this.h%360+(this.h<0)*360,e=isNaN(n)||isNaN(this.s)?0:this.s,t=this.l,i=t+(t<.5?t:1-t)*e,r=2*t-i;return new Yn(g0(n>=240?n-240:n+120,r,i),g0(n,r,i),g0(n<120?n+240:n-120,r,i),this.opacity)},clamp(){return new Ni(SD(this.h),kh(this.s),kh(this.l),Bh(this.opacity))},displayable(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1},formatHsl(){let n=Bh(this.opacity);return`${n===1?"hsl(":"hsla("}${SD(this.h)}, ${kh(this.s)*100}%, ${kh(this.l)*100}%${n===1?")":`, ${n})`}`}}));function SD(n){return n=(n||0)%360,n<0?n+360:n}function kh(n){return Math.max(0,Math.min(1,n||0))}function g0(n,e,t){return(n<60?e+(t-e)*n/60:n<180?t:n<240?e+(t-e)*(240-n)/60:e)*255}function y0(n,e,t,i,r){var o=n*n,s=o*n;return((1-3*n+3*o-s)*e+(4-6*o+3*s)*t+(1+3*n+3*o-3*s)*i+s*r)/6}function wD(n){var e=n.length-1;return function(t){var i=t<=0?t=0:t>=1?(t=1,e-1):Math.floor(t*e),r=n[i],o=n[i+1],s=i>0?n[i-1]:2*r-o,a=i<e-1?n[i+2]:2*o-r;return y0((t-i/e)*e,s,r,o,a)}}function CD(n){var e=n.length;return function(t){var i=Math.floor(((t%=1)<0?++t:t)*e),r=n[(i+e-1)%e],o=n[i%e],s=n[(i+1)%e],a=n[(i+2)%e];return y0((t-i/e)*e,r,o,s,a)}}var Xl=n=>()=>n;function OU(n,e){return function(t){return n+t*e}}function LU(n,e,t){return n=Math.pow(n,t),e=Math.pow(e,t)-n,t=1/t,function(i){return Math.pow(n+i*e,t)}}function TD(n){return(n=+n)==1?Vh:function(e,t){return t-e?LU(e,t,n):Xl(isNaN(e)?t:e)}}function Vh(n,e){var t=e-n;return t?OU(n,t):Xl(isNaN(n)?e:n)}var bs=(function n(e){var t=TD(e);function i(r,o){var s=t((r=ka(r)).r,(o=ka(o)).r),a=t(r.g,o.g),c=t(r.b,o.b),l=Vh(r.opacity,o.opacity);return function(u){return r.r=s(u),r.g=a(u),r.b=c(u),r.opacity=l(u),r+""}}return i.gamma=n,i})(1);function DD(n){return function(e){var t=e.length,i=new Array(t),r=new Array(t),o=new Array(t),s,a;for(s=0;s<t;++s)a=ka(e[s]),i[s]=a.r||0,r[s]=a.g||0,o[s]=a.b||0;return i=n(i),r=n(r),o=n(o),a.opacity=1,function(c){return a.r=i(c),a.g=r(c),a.b=o(c),a+""}}}var kU=DD(wD),UU=DD(CD);function AD(n,e){e||(e=[]);var t=n?Math.min(e.length,n.length):0,i=e.slice(),r;return function(o){for(r=0;r<t;++r)i[r]=n[r]*(1-o)+e[r]*o;return i}}function ID(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function RD(n,e){var t=e?e.length:0,i=n?Math.min(t,n.length):0,r=new Array(i),o=new Array(t),s;for(s=0;s<i;++s)r[s]=Fr(n[s],e[s]);for(;s<t;++s)o[s]=e[s];return function(a){for(s=0;s<i;++s)o[s]=r[s](a);return o}}function ND(n,e){var t=new Date;return n=+n,e=+e,function(i){return t.setTime(n*(1-i)+e*i),t}}function ln(n,e){return n=+n,e=+e,function(t){return n*(1-t)+e*t}}function PD(n,e){var t={},i={},r;(n===null||typeof n!="object")&&(n={}),(e===null||typeof e!="object")&&(e={});for(r in e)r in n?t[r]=Fr(n[r],e[r]):i[r]=e[r];return function(o){for(r in t)i[r]=t[r](o);return i}}var _0=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,v0=new RegExp(_0.source,"g");function BU(n){return function(){return n}}function VU(n){return function(e){return n(e)+""}}function Yl(n,e){var t=_0.lastIndex=v0.lastIndex=0,i,r,o,s=-1,a=[],c=[];for(n=n+"",e=e+"";(i=_0.exec(n))&&(r=v0.exec(e));)(o=r.index)>t&&(o=e.slice(t,o),a[s]?a[s]+=o:a[++s]=o),(i=i[0])===(r=r[0])?a[s]?a[s]+=r:a[++s]=r:(a[++s]=null,c.push({i:s,x:ln(i,r)})),t=v0.lastIndex;return t<e.length&&(o=e.slice(t),a[s]?a[s]+=o:a[++s]=o),a.length<2?c[0]?VU(c[0].x):BU(e):(e=c.length,function(l){for(var u=0,d;u<e;++u)a[(d=c[u]).i]=d.x(l);return a.join("")})}function Fr(n,e){var t=typeof e,i;return e==null||t==="boolean"?Xl(e):(t==="number"?ln:t==="string"?(i=Pi(e))?(e=i,bs):Yl:e instanceof Pi?bs:e instanceof Date?ND:ID(e)?AD:Array.isArray(e)?RD:typeof e.valueOf!="function"&&typeof e.toString!="function"||isNaN(e)?PD:ln)(n,e)}function x0(n,e){return n=+n,e=+e,function(t){return Math.round(n*(1-t)+e*t)}}var FD=180/Math.PI,Hh={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1};function b0(n,e,t,i,r,o){var s,a,c;return(s=Math.sqrt(n*n+e*e))&&(n/=s,e/=s),(c=n*t+e*i)&&(t-=n*c,i-=e*c),(a=Math.sqrt(t*t+i*i))&&(t/=a,i/=a,c/=a),n*i<e*t&&(n=-n,e=-e,c=-c,s=-s),{translateX:r,translateY:o,rotate:Math.atan2(e,n)*FD,skewX:Math.atan(c)*FD,scaleX:s,scaleY:a}}var zh;function OD(n){let e=new(typeof DOMMatrix=="function"?DOMMatrix:WebKitCSSMatrix)(n+"");return e.isIdentity?Hh:b0(e.a,e.b,e.c,e.d,e.e,e.f)}function LD(n){return n==null?Hh:(zh||(zh=document.createElementNS("http://www.w3.org/2000/svg","g")),zh.setAttribute("transform",n),(n=zh.transform.baseVal.consolidate())?(n=n.matrix,b0(n.a,n.b,n.c,n.d,n.e,n.f)):Hh)}function kD(n,e,t,i){function r(l){return l.length?l.pop()+" ":""}function o(l,u,d,f,h,g){if(l!==d||u!==f){var y=h.push("translate(",null,e,null,t);g.push({i:y-4,x:ln(l,d)},{i:y-2,x:ln(u,f)})}else(d||f)&&h.push("translate("+d+e+f+t)}function s(l,u,d,f){l!==u?(l-u>180?u+=360:u-l>180&&(l+=360),f.push({i:d.push(r(d)+"rotate(",null,i)-2,x:ln(l,u)})):u&&d.push(r(d)+"rotate("+u+i)}function a(l,u,d,f){l!==u?f.push({i:d.push(r(d)+"skewX(",null,i)-2,x:ln(l,u)}):u&&d.push(r(d)+"skewX("+u+i)}function c(l,u,d,f,h,g){if(l!==d||u!==f){var y=h.push(r(h)+"scale(",null,",",null,")");g.push({i:y-4,x:ln(l,d)},{i:y-2,x:ln(u,f)})}else(d!==1||f!==1)&&h.push(r(h)+"scale("+d+","+f+")")}return function(l,u){var d=[],f=[];return l=n(l),u=n(u),o(l.translateX,l.translateY,u.translateX,u.translateY,d,f),s(l.rotate,u.rotate,d,f),a(l.skewX,u.skewX,d,f),c(l.scaleX,l.scaleY,u.scaleX,u.scaleY,d,f),l=u=null,function(h){for(var g=-1,y=f.length,p;++g<y;)d[(p=f[g]).i]=p.x(h);return d.join("")}}}var S0=kD(OD,"px, ","px)","deg)"),M0=kD(LD,", ",")",")");var Ua=0,Jl=0,Zl=0,BD=1e3,Gh,Kl,jh=0,Ss=0,Wh=0,Ql=typeof performance=="object"&&performance.now?performance:Date,VD=typeof window=="object"&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(n){setTimeout(n,17)};function tu(){return Ss||(VD(HU),Ss=Ql.now()+Wh)}function HU(){Ss=0}function eu(){this._call=this._time=this._next=null}eu.prototype=Ba.prototype={constructor:eu,restart:function(n,e,t){if(typeof n!="function")throw new TypeError("callback is not a function");t=(t==null?tu():+t)+(e==null?0:+e),!this._next&&Kl!==this&&(Kl?Kl._next=this:Gh=this,Kl=this),this._call=n,this._time=t,E0()},stop:function(){this._call&&(this._call=null,this._time=1/0,E0())}};function Ba(n,e,t){var i=new eu;return i.restart(n,e,t),i}function HD(){tu(),++Ua;for(var n=Gh,e;n;)(e=Ss-n._time)>=0&&n._call.call(void 0,e),n=n._next;--Ua}function UD(){Ss=(jh=Ql.now())+Wh,Ua=Jl=0;try{HD()}finally{Ua=0,GU(),Ss=0}}function zU(){var n=Ql.now(),e=n-jh;e>BD&&(Wh-=e,jh=n)}function GU(){for(var n,e=Gh,t,i=1/0;e;)e._call?(i>e._time&&(i=e._time),n=e,e=e._next):(t=e._next,e._next=null,e=n?n._next=t:Gh=t);Kl=n,E0(i)}function E0(n){if(!Ua){Jl&&(Jl=clearTimeout(Jl));var e=n-Ss;e>24?(n<1/0&&(Jl=setTimeout(UD,n-Ql.now()-Wh)),Zl&&(Zl=clearInterval(Zl))):(Zl||(jh=Ql.now(),Zl=setInterval(zU,BD)),Ua=1,VD(UD))}}function $h(n,e,t){var i=new eu;return e=e==null?0:+e,i.restart(r=>{i.stop(),n(r+e)},e,t),i}var jU=ys("start","end","cancel","interrupt"),WU=[],jD=0,zD=1,Xh=2,qh=3,GD=4,Yh=5,nu=6;function vo(n,e,t,i,r,o){var s=n.__transition;if(!s)n.__transition={};else if(t in s)return;$U(n,t,{name:e,index:i,group:r,on:jU,tween:WU,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:jD})}function iu(n,e){var t=Kt(n,e);if(t.state>jD)throw new Error("too late; already scheduled");return t}function un(n,e){var t=Kt(n,e);if(t.state>qh)throw new Error("too late; already running");return t}function Kt(n,e){var t=n.__transition;if(!t||!(t=t[e]))throw new Error("transition not found");return t}function $U(n,e,t){var i=n.__transition,r;i[e]=t,t.timer=Ba(o,0,t.time);function o(l){t.state=zD,t.timer.restart(s,t.delay,t.time),t.delay<=l&&s(l-t.delay)}function s(l){var u,d,f,h;if(t.state!==zD)return c();for(u in i)if(h=i[u],h.name===t.name){if(h.state===qh)return $h(s);h.state===GD?(h.state=nu,h.timer.stop(),h.on.call("interrupt",n,n.__data__,h.index,h.group),delete i[u]):+u<e&&(h.state=nu,h.timer.stop(),h.on.call("cancel",n,n.__data__,h.index,h.group),delete i[u])}if($h(function(){t.state===qh&&(t.state=GD,t.timer.restart(a,t.delay,t.time),a(l))}),t.state=Xh,t.on.call("start",n,n.__data__,t.index,t.group),t.state===Xh){for(t.state=qh,r=new Array(f=t.tween.length),u=0,d=-1;u<f;++u)(h=t.tween[u].value.call(n,n.__data__,t.index,t.group))&&(r[++d]=h);r.length=d+1}}function a(l){for(var u=l<t.duration?t.ease.call(null,l/t.duration):(t.timer.restart(c),t.state=Yh,1),d=-1,f=r.length;++d<f;)r[d].call(n,u);t.state===Yh&&(t.on.call("end",n,n.__data__,t.index,t.group),c())}function c(){t.state=nu,t.timer.stop(),delete i[e];for(var l in i)return;delete n.__transition}}function Ms(n,e){var t=n.__transition,i,r,o=!0,s;if(t){e=e==null?null:e+"";for(s in t){if((i=t[s]).name!==e){o=!1;continue}r=i.state>Xh&&i.state<Yh,i.state=nu,i.timer.stop(),i.on.call(r?"interrupt":"cancel",n,n.__data__,i.index,i.group),delete t[s]}o&&delete n.__transition}}function WD(n){return this.each(function(){Ms(this,n)})}function qU(n,e){var t,i;return function(){var r=un(this,n),o=r.tween;if(o!==t){i=t=o;for(var s=0,a=i.length;s<a;++s)if(i[s].name===e){i=i.slice(),i.splice(s,1);break}}r.tween=i}}function XU(n,e,t){var i,r;if(typeof t!="function")throw new Error;return function(){var o=un(this,n),s=o.tween;if(s!==i){r=(i=s).slice();for(var a={name:e,value:t},c=0,l=r.length;c<l;++c)if(r[c].name===e){r[c]=a;break}c===l&&r.push(a)}o.tween=r}}function $D(n,e){var t=this._id;if(n+="",arguments.length<2){for(var i=Kt(this.node(),t).tween,r=0,o=i.length,s;r<o;++r)if((s=i[r]).name===n)return s.value;return null}return this.each((e==null?qU:XU)(t,n,e))}function Va(n,e,t){var i=n._id;return n.each(function(){var r=un(this,i);(r.value||(r.value={}))[e]=t.apply(this,arguments)}),function(r){return Kt(r,i).value[e]}}function Zh(n,e){var t;return(typeof e=="number"?ln:e instanceof Pi?bs:(t=Pi(e))?(e=t,bs):Yl)(n,e)}function YU(n){return function(){this.removeAttribute(n)}}function ZU(n){return function(){this.removeAttributeNS(n.space,n.local)}}function JU(n,e,t){var i,r=t+"",o;return function(){var s=this.getAttribute(n);return s===r?null:s===i?o:o=e(i=s,t)}}function KU(n,e,t){var i,r=t+"",o;return function(){var s=this.getAttributeNS(n.space,n.local);return s===r?null:s===i?o:o=e(i=s,t)}}function QU(n,e,t){var i,r,o;return function(){var s,a=t(this),c;return a==null?void this.removeAttribute(n):(s=this.getAttribute(n),c=a+"",s===c?null:s===i&&c===r?o:(r=c,o=e(i=s,a)))}}function eB(n,e,t){var i,r,o;return function(){var s,a=t(this),c;return a==null?void this.removeAttributeNS(n.space,n.local):(s=this.getAttributeNS(n.space,n.local),c=a+"",s===c?null:s===i&&c===r?o:(r=c,o=e(i=s,a)))}}function qD(n,e){var t=Nr(n),i=t==="transform"?M0:Zh;return this.attrTween(n,typeof e=="function"?(t.local?eB:QU)(t,i,Va(this,"attr."+n,e)):e==null?(t.local?ZU:YU)(t):(t.local?KU:JU)(t,i,e))}function tB(n,e){return function(t){this.setAttribute(n,e.call(this,t))}}function nB(n,e){return function(t){this.setAttributeNS(n.space,n.local,e.call(this,t))}}function iB(n,e){var t,i;function r(){var o=e.apply(this,arguments);return o!==i&&(t=(i=o)&&nB(n,o)),t}return r._value=e,r}function rB(n,e){var t,i;function r(){var o=e.apply(this,arguments);return o!==i&&(t=(i=o)&&tB(n,o)),t}return r._value=e,r}function XD(n,e){var t="attr."+n;if(arguments.length<2)return(t=this.tween(t))&&t._value;if(e==null)return this.tween(t,null);if(typeof e!="function")throw new Error;var i=Nr(n);return this.tween(t,(i.local?iB:rB)(i,e))}function oB(n,e){return function(){iu(this,n).delay=+e.apply(this,arguments)}}function sB(n,e){return e=+e,function(){iu(this,n).delay=e}}function YD(n){var e=this._id;return arguments.length?this.each((typeof n=="function"?oB:sB)(e,n)):Kt(this.node(),e).delay}function aB(n,e){return function(){un(this,n).duration=+e.apply(this,arguments)}}function cB(n,e){return e=+e,function(){un(this,n).duration=e}}function ZD(n){var e=this._id;return arguments.length?this.each((typeof n=="function"?aB:cB)(e,n)):Kt(this.node(),e).duration}function lB(n,e){if(typeof e!="function")throw new Error;return function(){un(this,n).ease=e}}function JD(n){var e=this._id;return arguments.length?this.each(lB(e,n)):Kt(this.node(),e).ease}function uB(n,e){return function(){var t=e.apply(this,arguments);if(typeof t!="function")throw new Error;un(this,n).ease=t}}function KD(n){if(typeof n!="function")throw new Error;return this.each(uB(this._id,n))}function QD(n){typeof n!="function"&&(n=Gl(n));for(var e=this._groups,t=e.length,i=new Array(t),r=0;r<t;++r)for(var o=e[r],s=o.length,a=i[r]=[],c,l=0;l<s;++l)(c=o[l])&&n.call(c,c.__data__,l,o)&&a.push(c);return new Ln(i,this._parents,this._name,this._id)}function eA(n){if(n._id!==this._id)throw new Error;for(var e=this._groups,t=n._groups,i=e.length,r=t.length,o=Math.min(i,r),s=new Array(i),a=0;a<o;++a)for(var c=e[a],l=t[a],u=c.length,d=s[a]=new Array(u),f,h=0;h<u;++h)(f=c[h]||l[h])&&(d[h]=f);for(;a<i;++a)s[a]=e[a];return new Ln(s,this._parents,this._name,this._id)}function dB(n){return(n+"").trim().split(/^|\s+/).every(function(e){var t=e.indexOf(".");return t>=0&&(e=e.slice(0,t)),!e||e==="start"})}function fB(n,e,t){var i,r,o=dB(e)?iu:un;return function(){var s=o(this,n),a=s.on;a!==i&&(r=(i=a).copy()).on(e,t),s.on=r}}function tA(n,e){var t=this._id;return arguments.length<2?Kt(this.node(),t).on.on(n):this.each(fB(t,n,e))}function hB(n){return function(){var e=this.parentNode;for(var t in this.__transition)if(+t!==n)return;e&&e.removeChild(this)}}function nA(){return this.on("end.remove",hB(this._id))}function iA(n){var e=this._name,t=this._id;typeof n!="function"&&(n=vs(n));for(var i=this._groups,r=i.length,o=new Array(r),s=0;s<r;++s)for(var a=i[s],c=a.length,l=o[s]=new Array(c),u,d,f=0;f<c;++f)(u=a[f])&&(d=n.call(u,u.__data__,f,a))&&("__data__"in u&&(d.__data__=u.__data__),l[f]=d,vo(l[f],e,t,f,l,Kt(u,t)));return new Ln(o,this._parents,e,t)}function rA(n){var e=this._name,t=this._id;typeof n!="function"&&(n=zl(n));for(var i=this._groups,r=i.length,o=[],s=[],a=0;a<r;++a)for(var c=i[a],l=c.length,u,d=0;d<l;++d)if(u=c[d]){for(var f=n.call(u,u.__data__,d,c),h,g=Kt(u,t),y=0,p=f.length;y<p;++y)(h=f[y])&&vo(h,e,t,y,f,g);o.push(f),s.push(u)}return new Ln(o,s,e,t)}var pB=Pr.prototype.constructor;function oA(){return new pB(this._groups,this._parents)}function mB(n,e){var t,i,r;return function(){var o=yo(this,n),s=(this.style.removeProperty(n),yo(this,n));return o===s?null:o===t&&s===i?r:r=e(t=o,i=s)}}function sA(n){return function(){this.style.removeProperty(n)}}function gB(n,e,t){var i,r=t+"",o;return function(){var s=yo(this,n);return s===r?null:s===i?o:o=e(i=s,t)}}function yB(n,e,t){var i,r,o;return function(){var s=yo(this,n),a=t(this),c=a+"";return a==null&&(c=a=(this.style.removeProperty(n),yo(this,n))),s===c?null:s===i&&c===r?o:(r=c,o=e(i=s,a))}}function vB(n,e){var t,i,r,o="style."+e,s="end."+o,a;return function(){var c=un(this,n),l=c.on,u=c.value[o]==null?a||(a=sA(e)):void 0;(l!==t||r!==u)&&(i=(t=l).copy()).on(s,r=u),c.on=i}}function aA(n,e,t){var i=(n+="")=="transform"?S0:Zh;return e==null?this.styleTween(n,mB(n,i)).on("end.style."+n,sA(n)):typeof e=="function"?this.styleTween(n,yB(n,i,Va(this,"style."+n,e))).each(vB(this._id,n)):this.styleTween(n,gB(n,i,e),t).on("end.style."+n,null)}function _B(n,e,t){return function(i){this.style.setProperty(n,e.call(this,i),t)}}function xB(n,e,t){var i,r;function o(){var s=e.apply(this,arguments);return s!==r&&(i=(r=s)&&_B(n,s,t)),i}return o._value=e,o}function cA(n,e,t){var i="style."+(n+="");if(arguments.length<2)return(i=this.tween(i))&&i._value;if(e==null)return this.tween(i,null);if(typeof e!="function")throw new Error;return this.tween(i,xB(n,e,t??""))}function bB(n){return function(){this.textContent=n}}function SB(n){return function(){var e=n(this);this.textContent=e??""}}function lA(n){return this.tween("text",typeof n=="function"?SB(Va(this,"text",n)):bB(n==null?"":n+""))}function MB(n){return function(e){this.textContent=n.call(this,e)}}function EB(n){var e,t;function i(){var r=n.apply(this,arguments);return r!==t&&(e=(t=r)&&MB(r)),e}return i._value=n,i}function uA(n){var e="text";if(arguments.length<1)return(e=this.tween(e))&&e._value;if(n==null)return this.tween(e,null);if(typeof n!="function")throw new Error;return this.tween(e,EB(n))}function dA(){for(var n=this._name,e=this._id,t=Jh(),i=this._groups,r=i.length,o=0;o<r;++o)for(var s=i[o],a=s.length,c,l=0;l<a;++l)if(c=s[l]){var u=Kt(c,e);vo(c,n,t,l,s,{time:u.time+u.delay+u.duration,delay:0,duration:u.duration,ease:u.ease})}return new Ln(i,this._parents,n,t)}function fA(){var n,e,t=this,i=t._id,r=t.size();return new Promise(function(o,s){var a={value:s},c={value:function(){--r===0&&o()}};t.each(function(){var l=un(this,i),u=l.on;u!==n&&(e=(n=u).copy(),e._.cancel.push(a),e._.interrupt.push(a),e._.end.push(c)),l.on=e}),r===0&&o()})}var wB=0;function Ln(n,e,t,i){this._groups=n,this._parents=e,this._name=t,this._id=i}function hA(n){return Pr().transition(n)}function Jh(){return++wB}var Or=Pr.prototype;Ln.prototype=hA.prototype={constructor:Ln,select:iA,selectAll:rA,selectChild:Or.selectChild,selectChildren:Or.selectChildren,filter:QD,merge:eA,selection:oA,transition:dA,call:Or.call,nodes:Or.nodes,node:Or.node,size:Or.size,empty:Or.empty,each:Or.each,on:tA,attr:qD,attrTween:XD,style:aA,styleTween:cA,text:lA,textTween:uA,remove:nA,tween:$D,delay:YD,duration:ZD,ease:JD,easeVarying:KD,end:fA,[Symbol.iterator]:Or[Symbol.iterator]};function Kh(n){return((n*=2)<=1?n*n*n:(n-=2)*n*n+2)/2}var CB={time:null,delay:0,duration:250,ease:Kh};function TB(n,e){for(var t;!(t=n.__transition)||!(t=t[e]);)if(!(n=n.parentNode))throw new Error(`transition ${e} not found`);return t}function pA(n){var e,t;n instanceof Ln?(e=n._id,n=n._name):(e=Jh(),(t=CB).time=tu(),n=n==null?null:n+"");for(var i=this._groups,r=i.length,o=0;o<r;++o)for(var s=i[o],a=s.length,c,l=0;l<a;++l)(c=s[l])&&vo(c,n,e,l,s,t||TB(c,e));return new Ln(i,this._parents,n,e)}Pr.prototype.interrupt=WD;Pr.prototype.transition=pA;var Qh=n=>()=>n;function w0(n,{sourceEvent:e,target:t,selection:i,mode:r,dispatch:o}){Object.defineProperties(this,{type:{value:n,enumerable:!0,configurable:!0},sourceEvent:{value:e,enumerable:!0,configurable:!0},target:{value:t,enumerable:!0,configurable:!0},selection:{value:i,enumerable:!0,configurable:!0},mode:{value:r,enumerable:!0,configurable:!0},_:{value:o}})}function mA(n){n.stopImmediatePropagation()}function ep(n){n.preventDefault(),n.stopImmediatePropagation()}var gA={name:"drag"},C0={name:"space"},Ha={name:"handle"},za={name:"center"},{abs:yA,max:Mn,min:En}=Math;function vA(n){return[+n[0],+n[1]]}function A0(n){return[vA(n[0]),vA(n[1])]}var tp={name:"x",handles:["w","e"].map(ru),input:function(n,e){return n==null?null:[[+n[0],e[0][1]],[+n[1],e[1][1]]]},output:function(n){return n&&[n[0][0],n[1][0]]}},T0={name:"y",handles:["n","s"].map(ru),input:function(n,e){return n==null?null:[[e[0][0],+n[0]],[e[1][0],+n[1]]]},output:function(n){return n&&[n[0][1],n[1][1]]}},Vse={name:"xy",handles:["n","w","e","s","nw","ne","sw","se"].map(ru),input:function(n){return n==null?null:A0(n)},output:function(n){return n}},Lr={overlay:"crosshair",selection:"move",n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},_A={e:"w",w:"e",nw:"ne",ne:"nw",se:"sw",sw:"se"},xA={n:"s",s:"n",nw:"sw",ne:"se",se:"ne",sw:"nw"},DB={overlay:1,selection:1,n:null,e:1,s:null,w:-1,nw:-1,ne:1,se:1,sw:-1},AB={overlay:1,selection:1,n:-1,e:null,s:1,w:null,nw:-1,ne:-1,se:1,sw:1};function ru(n){return{type:n}}function IB(n){return!n.ctrlKey&&!n.button}function RB(){var n=this.ownerSVGElement||this;return n.hasAttribute("viewBox")?(n=n.viewBox.baseVal,[[n.x,n.y],[n.x+n.width,n.y+n.height]]):[[0,0],[n.width.baseVal.value,n.height.baseVal.value]]}function NB(){return navigator.maxTouchPoints||"ontouchstart"in this}function D0(n){for(;!n.__brush;)if(!(n=n.parentNode))return;return n.__brush}function PB(n){return n[0][0]===n[1][0]||n[0][1]===n[1][1]}function FB(){return OB(tp)}function OB(n){var e=RB,t=IB,i=NB,r=!0,o=ys("start","brush","end"),s=6,a;function c(p){var m=p.property("__brush",y).selectAll(".overlay").data([ru("overlay")]);m.enter().append("rect").attr("class","overlay").attr("pointer-events","all").attr("cursor",Lr.overlay).merge(m).each(function(){var E=D0(this).extent;ir(this).attr("x",E[0][0]).attr("y",E[0][1]).attr("width",E[1][0]-E[0][0]).attr("height",E[1][1]-E[0][1])}),p.selectAll(".selection").data([ru("selection")]).enter().append("rect").attr("class","selection").attr("cursor",Lr.selection).attr("fill","#777").attr("fill-opacity",.3).attr("stroke","#fff").attr("shape-rendering","crispEdges");var x=p.selectAll(".handle").data(n.handles,function(E){return E.type});x.exit().remove(),x.enter().append("rect").attr("class",function(E){return"handle handle--"+E.type}).attr("cursor",function(E){return Lr[E.type]}),p.each(l).attr("fill","none").attr("pointer-events","all").on("mousedown.brush",f).filter(i).on("touchstart.brush",f).on("touchmove.brush",h).on("touchend.brush touchcancel.brush",g).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}c.move=function(p,m,x){p.tween?p.on("start.brush",function(E){u(this,arguments).beforestart().start(E)}).on("interrupt.brush end.brush",function(E){u(this,arguments).end(E)}).tween("brush",function(){var E=this,_=E.__brush,M=u(E,arguments),w=_.selection,D=n.input(typeof m=="function"?m.apply(this,arguments):m,_.extent),b=Fr(w,D);function C(A){_.selection=A===1&&D===null?null:b(A),l.call(E),M.brush()}return w!==null&&D!==null?C:C(1)}):p.each(function(){var E=this,_=arguments,M=E.__brush,w=n.input(typeof m=="function"?m.apply(E,_):m,M.extent),D=u(E,_).beforestart();Ms(E),M.selection=w===null?null:w,l.call(E),D.start(x).brush(x).end(x)})},c.clear=function(p,m){c.move(p,null,m)};function l(){var p=ir(this),m=D0(this).selection;m?(p.selectAll(".selection").style("display",null).attr("x",m[0][0]).attr("y",m[0][1]).attr("width",m[1][0]-m[0][0]).attr("height",m[1][1]-m[0][1]),p.selectAll(".handle").style("display",null).attr("x",function(x){return x.type[x.type.length-1]==="e"?m[1][0]-s/2:m[0][0]-s/2}).attr("y",function(x){return x.type[0]==="s"?m[1][1]-s/2:m[0][1]-s/2}).attr("width",function(x){return x.type==="n"||x.type==="s"?m[1][0]-m[0][0]+s:s}).attr("height",function(x){return x.type==="e"||x.type==="w"?m[1][1]-m[0][1]+s:s})):p.selectAll(".selection,.handle").style("display","none").attr("x",null).attr("y",null).attr("width",null).attr("height",null)}function u(p,m,x){var E=p.__brush.emitter;return E&&(!x||!E.clean)?E:new d(p,m,x)}function d(p,m,x){this.that=p,this.args=m,this.state=p.__brush,this.active=0,this.clean=x}d.prototype={beforestart:function(){return++this.active===1&&(this.state.emitter=this,this.starting=!0),this},start:function(p,m){return this.starting?(this.starting=!1,this.emit("start",p,m)):this.emit("brush",p),this},brush:function(p,m){return this.emit("brush",p,m),this},end:function(p,m){return--this.active===0&&(delete this.state.emitter,this.emit("end",p,m)),this},emit:function(p,m,x){var E=ir(this.that).datum();o.call(p,this.that,new w0(p,{sourceEvent:m,target:c,selection:n.output(this.state.selection),mode:x,dispatch:o}),E)}};function f(p){if(a&&!p.touches||!t.apply(this,arguments))return;var m=this,x=p.target.__data__.type,E=(r&&p.metaKey?x="overlay":x)==="selection"?gA:r&&p.altKey?za:Ha,_=n===T0?null:DB[x],M=n===tp?null:AB[x],w=D0(m),D=w.extent,b=w.selection,C=D[0][0],A,N,I=D[0][1],k,P,B=D[1][0],X,V,te=D[1][1],j,q,J=0,he=0,we,dt=_&&M&&r&&p.shiftKey,Ke,et,$=Array.from(p.touches||[p],oe=>{let je=oe.identifier;return oe=Nh(oe,m),oe.point0=oe.slice(),oe.identifier=je,oe});Ms(m);var Q=u(m,arguments,!0).beforestart();if(x==="overlay"){b&&(we=!0);let oe=[$[0],$[1]||$[0]];w.selection=b=[[A=n===T0?C:En(oe[0][0],oe[1][0]),k=n===tp?I:En(oe[0][1],oe[1][1])],[X=n===T0?B:Mn(oe[0][0],oe[1][0]),j=n===tp?te:Mn(oe[0][1],oe[1][1])]],$.length>1&&St(p)}else A=b[0][0],k=b[0][1],X=b[1][0],j=b[1][1];N=A,P=k,V=X,q=j;var ve=ir(m).attr("pointer-events","none"),ke=ve.selectAll(".overlay").attr("cursor",Lr[x]);if(p.touches)Q.moved=Xe,Q.ended=Ye;else{var ge=ir(p.view).on("mousemove.brush",Xe,!0).on("mouseup.brush",Ye,!0);r&&ge.on("keydown.brush",st,!0).on("keyup.brush",_t,!0),h0(p.view)}l.call(m),Q.start(p,E.name);function Xe(oe){for(let je of oe.changedTouches||[oe])for(let Rt of $)Rt.identifier===je.identifier&&(Rt.cur=Nh(je,m));if(dt&&!Ke&&!et&&$.length===1){let je=$[0];yA(je.cur[0]-je[0])>yA(je.cur[1]-je[1])?et=!0:Ke=!0}for(let je of $)je.cur&&(je[0]=je.cur[0],je[1]=je.cur[1]);we=!0,ep(oe),St(oe)}function St(oe){let je=$[0],Rt=je.point0;var Pt;switch(J=je[0]-Rt[0],he=je[1]-Rt[1],E){case C0:case gA:{_&&(J=Mn(C-A,En(B-X,J)),N=A+J,V=X+J),M&&(he=Mn(I-k,En(te-j,he)),P=k+he,q=j+he);break}case Ha:{$[1]?(_&&(N=Mn(C,En(B,$[0][0])),V=Mn(C,En(B,$[1][0])),_=1),M&&(P=Mn(I,En(te,$[0][1])),q=Mn(I,En(te,$[1][1])),M=1)):(_<0?(J=Mn(C-A,En(B-A,J)),N=A+J,V=X):_>0&&(J=Mn(C-X,En(B-X,J)),N=A,V=X+J),M<0?(he=Mn(I-k,En(te-k,he)),P=k+he,q=j):M>0&&(he=Mn(I-j,En(te-j,he)),P=k,q=j+he));break}case za:{_&&(N=Mn(C,En(B,A-J*_)),V=Mn(C,En(B,X+J*_))),M&&(P=Mn(I,En(te,k-he*M)),q=Mn(I,En(te,j+he*M)));break}}V<N&&(_*=-1,Pt=A,A=X,X=Pt,Pt=N,N=V,V=Pt,x in _A&&ke.attr("cursor",Lr[x=_A[x]])),q<P&&(M*=-1,Pt=k,k=j,j=Pt,Pt=P,P=q,q=Pt,x in xA&&ke.attr("cursor",Lr[x=xA[x]])),w.selection&&(b=w.selection),Ke&&(N=b[0][0],V=b[1][0]),et&&(P=b[0][1],q=b[1][1]),(b[0][0]!==N||b[0][1]!==P||b[1][0]!==V||b[1][1]!==q)&&(w.selection=[[N,P],[V,q]],l.call(m),Q.brush(oe,E.name))}function Ye(oe){if(mA(oe),oe.touches){if(oe.touches.length)return;a&&clearTimeout(a),a=setTimeout(function(){a=null},500)}else p0(oe.view,we),ge.on("keydown.brush keyup.brush mousemove.brush mouseup.brush",null);ve.attr("pointer-events","all"),ke.attr("cursor",Lr.overlay),w.selection&&(b=w.selection),PB(b)&&(w.selection=null,l.call(m)),Q.end(oe,E.name)}function st(oe){switch(oe.keyCode){case 16:{dt=_&&M;break}case 18:{E===Ha&&(_&&(X=V-J*_,A=N+J*_),M&&(j=q-he*M,k=P+he*M),E=za,St(oe));break}case 32:{(E===Ha||E===za)&&(_<0?X=V-J:_>0&&(A=N-J),M<0?j=q-he:M>0&&(k=P-he),E=C0,ke.attr("cursor",Lr.selection),St(oe));break}default:return}ep(oe)}function _t(oe){switch(oe.keyCode){case 16:{dt&&(Ke=et=dt=!1,St(oe));break}case 18:{E===za&&(_<0?X=V:_>0&&(A=N),M<0?j=q:M>0&&(k=P),E=Ha,St(oe));break}case 32:{E===C0&&(oe.altKey?(_&&(X=V-J*_,A=N+J*_),M&&(j=q-he*M,k=P+he*M),E=za):(_<0?X=V:_>0&&(A=N),M<0?j=q:M>0&&(k=P),E=Ha),ke.attr("cursor",Lr[x]),St(oe));break}default:return}ep(oe)}}function h(p){u(this,arguments).moved(p)}function g(p){u(this,arguments).ended(p)}function y(){var p=this.__brush||{selection:null};return p.extent=A0(e.apply(this,arguments)),p.dim=n,p}return c.extent=function(p){return arguments.length?(e=typeof p=="function"?p:Qh(A0(p)),c):e},c.filter=function(p){return arguments.length?(t=typeof p=="function"?p:Qh(!!p),c):t},c.touchable=function(p){return arguments.length?(i=typeof p=="function"?p:Qh(!!p),c):i},c.handleSize=function(p){return arguments.length?(s=+p,c):s},c.keyModifiers=function(p){return arguments.length?(r=!!p,c):r},c.on=function(){var p=o.on.apply(o,arguments);return p===o?c:p},c}function bA(n){let e=+this._x.call(null,n),t=+this._y.call(null,n);return SA(this.cover(e,t),e,t,n)}function SA(n,e,t,i){if(isNaN(e)||isNaN(t))return n;var r,o=n._root,s={data:i},a=n._x0,c=n._y0,l=n._x1,u=n._y1,d,f,h,g,y,p,m,x;if(!o)return n._root=s,n;for(;o.length;)if((y=e>=(d=(a+l)/2))?a=d:l=d,(p=t>=(f=(c+u)/2))?c=f:u=f,r=o,!(o=o[m=p<<1|y]))return r[m]=s,n;if(h=+n._x.call(null,o.data),g=+n._y.call(null,o.data),e===h&&t===g)return s.next=o,r?r[m]=s:n._root=s,n;do r=r?r[m]=new Array(4):n._root=new Array(4),(y=e>=(d=(a+l)/2))?a=d:l=d,(p=t>=(f=(c+u)/2))?c=f:u=f;while((m=p<<1|y)===(x=(g>=f)<<1|h>=d));return r[x]=o,r[m]=s,n}function MA(n){var e,t,i=n.length,r,o,s=new Array(i),a=new Array(i),c=1/0,l=1/0,u=-1/0,d=-1/0;for(t=0;t<i;++t)isNaN(r=+this._x.call(null,e=n[t]))||isNaN(o=+this._y.call(null,e))||(s[t]=r,a[t]=o,r<c&&(c=r),r>u&&(u=r),o<l&&(l=o),o>d&&(d=o));if(c>u||l>d)return this;for(this.cover(c,l).cover(u,d),t=0;t<i;++t)SA(this,s[t],a[t],n[t]);return this}function EA(n,e){if(isNaN(n=+n)||isNaN(e=+e))return this;var t=this._x0,i=this._y0,r=this._x1,o=this._y1;if(isNaN(t))r=(t=Math.floor(n))+1,o=(i=Math.floor(e))+1;else{for(var s=r-t||1,a=this._root,c,l;t>n||n>=r||i>e||e>=o;)switch(l=(e<i)<<1|n<t,c=new Array(4),c[l]=a,a=c,s*=2,l){case 0:r=t+s,o=i+s;break;case 1:t=r-s,o=i+s;break;case 2:r=t+s,i=o-s;break;case 3:t=r-s,i=o-s;break}this._root&&this._root.length&&(this._root=a)}return this._x0=t,this._y0=i,this._x1=r,this._y1=o,this}function wA(){var n=[];return this.visit(function(e){if(!e.length)do n.push(e.data);while(e=e.next)}),n}function CA(n){return arguments.length?this.cover(+n[0][0],+n[0][1]).cover(+n[1][0],+n[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]}function on(n,e,t,i,r){this.node=n,this.x0=e,this.y0=t,this.x1=i,this.y1=r}function TA(n,e,t){var i,r=this._x0,o=this._y0,s,a,c,l,u=this._x1,d=this._y1,f=[],h=this._root,g,y;for(h&&f.push(new on(h,r,o,u,d)),t==null?t=1/0:(r=n-t,o=e-t,u=n+t,d=e+t,t*=t);g=f.pop();)if(!(!(h=g.node)||(s=g.x0)>u||(a=g.y0)>d||(c=g.x1)<r||(l=g.y1)<o))if(h.length){var p=(s+c)/2,m=(a+l)/2;f.push(new on(h[3],p,m,c,l),new on(h[2],s,m,p,l),new on(h[1],p,a,c,m),new on(h[0],s,a,p,m)),(y=(e>=m)<<1|n>=p)&&(g=f[f.length-1],f[f.length-1]=f[f.length-1-y],f[f.length-1-y]=g)}else{var x=n-+this._x.call(null,h.data),E=e-+this._y.call(null,h.data),_=x*x+E*E;if(_<t){var M=Math.sqrt(t=_);r=n-M,o=e-M,u=n+M,d=e+M,i=h.data}}return i}function DA(n){if(isNaN(u=+this._x.call(null,n))||isNaN(d=+this._y.call(null,n)))return this;var e,t=this._root,i,r,o,s=this._x0,a=this._y0,c=this._x1,l=this._y1,u,d,f,h,g,y,p,m;if(!t)return this;if(t.length)for(;;){if((g=u>=(f=(s+c)/2))?s=f:c=f,(y=d>=(h=(a+l)/2))?a=h:l=h,e=t,!(t=t[p=y<<1|g]))return this;if(!t.length)break;(e[p+1&3]||e[p+2&3]||e[p+3&3])&&(i=e,m=p)}for(;t.data!==n;)if(r=t,!(t=t.next))return this;return(o=t.next)&&delete t.next,r?(o?r.next=o:delete r.next,this):e?(o?e[p]=o:delete e[p],(t=e[0]||e[1]||e[2]||e[3])&&t===(e[3]||e[2]||e[1]||e[0])&&!t.length&&(i?i[m]=t:this._root=t),this):(this._root=o,this)}function AA(n){for(var e=0,t=n.length;e<t;++e)this.remove(n[e]);return this}function IA(){return this._root}function RA(){var n=0;return this.visit(function(e){if(!e.length)do++n;while(e=e.next)}),n}function NA(n){var e=[],t,i=this._root,r,o,s,a,c;for(i&&e.push(new on(i,this._x0,this._y0,this._x1,this._y1));t=e.pop();)if(!n(i=t.node,o=t.x0,s=t.y0,a=t.x1,c=t.y1)&&i.length){var l=(o+a)/2,u=(s+c)/2;(r=i[3])&&e.push(new on(r,l,u,a,c)),(r=i[2])&&e.push(new on(r,o,u,l,c)),(r=i[1])&&e.push(new on(r,l,s,a,u)),(r=i[0])&&e.push(new on(r,o,s,l,u))}return this}function PA(n){var e=[],t=[],i;for(this._root&&e.push(new on(this._root,this._x0,this._y0,this._x1,this._y1));i=e.pop();){var r=i.node;if(r.length){var o,s=i.x0,a=i.y0,c=i.x1,l=i.y1,u=(s+c)/2,d=(a+l)/2;(o=r[0])&&e.push(new on(o,s,a,u,d)),(o=r[1])&&e.push(new on(o,u,a,c,d)),(o=r[2])&&e.push(new on(o,s,d,u,l)),(o=r[3])&&e.push(new on(o,u,d,c,l))}t.push(i)}for(;i=t.pop();)n(i.node,i.x0,i.y0,i.x1,i.y1);return this}function FA(n){return n[0]}function OA(n){return arguments.length?(this._x=n,this):this._x}function LA(n){return n[1]}function kA(n){return arguments.length?(this._y=n,this):this._y}function ou(n,e,t){var i=new I0(e??FA,t??LA,NaN,NaN,NaN,NaN);return n==null?i:i.addAll(n)}function I0(n,e,t,i,r,o){this._x=n,this._y=e,this._x0=t,this._y0=i,this._x1=r,this._y1=o,this._root=void 0}function UA(n){for(var e={data:n.data},t=e;n=n.next;)t=t.next={data:n.data};return e}var kn=ou.prototype=I0.prototype;kn.copy=function(){var n=new I0(this._x,this._y,this._x0,this._y0,this._x1,this._y1),e=this._root,t,i;if(!e)return n;if(!e.length)return n._root=UA(e),n;for(t=[{source:e,target:n._root=new Array(4)}];e=t.pop();)for(var r=0;r<4;++r)(i=e.source[r])&&(i.length?t.push({source:i,target:e.target[r]=new Array(4)}):e.target[r]=UA(i));return n};kn.add=bA;kn.addAll=MA;kn.cover=EA;kn.data=wA;kn.extent=CA;kn.find=TA;kn.remove=DA;kn.removeAll=AA;kn.root=IA;kn.size=RA;kn.visit=NA;kn.visitAfter=PA;kn.x=OA;kn.y=kA;function R0(n){return function(){return n}}function N0(n){return(n()-.5)*1e-6}function LB(n){return n.x+n.vx}function kB(n){return n.y+n.vy}function UB(n){var e,t,i,r=1,o=1;typeof n!="function"&&(n=R0(n==null?1:+n));function s(){for(var l,u=e.length,d,f,h,g,y,p,m=0;m<o;++m)for(d=ou(e,LB,kB).visitAfter(a),l=0;l<u;++l)f=e[l],y=t[f.index],p=y*y,h=f.x+f.vx,g=f.y+f.vy,d.visit(x);function x(E,_,M,w,D){var b=E.data,C=E.r,A=y+C;if(b){if(b.index>f.index){var N=h-b.x-b.vx,I=g-b.y-b.vy,k=N*N+I*I;k<A*A&&(N===0&&(N=N0(i),k+=N*N),I===0&&(I=N0(i),k+=I*I),k=(A-(k=Math.sqrt(k)))/k*r,f.vx+=(N*=k)*(A=(C*=C)/(p+C)),f.vy+=(I*=k)*A,b.vx-=N*(A=1-A),b.vy-=I*A)}return}return _>h+A||w<h-A||M>g+A||D<g-A}}function a(l){if(l.data)return l.r=t[l.data.index];for(var u=l.r=0;u<4;++u)l[u]&&l[u].r>l.r&&(l.r=l[u].r)}function c(){if(e){var l,u=e.length,d;for(t=new Array(u),l=0;l<u;++l)d=e[l],t[d.index]=+n(d,l,e)}}return s.initialize=function(l,u){e=l,i=u,c()},s.iterations=function(l){return arguments.length?(o=+l,s):o},s.strength=function(l){return arguments.length?(r=+l,s):r},s.radius=function(l){return arguments.length?(n=typeof l=="function"?l:R0(+l),c(),s):n},s}function BA(){let n=1;return()=>(n=(1664525*n+1013904223)%4294967296)/4294967296}var BB=10,VB=Math.PI*(3-Math.sqrt(5));function HB(n){var e,t=1,i=.001,r=1-Math.pow(i,1/300),o=0,s=.6,a=new Map,c=Ba(d),l=ys("tick","end"),u=BA();n==null&&(n=[]);function d(){f(),l.call("tick",e),t<i&&(c.stop(),l.call("end",e))}function f(y){var p,m=n.length,x;y===void 0&&(y=1);for(var E=0;E<y;++E)for(t+=(o-t)*r,a.forEach(function(_){_(t)}),p=0;p<m;++p)x=n[p],x.fx==null?x.x+=x.vx*=s:(x.x=x.fx,x.vx=0),x.fy==null?x.y+=x.vy*=s:(x.y=x.fy,x.vy=0);return e}function h(){for(var y=0,p=n.length,m;y<p;++y){if(m=n[y],m.index=y,m.fx!=null&&(m.x=m.fx),m.fy!=null&&(m.y=m.fy),isNaN(m.x)||isNaN(m.y)){var x=BB*Math.sqrt(.5+y),E=y*VB;m.x=x*Math.cos(E),m.y=x*Math.sin(E)}(isNaN(m.vx)||isNaN(m.vy))&&(m.vx=m.vy=0)}}function g(y){return y.initialize&&y.initialize(n,u),y}return h(),e={tick:f,restart:function(){return c.restart(d),e},stop:function(){return c.stop(),e},nodes:function(y){return arguments.length?(n=y,h(),a.forEach(g),e):n},alpha:function(y){return arguments.length?(t=+y,e):t},alphaMin:function(y){return arguments.length?(i=+y,e):i},alphaDecay:function(y){return arguments.length?(r=+y,e):+r},alphaTarget:function(y){return arguments.length?(o=+y,e):o},velocityDecay:function(y){return arguments.length?(s=1-y,e):1-s},randomSource:function(y){return arguments.length?(u=y,a.forEach(g),e):u},force:function(y,p){return arguments.length>1?(p==null?a.delete(y):a.set(y,g(p)),e):a.get(y)},find:function(y,p,m){var x=0,E=n.length,_,M,w,D,b;for(m==null?m=1/0:m*=m,x=0;x<E;++x)D=n[x],_=y-D.x,M=p-D.y,w=_*_+M*M,w<m&&(b=D,m=w);return b},on:function(y,p){return arguments.length>1?(l.on(y,p),e):l.on(y)}}}function VA(n){return Math.abs(n=Math.round(n))>=1e21?n.toLocaleString("en").replace(/,/g,""):n.toString(10)}function Es(n,e){if(!isFinite(n)||n===0)return null;var t=(n=e?n.toExponential(e-1):n.toExponential()).indexOf("e"),i=n.slice(0,t);return[i.length>1?i[0]+i.slice(2):i,+n.slice(t+1)]}function or(n){return n=Es(Math.abs(n)),n?n[1]:NaN}function HA(n,e){return function(t,i){for(var r=t.length,o=[],s=0,a=n[0],c=0;r>0&&a>0&&(c+a+1>i&&(a=Math.max(1,i-c)),o.push(t.substring(r-=a,r+a)),!((c+=a+1)>i));)a=n[s=(s+1)%n.length];return o.reverse().join(e)}}function zA(n){return function(e){return e.replace(/[0-9]/g,function(t){return n[+t]})}}var zB=/^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;function _o(n){if(!(e=zB.exec(n)))throw new Error("invalid format: "+n);var e;return new np({fill:e[1],align:e[2],sign:e[3],symbol:e[4],zero:e[5],width:e[6],comma:e[7],precision:e[8]&&e[8].slice(1),trim:e[9],type:e[10]})}_o.prototype=np.prototype;function np(n){this.fill=n.fill===void 0?" ":n.fill+"",this.align=n.align===void 0?">":n.align+"",this.sign=n.sign===void 0?"-":n.sign+"",this.symbol=n.symbol===void 0?"":n.symbol+"",this.zero=!!n.zero,this.width=n.width===void 0?void 0:+n.width,this.comma=!!n.comma,this.precision=n.precision===void 0?void 0:+n.precision,this.trim=!!n.trim,this.type=n.type===void 0?"":n.type+""}np.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(this.width===void 0?"":Math.max(1,this.width|0))+(this.comma?",":"")+(this.precision===void 0?"":"."+Math.max(0,this.precision|0))+(this.trim?"~":"")+this.type};function GA(n){e:for(var e=n.length,t=1,i=-1,r;t<e;++t)switch(n[t]){case".":i=r=t;break;case"0":i===0&&(i=t),r=t;break;default:if(!+n[t])break e;i>0&&(i=0);break}return i>0?n.slice(0,i)+n.slice(r+1):n}var su;function jA(n,e){var t=Es(n,e);if(!t)return su=void 0,n.toPrecision(e);var i=t[0],r=t[1],o=r-(su=Math.max(-8,Math.min(8,Math.floor(r/3)))*3)+1,s=i.length;return o===s?i:o>s?i+new Array(o-s+1).join("0"):o>0?i.slice(0,o)+"."+i.slice(o):"0."+new Array(1-o).join("0")+Es(n,Math.max(0,e+o-1))[0]}function P0(n,e){var t=Es(n,e);if(!t)return n+"";var i=t[0],r=t[1];return r<0?"0."+new Array(-r).join("0")+i:i.length>r+1?i.slice(0,r+1)+"."+i.slice(r+1):i+new Array(r-i.length+2).join("0")}var F0={"%":(n,e)=>(n*100).toFixed(e),b:n=>Math.round(n).toString(2),c:n=>n+"",d:VA,e:(n,e)=>n.toExponential(e),f:(n,e)=>n.toFixed(e),g:(n,e)=>n.toPrecision(e),o:n=>Math.round(n).toString(8),p:(n,e)=>P0(n*100,e),r:P0,s:jA,X:n=>Math.round(n).toString(16).toUpperCase(),x:n=>Math.round(n).toString(16)};function O0(n){return n}var WA=Array.prototype.map,$A=["y","z","a","f","p","n","\xB5","m","","k","M","G","T","P","E","Z","Y"];function qA(n){var e=n.grouping===void 0||n.thousands===void 0?O0:HA(WA.call(n.grouping,Number),n.thousands+""),t=n.currency===void 0?"":n.currency[0]+"",i=n.currency===void 0?"":n.currency[1]+"",r=n.decimal===void 0?".":n.decimal+"",o=n.numerals===void 0?O0:zA(WA.call(n.numerals,String)),s=n.percent===void 0?"%":n.percent+"",a=n.minus===void 0?"\u2212":n.minus+"",c=n.nan===void 0?"NaN":n.nan+"";function l(d,f){d=_o(d);var h=d.fill,g=d.align,y=d.sign,p=d.symbol,m=d.zero,x=d.width,E=d.comma,_=d.precision,M=d.trim,w=d.type;w==="n"?(E=!0,w="g"):F0[w]||(_===void 0&&(_=12),M=!0,w="g"),(m||h==="0"&&g==="=")&&(m=!0,h="0",g="=");var D=(f&&f.prefix!==void 0?f.prefix:"")+(p==="$"?t:p==="#"&&/[boxX]/.test(w)?"0"+w.toLowerCase():""),b=(p==="$"?i:/[%p]/.test(w)?s:"")+(f&&f.suffix!==void 0?f.suffix:""),C=F0[w],A=/[defgprs%]/.test(w);_=_===void 0?6:/[gprs]/.test(w)?Math.max(1,Math.min(21,_)):Math.max(0,Math.min(20,_));function N(I){var k=D,P=b,B,X,V;if(w==="c")P=C(I)+P,I="";else{I=+I;var te=I<0||1/I<0;if(I=isNaN(I)?c:C(Math.abs(I),_),M&&(I=GA(I)),te&&+I==0&&y!=="+"&&(te=!1),k=(te?y==="("?y:a:y==="-"||y==="("?"":y)+k,P=(w==="s"&&!isNaN(I)&&su!==void 0?$A[8+su/3]:"")+P+(te&&y==="("?")":""),A){for(B=-1,X=I.length;++B<X;)if(V=I.charCodeAt(B),48>V||V>57){P=(V===46?r+I.slice(B+1):I.slice(B))+P,I=I.slice(0,B);break}}}E&&!m&&(I=e(I,1/0));var j=k.length+I.length+P.length,q=j<x?new Array(x-j+1).join(h):"";switch(E&&m&&(I=e(q+I,q.length?x-P.length:1/0),q=""),g){case"<":I=k+I+P+q;break;case"=":I=k+q+I+P;break;case"^":I=q.slice(0,j=q.length>>1)+k+I+P+q.slice(j);break;default:I=q+k+I+P;break}return o(I)}return N.toString=function(){return d+""},N}function u(d,f){var h=Math.max(-8,Math.min(8,Math.floor(or(f)/3)))*3,g=Math.pow(10,-h),y=l((d=_o(d),d.type="f",d),{suffix:$A[8+h/3]});return function(p){return y(g*p)}}return{format:l,formatPrefix:u}}var ip,rp,op;L0({thousands:",",grouping:[3],currency:["$",""]});function L0(n){return ip=qA(n),rp=ip.format,op=ip.formatPrefix,ip}function k0(n){return Math.max(0,-or(Math.abs(n)))}function U0(n,e){return Math.max(0,Math.max(-8,Math.min(8,Math.floor(or(e)/3)))*3-or(Math.abs(n)))}function B0(n,e){return n=Math.abs(n),e=Math.abs(e)-n,Math.max(0,or(e)-or(n))+1}function sp(n,e){switch(arguments.length){case 0:break;case 1:this.range(n);break;default:this.range(e).domain(n);break}return this}function V0(n){return function(){return n}}function H0(n){return+n}var XA=[0,1];function Ga(n){return n}function z0(n,e){return(e-=n=+n)?function(t){return(t-n)/e}:V0(isNaN(e)?NaN:.5)}function GB(n,e){var t;return n>e&&(t=n,n=e,e=t),function(i){return Math.max(n,Math.min(e,i))}}function jB(n,e,t){var i=n[0],r=n[1],o=e[0],s=e[1];return r<i?(i=z0(r,i),o=t(s,o)):(i=z0(i,r),o=t(o,s)),function(a){return o(i(a))}}function WB(n,e,t){var i=Math.min(n.length,e.length)-1,r=new Array(i),o=new Array(i),s=-1;for(n[i]<n[0]&&(n=n.slice().reverse(),e=e.slice().reverse());++s<i;)r[s]=z0(n[s],n[s+1]),o[s]=t(e[s],e[s+1]);return function(a){var c=Vl(n,a,1,i)-1;return o[c](r[c](a))}}function YA(n,e){return e.domain(n.domain()).range(n.range()).interpolate(n.interpolate()).clamp(n.clamp()).unknown(n.unknown())}function $B(){var n=XA,e=XA,t=Fr,i,r,o,s=Ga,a,c,l;function u(){var f=Math.min(n.length,e.length);return s!==Ga&&(s=GB(n[0],n[f-1])),a=f>2?WB:jB,c=l=null,d}function d(f){return f==null||isNaN(f=+f)?o:(c||(c=a(n.map(i),e,t)))(i(s(f)))}return d.invert=function(f){return s(r((l||(l=a(e,n.map(i),ln)))(f)))},d.domain=function(f){return arguments.length?(n=Array.from(f,H0),u()):n.slice()},d.range=function(f){return arguments.length?(e=Array.from(f),u()):e.slice()},d.rangeRound=function(f){return e=Array.from(f),t=x0,u()},d.clamp=function(f){return arguments.length?(s=f?!0:Ga,u()):s!==Ga},d.interpolate=function(f){return arguments.length?(t=f,u()):t},d.unknown=function(f){return arguments.length?(o=f,d):o},function(f,h){return i=f,r=h,u()}}function G0(){return $B()(Ga,Ga)}function j0(n,e,t,i){var r=c0(n,e,t),o;switch(i=_o(i??",f"),i.type){case"s":{var s=Math.max(Math.abs(n),Math.abs(e));return i.precision==null&&!isNaN(o=U0(r,s))&&(i.precision=o),op(i,s)}case"":case"e":case"g":case"p":case"r":{i.precision==null&&!isNaN(o=B0(r,Math.max(Math.abs(n),Math.abs(e))))&&(i.precision=o-(i.type==="e"));break}case"f":case"%":{i.precision==null&&!isNaN(o=k0(r))&&(i.precision=o-(i.type==="%")*2);break}}return rp(i)}function W0(n){var e=n.domain;return n.ticks=function(t){var i=e();return wh(i[0],i[i.length-1],t??10)},n.tickFormat=function(t,i){var r=e();return j0(r[0],r[r.length-1],t??10,i)},n.nice=function(t){t==null&&(t=10);var i=e(),r=0,o=i.length-1,s=i[r],a=i[o],c,l,u=10;for(a<s&&(l=s,s=a,a=l,l=r,r=o,o=l);u-- >0;){if(l=Hl(s,a,t),l===c)return i[r]=s,i[o]=a,e(i);if(l>0)s=Math.floor(s/l)*l,a=Math.ceil(a/l)*l;else if(l<0)s=Math.ceil(s*l)/l,a=Math.floor(a*l)/l;else break;c=l}return n},n}function xo(){var n=G0();return n.copy=function(){return YA(n,xo())},sp.apply(n,arguments),W0(n)}function ja(){var n=0,e=1,t=1,i=[.5],r=[0,1],o;function s(c){return c!=null&&c<=c?r[Vl(i,c,0,t)]:o}function a(){var c=-1;for(i=new Array(t);++c<t;)i[c]=((c+1)*e-(c-t)*n)/(t+1);return s}return s.domain=function(c){return arguments.length?([n,e]=c,n=+n,e=+e,a()):[n,e]},s.range=function(c){return arguments.length?(t=(r=Array.from(c)).length-1,a()):r.slice()},s.invertExtent=function(c){var l=r.indexOf(c);return l<0?[NaN,NaN]:l<1?[n,i[0]]:l>=t?[i[t-1],e]:[i[l-1],i[l]]},s.unknown=function(c){return arguments.length&&(o=c),s},s.thresholds=function(){return i.slice()},s.copy=function(){return ja().domain([n,e]).range(r).unknown(o)},sp.apply(W0(s),arguments)}function bo(n,e,t){this.k=n,this.x=e,this.y=t}bo.prototype={constructor:bo,scale:function(n){return n===1?this:new bo(this.k*n,this.x,this.y)},translate:function(n,e){return n===0&e===0?this:new bo(this.k,this.x+this.k*n,this.y+this.k*e)},apply:function(n){return[n[0]*this.k+this.x,n[1]*this.k+this.y]},applyX:function(n){return n*this.k+this.x},applyY:function(n){return n*this.k+this.y},invert:function(n){return[(n[0]-this.x)/this.k,(n[1]-this.y)/this.k]},invertX:function(n){return(n-this.x)/this.k},invertY:function(n){return(n-this.y)/this.k},rescaleX:function(n){return n.copy().domain(n.range().map(this.invertX,this).map(n.invert,n))},rescaleY:function(n){return n.copy().domain(n.range().map(this.invertY,this).map(n.invert,n))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var $0=new bo(1,0,0);q0.prototype=bo.prototype;function q0(n){for(;!n.__zoom;)if(!(n=n.parentNode))return $0;return n.__zoom}var au=[{id:0,name:"Diverge",type:"numeric",group:"Diverging color scales",scale:xo().domain([0,.5,1]).range(["#198FBD","#F7D529","#F7295B"])},{id:1,name:"Spectral",type:"numeric",group:"Diverging color scales",scale:xo().domain([0,.1,.2,.3,.4,.5,.6,.7,.8,.9,1]).range(["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"])},{id:2,name:"Viridis",type:"numeric",group:"Sequential color scales",scale:xo().domain([0,.2,.4,.6,.8,1]).range(["#440154","#3b528b","#21918c","#5ec962","#fde725"])},{id:3,name:"Plasma",type:"numeric",group:"Sequential color scales",scale:xo().domain([0,.2,.4,.6,.8,1]).range(["#0d0887","#7e03a8","#cc4778","#f89540","#f0f921"])},{id:4,name:"Observable10",type:"categorical",group:"Categorical color scales",scale:ja().domain([0,1]).range(["#4269d0","#efb118","#ff725c","#6cc5b0","#3ca951","#ff8ab7","#a463f2","#97bbf5","#9c6b4e","#9498a0"])},{id:5,name:"Tableau20",type:"categorical",group:"Categorical color scales",scale:ja().domain([0,1]).range(["#1F77B4","#AEC7E8","#FF7F0E","#FFBB78","#2CA02C","#98DF8A","#D62728","#FF9896","#9467BD","#C5B0D5","#8C564B","#C49C94","#E377C2","#F7B6D2","#7F7F7F","#C7C7C7","#BCBD22","#DBDB8D","#17BECF","#9EDAE5"])}];function Vle(n){return au.find(e=>e.id===n)??au[0]}function ZA(n,e=10){let t=n.scale.domain(),i=t[0],r=t[t.length-1],o=[];for(let s=0;s<e;s++){let a=s/(e-1),c=i+a*(r-i);o.push(n.scale(c))}return`linear-gradient(to right, ${o.join(", ")})`}function JA(n){return typeof n.scale.range=="function"?n.scale.range():[]}function Hle(n=au){let e=new Map;for(let t of n)e.has(t.group)||e.set(t.group,[]),e.get(t.group).push(t);return Array.from(e.entries()).map(([t,i])=>({group:t,scales:i}))}function X0(n){if(typeof n=="string"&&n.indexOf("rgb")!==-1)return n;let e;if(typeof n=="number"?e=n.toString(16).padStart(6,"0"):e=n.replace(/^#/,""),e.length===3&&(e=e.split("").map(o=>o+o).join("")),e.length!==6)throw new Error(`Invalid hex color: ${n}`);let t=parseInt(e.slice(0,2),16),i=parseInt(e.slice(2,4),16),r=parseInt(e.slice(4,6),16);return`rgb(${t}, ${i}, ${r})`}function XB(n,e){let t=n.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/);if(!t)return n;let i=t[1],r=t[2],o=t[3];return`rgba(${i},${r},${o},${e})`}var YB=.01,ZB=4;function Y0(n,e){let t=Object.fromEntries(Object.entries(n.features[n.currentContext]||{}).filter(([c])=>e.includes(c)).map(([c,l])=>[c,+l])),i=Object.keys(t),r=i.map(c=>t[c]),o=Math.max(...r)||1,s=i.length,a=r.every(c=>c<YB);return{featureMap:t,keys:i,maxValue:o,segments:s,allZero:a}}function Z0(n,e,t,i){n.beginPath(),n.arc(e,t,ZB,0,2*Math.PI),n.fillStyle=i,n.fill(),n.closePath()}function J0(n,e=350){return{centerX:e/2-n/2+20,centerY:n+40}}function jle(n,e=50,t,i,r,o,s){if(!n)return;let{featureMap:a,keys:c,maxValue:l,segments:u,allZero:d}=Y0(i,r),{centerX:f,centerY:h}=J0(e);if(K0(n,f,h,e,s),Q0(n,c,f,h,e,s),d)Z0(n,f,h,t);else{let g=e*.95;n.beginPath(),c.forEach((y,p)=>{let m=+a[y]||0,x=s.scaleLinear?m:m/l,E=p/u*Math.PI*2,_=f+Math.cos(E)*g*x,M=h-Math.sin(E)*g*x;p===0?n.moveTo(_,M):n.lineTo(_,M)}),n.closePath(),n.fillStyle=XB(t,.4),n.fill(),s.useContour&&(n.strokeStyle=t,n.lineWidth=2,n.stroke())}ex(n,c,o,f,h,e,s)}function Wle(n,e=50,t,i,r,o,s){if(!n)return;let{featureMap:a,keys:c,maxValue:l,segments:u,allZero:d}=Y0(i,r),{centerX:f,centerY:h}=J0(e);K0(n,f,h,e,s),Q0(n,c,f,h,e,s),d?Z0(n,f,h,t):(n.save(),n.translate(f,h),n.globalAlpha=.6,c.forEach((g,y)=>{let p=+a[g]||0;if(p<=0)return;let m=s.scaleLinear?p:p/l,x=e*m*.95,E=x*.4,_=y/u*Math.PI*2+3*Math.PI/2;n.save(),n.rotate(-_);let M=new Path2D;M.moveTo(0,0),M.bezierCurveTo(E*.25,-x*.3,E*.6,-x*.75,0,-x),M.bezierCurveTo(-E*.6,-x*.75,-E*.25,-x*.3,0,0),n.fillStyle=t,n.fill(M),s.useContour&&(n.strokeStyle=t,n.stroke(M)),n.restore()}),n.restore()),ex(n,c,o,f,h,e,s)}function $le(n,e=50,t,i,r,o,s){if(!n)return;let{featureMap:a,keys:c,maxValue:l,segments:u,allZero:d}=Y0(i,r),{centerX:f,centerY:h}=J0(e);K0(n,f,h,e,s),Q0(n,c,f,h,e,s),d?Z0(n,f,h,t):(n.save(),n.translate(f,h),n.globalAlpha=.6,c.forEach((g,y)=>{let p=+a[g]||0;if(p<=0)return;let m=s.scaleLinear?p:p/l,x=e*m*.95,E=6,_=y/u*Math.PI*2+3*Math.PI/2;n.save(),n.rotate(-_),n.fillStyle=t,n.fillRect(-E/2,-x,E,x),n.restore()}),n.restore()),ex(n,c,o,f,h,e,s)}function K0(n,e,t,i,r){r.useBackground&&(n.beginPath(),n.arc(e,t,i,0,2*Math.PI),n.fillStyle="#d7d7d7",n.fill(),n.closePath())}function Q0(n,e,t,i,r,o){if(!o.useCoordinateSystem)return;let s=e.length;n.strokeStyle="#aaaaaa",n.lineWidth=1,e.forEach((a,c)=>{let l=c/s*Math.PI*2,u=t+Math.cos(l)*r,d=i-Math.sin(l)*r;n.beginPath(),n.moveTo(t,i),n.lineTo(u,d),n.stroke(),n.closePath()})}function ex(n,e,t,i,r,o,s){if(!s.useLabels)return;let a=o+15,c=4,l=e.length;n.textRendering="geometricPrecision",n.fillStyle="#000000",n.font='11px "Lucida Sans", "Lucida Sans Regular", "Lucida Grande", "Lucida Sans Unicode", Geneva, Verdana, sans-serif',e.forEach((u,d)=>{let f=d/l*Math.PI*2,h=t[u]||u,g=i+Math.cos(f)*a,y=r-Math.sin(f)*a,p=Math.cos(f),m=Math.sin(f);Math.abs(m)>.95?(n.textAlign=p>0?"left":"right",g+=p>0?c:-c,n.textBaseline="middle"):p>.1?(n.textAlign="left",n.textBaseline="middle",g+=c):p<-.1?(n.textAlign="right",n.textBaseline="middle",g-=c):(n.textAlign="center",n.textBaseline=m>0?"top":"bottom"),n.fillText(h,g,y)})}var ap=(s=>(s[s.None=0]="None",s[s.Star=1]="Star",s[s.Flower=2]="Flower",s[s.Whisker=3]="Whisker",s[s.Dot=4]="Dot",s[s.Thumb=5]="Thumb",s))(ap||{}),JB={0:"None",1:"Star",2:"Flower",3:"Whisker",4:"Dot",5:"Thumbnail"};function Xle(n){return JB[n]??"Unknown"}var cp=class{_useCoordinateSystem=!0;_useCategories=!0;_useBackground=!0;_useLabels=!0;_useContour=!0;_radius=0;_scaleLinear=!1;_glyphType=1;options=[{property:"useCoordinateSystem",label:"Coordinate System"},{property:"useBackground",label:"Circle Background"},{property:"useContour",label:"Contour"}];get useCoordinateSystem(){return this._useCoordinateSystem}set useCoordinateSystem(e){this._useCoordinateSystem=e}get useBackground(){return this._useBackground}set useBackground(e){this._useBackground=e}get useCategories(){return this._useCategories}set useCategories(e){this._useCategories=e}get useContour(){return this._useContour}set useContour(e){this._useContour=e}get useLabels(){return this._useLabels}set useLabels(e){this._useLabels=e}get glyphOptions(){return this.options}set glyphOptions(e){this.options=e}get glyphType(){return this._glyphType}set glyphType(e){this._glyphType=e}get radius(){return this._radius}set radius(e){this._radius=e}get scaleLinear(){return this._scaleLinear}set scaleLinear(e){this._scaleLinear=e}};function lp(n,e,t,i){if(t[e]==="categorical"){let r=i[e];if(r!==void 0&&r>0)return n/r}return n}var Wa=class n{colorScales=au;_activeFeatures=[];_colorFeature="";_featureLabels={};_metadataLabels={};_featureTypes={};_featureMaxValues={};_dataSource="";_selectedColorScale=0;modalOpenSubject=new nn(!1);modalOpenSubject$=this.modalOpenSubject.asObservable();get modalOpen(){return this.modalOpenSubject.getValue()}set modalOpen(e){this.modalOpenSubject.next(e)}config=new cp;removeCanvasSubject=new nn(0);removeCanvasSubject$=this.removeCanvasSubject.asObservable();glyphConfigSubject=new nn(this.config);glyphConfigSubject$=this.glyphConfigSubject.asObservable();commandSubject=new Gt;commandSubject$=this.commandSubject.asObservable();redrawGlyphSubject=new Gt;redrawGlyphSubject$=this.redrawGlyphSubject.asObservable();drawMagicLensGlyphsSubject=new Gt;drawMagicLensGlyphsSubject$=this.drawMagicLensGlyphsSubject.asObservable();animateGlyphSubject=new Gt;animateGlyphSubject$=this.animateGlyphSubject.asObservable();loadedDataSubject=new nn("");loadedDataSubject$=this.loadedDataSubject.asObservable();redrawGlyph(e){this.redrawGlyphSubject.next(e)}reRender(){this.commandSubject.next(2)}removeCanvas(e){this.removeCanvasSubject.next(e)}drawMagicLensGlyphs(e){this.drawMagicLensGlyphsSubject.next(e)}animateGlyph(e){this.animateGlyphSubject.next(e)}loadData(e){this.loadedDataSubject.next(e)}get dataSource(){return this._dataSource}set dataSource(e){this._dataSource=e}get loadedData(){return this.loadedDataSubject.getValue()}redraw(){this.commandSubject.next(1)}toggleFitToScreen(){this.commandSubject.next(3)}exportImage(){this.commandSubject.next(5)}clearSelection(){this.commandSubject.next(4)}getRgbaColor(e){let t=X0("#00cc88");if(e!=null){let i=lp(e[1][this._colorFeature],this._colorFeature,this._featureTypes,this._featureMaxValues),r=this.color;r&&(t=r(i),this.colorRange||(t=X0(t)))}return t}getConfiguration(){return this.config}updateConfiguration(){this.glyphConfigSubject.next(this.config)}replaceActiveFeatures(e){this.activeFeatures.splice(0,this.activeFeatures.length),this.activeFeatures.push(...e)}get color(){return this.colorScales.find(e=>e.id===this._selectedColorScale)?.scale}get colorRange(){return this._selectedColorScale}set colorRange(e){this._selectedColorScale=e}get activeFeatures(){return this._activeFeatures}get featureLabels(){return this._featureLabels}set featureLabels(e){this._featureLabels=Re({},e)}get metadataLabels(){return this._metadataLabels}set metadataLabels(e){this._metadataLabels=Re({},e)}set colorFeature(e){this._colorFeature=e}get colorFeature(){return this._colorFeature}set featureTypes(e){this._featureTypes=Re({},e)}get featureTypes(){return this._featureTypes}set featureMaxValues(e){this._featureMaxValues=Re({},e)}get featureMaxValues(){return this._featureMaxValues}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var up=class n{worker=new Worker(new URL("worker-UBV352RN.js",import.meta.url),{type:"module"});thumbCache=new Map;thumbSubjects=new Map;message$=new Gt;nextRequestId=0;processingProgress$=new Gt;constructor(){this.worker.onmessage=({data:e})=>{this.message$.next(e)},this.message$.subscribe(e=>{e.type==="thumb"?this.handleThumb(e.file,e.data):e.type==="error"?console.warn("[PyodideWorker]",e.message):e.type==="processingProgress"&&this.processingProgress$.next({step:e.step,progress:e.progress,message:e.message})})}unzip(e){return Ve(this,null,function*(){return(yield this.sendRequestUntil("unzipped",{type:"unzip",fileName:e.name,buffer:yield e.arrayBuffer()})).folder})}fetchJson(e){return Ve(this,null,function*(){return(yield this.sendRequestUntil("json",{type:"getJson",file:e},i=>i.file===e)).data})}profileData(e,t){return Ve(this,null,function*(){return(yield this.sendRequestUntil("dataProfile",{type:"profileData",fileName:e,buffer:t})).profile})}computeHistogram(e,t,i=50){return Ve(this,null,function*(){return(yield this.sendRequestUntil("histogram",{type:"computeHistogram",fileName:e,columnName:t,bins:i},o=>o.columnName===t)).data})}detectOutliers(e,t,i){return Ve(this,null,function*(){return(yield this.sendRequestUntil("outliers",{type:"detectOutliers",fileName:e,columnName:t,method:i},o=>o.columnName===t)).data})}detectDuplicates(e,t){return Ve(this,null,function*(){return(yield this.sendRequestUntil("duplicates",{type:"detectDuplicates",fileName:e,subsetColumns:t},r=>r.type==="duplicates")).data})}processWithConfig(e,t){return Ve(this,null,function*(){return(yield this.sendRequestUntil("processed",{type:"processWithConfig",fileName:e,config:t})).dataset})}getProcessedFeatures(){return Ve(this,null,function*(){return(yield this.sendRequestUntil("processedFeatures",{type:"getProcessedFeatures"})).data})}pruneFiles(e){return Ve(this,null,function*(){yield this.sendRequestUntil("filesPruned",{type:"pruneFiles",keep:e})})}get processingProgress(){return this.processingProgress$.asObservable()}requestThumb(e){if(this.thumbCache.has(e))return Ws(this.thumbCache.get(e));if(!this.thumbSubjects.has(e)){let t=new nn(null);this.thumbSubjects.set(e,t),this.worker.postMessage({type:"getThumb",file:e})}return this.thumbSubjects.get(e).asObservable()}handleThumb(e,t){return Ve(this,null,function*(){try{let i=new Blob([new Uint8Array(t)],{type:this.guessMimeType(e)}),r=yield createImageBitmap(i);this.thumbCache.set(e,r);let o=this.thumbSubjects.get(e);o&&(o.next(r),o.complete())}catch(i){console.error(`Failed to decode thumbnail "${e}":`,i)}})}guessMimeType(e){return e.endsWith(".png")?"image/png":e.endsWith(".jpg")||e.endsWith(".jpeg")?"image/jpeg":e.endsWith(".webp")?"image/webp":"application/octet-stream"}sendRequestUntil(e,t,i=()=>!0,r=6e4){let o=++this.nextRequestId;return new Promise((s,a)=>{let c=setTimeout(()=>{l.unsubscribe(),a(new Error(`Worker request "${e}" timed out after ${r}ms`))},r),l=this.message$.subscribe(u=>{u.requestId===o&&(u.type==="error"?(clearTimeout(c),l.unsubscribe(),a(new Error(typeof u.message=="string"?u.message:"Worker reported an error"))):u.type===e&&i(u)&&(clearTimeout(c),l.unsubscribe(),s(u)))});this.worker.postMessage(at(Re({},t),{requestId:o}))})}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var So={d:2};function tx(n){return n&&n>0?at(Re({},So),{neighbors:n}):So}function QB(n){if(!n)throw new Error("UMAP requires config with neighbors and minDist");return at(Re({},So),{n_neighbors:n.neighbors||15,min_dist:n.minDist??.1,local_connectivity:1})}function QA(n,e){switch(n){case"pca":return{className:"PCA",params:So};case"fastmap":return{className:"FASTMAP",params:So};case"isomap":return{className:"ISOMAP",params:tx(e?.isomapNeighbors)};case"umap":return{className:"UMAP",params:QB(e)};case"mds":return{className:"MDS",params:So};case"lle":return{className:"LLE",params:tx(e?.lleNeighbors)};case"ltsa":return{className:"LTSA",params:tx(e?.ltsaNeighbors)};case"trimap":return{className:"TriMap",params:So};case"topomap":return{className:"TopoMap",params:{}};case"sammon":return{className:"SAMMON",params:So};default:throw new Error(`Unknown projection method: ${n}`)}}function eV(n,e){return n.map((t,i)=>({id:e[i],x:t[0],y:t[1]}))}function eI(n,e,t,i){return Ve(this,null,function*(){let r=performance.now(),s=(yield n())[e.className];return{positions:eV(new s(t,e.params).transform(),i),computeTime:performance.now()-r}})}var nx=class extends Error{constructor(t){super(`${t} was cancelled`);this.method=t;this.name="ProjectionCancelledError"}method};function tV(){return import("./chunk-LCT6RGOE.js")}var tI=class n{constructor(e){this.ngZone=e}ngZone;backgroundStatus$=new nn(new Map);jobs=new Map;requests=new Map;runFastMapSync(e,t){return Ve(this,null,function*(){try{let{positions:i,computeTime:r}=yield eI(tV,QA("fastmap"),e,t);return{method:"fastmap",positions:i,computeTime:Math.round(r)}}catch(i){throw new Error(`FastMap failed: ${i instanceof Error?i.message:String(i)}`,{cause:i})}})}runFastMap(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("fastmap",e,t)})}runIsoMap(e,t,i){return Ve(this,null,function*(){return this.runProjectionInWorker("isomap",e,t,i?{isomapNeighbors:i.neighbors}:void 0)})}runPCABackground(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("pca",e,t)})}runTSNE(e,t,i){return Ve(this,null,function*(){return this.runProjectionInWorker("tsne",e,t,i)})}runUMAP(e,t,i){return Ve(this,null,function*(){return this.runProjectionInWorker("umap",e,t,i)})}runMDS(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("mds",e,t)})}runLLE(e,t,i){return Ve(this,null,function*(){return this.runProjectionInWorker("lle",e,t,i?{lleNeighbors:i.neighbors}:void 0)})}runLTSA(e,t,i){return Ve(this,null,function*(){return this.runProjectionInWorker("ltsa",e,t,i?{ltsaNeighbors:i.neighbors}:void 0)})}runTriMap(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("trimap",e,t)})}runTopoMap(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("topomap",e,t)})}runSammon(e,t){return Ve(this,null,function*(){return this.runProjectionInWorker("sammon",e,t)})}runProjectionInWorker(e,t,i,r){return this.startJob({method:e,features:t,ids:i,config:r})}startJob(e){let{method:t}=e;return this.requests.set(t,e),new Promise((i,r)=>{let o=new Worker(new URL("worker-3JMNIJ3A.js",import.meta.url),{type:"module"}),s={worker:o,request:e,reject:r,ended:!1};this.jobs.set(t,s),this.updateBackgroundStatus(t,"running",0,`Starting ${t.toUpperCase()}...`),o.onmessage=({data:c})=>{this.ngZone.run(()=>this.handleWorkerMessage(s,c,i))},o.onerror=c=>{this.ngZone.run(()=>this.failJob(s,`${t} worker error`,c.message))};let a={type:"compute",method:t,features:e.features,ids:e.ids,config:e.config};o.postMessage(a)})}handleWorkerMessage(e,t,i){let{method:r}=e.request;e.ended||(t.type==="progress"?this.updateBackgroundStatus(r,"running",t.progress||0,t.message||`Computing ${r}...`):t.type==="result"?(this.endJob(e),this.requests.get(r)===e.request&&this.requests.delete(r),this.updateBackgroundStatus(r,"complete",100,`${r} complete`),i({method:r,positions:t.positions??[],computeTime:t.computeTime??0})):t.type==="error"&&this.failJob(e,`${r} failed`,t.error??"Unknown error"))}failJob(e,t,i){e.ended||(this.endJob(e),this.updateBackgroundStatus(e.request.method,"error",0,t,i),e.reject(new Error(`${t}: ${i}`)))}endJob(e){e.ended=!0,e.worker.terminate(),this.jobs.get(e.request.method)===e&&this.jobs.delete(e.request.method)}cancel(e){let t=this.jobs.get(e);return t?(this.endJob(t),t.reject(new nx(e)),this.updateBackgroundStatus(e,"cancelled",0,"Cancelled"),!0):!1}isRunning(e){return this.jobs.has(e)}canRetry(e){return!this.jobs.has(e)&&this.requests.has(e)}retry(e){let t=this.requests.get(e);return t?this.startJob(t):Promise.reject(new Error(`There is no previous ${e} run to retry`))}detachAll(){this.jobs.clear(),this.requests.clear()}parseCSVFeatures(e){try{let t=e.trim().split(`
`);if(t.length<2)throw new Error("CSV file is empty or has no data rows");let i=t.slice(1),r=[],o=[];for(let s of i){if(!s.trim())continue;let a=s.split(",");if(a.length<2){console.warn("Skipping line with insufficient columns:",s);continue}let c=a[0];r.push(isNaN(Number(c))?c:Number(c));let l=a.slice(1).map(u=>{let d=parseFloat(u);if(isNaN(d))throw new Error(`Invalid numeric value in features: ${u}`);return d});o.push(l)}if(o.length===0)throw new Error("No valid feature data found in CSV");return{features:o,ids:r}}catch(t){throw new Error(`Failed to parse CSV features: ${t instanceof Error?t.message:String(t)}`,{cause:t})}}initializeBackgroundStatus(e){this.updateBackgroundStatus(e,"pending",0,"Waiting to start...")}updateBackgroundStatus(e,t,i,r,o){this.ngZone.run(()=>{let s=this.backgroundStatus$.value;s.set(e,{method:e,status:t,progress:i,message:r,error:o}),this.backgroundStatus$.next(new Map(s))})}getBackgroundStatus(e){return this.backgroundStatus$.value.get(e)}get backgroundStatusObservable(){return this.backgroundStatus$.asObservable()}clearBackgroundStatuses(){this.requests.clear(),this.backgroundStatus$.next(new Map)}terminateAllWorkers(){return Array.from(this.jobs.keys()).filter(e=>this.cancel(e))}static \u0275fac=function(t){return new(t||n)(lt(jt))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var nV="Can't undo \u2014 other changes were made since.",iV=5e3,nI=1e4,dp=class n{toastsSubject=new nn([]);toasts$=this.toastsSubject.asObservable();nextId=0;timers=new Map;show(e,t="info",i=iV,r){let o=r&&i>0?Math.max(i,nI):i,s={id:this.nextId++,message:e,type:t,duration:o,action:r},a=this.toastsSubject.getValue();this.toastsSubject.next([...a,s]),o>0&&this.startTimer(s.id,o)}showUndo(e,t,i=nI){this.show(e,"info",i,{label:"Undo",handler:()=>{t()||this.info(nV)}})}success(e,t){this.show(e,"success",t)}error(e,t){this.show(e,"error",t)}info(e,t){this.show(e,"info",t)}warning(e,t){this.show(e,"warning",t)}pause(e){let t=this.timers.get(e);if(!t||t.handle===null)return;clearTimeout(t.handle);let i=Date.now()-t.startedAt;this.timers.set(e,{handle:null,remaining:Math.max(0,t.remaining-i),startedAt:0})}resume(e){let t=this.timers.get(e);!t||t.handle!==null||this.startTimer(e,t.remaining)}remove(e){this.stopTimer(e);let t=this.toastsSubject.getValue();this.toastsSubject.next(t.filter(i=>i.id!==e))}clear(){[...this.timers.keys()].forEach(e=>this.stopTimer(e)),this.toastsSubject.next([])}startTimer(e,t){let i=setTimeout(()=>this.remove(e),t);this.timers.set(e,{handle:i,remaining:t,startedAt:Date.now()})}stopTimer(e){let t=this.timers.get(e)?.handle;t!=null&&clearTimeout(t),this.timers.delete(e)}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var fp=[{dataset:"wineqr",source:"local",items:[{algorithms:{feature:"wineqr.15012026.feature.json",position:{umap:"wineqr.15012026.position.umap.json",pca:"wineqr.15012026.position.pca.json",tsne:"wineqr.15012026.position.tsne.json"},meta:"wineqr.15012026.meta.json",schema:"wineqr.15012026.schema.json"},time:"15012026"}]},{dataset:"nutrients",source:"local",items:[{algorithms:{position:{umap:"nutrients.15012026.position.umap.json",pca:"nutrients.15012026.position.pca.json",tsne:"nutrients.15012026.position.tsne.json"},feature:"nutrients.15012026.feature.json",schema:"nutrients.15012026.schema.json",meta:"nutrients.15012026.meta.json"},time:"15012026"}]}];var oV="glyphspace-datasets",sV=1,sr="datasets",hp=class n{dbPromise=null;openDb(){return this.dbPromise||(this.dbPromise=new Promise((e,t)=>{let i=indexedDB.open(oV,sV);i.onupgradeneeded=()=>{let r=i.result;r.objectStoreNames.contains(sr)||r.createObjectStore(sr,{keyPath:"name"})},i.onsuccess=()=>e(i.result),i.onerror=()=>{this.dbPromise=null,t(i.error)}})),this.dbPromise}saveDataset(e){return Ve(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let o=t.transaction(sr,"readwrite");o.objectStore(sr).put(e),o.oncomplete=()=>i(),o.onerror=()=>r(o.error)})}catch(t){console.warn("[DatasetStorage] Failed to save dataset:",t)}})}getDataset(e){return Ve(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let s=t.transaction(sr,"readonly").objectStore(sr).get(e);s.onsuccess=()=>i(s.result??void 0),s.onerror=()=>r(s.error)})}catch(t){console.warn("[DatasetStorage] Failed to get dataset:",t);return}})}getAllDatasets(){return Ve(this,null,function*(){try{let e=yield this.openDb();return new Promise((t,i)=>{let o=e.transaction(sr,"readonly").objectStore(sr).getAll();o.onsuccess=()=>t(o.result??[]),o.onerror=()=>i(o.error)})}catch(e){return console.warn("[DatasetStorage] Failed to get all datasets:",e),[]}})}deleteDataset(e){return Ve(this,null,function*(){try{let t=yield this.openDb();return new Promise((i,r)=>{let o=t.transaction(sr,"readwrite");o.objectStore(sr).delete(e),o.oncomplete=()=>i(),o.onerror=()=>r(o.error)})}catch(t){console.warn("[DatasetStorage] Failed to delete dataset:",t)}})}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var pp=class{_filterMode=0;set filterMode(e){this._filterMode=e}get filterMode(){return this._filterMode}};var mp=class extends pp{_acceptableIds;constructor(e){super(),this._acceptableIds=e===void 0?[]:e}info(){return"Id Filter Length "+this._acceptableIds.length+" FilterMode: "+this.filterMode}empty(){return this._acceptableIds.length<=0}inFilter(e){return this._acceptableIds.indexOf(e.id)>=0}add(e){this._acceptableIds.indexOf(e)<0&&this._acceptableIds.push(e)}remove(e){let t=this._acceptableIds.indexOf(e);t>=0&&this._acceptableIds.splice(t,1)}toggle(e){let t=this._acceptableIds.indexOf(e);t>=0?this._acceptableIds.splice(t,1):this._acceptableIds.push(e)}get acceptableIds(){return this._acceptableIds}set acceptableIds(e){this._acceptableIds=e.sort()}clear(){this._acceptableIds.splice(0,this._acceptableIds.length)}addMultiple(e){e.forEach(t=>{this._acceptableIds.indexOf(t)<0&&this._acceptableIds.push(t)}),this._acceptableIds.sort()}};var gp=class n{filters=[];activeGlyphData;filterChangedSubject=new Gt;filterChanged$=this.filterChangedSubject.asObservable();totalItems=0;filteredItems=0;setActiveGlyphData(e){this.activeGlyphData=e}getGlyphDataSync(){return this.activeGlyphData}clearFilters(){this.filters.splice(0,this.filters.length),this.refreshFilters()}getFilters(){return this.filters}ensureFilter(e){this.filters.includes(e)||this.filters.push(e)}clearIdFilters(){this.filters.forEach(e=>{e instanceof mp&&e.clear()})}refreshFilters(){let e=this.activeGlyphData;if(e==null)return;let t=0,i=this.filters.length===0||this.filters.every(o=>o.empty()),r=this.filters.filter(o=>o.filterMode===1).every(o=>o.empty());e.forEach(o=>{let s=!0,a=r;this.filters.forEach(c=>{c.empty()||(c.filterMode===1?a=a||c.inFilter(o):c.filterMode===0&&(s=s&&c.inFilter(o)))}),o.passive=i?!1:!(s&&a),o.passive||t++}),this.filteredItems=t,this.filterChangedSubject.next()}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var yp=class n{dataSetCollectionSubject=new nn(fp);dataSetCollectionSubject$=this.dataSetCollectionSubject.asObservable();getCollection(){return this.dataSetCollectionSubject.getValue()}setDatasetCollection(e){let t=this.getCollection()??[],i=new Map;for(let r of t)i.set(r.dataset,at(Re({},r),{items:[...r.items]}));for(let r of e){let o=i.get(r.dataset);if(o)for(let s of r.items){let a=o.items.find(c=>c.time===s.time);a?a.algorithms.position=Re(Re({},a.algorithms.position),s.algorithms.position):o.items.push(s)}else i.set(r.dataset,at(Re({},r),{items:[...r.items]}))}this.dataSetCollectionSubject.next(Array.from(i.values()))}getCollectionEntry(e){if(e)return this.getCollection().find(t=>t.dataset===e)}getDataSetNames(){return(this.getCollection()??[]).map(t=>t.dataset)}getTimestamps(e){let t=[],i=this.getCollectionEntry(e);return i&&i.items.forEach(r=>{t.push(r.time)}),t}getPositions(e,t){let i=[],r=this.getCollectionEntry(e);if(r){let o=t?r.items.find(s=>s.time===t):r.items.at(0);o&&i.push(...Object.keys(o.algorithms.position))}return i}getContexts(e,t){return[]}removeDataset(e){let t=this.getCollection().filter(i=>i.dataset!==e);this.dataSetCollectionSubject.next(t)}notifyChange(){this.dataSetCollectionSubject.next([...this.getCollection()])}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var NI=0,Ux=1,PI=2;var Xu=1,FI=2,yc=3,pr=0,zn=1,Ht=2,mr=0,vc=1,Bx=2,Vx=3,Hx=4,OI=5;var Ps=100,LI=101,kI=102,UI=103,BI=104,VI=200,HI=201,zI=202,GI=203,zx=204,Gx=205,jI=206,WI=207,$I=208,qI=209,XI=210,YI=211,ZI=212,JI=213,KI=214,zp=0,Gp=1,jp=2,lc=3,Wp=4,$p=5,qp=6,Xp=7,jx=0,QI=1,e1=2,Hi=0,Wx=1,$x=2,qx=3,Xx=4,Yx=5,Zx=6,Jx=7;var Tx=300,Oo=301,Fs=302,Em=303,wm=304,Yu=306,Yp=1e3,cr=1001,Zp=1002,$t=1003,t1=1004;var Zu=1005;var Jt=1006,Cm=1007;var Lo=1008;var ci=1009,Kx=1010,Qx=1011,_c=1012,Tm=1013,zi=1014,Gi=1015,ji=1016,Dm=1017,Am=1018,xc=1020,eb=35902,tb=35899,nb=1021,ib=1022,xi=1023,ur=1026,ko=1027,rb=1028,Im=1029,Uo=1030,Rm=1031;var Nm=1033,Ju=33776,Ku=33777,Qu=33778,ed=33779,Pm=35840,Fm=35841,Om=35842,Lm=35843,km=36196,Um=37492,Bm=37496,Vm=37488,Hm=37489,td=37490,zm=37491,Gm=37808,jm=37809,Wm=37810,$m=37811,qm=37812,Xm=37813,Ym=37814,Zm=37815,Jm=37816,Km=37817,Qm=37818,eg=37819,tg=37820,ng=37821,ig=36492,rg=36494,og=36495,sg=36283,ag=36284,nd=36285,cg=36286;var yu=2300,Jp=2301,Vp=2302,Dx=2303,Ax=2400,Ix=2401,Rx=2402;var n1=3200;var ob=0,i1=1,Gr="",Bn="srgb",vu="srgb-linear",_u="linear",pt="srgb";var Hp=7680;var r1=519,o1=512,s1=513,a1=514,lg=515,c1=516,l1=517,ug=518,u1=519,sb=35044;var ab="300 es",Bi=2e3,xu=2001;function dV(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function fV(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function bu(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function d1(){let n=bu("canvas");return n.style.display="block",n}var iI={},uc=null;function Su(...n){let e="THREE."+n.shift();uc?uc("log",e,...n):console.log(e,...n)}function f1(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Le(...n){n=f1(n);let e="THREE."+n.shift();if(uc)uc("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function Be(...n){n=f1(n);let e="THREE."+n.shift();if(uc)uc("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function As(...n){let e=n.join(" ");e in iI||(iI[e]=!0,Le(...n))}function h1(n,e,t){return new Promise(function(i,r){function o(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(o,t);break;default:i()}}setTimeout(o,t)})}var p1={[zp]:Gp,[jp]:qp,[Wp]:Xp,[lc]:$p,[Gp]:zp,[qp]:jp,[Xp]:Wp,[$p]:lc},dr=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let r=i[e];if(r!==void 0){let o=r.indexOf(t);o!==-1&&r.splice(o,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let r=i.slice(0);for(let o=0,s=r.length;o<s;o++)r[o].call(this,e);e.target=null}}},wn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],rI=1234567,hu=Math.PI/180,dc=180/Math.PI;function lr(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(wn[n&255]+wn[n>>8&255]+wn[n>>16&255]+wn[n>>24&255]+"-"+wn[e&255]+wn[e>>8&255]+"-"+wn[e>>16&15|64]+wn[e>>24&255]+"-"+wn[t&63|128]+wn[t>>8&255]+"-"+wn[t>>16&255]+wn[t>>24&255]+wn[i&255]+wn[i>>8&255]+wn[i>>16&255]+wn[i>>24&255]).toLowerCase()}function We(n,e,t){return Math.max(e,Math.min(t,n))}function cb(n,e){return(n%e+e)%e}function hV(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function pV(n,e,t){return n!==e?(t-n)/(e-n):0}function pu(n,e,t){return(1-t)*n+t*e}function mV(n,e,t,i){return pu(n,e,1-Math.exp(-t*i))}function gV(n,e=1){return e-Math.abs(cb(n,e*2)-e)}function yV(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function vV(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function _V(n,e){return n+Math.floor(Math.random()*(e-n+1))}function xV(n,e){return n+Math.random()*(e-n)}function bV(n){return n*(.5-Math.random())}function SV(n){n!==void 0&&(rI=n);let e=rI+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function MV(n){return n*hu}function EV(n){return n*dc}function wV(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function CV(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function TV(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function DV(n,e,t,i,r){let o=Math.cos,s=Math.sin,a=o(t/2),c=s(t/2),l=o((e+i)/2),u=s((e+i)/2),d=o((e-i)/2),f=s((e-i)/2),h=o((i-e)/2),g=s((i-e)/2);switch(r){case"XYX":n.set(a*u,c*d,c*f,a*l);break;case"YZY":n.set(c*f,a*u,c*d,a*l);break;case"ZXZ":n.set(c*d,c*f,a*u,a*l);break;case"XZX":n.set(a*u,c*g,c*h,a*l);break;case"YXY":n.set(c*h,a*u,c*g,a*l);break;case"ZYZ":n.set(c*g,c*h,a*u,a*l);break;default:Le("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function Ui(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function yt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var lb={DEG2RAD:hu,RAD2DEG:dc,generateUUID:lr,clamp:We,euclideanModulo:cb,mapLinear:hV,inverseLerp:pV,lerp:pu,damp:mV,pingpong:gV,smoothstep:yV,smootherstep:vV,randInt:_V,randFloat:xV,randFloatSpread:bV,seededRandom:SV,degToRad:MV,radToDeg:EV,isPowerOfTwo:wV,ceilPowerOfTwo:CV,floorPowerOfTwo:TV,setQuaternionFromProperEuler:DV,normalize:yt,denormalize:Ui},ye=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),r=Math.sin(t),o=this.x-e.x,s=this.y-e.y;return this.x=o*i-s*r+e.x,this.y=o*r+s*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},fr=class{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,o,s,a){let c=i[r+0],l=i[r+1],u=i[r+2],d=i[r+3],f=o[s+0],h=o[s+1],g=o[s+2],y=o[s+3];if(d!==y||c!==f||l!==h||u!==g){let p=c*f+l*h+u*g+d*y;p<0&&(f=-f,h=-h,g=-g,y=-y,p=-p);let m=1-a;if(p<.9995){let x=Math.acos(p),E=Math.sin(x);m=Math.sin(m*x)/E,a=Math.sin(a*x)/E,c=c*m+f*a,l=l*m+h*a,u=u*m+g*a,d=d*m+y*a}else{c=c*m+f*a,l=l*m+h*a,u=u*m+g*a,d=d*m+y*a;let x=1/Math.sqrt(c*c+l*l+u*u+d*d);c*=x,l*=x,u*=x,d*=x}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,r,o,s){let a=i[r],c=i[r+1],l=i[r+2],u=i[r+3],d=o[s],f=o[s+1],h=o[s+2],g=o[s+3];return e[t]=a*g+u*d+c*h-l*f,e[t+1]=c*g+u*f+l*d-a*h,e[t+2]=l*g+u*h+a*f-c*d,e[t+3]=u*g-a*d-c*f-l*h,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,r=e._y,o=e._z,s=e._order,a=Math.cos,c=Math.sin,l=a(i/2),u=a(r/2),d=a(o/2),f=c(i/2),h=c(r/2),g=c(o/2);switch(s){case"XYZ":this._x=f*u*d+l*h*g,this._y=l*h*d-f*u*g,this._z=l*u*g+f*h*d,this._w=l*u*d-f*h*g;break;case"YXZ":this._x=f*u*d+l*h*g,this._y=l*h*d-f*u*g,this._z=l*u*g-f*h*d,this._w=l*u*d+f*h*g;break;case"ZXY":this._x=f*u*d-l*h*g,this._y=l*h*d+f*u*g,this._z=l*u*g+f*h*d,this._w=l*u*d-f*h*g;break;case"ZYX":this._x=f*u*d-l*h*g,this._y=l*h*d+f*u*g,this._z=l*u*g-f*h*d,this._w=l*u*d+f*h*g;break;case"YZX":this._x=f*u*d+l*h*g,this._y=l*h*d+f*u*g,this._z=l*u*g-f*h*d,this._w=l*u*d-f*h*g;break;case"XZY":this._x=f*u*d-l*h*g,this._y=l*h*d-f*u*g,this._z=l*u*g+f*h*d,this._w=l*u*d+f*h*g;break;default:Le("Quaternion: .setFromEuler() encountered an unknown order: "+s)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],r=t[4],o=t[8],s=t[1],a=t[5],c=t[9],l=t[2],u=t[6],d=t[10],f=i+a+d;if(f>0){let h=.5/Math.sqrt(f+1);this._w=.25/h,this._x=(u-c)*h,this._y=(o-l)*h,this._z=(s-r)*h}else if(i>a&&i>d){let h=2*Math.sqrt(1+i-a-d);this._w=(u-c)/h,this._x=.25*h,this._y=(r+s)/h,this._z=(o+l)/h}else if(a>d){let h=2*Math.sqrt(1+a-i-d);this._w=(o-l)/h,this._x=(r+s)/h,this._y=.25*h,this._z=(c+u)/h}else{let h=2*Math.sqrt(1+d-i-a);this._w=(s-r)/h,this._x=(o+l)/h,this._y=(c+u)/h,this._z=.25*h}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(We(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,r=e._y,o=e._z,s=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=i*u+s*a+r*l-o*c,this._y=r*u+s*c+o*a-i*l,this._z=o*u+s*l+i*c-r*a,this._w=s*u-i*a-r*c-o*l,this._onChangeCallback(),this}slerp(e,t){let i=e._x,r=e._y,o=e._z,s=e._w,a=this.dot(e);a<0&&(i=-i,r=-r,o=-o,s=-s,a=-a);let c=1-t;if(a<.9995){let l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+i*t,this._y=this._y*c+r*t,this._z=this._z*c+o*t,this._w=this._w*c+s*t,this._onChangeCallback()}else this._x=this._x*c+i*t,this._y=this._y*c+r*t,this._z=this._z*c+o*t,this._w=this._w*c+s*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),o=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),o*Math.sin(t),o*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(oI.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(oI.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[3]*i+o[6]*r,this.y=o[1]*t+o[4]*i+o[7]*r,this.z=o[2]*t+o[5]*i+o[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,o=e.elements,s=1/(o[3]*t+o[7]*i+o[11]*r+o[15]);return this.x=(o[0]*t+o[4]*i+o[8]*r+o[12])*s,this.y=(o[1]*t+o[5]*i+o[9]*r+o[13])*s,this.z=(o[2]*t+o[6]*i+o[10]*r+o[14])*s,this}applyQuaternion(e){let t=this.x,i=this.y,r=this.z,o=e.x,s=e.y,a=e.z,c=e.w,l=2*(s*r-a*i),u=2*(a*t-o*r),d=2*(o*i-s*t);return this.x=t+c*l+s*d-a*u,this.y=i+c*u+a*l-o*d,this.z=r+c*d+o*u-s*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,r=this.z,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r,this.y=o[1]*t+o[5]*i+o[9]*r,this.z=o[2]*t+o[6]*i+o[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,r=e.y,o=e.z,s=t.x,a=t.y,c=t.z;return this.x=r*c-o*a,this.y=o*s-i*c,this.z=i*a-r*s,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ix.copy(this).projectOnVector(e),this.sub(ix)}reflect(e){return this.sub(ix.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(We(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},ix=new R,oI=new fr,Ge=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,r,o,s,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,s,a,c,l)}set(e,t,i,r,o,s,a,c,l){let u=this.elements;return u[0]=e,u[1]=r,u[2]=a,u[3]=t,u[4]=o,u[5]=c,u[6]=i,u[7]=s,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,o=this.elements,s=i[0],a=i[3],c=i[6],l=i[1],u=i[4],d=i[7],f=i[2],h=i[5],g=i[8],y=r[0],p=r[3],m=r[6],x=r[1],E=r[4],_=r[7],M=r[2],w=r[5],D=r[8];return o[0]=s*y+a*x+c*M,o[3]=s*p+a*E+c*w,o[6]=s*m+a*_+c*D,o[1]=l*y+u*x+d*M,o[4]=l*p+u*E+d*w,o[7]=l*m+u*_+d*D,o[2]=f*y+h*x+g*M,o[5]=f*p+h*E+g*w,o[8]=f*m+h*_+g*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*s*u-t*a*l-i*o*u+i*a*c+r*o*l-r*s*c}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],u=e[8],d=u*s-a*l,f=a*c-u*o,h=l*o-s*c,g=t*d+i*f+r*h;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return e[0]=d*y,e[1]=(r*l-u*i)*y,e[2]=(a*i-r*s)*y,e[3]=f*y,e[4]=(u*t-r*c)*y,e[5]=(r*o-a*t)*y,e[6]=h*y,e[7]=(i*c-l*t)*y,e[8]=(s*t-i*o)*y,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,o,s,a){let c=Math.cos(o),l=Math.sin(o);return this.set(i*c,i*l,-i*(c*s+l*a)+s+e,-r*l,r*c,-r*(-l*s+c*a)+a+t,0,0,1),this}scale(e,t){return As("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(rx.makeScale(e,t)),this}rotate(e){return As("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(rx.makeRotation(-e)),this}translate(e,t){return As("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(rx.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},rx=new Ge,sI=new Ge().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),aI=new Ge().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function AV(){let n={enabled:!0,workingColorSpace:vu,spaces:{},convert:function(r,o,s){return this.enabled===!1||o===s||!o||!s||(this.spaces[o].transfer===pt&&(r.r=zr(r.r),r.g=zr(r.g),r.b=zr(r.b)),this.spaces[o].primaries!==this.spaces[s].primaries&&(r.applyMatrix3(this.spaces[o].toXYZ),r.applyMatrix3(this.spaces[s].fromXYZ)),this.spaces[s].transfer===pt&&(r.r=ac(r.r),r.g=ac(r.g),r.b=ac(r.b))),r},workingToColorSpace:function(r,o){return this.convert(r,this.workingColorSpace,o)},colorSpaceToWorking:function(r,o){return this.convert(r,o,this.workingColorSpace)},getPrimaries:function(r){return this.spaces[r].primaries},getTransfer:function(r){return r===Gr?_u:this.spaces[r].transfer},getToneMappingMode:function(r){return this.spaces[r].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(r,o=this.workingColorSpace){return r.fromArray(this.spaces[o].luminanceCoefficients)},define:function(r){Object.assign(this.spaces,r)},_getMatrix:function(r,o,s){return r.copy(this.spaces[o].toXYZ).multiply(this.spaces[s].fromXYZ)},_getDrawingBufferColorSpace:function(r){return this.spaces[r].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(r=this.workingColorSpace){return this.spaces[r].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(r,o){return As("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(r,o)},toWorkingColorSpace:function(r,o){return As("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(r,o)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[vu]:{primaries:e,whitePoint:i,transfer:_u,toXYZ:sI,fromXYZ:aI,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Bn},outputColorSpaceConfig:{drawingBufferColorSpace:Bn}},[Bn]:{primaries:e,whitePoint:i,transfer:pt,toXYZ:sI,fromXYZ:aI,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Bn}}}),n}var it=AV();function zr(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ac(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var $a,Kp=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{$a===void 0&&($a=bu("canvas")),$a.width=e.width,$a.height=e.height;let r=$a.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),i=$a}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=bu("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let r=i.getImageData(0,0,e.width,e.height),o=r.data;for(let s=0;s<o.length;s++)o[s]=zr(o[s]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(zr(t[i]/255)*255):t[i]=zr(t[i]);return{data:t,width:e.width,height:e.height}}else return Le("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},IV=0,fc=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:IV++}),this.uuid=lr(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let o;if(Array.isArray(r)){o=[];for(let s=0,a=r.length;s<a;s++)r[s].isDataTexture?o.push(ox(r[s].image)):o.push(ox(r[s]))}else o=ox(r);i.url=o}return t||(e.images[this.uuid]=i),i}};function ox(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Kp.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Le("Texture: Unable to serialize Texture."),{})}var RV=0,sx=new R,bi=(()=>{class n extends dr{constructor(t=n.DEFAULT_IMAGE,i=n.DEFAULT_MAPPING,r=cr,o=cr,s=Jt,a=Lo,c=xi,l=ci,u=n.DEFAULT_ANISOTROPY,d=Gr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:RV++}),this.uuid=lr(),this.name="",this.source=new fc(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=o,this.magFilter=s,this.minFilter=a,this.anisotropy=u,this.format=c,this.internalFormat=null,this.type=l,this.offset=new ye(0,0),this.repeat=new ye(1,1),this.center=new ye(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ge,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(sx).x}get height(){return this.source.getSize(sx).y}get depth(){return this.source.getSize(sx).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let i in t){let r=t[i];if(r===void 0){Le(`Texture.setValues(): parameter '${i}' has value of undefined.`);continue}let o=this[i];if(o===void 0){Le(`Texture.setValues(): property '${i}' does not exist.`);continue}o&&r&&o.isVector2&&r.isVector2||o&&r&&o.isVector3&&r.isVector3||o&&r&&o.isMatrix3&&r.isMatrix3?o.copy(r):this[i]=r}}toJSON(t){let i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let r={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(t.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Tx)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Yp:t.x=t.x-Math.floor(t.x);break;case cr:t.x=t.x<0?0:1;break;case Zp:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Yp:t.y=t.y-Math.floor(t.y);break;case cr:t.y=t.y<0?0:1;break;case Zp:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}return n.DEFAULT_IMAGE=null,n.DEFAULT_MAPPING=Tx,n.DEFAULT_ANISOTROPY=1,n})(),vt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,r=1){this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,r=this.z,o=this.w,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r+s[12]*o,this.y=s[1]*t+s[5]*i+s[9]*r+s[13]*o,this.z=s[2]*t+s[6]*i+s[10]*r+s[14]*o,this.w=s[3]*t+s[7]*i+s[11]*r+s[15]*o,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,o,c=e.elements,l=c[0],u=c[4],d=c[8],f=c[1],h=c[5],g=c[9],y=c[2],p=c[6],m=c[10];if(Math.abs(u-f)<.01&&Math.abs(d-y)<.01&&Math.abs(g-p)<.01){if(Math.abs(u+f)<.1&&Math.abs(d+y)<.1&&Math.abs(g+p)<.1&&Math.abs(l+h+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let E=(l+1)/2,_=(h+1)/2,M=(m+1)/2,w=(u+f)/4,D=(d+y)/4,b=(g+p)/4;return E>_&&E>M?E<.01?(i=0,r=.707106781,o=.707106781):(i=Math.sqrt(E),r=w/i,o=D/i):_>M?_<.01?(i=.707106781,r=0,o=.707106781):(r=Math.sqrt(_),i=w/r,o=b/r):M<.01?(i=.707106781,r=.707106781,o=0):(o=Math.sqrt(M),i=D/o,r=b/o),this.set(i,r,o,t),this}let x=Math.sqrt((p-g)*(p-g)+(d-y)*(d-y)+(f-u)*(f-u));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(d-y)/x,this.z=(f-u)/x,this.w=Math.acos((l+h+m-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=We(this.x,e.x,t.x),this.y=We(this.y,e.y,t.y),this.z=We(this.z,e.z,t.z),this.w=We(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=We(this.x,e,t),this.y=We(this.y,e,t),this.z=We(this.z,e,t),this.w=We(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(We(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Qp=class extends dr{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Jt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t),this.textures=[];let r={width:e,height:t,depth:i.depth},o=new bi(r),s=i.count;for(let a=0;a<s;a++)this.textures[a]=o.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,o=this.textures.length;r<o;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let r=Object.assign({},e.textures[t].image);this.textures[t].source=new fc(r)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Jn=class extends Qp{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Mu=class extends bi{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=cr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var em=class extends bi{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=$t,this.minFilter=$t,this.wrapR=cr,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Nt=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,r,o,s,a,c,l,u,d,f,h,g,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,o,s,a,c,l,u,d,f,h,g,y,p)}set(e,t,i,r,o,s,a,c,l,u,d,f,h,g,y,p){let m=this.elements;return m[0]=e,m[4]=t,m[8]=i,m[12]=r,m[1]=o,m[5]=s,m[9]=a,m[13]=c,m[2]=l,m[6]=u,m[10]=d,m[14]=f,m[3]=h,m[7]=g,m[11]=y,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,r=1/qa.setFromMatrixColumn(e,0).length(),o=1/qa.setFromMatrixColumn(e,1).length(),s=1/qa.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*o,t[5]=i[5]*o,t[6]=i[6]*o,t[7]=0,t[8]=i[8]*s,t[9]=i[9]*s,t[10]=i[10]*s,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,r=e.y,o=e.z,s=Math.cos(i),a=Math.sin(i),c=Math.cos(r),l=Math.sin(r),u=Math.cos(o),d=Math.sin(o);if(e.order==="XYZ"){let f=s*u,h=s*d,g=a*u,y=a*d;t[0]=c*u,t[4]=-c*d,t[8]=l,t[1]=h+g*l,t[5]=f-y*l,t[9]=-a*c,t[2]=y-f*l,t[6]=g+h*l,t[10]=s*c}else if(e.order==="YXZ"){let f=c*u,h=c*d,g=l*u,y=l*d;t[0]=f+y*a,t[4]=g*a-h,t[8]=s*l,t[1]=s*d,t[5]=s*u,t[9]=-a,t[2]=h*a-g,t[6]=y+f*a,t[10]=s*c}else if(e.order==="ZXY"){let f=c*u,h=c*d,g=l*u,y=l*d;t[0]=f-y*a,t[4]=-s*d,t[8]=g+h*a,t[1]=h+g*a,t[5]=s*u,t[9]=y-f*a,t[2]=-s*l,t[6]=a,t[10]=s*c}else if(e.order==="ZYX"){let f=s*u,h=s*d,g=a*u,y=a*d;t[0]=c*u,t[4]=g*l-h,t[8]=f*l+y,t[1]=c*d,t[5]=y*l+f,t[9]=h*l-g,t[2]=-l,t[6]=a*c,t[10]=s*c}else if(e.order==="YZX"){let f=s*c,h=s*l,g=a*c,y=a*l;t[0]=c*u,t[4]=y-f*d,t[8]=g*d+h,t[1]=d,t[5]=s*u,t[9]=-a*u,t[2]=-l*u,t[6]=h*d+g,t[10]=f-y*d}else if(e.order==="XZY"){let f=s*c,h=s*l,g=a*c,y=a*l;t[0]=c*u,t[4]=-d,t[8]=l*u,t[1]=f*d+y,t[5]=s*u,t[9]=h*d-g,t[2]=g*d-h,t[6]=a*u,t[10]=y*d+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(NV,e,PV)}lookAt(e,t,i){let r=this.elements;return ti.subVectors(e,t),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),Mo.crossVectors(i,ti),Mo.lengthSq()===0&&(Math.abs(i.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),Mo.crossVectors(i,ti)),Mo.normalize(),vp.crossVectors(ti,Mo),r[0]=Mo.x,r[4]=vp.x,r[8]=ti.x,r[1]=Mo.y,r[5]=vp.y,r[9]=ti.y,r[2]=Mo.z,r[6]=vp.z,r[10]=ti.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,r=t.elements,o=this.elements,s=i[0],a=i[4],c=i[8],l=i[12],u=i[1],d=i[5],f=i[9],h=i[13],g=i[2],y=i[6],p=i[10],m=i[14],x=i[3],E=i[7],_=i[11],M=i[15],w=r[0],D=r[4],b=r[8],C=r[12],A=r[1],N=r[5],I=r[9],k=r[13],P=r[2],B=r[6],X=r[10],V=r[14],te=r[3],j=r[7],q=r[11],J=r[15];return o[0]=s*w+a*A+c*P+l*te,o[4]=s*D+a*N+c*B+l*j,o[8]=s*b+a*I+c*X+l*q,o[12]=s*C+a*k+c*V+l*J,o[1]=u*w+d*A+f*P+h*te,o[5]=u*D+d*N+f*B+h*j,o[9]=u*b+d*I+f*X+h*q,o[13]=u*C+d*k+f*V+h*J,o[2]=g*w+y*A+p*P+m*te,o[6]=g*D+y*N+p*B+m*j,o[10]=g*b+y*I+p*X+m*q,o[14]=g*C+y*k+p*V+m*J,o[3]=x*w+E*A+_*P+M*te,o[7]=x*D+E*N+_*B+M*j,o[11]=x*b+E*I+_*X+M*q,o[15]=x*C+E*k+_*V+M*J,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],r=e[8],o=e[12],s=e[1],a=e[5],c=e[9],l=e[13],u=e[2],d=e[6],f=e[10],h=e[14],g=e[3],y=e[7],p=e[11],m=e[15],x=c*h-l*f,E=a*h-l*d,_=a*f-c*d,M=s*h-l*u,w=s*f-c*u,D=s*d-a*u;return t*(y*x-p*E+m*_)-i*(g*x-p*M+m*w)+r*(g*E-y*M+m*D)-o*(g*_-y*w+p*D)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],r=e[8],o=e[1],s=e[5],a=e[9],c=e[2],l=e[6],u=e[10];return t*(s*u-a*l)-i*(o*u-a*c)+r*(o*l-s*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],r=e[2],o=e[3],s=e[4],a=e[5],c=e[6],l=e[7],u=e[8],d=e[9],f=e[10],h=e[11],g=e[12],y=e[13],p=e[14],m=e[15],x=t*a-i*s,E=t*c-r*s,_=t*l-o*s,M=i*c-r*a,w=i*l-o*a,D=r*l-o*c,b=u*y-d*g,C=u*p-f*g,A=u*m-h*g,N=d*p-f*y,I=d*m-h*y,k=f*m-h*p,P=x*k-E*I+_*N+M*A-w*C+D*b;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/P;return e[0]=(a*k-c*I+l*N)*B,e[1]=(r*I-i*k-o*N)*B,e[2]=(y*D-p*w+m*M)*B,e[3]=(f*w-d*D-h*M)*B,e[4]=(c*A-s*k-l*C)*B,e[5]=(t*k-r*A+o*C)*B,e[6]=(p*_-g*D-m*E)*B,e[7]=(u*D-f*_+h*E)*B,e[8]=(s*I-a*A+l*b)*B,e[9]=(i*A-t*I-o*b)*B,e[10]=(g*w-y*_+m*x)*B,e[11]=(d*_-u*w-h*x)*B,e[12]=(a*C-s*N-c*b)*B,e[13]=(t*N-i*C+r*b)*B,e[14]=(y*E-g*M-p*x)*B,e[15]=(u*M-d*E+f*x)*B,this}scale(e){let t=this.elements,i=e.x,r=e.y,o=e.z;return t[0]*=i,t[4]*=r,t[8]*=o,t[1]*=i,t[5]*=r,t[9]*=o,t[2]*=i,t[6]*=r,t[10]*=o,t[3]*=i,t[7]*=r,t[11]*=o,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),r=Math.sin(t),o=1-i,s=e.x,a=e.y,c=e.z,l=o*s,u=o*a;return this.set(l*s+i,l*a-r*c,l*c+r*a,0,l*a+r*c,u*a+i,u*c-r*s,0,l*c-r*a,u*c+r*s,o*c*c+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,o,s){return this.set(1,i,o,0,e,1,s,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){let r=this.elements,o=t._x,s=t._y,a=t._z,c=t._w,l=o+o,u=s+s,d=a+a,f=o*l,h=o*u,g=o*d,y=s*u,p=s*d,m=a*d,x=c*l,E=c*u,_=c*d,M=i.x,w=i.y,D=i.z;return r[0]=(1-(y+m))*M,r[1]=(h+_)*M,r[2]=(g-E)*M,r[3]=0,r[4]=(h-_)*w,r[5]=(1-(f+m))*w,r[6]=(p+x)*w,r[7]=0,r[8]=(g+E)*D,r[9]=(p-x)*D,r[10]=(1-(f+y))*D,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let o=this.determinantAffine();if(o===0)return i.set(1,1,1),t.identity(),this;let s=qa.set(r[0],r[1],r[2]).length(),a=qa.set(r[4],r[5],r[6]).length(),c=qa.set(r[8],r[9],r[10]).length();o<0&&(s=-s),Fi.copy(this);let l=1/s,u=1/a,d=1/c;return Fi.elements[0]*=l,Fi.elements[1]*=l,Fi.elements[2]*=l,Fi.elements[4]*=u,Fi.elements[5]*=u,Fi.elements[6]*=u,Fi.elements[8]*=d,Fi.elements[9]*=d,Fi.elements[10]*=d,t.setFromRotationMatrix(Fi),i.x=s,i.y=a,i.z=c,this}makePerspective(e,t,i,r,o,s,a=Bi,c=!1){let l=this.elements,u=2*o/(t-e),d=2*o/(i-r),f=(t+e)/(t-e),h=(i+r)/(i-r),g,y;if(c)g=o/(s-o),y=s*o/(s-o);else if(a===Bi)g=-(s+o)/(s-o),y=-2*s*o/(s-o);else if(a===xu)g=-s/(s-o),y=-s*o/(s-o);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=d,l[9]=h,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,o,s,a=Bi,c=!1){let l=this.elements,u=2/(t-e),d=2/(i-r),f=-(t+e)/(t-e),h=-(i+r)/(i-r),g,y;if(c)g=1/(s-o),y=s/(s-o);else if(a===Bi)g=-2/(s-o),y=-(s+o)/(s-o);else if(a===xu)g=-1/(s-o),y=-o/(s-o);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=d,l[9]=0,l[13]=h,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},qa=new R,Fi=new Nt,NV=new R(0,0,0),PV=new R(1,1,1),Mo=new R,vp=new R,ti=new R,cI=new Nt,lI=new fr,Eu=(()=>{class n{constructor(t=0,i=0,r=0,o=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=r,this._order=o}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,r,o=this._order){return this._x=t,this._y=i,this._z=r,this._order=o,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,r=!0){let o=t.elements,s=o[0],a=o[4],c=o[8],l=o[1],u=o[5],d=o[9],f=o[2],h=o[6],g=o[10];switch(i){case"XYZ":this._y=Math.asin(We(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,g),this._z=Math.atan2(-a,s)):(this._x=Math.atan2(h,u),this._z=0);break;case"YXZ":this._x=Math.asin(-We(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(c,g),this._z=Math.atan2(l,u)):(this._y=Math.atan2(-f,s),this._z=0);break;case"ZXY":this._x=Math.asin(We(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,g),this._z=Math.atan2(-a,u)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-We(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,g),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-a,u));break;case"YZX":this._z=Math.asin(We(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,u),this._y=Math.atan2(-f,s)):(this._x=0,this._y=Math.atan2(c,g));break;case"XZY":this._z=Math.asin(-We(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,u),this._y=Math.atan2(c,s)):(this._x=Math.atan2(-d,g),this._y=0);break;default:Le("Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,r){return cI.makeRotationFromQuaternion(t),this.setFromRotationMatrix(cI,i,r)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return lI.setFromEuler(this),this.setFromQuaternion(lI,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}return n.DEFAULT_ORDER="XYZ",n})(),wu=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},FV=0,uI=new R,Xa=new fr,kr=new Nt,_p=new R,cu=new R,OV=new R,LV=new fr,dI=new R(1,0,0),fI=new R(0,1,0),hI=new R(0,0,1),pI={type:"added"},kV={type:"removed"},Ya={type:"childadded",child:null},ax={type:"childremoved",child:null},jr=(()=>{class n extends dr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:FV++}),this.uuid=lr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new R,i=new Eu,r=new fr,o=new R(1,1,1);function s(){r.setFromEuler(i,!1)}function a(){i.setFromQuaternion(r,void 0,!1)}i._onChange(s),r._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:o},modelViewMatrix:{value:new Nt},normalMatrix:{value:new Ge}}),this.matrix=new Nt,this.matrixWorld=new Nt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new wu,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return Xa.setFromAxisAngle(t,i),this.quaternion.multiply(Xa),this}rotateOnWorldAxis(t,i){return Xa.setFromAxisAngle(t,i),this.quaternion.premultiply(Xa),this}rotateX(t){return this.rotateOnAxis(dI,t)}rotateY(t){return this.rotateOnAxis(fI,t)}rotateZ(t){return this.rotateOnAxis(hI,t)}translateOnAxis(t,i){return uI.copy(t).applyQuaternion(this.quaternion),this.position.add(uI.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(dI,t)}translateY(t){return this.translateOnAxis(fI,t)}translateZ(t){return this.translateOnAxis(hI,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(kr.copy(this.matrixWorld).invert())}lookAt(t,i,r){t.isVector3?_p.copy(t):_p.set(t,i,r);let o=this.parent;this.updateWorldMatrix(!0,!1),cu.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?kr.lookAt(cu,_p,this.up):kr.lookAt(_p,cu,this.up),this.quaternion.setFromRotationMatrix(kr),o&&(kr.extractRotation(o.matrixWorld),Xa.setFromRotationMatrix(kr),this.quaternion.premultiply(Xa.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(Be("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(pI),Ya.child=t,this.dispatchEvent(Ya),Ya.child=null):Be("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}let i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(kV),ax.child=t,this.dispatchEvent(ax),ax.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),kr.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),kr.multiply(t.parent.matrixWorld)),t.applyMatrix4(kr),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(pI),Ya.child=t,this.dispatchEvent(Ya),Ya.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let r=0,o=this.children.length;r<o;r++){let a=this.children[r].getObjectByProperty(t,i);if(a!==void 0)return a}}getObjectsByProperty(t,i,r=[]){this[t]===i&&r.push(this);let o=this.children;for(let s=0,a=o.length;s<a;s++)o[s].getObjectsByProperty(t,i,r);return r}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(cu,t,OV),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(cu,LV,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].traverseVisible(t)}traverseAncestors(t){let i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let i=t.x,r=t.y,o=t.z,s=this.matrix.elements;s[12]+=i-s[0]*i-s[4]*r-s[8]*o,s[13]+=r-s[1]*i-s[5]*r-s[9]*o,s[14]+=o-s[2]*i-s[6]*r-s[10]*o}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateMatrixWorld(t)}updateWorldMatrix(t,i,r=!1){let o=this.parent;if(t===!0&&o!==null&&o.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||r)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,r=!0),i===!0){let s=this.children;for(let a=0,c=s.length;a<c;a++)s[a].updateWorldMatrix(!1,!0,r)}}toJSON(t){let i=t===void 0||typeof t=="string",r={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let o={};o.uuid=this.uuid,o.type=this.type,o.name=this.name,o.castShadow=this.castShadow,o.receiveShadow=this.receiveShadow,o.visible=this.visible,o.frustumCulled=this.frustumCulled,o.renderOrder=this.renderOrder,o.static=this.static,o.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(o.userData=this.userData),o.layers=this.layers.mask,o.matrix=this.matrix.toArray(),o.up=this.up.toArray(),this.pivot!==null&&(o.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(o.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(o.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(o.type="InstancedMesh",o.count=this.count,o.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(o.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(o.type="BatchedMesh",o.perObjectFrustumCulled=this.perObjectFrustumCulled,o.sortObjects=this.sortObjects,o.drawRanges=this._drawRanges,o.reservedRanges=this._reservedRanges,o.geometryInfo=this._geometryInfo.map(c=>at(Re({},c),{boundingBox:c.boundingBox?c.boundingBox.toJSON():void 0,boundingSphere:c.boundingSphere?c.boundingSphere.toJSON():void 0})),o.instanceInfo=this._instanceInfo.map(c=>Re({},c)),o.availableInstanceIds=this._availableInstanceIds.slice(),o.availableGeometryIds=this._availableGeometryIds.slice(),o.nextIndexStart=this._nextIndexStart,o.nextVertexStart=this._nextVertexStart,o.geometryCount=this._geometryCount,o.maxInstanceCount=this._maxInstanceCount,o.maxVertexCount=this._maxVertexCount,o.maxIndexCount=this._maxIndexCount,o.geometryInitialized=this._geometryInitialized,o.matricesTexture=this._matricesTexture.toJSON(t),o.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(o.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(o.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(o.boundingBox=this.boundingBox.toJSON()));function s(c,l){return c[l.uuid]===void 0&&(c[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?o.background=this.background.toJSON():this.background.isTexture&&(o.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(o.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){o.geometry=s(t.geometries,this.geometry);let c=this.geometry.parameters;if(c!==void 0&&c.shapes!==void 0){let l=c.shapes;if(Array.isArray(l))for(let u=0,d=l.length;u<d;u++){let f=l[u];s(t.shapes,f)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(o.bindMode=this.bindMode,o.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),o.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let c=[];for(let l=0,u=this.material.length;l<u;l++)c.push(s(t.materials,this.material[l]));o.material=c}else o.material=s(t.materials,this.material);if(this.children.length>0){o.children=[];for(let c=0;c<this.children.length;c++)o.children.push(this.children[c].toJSON(t).object)}if(this.animations.length>0){o.animations=[];for(let c=0;c<this.animations.length;c++){let l=this.animations[c];o.animations.push(s(t.animations,l))}}if(i){let c=a(t.geometries),l=a(t.materials),u=a(t.textures),d=a(t.images),f=a(t.shapes),h=a(t.skeletons),g=a(t.animations),y=a(t.nodes);c.length>0&&(r.geometries=c),l.length>0&&(r.materials=l),u.length>0&&(r.textures=u),d.length>0&&(r.images=d),f.length>0&&(r.shapes=f),h.length>0&&(r.skeletons=h),g.length>0&&(r.animations=g),y.length>0&&(r.nodes=y)}return r.object=o,r;function a(c){let l=[];for(let u in c){let d=c[u];delete d.metadata,l.push(d)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let r=0;r<t.children.length;r++){let o=t.children[r];this.add(o.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}return n.DEFAULT_UP=new R(0,1,0),n.DEFAULT_MATRIX_AUTO_UPDATE=!0,n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0,n})(),ii=class extends jr{constructor(){super(),this.isGroup=!0,this.type="Group"}},UV={type:"move"},hc=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ii,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ii,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ii,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,o=null,s=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){s=!0;for(let y of e.hand.values()){let p=t.getJointPose(y,i),m=this._getHandJoint(l,y);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let u=l.joints["index-finger-tip"],d=l.joints["thumb-tip"],f=u.position.distanceTo(d.position),h=.02,g=.005;l.inputState.pinching&&f>h+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=h-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(o=t.getPose(e.gripSpace,i),o!==null&&(c.matrix.fromArray(o.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,o.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(o.linearVelocity)):c.hasLinearVelocity=!1,o.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(o.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&o!==null&&(r=o),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(UV)))}return a!==null&&(a.visible=r!==null),c!==null&&(c.visible=o!==null),l!==null&&(l.visible=s!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new ii;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},m1={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Eo={h:0,s:0,l:0},xp={h:0,s:0,l:0};function cx(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var rt=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,it.colorSpaceToWorking(this,t),this}setRGB(e,t,i,r=it.workingColorSpace){return this.r=e,this.g=t,this.b=i,it.colorSpaceToWorking(this,r),this}setHSL(e,t,i,r=it.workingColorSpace){if(e=cb(e,1),t=We(t,0,1),i=We(i,0,1),t===0)this.r=this.g=this.b=i;else{let o=i<=.5?i*(1+t):i+t-i*t,s=2*i-o;this.r=cx(s,o,e+1/3),this.g=cx(s,o,e),this.b=cx(s,o,e-1/3)}return it.colorSpaceToWorking(this,r),this}setStyle(e,t=Bn){function i(o){o!==void 0&&parseFloat(o)<1&&Le("Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let o,s=r[1],a=r[2];switch(s){case"rgb":case"rgba":if(o=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setRGB(Math.min(255,parseInt(o[1],10))/255,Math.min(255,parseInt(o[2],10))/255,Math.min(255,parseInt(o[3],10))/255,t);if(o=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setRGB(Math.min(100,parseInt(o[1],10))/100,Math.min(100,parseInt(o[2],10))/100,Math.min(100,parseInt(o[3],10))/100,t);break;case"hsl":case"hsla":if(o=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(o[4]),this.setHSL(parseFloat(o[1])/360,parseFloat(o[2])/100,parseFloat(o[3])/100,t);break;default:Le("Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let o=r[1],s=o.length;if(s===3)return this.setRGB(parseInt(o.charAt(0),16)/15,parseInt(o.charAt(1),16)/15,parseInt(o.charAt(2),16)/15,t);if(s===6)return this.setHex(parseInt(o,16),t);Le("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bn){let i=m1[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Le("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=zr(e.r),this.g=zr(e.g),this.b=zr(e.b),this}copyLinearToSRGB(e){return this.r=ac(e.r),this.g=ac(e.g),this.b=ac(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bn){return it.workingToColorSpace(Cn.copy(this),e),Math.round(We(Cn.r*255,0,255))*65536+Math.round(We(Cn.g*255,0,255))*256+Math.round(We(Cn.b*255,0,255))}getHexString(e=Bn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=it.workingColorSpace){it.workingToColorSpace(Cn.copy(this),t);let i=Cn.r,r=Cn.g,o=Cn.b,s=Math.max(i,r,o),a=Math.min(i,r,o),c,l,u=(a+s)/2;if(a===s)c=0,l=0;else{let d=s-a;switch(l=u<=.5?d/(s+a):d/(2-s-a),s){case i:c=(r-o)/d+(r<o?6:0);break;case r:c=(o-i)/d+2;break;case o:c=(i-r)/d+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=it.workingColorSpace){return it.workingToColorSpace(Cn.copy(this),t),e.r=Cn.r,e.g=Cn.g,e.b=Cn.b,e}getStyle(e=Bn){it.workingToColorSpace(Cn.copy(this),e);let t=Cn.r,i=Cn.g,r=Cn.b;return e!==Bn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(Eo),this.setHSL(Eo.h+e,Eo.s+t,Eo.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Eo),e.getHSL(xp);let i=pu(Eo.h,xp.h,t),r=pu(Eo.s,xp.s,t),o=pu(Eo.l,xp.l,t);return this.setHSL(i,r,o),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,r=this.b,o=e.elements;return this.r=o[0]*t+o[3]*i+o[6]*r,this.g=o[1]*t+o[4]*i+o[7]*r,this.b=o[2]*t+o[5]*i+o[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Cn=new rt;rt.NAMES=m1;var Nx=class extends jr{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Eu,this.environmentIntensity=1,this.environmentRotation=new Eu,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Oi=new R,Ur=new R,lx=new R,Br=new R,Za=new R,Ja=new R,mI=new R,ux=new R,dx=new R,fx=new R,hx=new vt,px=new vt,mx=new vt,Do=class n{constructor(e=new R,t=new R,i=new R){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Oi.subVectors(e,t),r.cross(Oi);let o=r.lengthSq();return o>0?r.multiplyScalar(1/Math.sqrt(o)):r.set(0,0,0)}static getBarycoord(e,t,i,r,o){Oi.subVectors(r,t),Ur.subVectors(i,t),lx.subVectors(e,t);let s=Oi.dot(Oi),a=Oi.dot(Ur),c=Oi.dot(lx),l=Ur.dot(Ur),u=Ur.dot(lx),d=s*l-a*a;if(d===0)return o.set(0,0,0),null;let f=1/d,h=(l*c-a*u)*f,g=(s*u-a*c)*f;return o.set(1-h-g,g,h)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,Br)===null?!1:Br.x>=0&&Br.y>=0&&Br.x+Br.y<=1}static getInterpolation(e,t,i,r,o,s,a,c){return this.getBarycoord(e,t,i,r,Br)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(o,Br.x),c.addScaledVector(s,Br.y),c.addScaledVector(a,Br.z),c)}static getInterpolatedAttribute(e,t,i,r,o,s){return hx.setScalar(0),px.setScalar(0),mx.setScalar(0),hx.fromBufferAttribute(e,t),px.fromBufferAttribute(e,i),mx.fromBufferAttribute(e,r),s.setScalar(0),s.addScaledVector(hx,o.x),s.addScaledVector(px,o.y),s.addScaledVector(mx,o.z),s}static isFrontFacing(e,t,i,r){return Oi.subVectors(i,t),Ur.subVectors(e,t),Oi.cross(Ur).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Oi.subVectors(this.c,this.b),Ur.subVectors(this.a,this.b),Oi.cross(Ur).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,o){return n.getInterpolation(e,this.a,this.b,this.c,t,i,r,o)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,r=this.b,o=this.c,s,a;Za.subVectors(r,i),Ja.subVectors(o,i),ux.subVectors(e,i);let c=Za.dot(ux),l=Ja.dot(ux);if(c<=0&&l<=0)return t.copy(i);dx.subVectors(e,r);let u=Za.dot(dx),d=Ja.dot(dx);if(u>=0&&d<=u)return t.copy(r);let f=c*d-u*l;if(f<=0&&c>=0&&u<=0)return s=c/(c-u),t.copy(i).addScaledVector(Za,s);fx.subVectors(e,o);let h=Za.dot(fx),g=Ja.dot(fx);if(g>=0&&h<=g)return t.copy(o);let y=h*l-c*g;if(y<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(i).addScaledVector(Ja,a);let p=u*g-h*d;if(p<=0&&d-u>=0&&h-g>=0)return mI.subVectors(o,r),a=(d-u)/(d-u+(h-g)),t.copy(r).addScaledVector(mI,a);let m=1/(p+y+f);return s=y*m,a=f*m,t.copy(i).addScaledVector(Za,s).addScaledVector(Ja,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},oi=class{constructor(e=new R(1/0,1/0,1/0),t=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Li.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Li.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Li.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let o=i.getAttribute("position");if(t===!0&&o!==void 0&&e.isInstancedMesh!==!0)for(let s=0,a=o.count;s<a;s++)e.isMesh===!0?e.getVertexPosition(s,Li):Li.fromBufferAttribute(o,s),Li.applyMatrix4(e.matrixWorld),this.expandByPoint(Li);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),bp.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),bp.copy(i.boundingBox)),bp.applyMatrix4(e.matrixWorld),this.union(bp)}let r=e.children;for(let o=0,s=r.length;o<s;o++)this.expandByObject(r[o],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Li),Li.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(lu),Sp.subVectors(this.max,lu),Ka.subVectors(e.a,lu),Qa.subVectors(e.b,lu),ec.subVectors(e.c,lu),wo.subVectors(Qa,Ka),Co.subVectors(ec,Qa),ws.subVectors(Ka,ec);let t=[0,-wo.z,wo.y,0,-Co.z,Co.y,0,-ws.z,ws.y,wo.z,0,-wo.x,Co.z,0,-Co.x,ws.z,0,-ws.x,-wo.y,wo.x,0,-Co.y,Co.x,0,-ws.y,ws.x,0];return!gx(t,Ka,Qa,ec,Sp)||(t=[1,0,0,0,1,0,0,0,1],!gx(t,Ka,Qa,ec,Sp))?!1:(Mp.crossVectors(wo,Co),t=[Mp.x,Mp.y,Mp.z],gx(t,Ka,Qa,ec,Sp))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Li).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Li).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Vr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Vr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Vr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Vr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Vr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Vr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Vr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Vr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Vr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Vr=[new R,new R,new R,new R,new R,new R,new R,new R],Li=new R,bp=new oi,Ka=new R,Qa=new R,ec=new R,wo=new R,Co=new R,ws=new R,lu=new R,Sp=new R,Mp=new R,Cs=new R;function gx(n,e,t,i,r){for(let o=0,s=n.length-3;o<=s;o+=3){Cs.fromArray(n,o);let a=r.x*Math.abs(Cs.x)+r.y*Math.abs(Cs.y)+r.z*Math.abs(Cs.z),c=e.dot(Cs),l=t.dot(Cs),u=i.dot(Cs);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}var Zt=new R,Ep=new ye,BV=0,ri=class extends dr{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:BV++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=sb,this.updateRanges=[],this.gpuType=Gi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,o=this.itemSize;r<o;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ep.fromBufferAttribute(this,t),Ep.applyMatrix3(e),this.setXY(t,Ep.x,Ep.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.applyMatrix3(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.applyMatrix4(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.applyNormalMatrix(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Zt.fromBufferAttribute(this,t),Zt.transformDirection(e),this.setXYZ(t,Zt.x,Zt.y,Zt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ui(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=yt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array),r=yt(r,this.array),o=yt(o,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=o,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Cu=class extends ri{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Tu=class extends ri{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var It=class extends ri{constructor(e,t,i){super(new Float32Array(e),t,i)}},VV=new oi,uu=new R,yx=new R,hr=class{constructor(e=new R,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):VV.setFromPoints(e).getCenter(i);let r=0;for(let o=0,s=e.length;o<s;o++)r=Math.max(r,i.distanceToSquared(e[o]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;uu.subVectors(e,this.center);let t=uu.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(uu,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(yx.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(uu.copy(e.center).add(yx)),this.expandByPoint(uu.copy(e.center).sub(yx))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},HV=0,vi=new Nt,vx=new jr,tc=new R,ni=new oi,du=new oi,sn=new R,Vn=class n extends dr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:HV++}),this.uuid=lr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(dV(e)?Tu:Cu)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let o=new Ge().getNormalMatrix(e);i.applyNormalMatrix(o),i.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return vi.makeRotationFromQuaternion(e),this.applyMatrix4(vi),this}rotateX(e){return vi.makeRotationX(e),this.applyMatrix4(vi),this}rotateY(e){return vi.makeRotationY(e),this.applyMatrix4(vi),this}rotateZ(e){return vi.makeRotationZ(e),this.applyMatrix4(vi),this}translate(e,t,i){return vi.makeTranslation(e,t,i),this.applyMatrix4(vi),this}scale(e,t,i){return vi.makeScale(e,t,i),this.applyMatrix4(vi),this}lookAt(e){return vx.lookAt(e),vx.updateMatrix(),this.applyMatrix4(vx.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(tc).negate(),this.translate(tc.x,tc.y,tc.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let r=0,o=e.length;r<o;r++){let s=e[r];i.push(s.x,s.y,s.z||0)}this.setAttribute("position",new It(i,3))}else{let i=Math.min(e.length,t.count);for(let r=0;r<i;r++){let o=e[r];t.setXYZ(r,o.x,o.y,o.z||0)}e.length>t.count&&Le("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Be("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){let o=t[i];ni.setFromBufferAttribute(o),this.morphTargetsRelative?(sn.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(sn),sn.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(sn)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Be('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hr);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Be("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(e){let i=this.boundingSphere.center;if(ni.setFromBufferAttribute(e),t)for(let o=0,s=t.length;o<s;o++){let a=t[o];du.setFromBufferAttribute(a),this.morphTargetsRelative?(sn.addVectors(ni.min,du.min),ni.expandByPoint(sn),sn.addVectors(ni.max,du.max),ni.expandByPoint(sn)):(ni.expandByPoint(du.min),ni.expandByPoint(du.max))}ni.getCenter(i);let r=0;for(let o=0,s=e.count;o<s;o++)sn.fromBufferAttribute(e,o),r=Math.max(r,i.distanceToSquared(sn));if(t)for(let o=0,s=t.length;o<s;o++){let a=t[o],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)sn.fromBufferAttribute(a,l),c&&(tc.fromBufferAttribute(e,l),sn.add(tc)),r=Math.max(r,i.distanceToSquared(sn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&Be('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Be("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,r=t.normal,o=t.uv,s=this.getAttribute("tangent");(s===void 0||s.count!==i.count)&&(s=new ri(new Float32Array(4*i.count),4),this.setAttribute("tangent",s));let a=[],c=[];for(let b=0;b<i.count;b++)a[b]=new R,c[b]=new R;let l=new R,u=new R,d=new R,f=new ye,h=new ye,g=new ye,y=new R,p=new R;function m(b,C,A){l.fromBufferAttribute(i,b),u.fromBufferAttribute(i,C),d.fromBufferAttribute(i,A),f.fromBufferAttribute(o,b),h.fromBufferAttribute(o,C),g.fromBufferAttribute(o,A),u.sub(l),d.sub(l),h.sub(f),g.sub(f);let N=1/(h.x*g.y-g.x*h.y);isFinite(N)&&(y.copy(u).multiplyScalar(g.y).addScaledVector(d,-h.y).multiplyScalar(N),p.copy(d).multiplyScalar(h.x).addScaledVector(u,-g.x).multiplyScalar(N),a[b].add(y),a[C].add(y),a[A].add(y),c[b].add(p),c[C].add(p),c[A].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:e.count}]);for(let b=0,C=x.length;b<C;++b){let A=x[b],N=A.start,I=A.count;for(let k=N,P=N+I;k<P;k+=3)m(e.getX(k+0),e.getX(k+1),e.getX(k+2))}let E=new R,_=new R,M=new R,w=new R;function D(b){M.fromBufferAttribute(r,b),w.copy(M);let C=a[b];E.copy(C),E.sub(M.multiplyScalar(M.dot(C))).normalize(),_.crossVectors(w,C);let N=_.dot(c[b])<0?-1:1;s.setXYZW(b,E.x,E.y,E.z,N)}for(let b=0,C=x.length;b<C;++b){let A=x[b],N=A.start,I=A.count;for(let k=N,P=N+I;k<P;k+=3)D(e.getX(k+0)),D(e.getX(k+1)),D(e.getX(k+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new ri(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let f=0,h=i.count;f<h;f++)i.setXYZ(f,0,0,0);let r=new R,o=new R,s=new R,a=new R,c=new R,l=new R,u=new R,d=new R;if(e)for(let f=0,h=e.count;f<h;f+=3){let g=e.getX(f+0),y=e.getX(f+1),p=e.getX(f+2);r.fromBufferAttribute(t,g),o.fromBufferAttribute(t,y),s.fromBufferAttribute(t,p),u.subVectors(s,o),d.subVectors(r,o),u.cross(d),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,y),l.fromBufferAttribute(i,p),a.add(u),c.add(u),l.add(u),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,c.x,c.y,c.z),i.setXYZ(p,l.x,l.y,l.z)}else for(let f=0,h=t.count;f<h;f+=3)r.fromBufferAttribute(t,f+0),o.fromBufferAttribute(t,f+1),s.fromBufferAttribute(t,f+2),u.subVectors(s,o),d.subVectors(r,o),u.cross(d),i.setXYZ(f+0,u.x,u.y,u.z),i.setXYZ(f+1,u.x,u.y,u.z),i.setXYZ(f+2,u.x,u.y,u.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)sn.fromBufferAttribute(e,t),sn.normalize(),e.setXYZ(t,sn.x,sn.y,sn.z)}toNonIndexed(){function e(a,c){let l=a.array,u=a.itemSize,d=a.normalized,f=new l.constructor(c.length*u),h=0,g=0;for(let y=0,p=c.length;y<p;y++){a.isInterleavedBufferAttribute?h=c[y]*a.data.stride+a.offset:h=c[y]*u;for(let m=0;m<u;m++)f[g++]=l[h++]}return new ri(f,u,d)}if(this.index===null)return Le("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,r=this.attributes;for(let a in r){let c=r[a],l=e(c,i);t.setAttribute(a,l)}let o=this.morphAttributes;for(let a in o){let c=[],l=o[a];for(let u=0,d=l.length;u<d;u++){let f=l[u],h=e(f,i);c.push(h)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let s=this.groups;for(let a=0,c=s.length;a<c;a++){let l=s[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let c in i){let l=i[c];e.data.attributes[c]=l.toJSON(e.data)}let r={},o=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],u=[];for(let d=0,f=l.length;d<f;d++){let h=l[d];u.push(h.toJSON(e.data))}u.length>0&&(r[c]=u,o=!0)}o&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let s=this.groups;s.length>0&&(e.data.groups=JSON.parse(JSON.stringify(s)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let r=e.attributes;for(let l in r){let u=r[l];this.setAttribute(l,u.clone(t))}let o=e.morphAttributes;for(let l in o){let u=[],d=o[l];for(let f=0,h=d.length;f<h;f++)u.push(d[f].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;let s=e.groups;for(let l=0,u=s.length;l<u;l++){let d=s[l];this.addGroup(d.start,d.count,d.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},tm=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=sb,this.updateRanges=[],this.version=0,this.uuid=lr()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,o=this.stride;r<o;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=lr()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Un=new R,Vi=class n{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.applyMatrix4(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.applyNormalMatrix(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Un.fromBufferAttribute(this,t),Un.transformDirection(e),this.setXYZ(t,Un.x,Un.y,Un.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=Ui(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=yt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ui(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ui(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ui(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ui(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array),r=yt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,o){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),i=yt(i,this.array),r=yt(r,this.array),o=yt(o,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=o,this}clone(e){if(e===void 0){Su("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return new ri(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new n(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Su("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let i=0;i<this.count;i++){let r=i*this.data.stride+this.offset;for(let o=0;o<this.itemSize;o++)t.push(this.data.array[r+o])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},_x=new R,zV=new R,GV=new Ge,ki=class{constructor(e=new R(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let r=_x.subVectors(i,t).cross(zV.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let r=e.delta(_x),o=this.normal.dot(r);if(o===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let s=-(e.start.dot(this.normal)+this.constant)/o;return i===!0&&(s<0||s>1)?null:t.copy(e.start).addScaledVector(r,s)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||GV.getNormalMatrix(e),r=this.coplanarPoint(_x).applyMatrix4(e),o=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(o),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},jV=0,Is=class extends dr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:jV++}),this.uuid=lr(),this.name="",this.type="Material",this.blending=vc,this.side=pr,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=zx,this.blendDst=Gx,this.blendEquation=Ps,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new rt(0,0,0),this.blendAlpha=0,this.depthFunc=lc,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=r1,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Hp,this.stencilZFail=Hp,this.stencilZPass=Hp,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Le(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];if(r===void 0){Le(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector2&&i&&i.isVector2||r&&r.isEuler&&i&&i.isEuler||r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(o=>o.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(o){let s=[];for(let a in o){let c=o[a];delete c.metadata,s.push(c)}return s}if(t){let o=r(e.textures),s=r(e.images);o.length>0&&(i.textures=o),s.length>0&&(i.images=s)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new rt().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new ki().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new ye().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ye().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let r=t.length;i=new Array(r);for(let o=0;o!==r;++o)i[o]=t[o].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Hr=new R,xx=new R,wp=new R,Cp=new R,nm=class{constructor(e=new R,t=new R(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Hr)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Hr.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Hr.copy(this.origin).addScaledVector(this.direction,t),Hr.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){xx.copy(e).add(t).multiplyScalar(.5),wp.copy(t).sub(e).normalize(),Cp.copy(this.origin).sub(xx);let o=e.distanceTo(t)*.5,s=-this.direction.dot(wp),a=Cp.dot(this.direction),c=-Cp.dot(wp),l=Cp.lengthSq(),u=Math.abs(1-s*s),d,f,h,g;if(u>0)if(d=s*c-a,f=s*a-c,g=o*u,d>=0)if(f>=-g)if(f<=g){let y=1/u;d*=y,f*=y,h=d*(d+s*f+2*a)+f*(s*d+f+2*c)+l}else f=o,d=Math.max(0,-(s*f+a)),h=-d*d+f*(f+2*c)+l;else f=-o,d=Math.max(0,-(s*f+a)),h=-d*d+f*(f+2*c)+l;else f<=-g?(d=Math.max(0,-(-s*o+a)),f=d>0?-o:Math.min(Math.max(-o,-c),o),h=-d*d+f*(f+2*c)+l):f<=g?(d=0,f=Math.min(Math.max(-o,-c),o),h=f*(f+2*c)+l):(d=Math.max(0,-(s*o+a)),f=d>0?o:Math.min(Math.max(-o,-c),o),h=-d*d+f*(f+2*c)+l);else f=s>0?-o:o,d=Math.max(0,-(s*f+a)),h=-d*d+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,d),r&&r.copy(xx).addScaledVector(wp,f),h}intersectSphere(e,t){if(e.radius<0)return null;Hr.subVectors(e.center,this.origin);let i=Hr.dot(this.direction),r=Hr.dot(Hr)-i*i,o=e.radius*e.radius;if(r>o)return null;let s=Math.sqrt(o-r),a=i-s,c=i+s;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,o,s,a,c,l=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,f=this.origin;return l>=0?(i=(e.min.x-f.x)*l,r=(e.max.x-f.x)*l):(i=(e.max.x-f.x)*l,r=(e.min.x-f.x)*l),u>=0?(o=(e.min.y-f.y)*u,s=(e.max.y-f.y)*u):(o=(e.max.y-f.y)*u,s=(e.min.y-f.y)*u),i>s||o>r||((o>i||isNaN(i))&&(i=o),(s<r||isNaN(r))&&(r=s),d>=0?(a=(e.min.z-f.z)*d,c=(e.max.z-f.z)*d):(a=(e.max.z-f.z)*d,c=(e.min.z-f.z)*d),i>c||a>r)||((a>i||i!==i)&&(i=a),(c<r||r!==r)&&(r=c),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,Hr)!==null}intersectTriangle(e,t,i,r,o){let s=this.origin,a=this.direction,c=a.x,l=a.y,u=a.z,d=e.x-s.x,f=e.y-s.y,h=e.z-s.z,g=t.x-s.x,y=t.y-s.y,p=t.z-s.z,m=i.x-s.x,x=i.y-s.y,E=i.z-s.z,_=Math.abs(c),M=Math.abs(l),w=Math.abs(u),D,b,C,A,N,I,k,P,B,X,V,te;if(_>=M&&_>=w?(C=c,I=d,B=g,te=m,c>=0?(D=l,b=u,A=f,N=h,k=y,P=p,X=x,V=E):(D=u,b=l,A=h,N=f,k=p,P=y,X=E,V=x)):M>=w?(C=l,I=f,B=y,te=x,l>=0?(D=u,b=c,A=h,N=d,k=p,P=g,X=E,V=m):(D=c,b=u,A=d,N=h,k=g,P=p,X=m,V=E)):(C=u,I=h,B=p,te=E,u>=0?(D=c,b=l,A=d,N=f,k=g,P=y,X=m,V=x):(D=l,b=c,A=f,N=d,k=y,P=g,X=x,V=m)),C===0)return null;let j=D/C,q=b/C,J=1/C,he=A-j*I,we=N-q*I,dt=k-j*B,Ke=P-q*B,et=X-j*te,$=V-q*te,Q=et*Ke-$*dt,ve=he*$-we*et,ke=dt*we-Ke*he;if(r){if(Q<0||ve<0||ke<0)return null}else if((Q<0||ve<0||ke<0)&&(Q>0||ve>0||ke>0))return null;let ge=Q+ve+ke;if(ge===0)return null;let Xe=J*(Q*I+ve*B+ke*te);return(ge>0?Xe<0:Xe>0)?null:this.at(Xe/ge,o)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qt=class extends Is{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new rt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Eu,this.combine=jx,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},gI=new Nt,Ts=new nm,Tp=new hr,yI=new R,Dp=new R,Ap=new R,Ip=new R,bx=new R,Rp=new R,vI=new R,Np=new R,mt=class extends jr{constructor(e=new Vn,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let o=0,s=r.length;o<s;o++){let a=r[o].name||String(o);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=o}}}}getVertexPosition(e,t){let i=this.geometry,r=i.attributes.position,o=i.morphAttributes.position,s=i.morphTargetsRelative;t.fromBufferAttribute(r,e);let a=this.morphTargetInfluences;if(o&&a){Rp.set(0,0,0);for(let c=0,l=o.length;c<l;c++){let u=a[c],d=o[c];u!==0&&(bx.fromBufferAttribute(d,e),s?Rp.addScaledVector(bx,u):Rp.addScaledVector(bx.sub(t),u))}t.add(Rp)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,r=this.material,o=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Tp.copy(i.boundingSphere),Tp.applyMatrix4(o),Ts.copy(e.ray).recast(e.near),!(Tp.containsPoint(Ts.origin)===!1&&(Ts.intersectSphere(Tp,yI)===null||Ts.origin.distanceToSquared(yI)>(e.far-e.near)**2))&&(gI.copy(o).invert(),Ts.copy(e.ray).applyMatrix4(gI),!(i.boundingBox!==null&&Ts.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ts)))}_computeIntersections(e,t,i){let r,o=this.geometry,s=this.material,a=o.index,c=o.attributes.position,l=o.attributes.uv,u=o.attributes.uv1,d=o.attributes.normal,f=o.groups,h=o.drawRange;if(a!==null)if(Array.isArray(s))for(let g=0,y=f.length;g<y;g++){let p=f[g],m=s[p.materialIndex],x=Math.max(p.start,h.start),E=Math.min(a.count,Math.min(p.start+p.count,h.start+h.count));for(let _=x,M=E;_<M;_+=3){let w=a.getX(_),D=a.getX(_+1),b=a.getX(_+2);r=Pp(this,m,e,i,l,u,d,w,D,b),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,h.start),y=Math.min(a.count,h.start+h.count);for(let p=g,m=y;p<m;p+=3){let x=a.getX(p),E=a.getX(p+1),_=a.getX(p+2);r=Pp(this,s,e,i,l,u,d,x,E,_),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}else if(c!==void 0)if(Array.isArray(s))for(let g=0,y=f.length;g<y;g++){let p=f[g],m=s[p.materialIndex],x=Math.max(p.start,h.start),E=Math.min(c.count,Math.min(p.start+p.count,h.start+h.count));for(let _=x,M=E;_<M;_+=3){let w=_,D=_+1,b=_+2;r=Pp(this,m,e,i,l,u,d,w,D,b),r&&(r.faceIndex=Math.floor(_/3),r.face.materialIndex=p.materialIndex,t.push(r))}}else{let g=Math.max(0,h.start),y=Math.min(c.count,h.start+h.count);for(let p=g,m=y;p<m;p+=3){let x=p,E=p+1,_=p+2;r=Pp(this,s,e,i,l,u,d,x,E,_),r&&(r.faceIndex=Math.floor(p/3),t.push(r))}}}};function WV(n,e,t,i,r,o,s,a){let c;if(e.side===zn?c=i.intersectTriangle(s,o,r,!0,a):c=i.intersectTriangle(r,o,s,e.side===pr,a),c===null)return null;Np.copy(a),Np.applyMatrix4(n.matrixWorld);let l=t.ray.origin.distanceTo(Np);return l<t.near||l>t.far?null:{distance:l,point:Np.clone(),object:n}}function Pp(n,e,t,i,r,o,s,a,c,l){n.getVertexPosition(a,Dp),n.getVertexPosition(c,Ap),n.getVertexPosition(l,Ip);let u=WV(n,e,t,i,Dp,Ap,Ip,vI);if(u){let d=new R;Do.getBarycoord(vI,Dp,Ap,Ip,d),r&&(u.uv=Do.getInterpolatedAttribute(r,a,c,l,d,new ye)),o&&(u.uv1=Do.getInterpolatedAttribute(o,a,c,l,d,new ye)),s&&(u.normal=Do.getInterpolatedAttribute(s,a,c,l,d,new R),u.normal.dot(i.direction)>0&&u.normal.multiplyScalar(-1));let f={a,b:c,c:l,normal:new R,materialIndex:0};Do.getNormal(Dp,Ap,Ip,f.normal),u.face=f,u.barycoord=d}return u}var im=class extends bi{constructor(e=null,t=1,i=1,r,o,s,a,c,l=$t,u=$t,d,f){super(null,s,a,c,l,u,r,o,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ds=new hr,$V=new ye(.5,.5),Fp=new R,Du=class{constructor(e=new ki,t=new ki,i=new ki,r=new ki,o=new ki,s=new ki){this.planes=[e,t,i,r,o,s]}set(e,t,i,r,o,s){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(o),a[5].copy(s),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Bi,i=!1){let r=this.planes,o=e.elements,s=o[0],a=o[1],c=o[2],l=o[3],u=o[4],d=o[5],f=o[6],h=o[7],g=o[8],y=o[9],p=o[10],m=o[11],x=o[12],E=o[13],_=o[14],M=o[15];if(r[0].setComponents(l-s,h-u,m-g,M-x).normalize(),r[1].setComponents(l+s,h+u,m+g,M+x).normalize(),r[2].setComponents(l+a,h+d,m+y,M+E).normalize(),r[3].setComponents(l-a,h-d,m-y,M-E).normalize(),i)r[4].setComponents(c,f,p,_).normalize(),r[5].setComponents(l-c,h-f,m-p,M-_).normalize();else if(r[4].setComponents(l-c,h-f,m-p,M-_).normalize(),t===Bi)r[5].setComponents(l+c,h+f,m+p,M+_).normalize();else if(t===xu)r[5].setComponents(c,f,p,_).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ds.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ds.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ds)}intersectsSprite(e){Ds.center.set(0,0,0);let t=$V.distanceTo(e.center);return Ds.radius=.7071067811865476+t,Ds.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ds)}intersectsSphere(e){let t=this.planes,i=e.center,r=-e.radius;for(let o=0;o<6;o++)if(t[o].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let r=t[i];if(Fp.x=r.normal.x>0?e.max.x:e.min.x,Fp.y=r.normal.y>0?e.max.y:e.min.y,Fp.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Fp)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Au=class extends bi{constructor(e=[],t=Oo,i,r,o,s,a,c,l,u){super(e,t,i,r,o,s,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Iu=class extends bi{constructor(e,t,i,r,o,s,a,c,l){super(e,t,i,r,o,s,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Ao=class extends bi{constructor(e,t,i=zi,r,o,s,a=$t,c=$t,l,u=ur,d=1){if(u!==ur&&u!==ko)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:d};super(f,r,o,s,a,c,u,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new fc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},rm=class extends Ao{constructor(e,t=zi,i=Oo,r,o,s=$t,a=$t,c,l=ur){let u={width:e,height:e,depth:1},d=[u,u,u,u,u,u];super(e,e,t,i,r,o,s,a,c,l),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ru=class extends bi{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},pc=class n extends Vn{constructor(e=1,t=1,i=1,r=1,o=1,s=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:o,depthSegments:s};let a=this;r=Math.floor(r),o=Math.floor(o),s=Math.floor(s);let c=[],l=[],u=[],d=[],f=0,h=0;g("z","y","x",-1,-1,i,t,e,s,o,0),g("z","y","x",1,-1,i,t,-e,s,o,1),g("x","z","y",1,1,e,i,t,r,s,2),g("x","z","y",1,-1,e,i,-t,r,s,3),g("x","y","z",1,-1,e,t,i,r,o,4),g("x","y","z",-1,-1,e,t,-i,r,o,5),this.setIndex(c),this.setAttribute("position",new It(l,3)),this.setAttribute("normal",new It(u,3)),this.setAttribute("uv",new It(d,2));function g(y,p,m,x,E,_,M,w,D,b,C){let A=_/D,N=M/b,I=_/2,k=M/2,P=w/2,B=D+1,X=b+1,V=0,te=0,j=new R;for(let q=0;q<X;q++){let J=q*N-k;for(let he=0;he<B;he++){let we=he*A-I;j[y]=we*x,j[p]=J*E,j[m]=P,l.push(j.x,j.y,j.z),j[y]=0,j[p]=0,j[m]=w>0?1:-1,u.push(j.x,j.y,j.z),d.push(he/D),d.push(1-q/b),V+=1}}for(let q=0;q<b;q++)for(let J=0;J<D;J++){let he=f+J+B*q,we=f+J+B*(q+1),dt=f+(J+1)+B*(q+1),Ke=f+(J+1)+B*q;c.push(he,we,Ke),c.push(we,dt,Ke),te+=6}a.addGroup(h,te,C),h+=te,f+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Nu=class n extends Vn{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);let o=[],s=[],a=[],c=[],l=new R,u=new ye;s.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let d=0,f=3;d<=t;d++,f+=3){let h=i+d/t*r;l.x=e*Math.cos(h),l.y=e*Math.sin(h),s.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(s[f]/e+1)/2,u.y=(s[f+1]/e+1)/2,c.push(u.x,u.y)}for(let d=1;d<=t;d++)o.push(d,d+1,0);this.setIndex(o),this.setAttribute("position",new It(s,3)),this.setAttribute("normal",new It(a,3)),this.setAttribute("uv",new It(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}};var si=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Le("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,r=this.getPoint(0),o=0;t.push(0);for(let s=1;s<=e;s++)i=this.getPoint(s/e),o+=i.distanceTo(r),t.push(o),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),r=0,o=i.length,s;t?s=t:s=e*i[o-1];let a=0,c=o-1,l;for(;a<=c;)if(r=Math.floor(a+(c-a)/2),l=i[r]-s,l<0)a=r+1;else if(l>0)c=r-1;else{c=r;break}if(r=c,i[r]===s)return r/(o-1);let u=i[r],f=i[r+1]-u,h=(s-u)/f;return(r+h)/(o-1)}getTangent(e,t){let r=e-1e-4,o=e+1e-4;r<0&&(r=0),o>1&&(o=1);let s=this.getPoint(r),a=this.getPoint(o),c=t||(s.isVector2?new ye:new R);return c.copy(a).sub(s).normalize(),c}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new R,r=[],o=[],s=[],a=new R,c=new Nt;for(let h=0;h<=e;h++){let g=h/e;r[h]=this.getTangentAt(g,new R)}o[0]=new R,s[0]=new R;let l=Number.MAX_VALUE,u=Math.abs(r[0].x),d=Math.abs(r[0].y),f=Math.abs(r[0].z);u<=l&&(l=u,i.set(1,0,0)),d<=l&&(l=d,i.set(0,1,0)),f<=l&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),o[0].crossVectors(r[0],a),s[0].crossVectors(r[0],o[0]);for(let h=1;h<=e;h++){if(o[h]=o[h-1].clone(),s[h]=s[h-1].clone(),a.crossVectors(r[h-1],r[h]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(We(r[h-1].dot(r[h]),-1,1));o[h].applyMatrix4(c.makeRotationAxis(a,g))}s[h].crossVectors(r[h],o[h])}if(t===!0){let h=Math.acos(We(o[0].dot(o[e]),-1,1));h/=e,r[0].dot(a.crossVectors(o[0],o[e]))>0&&(h=-h);for(let g=1;g<=e;g++)o[g].applyMatrix4(c.makeRotationAxis(r[g],h*g)),s[g].crossVectors(r[g],o[g])}return{tangents:r,normals:o,binormals:s}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},mc=class extends si{constructor(e=0,t=0,i=1,r=1,o=0,s=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=o,this.aEndAngle=s,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new ye){let i=t,r=Math.PI*2,o=this.aEndAngle-this.aStartAngle,s=Math.abs(o)<Number.EPSILON;for(;o<0;)o+=r;for(;o>r;)o-=r;o<Number.EPSILON&&(s?o=0:o=r),this.aClockwise===!0&&!s&&(o===r?o=-r:o=o-r);let a=this.aStartAngle+e*o,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let u=Math.cos(this.aRotation),d=Math.sin(this.aRotation),f=c-this.aX,h=l-this.aY;c=f*u-h*d+this.aX,l=f*d+h*u+this.aY}return i.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},om=class extends mc{constructor(e,t,i,r,o,s){super(e,t,i,i,r,o,s),this.isArcCurve=!0,this.type="ArcCurve"}};function ub(){let n=0,e=0,t=0,i=0;function r(o,s,a,c){n=o,e=a,t=-3*o+3*s-2*a-c,i=2*o-2*s+a+c}return{initCatmullRom:function(o,s,a,c,l){r(s,a,l*(a-o),l*(c-s))},initNonuniformCatmullRom:function(o,s,a,c,l,u,d){let f=(s-o)/l-(a-o)/(l+u)+(a-s)/u,h=(a-s)/u-(c-s)/(u+d)+(c-a)/d;f*=u,h*=u,r(s,a,f,h)},calc:function(o){let s=o*o,a=s*o;return n+e*o+t*s+i*a}}}var _I=new R,xI=new R,Sx=new ub,Mx=new ub,Ex=new ub,sm=class extends si{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new R){let i=t,r=this.points,o=r.length,s=(o-(this.closed?0:1))*e,a=Math.floor(s),c=s-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/o)+1)*o:c===0&&a===o-1&&(a=o-2,c=1);let l,u;this.closed||a>0?l=r[(a-1)%o]:(xI.subVectors(r[0],r[1]).add(r[0]),l=xI);let d=r[a%o],f=r[(a+1)%o];if(this.closed||a+2<o?u=r[(a+2)%o]:(_I.subVectors(r[o-1],r[o-2]).add(r[o-1]),u=_I),this.curveType==="centripetal"||this.curveType==="chordal"){let h=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(d),h),y=Math.pow(d.distanceToSquared(f),h),p=Math.pow(f.distanceToSquared(u),h);y<1e-4&&(y=1),g<1e-4&&(g=y),p<1e-4&&(p=y),Sx.initNonuniformCatmullRom(l.x,d.x,f.x,u.x,g,y,p),Mx.initNonuniformCatmullRom(l.y,d.y,f.y,u.y,g,y,p),Ex.initNonuniformCatmullRom(l.z,d.z,f.z,u.z,g,y,p)}else this.curveType==="catmullrom"&&(Sx.initCatmullRom(l.x,d.x,f.x,u.x,this.tension),Mx.initCatmullRom(l.y,d.y,f.y,u.y,this.tension),Ex.initCatmullRom(l.z,d.z,f.z,u.z,this.tension));return i.set(Sx.calc(c),Mx.calc(c),Ex.calc(c)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new R().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function bI(n,e,t,i,r){let o=(i-e)*.5,s=(r-t)*.5,a=n*n,c=n*a;return(2*t-2*i+o+s)*c+(-3*t+3*i-2*o-s)*a+o*n+t}function qV(n,e){let t=1-n;return t*t*e}function XV(n,e){return 2*(1-n)*n*e}function YV(n,e){return n*n*e}function mu(n,e,t,i){return qV(n,e)+XV(n,t)+YV(n,i)}function ZV(n,e){let t=1-n;return t*t*t*e}function JV(n,e){let t=1-n;return 3*t*t*n*e}function KV(n,e){return 3*(1-n)*n*n*e}function QV(n,e){return n*n*n*e}function gu(n,e,t,i,r){return ZV(n,e)+JV(n,t)+KV(n,i)+QV(n,r)}var Pu=class extends si{constructor(e=new ye,t=new ye,i=new ye,r=new ye){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new ye){let i=t,r=this.v0,o=this.v1,s=this.v2,a=this.v3;return i.set(gu(e,r.x,o.x,s.x,a.x),gu(e,r.y,o.y,s.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},am=class extends si{constructor(e=new R,t=new R,i=new R,r=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new R){let i=t,r=this.v0,o=this.v1,s=this.v2,a=this.v3;return i.set(gu(e,r.x,o.x,s.x,a.x),gu(e,r.y,o.y,s.y,a.y),gu(e,r.z,o.z,s.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Fu=class extends si{constructor(e=new ye,t=new ye){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ye){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ye){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},cm=class extends si{constructor(e=new R,t=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new R){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new R){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ou=class extends si{constructor(e=new ye,t=new ye,i=new ye){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ye){let i=t,r=this.v0,o=this.v1,s=this.v2;return i.set(mu(e,r.x,o.x,s.x),mu(e,r.y,o.y,s.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},lm=class extends si{constructor(e=new R,t=new R,i=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new R){let i=t,r=this.v0,o=this.v1,s=this.v2;return i.set(mu(e,r.x,o.x,s.x),mu(e,r.y,o.y,s.y),mu(e,r.z,o.z,s.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Lu=class extends si{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ye){let i=t,r=this.points,o=(r.length-1)*e,s=Math.floor(o),a=o-s,c=r[s===0?s:s-1],l=r[s],u=r[s>r.length-2?r.length-1:s+1],d=r[s>r.length-3?r.length-1:s+2];return i.set(bI(a,c.x,l.x,u.x,d.x),bI(a,c.y,l.y,u.y,d.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let r=e.points[t];this.points.push(new ye().fromArray(r))}return this}},SI=Object.freeze({__proto__:null,ArcCurve:om,CatmullRomCurve3:sm,CubicBezierCurve:Pu,CubicBezierCurve3:am,EllipseCurve:mc,LineCurve:Fu,LineCurve3:cm,QuadraticBezierCurve:Ou,QuadraticBezierCurve3:lm,SplineCurve:Lu}),um=class extends si{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new SI[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),r=this.getCurveLengths(),o=0;for(;o<r.length;){if(r[o]>=i){let s=r[o]-i,a=this.curves[o],c=a.getLength(),l=c===0?0:1-s/c;return a.getPointAt(l,t)}o++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let r=0,o=this.curves;r<o.length;r++){let s=o[r],a=s.isEllipseCurve?e*2:s.isLineCurve||s.isLineCurve3?1:s.isSplineCurve?e*s.points.length:e,c=s.getPoints(a);for(let l=0;l<c.length;l++){let u=c[l];i&&i.equals(u)||(t.push(u),i=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let r=e.curves[t];this.curves.push(new SI[r.type]().fromJSON(r))}return this}},ku=class extends um{constructor(e){super(),this.type="Path",this.currentPoint=new ye,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new Fu(this.currentPoint.clone(),new ye(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){let o=new Ou(this.currentPoint.clone(),new ye(e,t),new ye(i,r));return this.curves.push(o),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,o,s){let a=new Pu(this.currentPoint.clone(),new ye(e,t),new ye(i,r),new ye(o,s));return this.curves.push(a),this.currentPoint.set(o,s),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new Lu(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,o,s){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,i,r,o,s),this}absarc(e,t,i,r,o,s){return this.absellipse(e,t,i,i,r,o,s),this}ellipse(e,t,i,r,o,s,a,c){let l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,i,r,o,s,a,c),this}absellipse(e,t,i,r,o,s,a,c){let l=new mc(e,t,i,r,o,s,a,c);if(this.curves.length>0){let d=l.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(l);let u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Io=class extends ku{constructor(e){super(e),this.uuid=lr(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let r=e.holes[t];this.holes.push(new ku().fromJSON(r))}return this}};function eH(n,e,t=2){let i=e&&e.length,r=i?e[0]*t:n.length,o=g1(n,0,r,t,!0),s=[];if(!o||o.next===o.prev)return s;let a,c,l;if(i&&(o=oH(n,e,o,t)),n.length>80*t){a=n[0],c=n[1];let u=a,d=c;for(let f=t;f<r;f+=t){let h=n[f],g=n[f+1];h<a&&(a=h),g<c&&(c=g),h>u&&(u=h),g>d&&(d=g)}l=Math.max(u-a,d-c),l=l!==0?32767/l:0}return Uu(o,s,t,a,c,l,0),s}function g1(n,e,t,i,r){let o;if(r===gH(n,e,t,i)>0)for(let s=e;s<t;s+=i)o=MI(s/i|0,n[s],n[s+1],o);else for(let s=t-i;s>=e;s-=i)o=MI(s/i|0,n[s],n[s+1],o);return o&&gc(o,o.next)&&(Vu(o),o=o.next),o}function Rs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(gc(t,t.next)||Lt(t.prev,t,t.next)===0)){if(Vu(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Uu(n,e,t,i,r,o,s){if(!n)return;!s&&o&&uH(n,i,r,o);let a=n;for(;n.prev!==n.next;){let c=n.prev,l=n.next;if(o?nH(n,i,r,o):tH(n)){e.push(c.i,n.i,l.i),Vu(n),n=l.next,a=l.next;continue}if(n=l,n===a){s?s===1?(n=iH(Rs(n),e),Uu(n,e,t,i,r,o,2)):s===2&&rH(n,e,t,i,r,o):Uu(Rs(n),e,t,i,r,o,1);break}}}function tH(n){let e=n.prev,t=n,i=n.next;if(Lt(e,t,i)>=0)return!1;let r=e.x,o=t.x,s=i.x,a=e.y,c=t.y,l=i.y,u=Math.min(r,o,s),d=Math.min(a,c,l),f=Math.max(r,o,s),h=Math.max(a,c,l),g=i.next;for(;g!==e;){if(g.x>=u&&g.x<=f&&g.y>=d&&g.y<=h&&fu(r,a,o,c,s,l,g.x,g.y)&&Lt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function nH(n,e,t,i){let r=n.prev,o=n,s=n.next;if(Lt(r,o,s)>=0)return!1;let a=r.x,c=o.x,l=s.x,u=r.y,d=o.y,f=s.y,h=Math.min(a,c,l),g=Math.min(u,d,f),y=Math.max(a,c,l),p=Math.max(u,d,f),m=Px(h,g,e,t,i),x=Px(y,p,e,t,i),E=n.prevZ,_=n.nextZ;for(;E&&E.z>=m&&_&&_.z<=x;){if(E.x>=h&&E.x<=y&&E.y>=g&&E.y<=p&&E!==r&&E!==s&&fu(a,u,c,d,l,f,E.x,E.y)&&Lt(E.prev,E,E.next)>=0||(E=E.prevZ,_.x>=h&&_.x<=y&&_.y>=g&&_.y<=p&&_!==r&&_!==s&&fu(a,u,c,d,l,f,_.x,_.y)&&Lt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;E&&E.z>=m;){if(E.x>=h&&E.x<=y&&E.y>=g&&E.y<=p&&E!==r&&E!==s&&fu(a,u,c,d,l,f,E.x,E.y)&&Lt(E.prev,E,E.next)>=0)return!1;E=E.prevZ}for(;_&&_.z<=x;){if(_.x>=h&&_.x<=y&&_.y>=g&&_.y<=p&&_!==r&&_!==s&&fu(a,u,c,d,l,f,_.x,_.y)&&Lt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function iH(n,e){let t=n;do{let i=t.prev,r=t.next.next;!gc(i,r)&&v1(i,t,t.next,r)&&Bu(i,r)&&Bu(r,i)&&(e.push(i.i,t.i,r.i),Vu(t),Vu(t.next),t=n=r),t=t.next}while(t!==n);return Rs(t)}function rH(n,e,t,i,r,o){let s=n;do{let a=s.next.next;for(;a!==s.prev;){if(s.i!==a.i&&hH(s,a)){let c=_1(s,a);s=Rs(s,s.next),c=Rs(c,c.next),Uu(s,e,t,i,r,o,0),Uu(c,e,t,i,r,o,0);return}a=a.next}s=s.next}while(s!==n)}function oH(n,e,t,i){let r=[];for(let o=0,s=e.length;o<s;o++){let a=e[o]*i,c=o<s-1?e[o+1]*i:n.length,l=g1(n,a,c,i,!1);l===l.next&&(l.steiner=!0),r.push(fH(l))}r.sort(sH);for(let o=0;o<r.length;o++)t=aH(r[o],t);return t}function sH(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),r=(e.next.y-e.y)/(e.next.x-e.x);t=i-r}return t}function aH(n,e){let t=cH(n,e);if(!t)return e;let i=_1(t,n);return Rs(i,i.next),Rs(t,t.next)}function cH(n,e){let t=e,i=n.x,r=n.y,o=-1/0,s;if(gc(n,t))return t;do{if(gc(n,t.next))return t.next;if(r<=t.y&&r>=t.next.y&&t.next.y!==t.y){let d=t.x+(r-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(d<=i&&d>o&&(o=d,s=t.x<t.next.x?t:t.next,d===i))return s}t=t.next}while(t!==e);if(!s)return null;let a=s,c=s.x,l=s.y,u=1/0;t=s;do{if(i>=t.x&&t.x>=c&&i!==t.x&&y1(r<l?i:o,r,c,l,r<l?o:i,r,t.x,t.y)){let d=Math.abs(r-t.y)/(i-t.x);Bu(t,n)&&(d<u||d===u&&(t.x>s.x||t.x===s.x&&lH(s,t)))&&(s=t,u=d)}t=t.next}while(t!==a);return s}function lH(n,e){return Lt(n.prev,n,e.prev)<0&&Lt(e.next,n,n.next)<0}function uH(n,e,t,i){let r=n;do r.z===0&&(r.z=Px(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,dH(r)}function dH(n){let e,t=1;do{let i=n,r;n=null;let o=null;for(e=0;i;){e++;let s=i,a=0;for(let l=0;l<t&&(a++,s=s.nextZ,!!s);l++);let c=t;for(;a>0||c>0&&s;)a!==0&&(c===0||!s||i.z<=s.z)?(r=i,i=i.nextZ,a--):(r=s,s=s.nextZ,c--),o?o.nextZ=r:n=r,r.prevZ=o,o=r;i=s}o.nextZ=null,t*=2}while(e>1);return n}function Px(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function fH(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function y1(n,e,t,i,r,o,s,a){return(r-s)*(e-a)>=(n-s)*(o-a)&&(n-s)*(i-a)>=(t-s)*(e-a)&&(t-s)*(o-a)>=(r-s)*(i-a)}function fu(n,e,t,i,r,o,s,a){return!(n===s&&e===a)&&y1(n,e,t,i,r,o,s,a)}function hH(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!pH(n,e)&&(Bu(n,e)&&Bu(e,n)&&mH(n,e)&&(Lt(n.prev,n,e.prev)||Lt(n,e.prev,e))||gc(n,e)&&Lt(n.prev,n,n.next)>0&&Lt(e.prev,e,e.next)>0)}function Lt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function gc(n,e){return n.x===e.x&&n.y===e.y}function v1(n,e,t,i){let r=Lp(Lt(n,e,t)),o=Lp(Lt(n,e,i)),s=Lp(Lt(t,i,n)),a=Lp(Lt(t,i,e));return!!(r!==o&&s!==a||r===0&&Op(n,t,e)||o===0&&Op(n,i,e)||s===0&&Op(t,n,i)||a===0&&Op(t,e,i))}function Op(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Lp(n){return n>0?1:n<0?-1:0}function pH(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&v1(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Bu(n,e){return Lt(n.prev,n,n.next)<0?Lt(n,e,n.next)>=0&&Lt(n,n.prev,e)>=0:Lt(n,e,n.prev)<0||Lt(n,n.next,e)<0}function mH(n,e){let t=n,i=!1,r=(n.x+e.x)/2,o=(n.y+e.y)/2;do t.y>o!=t.next.y>o&&t.next.y!==t.y&&r<(t.next.x-t.x)*(o-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function _1(n,e){let t=Fx(n.i,n.x,n.y),i=Fx(e.i,e.x,e.y),r=n.next,o=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,o.next=i,i.prev=o,i}function MI(n,e,t,i){let r=Fx(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function Vu(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Fx(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function gH(n,e,t,i){let r=0;for(let o=e,s=t-i;o<t;o+=i)r+=(n[s]-n[o])*(n[o+1]+n[s+1]),s=o;return r}var Ox=class{static triangulate(e,t,i=2){return eH(e,t,i)}},cc=class n{static area(e){let t=e.length,i=0;for(let r=t-1,o=0;o<t;r=o++)i+=e[r].x*e[o].y-e[o].x*e[r].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],r=[],o=[];EI(e),wI(i,e);let s=e.length;t.forEach(EI);for(let c=0;c<t.length;c++)r.push(s),s+=t[c].length,wI(i,t[c]);let a=Ox.triangulate(i,r);for(let c=0;c<a.length;c+=3)o.push(a.slice(c,c+3));return o}};function EI(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function wI(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var _i=class n extends Vn{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};let o=e/2,s=t/2,a=Math.floor(i),c=Math.floor(r),l=a+1,u=c+1,d=e/a,f=t/c,h=[],g=[],y=[],p=[];for(let m=0;m<u;m++){let x=m*f-s;for(let E=0;E<l;E++){let _=E*d-o;g.push(_,-x,0),y.push(0,0,1),p.push(E/a),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let x=0;x<a;x++){let E=x+l*m,_=x+l*(m+1),M=x+1+l*(m+1),w=x+1+l*m;h.push(E,_,w),h.push(_,M,w)}this.setIndex(h),this.setAttribute("position",new It(g,3)),this.setAttribute("normal",new It(y,3)),this.setAttribute("uv",new It(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Hu=class n extends Vn{constructor(e=.5,t=1,i=32,r=1,o=0,s=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:o,thetaLength:s},i=Math.max(3,i),r=Math.max(1,r);let a=[],c=[],l=[],u=[],d=e,f=(t-e)/r,h=new R,g=new ye;for(let y=0;y<=r;y++){for(let p=0;p<=i;p++){let m=o+p/i*s;h.x=d*Math.cos(m),h.y=d*Math.sin(m),c.push(h.x,h.y,h.z),l.push(0,0,1),g.x=(h.x/t+1)/2,g.y=(h.y/t+1)/2,u.push(g.x,g.y)}d+=f}for(let y=0;y<r;y++){let p=y*(i+1);for(let m=0;m<i;m++){let x=m+p,E=x,_=x+i+1,M=x+i+2,w=x+1;a.push(E,_,w),a.push(_,M,w)}}this.setIndex(a),this.setAttribute("position",new It(c,3)),this.setAttribute("normal",new It(l,3)),this.setAttribute("uv",new It(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}},Ns=class n extends Vn{constructor(e=new Io([new ye(0,.5),new ye(-.5,-.5),new ye(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let i=[],r=[],o=[],s=[],a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(i),this.setAttribute("position",new It(r,3)),this.setAttribute("normal",new It(o,3)),this.setAttribute("uv",new It(s,2));function l(u){let d=r.length/3,f=u.extractPoints(t),h=f.shape,g=f.holes;cc.isClockWise(h)===!1&&(h=h.reverse());for(let p=0,m=g.length;p<m;p++){let x=g[p];cc.isClockWise(x)===!0&&(g[p]=x.reverse())}let y=cc.triangulateShape(h,g);for(let p=0,m=g.length;p<m;p++){let x=g[p];h=h.concat(x)}for(let p=0,m=h.length;p<m;p++){let x=h[p];r.push(x.x,x.y,0),o.push(0,0,1),s.push(x.x,x.y)}for(let p=0,m=y.length;p<m;p++){let x=y[p],E=x[0]+d,_=x[1]+d,M=x[2]+d;i.push(E,_,M),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return yH(t,e)}static fromJSON(e,t){let i=[];for(let r=0,o=e.shapes.length;r<o;r++){let s=t[e.shapes[r]];i.push(s)}return new n(i,e.curveSegments)}};function yH(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){let r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}var zu=class extends Vn{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,r=new R,o=new R;if(e.index!==null){let s=e.attributes.position,a=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:a.count,materialIndex:0}]);for(let l=0,u=c.length;l<u;++l){let d=c[l],f=d.start,h=d.count;for(let g=f,y=f+h;g<y;g+=3)for(let p=0;p<3;p++){let m=a.getX(g+p),x=a.getX(g+(p+1)%3);r.fromBufferAttribute(s,m),o.fromBufferAttribute(s,x),CI(r,o,i)===!0&&(t.push(r.x,r.y,r.z),t.push(o.x,o.y,o.z))}}}else{let s=e.attributes.position;for(let a=0,c=s.count/3;a<c;a++)for(let l=0;l<3;l++){let u=3*a+l,d=3*a+(l+1)%3;r.fromBufferAttribute(s,u),o.fromBufferAttribute(s,d),CI(r,o,i)===!0&&(t.push(r.x,r.y,r.z),t.push(o.x,o.y,o.z))}}this.setAttribute("position",new It(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function CI(n,e,t){let i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,r=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(r)===!0?!1:(t.add(i),t.add(r),!0)}function Os(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let r=n[t][i];if(TI(r))r.isRenderTargetTexture?(Le("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone();else if(Array.isArray(r))if(TI(r[0])){let o=[];for(let s=0,a=r.length;s<a;s++)o[s]=r[s].clone();e[t][i]=o}else e[t][i]=r.slice();else e[t][i]=r}}return e}function Tn(n){let e={};for(let t=0;t<n.length;t++){let i=Os(n[t]);for(let r in i)e[r]=i[r]}return e}function TI(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function vH(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function db(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:it.workingColorSpace}var id={clone:Os,merge:Tn},_H=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xH=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Hn=class extends Is{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=_H,this.fragmentShader=xH,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Os(e.uniforms),this.uniformsGroups=vH(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let r in this.uniforms){let s=this.uniforms[r].value;s&&s.isTexture?t.uniforms[r]={type:"t",value:s.toJSON(e).uuid}:s&&s.isColor?t.uniforms[r]={type:"c",value:s.getHex()}:s&&s.isVector2?t.uniforms[r]={type:"v2",value:s.toArray()}:s&&s.isVector3?t.uniforms[r]={type:"v3",value:s.toArray()}:s&&s.isVector4?t.uniforms[r]={type:"v4",value:s.toArray()}:s&&s.isMatrix3?t.uniforms[r]={type:"m3",value:s.toArray()}:s&&s.isMatrix4?t.uniforms[r]={type:"m4",value:s.toArray()}:t.uniforms[r]={value:s}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let r=e.uniforms[i];switch(this.uniforms[i]={},r.type){case"t":this.uniforms[i].value=t[r.value]||null;break;case"c":this.uniforms[i].value=new rt().setHex(r.value);break;case"v2":this.uniforms[i].value=new ye().fromArray(r.value);break;case"v3":this.uniforms[i].value=new R().fromArray(r.value);break;case"v4":this.uniforms[i].value=new vt().fromArray(r.value);break;case"m3":this.uniforms[i].value=new Ge().fromArray(r.value);break;case"m4":this.uniforms[i].value=new Nt().fromArray(r.value);break;default:this.uniforms[i].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},dm=class extends Hn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var fm=class extends Is{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=n1,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},hm=class extends Is{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function nc(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function wx(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var Ro=class{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,r=t[i],o=t[i-1];e:{t:{let s;n:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<o)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(o=r,r=t[++i],e<r)break t}s=t.length;break n}if(!(e>=o)){let a=t[1];e<a&&(i=2,o=a);for(let c=i-2;;){if(o===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(r=o,o=t[--i-1],e>=o)break t}s=i,i=0;break n}break e}for(;i<s;){let a=i+s>>>1;e<t[a]?s=a:i=a+1}if(r=t[i],o=t[i-1],o===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,o,r)}return this.interpolate_(i,o,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,o=e*r;for(let s=0;s!==r;++s)t[s]=i[o+s];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},pm=class extends Ro{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ax,endingEnd:Ax}}intervalChanged_(e,t,i){let r=this.parameterPositions,o=e-2,s=e+1,a=r[o],c=r[s];if(a===void 0)switch(this.getSettings_().endingStart){case Ix:o=e,a=2*t-i;break;case Rx:o=r.length-2,a=t+r[o]-r[o+1];break;default:o=e,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Ix:s=e,c=2*i-t;break;case Rx:s=1,c=i+r[1]-r[0];break;default:s=e-1,c=t}let l=(i-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-i),this._offsetPrev=o*u,this._offsetNext=s*u}interpolate_(e,t,i,r){let o=this.resultBuffer,s=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,d=this._offsetNext,f=this._weightPrev,h=this._weightNext,g=(i-t)/(r-t),y=g*g,p=y*g,m=-f*p+2*f*y-f*g,x=(1+f)*p+(-1.5-2*f)*y+(-.5+f)*g+1,E=(-1-h)*p+(1.5+h)*y+.5*g,_=h*p-h*y;for(let M=0;M!==a;++M)o[M]=m*s[u+M]+x*s[l+M]+E*s[c+M]+_*s[d+M];return o}},mm=class extends Ro{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let o=this.resultBuffer,s=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(i-t)/(r-t),d=1-u;for(let f=0;f!==a;++f)o[f]=s[l+f]*d+s[c+f]*u;return o}},gm=class extends Ro{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ym=class extends Ro{interpolate_(e,t,i,r){let o=this.resultBuffer,s=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this.inTangents,d=this.outTangents;if(!u||!d){let g=(i-t)/(r-t),y=1-g;for(let p=0;p!==a;++p)o[p]=s[l+p]*y+s[c+p]*g;return o}let f=a*2,h=e-1;for(let g=0;g!==a;++g){let y=s[l+g],p=s[c+g],m=h*f+g*2,x=d[m],E=d[m+1],_=e*f+g*2,M=u[_],w=u[_+1],D=SH(i,t,x,M,r);o[g]=x1(D,y,E,w,p)}return o}};function x1(n,e,t,i,r){let o=1-n;return o*o*o*e+3*o*o*n*t+3*o*n*n*i+n*n*n*r}function bH(n,e,t,i,r){let o=1-n;return 3*o*o*(t-e)+6*o*n*(i-t)+3*n*n*(r-i)}function SH(n,e,t,i,r){let o=(n-e)/(r-e);for(let s=0;s<8;s++){let a=x1(o,e,t,i,r)-n;if(Math.abs(a)<1e-10)break;let c=bH(o,e,t,i,r);if(Math.abs(c)<1e-10)break;o=Math.max(0,Math.min(1,o-a/c))}return o}var ai=class{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=nc(t,this.TimeBufferType),this.values=nc(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:nc(e.times,Array),values:nc(e.values,Array)};let r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r),wx(e.settings)&&(i.settings={inTangents:nc(e.settings.inTangents,Array),outTangents:nc(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new gm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new mm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new pm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ym(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case yu:t=this.InterpolantFactoryMethodDiscrete;break;case Jp:t=this.InterpolantFactoryMethodLinear;break;case Vp:t=this.InterpolantFactoryMethodSmooth;break;case Dx:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Le("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return yu;case this.InterpolantFactoryMethodLinear:return Jp;case this.InterpolantFactoryMethodSmooth:return Vp;case this.InterpolantFactoryMethodBezier:return Dx}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e;wx(this.settings)&&(DI(this.settings.inTangents,e),DI(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,r=i.length,o=0,s=r-1;for(;o!==r&&i[o]<e;)++o;for(;s!==-1&&i[s]>t;)--s;if(++s,o!==0||s!==r){o>=s&&(s=Math.max(s,1),o=s-1);let a=this.getValueSize();this.times=i.slice(o,s),this.values=this.values.slice(o*a,s*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Be("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,r=this.values,o=i.length;o===0&&(Be("KeyframeTrack: Track is empty.",this),e=!1);let s=null;for(let a=0;a!==o;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){Be("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(s!==null&&s>c){Be("KeyframeTrack: Out of order keys.",this,a,c,s),e=!1;break}s=c}if(r!==void 0&&fV(r))for(let a=0,c=r.length;a!==c;++a){let l=r[a];if(isNaN(l)){Be("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===Vp,o=e.length-1,s=1;for(let a=1;a<o;++a){let c=!1,l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(r)c=!0;else{let d=a*i,f=d-i,h=d+i;for(let g=0;g!==i;++g){let y=t[d+g];if(y!==t[f+g]||y!==t[h+g]){c=!0;break}}}if(c){if(a!==s){e[s]=e[a];let d=a*i,f=s*i;for(let h=0;h!==i;++h)t[f+h]=t[d+h]}++s}}if(o>0){e[s]=e[o];for(let a=o*i,c=s*i,l=0;l!==i;++l)t[c+l]=t[a+l];++s}return s!==e.length?(this.times=e.slice(0,s),this.values=t.slice(0,s*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,wx(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function DI(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}ai.prototype.ValueTypeName="";ai.prototype.TimeBufferType=Float32Array;ai.prototype.ValueBufferType=Float32Array;ai.prototype.DefaultInterpolation=Jp;var No=class extends ai{constructor(e,t,i){super(e,t,i)}};No.prototype.ValueTypeName="bool";No.prototype.ValueBufferType=Array;No.prototype.DefaultInterpolation=yu;No.prototype.InterpolantFactoryMethodLinear=void 0;No.prototype.InterpolantFactoryMethodSmooth=void 0;var vm=class extends ai{constructor(e,t,i,r){super(e,t,i,r)}};vm.prototype.ValueTypeName="color";var _m=class extends ai{constructor(e,t,i,r){super(e,t,i,r)}};_m.prototype.ValueTypeName="number";var xm=class extends Ro{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){let o=this.resultBuffer,s=this.sampleValues,a=this.valueSize,c=(i-t)/(r-t),l=e*a;for(let u=l+a;l!==u;l+=4)fr.slerpFlat(o,0,s,l-a,s,l,c);return o}},Gu=class extends ai{constructor(e,t,i,r){super(e,t,i,r)}InterpolantFactoryMethodLinear(e){return new xm(this.times,this.values,this.getValueSize(),e)}};Gu.prototype.ValueTypeName="quaternion";Gu.prototype.InterpolantFactoryMethodSmooth=void 0;var Po=class extends ai{constructor(e,t,i){super(e,t,i)}};Po.prototype.ValueTypeName="string";Po.prototype.ValueBufferType=Array;Po.prototype.DefaultInterpolation=yu;Po.prototype.InterpolantFactoryMethodLinear=void 0;Po.prototype.InterpolantFactoryMethodSmooth=void 0;var bm=class extends ai{constructor(e,t,i,r){super(e,t,i,r)}};bm.prototype.ValueTypeName="vector";var kp=new R,Up=new fr,ar=new R,ju=class extends jr{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Nt,this.projectionMatrix=new Nt,this.projectionMatrixInverse=new Nt,this.coordinateSystem=Bi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(kp,Up,ar),ar.x===1&&ar.y===1&&ar.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(kp,Up,ar.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(kp,Up,ar),ar.x===1&&ar.y===1&&ar.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(kp,Up,ar.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},To=new R,AI=new ye,II=new ye,Zn=class extends ju{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=dc*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(hu*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return dc*2*Math.atan(Math.tan(hu*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){To.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(To.x,To.y).multiplyScalar(-e/To.z),To.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(To.x,To.y).multiplyScalar(-e/To.z)}getViewSize(e,t){return this.getViewBounds(e,AI,II),t.subVectors(II,AI)}setViewOffset(e,t,i,r,o,s){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(hu*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,o=-.5*r,s=this.view;if(this.view!==null&&this.view.enabled){let c=s.fullWidth,l=s.fullHeight;o+=s.offsetX*r/c,t-=s.offsetY*i/l,r*=s.width/c,i*=s.height/l}let a=this.filmOffset;a!==0&&(o+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(o,o+r,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Wu=class extends ju{constructor(e=-1,t=1,i=1,r=-1,o=.1,s=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=o,this.far=s,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,o,s){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=o,this.view.height=s,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2,o=i-e,s=i+e,a=r+t,c=r-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;o+=l*this.view.offsetX,s=o+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(o,s,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var $u=class extends Vn{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}};var ic=-90,rc=1,Sm=class extends jr{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Zn(ic,rc,e,t);r.layers=this.layers,this.add(r);let o=new Zn(ic,rc,e,t);o.layers=this.layers,this.add(o);let s=new Zn(ic,rc,e,t);s.layers=this.layers,this.add(s);let a=new Zn(ic,rc,e,t);a.layers=this.layers,this.add(a);let c=new Zn(ic,rc,e,t);c.layers=this.layers,this.add(c);let l=new Zn(ic,rc,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,r,o,s,a,c]=t;for(let l of t)this.remove(l);if(e===Bi)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),o.up.set(0,0,-1),o.lookAt(0,1,0),s.up.set(0,0,1),s.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===xu)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),o.up.set(0,0,1),o.lookAt(0,1,0),s.up.set(0,0,-1),s.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[o,s,a,c,l,u]=this.children,d=e.getRenderTarget(),f=e.getActiveCubeFace(),h=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;e.isWebGLRenderer===!0?p=e.state.buffers.depth.getReversed():p=e.reversedDepthBuffer,e.setRenderTarget(i,0,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,1,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(i,2,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,3,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(i,4,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,r),p&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(d,f,h),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Mm=class extends Zn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var fb="\\[\\]\\.:\\/",MH=new RegExp("["+fb+"]","g"),hb="[^"+fb+"]",EH="[^"+fb.replace("\\.","")+"]",wH=/((?:WC+[\/:])*)/.source.replace("WC",hb),CH=/(WCOD+)?/.source.replace("WCOD",EH),TH=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",hb),DH=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",hb),AH=new RegExp("^"+wH+CH+TH+DH+"$"),IH=["material","materials","bones","map"],Lx=class{constructor(e,t,i){let r=i||Vt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,o=i.length;r!==o;++r)i[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Vt=(()=>{class n{constructor(t,i,r){this.path=i,this.parsedPath=r||n.parseTrackName(i),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,i,r){return t&&t.isAnimationObjectGroup?new n.Composite(t,i,r):new n(t,i,r)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(MH,"")}static parseTrackName(t){let i=AH.exec(t);if(i===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let r={nodeName:i[2],objectName:i[3],objectIndex:i[4],propertyName:i[5],propertyIndex:i[6]},o=r.nodeName&&r.nodeName.lastIndexOf(".");if(o!==void 0&&o!==-1){let s=r.nodeName.substring(o+1);IH.indexOf(s)!==-1&&(r.nodeName=r.nodeName.substring(0,o),r.objectName=s)}if(r.propertyName===null||r.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return r}static findNode(t,i){if(i===void 0||i===""||i==="."||i===-1||i===t.name||i===t.uuid)return t;if(t.skeleton){let r=t.skeleton.getBoneByName(i);if(r!==void 0)return r}if(t.children){let r=function(s){for(let a=0;a<s.length;a++){let c=s[a];if(c.name===i||c.uuid===i)return c;let l=r(c.children);if(l)return l}return null},o=r(t.children);if(o)return o}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,i){t[i]=this.targetObject[this.propertyName]}_getValue_array(t,i){let r=this.resolvedProperty;for(let o=0,s=r.length;o!==s;++o)t[i++]=r[o]}_getValue_arrayElement(t,i){t[i]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,i){this.resolvedProperty.toArray(t,i)}_setValue_direct(t,i){this.targetObject[this.propertyName]=t[i]}_setValue_direct_setNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,i){this.targetObject[this.propertyName]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,i){let r=this.resolvedProperty;for(let o=0,s=r.length;o!==s;++o)r[o]=t[i++]}_setValue_array_setNeedsUpdate(t,i){let r=this.resolvedProperty;for(let o=0,s=r.length;o!==s;++o)r[o]=t[i++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,i){let r=this.resolvedProperty;for(let o=0,s=r.length;o!==s;++o)r[o]=t[i++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,i){this.resolvedProperty[this.propertyIndex]=t[i]}_setValue_arrayElement_setNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty[this.propertyIndex]=t[i],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,i){this.resolvedProperty.fromArray(t,i)}_setValue_fromArray_setNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,i){this.resolvedProperty.fromArray(t,i),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,i){this.bind(),this.getValue(t,i)}_setValue_unbound(t,i){this.bind(),this.setValue(t,i)}bind(){let t=this.node,i=this.parsedPath,r=i.objectName,o=i.propertyName,s=i.propertyIndex;if(t||(t=n.findNode(this.rootNode,i.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Le("PropertyBinding: No target node found for track: "+this.path+".");return}if(r){let u=i.objectIndex;switch(r){case"materials":if(!t.material){Be("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Be("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Be("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let d=0;d<t.length;d++)if(t[d].name===u){u=d;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Be("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Be("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[r]===void 0){Be("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[r]}if(u!==void 0){if(t[u]===void 0){Be("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[u]}}let a=t[o];if(a===void 0){let u=i.nodeName;Be("PropertyBinding: Trying to update property for track: "+u+"."+o+" but it wasn't found.",t);return}let c=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?c=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(c=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(o==="morphTargetInfluences"){if(!t.geometry){Be("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Be("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=s}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=o;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][c]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}return n.Composite=Lx,n})();Vt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Vt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Vt.prototype.GetterByBindingType=[Vt.prototype._getValue_direct,Vt.prototype._getValue_array,Vt.prototype._getValue_arrayElement,Vt.prototype._getValue_toArray];Vt.prototype.SetterByBindingTypeAndVersioning=[[Vt.prototype._setValue_direct,Vt.prototype._setValue_direct_setNeedsUpdate,Vt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Vt.prototype._setValue_array,Vt.prototype._setValue_array_setNeedsUpdate,Vt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Vt.prototype._setValue_arrayElement,Vt.prototype._setValue_arrayElement_setNeedsUpdate,Vt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Vt.prototype._setValue_fromArray,Vt.prototype._setValue_fromArray_setNeedsUpdate,Vt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Oue=new Float32Array(1);var Fo=class extends tm{constructor(e,t,i=1){super(e,t),this.isInstancedInterleavedBuffer=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}clone(e){let t=super.clone(e);return t.meshPerAttribute=this.meshPerAttribute,t}toJSON(e){let t=super.toJSON(e);return t.isInstancedInterleavedBuffer=!0,t.meshPerAttribute=this.meshPerAttribute,t}};var kx=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,r){let o=this.elements;return o[0]=e,o[2]=t,o[1]=i,o[3]=r,this}};var RI=new R,Bp=new R,oc=new R,sc=new R,Cx=new R,RH=new R,NH=new R,qu=class{constructor(e=new R,t=new R){this.start=e,this.end=t}set(e,t){return this.start.copy(e),this.end.copy(t),this}copy(e){return this.start.copy(e.start),this.end.copy(e.end),this}getCenter(e){return e.addVectors(this.start,this.end).multiplyScalar(.5)}delta(e){return e.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(e,t){return this.delta(t).multiplyScalar(e).add(this.start)}closestPointToPointParameter(e,t){RI.subVectors(e,this.start),Bp.subVectors(this.end,this.start);let i=Bp.dot(Bp);if(i===0)return 0;let o=Bp.dot(RI)/i;return t&&(o=We(o,0,1)),o}closestPointToPoint(e,t,i){let r=this.closestPointToPointParameter(e,t);return this.delta(i).multiplyScalar(r).add(this.start)}distanceSqToLine3(e,t=RH,i=NH){let r=10000000000000001e-32,o,s,a=this.start,c=e.start,l=this.end,u=e.end;oc.subVectors(l,a),sc.subVectors(u,c),Cx.subVectors(a,c);let d=oc.dot(oc),f=sc.dot(sc),h=sc.dot(Cx);if(d<=r&&f<=r)return t.copy(a),i.copy(c),t.sub(i),t.dot(t);if(d<=r)o=0,s=h/f,s=We(s,0,1);else{let g=oc.dot(Cx);if(f<=r)s=0,o=We(-g/d,0,1);else{let y=oc.dot(sc),p=d*f-y*y;p!==0?o=We((y*h-g*f)/p,0,1):o=0,s=(y*o+h)/f,s<0?(s=0,o=We(-g/d,0,1)):s>1&&(s=1,o=We((y-g)/d,0,1))}}return t.copy(a).addScaledVector(oc,o),i.copy(c).addScaledVector(sc,s),t.distanceToSquared(i)}applyMatrix4(e){return this.start.applyMatrix4(e),this.end.applyMatrix4(e),this}equals(e){return e.start.equals(this.start)&&e.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};function pb(n,e,t,i){let r=PH(i);switch(t){case nb:return n*e;case rb:return n*e/r.components*r.byteLength;case Im:return n*e/r.components*r.byteLength;case Uo:return n*e*2/r.components*r.byteLength;case Rm:return n*e*2/r.components*r.byteLength;case ib:return n*e*3/r.components*r.byteLength;case xi:return n*e*4/r.components*r.byteLength;case Nm:return n*e*4/r.components*r.byteLength;case Ju:case Ku:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Qu:case ed:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Fm:case Lm:return Math.max(n,16)*Math.max(e,8)/4;case Pm:case Om:return Math.max(n,8)*Math.max(e,8)/2;case km:case Um:case Vm:case Hm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Bm:case td:case zm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Gm:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case jm:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Wm:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case $m:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case qm:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Xm:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Ym:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Zm:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Jm:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Km:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Qm:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case eg:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case tg:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case ng:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case ig:case rg:case og:return Math.ceil(n/4)*Math.ceil(e/4)*16;case sg:case ag:return Math.ceil(n/4)*Math.ceil(e/4)*8;case nd:case cg:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function PH(n){switch(n){case ci:case Kx:return{byteLength:1,components:1};case _c:case Qx:case ji:return{byteLength:2,components:1};case Dm:case Am:return{byteLength:2,components:4};case zi:case Tm:case Gi:return{byteLength:4,components:1};case eb:case tb:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Le("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function G1(){let n=null,e=!1,t=null,i=null;function r(o,s){i=n.requestAnimationFrame(r),t(o,s)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(o){t=o},setContext:function(o){n=o}}}function OH(n){let e=new WeakMap;function t(a,c){let l=a.array,u=a.usage,d=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,u),a.onUploadCallback();let h;if(l instanceof Float32Array)h=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)h=n.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?h=n.HALF_FLOAT:h=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)h=n.SHORT;else if(l instanceof Uint32Array)h=n.UNSIGNED_INT;else if(l instanceof Int32Array)h=n.INT;else if(l instanceof Int8Array)h=n.BYTE;else if(l instanceof Uint8Array)h=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)h=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:h,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,c,l){let u=c.array,d=c.updateRanges;if(n.bindBuffer(l,a),d.length===0)n.bufferSubData(l,0,u);else{d.sort((h,g)=>h.start-g.start);let f=0;for(let h=1;h<d.length;h++){let g=d[f],y=d[h];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++f,d[f]=y)}d.length=f+1;for(let h=0,g=d.length;h<g;h++){let y=d[h];n.bufferSubData(l,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function o(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(n.deleteBuffer(c.buffer),e.delete(a))}function s(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:r,remove:o,update:s}}var LH=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,kH=`#ifdef USE_ALPHAHASH
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
#endif`,UH=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,BH=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,VH=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,HH=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zH=`#ifdef USE_AOMAP
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
#endif`,GH=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,jH=`#ifdef USE_BATCHING
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
#endif`,WH=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,$H=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,qH=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,XH=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,YH=`#ifdef USE_IRIDESCENCE
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
#endif`,ZH=`#ifdef USE_BUMPMAP
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
#endif`,JH=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,KH=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,QH=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ez=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tz=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,nz=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,iz=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,rz=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,oz=`#define PI 3.141592653589793
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
} // validated`,sz=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,az=`vec3 transformedNormal = objectNormal;
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
#endif`,cz=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,lz=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uz=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,dz=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,fz="gl_FragColor = linearToOutputTexel( gl_FragColor );",hz=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,pz=`#ifdef USE_ENVMAP
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
#endif`,mz=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,gz=`#ifdef USE_ENVMAP
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
#endif`,yz=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vz=`#ifdef USE_ENVMAP
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
#endif`,_z=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xz=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bz=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Sz=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Mz=`#ifdef USE_GRADIENTMAP
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
}`,Ez=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,wz=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cz=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Tz=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Dz=`#ifdef USE_ENVMAP
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
#endif`,Az=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Iz=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Rz=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Nz=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pz=`PhysicalMaterial material;
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
#endif`,Fz=`uniform sampler2D dfgLUT;
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
}`,Oz=`
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
#endif`,Lz=`#if defined( RE_IndirectDiffuse )
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
#endif`,kz=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Uz=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Bz=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vz=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hz=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zz=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Gz=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jz=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Wz=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,$z=`#if defined( USE_POINTS_UV )
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
#endif`,qz=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Xz=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Yz=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zz=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Jz=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Kz=`#ifdef USE_MORPHTARGETS
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
#endif`,Qz=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,eG=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,tG=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,nG=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,iG=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rG=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,oG=`#ifdef USE_NORMALMAP
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
#endif`,sG=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,aG=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,cG=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,lG=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,uG=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,dG=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,fG=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,hG=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pG=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mG=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gG=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yG=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vG=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,_G=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,xG=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,bG=`float getShadowMask() {
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
}`,SG=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,MG=`#ifdef USE_SKINNING
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
#endif`,EG=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,wG=`#ifdef USE_SKINNING
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
#endif`,CG=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,TG=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,DG=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,AG=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,IG=`#ifdef USE_TRANSMISSION
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
#endif`,RG=`#ifdef USE_TRANSMISSION
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
#endif`,NG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,PG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,FG=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,OG=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,LG=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,kG=`uniform sampler2D t2D;
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
}`,UG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,BG=`#ifdef ENVMAP_TYPE_CUBE
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
}`,VG=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,HG=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zG=`#include <common>
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
}`,GG=`#if DEPTH_PACKING == 3200
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
}`,jG=`#define DISTANCE
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
}`,WG=`#define DISTANCE
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
}`,$G=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,qG=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,XG=`uniform float scale;
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
}`,YG=`uniform vec3 diffuse;
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
}`,ZG=`#include <common>
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
}`,JG=`uniform vec3 diffuse;
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
}`,KG=`#define LAMBERT
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
}`,QG=`#define LAMBERT
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
}`,e4=`#define MATCAP
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
}`,t4=`#define MATCAP
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
}`,n4=`#define NORMAL
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
}`,i4=`#define NORMAL
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
}`,r4=`#define PHONG
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
}`,o4=`#define PHONG
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
}`,s4=`#define STANDARD
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
}`,a4=`#define STANDARD
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
}`,c4=`#define TOON
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
}`,l4=`#define TOON
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
}`,u4=`uniform float size;
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
}`,d4=`uniform vec3 diffuse;
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
}`,f4=`#include <common>
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
}`,h4=`uniform vec3 color;
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
}`,p4=`uniform float rotation;
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
}`,m4=`uniform vec3 diffuse;
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
}`,Je={alphahash_fragment:LH,alphahash_pars_fragment:kH,alphamap_fragment:UH,alphamap_pars_fragment:BH,alphatest_fragment:VH,alphatest_pars_fragment:HH,aomap_fragment:zH,aomap_pars_fragment:GH,batching_pars_vertex:jH,batching_vertex:WH,begin_vertex:$H,beginnormal_vertex:qH,bsdfs:XH,iridescence_fragment:YH,bumpmap_pars_fragment:ZH,clipping_planes_fragment:JH,clipping_planes_pars_fragment:KH,clipping_planes_pars_vertex:QH,clipping_planes_vertex:ez,color_fragment:tz,color_pars_fragment:nz,color_pars_vertex:iz,color_vertex:rz,common:oz,cube_uv_reflection_fragment:sz,defaultnormal_vertex:az,displacementmap_pars_vertex:cz,displacementmap_vertex:lz,emissivemap_fragment:uz,emissivemap_pars_fragment:dz,colorspace_fragment:fz,colorspace_pars_fragment:hz,envmap_fragment:pz,envmap_common_pars_fragment:mz,envmap_pars_fragment:gz,envmap_pars_vertex:yz,envmap_physical_pars_fragment:Dz,envmap_vertex:vz,fog_vertex:_z,fog_pars_vertex:xz,fog_fragment:bz,fog_pars_fragment:Sz,gradientmap_pars_fragment:Mz,lightmap_pars_fragment:Ez,lights_lambert_fragment:wz,lights_lambert_pars_fragment:Cz,lights_pars_begin:Tz,lights_toon_fragment:Az,lights_toon_pars_fragment:Iz,lights_phong_fragment:Rz,lights_phong_pars_fragment:Nz,lights_physical_fragment:Pz,lights_physical_pars_fragment:Fz,lights_fragment_begin:Oz,lights_fragment_maps:Lz,lights_fragment_end:kz,lightprobes_pars_fragment:Uz,logdepthbuf_fragment:Bz,logdepthbuf_pars_fragment:Vz,logdepthbuf_pars_vertex:Hz,logdepthbuf_vertex:zz,map_fragment:Gz,map_pars_fragment:jz,map_particle_fragment:Wz,map_particle_pars_fragment:$z,metalnessmap_fragment:qz,metalnessmap_pars_fragment:Xz,morphinstance_vertex:Yz,morphcolor_vertex:Zz,morphnormal_vertex:Jz,morphtarget_pars_vertex:Kz,morphtarget_vertex:Qz,normal_fragment_begin:eG,normal_fragment_maps:tG,normal_pars_fragment:nG,normal_pars_vertex:iG,normal_vertex:rG,normalmap_pars_fragment:oG,clearcoat_normal_fragment_begin:sG,clearcoat_normal_fragment_maps:aG,clearcoat_pars_fragment:cG,iridescence_pars_fragment:lG,opaque_fragment:uG,packing:dG,premultiplied_alpha_fragment:fG,project_vertex:hG,dithering_fragment:pG,dithering_pars_fragment:mG,roughnessmap_fragment:gG,roughnessmap_pars_fragment:yG,shadowmap_pars_fragment:vG,shadowmap_pars_vertex:_G,shadowmap_vertex:xG,shadowmask_pars_fragment:bG,skinbase_vertex:SG,skinning_pars_vertex:MG,skinning_vertex:EG,skinnormal_vertex:wG,specularmap_fragment:CG,specularmap_pars_fragment:TG,tonemapping_fragment:DG,tonemapping_pars_fragment:AG,transmission_fragment:IG,transmission_pars_fragment:RG,uv_pars_fragment:NG,uv_pars_vertex:PG,uv_vertex:FG,worldpos_vertex:OG,background_vert:LG,background_frag:kG,backgroundCube_vert:UG,backgroundCube_frag:BG,cube_vert:VG,cube_frag:HG,depth_vert:zG,depth_frag:GG,distance_vert:jG,distance_frag:WG,equirect_vert:$G,equirect_frag:qG,linedashed_vert:XG,linedashed_frag:YG,meshbasic_vert:ZG,meshbasic_frag:JG,meshlambert_vert:KG,meshlambert_frag:QG,meshmatcap_vert:e4,meshmatcap_frag:t4,meshnormal_vert:n4,meshnormal_frag:i4,meshphong_vert:r4,meshphong_frag:o4,meshphysical_vert:s4,meshphysical_frag:a4,meshtoon_vert:c4,meshtoon_frag:l4,points_vert:u4,points_frag:d4,shadow_vert:f4,shadow_frag:h4,sprite_vert:p4,sprite_frag:m4},re={common:{diffuse:{value:new rt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ge}},envmap:{envMap:{value:null},envMapRotation:{value:new Ge},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ge}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ge}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ge},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ge},normalScale:{value:new ye(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ge},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ge}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ge}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ge}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new rt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new R},probesMax:{value:new R},probesResolution:{value:new R}},points:{diffuse:{value:new rt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0},uvTransform:{value:new Ge}},sprite:{diffuse:{value:new rt(16777215)},opacity:{value:1},center:{value:new ye(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ge},alphaMap:{value:null},alphaMapTransform:{value:new Ge},alphaTest:{value:0}}},Gn={basic:{uniforms:Tn([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:Je.meshbasic_vert,fragmentShader:Je.meshbasic_frag},lambert:{uniforms:Tn([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new rt(0)},envMapIntensity:{value:1}}]),vertexShader:Je.meshlambert_vert,fragmentShader:Je.meshlambert_frag},phong:{uniforms:Tn([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new rt(0)},specular:{value:new rt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Je.meshphong_vert,fragmentShader:Je.meshphong_frag},standard:{uniforms:Tn([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new rt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag},toon:{uniforms:Tn([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new rt(0)}}]),vertexShader:Je.meshtoon_vert,fragmentShader:Je.meshtoon_frag},matcap:{uniforms:Tn([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:Je.meshmatcap_vert,fragmentShader:Je.meshmatcap_frag},points:{uniforms:Tn([re.points,re.fog]),vertexShader:Je.points_vert,fragmentShader:Je.points_frag},dashed:{uniforms:Tn([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Je.linedashed_vert,fragmentShader:Je.linedashed_frag},depth:{uniforms:Tn([re.common,re.displacementmap]),vertexShader:Je.depth_vert,fragmentShader:Je.depth_frag},normal:{uniforms:Tn([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:Je.meshnormal_vert,fragmentShader:Je.meshnormal_frag},sprite:{uniforms:Tn([re.sprite,re.fog]),vertexShader:Je.sprite_vert,fragmentShader:Je.sprite_frag},background:{uniforms:{uvTransform:{value:new Ge},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Je.background_vert,fragmentShader:Je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ge}},vertexShader:Je.backgroundCube_vert,fragmentShader:Je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Je.cube_vert,fragmentShader:Je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Je.equirect_vert,fragmentShader:Je.equirect_frag},distance:{uniforms:Tn([re.common,re.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Je.distance_vert,fragmentShader:Je.distance_frag},shadow:{uniforms:Tn([re.lights,re.fog,{color:{value:new rt(0)},opacity:{value:1}}]),vertexShader:Je.shadow_vert,fragmentShader:Je.shadow_frag}};Gn.physical={uniforms:Tn([Gn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ge},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ge},clearcoatNormalScale:{value:new ye(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ge},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ge},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ge},sheen:{value:0},sheenColor:{value:new rt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ge},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ge},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ge},transmissionSamplerSize:{value:new ye},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ge},attenuationDistance:{value:0},attenuationColor:{value:new rt(0)},specularColor:{value:new rt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ge},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ge},anisotropyVector:{value:new ye},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ge}}]),vertexShader:Je.meshphysical_vert,fragmentShader:Je.meshphysical_frag};var dg={r:0,b:0,g:0},g4=new Nt,j1=new Ge;j1.set(-1,0,0,0,1,0,0,0,1);function y4(n,e,t,i,r,o){let s=new rt(0),a=r===!0?0:1,c,l,u=null,d=0,f=null;function h(x){let E=x.isScene===!0?x.background:null;if(E&&E.isTexture){let _=x.backgroundBlurriness>0;E=e.get(E,_)}return E}function g(x){let E=!1,_=h(x);_===null?p(s,a):_&&_.isColor&&(p(_,1),E=!0);let M=n.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,o):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,o),(n.autoClear||E)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function y(x,E){let _=h(E);_&&(_.isCubeTexture||_.mapping===Yu)?(l===void 0&&(l=new mt(new pc(1,1,1),new Hn({name:"BackgroundCubeMaterial",uniforms:Os(Gn.backgroundCube.uniforms),vertexShader:Gn.backgroundCube.vertexShader,fragmentShader:Gn.backgroundCube.fragmentShader,side:zn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(M,w,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=_,l.material.uniforms.backgroundBlurriness.value=E.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(g4.makeRotationFromEuler(E.backgroundRotation)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(j1),l.material.toneMapped=it.getTransfer(_.colorSpace)!==pt,(u!==_||d!==_.version||f!==n.toneMapping)&&(l.material.needsUpdate=!0,u=_,d=_.version,f=n.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new mt(new _i(2,2),new Hn({name:"BackgroundMaterial",uniforms:Os(Gn.background.uniforms),vertexShader:Gn.background.vertexShader,fragmentShader:Gn.background.fragmentShader,side:pr,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=E.backgroundIntensity,c.material.toneMapped=it.getTransfer(_.colorSpace)!==pt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||d!==_.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=_,d=_.version,f=n.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function p(x,E){x.getRGB(dg,db(n)),t.buffers.color.setClear(dg.r,dg.g,dg.b,E,o)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return s},setClearColor:function(x,E=1){s.set(x),a=E,p(s,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(s,a)},render:g,addToRenderList:y,dispose:m}}function v4(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=f(null),o=r,s=!1;function a(N,I,k,P,B){let X=!1,V=d(N,P,k,I);o!==V&&(o=V,l(o.object)),X=h(N,P,k,B),X&&g(N,P,k,B),B!==null&&e.update(B,n.ELEMENT_ARRAY_BUFFER),(X||s)&&(s=!1,_(N,I,k,P),B!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function c(){return n.createVertexArray()}function l(N){return n.bindVertexArray(N)}function u(N){return n.deleteVertexArray(N)}function d(N,I,k,P){let B=P.wireframe===!0,X=i[I.id];X===void 0&&(X={},i[I.id]=X);let V=N.isInstancedMesh===!0?N.id:0,te=X[V];te===void 0&&(te={},X[V]=te);let j=te[k.id];j===void 0&&(j={},te[k.id]=j);let q=j[B];return q===void 0&&(q=f(c()),j[B]=q),q}function f(N){let I=[],k=[],P=[];for(let B=0;B<t;B++)I[B]=0,k[B]=0,P[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:k,attributeDivisors:P,object:N,attributes:{},index:null}}function h(N,I,k,P){let B=o.attributes,X=I.attributes,V=0,te=k.getAttributes();for(let j in te)if(te[j].location>=0){let J=B[j],he=X[j];if(he===void 0&&(j==="instanceMatrix"&&N.instanceMatrix&&(he=N.instanceMatrix),j==="instanceColor"&&N.instanceColor&&(he=N.instanceColor)),J===void 0||J.attribute!==he||he&&J.data!==he.data)return!0;V++}return o.attributesNum!==V||o.index!==P}function g(N,I,k,P){let B={},X=I.attributes,V=0,te=k.getAttributes();for(let j in te)if(te[j].location>=0){let J=X[j];J===void 0&&(j==="instanceMatrix"&&N.instanceMatrix&&(J=N.instanceMatrix),j==="instanceColor"&&N.instanceColor&&(J=N.instanceColor));let he={};he.attribute=J,J&&J.data&&(he.data=J.data),B[j]=he,V++}o.attributes=B,o.attributesNum=V,o.index=P}function y(){let N=o.newAttributes;for(let I=0,k=N.length;I<k;I++)N[I]=0}function p(N){m(N,0)}function m(N,I){let k=o.newAttributes,P=o.enabledAttributes,B=o.attributeDivisors;k[N]=1,P[N]===0&&(n.enableVertexAttribArray(N),P[N]=1),B[N]!==I&&(n.vertexAttribDivisor(N,I),B[N]=I)}function x(){let N=o.newAttributes,I=o.enabledAttributes;for(let k=0,P=I.length;k<P;k++)I[k]!==N[k]&&(n.disableVertexAttribArray(k),I[k]=0)}function E(N,I,k,P,B,X,V){V===!0?n.vertexAttribIPointer(N,I,k,B,X):n.vertexAttribPointer(N,I,k,P,B,X)}function _(N,I,k,P){y();let B=P.attributes,X=k.getAttributes(),V=I.defaultAttributeValues;for(let te in X){let j=X[te];if(j.location>=0){let q=B[te];if(q===void 0&&(te==="instanceMatrix"&&N.instanceMatrix&&(q=N.instanceMatrix),te==="instanceColor"&&N.instanceColor&&(q=N.instanceColor)),q!==void 0){let J=q.normalized,he=q.itemSize,we=e.get(q);if(we===void 0)continue;let dt=we.buffer,Ke=we.type,et=we.bytesPerElement,$=Ke===n.INT||Ke===n.UNSIGNED_INT||q.gpuType===Tm;if(q.isInterleavedBufferAttribute){let Q=q.data,ve=Q.stride,ke=q.offset;if(Q.isInstancedInterleavedBuffer){for(let ge=0;ge<j.locationSize;ge++)m(j.location+ge,Q.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let ge=0;ge<j.locationSize;ge++)p(j.location+ge);n.bindBuffer(n.ARRAY_BUFFER,dt);for(let ge=0;ge<j.locationSize;ge++)E(j.location+ge,he/j.locationSize,Ke,J,ve*et,(ke+he/j.locationSize*ge)*et,$)}else{if(q.isInstancedBufferAttribute){for(let Q=0;Q<j.locationSize;Q++)m(j.location+Q,q.meshPerAttribute);N.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let Q=0;Q<j.locationSize;Q++)p(j.location+Q);n.bindBuffer(n.ARRAY_BUFFER,dt);for(let Q=0;Q<j.locationSize;Q++)E(j.location+Q,he/j.locationSize,Ke,J,he*et,he/j.locationSize*Q*et,$)}}else if(V!==void 0){let J=V[te];if(J!==void 0)switch(J.length){case 2:n.vertexAttrib2fv(j.location,J);break;case 3:n.vertexAttrib3fv(j.location,J);break;case 4:n.vertexAttrib4fv(j.location,J);break;default:n.vertexAttrib1fv(j.location,J)}}}}x()}function M(){C();for(let N in i){let I=i[N];for(let k in I){let P=I[k];for(let B in P){let X=P[B];for(let V in X)u(X[V].object),delete X[V];delete P[B]}}delete i[N]}}function w(N){if(i[N.id]===void 0)return;let I=i[N.id];for(let k in I){let P=I[k];for(let B in P){let X=P[B];for(let V in X)u(X[V].object),delete X[V];delete P[B]}}delete i[N.id]}function D(N){for(let I in i){let k=i[I];for(let P in k){let B=k[P];if(B[N.id]===void 0)continue;let X=B[N.id];for(let V in X)u(X[V].object),delete X[V];delete B[N.id]}}}function b(N){for(let I in i){let k=i[I],P=N.isInstancedMesh===!0?N.id:0,B=k[P];if(B!==void 0){for(let X in B){let V=B[X];for(let te in V)u(V[te].object),delete V[te];delete B[X]}delete k[P],Object.keys(k).length===0&&delete i[I]}}}function C(){A(),s=!0,o!==r&&(o=r,l(o.object))}function A(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:C,resetDefaultState:A,dispose:M,releaseStatesOfGeometry:w,releaseStatesOfObject:b,releaseStatesOfProgram:D,initAttributes:y,enableAttribute:p,disableUnusedAttributes:x}}function _4(n,e,t){let i;function r(c){i=c}function o(c,l){n.drawArrays(i,c,l),t.update(l,i,1)}function s(c,l,u){u!==0&&(n.drawArraysInstanced(i,c,l,u),t.update(l,i,u))}function a(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,u);let f=0;for(let h=0;h<u;h++)f+=l[h];t.update(f,i,1)}this.setMode=r,this.render=o,this.renderInstances=s,this.renderMultiDraw=a}function x4(n,e,t,i){let r;function o(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){let D=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function s(D){return!(D!==xi&&i.convert(D)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(D){let b=D===ji&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(D!==ci&&D!==Gi&&!b&&i.convert(D)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function c(D){if(D==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";D="mediump"}return D==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",u=c(l);u!==l&&(Le("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);let d=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&f===!1&&Le("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let h=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),p=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),m=n.getParameter(n.MAX_VERTEX_ATTRIBS),x=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),E=n.getParameter(n.MAX_VARYING_VECTORS),_=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),M=n.getParameter(n.MAX_SAMPLES),w=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:o,getMaxPrecision:c,textureFormatReadable:s,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:h,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:x,maxVaryings:E,maxFragmentUniforms:_,maxSamples:M,samples:w}}function b4(n){let e=this,t=null,i=0,r=!1,o=!1,s=new ki,a=new Ge,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(d,f){let h=d.length!==0||f||i!==0||r;return r=f,i=d.length,h},this.beginShadows=function(){o=!0,u(null)},this.endShadows=function(){o=!1},this.setGlobalState=function(d,f){t=u(d,f,0)},this.setState=function(d,f,h){let g=d.clippingPlanes,y=d.clipIntersection,p=d.clipShadows,m=n.get(d);if(!r||g===null||g.length===0||o&&!p)o?u(null):l();else{let x=o?0:i,E=x*4,_=m.clippingState||null;c.value=_,_=u(g,f,E,h);for(let M=0;M!==E;++M)_[M]=t[M];m.clippingState=_,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function u(d,f,h,g){let y=d!==null?d.length:0,p=null;if(y!==0){if(p=c.value,g!==!0||p===null){let m=h+y*4,x=f.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<m)&&(p=new Float32Array(m));for(let E=0,_=h;E!==y;++E,_+=4)s.copy(d[E]).applyMatrix4(x,a),s.normal.toArray(p,_),p[_+3]=s.constant}c.value=p,c.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,p}}var Sc=4,S4=6,M4=20,E4=256,rd=new Wu,b1=new rt,mb=null,gb=0,yb=0,vb=!1,w4=new R,Ls=new R,hg=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,r=100,o={}){let{size:s=256,position:a=w4}=o;mb=this._renderer.getRenderTarget(),gb=this._renderer.getActiveCubeFace(),yb=this._renderer.getActiveMipmapLevel(),vb=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(s);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,i,r,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=E1(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=M1(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(mb,gb,yb),this._renderer.xr.enabled=vb,e.scissorTest=!1,bc(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Oo||e.mapping===Fs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),mb=this._renderer.getRenderTarget(),gb=this._renderer.getActiveCubeFace(),yb=this._renderer.getActiveMipmapLevel(),vb=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:Jt,minFilter:Jt,generateMipmaps:!1,type:ji,format:xi,colorSpace:vu,depthBuffer:!1},r=S1(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=S1(e,t,i);let{_lodMax:o}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=C4(o)),this._blurMaterial=D4(o,e,t),this._ggxMaterial=T4(o,e,t)}return r}_compileMaterial(e){let t=new mt(new Vn,e);this._renderer.compile(t,rd)}_sceneToCubeUV(e,t,i,r,o){let c=new Zn(90,1,t,i),l=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,f=d.autoClear,h=d.toneMapping;d.getClearColor(b1),d.toneMapping=Hi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(r),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new mt(new pc,new Qt({name:"PMREM.Background",side:zn,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,m=!1,x=e.background;x?x.isColor&&(p.color.copy(x),e.background=null,m=!0):(p.color.copy(b1),m=!0);for(let E=0;E<6;E++){let _=E%3;_===0?(c.up.set(0,l[E],0),c.position.set(o.x,o.y,o.z),c.lookAt(o.x+u[E],o.y,o.z)):_===1?(c.up.set(0,0,l[E]),c.position.set(o.x,o.y,o.z),c.lookAt(o.x,o.y+u[E],o.z)):(c.up.set(0,l[E],0),c.position.set(o.x,o.y,o.z),c.lookAt(o.x,o.y,o.z+u[E]));let M=this._cubeSize;bc(r,_*M,E>2?M:0,M,M),d.setRenderTarget(r),m&&d.render(y,c),d.render(e,c)}d.toneMapping=h,d.autoClear=f,e.background=x}_textureToCubeUV(e,t){let i=this._renderer,r=e.mapping===Oo||e.mapping===Fs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=E1()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=M1());let o=r?this._cubemapMaterial:this._equirectMaterial,s=this._lodMeshes[0];s.material=o;let a=o.uniforms;a.envMap.value=e;let c=this._cubeSize;bc(t,0,0,3*c,2*c),i.setRenderTarget(t),i.render(s,rd)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let r=this._lodMeshes.length;for(let o=1;o<r;o++)this._applyGGXFilter(e,o-1,o);t.autoClear=i}_applyGGXFilter(e,t,i){let r=this._renderer,o=this._pingPongRenderTarget,s=this._ggxMaterial,a=this._lodMeshes[i];a.material=s;let c=s.uniforms,l=i/(this._lodMeshes.length-1),u=t/(this._lodMeshes.length-1),d=Math.sqrt(l*l-u*u),f=l*1.25,h=d*f,{_lodMax:g}=this,y=this._sizeLods[i],p=3*y*(i>g-Sc?i-g+Sc:0),m=4*(this._cubeSize-y);c.envMap.value=e.texture,c.roughness.value=h,c.mipInt.value=g-t,bc(o,p,m,3*y,2*y),r.setRenderTarget(o),r.render(a,rd),c.envMap.value=o.texture,c.roughness.value=0,c.mipInt.value=g-i,bc(e,p,m,3*y,2*y),r.setRenderTarget(e),r.render(a,rd)}_blur(e,t,i,r){let o=this._pingPongRenderTarget,s=Math.min(r,Math.PI)/Math.SQRT2;this._blurPass(e,o,t,i,s),this._blurPass(o,e,i,i,s)}_blurPass(e,t,i,r,o){let s=this._renderer,a=this._blurMaterial,c=this._lodMeshes[r];c.material=a;let l=a.uniforms;l.envMap.value=e.texture,l.sigma.value=o,l.mipInt.value=this._lodMax-i;let u=this._sizeLods[r],d=3*u*(r>this._lodMax-Sc?r-this._lodMax+Sc:0),f=4*(this._cubeSize-u);bc(t,d,f,3*u,2*u),s.setRenderTarget(t),s.render(c,rd)}};function C4(n){let e=[],t=[],i=n,r=n-Sc+1+S4;for(let o=0;o<r;o++){let s=Math.pow(2,i);e.push(s);let a=1/(s-2),c=-a,l=1+a,u=[c,c,l,c,l,l,c,c,l,l,c,l],d=6,f=6,h=3,g=new Float32Array(h*f*d),y=new Float32Array(h*f*d);for(let m=0;m<d;m++){let x=m%3*2/3-1,E=m>2?0:-1,_=[x,E,0,x+2/3,E,0,x+2/3,E+1,0,x,E,0,x+2/3,E+1,0,x,E+1,0];g.set(_,h*f*m);for(let M=0;M<f;M++){let w=u[M*2]*2-1,D=u[M*2+1]*2-1;m===0?Ls.set(1,D,w):m===1?Ls.set(-w,1,-D):m===2?Ls.set(-w,D,1):m===3?Ls.set(-1,D,-w):m===4?Ls.set(-w,-1,D):Ls.set(w,D,-1),Ls.toArray(y,(m*f+M)*h)}}let p=new Vn;p.setAttribute("position",new ri(g,h)),p.setAttribute("outputDirection",new ri(y,h)),t.push(new mt(p,null)),i>Sc&&i--}return{lodMeshes:t,sizeLods:e}}function S1(n,e,t){let i=new Jn(n,e,t);return i.texture.mapping=Yu,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function bc(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function T4(n,e,t){return new Hn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:E4,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:mg(),fragmentShader:`

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
		`,blending:mr,depthTest:!1,depthWrite:!1})}function D4(n,e,t){return new Hn({name:"SphericalGaussianBlur",defines:{SAMPLES:M4,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:mg(),fragmentShader:`

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
		`,blending:mr,depthTest:!1,depthWrite:!1})}function M1(){return new Hn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:mg(),fragmentShader:`

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
		`,blending:mr,depthTest:!1,depthWrite:!1})}function E1(){return new Hn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:mg(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:mr,depthTest:!1,depthWrite:!1})}function mg(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var pg=class extends Jn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Au(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new pc(5,5,5),o=new Hn({name:"CubemapFromEquirect",uniforms:Os(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:zn,blending:mr});o.uniforms.tEquirect.value=t;let s=new mt(r,o),a=t.minFilter;return t.minFilter===Lo&&(t.minFilter=Jt),new Sm(1,10,this).update(e,s),t.minFilter=a,s.geometry.dispose(),s.material.dispose(),this}clear(e,t=!0,i=!0,r=!0){let o=e.getRenderTarget();for(let s=0;s<6;s++)e.setRenderTarget(this,s),e.clear(t,i,r);e.setRenderTarget(o)}};function A4(n){let e=new WeakMap,t=new WeakMap,i=null;function r(f,h=!1){return f==null?null:h?s(f):o(f)}function o(f){if(f&&f.isTexture){let h=f.mapping;if(h===Em||h===wm)if(e.has(f)){let g=e.get(f).texture;return a(g,f.mapping)}else{let g=f.image;if(g&&g.height>0){let y=new pg(g.height);return y.fromEquirectangularTexture(n,f),e.set(f,y),f.addEventListener("dispose",l),a(y.texture,f.mapping)}else return null}}return f}function s(f){if(f&&f.isTexture){let h=f.mapping,g=h===Em||h===wm,y=h===Oo||h===Fs;if(g||y){let p=t.get(f),m=p!==void 0?p.texture.pmremVersion:0;if(f.isRenderTargetTexture&&f.pmremVersion!==m)return i===null&&(i=new hg(n)),p=g?i.fromEquirectangular(f,p):i.fromCubemap(f,p),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),p.texture;if(p!==void 0)return p.texture;{let x=f.image;return g&&x&&x.height>0||y&&x&&c(x)?(i===null&&(i=new hg(n)),p=g?i.fromEquirectangular(f):i.fromCubemap(f),p.texture.pmremVersion=f.pmremVersion,t.set(f,p),f.addEventListener("dispose",u),p.texture):null}}}return f}function a(f,h){return h===Em?f.mapping=Oo:h===wm&&(f.mapping=Fs),f}function c(f){let h=0,g=6;for(let y=0;y<g;y++)f[y]!==void 0&&h++;return h===g}function l(f){let h=f.target;h.removeEventListener("dispose",l);let g=e.get(h);g!==void 0&&(e.delete(h),g.dispose())}function u(f){let h=f.target;h.removeEventListener("dispose",u);let g=t.get(h);g!==void 0&&(t.delete(h),g.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:d}}function I4(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let r=n.getExtension(i);return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let r=t(i);return r===null&&As("WebGLRenderer: "+i+" extension not supported."),r}}}function R4(n,e,t,i){let r={},o=new WeakMap;function s(d){let f=d.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",s),delete r[f.id];let h=o.get(f);h&&(e.remove(h),o.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(d,f){return r[f.id]===!0||(f.addEventListener("dispose",s),r[f.id]=!0,t.memory.geometries++),f}function c(d){let f=d.attributes;for(let h in f)e.update(f[h],n.ARRAY_BUFFER)}function l(d){let f=[],h=d.index,g=d.attributes.position,y=0;if(g===void 0)return;if(h!==null){let x=h.array;y=h.version;for(let E=0,_=x.length;E<_;E+=3){let M=x[E+0],w=x[E+1],D=x[E+2];f.push(M,w,w,D,D,M)}}else{let x=g.array;y=g.version;for(let E=0,_=x.length/3-1;E<_;E+=3){let M=E+0,w=E+1,D=E+2;f.push(M,w,w,D,D,M)}}let p=new(g.count>=65535?Tu:Cu)(f,1);p.version=y;let m=o.get(d);m&&e.remove(m),o.set(d,p)}function u(d){let f=o.get(d);if(f){let h=d.index;h!==null&&f.version<h.version&&l(d)}else l(d);return o.get(d)}return{get:a,update:c,getWireframeAttribute:u}}function N4(n,e,t){let i;function r(d){i=d}let o,s;function a(d){o=d.type,s=d.bytesPerElement}function c(d,f){n.drawElements(i,f,o,d*s),t.update(f,i,1)}function l(d,f,h){h!==0&&(n.drawElementsInstanced(i,f,o,d*s,h),t.update(f,i,h))}function u(d,f,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,o,d,0,h);let y=0;for(let p=0;p<h;p++)y+=f[p];t.update(y,i,1)}this.setMode=r,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function P4(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(o,s,a){switch(t.calls++,s){case n.TRIANGLES:t.triangles+=a*(o/3);break;case n.LINES:t.lines+=a*(o/2);break;case n.LINE_STRIP:t.lines+=a*(o-1);break;case n.LINE_LOOP:t.lines+=a*o;break;case n.POINTS:t.points+=a*o;break;default:Be("WebGLInfo: Unknown draw mode:",s);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function F4(n,e,t){let i=new WeakMap,r=new vt;function o(s,a,c){let l=s.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=u!==void 0?u.length:0,f=i.get(a);if(f===void 0||f.count!==d){let A=function(){b.dispose(),i.delete(a),a.removeEventListener("dispose",A)};var h=A;f!==void 0&&f.texture.dispose();let g=a.morphAttributes.position!==void 0,y=a.morphAttributes.normal!==void 0,p=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],x=a.morphAttributes.normal||[],E=a.morphAttributes.color||[],_=0;g===!0&&(_=1),y===!0&&(_=2),p===!0&&(_=3);let M=a.attributes.position.count*_,w=1;M>e.maxTextureSize&&(w=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);let D=new Float32Array(M*w*4*d),b=new Mu(D,M,w,d);b.type=Gi,b.needsUpdate=!0;let C=_*4;for(let N=0;N<d;N++){let I=m[N],k=x[N],P=E[N],B=M*w*4*N;for(let X=0;X<I.count;X++){let V=X*C;g===!0&&(r.fromBufferAttribute(I,X),D[B+V+0]=r.x,D[B+V+1]=r.y,D[B+V+2]=r.z,D[B+V+3]=0),y===!0&&(r.fromBufferAttribute(k,X),D[B+V+4]=r.x,D[B+V+5]=r.y,D[B+V+6]=r.z,D[B+V+7]=0),p===!0&&(r.fromBufferAttribute(P,X),D[B+V+8]=r.x,D[B+V+9]=r.y,D[B+V+10]=r.z,D[B+V+11]=P.itemSize===4?r.w:1)}}f={count:d,texture:b,size:new ye(M,w)},i.set(a,f),a.addEventListener("dispose",A)}if(s.isInstancedMesh===!0&&s.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",s.morphTexture,t);else{let g=0;for(let p=0;p<l.length;p++)g+=l[p];let y=a.morphTargetsRelative?1:1-g;c.getUniforms().setValue(n,"morphTargetBaseInfluence",y),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:o}}function O4(n,e,t,i,r){let o=new WeakMap;function s(l){let u=r.render.frame,d=l.geometry,f=e.get(l,d);if(o.get(f)!==u&&(e.update(f),o.set(f,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),o.get(l)!==u&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),o.set(l,u))),l.isSkinnedMesh){let h=l.skeleton;o.get(h)!==u&&(h.update(),o.set(h,u))}return f}function a(){o=new WeakMap}function c(l){let u=l.target;u.removeEventListener("dispose",c),i.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:s,dispose:a}}var L4={[Wx]:"LINEAR_TONE_MAPPING",[$x]:"REINHARD_TONE_MAPPING",[qx]:"CINEON_TONE_MAPPING",[Xx]:"ACES_FILMIC_TONE_MAPPING",[Zx]:"AGX_TONE_MAPPING",[Jx]:"NEUTRAL_TONE_MAPPING",[Yx]:"CUSTOM_TONE_MAPPING"};function k4(n,e,t,i,r,o){let s=new Jn(e,t,{type:n,depthBuffer:r,stencilBuffer:o,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new Vn;l.setAttribute("position",new It([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new It([0,2,0,0,2,0],2));let u=new dm({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new mt(l,u),f=new Wu(-1,1,1,-1,0,1),h=null,g=null,y=!1,p,m=null,x=[],E=!1;this.setSize=function(_,M){s.setSize(_,M),a!==null&&a.setSize(_,M),c!==null&&c.setSize(_,M);for(let w=0;w<x.length;w++){let D=x[w];D.setSize&&D.setSize(_,M)}},this.setEffects=function(_){x=_,E=x.length>0&&x[0].isRenderPass===!0;let M=s.width,w=s.height;x.length>0&&a===null&&(a=new Jn(M,w,{type:ji,depthBuffer:!1,stencilBuffer:!1}),c=new Jn(M,w,{type:ji,depthBuffer:!1,stencilBuffer:!1}));for(let D=0;D<x.length;D++){let b=x[D];b.setSize&&b.setSize(M,w)}},this.begin=function(_,M){if(y||_.toneMapping===Hi&&x.length===0)return!1;if(m=M,M!==null){let w=M.width,D=M.height;(s.width!==w||s.height!==D)&&this.setSize(w,D)}return E===!1&&_.setRenderTarget(s),p=_.toneMapping,_.toneMapping=Hi,!0},this.hasRenderPass=function(){return E},this.end=function(_,M){_.toneMapping=p,y=!0;let w=s,D=a;for(let b=0;b<x.length;b++){let C=x[b];C.enabled!==!1&&(C.render(_,D,w,M),C.needsSwap!==!1&&(w=D,D=D===a?c:a))}if(h!==_.outputColorSpace||g!==_.toneMapping){h=_.outputColorSpace,g=_.toneMapping,u.defines={},it.getTransfer(h)===pt&&(u.defines.SRGB_TRANSFER="");let b=L4[g];b&&(u.defines[b]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=w.texture,_.setRenderTarget(m),_.render(d,f),m=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){s.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),u.dispose()}}var W1=new bi,bb=new Ao(1,1),$1=new Mu,q1=new em,X1=new Au,w1=[],C1=[],T1=new Float32Array(16),D1=new Float32Array(9),A1=new Float32Array(4);function Ec(n,e,t){let i=n[0];if(i<=0||i>0)return n;let r=e*t,o=w1[r];if(o===void 0&&(o=new Float32Array(r),w1[r]=o),e!==0){i.toArray(o,0);for(let s=1,a=0;s!==e;++s)a+=t,n[s].toArray(o,a)}return o}function en(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function tn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function gg(n,e){let t=C1[e];t===void 0&&(t=new Int32Array(e),C1[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function U4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function B4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2fv(this.addr,e),tn(t,e)}}function V4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(en(t,e))return;n.uniform3fv(this.addr,e),tn(t,e)}}function H4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4fv(this.addr,e),tn(t,e)}}function z4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;A1.set(i),n.uniformMatrix2fv(this.addr,!1,A1),tn(t,i)}}function G4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;D1.set(i),n.uniformMatrix3fv(this.addr,!1,D1),tn(t,i)}}function j4(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(en(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),tn(t,e)}else{if(en(t,i))return;T1.set(i),n.uniformMatrix4fv(this.addr,!1,T1),tn(t,i)}}function W4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function $4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2iv(this.addr,e),tn(t,e)}}function q4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;n.uniform3iv(this.addr,e),tn(t,e)}}function X4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4iv(this.addr,e),tn(t,e)}}function Y4(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Z4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(en(t,e))return;n.uniform2uiv(this.addr,e),tn(t,e)}}function J4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(en(t,e))return;n.uniform3uiv(this.addr,e),tn(t,e)}}function K4(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(en(t,e))return;n.uniform4uiv(this.addr,e),tn(t,e)}}function Q4(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let o;this.type===n.SAMPLER_2D_SHADOW?(bb.compareFunction=t.isReversedDepthBuffer()?ug:lg,o=bb):o=W1,t.setTexture2D(e||o,r)}function ej(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||q1,r)}function tj(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||X1,r)}function nj(n,e,t){let i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||$1,r)}function ij(n){switch(n){case 5126:return U4;case 35664:return B4;case 35665:return V4;case 35666:return H4;case 35674:return z4;case 35675:return G4;case 35676:return j4;case 5124:case 35670:return W4;case 35667:case 35671:return $4;case 35668:case 35672:return q4;case 35669:case 35673:return X4;case 5125:return Y4;case 36294:return Z4;case 36295:return J4;case 36296:return K4;case 35678:case 36198:case 36298:case 36306:case 35682:return Q4;case 35679:case 36299:case 36307:return ej;case 35680:case 36300:case 36308:case 36293:return tj;case 36289:case 36303:case 36311:case 36292:return nj}}function rj(n,e){n.uniform1fv(this.addr,e)}function oj(n,e){let t=Ec(e,this.size,2);n.uniform2fv(this.addr,t)}function sj(n,e){let t=Ec(e,this.size,3);n.uniform3fv(this.addr,t)}function aj(n,e){let t=Ec(e,this.size,4);n.uniform4fv(this.addr,t)}function cj(n,e){let t=Ec(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function lj(n,e){let t=Ec(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function uj(n,e){let t=Ec(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function dj(n,e){n.uniform1iv(this.addr,e)}function fj(n,e){n.uniform2iv(this.addr,e)}function hj(n,e){n.uniform3iv(this.addr,e)}function pj(n,e){n.uniform4iv(this.addr,e)}function mj(n,e){n.uniform1uiv(this.addr,e)}function gj(n,e){n.uniform2uiv(this.addr,e)}function yj(n,e){n.uniform3uiv(this.addr,e)}function vj(n,e){n.uniform4uiv(this.addr,e)}function _j(n,e,t){let i=this.cache,r=e.length,o=gg(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));let s;this.type===n.SAMPLER_2D_SHADOW?s=bb:s=W1;for(let a=0;a!==r;++a)t.setTexture2D(e[a]||s,o[a])}function xj(n,e,t){let i=this.cache,r=e.length,o=gg(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let s=0;s!==r;++s)t.setTexture3D(e[s]||q1,o[s])}function bj(n,e,t){let i=this.cache,r=e.length,o=gg(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let s=0;s!==r;++s)t.setTextureCube(e[s]||X1,o[s])}function Sj(n,e,t){let i=this.cache,r=e.length,o=gg(t,r);en(i,o)||(n.uniform1iv(this.addr,o),tn(i,o));for(let s=0;s!==r;++s)t.setTexture2DArray(e[s]||$1,o[s])}function Mj(n){switch(n){case 5126:return rj;case 35664:return oj;case 35665:return sj;case 35666:return aj;case 35674:return cj;case 35675:return lj;case 35676:return uj;case 5124:case 35670:return dj;case 35667:case 35671:return fj;case 35668:case 35672:return hj;case 35669:case 35673:return pj;case 5125:return mj;case 36294:return gj;case 36295:return yj;case 36296:return vj;case 35678:case 36198:case 36298:case 36306:case 35682:return _j;case 35679:case 36299:case 36307:return xj;case 35680:case 36300:case 36308:case 36293:return bj;case 36289:case 36303:case 36311:case 36292:return Sj}}var Sb=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=ij(t.type)}},Mb=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Mj(t.type)}},Eb=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let r=this.seq;for(let o=0,s=r.length;o!==s;++o){let a=r[o];a.setValue(e,t[a.id],i)}}},_b=/(\w+)(\])?(\[|\.)?/g;function I1(n,e){n.seq.push(e),n.map[e.id]=e}function Ej(n,e,t){let i=n.name,r=i.length;for(_b.lastIndex=0;;){let o=_b.exec(i),s=_b.lastIndex,a=o[1],c=o[2]==="]",l=o[3];if(c&&(a=a|0),l===void 0||l==="["&&s+2===r){I1(t,l===void 0?new Sb(a,n,e):new Mb(a,n,e));break}else{let d=t.map[a];d===void 0&&(d=new Eb(a),I1(t,d)),t=d}}}var Mc=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let a=e.getActiveUniform(t,s),c=e.getUniformLocation(t,a.name);Ej(a,c,this)}let r=[],o=[];for(let s of this.seq)s.type===e.SAMPLER_2D_SHADOW||s.type===e.SAMPLER_CUBE_SHADOW||s.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(s):o.push(s);r.length>0&&(this.seq=r.concat(o))}setValue(e,t,i,r){let o=this.map[t];o!==void 0&&o.setValue(e,i,r)}setOptional(e,t,i){let r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let o=0,s=t.length;o!==s;++o){let a=t[o],c=i[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,r)}}static seqWithValue(e,t){let i=[];for(let r=0,o=e.length;r!==o;++r){let s=e[r];s.id in t&&i.push(s)}return i}};function R1(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var wj=37297,Cj=0;function Tj(n,e){let t=n.split(`
`),i=[],r=Math.max(e-6,0),o=Math.min(e+6,t.length);for(let s=r;s<o;s++){let a=s+1;i.push(`${a===e?">":" "} ${a}: ${t[s]}`)}return i.join(`
`)}var N1=new Ge;function Dj(n){it._getMatrix(N1,it.workingColorSpace,n);let e=`mat3( ${N1.elements.map(t=>t.toFixed(4))} )`;switch(it.getTransfer(n)){case _u:return[e,"LinearTransferOETF"];case pt:return[e,"sRGBTransferOETF"];default:return Le("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function P1(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),o=(n.getShaderInfoLog(e)||"").trim();if(i&&o==="")return"";let s=/ERROR: 0:(\d+)/.exec(o);if(s){let a=parseInt(s[1]);return t.toUpperCase()+`

`+o+`

`+Tj(n.getShaderSource(e),a)}else return o}function Aj(n,e){let t=Dj(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Ij={[Wx]:"Linear",[$x]:"Reinhard",[qx]:"Cineon",[Xx]:"ACESFilmic",[Zx]:"AgX",[Jx]:"Neutral",[Yx]:"Custom"};function Rj(n,e){let t=Ij[e];return t===void 0?(Le("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var fg=new R;function Nj(){it.getLuminanceCoefficients(fg);let n=fg.x.toFixed(4),e=fg.y.toFixed(4),t=fg.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Pj(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(sd).join(`
`)}function Fj(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Oj(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){let o=n.getActiveAttrib(e,r),s=o.name,a=1;o.type===n.FLOAT_MAT2&&(a=2),o.type===n.FLOAT_MAT3&&(a=3),o.type===n.FLOAT_MAT4&&(a=4),t[s]={type:o.type,location:n.getAttribLocation(e,s),locationSize:a}}return t}function sd(n){return n!==""}function F1(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function O1(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var Lj=/^[ \t]*#include +<([\w\d./]+)>/gm;function wb(n){return n.replace(Lj,Uj)}var kj=new Map;function Uj(n,e){let t=Je[e];if(t===void 0){let i=kj.get(e);if(i!==void 0)t=Je[i],Le('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return wb(t)}var Bj=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function L1(n){return n.replace(Bj,Vj)}function Vj(n,e,t,i){let r="";for(let o=parseInt(e);o<parseInt(t);o++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+o+" ]").replace(/UNROLLED_LOOP_INDEX/g,o);return r}function k1(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}var Hj={[Xu]:"SHADOWMAP_TYPE_PCF",[yc]:"SHADOWMAP_TYPE_VSM"};function zj(n){return Hj[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Gj={[Oo]:"ENVMAP_TYPE_CUBE",[Fs]:"ENVMAP_TYPE_CUBE",[Yu]:"ENVMAP_TYPE_CUBE_UV"};function jj(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":Gj[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var Wj={[Fs]:"ENVMAP_MODE_REFRACTION"};function $j(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":Wj[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var qj={[jx]:"ENVMAP_BLENDING_MULTIPLY",[QI]:"ENVMAP_BLENDING_MIX",[e1]:"ENVMAP_BLENDING_ADD"};function Xj(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":qj[n.combine]||"ENVMAP_BLENDING_NONE"}function Yj(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Zj(n,e,t,i){let r=n.getContext(),o=t.defines,s=t.vertexShader,a=t.fragmentShader,c=zj(t),l=jj(t),u=$j(t),d=Xj(t),f=Yj(t),h=Pj(t),g=Fj(o),y=r.createProgram(),p,m,x=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(sd).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(sd).join(`
`),m.length>0&&(m+=`
`)):(p=[k1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(sd).join(`
`),m=[k1(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+d:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Hi?"#define TONE_MAPPING":"",t.toneMapping!==Hi?Je.tonemapping_pars_fragment:"",t.toneMapping!==Hi?Rj("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Je.colorspace_pars_fragment,Aj("linearToOutputTexel",t.outputColorSpace),Nj(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(sd).join(`
`)),s=wb(s),s=F1(s,t),s=O1(s,t),a=wb(a),a=F1(a,t),a=O1(a,t),s=L1(s),a=L1(a),t.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",t.glslVersion===ab?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ab?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let E=x+p+s,_=x+m+a,M=R1(r,r.VERTEX_SHADER,E),w=R1(r,r.FRAGMENT_SHADER,_);r.attachShader(y,M),r.attachShader(y,w),t.index0AttributeName!==void 0?r.bindAttribLocation(y,0,t.index0AttributeName):t.hasPositionAttribute===!0&&r.bindAttribLocation(y,0,"position"),r.linkProgram(y);function D(N){if(n.debug.checkShaderErrors){let I=r.getProgramInfoLog(y)||"",k=r.getShaderInfoLog(M)||"",P=r.getShaderInfoLog(w)||"",B=I.trim(),X=k.trim(),V=P.trim(),te=!0,j=!0;if(r.getProgramParameter(y,r.LINK_STATUS)===!1)if(te=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,y,M,w);else{let q=P1(r,M,"vertex"),J=P1(r,w,"fragment");Be("WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(y,r.VALIDATE_STATUS)+`

Material Name: `+N.name+`
Material Type: `+N.type+`

Program Info Log: `+B+`
`+q+`
`+J)}else B!==""?Le("WebGLProgram: Program Info Log:",B):(X===""||V==="")&&(j=!1);j&&(N.diagnostics={runnable:te,programLog:B,vertexShader:{log:X,prefix:p},fragmentShader:{log:V,prefix:m}})}r.deleteShader(M),r.deleteShader(w),b=new Mc(r,y),C=Oj(r,y)}let b;this.getUniforms=function(){return b===void 0&&D(this),b};let C;this.getAttributes=function(){return C===void 0&&D(this),C};let A=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=r.getProgramParameter(y,wj)),A},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cj++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=M,this.fragmentShader=w,this}var Jj=0,Cb=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(i)===!1&&(r.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Tb(e),t.set(e,i)),i}},Tb=class{constructor(e){this.id=Jj++,this.code=e,this.usedTimes=0}};function Kj(n){return n===Uo||n===td||n===nd}function Qj(n,e,t,i,r,o){let s=new wu,a=new Cb,c=new Set,l=[],u=new Map,d=i.logarithmicDepthBuffer,f=i.precision,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(b){return c.add(b),b===0?"uv":`uv${b}`}function y(b,C,A,N,I,k){let P=N.fog,B=I.geometry,X=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?N.environment:null,V=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,te=e.get(b.envMap||X,V),j=te&&te.mapping===Yu?te.image.height:null,q=h[b.type];b.precision!==null&&(f=i.getMaxPrecision(b.precision),f!==b.precision&&Le("WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));let J=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,he=J!==void 0?J.length:0,we=0;B.morphAttributes.position!==void 0&&(we=1),B.morphAttributes.normal!==void 0&&(we=2),B.morphAttributes.color!==void 0&&(we=3);let dt,Ke,et,$;if(q){let wt=Gn[q];dt=wt.vertexShader,Ke=wt.fragmentShader}else{dt=b.vertexShader,Ke=b.fragmentShader;let wt=a.getVertexShaderStage(b),ft=a.getFragmentShaderStage(b);a.update(b,wt,ft),et=wt.id,$=ft.id}let Q=n.getRenderTarget(),ve=n.state.buffers.depth.getReversed(),ke=I.isInstancedMesh===!0,ge=I.isBatchedMesh===!0,Xe=!!b.map,St=!!b.matcap,Ye=!!te,st=!!b.aoMap,_t=!!b.lightMap,oe=!!b.bumpMap&&b.wireframe===!1,je=!!b.normalMap,Rt=!!b.displacementMap,Pt=!!b.emissiveMap,Ft=!!b.metalnessMap,qt=!!b.roughnessMap,L=b.anisotropy>0,pn=b.clearcoat>0,gt=b.dispersion>0,T=b.retroreflectivity>0,v=b.iridescence>0,U=b.sheen>0,G=b.transmission>0,Y=L&&!!b.anisotropyMap,ie=pn&&!!b.clearcoatMap,se=pn&&!!b.clearcoatNormalMap,Z=pn&&!!b.clearcoatRoughnessMap,ee=v&&!!b.iridescenceMap,ae=v&&!!b.iridescenceThicknessMap,De=U&&!!b.sheenColorMap,de=U&&!!b.sheenRoughnessMap,ce=!!b.specularMap,Ae=!!b.specularColorMap,Fe=!!b.specularIntensityMap,$e=G&&!!b.transmissionMap,O=G&&!!b.thicknessMap,le=!!b.gradientMap,K=!!b.alphaMap,ue=b.alphaTest>0,me=!!b.alphaHash,ne=!!b.extensions,Ie=Hi;b.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Ie=n.toneMapping);let Ce={shaderID:q,shaderType:b.type,shaderName:b.name,vertexShader:dt,fragmentShader:Ke,defines:b.defines,customVertexShaderID:et,customFragmentShaderID:$,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:ge,batchingColor:ge&&I._colorsTexture!==null,instancing:ke,instancingColor:ke&&I.instanceColor!==null,instancingMorph:ke&&I.morphTexture!==null,outputColorSpace:Q===null?n.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:it.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:Xe,matcap:St,envMap:Ye,envMapMode:Ye&&te.mapping,envMapCubeUVHeight:j,aoMap:st,lightMap:_t,bumpMap:oe,normalMap:je,displacementMap:Rt,emissiveMap:Pt,normalMapObjectSpace:je&&b.normalMapType===i1,normalMapTangentSpace:je&&b.normalMapType===ob,packedNormalMap:je&&b.normalMapType===ob&&Kj(b.normalMap.format),metalnessMap:Ft,roughnessMap:qt,anisotropy:L,anisotropyMap:Y,clearcoat:pn,clearcoatMap:ie,clearcoatNormalMap:se,clearcoatRoughnessMap:Z,dispersion:gt,retroreflection:T,iridescence:v,iridescenceMap:ee,iridescenceThicknessMap:ae,sheen:U,sheenColorMap:De,sheenRoughnessMap:de,specularMap:ce,specularColorMap:Ae,specularIntensityMap:Fe,transmission:G,transmissionMap:$e,thicknessMap:O,gradientMap:le,opaque:b.transparent===!1&&b.blending===vc&&b.alphaToCoverage===!1,alphaMap:K,alphaTest:ue,alphaHash:me,combine:b.combine,mapUv:Xe&&g(b.map.channel),aoMapUv:st&&g(b.aoMap.channel),lightMapUv:_t&&g(b.lightMap.channel),bumpMapUv:oe&&g(b.bumpMap.channel),normalMapUv:je&&g(b.normalMap.channel),displacementMapUv:Rt&&g(b.displacementMap.channel),emissiveMapUv:Pt&&g(b.emissiveMap.channel),metalnessMapUv:Ft&&g(b.metalnessMap.channel),roughnessMapUv:qt&&g(b.roughnessMap.channel),anisotropyMapUv:Y&&g(b.anisotropyMap.channel),clearcoatMapUv:ie&&g(b.clearcoatMap.channel),clearcoatNormalMapUv:se&&g(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Z&&g(b.clearcoatRoughnessMap.channel),iridescenceMapUv:ee&&g(b.iridescenceMap.channel),iridescenceThicknessMapUv:ae&&g(b.iridescenceThicknessMap.channel),sheenColorMapUv:De&&g(b.sheenColorMap.channel),sheenRoughnessMapUv:de&&g(b.sheenRoughnessMap.channel),specularMapUv:ce&&g(b.specularMap.channel),specularColorMapUv:Ae&&g(b.specularColorMap.channel),specularIntensityMapUv:Fe&&g(b.specularIntensityMap.channel),transmissionMapUv:$e&&g(b.transmissionMap.channel),thicknessMapUv:O&&g(b.thicknessMap.channel),alphaMapUv:K&&g(b.alphaMap.channel),vertexTangents:!!B.attributes.tangent&&(je||L),vertexNormals:!!B.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!B.attributes.uv&&(Xe||K),fog:!!P,useFog:b.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||B.attributes.normal===void 0&&je===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ve,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:B.attributes.position!==void 0,morphTargets:B.morphAttributes.position!==void 0,morphNormals:B.morphAttributes.normal!==void 0,morphColors:B.morphAttributes.color!==void 0,morphTargetsCount:he,morphTextureStride:we,numSunLights:C.sun.length,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numSunLightShadows:C.sunShadowMap.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numLightProbeGrids:k.length,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:n.shadowMap.enabled&&A.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ie,decodeVideoTexture:Xe&&b.map.isVideoTexture===!0&&it.getTransfer(b.map.colorSpace)===pt,decodeVideoTextureEmissive:Pt&&b.emissiveMap.isVideoTexture===!0&&it.getTransfer(b.emissiveMap.colorSpace)===pt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Ht,flipSided:b.side===zn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:ne&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ne&&b.extensions.multiDraw===!0||ge)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Ce.vertexUv1s=c.has(1),Ce.vertexUv2s=c.has(2),Ce.vertexUv3s=c.has(3),c.clear(),Ce}function p(b){let C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(let A in b.defines)C.push(A),C.push(b.defines[A]);return b.isRawShaderMaterial===!1&&(m(C,b),x(C,b),C.push(n.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function m(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numSunLights),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numSunLightShadows),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function x(b,C){s.disableAll(),C.instancing&&s.enable(0),C.instancingColor&&s.enable(1),C.instancingMorph&&s.enable(2),C.matcap&&s.enable(3),C.envMap&&s.enable(4),C.normalMapObjectSpace&&s.enable(5),C.normalMapTangentSpace&&s.enable(6),C.clearcoat&&s.enable(7),C.iridescence&&s.enable(8),C.alphaTest&&s.enable(9),C.vertexColors&&s.enable(10),C.vertexAlphas&&s.enable(11),C.vertexUv1s&&s.enable(12),C.vertexUv2s&&s.enable(13),C.vertexUv3s&&s.enable(14),C.vertexTangents&&s.enable(15),C.anisotropy&&s.enable(16),C.alphaHash&&s.enable(17),C.batching&&s.enable(18),C.dispersion&&s.enable(19),C.retroreflection&&s.enable(24),C.batchingColor&&s.enable(20),C.gradientMap&&s.enable(21),C.packedNormalMap&&s.enable(22),C.vertexNormals&&s.enable(23),b.push(s.mask),s.disableAll(),C.fog&&s.enable(0),C.useFog&&s.enable(1),C.flatShading&&s.enable(2),C.logarithmicDepthBuffer&&s.enable(3),C.reversedDepthBuffer&&s.enable(4),C.skinning&&s.enable(5),C.morphTargets&&s.enable(6),C.morphNormals&&s.enable(7),C.morphColors&&s.enable(8),C.premultipliedAlpha&&s.enable(9),C.shadowMapEnabled&&s.enable(10),C.doubleSided&&s.enable(11),C.flipSided&&s.enable(12),C.useDepthPacking&&s.enable(13),C.dithering&&s.enable(14),C.transmission&&s.enable(15),C.sheen&&s.enable(16),C.opaque&&s.enable(17),C.pointsUvs&&s.enable(18),C.decodeVideoTexture&&s.enable(19),C.decodeVideoTextureEmissive&&s.enable(20),C.alphaToCoverage&&s.enable(21),C.numLightProbeGrids>0&&s.enable(22),C.hasPositionAttribute&&s.enable(23),b.push(s.mask)}function E(b){let C=h[b.type],A;if(C){let N=Gn[C];A=id.clone(N.uniforms)}else A=b.uniforms;return A}function _(b,C){let A=u.get(C);return A!==void 0?++A.usedTimes:(A=new Zj(n,C,b,r),l.push(A),u.set(C,A)),A}function M(b){if(--b.usedTimes===0){let C=l.indexOf(b);l[C]=l[l.length-1],l.pop(),u.delete(b.cacheKey),b.destroy()}}function w(b){a.remove(b)}function D(){a.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:E,acquireProgram:_,releaseProgram:M,releaseShaderCache:w,programs:l,dispose:D}}function e5(){let n=new WeakMap;function e(s){return n.has(s)}function t(s){let a=n.get(s);return a===void 0&&(a={},n.set(s,a)),a}function i(s){n.delete(s)}function r(s,a,c){n.get(s)[a]=c}function o(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:o}}function t5(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function U1(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function B1(){let n=[],e=0,t=[],i=[],r=[];function o(){e=0,t.length=0,i.length=0,r.length=0}function s(f){let h=0;return f.isInstancedMesh&&(h+=2),f.isSkinnedMesh&&(h+=1),h}function a(f,h,g,y,p,m){let x=n[e];return x===void 0?(x={id:f.id,object:f,geometry:h,material:g,materialVariant:s(f),groupOrder:y,renderOrder:f.renderOrder,z:p,group:m},n[e]=x):(x.id=f.id,x.object=f,x.geometry=h,x.material=g,x.materialVariant=s(f),x.groupOrder=y,x.renderOrder=f.renderOrder,x.z=p,x.group=m),e++,x}function c(f,h,g,y,p,m,x){x.reversedDepth===!0&&(p=-p);let E=a(f,h,g,y,p,m);g.transmission>0?i.push(E):g.transparent===!0?r.push(E):t.push(E)}function l(f,h,g,y,p,m){let x=a(f,h,g,y,p,m);g.transmission>0?i.unshift(x):g.transparent===!0?r.unshift(x):t.unshift(x)}function u(f,h){t.length>1&&t.sort(f||t5),i.length>1&&i.sort(h||U1),r.length>1&&r.sort(h||U1)}function d(){for(let f=e,h=n.length;f<h;f++){let g=n[f];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:i,transparent:r,init:o,push:c,unshift:l,finish:d,sort:u}}function n5(){let n=new WeakMap;function e(i,r){let o=n.get(i),s;return o===void 0?(s=new B1,n.set(i,[s])):r>=o.length?(s=new B1,o.push(s)):s=o[r],s}function t(){n=new WeakMap}return{get:e,dispose:t}}function i5(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new R,color:new rt};break;case"SpotLight":t={position:new R,direction:new R,color:new rt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new R,color:new rt,distance:0,decay:0};break;case"HemisphereLight":t={direction:new R,skyColor:new rt,groundColor:new rt};break;case"RectAreaLight":t={color:new rt,position:new R,halfWidth:new R,halfHeight:new R};break}return n[e.id]=t,t}}}function r5(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ye,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var o5=0;function s5(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function a5(n){let e=new i5,t=r5(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new R);let r=new R,o=new Nt,s=new Nt;function a(l){let u=0,d=0,f=0;for(let I=0;I<9;I++)i.probe[I].set(0,0,0);let h=0,g=0,y=0,p=0,m=0,x=0,E=0,_=0,M=0,w=0,D=0,b=0,C=0,A=0;l.sort(s5);for(let I=0,k=l.length;I<k;I++){let P=l[I],B=P.color,X=P.intensity,V=P.distance,te=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Uo?te=P.shadow.map.texture:te=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)u+=B.r*X,d+=B.g*X,f+=B.b*X;else if(P.isLightProbe){for(let j=0;j<9;j++)i.probe[j].addScaledVector(P.sh.coefficients[j],X);A++}else if(P.isSunLight){let j=e.get(P);if(j.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let q=P.shadow,J=t.get(P);J.shadowIntensity=q.intensity,J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),i.sunShadow[g]=J,i.sunShadowMap[g]=te;let he=q.getViewportCount();for(let we=0;we<he;we++)i.sunShadowMatrix[y+we]=q.getMatrix(we),i.sunShadowCascade[y+we]=q._cascadeData[we];y+=he,g++}i.sun[h]=j,h++}else if(P.isDirectionalLight){let j=e.get(P);if(j.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let q=P.shadow,J=t.get(P);J.shadowIntensity=q.intensity,J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,i.directionalShadow[p]=J,i.directionalShadowMap[p]=te,i.directionalShadowMatrix[p]=P.shadow.matrix,M++}i.directional[p]=j,p++}else if(P.isSpotLight){let j=e.get(P);j.position.setFromMatrixPosition(P.matrixWorld),j.color.copy(B).multiplyScalar(X),j.distance=V,j.coneCos=Math.cos(P.angle),j.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),j.decay=P.decay,i.spot[x]=j;let q=P.shadow;if(P.map&&(i.spotLightMap[b]=P.map,b++,q.updateMatrices(P),P.castShadow&&C++),i.spotLightMatrix[x]=q.matrix,P.castShadow){let J=t.get(P);J.shadowIntensity=q.intensity,J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,i.spotShadow[x]=J,i.spotShadowMap[x]=te,D++}x++}else if(P.isRectAreaLight){let j=e.get(P);j.color.copy(B).multiplyScalar(X),j.halfWidth.set(P.width*.5,0,0),j.halfHeight.set(0,P.height*.5,0),i.rectArea[E]=j,E++}else if(P.isPointLight){let j=e.get(P);if(j.color.copy(P.color).multiplyScalar(P.intensity),j.distance=P.distance,j.decay=P.decay,P.castShadow){let q=P.shadow,J=t.get(P);J.shadowIntensity=q.intensity,J.shadowBias=q.bias,J.shadowNormalBias=q.normalBias,J.shadowRadius=q.radius,J.shadowMapSize=q.mapSize,J.shadowCameraNear=q.camera.near,J.shadowCameraFar=q.camera.far,i.pointShadow[m]=J,i.pointShadowMap[m]=te,i.pointShadowMatrix[m]=P.shadow.matrix,w++}i.point[m]=j,m++}else if(P.isHemisphereLight){let j=e.get(P);j.skyColor.copy(P.color).multiplyScalar(X),j.groundColor.copy(P.groundColor).multiplyScalar(X),i.hemi[_]=j,_++}}E>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=re.LTC_FLOAT_1,i.rectAreaLTC2=re.LTC_FLOAT_2):(i.rectAreaLTC1=re.LTC_HALF_1,i.rectAreaLTC2=re.LTC_HALF_2)),i.ambient[0]=u,i.ambient[1]=d,i.ambient[2]=f;let N=i.hash;(N.sunLength!==h||N.directionalLength!==p||N.pointLength!==m||N.spotLength!==x||N.rectAreaLength!==E||N.hemiLength!==_||N.numSunShadows!==g||N.numDirectionalShadows!==M||N.numPointShadows!==w||N.numSpotShadows!==D||N.numSpotMaps!==b||N.numLightProbes!==A)&&(i.sun.length=h,i.directional.length=p,i.spot.length=x,i.rectArea.length=E,i.point.length=m,i.hemi.length=_,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.directionalShadowMatrix.length=M,i.pointShadow.length=w,i.pointShadowMap.length=w,i.pointShadowMatrix.length=w,i.spotShadow.length=D,i.spotShadowMap.length=D,i.spotLightMatrix.length=D+b-C,i.spotLightMap.length=b,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=A,N.sunLength=h,N.directionalLength=p,N.pointLength=m,N.spotLength=x,N.rectAreaLength=E,N.hemiLength=_,N.numSunShadows=g,N.numDirectionalShadows=M,N.numPointShadows=w,N.numSpotShadows=D,N.numSpotMaps=b,N.numLightProbes=A,i.version=o5++)}function c(l,u){let d=0,f=0,h=0,g=0,y=0,p=0,m=u.matrixWorldInverse;for(let x=0,E=l.length;x<E;x++){let _=l[x];if(_.isSunLight){let M=i.sun[d];M.direction.setFromMatrixPosition(_.matrixWorld),M.direction.transformDirection(m),d++}else if(_.isDirectionalLight){let M=i.directional[f];M.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),f++}else if(_.isSpotLight){let M=i.spot[g];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(_.matrixWorld),r.setFromMatrixPosition(_.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),g++}else if(_.isRectAreaLight){let M=i.rectArea[y];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(m),s.identity(),o.copy(_.matrixWorld),o.premultiply(m),s.extractRotation(o),M.halfWidth.set(_.width*.5,0,0),M.halfHeight.set(0,_.height*.5,0),M.halfWidth.applyMatrix4(s),M.halfHeight.applyMatrix4(s),y++}else if(_.isPointLight){let M=i.point[h];M.position.setFromMatrixPosition(_.matrixWorld),M.position.applyMatrix4(m),h++}else if(_.isHemisphereLight){let M=i.hemi[p];M.direction.setFromMatrixPosition(_.matrixWorld),M.direction.transformDirection(m),p++}}}return{setup:a,setupView:c,state:i}}function V1(n){let e=new a5(n),t=[],i=[],r=[];function o(f){d.camera=f,t.length=0,i.length=0,r.length=0}function s(f){t.push(f)}function a(f){i.push(f)}function c(f){r.push(f)}function l(){e.setup(t)}function u(f){e.setupView(t,f)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:r,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:o,state:d,setupLights:l,setupLightsView:u,pushLight:s,pushShadow:a,pushLightProbeGrid:c}}function c5(n){let e=new WeakMap;function t(r,o=0){let s=e.get(r),a;return s===void 0?(a=new V1(n),e.set(r,[a])):o>=s.length?(a=new V1(n),s.push(a)):a=s[o],a}function i(){e=new WeakMap}return{get:t,dispose:i}}var l5=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,u5=`uniform sampler2D shadow_pass;
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
}`,d5=[new R(1,0,0),new R(-1,0,0),new R(0,1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1)],f5=[new R(0,-1,0),new R(0,-1,0),new R(0,0,1),new R(0,0,-1),new R(0,-1,0),new R(0,-1,0)],H1=new Nt,od=new R,xb=new R;function h5(n,e,t){let i=new Du,r=new ye,o=new ye,s=new vt,a=new fm,c=new hm,l={},u=t.maxTextureSize,d={[pr]:zn,[zn]:pr,[Ht]:Ht},f=new Hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ye},radius:{value:4}},vertexShader:l5,fragmentShader:u5}),h=f.clone();h.defines.HORIZONTAL_PASS=1;let g=new Vn;g.setAttribute("position",new ri(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new mt(g,f),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Xu;let m=this.type;this.render=function(w,D,b){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||w.length===0)return;this.type===FI&&(Le("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Xu);let C=n.getRenderTarget(),A=n.getActiveCubeFace(),N=n.getActiveMipmapLevel(),I=n.state;I.setBlending(mr),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);let k=m!==this.type;k&&D.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(B=>B.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,B=w.length;P<B;P++){let X=w[P],V=X.shadow;if(V===void 0){Le("WebGLShadowMap:",X,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;r.copy(V.mapSize);let te=V.getFrameExtents();r.multiply(te),o.copy(V.mapSize),(r.x>u||r.y>u)&&(r.x>u&&(o.x=Math.floor(u/te.x),r.x=o.x*te.x,V.mapSize.x=o.x),r.y>u&&(o.y=Math.floor(u/te.y),r.y=o.y*te.y,V.mapSize.y=o.y));let j=n.state.buffers.depth.getReversed();if(V.camera._reversedDepth=j,V.map===null||k===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===yc){if(X.isPointLight){Le("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new Jn(r.x,r.y,{format:Uo,type:ji,minFilter:Jt,magFilter:Jt,generateMipmaps:!1}),V.map.texture.name=X.name+".shadowMap",V.map.depthTexture=new Ao(r.x,r.y,Gi),V.map.depthTexture.name=X.name+".shadowMapDepth",V.map.depthTexture.format=ur,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=$t,V.map.depthTexture.magFilter=$t}else X.isPointLight?(V.map=new pg(r.x),V.map.depthTexture=new rm(r.x,zi)):(V.map=new Jn(r.x,r.y),V.map.depthTexture=new Ao(r.x,r.y,zi)),V.map.depthTexture.name=X.name+".shadowMap",V.map.depthTexture.format=ur,this.type===Xu?(V.map.depthTexture.compareFunction=j?ug:lg,V.map.depthTexture.minFilter=Jt,V.map.depthTexture.magFilter=Jt):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=$t,V.map.depthTexture.magFilter=$t);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==r.x||V.map.height!==r.y)&&V.map.setSize(r.x,r.y);let q=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();X.isPointLight!==!0&&V.updateMatrices(X,b);for(let J=0;J<q;J++){let he=V.getCamera(J);if(X.isPointLight){let we=V.camera,dt=V.matrix,Ke=X.distance||we.far;Ke!==we.far&&(we.far=Ke,we.updateProjectionMatrix()),od.setFromMatrixPosition(X.matrixWorld),we.position.copy(od),xb.copy(we.position),xb.add(d5[J]),we.up.copy(f5[J]),we.lookAt(xb),we.updateMatrixWorld(),dt.makeTranslation(-od.x,-od.y,-od.z),H1.multiplyMatrices(we.projectionMatrix,we.matrixWorldInverse),V._frustum.setFromProjectionMatrix(H1,we.coordinateSystem,we.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)n.setRenderTarget(V.map,J),n.clear();else{J===0&&(n.setRenderTarget(V.map),n.clear());let we=V.getViewport(J);s.set(o.x*we.x,o.y*we.y,o.x*we.z,o.y*we.w),I.viewport(s)}i=V.getFrustum(J),_(D,b,he,X,this.type)}V.isPointLightShadow!==!0&&this.type===yc&&x(V,b),V.needsUpdate=!1}m=this.type,p.needsUpdate=!1,n.setRenderTarget(C,A,N)};function x(w,D){let b=e.update(y);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,h.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,h.needsUpdate=!0),w.mapPass===null?w.mapPass=new Jn(r.x,r.y,{format:Uo,type:ji}):(w.mapPass.width!==w.map.width||w.mapPass.height!==w.map.height)&&w.mapPass.setSize(w.map.width,w.map.height),f.uniforms.shadow_pass.value=w.map.depthTexture,f.uniforms.resolution.value.set(w.map.width,w.map.height),f.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(D,null,b,f,y,null),h.uniforms.shadow_pass.value=w.mapPass.texture,h.uniforms.resolution.value.set(w.map.width,w.map.height),h.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(D,null,b,h,y,null)}function E(w,D,b,C){let A=null,N=b.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(N!==void 0)A=N;else if(A=b.isPointLight===!0?c:a,n.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){let I=A.uuid,k=D.uuid,P=l[I];P===void 0&&(P={},l[I]=P);let B=P[k];B===void 0&&(B=A.clone(),P[k]=B,D.addEventListener("dispose",M)),A=B}if(A.visible=D.visible,A.wireframe=D.wireframe,C===yc?A.side=D.shadowSide!==null?D.shadowSide:D.side:A.side=D.shadowSide!==null?D.shadowSide:d[D.side],A.alphaMap=D.alphaMap,A.alphaTest=D.alphaToCoverage===!0?.5:D.alphaTest,A.map=D.map,A.clipShadows=D.clipShadows,A.clippingPlanes=D.clippingPlanes,A.clipIntersection=D.clipIntersection,A.displacementMap=D.displacementMap,A.displacementScale=D.displacementScale,A.displacementBias=D.displacementBias,A.wireframeLinewidth=D.wireframeLinewidth,A.linewidth=D.linewidth,b.isPointLight===!0&&A.isMeshDistanceMaterial===!0){let I=n.properties.get(A);I.light=b}return A}function _(w,D,b,C,A){if(w.visible===!1)return;if(w.layers.test(D.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&A===yc)&&(!w.frustumCulled||w.intersectsFrustum(i))){w.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,w.matrixWorld);let k=e.update(w),P=w.material;if(Array.isArray(P)){let B=k.groups;for(let X=0,V=B.length;X<V;X++){let te=B[X],j=P[te.materialIndex];if(j&&j.visible){let q=E(w,j,C,A);w.onBeforeShadow(n,w,D,b,k,q,te),n.renderBufferDirect(b,null,k,q,w,te),w.onAfterShadow(n,w,D,b,k,q,te)}}}else if(P.visible){let B=E(w,P,C,A);w.onBeforeShadow(n,w,D,b,k,B,null),n.renderBufferDirect(b,null,k,B,w,null),w.onAfterShadow(n,w,D,b,k,B,null)}}let I=w.children;for(let k=0,P=I.length;k<P;k++)_(I[k],D,b,C,A)}function M(w){w.target.removeEventListener("dispose",M);for(let b in l){let C=l[b],A=w.target.uuid;A in C&&(C[A].dispose(),delete C[A])}}}function p5(n,e){function t(){let O=!1,le=new vt,K=null,ue=new vt(0,0,0,0);return{setMask:function(me){K!==me&&!O&&(n.colorMask(me,me,me,me),K=me)},setLocked:function(me){O=me},setClear:function(me,ne,Ie,Ce,wt){wt===!0&&(me*=Ce,ne*=Ce,Ie*=Ce),le.set(me,ne,Ie,Ce),ue.equals(le)===!1&&(n.clearColor(me,ne,Ie,Ce),ue.copy(le))},reset:function(){O=!1,K=null,ue.set(-1,0,0,0)}}}function i(){let O=!1,le=!1,K=null,ue=null,me=null;return{setReversed:function(ne){if(le!==ne){let Ie=e.get("EXT_clip_control");ne?Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.ZERO_TO_ONE_EXT):Ie.clipControlEXT(Ie.LOWER_LEFT_EXT,Ie.NEGATIVE_ONE_TO_ONE_EXT),le=ne;let Ce=me;me=null,this.setClear(Ce)}},getReversed:function(){return le},setTest:function(ne){ne?Q(n.DEPTH_TEST):ve(n.DEPTH_TEST)},setMask:function(ne){K!==ne&&!O&&(n.depthMask(ne),K=ne)},setFunc:function(ne){if(le&&(ne=p1[ne]),ue!==ne){switch(ne){case zp:n.depthFunc(n.NEVER);break;case Gp:n.depthFunc(n.ALWAYS);break;case jp:n.depthFunc(n.LESS);break;case lc:n.depthFunc(n.LEQUAL);break;case Wp:n.depthFunc(n.EQUAL);break;case $p:n.depthFunc(n.GEQUAL);break;case qp:n.depthFunc(n.GREATER);break;case Xp:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ue=ne}},setLocked:function(ne){O=ne},setClear:function(ne){me!==ne&&(me=ne,le&&(ne=1-ne),n.clearDepth(ne))},reset:function(){O=!1,K=null,ue=null,me=null,le=!1}}}function r(){let O=!1,le=null,K=null,ue=null,me=null,ne=null,Ie=null,Ce=null,wt=null;return{setTest:function(ft){O||(ft?Q(n.STENCIL_TEST):ve(n.STENCIL_TEST))},setMask:function(ft){le!==ft&&!O&&(n.stencilMask(ft),le=ft)},setFunc:function(ft,Si,Wi){(K!==ft||ue!==Si||me!==Wi)&&(n.stencilFunc(ft,Si,Wi),K=ft,ue=Si,me=Wi)},setOp:function(ft,Si,Wi){(ne!==ft||Ie!==Si||Ce!==Wi)&&(n.stencilOp(ft,Si,Wi),ne=ft,Ie=Si,Ce=Wi)},setLocked:function(ft){O=ft},setClear:function(ft){wt!==ft&&(n.clearStencil(ft),wt=ft)},reset:function(){O=!1,le=null,K=null,ue=null,me=null,ne=null,Ie=null,Ce=null,wt=null}}}let o=new t,s=new i,a=new r,c=new WeakMap,l=new WeakMap,u={},d={},f={},h=new WeakMap,g=[],y=null,p=!1,m=null,x=null,E=null,_=null,M=null,w=null,D=null,b=new rt(0,0,0),C=0,A=!1,N=null,I=null,k=null,P=null,B=null,X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,te=0,j=n.getParameter(n.VERSION);j.indexOf("WebGL")!==-1?(te=parseFloat(/^WebGL (\d)/.exec(j)[1]),V=te>=1):j.indexOf("OpenGL ES")!==-1&&(te=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),V=te>=2);let q=null,J={},he=n.getParameter(n.SCISSOR_BOX),we=n.getParameter(n.VIEWPORT),dt=new vt().fromArray(he),Ke=new vt().fromArray(we);function et(O,le,K,ue){let me=new Uint8Array(4),ne=n.createTexture();n.bindTexture(O,ne),n.texParameteri(O,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(O,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ie=0;Ie<K;Ie++)O===n.TEXTURE_3D||O===n.TEXTURE_2D_ARRAY?n.texImage3D(le,0,n.RGBA,1,1,ue,0,n.RGBA,n.UNSIGNED_BYTE,me):n.texImage2D(le+Ie,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,me);return ne}let $={};$[n.TEXTURE_2D]=et(n.TEXTURE_2D,n.TEXTURE_2D,1),$[n.TEXTURE_CUBE_MAP]=et(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[n.TEXTURE_2D_ARRAY]=et(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),$[n.TEXTURE_3D]=et(n.TEXTURE_3D,n.TEXTURE_3D,1,1),o.setClear(0,0,0,1),s.setClear(1),a.setClear(0),Q(n.DEPTH_TEST),s.setFunc(lc),oe(!1),je(Ux),Q(n.CULL_FACE),st(mr);function Q(O){u[O]!==!0&&(n.enable(O),u[O]=!0)}function ve(O){u[O]!==!1&&(n.disable(O),u[O]=!1)}function ke(O,le){return f[O]!==le?(n.bindFramebuffer(O,le),f[O]=le,O===n.DRAW_FRAMEBUFFER&&(f[n.FRAMEBUFFER]=le),O===n.FRAMEBUFFER&&(f[n.DRAW_FRAMEBUFFER]=le),!0):!1}function ge(O,le){let K=g,ue=!1;if(O){K=h.get(le),K===void 0&&(K=[],h.set(le,K));let me=O.textures;if(K.length!==me.length||K[0]!==n.COLOR_ATTACHMENT0){for(let ne=0,Ie=me.length;ne<Ie;ne++)K[ne]=n.COLOR_ATTACHMENT0+ne;K.length=me.length,ue=!0}}else K[0]!==n.BACK&&(K[0]=n.BACK,ue=!0);ue&&n.drawBuffers(K)}function Xe(O){return y!==O?(n.useProgram(O),y=O,!0):!1}let St={[Ps]:n.FUNC_ADD,[LI]:n.FUNC_SUBTRACT,[kI]:n.FUNC_REVERSE_SUBTRACT};St[UI]=n.MIN,St[BI]=n.MAX;let Ye={[VI]:n.ZERO,[HI]:n.ONE,[zI]:n.SRC_COLOR,[zx]:n.SRC_ALPHA,[XI]:n.SRC_ALPHA_SATURATE,[$I]:n.DST_COLOR,[jI]:n.DST_ALPHA,[GI]:n.ONE_MINUS_SRC_COLOR,[Gx]:n.ONE_MINUS_SRC_ALPHA,[qI]:n.ONE_MINUS_DST_COLOR,[WI]:n.ONE_MINUS_DST_ALPHA,[YI]:n.CONSTANT_COLOR,[ZI]:n.ONE_MINUS_CONSTANT_COLOR,[JI]:n.CONSTANT_ALPHA,[KI]:n.ONE_MINUS_CONSTANT_ALPHA};function st(O,le,K,ue,me,ne,Ie,Ce,wt,ft){if(O===mr){p===!0&&(ve(n.BLEND),p=!1);return}if(p===!1&&(Q(n.BLEND),p=!0),O!==OI){if(O!==m||ft!==A){if((x!==Ps||M!==Ps)&&(n.blendEquation(n.FUNC_ADD),x=Ps,M=Ps),ft)switch(O){case vc:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Bx:n.blendFunc(n.ONE,n.ONE);break;case Vx:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Hx:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Be("WebGLState: Invalid blending: ",O);break}else switch(O){case vc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Bx:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Vx:Be("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Hx:Be("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Be("WebGLState: Invalid blending: ",O);break}E=null,_=null,w=null,D=null,b.set(0,0,0),C=0,m=O,A=ft}return}me=me||le,ne=ne||K,Ie=Ie||ue,(le!==x||me!==M)&&(n.blendEquationSeparate(St[le],St[me]),x=le,M=me),(K!==E||ue!==_||ne!==w||Ie!==D)&&(n.blendFuncSeparate(Ye[K],Ye[ue],Ye[ne],Ye[Ie]),E=K,_=ue,w=ne,D=Ie),(Ce.equals(b)===!1||wt!==C)&&(n.blendColor(Ce.r,Ce.g,Ce.b,wt),b.copy(Ce),C=wt),m=O,A=!1}function _t(O,le){O.side===Ht?ve(n.CULL_FACE):Q(n.CULL_FACE);let K=O.side===zn;le&&(K=!K),oe(K),O.blending===vc&&O.transparent===!1?st(mr):st(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),s.setFunc(O.depthFunc),s.setTest(O.depthTest),s.setMask(O.depthWrite),o.setMask(O.colorWrite);let ue=O.stencilWrite;a.setTest(ue),ue&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Pt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?Q(n.SAMPLE_ALPHA_TO_COVERAGE):ve(n.SAMPLE_ALPHA_TO_COVERAGE)}function oe(O){N!==O&&(O?n.frontFace(n.CW):n.frontFace(n.CCW),N=O)}function je(O){O!==NI?(Q(n.CULL_FACE),O!==I&&(O===Ux?n.cullFace(n.BACK):O===PI?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ve(n.CULL_FACE),I=O}function Rt(O){O!==k&&(V&&n.lineWidth(O),k=O)}function Pt(O,le,K){O?(Q(n.POLYGON_OFFSET_FILL),(P!==le||B!==K)&&(P=le,B=K,s.getReversed()&&(le=-le),n.polygonOffset(le,K))):ve(n.POLYGON_OFFSET_FILL)}function Ft(O){O?Q(n.SCISSOR_TEST):ve(n.SCISSOR_TEST)}function qt(O){O===void 0&&(O=n.TEXTURE0+X-1),q!==O&&(n.activeTexture(O),q=O)}function L(O,le,K){K===void 0&&(q===null?K=n.TEXTURE0+X-1:K=q);let ue=J[K];ue===void 0&&(ue={type:void 0,texture:void 0},J[K]=ue),(ue.type!==O||ue.texture!==le)&&(q!==K&&(n.activeTexture(K),q=K),n.bindTexture(O,le||$[O]),ue.type=O,ue.texture=le)}function pn(){let O=J[q];O!==void 0&&O.type!==void 0&&(n.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function gt(){try{n.compressedTexImage2D(...arguments)}catch(O){Be("WebGLState:",O)}}function T(){try{n.compressedTexImage3D(...arguments)}catch(O){Be("WebGLState:",O)}}function v(){try{n.texSubImage2D(...arguments)}catch(O){Be("WebGLState:",O)}}function U(){try{n.texSubImage3D(...arguments)}catch(O){Be("WebGLState:",O)}}function G(){try{n.compressedTexSubImage2D(...arguments)}catch(O){Be("WebGLState:",O)}}function Y(){try{n.compressedTexSubImage3D(...arguments)}catch(O){Be("WebGLState:",O)}}function ie(){try{n.texStorage2D(...arguments)}catch(O){Be("WebGLState:",O)}}function se(){try{n.texStorage3D(...arguments)}catch(O){Be("WebGLState:",O)}}function Z(){try{n.texImage2D(...arguments)}catch(O){Be("WebGLState:",O)}}function ee(){try{n.texImage3D(...arguments)}catch(O){Be("WebGLState:",O)}}function ae(O){return d[O]!==void 0?d[O]:n.getParameter(O)}function De(O,le){d[O]!==le&&(n.pixelStorei(O,le),d[O]=le)}function de(O){dt.equals(O)===!1&&(n.scissor(O.x,O.y,O.z,O.w),dt.copy(O))}function ce(O){Ke.equals(O)===!1&&(n.viewport(O.x,O.y,O.z,O.w),Ke.copy(O))}function Ae(O,le){let K=l.get(le);K===void 0&&(K=new WeakMap,l.set(le,K));let ue=K.get(O);ue===void 0&&(ue=n.getUniformBlockIndex(le,O.name),K.set(O,ue))}function Fe(O,le){let ue=l.get(le).get(O);c.get(le)!==ue&&(n.uniformBlockBinding(le,ue,O.__bindingPointIndex),c.set(le,ue))}function $e(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),s.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),u={},d={},q=null,J={},f={},h=new WeakMap,g=[],y=null,p=!1,m=null,x=null,E=null,_=null,M=null,w=null,D=null,b=new rt(0,0,0),C=0,A=!1,N=null,I=null,k=null,P=null,B=null,dt.set(0,0,n.canvas.width,n.canvas.height),Ke.set(0,0,n.canvas.width,n.canvas.height),o.reset(),s.reset(),a.reset()}return{buffers:{color:o,depth:s,stencil:a},enable:Q,disable:ve,bindFramebuffer:ke,drawBuffers:ge,useProgram:Xe,setBlending:st,setMaterial:_t,setFlipSided:oe,setCullFace:je,setLineWidth:Rt,setPolygonOffset:Pt,setScissorTest:Ft,activeTexture:qt,bindTexture:L,unbindTexture:pn,compressedTexImage2D:gt,compressedTexImage3D:T,texImage2D:Z,texImage3D:ee,pixelStorei:De,getParameter:ae,updateUBOMapping:Ae,uniformBlockBinding:Fe,texStorage2D:ie,texStorage3D:se,texSubImage2D:v,texSubImage3D:U,compressedTexSubImage2D:G,compressedTexSubImage3D:Y,scissor:de,viewport:ce,reset:$e}}function m5(n,e,t,i,r,o,s){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new ye,u=new WeakMap,d=new Set,f,h=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch(T){}function y(T,v){return g?new OffscreenCanvas(T,v):bu("canvas")}function p(T,v,U){let G=1,Y=gt(T);if((Y.width>U||Y.height>U)&&(G=U/Math.max(Y.width,Y.height)),G<1)if(typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&T instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&T instanceof ImageBitmap||typeof VideoFrame<"u"&&T instanceof VideoFrame){let ie=Math.floor(G*Y.width),se=Math.floor(G*Y.height);f===void 0&&(f=y(ie,se));let Z=v?y(ie,se):f;return Z.width=ie,Z.height=se,Z.getContext("2d").drawImage(T,0,0,ie,se),Le("WebGLRenderer: Texture has been resized from ("+Y.width+"x"+Y.height+") to ("+ie+"x"+se+")."),Z}else return"data"in T&&Le("WebGLRenderer: Image in DataTexture is too big ("+Y.width+"x"+Y.height+")."),T;return T}function m(T){return T.generateMipmaps}function x(T){n.generateMipmap(T)}function E(T){return T.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:T.isWebGL3DRenderTarget?n.TEXTURE_3D:T.isWebGLArrayRenderTarget||T.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function _(T,v,U,G,Y,ie=!1){if(T!==null){if(n[T]!==void 0)return n[T];Le("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+T+"'")}let se;G&&(se=e.get("EXT_texture_norm16"),se||Le("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Z=v;if(v===n.RED&&(U===n.FLOAT&&(Z=n.R32F),U===n.HALF_FLOAT&&(Z=n.R16F),U===n.UNSIGNED_BYTE&&(Z=n.R8),U===n.UNSIGNED_SHORT&&se&&(Z=se.R16_EXT),U===n.SHORT&&se&&(Z=se.R16_SNORM_EXT)),v===n.RED_INTEGER&&(U===n.UNSIGNED_BYTE&&(Z=n.R8UI),U===n.UNSIGNED_SHORT&&(Z=n.R16UI),U===n.UNSIGNED_INT&&(Z=n.R32UI),U===n.BYTE&&(Z=n.R8I),U===n.SHORT&&(Z=n.R16I),U===n.INT&&(Z=n.R32I)),v===n.RG&&(U===n.FLOAT&&(Z=n.RG32F),U===n.HALF_FLOAT&&(Z=n.RG16F),U===n.UNSIGNED_BYTE&&(Z=n.RG8),U===n.UNSIGNED_SHORT&&se&&(Z=se.RG16_EXT),U===n.SHORT&&se&&(Z=se.RG16_SNORM_EXT)),v===n.RG_INTEGER&&(U===n.UNSIGNED_BYTE&&(Z=n.RG8UI),U===n.UNSIGNED_SHORT&&(Z=n.RG16UI),U===n.UNSIGNED_INT&&(Z=n.RG32UI),U===n.BYTE&&(Z=n.RG8I),U===n.SHORT&&(Z=n.RG16I),U===n.INT&&(Z=n.RG32I)),v===n.RGB_INTEGER&&(U===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),U===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),U===n.UNSIGNED_INT&&(Z=n.RGB32UI),U===n.BYTE&&(Z=n.RGB8I),U===n.SHORT&&(Z=n.RGB16I),U===n.INT&&(Z=n.RGB32I)),v===n.RGBA_INTEGER&&(U===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),U===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),U===n.UNSIGNED_INT&&(Z=n.RGBA32UI),U===n.BYTE&&(Z=n.RGBA8I),U===n.SHORT&&(Z=n.RGBA16I),U===n.INT&&(Z=n.RGBA32I)),v===n.RGB&&(U===n.UNSIGNED_SHORT&&se&&(Z=se.RGB16_EXT),U===n.SHORT&&se&&(Z=se.RGB16_SNORM_EXT),U===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),U===n.UNSIGNED_INT_10F_11F_11F_REV&&(Z=n.R11F_G11F_B10F)),v===n.RGBA){let ee=ie?_u:it.getTransfer(Y);U===n.FLOAT&&(Z=n.RGBA32F),U===n.HALF_FLOAT&&(Z=n.RGBA16F),U===n.UNSIGNED_BYTE&&(Z=ee===pt?n.SRGB8_ALPHA8:n.RGBA8),U===n.UNSIGNED_SHORT&&se&&(Z=se.RGBA16_EXT),U===n.SHORT&&se&&(Z=se.RGBA16_SNORM_EXT),U===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),U===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function M(T,v){let U;return T?v===null||v===zi||v===xc?U=n.DEPTH24_STENCIL8:v===Gi?U=n.DEPTH32F_STENCIL8:v===_c&&(U=n.DEPTH24_STENCIL8,Le("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===zi||v===xc?U=n.DEPTH_COMPONENT24:v===Gi?U=n.DEPTH_COMPONENT32F:v===_c&&(U=n.DEPTH_COMPONENT16),U}function w(T,v){return m(T)===!0||T.isFramebufferTexture&&T.minFilter!==$t&&T.minFilter!==Jt?Math.log2(Math.max(v.width,v.height))+1:T.mipmaps!==void 0&&T.mipmaps.length>0?T.mipmaps.length:T.isCompressedTexture&&Array.isArray(T.image)?v.mipmaps.length:1}function D(T){let v=T.target;v.removeEventListener("dispose",D),C(v),v.isVideoTexture&&u.delete(v),v.isHTMLTexture&&d.delete(v)}function b(T){let v=T.target;v.removeEventListener("dispose",b),N(v)}function C(T){let v=i.get(T);if(v.__webglInit===void 0)return;let U=T.source,G=h.get(U);if(G){let Y=G[v.__cacheKey];Y.usedTimes--,Y.usedTimes===0&&A(T),Object.keys(G).length===0&&h.delete(U)}i.remove(T)}function A(T){let v=i.get(T);n.deleteTexture(v.__webglTexture);let U=T.source,G=h.get(U);delete G[v.__cacheKey],s.memory.textures--}function N(T){let v=i.get(T);if(T.depthTexture&&(T.depthTexture.dispose(),i.remove(T.depthTexture)),T.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(v.__webglFramebuffer[G]))for(let Y=0;Y<v.__webglFramebuffer[G].length;Y++)n.deleteFramebuffer(v.__webglFramebuffer[G][Y]);else n.deleteFramebuffer(v.__webglFramebuffer[G]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[G])}else{if(Array.isArray(v.__webglFramebuffer))for(let G=0;G<v.__webglFramebuffer.length;G++)n.deleteFramebuffer(v.__webglFramebuffer[G]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let G=0;G<v.__webglColorRenderbuffer.length;G++)v.__webglColorRenderbuffer[G]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[G]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let U=T.textures;for(let G=0,Y=U.length;G<Y;G++){let ie=i.get(U[G]);ie.__webglTexture&&(n.deleteTexture(ie.__webglTexture),s.memory.textures--),i.remove(U[G])}i.remove(T)}let I=0;function k(){I=0}function P(){return I}function B(T){I=T}function X(){let T=I;return T>=r.maxTextures&&Le("WebGLTextures: Trying to use "+(T+1)+" texture units while this GPU supports only "+r.maxTextures),I+=1,T}function V(T){let v=[];return v.push(T.wrapS),v.push(T.wrapT),v.push(T.wrapR||0),v.push(T.magFilter),v.push(T.minFilter),v.push(T.anisotropy),v.push(T.internalFormat),v.push(T.format),v.push(T.type),v.push(T.generateMipmaps),v.push(T.premultiplyAlpha),v.push(T.flipY),v.push(T.unpackAlignment),v.push(T.colorSpace),v.join()}function te(T,v){let U=i.get(T);if(T.isVideoTexture&&L(T),T.isRenderTargetTexture===!1&&T.isExternalTexture!==!0&&T.version>0&&U.__version!==T.version){let G=T.image;if(G===null)Le("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Le("WebGLRenderer: Texture marked for update but image is incomplete");else{ve(U,T,v);return}}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,U.__webglTexture,n.TEXTURE0+v)}function j(T,v){let U=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){ve(U,T,v);return}else T.isExternalTexture&&(U.__webglTexture=T.sourceTexture?T.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,U.__webglTexture,n.TEXTURE0+v)}function q(T,v){let U=i.get(T);if(T.isRenderTargetTexture===!1&&T.version>0&&U.__version!==T.version){ve(U,T,v);return}t.bindTexture(n.TEXTURE_3D,U.__webglTexture,n.TEXTURE0+v)}function J(T,v){let U=i.get(T);if(T.isCubeDepthTexture!==!0&&T.version>0&&U.__version!==T.version){ke(U,T,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,U.__webglTexture,n.TEXTURE0+v)}let he={[Yp]:n.REPEAT,[cr]:n.CLAMP_TO_EDGE,[Zp]:n.MIRRORED_REPEAT},we={[$t]:n.NEAREST,[t1]:n.NEAREST_MIPMAP_NEAREST,[Zu]:n.NEAREST_MIPMAP_LINEAR,[Jt]:n.LINEAR,[Cm]:n.LINEAR_MIPMAP_NEAREST,[Lo]:n.LINEAR_MIPMAP_LINEAR},dt={[o1]:n.NEVER,[u1]:n.ALWAYS,[s1]:n.LESS,[lg]:n.LEQUAL,[a1]:n.EQUAL,[ug]:n.GEQUAL,[c1]:n.GREATER,[l1]:n.NOTEQUAL};function Ke(T,v){if(v.type===Gi&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===Jt||v.magFilter===Cm||v.magFilter===Zu||v.magFilter===Lo||v.minFilter===Jt||v.minFilter===Cm||v.minFilter===Zu||v.minFilter===Lo)&&Le("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(T,n.TEXTURE_WRAP_S,he[v.wrapS]),n.texParameteri(T,n.TEXTURE_WRAP_T,he[v.wrapT]),(T===n.TEXTURE_3D||T===n.TEXTURE_2D_ARRAY)&&n.texParameteri(T,n.TEXTURE_WRAP_R,he[v.wrapR]),n.texParameteri(T,n.TEXTURE_MAG_FILTER,we[v.magFilter]),n.texParameteri(T,n.TEXTURE_MIN_FILTER,we[v.minFilter]),v.compareFunction&&(n.texParameteri(T,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(T,n.TEXTURE_COMPARE_FUNC,dt[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===$t||v.minFilter!==Zu&&v.minFilter!==Lo||v.type===Gi&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let U=e.get("EXT_texture_filter_anisotropic");n.texParameterf(T,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,r.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function et(T,v){let U=!1;T.__webglInit===void 0&&(T.__webglInit=!0,v.addEventListener("dispose",D));let G=v.source,Y=h.get(G);Y===void 0&&(Y={},h.set(G,Y));let ie=V(v);if(ie!==T.__cacheKey){Y[ie]===void 0&&(Y[ie]={texture:n.createTexture(),usedTimes:0},s.memory.textures++,U=!0),Y[ie].usedTimes++;let se=Y[T.__cacheKey];se!==void 0&&(Y[T.__cacheKey].usedTimes--,se.usedTimes===0&&A(v)),T.__cacheKey=ie,T.__webglTexture=Y[ie].texture}return U}function $(T,v,U){return Math.floor(Math.floor(T/U)/v)}function Q(T,v,U,G){let ie=T.updateRanges;if(ie.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,U,G,v.data);else{ie.sort((De,de)=>De.start-de.start);let se=0;for(let De=1;De<ie.length;De++){let de=ie[se],ce=ie[De],Ae=de.start+de.count,Fe=$(ce.start,v.width,4),$e=$(de.start,v.width,4);ce.start<=Ae+1&&Fe===$e&&$(ce.start+ce.count-1,v.width,4)===Fe?de.count=Math.max(de.count,ce.start+ce.count-de.start):(++se,ie[se]=ce)}ie.length=se+1;let Z=t.getParameter(n.UNPACK_ROW_LENGTH),ee=t.getParameter(n.UNPACK_SKIP_PIXELS),ae=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let De=0,de=ie.length;De<de;De++){let ce=ie[De],Ae=Math.floor(ce.start/4),Fe=Math.ceil(ce.count/4),$e=Ae%v.width,O=Math.floor(Ae/v.width),le=Fe,K=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,$e),t.pixelStorei(n.UNPACK_SKIP_ROWS,O),t.texSubImage2D(n.TEXTURE_2D,0,$e,O,le,K,U,G,v.data)}T.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,Z),t.pixelStorei(n.UNPACK_SKIP_PIXELS,ee),t.pixelStorei(n.UNPACK_SKIP_ROWS,ae)}}function ve(T,v,U){let G=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(G=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(G=n.TEXTURE_3D);let Y=et(T,v),ie=v.source;t.bindTexture(G,T.__webglTexture,n.TEXTURE0+U);let se=i.get(ie);if(ie.version!==se.__version||Y===!0){if(t.activeTexture(n.TEXTURE0+U),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let K=it.getPrimaries(it.workingColorSpace),ue=v.colorSpace===Gr?null:it.getPrimaries(v.colorSpace),me=v.colorSpace===Gr||K===ue?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,me)}t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment);let ee=p(v.image,!1,r.maxTextureSize);ee=pn(v,ee);let ae=o.convert(v.format,v.colorSpace),De=o.convert(v.type),de=_(v.internalFormat,ae,De,v.normalized,v.colorSpace,v.isVideoTexture);Ke(G,v);let ce,Ae=v.mipmaps,Fe=v.isVideoTexture!==!0,$e=se.__version===void 0||Y===!0,O=ie.dataReady,le=w(v,ee);if(v.isDepthTexture)de=M(v.format===ko,v.type),$e&&(Fe?t.texStorage2D(n.TEXTURE_2D,1,de,ee.width,ee.height):t.texImage2D(n.TEXTURE_2D,0,de,ee.width,ee.height,0,ae,De,null));else if(v.isDataTexture)if(Ae.length>0){Fe&&$e&&t.texStorage2D(n.TEXTURE_2D,le,de,Ae[0].width,Ae[0].height);for(let K=0,ue=Ae.length;K<ue;K++)ce=Ae[K],Fe?O&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,ce.width,ce.height,ae,De,ce.data):t.texImage2D(n.TEXTURE_2D,K,de,ce.width,ce.height,0,ae,De,ce.data);v.generateMipmaps=!1}else Fe?($e&&t.texStorage2D(n.TEXTURE_2D,le,de,ee.width,ee.height),O&&Q(v,ee,ae,De)):t.texImage2D(n.TEXTURE_2D,0,de,ee.width,ee.height,0,ae,De,ee.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){Fe&&$e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,le,de,Ae[0].width,Ae[0].height,ee.depth);for(let K=0,ue=Ae.length;K<ue;K++)if(ce=Ae[K],v.format!==xi)if(ae!==null)if(Fe){if(O)if(v.layerUpdates.size>0){let me=pb(ce.width,ce.height,v.format,v.type);for(let ne of v.layerUpdates){let Ie=ce.data.subarray(ne*me/ce.data.BYTES_PER_ELEMENT,(ne+1)*me/ce.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,ne,ce.width,ce.height,1,ae,Ie)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,0,ce.width,ce.height,ee.depth,ae,ce.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,K,de,ce.width,ce.height,ee.depth,0,ce.data,0,0);else Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Fe?O&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,K,0,0,0,ce.width,ce.height,ee.depth,ae,De,ce.data):t.texImage3D(n.TEXTURE_2D_ARRAY,K,de,ce.width,ce.height,ee.depth,0,ae,De,ce.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{Fe&&$e&&t.texStorage2D(n.TEXTURE_2D,le,de,Ae[0].width,Ae[0].height);for(let K=0,ue=Ae.length;K<ue;K++)ce=Ae[K],v.format!==xi?ae!==null?Fe?O&&t.compressedTexSubImage2D(n.TEXTURE_2D,K,0,0,ce.width,ce.height,ae,ce.data):t.compressedTexImage2D(n.TEXTURE_2D,K,de,ce.width,ce.height,0,ce.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Fe?O&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,ce.width,ce.height,ae,De,ce.data):t.texImage2D(n.TEXTURE_2D,K,de,ce.width,ce.height,0,ae,De,ce.data)}else if(v.isDataArrayTexture)if(Fe){if($e&&t.texStorage3D(n.TEXTURE_2D_ARRAY,le,de,ee.width,ee.height,ee.depth),O)if(v.layerUpdates.size>0){let K=pb(ee.width,ee.height,v.format,v.type);for(let ue of v.layerUpdates){let me=ee.data.subarray(ue*K/ee.data.BYTES_PER_ELEMENT,(ue+1)*K/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ue,ee.width,ee.height,1,ae,De,me)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,ae,De,ee.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,de,ee.width,ee.height,ee.depth,0,ae,De,ee.data);else if(v.isData3DTexture)Fe?($e&&t.texStorage3D(n.TEXTURE_3D,le,de,ee.width,ee.height,ee.depth),O&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,ae,De,ee.data)):t.texImage3D(n.TEXTURE_3D,0,de,ee.width,ee.height,ee.depth,0,ae,De,ee.data);else if(v.isFramebufferTexture){if($e)if(Fe)t.texStorage2D(n.TEXTURE_2D,le,de,ee.width,ee.height);else{let K=ee.width,ue=ee.height;for(let me=0;me<le;me++)t.texImage2D(n.TEXTURE_2D,me,de,K,ue,0,ae,De,null),K>>=1,ue>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in n){let K=n.canvas;if(K.hasAttribute("layoutsubtree")||K.setAttribute("layoutsubtree","true"),ee.parentNode!==K){K.appendChild(ee),d.add(v),K.onpaint=ue=>{let me=ue.changedElements;for(let ne of d)me.includes(ne.image)&&(ne.needsUpdate=!0)},K.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,ee);else{let me=n.RGBA,ne=n.RGBA,Ie=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,me,ne,Ie,ee)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ae.length>0){if(Fe&&$e){let K=gt(Ae[0]);t.texStorage2D(n.TEXTURE_2D,le,de,K.width,K.height)}for(let K=0,ue=Ae.length;K<ue;K++)ce=Ae[K],Fe?O&&t.texSubImage2D(n.TEXTURE_2D,K,0,0,ae,De,ce):t.texImage2D(n.TEXTURE_2D,K,de,ae,De,ce);v.generateMipmaps=!1}else if(Fe){if($e){let K=gt(ee);t.texStorage2D(n.TEXTURE_2D,le,de,K.width,K.height)}O&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae,De,ee)}else t.texImage2D(n.TEXTURE_2D,0,de,ae,De,ee);m(v)&&x(G),se.__version=ie.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function ke(T,v,U){if(v.image.length!==6)return;let G=et(T,v),Y=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,T.__webglTexture,n.TEXTURE0+U);let ie=i.get(Y);if(Y.version!==ie.__version||G===!0){t.activeTexture(n.TEXTURE0+U);let se=it.getPrimaries(it.workingColorSpace),Z=v.colorSpace===Gr?null:it.getPrimaries(v.colorSpace),ee=v.colorSpace===Gr||se===Z?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,ee);let ae=v.isCompressedTexture||v.image[0].isCompressedTexture,De=v.image[0]&&v.image[0].isDataTexture,de=[];for(let ne=0;ne<6;ne++)!ae&&!De?de[ne]=p(v.image[ne],!0,r.maxCubemapSize):de[ne]=De?v.image[ne].image:v.image[ne],de[ne]=pn(v,de[ne]);let ce=de[0],Ae=o.convert(v.format,v.colorSpace),Fe=o.convert(v.type),$e=_(v.internalFormat,Ae,Fe,v.normalized,v.colorSpace),O=v.isVideoTexture!==!0,le=ie.__version===void 0||G===!0,K=Y.dataReady,ue=w(v,ce);Ke(n.TEXTURE_CUBE_MAP,v);let me;if(ae){O&&le&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ue,$e,ce.width,ce.height);for(let ne=0;ne<6;ne++){me=de[ne].mipmaps;for(let Ie=0;Ie<me.length;Ie++){let Ce=me[Ie];v.format!==xi?Ae!==null?O?K&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,0,0,Ce.width,Ce.height,Ae,Ce.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,$e,Ce.width,Ce.height,0,Ce.data):Le("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,0,0,Ce.width,Ce.height,Ae,Fe,Ce.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie,$e,Ce.width,Ce.height,0,Ae,Fe,Ce.data)}}}else{if(me=v.mipmaps,O&&le){me.length>0&&ue++;let ne=gt(de[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ue,$e,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(De){O?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,de[ne].width,de[ne].height,Ae,Fe,de[ne].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,de[ne].width,de[ne].height,0,Ae,Fe,de[ne].data);for(let Ie=0;Ie<me.length;Ie++){let wt=me[Ie].image[ne].image;O?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,0,0,wt.width,wt.height,Ae,Fe,wt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,$e,wt.width,wt.height,0,Ae,Fe,wt.data)}}else{O?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Ae,Fe,de[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,Ae,Fe,de[ne]);for(let Ie=0;Ie<me.length;Ie++){let Ce=me[Ie];O?K&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,0,0,Ae,Fe,Ce.image[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,Ie+1,$e,Ae,Fe,Ce.image[ne])}}}m(v)&&x(n.TEXTURE_CUBE_MAP),ie.__version=Y.version,v.onUpdate&&v.onUpdate(v)}T.__version=v.version}function ge(T,v,U,G,Y,ie){let se=o.convert(U.format,U.colorSpace),Z=o.convert(U.type),ee=_(U.internalFormat,se,Z,U.normalized,U.colorSpace),ae=i.get(v),De=i.get(U);if(De.__renderTarget=v,!ae.__hasExternalTextures){let de=Math.max(1,v.width>>ie),ce=Math.max(1,v.height>>ie);Y===n.TEXTURE_3D||Y===n.TEXTURE_2D_ARRAY?t.texImage3D(Y,ie,ee,de,ce,v.depth,0,se,Z,null):t.texImage2D(Y,ie,ee,de,ce,0,se,Z,null)}t.bindFramebuffer(n.FRAMEBUFFER,T),qt(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,G,Y,De.__webglTexture,0,Ft(v)):(Y===n.TEXTURE_2D||Y>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Y<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,G,Y,De.__webglTexture,ie),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Xe(T,v,U){if(n.bindRenderbuffer(n.RENDERBUFFER,T),v.depthBuffer){let G=v.depthTexture,Y=G&&G.isDepthTexture?G.type:null,ie=M(v.stencilBuffer,Y),se=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;qt(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ft(v),ie,v.width,v.height):U?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ft(v),ie,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,ie,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,T)}else{let G=v.textures;for(let Y=0;Y<G.length;Y++){let ie=G[Y],se=o.convert(ie.format,ie.colorSpace),Z=o.convert(ie.type),ee=_(ie.internalFormat,se,Z,ie.normalized,ie.colorSpace);qt(v)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ft(v),ee,v.width,v.height):U?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ft(v),ee,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,ee,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function St(T,v,U){let G=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,T),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Y=i.get(v.depthTexture);if(Y.__renderTarget=v,(!Y.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),G){if(Y.__webglInit===void 0&&(Y.__webglInit=!0,v.depthTexture.addEventListener("dispose",D)),Y.__webglTexture===void 0){Y.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture),Ke(n.TEXTURE_CUBE_MAP,v.depthTexture);let ae=o.convert(v.depthTexture.format),De=o.convert(v.depthTexture.type),de;v.depthTexture.format===ur?de=n.DEPTH_COMPONENT24:v.depthTexture.format===ko&&(de=n.DEPTH24_STENCIL8);for(let ce=0;ce<6;ce++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0,de,v.width,v.height,0,ae,De,null)}}else te(v.depthTexture,0);let ie=Y.__webglTexture,se=Ft(v),Z=G?n.TEXTURE_CUBE_MAP_POSITIVE_X+U:n.TEXTURE_2D,ee=v.depthTexture.format===ko?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(v.depthTexture.format===ur)qt(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ee,Z,ie,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,ee,Z,ie,0);else if(v.depthTexture.format===ko)qt(v)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,ee,Z,ie,0,se):n.framebufferTexture2D(n.FRAMEBUFFER,ee,Z,ie,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ye(T){let v=i.get(T),U=T.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==T.depthTexture){let G=T.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),G){let Y=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,G.removeEventListener("dispose",Y)};G.addEventListener("dispose",Y),v.__depthDisposeCallback=Y}v.__boundDepthTexture=G}if(T.depthTexture&&!v.__autoAllocateDepthBuffer)if(U)for(let G=0;G<6;G++)St(v.__webglFramebuffer[G],T,G);else{let G=T.texture.mipmaps;G&&G.length>0?St(v.__webglFramebuffer[0],T,0):St(v.__webglFramebuffer,T,0)}else if(U){v.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[G]),v.__webglDepthbuffer[G]===void 0)v.__webglDepthbuffer[G]=n.createRenderbuffer(),Xe(v.__webglDepthbuffer[G],T,!1);else{let Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=v.__webglDepthbuffer[G];n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,Y,n.RENDERBUFFER,ie)}}else{let G=T.texture.mipmaps;if(G&&G.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),Xe(v.__webglDepthbuffer,T,!1);else{let Y=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,Y,n.RENDERBUFFER,ie)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function st(T,v,U){let G=i.get(T);v!==void 0&&ge(G.__webglFramebuffer,T,T.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),U!==void 0&&Ye(T)}function _t(T){let v=T.texture,U=i.get(T),G=i.get(v);T.addEventListener("dispose",b);let Y=T.textures,ie=T.isWebGLCubeRenderTarget===!0,se=Y.length>1;if(se||(G.__webglTexture===void 0&&(G.__webglTexture=n.createTexture()),G.__version=v.version,s.memory.textures++),ie){U.__webglFramebuffer=[];for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0){U.__webglFramebuffer[Z]=[];for(let ee=0;ee<v.mipmaps.length;ee++)U.__webglFramebuffer[Z][ee]=n.createFramebuffer()}else U.__webglFramebuffer[Z]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){U.__webglFramebuffer=[];for(let Z=0;Z<v.mipmaps.length;Z++)U.__webglFramebuffer[Z]=n.createFramebuffer()}else U.__webglFramebuffer=n.createFramebuffer();if(se)for(let Z=0,ee=Y.length;Z<ee;Z++){let ae=i.get(Y[Z]);ae.__webglTexture===void 0&&(ae.__webglTexture=n.createTexture(),s.memory.textures++)}if(T.samples>0&&qt(T)===!1){U.__webglMultisampledFramebuffer=n.createFramebuffer(),U.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let Z=0;Z<Y.length;Z++){let ee=Y[Z];U.__webglColorRenderbuffer[Z]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,U.__webglColorRenderbuffer[Z]);let ae=o.convert(ee.format,ee.colorSpace),De=o.convert(ee.type),de=_(ee.internalFormat,ae,De,ee.normalized,ee.colorSpace,T.isXRRenderTarget===!0),ce=Ft(T);n.renderbufferStorageMultisample(n.RENDERBUFFER,ce,de,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Z,n.RENDERBUFFER,U.__webglColorRenderbuffer[Z])}n.bindRenderbuffer(n.RENDERBUFFER,null),T.depthBuffer&&(U.__webglDepthRenderbuffer=n.createRenderbuffer(),Xe(U.__webglDepthRenderbuffer,T,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ie){t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture),Ke(n.TEXTURE_CUBE_MAP,v);for(let Z=0;Z<6;Z++)if(v.mipmaps&&v.mipmaps.length>0)for(let ee=0;ee<v.mipmaps.length;ee++)ge(U.__webglFramebuffer[Z][ee],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ee);else ge(U.__webglFramebuffer[Z],T,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0);m(v)&&x(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(se){for(let Z=0,ee=Y.length;Z<ee;Z++){let ae=Y[Z],De=i.get(ae),de=n.TEXTURE_2D;(T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(de=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(de,De.__webglTexture),Ke(de,ae),ge(U.__webglFramebuffer,T,ae,n.COLOR_ATTACHMENT0+Z,de,0),m(ae)&&x(de)}t.unbindTexture()}else{let Z=n.TEXTURE_2D;if((T.isWebGL3DRenderTarget||T.isWebGLArrayRenderTarget)&&(Z=T.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Z,G.__webglTexture),Ke(Z,v),v.mipmaps&&v.mipmaps.length>0)for(let ee=0;ee<v.mipmaps.length;ee++)ge(U.__webglFramebuffer[ee],T,v,n.COLOR_ATTACHMENT0,Z,ee);else ge(U.__webglFramebuffer,T,v,n.COLOR_ATTACHMENT0,Z,0);m(v)&&x(Z),t.unbindTexture()}T.depthBuffer&&Ye(T)}function oe(T){let v=T.textures;for(let U=0,G=v.length;U<G;U++){let Y=v[U];if(m(Y)){let ie=E(T),se=i.get(Y).__webglTexture;t.bindTexture(ie,se),x(ie),t.unbindTexture()}}}let je=[],Rt=[];function Pt(T){if(T.samples>0){if(qt(T)===!1){let v=T.textures,U=T.width,G=T.height,Y=n.COLOR_BUFFER_BIT,ie=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,se=i.get(T),Z=v.length>1;if(Z)for(let ae=0;ae<v.length;ae++)t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,se.__webglMultisampledFramebuffer);let ee=T.texture.mipmaps;ee&&ee.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglFramebuffer);for(let ae=0;ae<v.length;ae++){if(T.resolveDepthBuffer&&(T.depthBuffer&&(Y|=n.DEPTH_BUFFER_BIT),T.stencilBuffer&&T.resolveStencilBuffer&&(Y|=n.STENCIL_BUFFER_BIT)),Z){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,se.__webglColorRenderbuffer[ae]);let De=i.get(v[ae]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,De,0)}n.blitFramebuffer(0,0,U,G,0,0,U,G,Y,n.NEAREST),c===!0&&(je.length=0,Rt.length=0,je.push(n.COLOR_ATTACHMENT0+ae),T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&(je.push(ie),Rt.push(ie),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Rt)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,je))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Z)for(let ae=0;ae<v.length;ae++){t.bindFramebuffer(n.FRAMEBUFFER,se.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.RENDERBUFFER,se.__webglColorRenderbuffer[ae]);let De=i.get(v[ae]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,se.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ae,n.TEXTURE_2D,De,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,se.__webglMultisampledFramebuffer)}else if(T.depthBuffer&&T.storeMultisampledDepthBuffer===!1&&c){let v=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function Ft(T){return Math.min(r.maxSamples,T.samples)}function qt(T){let v=i.get(T);return T.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function L(T){let v=s.render.frame;u.get(T)!==v&&(u.set(T,v),T.update())}function pn(T,v){let U=T.colorSpace,G=T.format,Y=T.type;return T.isCompressedTexture===!0||T.isVideoTexture===!0||U!==vu&&U!==Gr&&(it.getTransfer(U)===pt?(G!==xi||Y!==ci)&&Le("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Be("WebGLTextures: Unsupported texture color space:",U)),v}function gt(T){return typeof HTMLImageElement<"u"&&T instanceof HTMLImageElement?(l.width=T.naturalWidth||T.width,l.height=T.naturalHeight||T.height):typeof VideoFrame<"u"&&T instanceof VideoFrame?(l.width=T.displayWidth,l.height=T.displayHeight):(l.width=T.width,l.height=T.height),l}this.allocateTextureUnit=X,this.resetTextureUnits=k,this.getTextureUnits=P,this.setTextureUnits=B,this.setTexture2D=te,this.setTexture2DArray=j,this.setTexture3D=q,this.setTextureCube=J,this.rebindTextures=st,this.setupRenderTarget=_t,this.updateRenderTargetMipmap=oe,this.updateMultisampleRenderTarget=Pt,this.setupDepthRenderbuffer=Ye,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=qt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function g5(n,e){function t(i,r=Gr){let o,s=it.getTransfer(r);if(i===ci)return n.UNSIGNED_BYTE;if(i===Dm)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Am)return n.UNSIGNED_SHORT_5_5_5_1;if(i===eb)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===tb)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Kx)return n.BYTE;if(i===Qx)return n.SHORT;if(i===_c)return n.UNSIGNED_SHORT;if(i===Tm)return n.INT;if(i===zi)return n.UNSIGNED_INT;if(i===Gi)return n.FLOAT;if(i===ji)return n.HALF_FLOAT;if(i===nb)return n.ALPHA;if(i===ib)return n.RGB;if(i===xi)return n.RGBA;if(i===ur)return n.DEPTH_COMPONENT;if(i===ko)return n.DEPTH_STENCIL;if(i===rb)return n.RED;if(i===Im)return n.RED_INTEGER;if(i===Uo)return n.RG;if(i===Rm)return n.RG_INTEGER;if(i===Nm)return n.RGBA_INTEGER;if(i===Ju||i===Ku||i===Qu||i===ed)if(s===pt)if(o=e.get("WEBGL_compressed_texture_s3tc_srgb"),o!==null){if(i===Ju)return o.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ku)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Qu)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ed)return o.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(o=e.get("WEBGL_compressed_texture_s3tc"),o!==null){if(i===Ju)return o.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ku)return o.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Qu)return o.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ed)return o.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Pm||i===Fm||i===Om||i===Lm)if(o=e.get("WEBGL_compressed_texture_pvrtc"),o!==null){if(i===Pm)return o.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Fm)return o.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Om)return o.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Lm)return o.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===km||i===Um||i===Bm||i===Vm||i===Hm||i===td||i===zm)if(o=e.get("WEBGL_compressed_texture_etc"),o!==null){if(i===km||i===Um)return s===pt?o.COMPRESSED_SRGB8_ETC2:o.COMPRESSED_RGB8_ETC2;if(i===Bm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:o.COMPRESSED_RGBA8_ETC2_EAC;if(i===Vm)return o.COMPRESSED_R11_EAC;if(i===Hm)return o.COMPRESSED_SIGNED_R11_EAC;if(i===td)return o.COMPRESSED_RG11_EAC;if(i===zm)return o.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Gm||i===jm||i===Wm||i===$m||i===qm||i===Xm||i===Ym||i===Zm||i===Jm||i===Km||i===Qm||i===eg||i===tg||i===ng)if(o=e.get("WEBGL_compressed_texture_astc"),o!==null){if(i===Gm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:o.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===jm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:o.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Wm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:o.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===$m)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:o.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===qm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:o.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Xm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:o.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ym)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:o.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Zm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:o.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Jm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:o.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Km)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:o.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qm)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:o.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===eg)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:o.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===tg)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:o.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ng)return s===pt?o.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:o.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ig||i===rg||i===og)if(o=e.get("EXT_texture_compression_bptc"),o!==null){if(i===ig)return s===pt?o.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:o.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===rg)return o.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===og)return o.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===sg||i===ag||i===nd||i===cg)if(o=e.get("EXT_texture_compression_rgtc"),o!==null){if(i===sg)return o.COMPRESSED_RED_RGTC1_EXT;if(i===ag)return o.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===nd)return o.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===cg)return o.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===xc?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var y5=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,v5=`
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

}`,Db=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Ru(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Hn({vertexShader:y5,fragmentShader:v5,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new mt(new _i(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ab=class extends dr{constructor(e,t){super();let i=this,r=null,o=1,s=null,a="local-floor",c=1,l=null,u=null,d=null,f=null,h=null,g=null,y=typeof XRWebGLBinding<"u",p=new Db,m={},x=t.getContextAttributes(),E=null,_=null,M=[],w=[],D=new ye,b=null,C=null,A=new Zn;A.viewport=new vt;let N=new Zn;N.viewport=new vt;let I=[A,N],k=new Mm,P=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let Q=M[$];return Q===void 0&&(Q=new hc,M[$]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function($){let Q=M[$];return Q===void 0&&(Q=new hc,M[$]=Q),Q.getGripSpace()},this.getHand=function($){let Q=M[$];return Q===void 0&&(Q=new hc,M[$]=Q),Q.getHandSpace()};function X($){let Q=w.indexOf($.inputSource);if(Q===-1)return;let ve=M[Q];ve!==void 0&&(ve.update($.inputSource,$.frame,l||s),ve.dispatchEvent({type:$.type,data:$.inputSource}))}function V(){r.removeEventListener("select",X),r.removeEventListener("selectstart",X),r.removeEventListener("selectend",X),r.removeEventListener("squeeze",X),r.removeEventListener("squeezestart",X),r.removeEventListener("squeezeend",X),r.removeEventListener("end",V),r.removeEventListener("inputsourceschange",te);for(let $=0;$<M.length;$++){let Q=w[$];Q!==null&&(w[$]=null,M[$].disconnect(Q))}P=null,B=null,p.reset();for(let $ in m)delete m[$];if(e.setRenderTarget(E),h=null,f=null,d=null,r=null,_=null,et.stop(),i.isPresenting=!1,e.setPixelRatio(b),e.setSize(D.width,D.height,!1),C!==null){let $=C.camera;$.fov=C.fov,$.zoom=C.zoom,$.updateProjectionMatrix(),C=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){o=$,i.isPresenting===!0&&Le("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,i.isPresenting===!0&&Le("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||s},this.setReferenceSpace=function($){l=$},this.getBaseLayer=function(){return f!==null?f:h},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(r,t)),d},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=function($){return Ve(this,null,function*(){if(r=$,r!==null){if(E=e.getRenderTarget(),r.addEventListener("select",X),r.addEventListener("selectstart",X),r.addEventListener("selectend",X),r.addEventListener("squeeze",X),r.addEventListener("squeezestart",X),r.addEventListener("squeezeend",X),r.addEventListener("end",V),r.addEventListener("inputsourceschange",te),x.xrCompatible!==!0&&(yield t.makeXRCompatible()),b=e.getPixelRatio(),e.getSize(D),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,ke=null,ge=null;x.depth&&(ge=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=x.stencil?ko:ur,ke=x.stencil?xc:zi);let Xe={colorFormat:t.RGBA8,depthFormat:ge,scaleFactor:o};d=this.getBinding(),f=d.createProjectionLayer(Xe),r.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),_=new Jn(f.textureWidth,f.textureHeight,{format:xi,type:ci,depthTexture:new Ao(f.textureWidth,f.textureHeight,ke,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}else{let ve={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:o};h=new XRWebGLLayer(r,t,ve),r.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),_=new Jn(h.framebufferWidth,h.framebufferHeight,{format:xi,type:ci,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}_.isXRRenderTarget=!0,this.setFoveation(c),l=null,s=yield r.requestReferenceSpace(a),et.setContext(r),et.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}})},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function te($){for(let Q=0;Q<$.removed.length;Q++){let ve=$.removed[Q],ke=w.indexOf(ve);ke>=0&&(w[ke]=null,M[ke].disconnect(ve))}for(let Q=0;Q<$.added.length;Q++){let ve=$.added[Q],ke=w.indexOf(ve);if(ke===-1){for(let Xe=0;Xe<M.length;Xe++)if(Xe>=w.length){w.push(ve),ke=Xe;break}else if(w[Xe]===null){w[Xe]=ve,ke=Xe;break}if(ke===-1)break}let ge=M[ke];ge&&ge.connect(ve)}}let j=new R,q=new R;function J($,Q,ve){j.setFromMatrixPosition(Q.matrixWorld),q.setFromMatrixPosition(ve.matrixWorld);let ke=j.distanceTo(q),ge=Q.projectionMatrix.elements,Xe=ve.projectionMatrix.elements,St=ge[14]/(ge[10]-1),Ye=ge[14]/(ge[10]+1),st=(ge[9]+1)/ge[5],_t=(ge[9]-1)/ge[5],oe=(ge[8]-1)/ge[0],je=(Xe[8]+1)/Xe[0],Rt=St*oe,Pt=St*je,Ft=ke/(-oe+je),qt=Ft*-oe;if(Q.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(qt),$.translateZ(Ft),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),ge[10]===-1)$.projectionMatrix.copy(Q.projectionMatrix),$.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let L=St+Ft,pn=Ye+Ft,gt=Rt-qt,T=Pt+(ke-qt),v=st*Ye/pn*L,U=_t*Ye/pn*L;$.projectionMatrix.makePerspective(gt,T,v,U,L,pn),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function he($,Q){Q===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(Q.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(r===null)return;let Q=$.near,ve=$.far;p.texture!==null&&(p.depthNear>0&&(Q=p.depthNear),p.depthFar>0&&(ve=p.depthFar)),k.near=N.near=A.near=Q,k.far=N.far=A.far=ve,(P!==k.near||B!==k.far)&&(r.updateRenderState({depthNear:k.near,depthFar:k.far}),P=k.near,B=k.far),k.layers.mask=$.layers.mask|6,A.layers.mask=k.layers.mask&-5,N.layers.mask=k.layers.mask&-3;let ke=$.parent,ge=k.cameras;he(k,ke);for(let Xe=0;Xe<ge.length;Xe++)he(ge[Xe],ke);ge.length===2?J(k,A,N):k.projectionMatrix.copy(A.projectionMatrix),C===null&&$.isPerspectiveCamera&&(C={camera:$,fov:$.fov,zoom:$.zoom}),we($,k,ke)};function we($,Q,ve){ve===null?$.matrix.copy(Q.matrixWorld):($.matrix.copy(ve.matrixWorld),$.matrix.invert(),$.matrix.multiply(Q.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(Q.projectionMatrix),$.projectionMatrixInverse.copy(Q.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=dc*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(f===null&&h===null))return c},this.setFoveation=function($){c=$,f!==null&&(f.fixedFoveation=$),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=$)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(k)},this.getCameraTexture=function($){return m[$]};let dt=null;function Ke($,Q){if(u=Q.getViewerPose(l||s),g=Q,u!==null){let ve=u.views;h!==null&&(e.setRenderTargetFramebuffer(_,h.framebuffer),e.setRenderTarget(_));let ke=!1;ve.length!==k.cameras.length&&(k.cameras.length=0,ke=!0);for(let Ye=0;Ye<ve.length;Ye++){let st=ve[Ye],_t=null;if(h!==null)_t=h.getViewport(st);else{let je=d.getViewSubImage(f,st);_t=je.viewport,Ye===0&&(e.setRenderTargetTextures(_,je.colorTexture,je.depthStencilTexture),e.setRenderTarget(_))}let oe=I[Ye];oe===void 0&&(oe=new Zn,oe.layers.enable(Ye),oe.viewport=new vt,I[Ye]=oe),oe.matrix.fromArray(st.transform.matrix),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.projectionMatrix.fromArray(st.projectionMatrix),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert(),oe.viewport.set(_t.x,_t.y,_t.width,_t.height),Ye===0&&(k.matrix.copy(oe.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),ke===!0&&k.cameras.push(oe)}let ge=r.enabledFeatures;if(ge&&ge.includes("depth-sensing")&&r.depthUsage=="gpu-optimized"&&y){d=i.getBinding();let Ye=d.getDepthInformation(ve[0]);Ye&&Ye.isValid&&Ye.texture&&p.init(Ye,r.renderState)}if(ge&&ge.includes("camera-access")&&y){e.state.unbindTexture(),d=i.getBinding();for(let Ye=0;Ye<ve.length;Ye++){let st=ve[Ye].camera;if(st){let _t=m[st];_t||(_t=new Ru,m[st]=_t);let oe=d.getCameraImage(st);_t.sourceTexture=oe}}}}for(let ve=0;ve<M.length;ve++){let ke=w[ve],ge=M[ve];ke!==null&&ge!==void 0&&ge.update(ke,Q,l||s)}dt&&dt($,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),g=null}let et=new G1;et.setAnimationLoop(Ke),this.setAnimationLoop=function($){dt=$},this.dispose=function(){}}},_5=new Nt,Y1=new Ge;Y1.set(-1,0,0,0,1,0,0,0,1);function x5(n,e){function t(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,db(n)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function r(p,m,x,E,_){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?o(p,m):m.isMeshLambertMaterial?(o(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(o(p,m),d(p,m)):m.isMeshPhongMaterial?(o(p,m),u(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(o(p,m),f(p,m),m.isMeshPhysicalMaterial&&h(p,m,_)):m.isMeshMatcapMaterial?(o(p,m),g(p,m)):m.isMeshDepthMaterial?o(p,m):m.isMeshDistanceMaterial?(o(p,m),y(p,m)):m.isMeshNormalMaterial?o(p,m):m.isLineBasicMaterial?(s(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?c(p,m,x,E):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function o(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,t(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===zn&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,t(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===zn&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,t(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,t(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let x=e.get(m),E=x.envMap,_=x.envMapRotation;E&&(p.envMap.value=E,p.envMapRotation.value.setFromMatrix4(_5.makeRotationFromEuler(_)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Y1),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,p.aoMapTransform))}function s(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,x,E){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*x,p.scale.value=E*.5,m.map&&(p.map.value=m.map,t(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,t(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,t(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function u(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function d(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function f(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function h(p,m,x){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===zn&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function y(p,m){let x=e.get(m).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function b5(n,e,t,i){let r={},o={},s=[],a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(_,M){let w=M.program;i.uniformBlockBinding(_,w)}function l(_,M){let w=r[_.id];w===void 0&&(p(_),w=u(_),r[_.id]=w,_.addEventListener("dispose",x));let D=M.program;i.updateUBOMapping(_,D);let b=e.render.frame;o[_.id]!==b&&(f(_),o[_.id]=b)}function u(_){let M=d();_.__bindingPointIndex=M;let w=n.createBuffer(),D=_.__size,b=_.usage;return n.bindBuffer(n.UNIFORM_BUFFER,w),n.bufferData(n.UNIFORM_BUFFER,D,b),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,w),w}function d(){for(let _=0;_<a;_++)if(s.indexOf(_)===-1)return s.push(_),_;return Be("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){let M=r[_.id],w=_.uniforms,D=_.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let b=0,C=w.length;b<C;b++){let A=w[b];if(Array.isArray(A))for(let N=0,I=A.length;N<I;N++)h(A[N],b,N,D);else h(A,b,0,D)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function h(_,M,w,D){if(y(_,M,w,D)===!0){let b=_.__offset,C=_.value;if(Array.isArray(C)){let A=0;for(let N=0;N<C.length;N++){let I=C[N],k=m(I);g(I,_.__data,A),typeof I!="number"&&typeof I!="boolean"&&!I.isMatrix3&&!ArrayBuffer.isView(I)&&(A+=k.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(C,_.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,b,_.__data)}}function g(_,M,w){typeof _=="number"||typeof _=="boolean"?M[0]=_:_.isMatrix3?(M[0]=_.elements[0],M[1]=_.elements[1],M[2]=_.elements[2],M[3]=0,M[4]=_.elements[3],M[5]=_.elements[4],M[6]=_.elements[5],M[7]=0,M[8]=_.elements[6],M[9]=_.elements[7],M[10]=_.elements[8],M[11]=0):ArrayBuffer.isView(_)?M.set(new _.constructor(_.buffer,_.byteOffset,M.length)):_.toArray(M,w)}function y(_,M,w,D){let b=_.value,C=M+"_"+w;if(D[C]===void 0)return typeof b=="number"||typeof b=="boolean"?D[C]=b:ArrayBuffer.isView(b)?D[C]=b.slice():D[C]=b.clone(),!0;{let A=D[C];if(typeof b=="number"||typeof b=="boolean"){if(A!==b)return D[C]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(A.equals(b)===!1)return A.copy(b),!0}}return!1}function p(_){let M=_.uniforms,w=0,D=16;for(let C=0,A=M.length;C<A;C++){let N=Array.isArray(M[C])?M[C]:[M[C]];for(let I=0,k=N.length;I<k;I++){let P=N[I],B=Array.isArray(P.value)?P.value:[P.value];for(let X=0,V=B.length;X<V;X++){let te=B[X],j=m(te),q=w%D,J=q%j.boundary,he=q+J;w+=J,he!==0&&D-he<j.storage&&(w+=D-he),P.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=w,w+=j.storage}}}let b=w%D;return b>0&&(w+=D-b),_.__size=w,_.__cache={},this}function m(_){let M={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(M.boundary=4,M.storage=4):_.isVector2?(M.boundary=8,M.storage=8):_.isVector3||_.isColor?(M.boundary=16,M.storage=12):_.isVector4?(M.boundary=16,M.storage=16):_.isMatrix3?(M.boundary=48,M.storage=48):_.isMatrix4?(M.boundary=64,M.storage=64):_.isTexture?Le("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(_)?(M.boundary=16,M.storage=_.byteLength):Le("WebGLRenderer: Unsupported uniform value type.",_),M}function x(_){let M=_.target;M.removeEventListener("dispose",x);let w=s.indexOf(M.__bindingPointIndex);s.splice(w,1),n.deleteBuffer(r[M.id]),delete r[M.id],delete o[M.id]}function E(){for(let _ in r)n.deleteBuffer(r[_]);s=[],r={},o={}}return{bind:c,update:l,dispose:E}}var S5=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),gr=null;function M5(){return gr===null&&(gr=new im(S5,16,16,Uo,ji),gr.name="DFG_LUT",gr.minFilter=Jt,gr.magFilter=Jt,gr.wrapS=cr,gr.wrapT=cr,gr.generateMipmaps=!1,gr.needsUpdate=!0),gr}var z1=class{constructor(e={}){let{canvas:t=d1(),context:i=null,depth:r=!0,stencil:o=!1,alpha:s=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1,outputBufferType:h=ci}=e;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=s;let y=h,p=new Set([Nm,Rm,Im]),m=new Set([ci,zi,_c,xc,Dm,Am]),x=new Uint32Array(4),E=new Int32Array(4),_=new R,M=null,w=null,D=[],b=[],C=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let A=this,N=!1,I=null,k=null,P=null,B=null;this._outputColorSpace=Bn;let X=0,V=0,te=null,j=-1,q=null,J=new vt,he=new vt,we=null,dt=new rt(0),Ke=0,et=t.width,$=t.height,Q=1,ve=null,ke=null,ge=new vt(0,0,et,$),Xe=new vt(0,0,et,$),St=!1,Ye=new Du,st=!1,_t=!1,oe=new Nt,je=new R,Rt=new vt,Pt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ft=!1;function qt(){return te===null?Q:1}let L=i;function pn(S,F){return t.getContext(S,F)}let gt,T,v,U,G,Y,ie,se,Z,ee,ae,De,de,ce,Ae,Fe,$e,O,le,K,ue,me,ne;try{let S={alpha:!0,depth:r,stencil:o,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",wt,!1),t.addEventListener("webglcontextrestored",ft,!1),t.addEventListener("webglcontextcreationerror",Si,!1),L===null){let F="webgl2";if(L=pn(F,S),L===null)throw pn(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ie()}catch(S){throw t.removeEventListener("webglcontextlost",wt,!1),t.removeEventListener("webglcontextrestored",ft,!1),t.removeEventListener("webglcontextcreationerror",Si,!1),Be("WebGLRenderer: "+S.message),S}function Ie(){gt=new I4(L),gt.init(),ue=new g5(L,gt),T=new x4(L,gt,e,ue),v=new p5(L,gt),T.reversedDepthBuffer&&f&&v.buffers.depth.setReversed(!0),k=L.createFramebuffer(),P=L.createFramebuffer(),B=L.createFramebuffer(),U=new P4(L),G=new e5,Y=new m5(L,gt,v,G,T,ue,U),ie=new A4(A),se=new OH(L),me=new v4(L,se),Z=new R4(L,se,U,me),ee=new O4(L,Z,se,me,U),O=new F4(L,T,Y),Ae=new b4(G),ae=new Qj(A,ie,gt,T,me,Ae),De=new x5(A,G),de=new n5,ce=new c5(gt),$e=new y4(A,ie,v,ee,g,c),Fe=new h5(A,ee,T),ne=new b5(L,U,T,v),le=new _4(L,gt,U),K=new N4(L,gt,U),U.programs=ae.programs,A.capabilities=T,A.extensions=gt,A.properties=G,A.renderLists=de,A.shadowMap=Fe,A.state=v,A.info=U}y!==ci&&(C=new k4(y,t.width,t.height,a,r,o));let Ce=new Ab(A,L);this.xr=Ce,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){let S=gt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=gt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(S){S!==void 0&&(Q=S,this.setSize(et,$,!1))},this.getSize=function(S){return S.set(et,$)},this.setSize=function(S,F,W=!0){if(Ce.isPresenting){Le("WebGLRenderer: Can't change size while VR device is presenting.");return}et=S,$=F,t.width=Math.floor(S*Q),t.height=Math.floor(F*Q),W===!0&&(t.style.width=S+"px",t.style.height=F+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(et*Q,$*Q).floor()},this.setDrawingBufferSize=function(S,F,W){et=S,$=F,Q=W,t.width=Math.floor(S*W),t.height=Math.floor(F*W),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(y===ci){Be("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){Le("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(J)},this.getViewport=function(S){return S.copy(ge)},this.setViewport=function(S,F,W,H){S.isVector4?ge.set(S.x,S.y,S.z,S.w):ge.set(S,F,W,H),v.viewport(J.copy(ge).multiplyScalar(Q).round())},this.getScissor=function(S){return S.copy(Xe)},this.setScissor=function(S,F,W,H){S.isVector4?Xe.set(S.x,S.y,S.z,S.w):Xe.set(S,F,W,H),v.scissor(he.copy(Xe).multiplyScalar(Q).round())},this.getScissorTest=function(){return St},this.setScissorTest=function(S){v.setScissorTest(St=S)},this.setOpaqueSort=function(S){ve=S},this.setTransparentSort=function(S){ke=S},this.getClearColor=function(S){return S.copy($e.getClearColor())},this.setClearColor=function(){$e.setClearColor(...arguments)},this.getClearAlpha=function(){return $e.getClearAlpha()},this.setClearAlpha=function(){$e.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,W=!0){let H=0;if(S){let z=!1;if(te!==null){let pe=te.texture.format;z=p.has(pe)}if(z){let pe=te.texture.type,xe=m.has(pe),fe=$e.getClearColor(),Me=$e.getClearAlpha(),Te=fe.r,Ze=fe.g,Qe=fe.b;xe?(x[0]=Te,x[1]=Ze,x[2]=Qe,x[3]=Me,L.clearBufferuiv(L.COLOR,0,x)):(E[0]=Te,E[1]=Ze,E[2]=Qe,E[3]=Me,L.clearBufferiv(L.COLOR,0,E))}else H|=L.COLOR_BUFFER_BIT}F&&(H|=L.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),W&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H!==0&&L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),I=S},this.dispose=function(){t.removeEventListener("webglcontextlost",wt,!1),t.removeEventListener("webglcontextrestored",ft,!1),t.removeEventListener("webglcontextcreationerror",Si,!1),$e.dispose(),de.dispose(),ce.dispose(),G.dispose(),ie.dispose(),ee.dispose(),me.dispose(),ne.dispose(),ae.dispose(),Ce.dispose(),Ce.removeEventListener("sessionstart",kb),Ce.removeEventListener("sessionend",Ub),Vo.stop()};function wt(S){S.preventDefault(),Su("WebGLRenderer: Context Lost."),N=!0}function ft(){Su("WebGLRenderer: Context Restored."),N=!1;let S=U.autoReset,F=Fe.enabled,W=Fe.autoUpdate,H=Fe.needsUpdate,z=Fe.type;Ie(),U.autoReset=S,Fe.enabled=F,Fe.autoUpdate=W,Fe.needsUpdate=H,Fe.type=z}function Si(S){Be("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Wi(S){let F=S.target;F.removeEventListener("dispose",Wi),dR(F)}function dR(S){fR(S),G.remove(S)}function fR(S){let F=G.get(S).programs;F!==void 0&&(F.forEach(function(W){ae.releaseProgram(W)}),S.isShaderMaterial&&ae.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,W,H,z,pe){F===null&&(F=Pt);let xe=z.isMesh&&z.matrixWorld.determinantAffine()<0,fe=mR(S,F,W,H,z);v.setMaterial(H,xe);let Me=W.index,Te=1;if(H.wireframe===!0){if(Me=Z.getWireframeAttribute(W),Me===void 0)return;Te=2}let Ze=W.drawRange,Qe=W.attributes.position,Ee=Ze.start*Te,ht=(Ze.start+Ze.count)*Te;pe!==null&&(Ee=Math.max(Ee,pe.start*Te),ht=Math.min(ht,(pe.start+pe.count)*Te)),Me!==null?(Ee=Math.max(Ee,0),ht=Math.min(ht,Me.count)):Qe!=null&&(Ee=Math.max(Ee,0),ht=Math.min(ht,Qe.count));let Xt=ht-Ee;if(Xt<0||Xt===1/0)return;me.setup(z,H,fe,W,Me);let Tt,Mt=le;if(Me!==null&&(Tt=se.get(Me),Mt=K,Mt.setIndex(Tt)),z.isMesh)H.wireframe===!0?(v.setLineWidth(H.wireframeLinewidth*qt()),Mt.setMode(L.LINES)):Mt.setMode(L.TRIANGLES);else if(z.isLine){let mn=H.linewidth;mn===void 0&&(mn=1),v.setLineWidth(mn*qt()),z.isLineSegments?Mt.setMode(L.LINES):z.isLineLoop?Mt.setMode(L.LINE_LOOP):Mt.setMode(L.LINE_STRIP)}else z.isPoints?Mt.setMode(L.POINTS):z.isSprite&&Mt.setMode(L.TRIANGLES);if(z.isBatchedMesh)if(gt.get("WEBGL_multi_draw"))Mt.renderMultiDraw(z._multiDrawStarts,z._multiDrawCounts,z._multiDrawCount);else{let mn=z._multiDrawStarts,_e=z._multiDrawCounts,Dn=z._multiDrawCount,ct=Me?se.get(Me).bytesPerElement:1,li=G.get(H).currentProgram.getUniforms();for(let $i=0;$i<Dn;$i++)li.setValue(L,"_gl_DrawID",$i),Mt.render(mn[$i]/ct,_e[$i])}else if(z.isInstancedMesh)Mt.renderInstances(Ee,Xt,z.count);else if(W.isInstancedBufferGeometry){let mn=W._maxInstanceCount!==void 0?W._maxInstanceCount:1/0,_e=Math.min(W.instanceCount,mn);Mt.renderInstances(Ee,Xt,_e)}else Mt.render(Ee,Xt)};function Lb(S,F,W,H){I!==null&&S.isNodeMaterial&&I.setObject(H,S),st===!0&&Ae.setState(S,W,!1),S.transparent===!0&&S.side===Ht&&S.forceSinglePass===!1?(S.side=zn,S.needsUpdate=!0,cd(S,F,H),S.side=pr,S.needsUpdate=!0,cd(S,F,H),S.side=Ht):cd(S,F,H)}this.compile=function(S,F,W=null){W===null&&(W=S),I!==null&&I.renderStart(S,F,W),w=ce.get(W),w.init(F),b.push(w),W.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),S!==W&&S.traverseVisible(function(z){z.isLight&&z.layers.test(F.layers)&&(w.pushLight(z),z.castShadow&&w.pushShadow(z))}),w.setupLights(),I!==null&&I.updateLights(w.state.lightsArray),_t=this.localClippingEnabled,st=Ae.init(this.clippingPlanes,_t),st===!0&&Ae.setGlobalState(this.clippingPlanes,F),I!==null&&Fe.render(w.state.shadowsArray,W,F);let H=new Set;return S.traverse(function(z){if(!(z.isMesh||z.isPoints||z.isLine||z.isSprite))return;let pe=z.material;if(pe)if(Array.isArray(pe))for(let xe=0;xe<pe.length;xe++){let fe=pe[xe];Lb(fe,W,F,z),H.add(fe)}else Lb(pe,W,F,z),H.add(pe)}),w=b.pop(),I!==null&&I.renderEnd(),H},this.compileAsync=function(S,F,W=null){let H=this.compile(S,F,W);return new Promise(z=>{function pe(){if(H.forEach(function(xe){let Me=G.get(xe).currentProgram;(Me===void 0||Me.isReady())&&H.delete(xe)}),H.size===0){z(S);return}setTimeout(pe,10)}gt.get("KHR_parallel_shader_compile")!==null?pe():setTimeout(pe,10)})};let Ng=null;function hR(S){Ng&&Ng(S)}function kb(){Vo.stop()}function Ub(){Vo.start()}let Vo=new G1;Vo.setAnimationLoop(hR),typeof self<"u"&&Vo.setContext(self),this.setAnimationLoop=function(S){Ng=S,Ce.setAnimationLoop(S),S===null?Vo.stop():Vo.start()},Ce.addEventListener("sessionstart",kb),Ce.addEventListener("sessionend",Ub),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){Be("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;I!==null&&I.renderStart(S,F);let W=Ce.enabled===!0&&Ce.isPresenting===!0,H=C!==null&&(te===null||W)&&C.begin(A,te);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),Ce.enabled===!0&&Ce.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(Ce.cameraAutoUpdate===!0&&Ce.updateCamera(F),F=Ce.getCamera()),S.isScene===!0&&S.onBeforeRender(A,S,F,te),w=ce.get(S,b.length),w.init(F),w.state.textureUnits=Y.getTextureUnits(),b.push(w),oe.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),Ye.setFromProjectionMatrix(oe,Bi,F.reversedDepth),_t=this.localClippingEnabled,st=Ae.init(this.clippingPlanes,_t),M=de.get(S,D.length),M.init(),D.push(M),Ce.enabled===!0&&Ce.isPresenting===!0){let xe=A.xr.getDepthSensingMesh();xe!==null&&Pg(xe,F,-1/0,A.sortObjects)}Pg(S,F,0,A.sortObjects),M.finish(),I!==null&&I.updateLights(w.state.lightsArray),A.sortObjects===!0&&M.sort(ve,ke),Ft=Ce.enabled===!1||Ce.isPresenting===!1||Ce.hasDepthSensing()===!1,Ft&&$e.addToRenderList(M,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),st===!0&&Ae.beginShadows();let z=w.state.shadowsArray;if(Fe.render(z,S,F),st===!0&&Ae.endShadows(),(H&&C.hasRenderPass())===!1){let xe=M.opaque,fe=M.transmissive;if(w.setupLights(),F.isArrayCamera){let Me=F.cameras;if(fe.length>0)for(let Te=0,Ze=Me.length;Te<Ze;Te++){let Qe=Me[Te];Vb(xe,fe,S,Qe)}Ft&&$e.render(S);for(let Te=0,Ze=Me.length;Te<Ze;Te++){let Qe=Me[Te];Bb(M,S,Qe,Qe.viewport)}}else fe.length>0&&Vb(xe,fe,S,F),Ft&&$e.render(S),Bb(M,S,F)}te!==null&&V===0&&(Y.updateMultisampleRenderTarget(te),Y.updateRenderTargetMipmap(te)),H&&C.end(A),S.isScene===!0&&S.onAfterRender(A,S,F),me.resetDefaultState(),j=-1,q=null,b.pop(),b.length>0?(w=b[b.length-1],Y.setTextureUnits(w.state.textureUnits),st===!0&&Ae.setGlobalState(A.clippingPlanes,w.state.camera)):w=null,D.pop(),D.length>0?M=D[D.length-1]:M=null,I!==null&&I.renderEnd()};function Pg(S,F,W,H){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)W=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)w.pushLightProbeGrid(S);else if(S.isLight)w.pushLight(S),S.castShadow&&w.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(Ye)){H&&Rt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(oe);let xe=ee.update(S),fe=S.material;fe.visible&&M.push(S,xe,fe,W,Rt.z,null,F)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(Ye))){let xe=ee.update(S),fe=S.material;if(H&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Rt.copy(S.boundingSphere.center)):(xe.boundingSphere===null&&xe.computeBoundingSphere(),Rt.copy(xe.boundingSphere.center)),Rt.applyMatrix4(S.matrixWorld).applyMatrix4(oe)),Array.isArray(fe)){let Me=xe.groups;for(let Te=0,Ze=Me.length;Te<Ze;Te++){let Qe=Me[Te],Ee=fe[Qe.materialIndex];Ee&&Ee.visible&&M.push(S,xe,Ee,W,Rt.z,Qe,F)}}else fe.visible&&M.push(S,xe,fe,W,Rt.z,null,F)}}let pe=S.children;for(let xe=0,fe=pe.length;xe<fe;xe++)Pg(pe[xe],F,W,H)}function Bb(S,F,W,H){let{opaque:z,transmissive:pe,transparent:xe}=S;w.setupLightsView(W),st===!0&&Ae.setGlobalState(A.clippingPlanes,W),H&&v.viewport(J.copy(H)),z.length>0&&ad(z,F,W),pe.length>0&&ad(pe,F,W),xe.length>0&&ad(xe,F,W),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function Vb(S,F,W,H){if((W.isScene===!0?W.overrideMaterial:null)!==null)return;if(w.state.transmissionRenderTarget[H.id]===void 0){let Ee=gt.has("EXT_color_buffer_half_float")||gt.has("EXT_color_buffer_float");w.state.transmissionRenderTarget[H.id]=new Jn(1,1,{generateMipmaps:!0,type:Ee?ji:ci,minFilter:Lo,samples:Math.max(4,T.samples),stencilBuffer:o,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:it.workingColorSpace})}let pe=w.state.transmissionRenderTarget[H.id],xe=H.viewport||J;pe.setSize(xe.z*A.transmissionResolutionScale,xe.w*A.transmissionResolutionScale);let fe=A.getRenderTarget(),Me=A.getActiveCubeFace(),Te=A.getActiveMipmapLevel();A.setRenderTarget(pe),A.getClearColor(dt),Ke=A.getClearAlpha(),Ke<1&&A.setClearColor(16777215,.5),A.clear(),Ft&&$e.render(W);let Ze=A.toneMapping;A.toneMapping=Hi;let Qe=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),w.setupLightsView(H),st===!0&&Ae.setGlobalState(A.clippingPlanes,H),ad(S,W,H),Y.updateMultisampleRenderTarget(pe),Y.updateRenderTargetMipmap(pe),gt.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let ht=0,Xt=F.length;ht<Xt;ht++){let Tt=F[ht],{object:Mt,geometry:mn,material:_e,group:Dn}=Tt;if(_e.side===Ht&&Mt.layers.test(H.layers)){let ct=_e.side;_e.side=zn,_e.needsUpdate=!0,Hb(Mt,W,H,mn,_e,Dn),_e.side=ct,_e.needsUpdate=!0,Ee=!0}}Ee===!0&&(Y.updateMultisampleRenderTarget(pe),Y.updateRenderTargetMipmap(pe))}A.setRenderTarget(fe,Me,Te),A.setClearColor(dt,Ke),Qe!==void 0&&(H.viewport=Qe),A.toneMapping=Ze}function ad(S,F,W){let H=F.isScene===!0?F.overrideMaterial:null;for(let z=0,pe=S.length;z<pe;z++){let xe=S[z],{object:fe,geometry:Me,group:Te}=xe,Ze=xe.material;Ze.allowOverride===!0&&H!==null&&(Ze=H),fe.layers.test(W.layers)&&Hb(fe,F,W,Me,Ze,Te)}}function Hb(S,F,W,H,z,pe){I!==null&&z.isNodeMaterial&&I.setObject(S,z),S.onBeforeRender(A,F,W,H,z,pe),S.modelViewMatrix.multiplyMatrices(W.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),z.onBeforeRender(A,F,W,H,S,pe),z.transparent===!0&&z.side===Ht&&z.forceSinglePass===!1?(z.side=zn,z.needsUpdate=!0,A.renderBufferDirect(W,F,H,z,S,pe),z.side=pr,z.needsUpdate=!0,A.renderBufferDirect(W,F,H,z,S,pe),z.side=Ht):A.renderBufferDirect(W,F,H,z,S,pe),S.onAfterRender(A,F,W,H,z,pe)}function cd(S,F,W){F.isScene!==!0&&(F=Pt);let H=G.get(S),z=w.state.lights,pe=w.state.shadowsArray,xe=z.state.version,fe=ae.getParameters(S,z.state,pe,F,W,w.state.lightProbeGridArray),Me=ae.getProgramCacheKey(fe),Te=H.programs;H.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,H.fog=F.fog;let Ze=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;H.envMap=ie.get(S.envMap||H.environment,Ze),H.envMapRotation=H.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,Te===void 0&&(S.addEventListener("dispose",Wi),Te=new Map,H.programs=Te);let Qe=Te.get(Me);if(Qe!==void 0){if(H.currentProgram===Qe&&H.lightsStateVersion===xe)return Gb(S,fe),Qe}else fe.uniforms=ae.getUniforms(S),I!==null&&S.isNodeMaterial&&I.build(S,W,fe),S.onBeforeCompile(fe,A),Qe=ae.acquireProgram(fe,Me),Te.set(Me,Qe),H.uniforms=fe.uniforms;let Ee=H.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ee.clippingPlanes=Ae.uniform),Gb(S,fe),H.needsLights=yR(S),H.lightsStateVersion=xe,H.needsLights&&(Ee.ambientLightColor.value=z.state.ambient,Ee.lightProbe.value=z.state.probe,Ee.sunLights.value=z.state.sun,Ee.sunLightShadows.value=z.state.sunShadow,Ee.directionalLights.value=z.state.directional,Ee.directionalLightShadows.value=z.state.directionalShadow,Ee.spotLights.value=z.state.spot,Ee.spotLightShadows.value=z.state.spotShadow,Ee.rectAreaLights.value=z.state.rectArea,Ee.ltc_1.value=z.state.rectAreaLTC1,Ee.ltc_2.value=z.state.rectAreaLTC2,Ee.pointLights.value=z.state.point,Ee.pointLightShadows.value=z.state.pointShadow,Ee.hemisphereLights.value=z.state.hemi,Ee.sunShadowMatrix.value=z.state.sunShadowMatrix,Ee.sunShadowCascade.value=z.state.sunShadowCascade,Ee.directionalShadowMatrix.value=z.state.directionalShadowMatrix,Ee.spotLightMatrix.value=z.state.spotLightMatrix,Ee.spotLightMap.value=z.state.spotLightMap,Ee.pointShadowMatrix.value=z.state.pointShadowMatrix),H.lightProbeGrid=w.state.lightProbeGridArray.length>0,H.currentProgram=Qe,H.uniformsList=null,Qe}function zb(S){if(S.uniformsList===null){let F=S.currentProgram.getUniforms();S.uniformsList=Mc.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function Gb(S,F){let W=G.get(S);W.outputColorSpace=F.outputColorSpace,W.batching=F.batching,W.batchingColor=F.batchingColor,W.instancing=F.instancing,W.instancingColor=F.instancingColor,W.instancingMorph=F.instancingMorph,W.skinning=F.skinning,W.morphTargets=F.morphTargets,W.morphNormals=F.morphNormals,W.morphColors=F.morphColors,W.morphTargetsCount=F.morphTargetsCount,W.numClippingPlanes=F.numClippingPlanes,W.numIntersection=F.numClipIntersection,W.vertexAlphas=F.vertexAlphas,W.vertexTangents=F.vertexTangents,W.toneMapping=F.toneMapping}function pR(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;_.setFromMatrixPosition(F.matrixWorld);for(let W=0,H=S.length;W<H;W++){let z=S[W];if(z.texture!==null&&z.boundingBox.containsPoint(_))return z}return null}function mR(S,F,W,H,z){F.isScene!==!0&&(F=Pt),Y.resetTextureUnits();let pe=F.fog,xe=H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial?F.environment:null,fe=te===null?A.outputColorSpace:te.isXRRenderTarget===!0?te.texture.colorSpace:it.workingColorSpace,Me=H.isMeshStandardMaterial||H.isMeshLambertMaterial&&!H.envMap||H.isMeshPhongMaterial&&!H.envMap,Te=ie.get(H.envMap||xe,Me),Ze=H.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,Qe=!!W.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ee=!!W.morphAttributes.position,ht=!!W.morphAttributes.normal,Xt=!!W.morphAttributes.color,Tt=Hi;H.toneMapped&&(te===null||te.isXRRenderTarget===!0)&&(Tt=A.toneMapping);let Mt=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,mn=Mt!==void 0?Mt.length:0,_e=G.get(H),Dn=w.state.lights;if(st===!0&&(_t===!0||S!==q)){let Ct=S===q&&H.id===j;Ae.setState(H,S,Ct)}let ct=!1;H.version===_e.__version?(_e.needsLights&&_e.lightsStateVersion!==Dn.state.version||_e.outputColorSpace!==fe||z.isBatchedMesh&&_e.batching===!1||!z.isBatchedMesh&&_e.batching===!0||z.isBatchedMesh&&_e.batchingColor===!0&&z._colorsTexture===null||z.isBatchedMesh&&_e.batchingColor===!1&&z._colorsTexture!==null||z.isInstancedMesh&&_e.instancing===!1||!z.isInstancedMesh&&_e.instancing===!0||z.isSkinnedMesh&&_e.skinning===!1||!z.isSkinnedMesh&&_e.skinning===!0||z.isInstancedMesh&&_e.instancingColor===!0&&z.instanceColor===null||z.isInstancedMesh&&_e.instancingColor===!1&&z.instanceColor!==null||z.isInstancedMesh&&_e.instancingMorph===!0&&z.morphTexture===null||z.isInstancedMesh&&_e.instancingMorph===!1&&z.morphTexture!==null||_e.envMap!==Te||H.fog===!0&&_e.fog!==pe||_e.numClippingPlanes!==void 0&&(_e.numClippingPlanes!==Ae.numPlanes||_e.numIntersection!==Ae.numIntersection)||_e.vertexAlphas!==Ze||_e.vertexTangents!==Qe||_e.morphTargets!==Ee||_e.morphNormals!==ht||_e.morphColors!==Xt||_e.toneMapping!==Tt||_e.morphTargetsCount!==mn||!!_e.lightProbeGrid!=w.state.lightProbeGridArray.length>0)&&(ct=!0):(ct=!0,_e.__version=H.version);let li=_e.currentProgram;ct===!0&&(li=cd(H,F,z),I&&H.isNodeMaterial&&I.onUpdateProgram(H,li,_e));let $i=!1,Wr=!1,Bs=!1,xt=li.getUniforms(),zt=_e.uniforms;if(v.useProgram(li.program)&&($i=!0,Wr=!0,Bs=!0),H.id!==j&&(j=H.id,Wr=!0),_e.needsLights){let Ct=pR(w.state.lightProbeGridArray,z);_e.lightProbeGrid!==Ct&&(_e.lightProbeGrid=Ct,Wr=!0)}if($i||q!==S){v.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),xt.setValue(L,"projectionMatrix",S.projectionMatrix),xt.setValue(L,"viewMatrix",S.matrixWorldInverse);let qr=xt.map.cameraPosition;qr!==void 0&&qr.setValue(L,je.setFromMatrixPosition(S.matrixWorld)),T.logarithmicDepthBuffer&&xt.setValue(L,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&xt.setValue(L,"isOrthographic",S.isOrthographicCamera===!0),q!==S&&(q=S,Wr=!0,Bs=!0)}if(_e.needsLights&&(Dn.state.sunShadowMap.length>0&&xt.setValue(L,"sunShadowMap",Dn.state.sunShadowMap,Y),Dn.state.directionalShadowMap.length>0&&xt.setValue(L,"directionalShadowMap",Dn.state.directionalShadowMap,Y),Dn.state.spotShadowMap.length>0&&xt.setValue(L,"spotShadowMap",Dn.state.spotShadowMap,Y),Dn.state.pointShadowMap.length>0&&xt.setValue(L,"pointShadowMap",Dn.state.pointShadowMap,Y)),z.isSkinnedMesh){xt.setOptional(L,z,"bindMatrix"),xt.setOptional(L,z,"bindMatrixInverse");let Ct=z.skeleton;Ct&&(Ct.boneTexture===null&&Ct.computeBoneTexture(),xt.setValue(L,"boneTexture",Ct.boneTexture,Y))}z.isBatchedMesh&&(xt.setOptional(L,z,"batchingTexture"),xt.setValue(L,"batchingTexture",z._matricesTexture,Y),xt.setOptional(L,z,"batchingIdTexture"),xt.setValue(L,"batchingIdTexture",z._indirectTexture,Y),xt.setOptional(L,z,"batchingColorTexture"),z._colorsTexture!==null&&xt.setValue(L,"batchingColorTexture",z._colorsTexture,Y));let $r=W.morphAttributes;if(($r.position!==void 0||$r.normal!==void 0||$r.color!==void 0)&&O.update(z,W,li),(Wr||_e.receiveShadow!==z.receiveShadow)&&(_e.receiveShadow=z.receiveShadow,xt.setValue(L,"receiveShadow",z.receiveShadow)),(H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial)&&H.envMap===null&&F.environment!==null&&(zt.envMapIntensity.value=F.environmentIntensity),zt.dfgLUT!==void 0&&(zt.dfgLUT.value=M5()),Wr){if(xt.setValue(L,"toneMappingExposure",A.toneMappingExposure),_e.needsLights&&gR(zt,Bs),pe&&H.fog===!0&&De.refreshFogUniforms(zt,pe),De.refreshMaterialUniforms(zt,H,Q,$,w.state.transmissionRenderTarget[S.id]),_e.needsLights&&_e.lightProbeGrid){let Ct=_e.lightProbeGrid;zt.probesSH.value=Ct.texture,zt.probesMin.value.copy(Ct.boundingBox.min),zt.probesMax.value.copy(Ct.boundingBox.max),zt.probesResolution.value.copy(Ct.resolution)}Mc.upload(L,zb(_e),zt,Y)}if(H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Mc.upload(L,zb(_e),zt,Y),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&xt.setValue(L,"center",z.center),xt.setValue(L,"modelViewMatrix",z.modelViewMatrix),xt.setValue(L,"normalMatrix",z.normalMatrix),xt.setValue(L,"modelMatrix",z.matrixWorld),H.uniformsGroups!==void 0){let Ct=H.uniformsGroups;for(let qr=0,Vs=Ct.length;qr<Vs;qr++){let Wb=Ct[qr];ne.update(Wb,li),ne.bind(Wb,li)}}return li}function gR(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.sunLights.needsUpdate=F,S.sunLightShadows.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function yR(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return X},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return te},this.setRenderTargetTextures=function(S,F,W){let H=G.get(S);H.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),G.get(S.texture).__webglTexture=F,G.get(S.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:W,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){let W=G.get(S);W.__webglFramebuffer=F,W.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,W=0){te=S,X=F,V=W;let H=null,z=!1,pe=!1;if(S){let fe=G.get(S);if(fe.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(L.FRAMEBUFFER,fe.__webglFramebuffer),J.copy(S.viewport),he.copy(S.scissor),we=S.scissorTest,v.viewport(J),v.scissor(he),v.setScissorTest(we),j=-1;return}else if(fe.__webglFramebuffer===void 0)Y.setupRenderTarget(S);else if(fe.__hasExternalTextures)Y.rebindTextures(S,G.get(S.texture).__webglTexture,G.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let Ze=S.depthTexture;if(fe.__boundDepthTexture!==Ze){if(Ze!==null&&G.has(Ze)&&(S.width!==Ze.image.width||S.height!==Ze.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Y.setupDepthRenderbuffer(S)}}let Me=S.texture;(Me.isData3DTexture||Me.isDataArrayTexture||Me.isCompressedArrayTexture)&&(pe=!0);let Te=G.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Te[F])?H=Te[F][W]:H=Te[F],z=!0):S.samples>0&&Y.useMultisampledRTT(S)===!1?H=G.get(S).__webglMultisampledFramebuffer:Array.isArray(Te)?H=Te[W]:H=Te,J.copy(S.viewport),he.copy(S.scissor),we=S.scissorTest}else J.copy(ge).multiplyScalar(Q).floor(),he.copy(Xe).multiplyScalar(Q).floor(),we=St;if(W!==0&&(H=k),v.bindFramebuffer(L.FRAMEBUFFER,H)&&v.drawBuffers(S,H),v.viewport(J),v.scissor(he),v.setScissorTest(we),z){let fe=G.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+F,fe.__webglTexture,W)}else if(pe){let fe=F;for(let Me=0;Me<S.textures.length;Me++){let Te=G.get(S.textures[Me]);L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0+Me,Te.__webglTexture,W,fe)}}else if(S!==null&&W!==0){let fe=G.get(S.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,fe.__webglTexture,W)}j=-1};function jb(S){let F=G.get(S);return(F.__readFormat!==S.format||F.__readType!==S.type)&&(F.__readFormat=S.format,F.__readType=S.type,F.__formatReadable=T.textureFormatReadable(S.format),F.__typeReadable=T.textureTypeReadable(S.type)),F}this.readRenderTargetPixels=function(S,F,W,H,z,pe,xe,fe=0){if(!(S&&S.isWebGLRenderTarget)){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=G.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&xe!==void 0&&(Me=Me[xe]),Me){v.bindFramebuffer(L.FRAMEBUFFER,Me);try{let Te=S.textures[fe],Ze=Te.format,Qe=Te.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+fe);let Ee=jb(Te);if(Ee.__formatReadable===!1){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ee.__typeReadable===!1){Be("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-H&&W>=0&&W<=S.height-z&&L.readPixels(F,W,H,z,ue.convert(Ze),ue.convert(Qe),pe)}finally{let Te=te!==null?G.get(te).__webglFramebuffer:null;v.bindFramebuffer(L.FRAMEBUFFER,Te)}}},this.readRenderTargetPixelsAsync=function(S,F,W,H,z,pe,xe,fe=0){return Ve(this,null,function*(){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=G.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&xe!==void 0&&(Me=Me[xe]),Me)if(F>=0&&F<=S.width-H&&W>=0&&W<=S.height-z){v.bindFramebuffer(L.FRAMEBUFFER,Me);let Te=S.textures[fe],Ze=Te.format,Qe=Te.type;S.textures.length>1&&L.readBuffer(L.COLOR_ATTACHMENT0+fe);let Ee=jb(Te);if(Ee.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ee.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ht=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,ht),L.bufferData(L.PIXEL_PACK_BUFFER,pe.byteLength,L.STREAM_READ),L.readPixels(F,W,H,z,ue.convert(Ze),ue.convert(Qe),0),L.bindBuffer(L.PIXEL_PACK_BUFFER,null);let Xt=te!==null?G.get(te).__webglFramebuffer:null;v.bindFramebuffer(L.FRAMEBUFFER,Xt);let Tt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),yield h1(L,Tt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,ht),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,pe),L.bindBuffer(L.PIXEL_PACK_BUFFER,null),L.deleteBuffer(ht),L.deleteSync(Tt),pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")})},this.copyFramebufferToTexture=function(S,F=null,W=0){let H=Math.pow(2,-W),z=Math.floor(S.image.width*H),pe=Math.floor(S.image.height*H),xe=F!==null?F.x:0,fe=F!==null?F.y:0;Y.setTexture2D(S,0),L.copyTexSubImage2D(L.TEXTURE_2D,W,0,0,xe,fe,z,pe),v.unbindTexture()},this.copyTextureToTexture=function(S,F,W=null,H=null,z=0,pe=0){let xe,fe,Me,Te,Ze,Qe,Ee,ht,Xt,Tt=S.isCompressedTexture?S.mipmaps[pe]:S.image;if(W!==null)xe=W.max.x-W.min.x,fe=W.max.y-W.min.y,Me=W.isBox3?W.max.z-W.min.z:1,Te=W.min.x,Ze=W.min.y,Qe=W.isBox3?W.min.z:0;else{let zt=Math.pow(2,-z);xe=Math.floor(Tt.width*zt),fe=Math.floor(Tt.height*zt),S.isDataArrayTexture?Me=Tt.depth:S.isData3DTexture?Me=Math.floor(Tt.depth*zt):Me=1,Te=0,Ze=0,Qe=0}H!==null?(Ee=H.x,ht=H.y,Xt=H.z):(Ee=0,ht=0,Xt=0);let Mt=ue.convert(F.format),mn=ue.convert(F.type),_e;F.isData3DTexture?(Y.setTexture3D(F,0),_e=L.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(Y.setTexture2DArray(F,0),_e=L.TEXTURE_2D_ARRAY):(Y.setTexture2D(F,0),_e=L.TEXTURE_2D),v.activeTexture(L.TEXTURE0),v.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,F.flipY),v.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),v.pixelStorei(L.UNPACK_ALIGNMENT,F.unpackAlignment);let Dn=v.getParameter(L.UNPACK_ROW_LENGTH),ct=v.getParameter(L.UNPACK_IMAGE_HEIGHT),li=v.getParameter(L.UNPACK_SKIP_PIXELS),$i=v.getParameter(L.UNPACK_SKIP_ROWS),Wr=v.getParameter(L.UNPACK_SKIP_IMAGES);v.pixelStorei(L.UNPACK_ROW_LENGTH,Tt.width),v.pixelStorei(L.UNPACK_IMAGE_HEIGHT,Tt.height),v.pixelStorei(L.UNPACK_SKIP_PIXELS,Te),v.pixelStorei(L.UNPACK_SKIP_ROWS,Ze),v.pixelStorei(L.UNPACK_SKIP_IMAGES,Qe);let Bs=S.isDataArrayTexture||S.isData3DTexture,xt=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){let zt=G.get(S),$r=G.get(F),Ct=G.get(zt.__renderTarget),qr=G.get($r.__renderTarget);v.bindFramebuffer(L.READ_FRAMEBUFFER,Ct.__webglFramebuffer),v.bindFramebuffer(L.DRAW_FRAMEBUFFER,qr.__webglFramebuffer);for(let Vs=0;Vs<Me;Vs++)Bs&&(L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(S).__webglTexture,z,Qe+Vs),L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,G.get(F).__webglTexture,pe,Xt+Vs)),L.blitFramebuffer(Te,Ze,xe,fe,Ee,ht,xe,fe,L.DEPTH_BUFFER_BIT,L.NEAREST);v.bindFramebuffer(L.READ_FRAMEBUFFER,null),v.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else if(z!==0||S.isRenderTargetTexture||G.has(S)){let zt=G.get(S),$r=G.get(F);v.bindFramebuffer(L.READ_FRAMEBUFFER,P),v.bindFramebuffer(L.DRAW_FRAMEBUFFER,B);for(let Ct=0;Ct<Me;Ct++)Bs?L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,zt.__webglTexture,z,Qe+Ct):L.framebufferTexture2D(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,zt.__webglTexture,z),xt?L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,$r.__webglTexture,pe,Xt+Ct):L.framebufferTexture2D(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_2D,$r.__webglTexture,pe),z!==0?L.blitFramebuffer(Te,Ze,xe,fe,Ee,ht,xe,fe,L.COLOR_BUFFER_BIT,L.NEAREST):xt?L.copyTexSubImage3D(_e,pe,Ee,ht,Xt+Ct,Te,Ze,xe,fe):L.copyTexSubImage2D(_e,pe,Ee,ht,Te,Ze,xe,fe);v.bindFramebuffer(L.READ_FRAMEBUFFER,null),v.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else xt?S.isDataTexture||S.isData3DTexture?L.texSubImage3D(_e,pe,Ee,ht,Xt,xe,fe,Me,Mt,mn,Tt.data):F.isCompressedArrayTexture?L.compressedTexSubImage3D(_e,pe,Ee,ht,Xt,xe,fe,Me,Mt,Tt.data):L.texSubImage3D(_e,pe,Ee,ht,Xt,xe,fe,Me,Mt,mn,Tt):S.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,pe,Ee,ht,xe,fe,Mt,mn,Tt.data):S.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,pe,Ee,ht,Tt.width,Tt.height,Mt,Tt.data):L.texSubImage2D(L.TEXTURE_2D,pe,Ee,ht,xe,fe,Mt,mn,Tt);v.pixelStorei(L.UNPACK_ROW_LENGTH,Dn),v.pixelStorei(L.UNPACK_IMAGE_HEIGHT,ct),v.pixelStorei(L.UNPACK_SKIP_PIXELS,li),v.pixelStorei(L.UNPACK_SKIP_ROWS,$i),v.pixelStorei(L.UNPACK_SKIP_IMAGES,Wr),pe===0&&F.generateMipmaps&&L.generateMipmap(_e),v.unbindTexture()},this.initRenderTarget=function(S){G.get(S).__webglFramebuffer===void 0&&Y.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Y.setTextureCube(S,0):S.isData3DTexture?Y.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Y.setTexture2DArray(S,0):Y.setTexture2D(S,0),v.unbindTexture()},this.resetState=function(){X=0,V=0,te=null,v.reset(),me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Bi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=it._getDrawingBufferColorSpace(e),t.unpackColorSpace=it._getUnpackColorSpace()}};var yg=class{id;position;index;x;y;vx;vy;fx;fy;visible=!0;isClustered=!1;isClusterRepresentative=!1;_cachedMesh=void 0;constructor(e,t){this.id=e,this.position=t,this.x=t.x,this.y=t.y}get mesh(){return this._cachedMesh}set mesh(e){this._cachedMesh=e}};var Z1=new Map;function vg(n,e){Z1.set(n,e)}function Ib(n){return Z1.get(n)}function J1(n=16,e=136){let t=new OffscreenCanvas(n,n),i=t.getContext("2d");i.fillStyle=`rgb(${e}, ${e}, ${e})`,i.fillRect(0,0,n,n);let r=new Iu(t);return r.minFilter=Jt,r.magFilter=Jt,r.generateMipmaps=!1,r.needsUpdate=!0,r}function K1(n,e){return{x:(n.clientX-e.left)/e.width*2-1,y:-((n.clientY-e.top)/e.height)*2+1}}function Q1(n,e,t,i,r){let o=e.domElement.getBoundingClientRect(),s=K1(n,o),a=null,c=1/0,l=r.hitTolerance,u=new R;for(let d of t){d.getWorldPosition(u).project(i);let f=(s.x-u.x)*o.width/2,h=(s.y-u.y)*o.height/2,g=Math.sqrt(f*f+h*h);g<l&&g<c&&(a=d,c=g)}return a}function ape(n,e,t,i,r){return Q1(n,e,t.children,i,r)}function cpe(n,e,t,i,r){return t.length===0?null:Q1(n,e,t,i,r)}function lpe(n,e,t){let i=e.domElement.getBoundingClientRect(),r=K1(n,i),o=t.position.x+r.x*(t.right-t.left)/2/t.zoom,s=t.position.y+r.y*(t.top-t.bottom)/2/t.zoom;return{x:o,y:s}}function upe(n,e,t,i){let r=t.clientX-e.x,o=t.clientY-e.y,s=.8,a=1/n.zoom,c=-r*a*s,l=o*a*s,u=new R,d=new R(1,0,0),f=new R(0,1,0);u.add(d.multiplyScalar(c)),u.add(f.multiplyScalar(l)),n.position.add(u),i.add(u),n.lookAt(i),n.updateProjectionMatrix()}function dpe(n,e,t){let i=new R;n.getWorldPosition(i);let r=t.getBoundingClientRect(),o=i.clone().project(e),s=(o.x+1)/2*r.width+r.left,a=(-o.y+1)/2*r.height+r.top;return new ye(s,a)}function fpe(n,e,t,i,r,o=50){let s=t.maxX-t.minX,a=t.maxY-t.minY;if(s===0||a===0)return{x:0,y:0};let l=(n-t.minX)/s*o,u=o/s,d=(e-t.minY)*u,f=(l-o/2)*(i/o),h=(d-a*u/2)*(r/(a*u));return{x:f,y:h}}function hpe(n,e,t=.01){return Math.abs(n-e)<t}function ppe(n,e,t,i){if(!n||!e||!t)return;let{filename:r="three-scene.png",scaleFactor:o=1,restoreAfterExport:s=!0,canvasElement:a=n.domElement}=i||{},c=a.clientWidth,l=a.clientHeight,u=new ye;n.getSize(u);let d=n.getPixelRatio();n.setPixelRatio(window.devicePixelRatio*o),n.setSize(c,l,!1),n.render(e,t);let f=n.domElement.toDataURL("image/png"),h=document.createElement("a");h.href=f,h.download=r,document.body.appendChild(h),h.click(),document.body.removeChild(h),s&&(n.setPixelRatio(d),n.setSize(u.x,u.y,!1),n.render(e,t))}var _g=class{constructor(e,t){this.glyphId=e;this.renderConfig=t}glyphId;renderConfig;render(e,t,i){let r=J1(),o=new _i(t.radius*2,t.radius*2),s=new Qt({map:r,transparent:!0}),a=new mt(o,s),c=`${this.renderConfig.loadedData}/${this.glyphId}.jpg`;if(this.renderConfig.dataSource==="wasm"&&this.renderConfig.thumbnailResolver)this.renderConfig.thumbnailResolver.requestThumb(c).subscribe(l=>{l&&this.applyThumbnailTexture(l,a,s,t)});else{let l=new Image;l.src=`assets/thumbnails/${this.renderConfig.loadedData}/${this.glyphId}.jpg`,l.crossOrigin="anonymous",l.onload=()=>{this.applyThumbnailTexture(l,a,s,t)},l.onerror=()=>{console.warn(`Failed to load thumbnail from local: ${l.src}`)}}return a}applyThumbnailTexture(e,t,i,r){let o=e.width,s=e.height,a=r.radius*3,c=a/o,l=a/s,u=Math.min(c,l,1),d=o*u,f=s*u,h=new _i(d,f);t.geometry.dispose(),t.geometry=h;let g=new bi(e);g.needsUpdate=!0,g.minFilter=$t,g.magFilter=$t,g.colorSpace=Bn,i.map=g,i.needsUpdate=!0,this.renderConfig.onReRender?.()}};var xg={circles:new Map,rings:new Map},eR=new Map;function Rb(n,e){let t=`${n}_${e?.side??pr}_${e?.transparent??!1}_${e?.opacity??1}_${e?.depthTest??!0}`,i=eR.get(t);return i||(i=new Qt(Re({color:n},e)),eR.set(t,i)),i}function bg(n,e=32){let t=`${n.toFixed(2)}_${e}`,i=xg.circles.get(t);return i||(i=new Nu(n,e),xg.circles.set(t,i)),i}function Nb(n,e,t=32){let i=`${n.toFixed(2)}_${e.toFixed(2)}_${t}`,r=xg.rings.get(i);return r||(r=new Hu(n,e,t),xg.rings.set(i,r)),r}function wc(n,e,t){if(!(e.currentZoomLevel===2&&t.useBackground))return;let r=bg(e.radius,32),o=new Qt({color:15790320});if(t.highlighted){let s=new rt(t.highlightColor);s.lerp(new rt(16777215),.6),o.color.copy(s)}if(n.add(new mt(r,o)),t.useContour){let s=e.radius*.01,a=Nb(e.radius-s,e.radius,32),c=new Qt({color:13421772,side:Ht,depthTest:!1}),l=new mt(a,c);l.renderOrder=999,n.add(l)}}function Cc(n,e,t,i){if(!(t.currentZoomLevel===2&&i.useCoordinateSystem))return;let o=10526880,s=t.contourThickness/3;for(let a=0;a<e;a++){let c=a/e*Math.PI*2,l=new _i(s,t.radius);l.translate(0,t.radius/2,0);let u=new Qt({color:o,side:Ht}),d=new mt(l,u);d.rotation.z=c-Math.PI/2,n.add(d)}}function Tc(n,e,t,i){if(e.every(r=>r<=.001)){let r=bg(t.getRadius(0)/4,16),o=new Qt({color:i,side:Ht,transparent:!0,opacity:.6});return n.add(new mt(r,o)),!0}return!1}var tR=new oi,Sg=new R,Dc=class extends $u{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new It(e,3)),this.setAttribute("uv",new It(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new Fo(t,6,1);return this.setAttribute("instanceStart",new Vi(i,3,0)),this.setAttribute("instanceEnd",new Vi(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new Fo(t,6,1);return this.setAttribute("instanceColorStart",new Vi(i,3,0)),this.setAttribute("instanceColorEnd",new Vi(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new zu(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new oi);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),tR.setFromBufferAttribute(t),this.boundingBox.union(tR))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new hr),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let r=0;for(let o=0,s=e.count;o<s;o++)Sg.fromBufferAttribute(e,o),r=Math.max(r,i.distanceToSquared(Sg)),Sg.fromBufferAttribute(t,o),r=Math.max(r,i.distanceToSquared(Sg));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};re.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ye},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Gn.line={uniforms:id.merge([re.common,re.fog,re.line]),vertexShader:`
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
		`};var yr=class extends Hn{constructor(e){super({type:"LineMaterial",uniforms:id.clone(Gn.line.uniforms),vertexShader:Gn.line.vertexShader,fragmentShader:Gn.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Pb=new vt,nR=new R,iR=new R,dn=new vt,fn=new vt,vr=new vt,Fb=new R,Ob=new Nt,hn=new qu,rR=new R,Mg=new oi,Eg=new hr,_r=new vt,xr,Us;function oR(n,e,t){return _r.set(0,0,-e,1).applyMatrix4(n.projectionMatrix),_r.multiplyScalar(1/_r.w),_r.x=Us/t.width,_r.y=Us/t.height,_r.applyMatrix4(n.projectionMatrixInverse),_r.multiplyScalar(1/_r.w),Math.abs(Math.max(_r.x,_r.y))}function w5(n,e){let t=n.matrixWorld,i=n.geometry,r=i.attributes.instanceStart,o=i.attributes.instanceEnd,s=Math.min(i.instanceCount,r.count);for(let a=0,c=s;a<c;a++){hn.start.fromBufferAttribute(r,a),hn.end.fromBufferAttribute(o,a),hn.applyMatrix4(t);let l=new R,u=new R;xr.distanceSqToSegment(hn.start,hn.end,u,l),u.distanceTo(l)<Us*.5&&e.push({point:u,pointOnLine:l,distance:xr.origin.distanceTo(u),object:n,face:null,faceIndex:a,uv:null,uv1:null})}}function C5(n,e,t){let i=e.projectionMatrix,o=n.material.resolution,s=n.matrixWorld,a=n.geometry,c=a.attributes.instanceStart,l=a.attributes.instanceEnd,u=Math.min(a.instanceCount,c.count),d=-e.near;xr.at(1,vr),vr.w=1,vr.applyMatrix4(e.matrixWorldInverse),vr.applyMatrix4(i),vr.multiplyScalar(1/vr.w),vr.x*=o.x/2,vr.y*=o.y/2,vr.z=0,Fb.copy(vr),Ob.multiplyMatrices(e.matrixWorldInverse,s);for(let f=0,h=u;f<h;f++){if(dn.fromBufferAttribute(c,f),fn.fromBufferAttribute(l,f),dn.w=1,fn.w=1,dn.applyMatrix4(Ob),fn.applyMatrix4(Ob),dn.z>d&&fn.z>d)continue;if(dn.z>d){let E=dn.z-fn.z,_=(dn.z-d)/E;dn.lerp(fn,_)}else if(fn.z>d){let E=fn.z-dn.z,_=(fn.z-d)/E;fn.lerp(dn,_)}dn.applyMatrix4(i),fn.applyMatrix4(i),dn.multiplyScalar(1/dn.w),fn.multiplyScalar(1/fn.w),dn.x*=o.x/2,dn.y*=o.y/2,fn.x*=o.x/2,fn.y*=o.y/2,hn.start.copy(dn),hn.start.z=0,hn.end.copy(fn),hn.end.z=0;let y=hn.closestPointToPointParameter(Fb,!0);hn.at(y,rR);let p=lb.lerp(dn.z,fn.z,y),m=p>=-1&&p<=1,x=Fb.distanceTo(rR)<Us*.5;if(m&&x){hn.start.fromBufferAttribute(c,f),hn.end.fromBufferAttribute(l,f),hn.start.applyMatrix4(s),hn.end.applyMatrix4(s);let E=new R,_=new R;xr.distanceSqToSegment(hn.start,hn.end,_,E),t.push({point:_,pointOnLine:E,distance:xr.origin.distanceTo(_),object:n,face:null,faceIndex:f,uv:null,uv1:null})}}}var wg=class extends mt{constructor(e=new Dc,t=new yr({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let s=0,a=0,c=t.count;s<c;s++,a+=2)nR.fromBufferAttribute(t,s),iR.fromBufferAttribute(i,s),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+nR.distanceTo(iR);let o=new Fo(r,2,1);return e.setAttribute("instanceDistanceStart",new Vi(o,1,0)),e.setAttribute("instanceDistanceEnd",new Vi(o,1,1)),this}raycast(e,t){let i=this.material.worldUnits,r=e.camera;if(r===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let o=e.params.Line2!==void 0&&e.params.Line2.threshold||0;xr=e.ray;let s=this.matrixWorld,a=this.geometry,c=this.material;Us=c.linewidth+o,a.boundingSphere===null&&a.computeBoundingSphere(),Eg.copy(a.boundingSphere).applyMatrix4(s);let l;if(i)l=Us*.5;else{let d=Math.max(r.near,Eg.distanceToPoint(xr.origin));l=oR(r,d,c.resolution)}if(Eg.radius+=l,xr.intersectsSphere(Eg)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),Mg.copy(a.boundingBox).applyMatrix4(s);let u;if(i)u=Us*.5;else{let d=Math.max(r.near,Mg.distanceToPoint(xr.origin));u=oR(r,d,c.resolution)}Mg.expandByScalar(u),xr.intersectsBox(Mg)!==!1&&(i?w5(this,t):C5(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Pb),this.material.uniforms.resolution.value.set(Pb.z,Pb.w))}};var Bo=class extends Dc{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setPositions(i),this}setColors(e){let t=e.length-3,i=new Float32Array(2*t);for(let r=0;r<t;r+=3)i[2*r]=e[r],i[2*r+1]=e[r+1],i[2*r+2]=e[r+2],i[2*r+3]=e[r+3],i[2*r+4]=e[r+4],i[2*r+5]=e[r+5];return super.setColors(i),this}setFromPoints(e){let t=e.length-1,i=new Float32Array(6*t);for(let r=0;r<t;r++)i[6*r]=e[r].x,i[6*r+1]=e[r].y,i[6*r+2]=e[r].z||0,i[6*r+3]=e[r+1].x,i[6*r+4]=e[r+1].y,i[6*r+5]=e[r+1].z||0;return super.setPositions(i),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}};var Ac=class extends wg{constructor(e=new Bo,t=new yr({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}};var Cg=class{render(e,t,i){let r=new ii;wc(r,t,e);let{featureMap:o,keys:s,values:a,featureMaxValues:c,segments:l,color:u}=e;if(s.length===0||(Cc(r,l,t,e),Tc(r,a,t,u)))return r;let d=[];s.forEach((g,y)=>{let p=y/l*Math.PI*2,m=+o[g]||0,x=c[y]||1,E=i?m:m/x,_=Math.cos(p)*t.radius*E,M=Math.sin(p)*t.radius*E;d.push(new ye(_,M))});let f=new Io(d),h=new Qt({color:u,side:Ht,transparent:!0,opacity:.6});if(r.add(new mt(new Ns(f),h)),e.useContour){let g=[...d.map(E=>new R(E.x,E.y,0))];g.push(g[0].clone());let y=[];g.forEach(E=>y.push(E.x,E.y,E.z));let p=new Bo;p.setPositions(y);let m=new yr({color:u,linewidth:t.contourThickness,transparent:!0,opacity:.9}),x=new Ac(p,m);x.computeLineDistances(),x.scale.set(1,1,1),r.add(x)}return r}};var Tg=class{render(e,t,i){let r=new ii;wc(r,t,e);let{featureMap:o,keys:s,values:a,featureMaxValues:c,segments:l,color:u}=e;return s.length===0||(Cc(r,l,t,e),Tc(r,a,t,u))||s.forEach((d,f)=>{let h=+o[d]||0;if(h<=0)return;let g=c[f]||1,y=i?h:h/g,p=t.radius*y,m=p*.4,x=new Io;x.moveTo(0,0),x.bezierCurveTo(m*.25,-p*.3,m*.6,-p*.75,0,-p),x.bezierCurveTo(-m*.6,-p*.75,-m*.25,-p*.3,0,0);let E=new Ns(x),_=new Qt({color:u,transparent:!0,opacity:.6,side:Ht}),M=new mt(E,_),w=f/l*Math.PI*2;if(M.rotation.z=w-3*Math.PI/2,r.add(M),e.useContour){let D=[];x.getPoints(50).forEach(k=>D.push(new R(k.x,k.y,0))),D.push(D[0].clone());let C=[];D.forEach(k=>C.push(k.x,k.y,k.z));let A=new Bo;A.setPositions(C);let N=new yr({color:u,linewidth:t.contourThickness,transparent:!0,opacity:.9}),I=new Ac(A,N);I.computeLineDistances(),I.scale.set(1,1,1),I.rotation.z=w-3*Math.PI/2,r.add(I)}}),r}};var Dg=class{render(e,t,i){let r=new ii;wc(r,t,e);let{featureMap:o,keys:s,values:a,featureMaxValues:c,segments:l,color:u}=e;return s.length===0||(Cc(r,l,t,e),Tc(r,a,t,u))||s.forEach((d,f)=>{let h=+o[d]||0;if(h<=0)return;let g=c[f]||1,y=i?h:h/g,p=t.radius*y,m=.8,x=p,E=f/l*Math.PI*2,_=new jr;_.rotation.z=E-3*Math.PI/2;let M=new _i(m,x),w=new Qt({color:u,transparent:!0,opacity:.8,side:Ht,depthWrite:!1}),D=new mt(M,w);D.position.y=-x/2,_.add(D),r.add(_)}),r}};vg(1,new Cg);vg(2,new Tg);vg(3,new Dg);var Ag=class{id;positions={};defaultcontext=0;features;values;metadata;currentContext=1;renderCache=new Map;passive=!1;highlighted=!1;isInLense=!1;lensCenter=new R(0,0,0);highlightColor=10168141;passivecolor=14737632;constructor(e){this.id=e}getPosition(e,t){return this.positions[e][t]}clearCache(e){this.renderCache.delete(e)}getCacheObject(e=0,t,i){let r=this.renderCache.get(e);return r==null&&(r=new yg(this.id,Re({},this.getPosition(t,i))),this.renderCache.set(e,r)),r}getMesh(e,t,i=0){return this.getCacheObject(i,e,t).mesh}setHighlighted(e){this.highlighted!==e&&(this.highlighted=e)}getCurrentColor(e,t=!1){if(this.highlighted&&!t)return this.highlightColor;if(this.passive&&!t)return this.passivecolor;let i=52360;if(this.features!=null){let r=lp(this.features[1][e.colorFeature],e.colorFeature,e.featureTypes,e.featureMaxValues),o=e.colorScale;o&&(i=o(r))}return i}render(e,t,i,r,o,s){let a=this.renderGlyph(e,t,i,r,o,s),c=this.getCacheObject(r,t,i);return a&&(c.mesh=a),a}renderGlyph(e,t,i,r,o,s){let a=this.getCacheObject(r,t,i),c=a.mesh,l;if(e.currentZoomLevel===0){if(o&&a.isClustered&&!a.isClusterRepresentative)return null;let f=this.getCurrentColor(s);if(a.isClusterRepresentative&&o){let h=Nb(e.radius-1,e.radius,24),g=Rb(f,{side:Ht});l=new mt(h,g)}else{let h=bg(e.radius,24),g=Rb(f);l=new mt(h,g)}}else{let f=s.glyphType;if(f===5)l=new _g(this.id,s).render(this.buildRenderContext(e,s),e,s.scaleLinear);else{let h=Ib(f);h?l=h.render(this.buildRenderContext(e,s),e,s.scaleLinear):l=Ib(2).render(this.buildRenderContext(e,s),e,s.scaleLinear)}}let u=c?c.position.x:a.x??0,d=c?c.position.y:a.y??0;return l.position.set(u,d,0),l.userData={item:new WeakRef(this)},l.renderOrder=this.passive?1:99,l}buildRenderContext(e,t){let i=this.getFeatureContext(this.currentContext,t),r=this.getCurrentColor(t,e.currentZoomLevel===2);return{featureMap:i?.featureMap??{},keys:i?.keys??[],values:i?.values??[],featureMaxValues:i?.featureMaxValues??[],segments:i?.segments??0,color:r,useContour:t.useContour,useBackground:t.useBackground,useCoordinateSystem:t.useCoordinateSystem,highlighted:this.highlighted,highlightColor:this.highlightColor}}getFeatureContext(e,t){if(!this.features)return null;let i=Object.fromEntries(Object.entries(this.features[e]||{}).filter(([u])=>t.activeFeatures.includes(u))),r=Object.keys(i),o=r.map(u=>+i[u]),s=t.featureMaxValues,a=r.map(u=>s[u]??1),c=Math.max(...o)||1,l=r.length;return{featureMap:i,keys:r,values:o,featureMaxValues:a,localMaxValue:c,segments:l}}};var Ig=class n{glyphCache=new Map;metaCache=new Map;schemaCache=new Map;getGlyphMap(e){return this.glyphCache.get(e)}getSchemaMap(e){return this.schemaCache.get(e)}getMetaMap(e){return this.metaCache.get(e)}deleteDataset(e){this.glyphCache.delete(e),this.schemaCache.delete(e),this.metaCache.delete(e)}buildDataSet(e,t,i,r,o,s){this.getOrCreateSubMap(this.schemaCache,e).set(t,i),this.getOrCreateSubMap(this.metaCache,e).set(t,r);let l=this.getOrCreateSubMap(this.glyphCache,e);for(let u of o){let d=String(u.id),f=l.get(d);f||(f=new Ag(d),f.features=u.features,f.values=u.values,f.metadata=u.metadata,f.defaultcontext=u.defaultcontext?parseInt(u.defaultcontext):1,f.positions={},l.set(d,f)),f.positions[t]||(f.positions[t]={})}for(let[u,d]of s)for(let f of d){let h=String(f.id),g=l.get(h);g&&(g.positions[t][u]=Re({},f.position))}return l.size}getOrCreateSubMap(e,t){let i=e.get(t);return i||(i=new Map,e.set(t,i)),i}static \u0275fac=function(t){return new(t||n)};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var Rg=class n{constructor(e){this.config=e}config;applySchemaToConfig(e){this.config.colorFeature=e.color,this.config.replaceActiveFeatures(e.glyph),this.config.featureLabels=e.label,this.config.metadataLabels=e.metadata??{},e.colorScaleId!==void 0?this.config.colorRange=e.colorScaleId:e.colorRange!==void 0&&(this.config.colorRange=e.colorRange?0:4),e.types&&(this.config.featureTypes=e.types)}calculateFeatureMaxValues(e){let t=this.config.featureTypes,i={};e.forEach(r=>{let o=r.features[1];o&&Object.keys(t).forEach(s=>{if(t[s]==="categorical"){let a=o[s];a!==void 0&&(i[s]=Math.max(i[s]||0,a))}})}),this.config.featureMaxValues=i}extractFeatureMaxValuesFromMeta(e){if(!e||!e.features)return;let t={};Object.entries(e.features).forEach(([i,r])=>{r.max!==void 0&&(t[i]=r.max)}),this.config.featureMaxValues=t}static \u0275fac=function(t){return new(t||n)(lt(Wa))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var sR=class n{constructor(e,t,i,r,o,s,a,c,l){this.http=e;this.config=t;this.dataProcessor=i;this.datasetStorage=r;this.toast=o;this.filterService=s;this.collectionSvc=a;this.cacheSvc=c;this.schemaSyncSvc=l;this.dataSetCollectionSubject$=this.collectionSvc.dataSetCollectionSubject$,this.loadDatasets(fp),this.loadSavedDatasets()}http;config;dataProcessor;datasetStorage;toast;filterService;collectionSvc;cacheSvc;schemaSyncSvc;dataSetCollectionSubject$;loadDatasets(e){e.forEach(t=>{t.items.forEach(i=>{let r="assets/data/",o=i.algorithms,s=t.dataset,a=i.time,c={schema:this.http.get(r+o.schema),meta:this.http.get(r+o.meta),feature:this.http.get(r+o.feature)},l=Object.keys(o.position);l.forEach(u=>{c[u]=this.http.get(r+o.position[u])}),Pc(c).subscribe({next:u=>{let d=u.schema,f=u.meta,h=u.feature,g=new Map;l.forEach(p=>{g.set(p,u[p])});let y=this.cacheSvc.buildDataSet(s,a,d,f,h,g);this.filterService.totalItems||(this.filterService.totalItems=y,this.filterService.filteredItems=y,this.schemaSyncSvc.applySchemaToConfig(d),this.config.updateConfiguration(),this.config.loadData(s))},error:u=>{console.error(`[DataLoader] Failed to load dataset "${s}":`,u),this.toast.error(`Failed to load dataset "${s}"`)}})})})}loadSavedDatasets(){return Ve(this,null,function*(){try{let e=yield this.datasetStorage.getAllDatasets();for(let t of e){let i=new Map;for(let[s,a]of Object.entries(t.positions))i.set(s,a);this.cacheSvc.buildDataSet(t.name,t.timestamp,t.schema,t.meta,t.features,i);let r={};for(let s of Object.keys(t.positions))r[s]=`memory://${t.name}/${t.timestamp}/${s}`;let o={dataset:t.name,source:"indexeddb",items:[{time:t.timestamp,algorithms:{schema:`memory://${t.name}/${t.timestamp}/schema`,meta:`memory://${t.name}/${t.timestamp}/meta`,feature:`memory://${t.name}/${t.timestamp}/features`,position:r}}]};this.collectionSvc.setDatasetCollection([o])}}catch(e){console.warn("[DataLoader] Failed to load saved datasets from IndexedDB:",e)}})}saveDatasetToStorage(e,t){return Ve(this,null,function*(){try{let i=this.cacheSvc.getSchemaMap(e)?.get(t),r=this.cacheSvc.getMetaMap(e)?.get(t);if(!i||!r){console.warn("[DataLoader] Cannot save to IndexedDB - missing schema or meta for:",e);return}let o=this.cacheSvc.getGlyphMap(e);if(!o)return;let s=[],a={};o.forEach(u=>{if(s.push(Re({id:u.id,defaultcontext:String(u.defaultcontext),features:u.features,values:u.values??{}},u.metadata?{metadata:u.metadata}:{})),u.positions[t])for(let[d,f]of Object.entries(u.positions[t]))a[d]||(a[d]=[]),a[d].push({id:u.id,position:f})});let c={name:e,timestamp:t,savedAt:Date.now(),schema:i,meta:r,features:s,positions:a};yield this.datasetStorage.saveDataset(c);let l=this.collectionSvc.getCollectionEntry(e);l&&(l.source="indexeddb",this.collectionSvc.notifyChange())}catch(i){console.warn("[DataLoader] Failed to save dataset to IndexedDB:",i)}})}deleteDataset(e){return Ve(this,null,function*(){let t=this.collectionSvc.getCollectionEntry(e);if(!t||t.source==="local")return!1;yield this.datasetStorage.deleteDataset(e),this.cacheSvc.deleteDataset(e),this.collectionSvc.removeDataset(e);let i=this.collectionSvc.getCollection();return this.config.loadedData===e&&i.length>0&&this.config.loadData(i[0].dataset),!0})}getGlyphDataSync(){return this.cacheSvc.getGlyphMap(this.config.loadedData)}getGlyphData(e,t,i){return Ve(this,null,function*(){let r=this.resolveDatasetParams(e,t||void 0);if(!r)return;let o=this.collectionSvc.getCollectionEntry(r.name),s=this.cacheSvc.getGlyphMap(r.name);return s||(yield this.loadDataSet(r.name,r.timestamp),s=this.cacheSvc.getGlyphMap(r.name)),s&&(this.filterService.totalItems=s.size,this.filterService.setActiveGlyphData(s)),this.filterService.filteredItems=this.filterService.totalItems,o&&(this.config.dataSource=o.source),s?Array.from(s.values()):void 0})}getMetaData(e,t){return Ve(this,null,function*(){let i=this.resolveDatasetParams(e,t);if(!i)return;let r=this.cacheSvc.getMetaMap(i.name);return r||(yield this.loadDataSet(i.name,i.timestamp),r=this.cacheSvc.getMetaMap(i.name)),r?.get(i.timestamp)})}getSchema(e,t){return Ve(this,null,function*(){let i=this.resolveDatasetParams(e,t);if(!i)return;let r=this.cacheSvc.getSchemaMap(i.name);r||(yield this.loadDataSet(i.name,i.timestamp),r=this.cacheSvc.getSchemaMap(i.name));let o=r?.get(i.timestamp);if(o){this.schemaSyncSvc.applySchemaToConfig(o);let s=this.cacheSvc.getGlyphMap(i.name);s&&this.schemaSyncSvc.calculateFeatureMaxValues(s)}return o})}getTimestamps(e){return this.collectionSvc.getTimestamps(e)}getPositions(e,t){return this.collectionSvc.getPositions(e,t)}getContexts(e,t){return this.collectionSvc.getContexts(e,t)}getDataSetNames(){return this.collectionSvc.getDataSetNames()}getGlyphMap(e){return this.cacheSvc.getGlyphMap(e)}getSchemaMap(e){return this.cacheSvc.getSchemaMap(e)}setDatasetCollection(e){this.collectionSvc.setDatasetCollection(e)}loadProcessedDataset(e,t,i){this.filterService.clearFilters();let r=e.schema,o=e.meta,s=e.features,a=new Map;e.projections&&Array.isArray(e.projections)?e.projections.forEach(d=>{let f=d.data.map(h=>({id:h.id,position:{x:h.x,y:h.y}}));a.set(d.name,f)}):e.positions&&Object.entries(e.positions).forEach(([d,f])=>{a.set(d,f)}),this.cacheSvc.buildDataSet(t,i,r,o,s,a),this.schemaSyncSvc.applySchemaToConfig(r);let l=this.cacheSvc.getMetaMap(t)?.get(i);l&&this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(l),this.config.updateConfiguration(),this.config.loadData(t);let u=this.cacheSvc.getGlyphMap(t);u&&(this.filterService.totalItems=u.size,this.filterService.filteredItems=this.filterService.totalItems,this.filterService.setActiveGlyphData(u))}addProcessedDatasetToCollection(e,t,i){let r={};i.projections&&Array.isArray(i.projections)?i.projections.forEach(s=>{r[s.name]=`memory://${e}/${t}/${s.name}`}):i.positions&&Object.keys(i.positions).forEach(s=>{r[s]=`memory://${e}/${t}/${s}`});let o={dataset:e,source:"wasm",items:[{time:t,algorithms:{schema:`memory://${e}/${t}/schema`,meta:`memory://${e}/${t}/meta`,feature:`memory://${e}/${t}/features`,position:r}}]};this.collectionSvc.setDatasetCollection([o])}addPositionsToLoadedDataset(e,t,i,r){let o=this.cacheSvc.getGlyphMap(e);if(!o)return console.warn(`[DataLoader] Cannot add positions - dataset ${e} not in cache`),!1;let s=0;for(let c of r){let l=String(c.id),u=o.get(l);u&&(u.positions[t]||(u.positions[t]={}),u.positions[t][i]=Re({},c.position),s++)}let a=this.collectionSvc.getCollectionEntry(e);if(a){let c=a.items.find(l=>l.time===t);c&&!c.algorithms.position[i]&&(c.algorithms.position[i]=`memory://${e}/${t}/${i}`,this.collectionSvc.notifyChange())}return this.config.updateConfiguration(),s>0}loadDataSet(e,t){return Ve(this,null,function*(){this.filterService.clearFilters();let i=this.collectionSvc.getCollectionEntry(e),r=i?.items.find(o=>o.time===t);if(r&&i?.source==="wasm"){let o=yield this.dataProcessor.fetchJson(r.algorithms.schema),s=yield this.dataProcessor.fetchJson(r.algorithms.meta),a=yield this.dataProcessor.fetchJson(r.algorithms.feature),c=new Map;for(let[u,d]of Object.entries(r.algorithms.position)){let f=yield this.dataProcessor.fetchJson(d);c.set(u,f)}this.schemaSyncSvc.applySchemaToConfig(o),this.config.updateConfiguration();let l=this.cacheSvc.buildDataSet(e,t,o,s,a,c);this.filterService.totalItems=l,this.filterService.filteredItems=l}else if(r&&i?.source==="indexeddb"){let o=yield this.datasetStorage.getDataset(e);if(o){let s=new Map;for(let[u,d]of Object.entries(o.positions))s.set(u,d);this.schemaSyncSvc.applySchemaToConfig(o.schema),this.config.updateConfiguration();let a=this.cacheSvc.buildDataSet(e,o.timestamp,o.schema,o.meta,o.features,s);this.filterService.totalItems=a,this.filterService.filteredItems=a;let l=this.cacheSvc.getMetaMap(e)?.get(o.timestamp);l&&this.schemaSyncSvc.extractFeatureMaxValuesFromMeta(l)}}})}resolveDatasetParams(e,t){if(e===void 0&&(e=this.config.loadedData),t===void 0&&(t=this.collectionSvc.getCollectionEntry(e)?.items.at(0)?.time),!(e===void 0||t===void 0))return{name:e,timestamp:t}}static \u0275fac=function(t){return new(t||n)(lt(gh),lt(Wa),lt(up),lt(hp),lt(dp),lt(gp),lt(yp),lt(Ig),lt(Rg))};static \u0275prov=Pe({token:n,factory:n.\u0275fac,providedIn:"root"})};var A5=(n,e)=>e.group,I5=(n,e)=>e.id;function R5(n,e){if(n&1&&mo(0,"span",5),n&2){let t=ei();us("background",t.getContinuousGradient(t.selectedScale))}}function N5(n,e){if(n&1&&mo(0,"span",7),n&2){let t=e.$implicit;us("background",t)}}function P5(n,e){if(n&1&&wa(0,N5,1,2,"span",6,oh),n&2){let t=ei();Ca(t.getCategoricalColors(t.selectedScale))}}function F5(n,e){if(n&1&&mo(0,"span",5),n&2){let t=ei().$implicit,i=ei(3);us("background",i.getContinuousGradient(t))}}function O5(n,e){if(n&1&&mo(0,"span",7),n&2){let t=e.$implicit;us("background",t)}}function L5(n,e){if(n&1&&wa(0,O5,1,2,"span",6,oh),n&2){let t=ei().$implicit,i=ei(3);Ca(i.getCategoricalColors(t))}}function k5(n,e){if(n&1){let t=L_();tr(0,"div",12),Cl("click",function(){let r=Kc(t).$implicit,o=ei(3);return Qc(o.selectScale(r.id))})("keydown",function(r){Kc(t);let o=ei(3);return Qc(o.onListKeydown(r))}),tr(1,"span",13),Tl(2),yi(),Ma(3,F5,1,2,"span",3)(4,L5,2,0),yi()}if(n&2){let t=e.$implicit,i=ei(3);Da("active",t.id===i.selectedScale.id),po("aria-selected",t.id===i.selectedScale.id),Xn(2),Aa(t.name),Xn(),Ea(t.type==="numeric"?3:4)}}function U5(n,e){n&1&&mo(0,"div",11)}function B5(n,e){if(n&1&&(tr(0,"div",8)(1,"div",9),Tl(2),yi(),wa(3,k5,5,5,"div",10,I5),yi(),Ma(5,U5,1,0,"div",11)),n&2){let t=e.$implicit,i=e.$index,r=ei(2);po("aria-labelledby",r.groupLabelId(i)),Xn(),Ta("id",r.groupLabelId(i)),Xn(),Aa(t.group),Xn(),Ca(t.scales),Xn(2),Ea(i<r.groupedColorScales.length-1?5:-1)}}function V5(n,e){if(n&1&&(tr(0,"div",4),wa(1,B5,6,4,null,null,A5),yi()),n&2){let t=ei();Ta("id",t.listboxId),po("aria-labelledby",t.triggerLabelledby)("aria-label",t.ariaLabelledby?null:t.ariaLabel),Xn(),Ca(t.groupedColorScales)}}var H5=0,aR=class n{constructor(e,t){this.host=e;this.cdr=t}host;cdr;groupedColorScales=[];selectedScale;ariaLabel="Color scale";ariaLabelledby=null;scaleSelected=new Rn;uid=H5++;listboxId=`color-scale-listbox-${this.uid}`;valueId=`color-scale-value-${this.uid}`;dropdownOpen=!1;getContinuousGradient=ZA;getCategoricalColors=JA;get triggerLabelledby(){return this.ariaLabelledby?`${this.ariaLabelledby} ${this.valueId}`:null}get triggerLabel(){return this.ariaLabelledby?null:`${this.ariaLabel}: ${this.selectedScale.name}`}groupLabelId(e){return`${this.listboxId}-group-${e}`}toggleDropdown(){this.dropdownOpen?this.close(!0):this.open()}selectScale(e){this.scaleSelected.emit(e),this.close(!0)}onTriggerKeydown(e){e.key==="ArrowDown"||e.key==="ArrowUp"?(e.preventDefault(),this.open()):e.key==="Escape"&&this.dropdownOpen&&(e.preventDefault(),this.close(!0))}onListKeydown(e){let t=this.options(),i=t.findIndex(r=>r===document.activeElement);switch(e.key){case"ArrowDown":this.focusOption(Math.min(i+1,t.length-1));break;case"ArrowUp":this.focusOption(Math.max(i-1,0));break;case"Home":this.focusOption(0);break;case"End":this.focusOption(t.length-1);break;case"Enter":case" ":this.selectFocused(i);break;case"Escape":this.close(!0);break;default:return}e.preventDefault(),e.stopPropagation()}onHostClick(e){e.stopPropagation()}onDocumentClick(){this.dropdownOpen=!1}onFocusOut(e){let t=e.relatedTarget;this.dropdownOpen&&!(t instanceof Node&&this.host.nativeElement.contains(t))&&(this.dropdownOpen=!1)}open(){this.dropdownOpen=!0,this.cdr.detectChanges();let e=this.flatScales().findIndex(t=>t.id===this.selectedScale.id);this.focusOption(Math.max(e,0))}close(e){this.dropdownOpen=!1,e&&(this.cdr.detectChanges(),this.host.nativeElement.querySelector(".selected-scale")?.focus())}selectFocused(e){let t=this.flatScales()[e];t&&this.selectScale(t.id)}flatScales(){return this.groupedColorScales.flatMap(e=>e.scales)}options(){return Array.from(this.host.nativeElement.querySelectorAll('[role="option"]'))}focusOption(e){this.options()[e]?.focus()}static \u0275fac=function(t){return new(t||n)(nt(Fn),nt(fs))};static \u0275cmp=T_({type:n,selectors:[["app-color-scale-selector"]],hostBindings:function(t,i){t&1&&Ir("click",function(o){return i.onHostClick(o)})("click",function(){return i.onDocumentClick()},i_)("focusout",function(o){return i.onFocusOut(o)})},inputs:{groupedColorScales:"groupedColorScales",selectedScale:"selectedScale",ariaLabel:"ariaLabel",ariaLabelledby:"ariaLabelledby"},outputs:{scaleSelected:"scaleSelected"},decls:7,vars:8,consts:[[1,"color-scale-select"],["type","button","aria-haspopup","listbox",1,"selected-scale",3,"click","keydown"],[1,"visually-hidden",3,"id"],["aria-hidden","true",1,"color-gradient",3,"background"],["role","listbox",1,"color-scale-options",3,"id"],["aria-hidden","true",1,"color-gradient"],["aria-hidden","true",1,"color-box",3,"background"],["aria-hidden","true",1,"color-box"],["role","group"],["role","presentation",1,"color-scale-group-label",3,"id"],["role","option","tabindex","-1",1,"color-scale-option",3,"active"],["aria-hidden","true",1,"color-scale-group-divider"],["role","option","tabindex","-1",1,"color-scale-option",3,"click","keydown"],[1,"visually-hidden"]],template:function(t,i){t&1&&(tr(0,"div",0)(1,"button",1),Cl("click",function(){return i.toggleDropdown()})("keydown",function(o){return i.onTriggerKeydown(o)}),tr(2,"span",2),Tl(3),yi(),Ma(4,R5,1,2,"span",3)(5,P5,2,0),yi(),Ma(6,V5,3,3,"div",4),yi()),t&2&&(Xn(),po("aria-expanded",i.dropdownOpen)("aria-controls",i.listboxId)("aria-labelledby",i.triggerLabelledby)("aria-label",i.triggerLabel),Xn(),Ta("id",i.valueId),Xn(),Aa(i.selectedScale.name),Xn(),Ea(i.selectedScale.type==="numeric"?4:5),Xn(2),Ea(i.dropdownOpen?6:-1))},styles:[`.color-scale-select[_ngcontent-%COMP%]{position:relative;cursor:pointer;-webkit-user-select:none;user-select:none}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]{display:flex;align-items:center;gap:4px;padding:6px 8px;border-radius:8px;border:1px solid #d0d0d0;background:#fff}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:after{content:"";display:inline-block;width:12px;height:12px;margin-left:auto;flex-shrink:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:center;background-size:12px 12px}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:hover{border-color:#a0a0a0}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]   .color-gradient[_ngcontent-%COMP%], .color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]   .color-box[_ngcontent-%COMP%]{flex:1;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-options[_ngcontent-%COMP%]{position:absolute;top:100%;left:0;width:95%;background:#fff;border:1px solid #d0d0d0;border-radius:8px;box-shadow:0 4px 12px #0000001f;z-index:20;padding:4px;margin-top:4px;display:flex;flex-direction:column}.color-scale-select[_ngcontent-%COMP%]   .color-scale-group-label[_ngcontent-%COMP%]{font-size:.6875rem;font-weight:500;color:#666;letter-spacing:.06em;text-transform:uppercase;padding:4px 6px 2px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-group-divider[_ngcontent-%COMP%]{height:1px;background:#e0e0e0;margin:6px 0}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]{display:flex;gap:4px;padding:4px;border-radius:6px;cursor:pointer}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]:hover{background:#f0f5ff}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option.active[_ngcontent-%COMP%]{background:#00bcd414;outline:1px solid #00737d}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]   .color-gradient[_ngcontent-%COMP%]{width:100%;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]   .color-box[_ngcontent-%COMP%]{flex:1;height:20px;border-radius:4px}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]{width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer}.color-scale-select[_ngcontent-%COMP%]   .selected-scale[_ngcontent-%COMP%]:focus-visible{outline:2px solid #00737d;outline-offset:2px}.color-scale-select[_ngcontent-%COMP%]   .color-scale-option[_ngcontent-%COMP%]:focus-visible{outline:2px solid #00737d;outline-offset:-2px}.color-scale-select[_ngcontent-%COMP%]   .visually-hidden[_ngcontent-%COMP%]{position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0}`]})};function Cme(n,e,t=40){return(n==="categorical"||n==="text")&&e>t?"numeric":!n||n==="unknown"?e<=10?"categorical":"numeric":n==="categorical"||n==="boolean"||n==="text"?"categorical":"numeric"}function Tme(n,e){let{gap:t=1,minWidth:i=6,availableWidth:r}=e,o=Object.keys(n).map(s=>({bin:+s,value:n[s]})).filter(s=>s.value>0).sort((s,a)=>s.bin-a.bin);return uR(o,r,t,i)}function Dme(n,e,t){let{gap:i=1,minWidth:r=3,availableWidth:o}=t,s=n.map((a,c)=>({bin:c,value:a,label:e&&e[c]?e[c]:`Bin ${c}`})).filter(a=>a.value>0).sort((a,c)=>a.bin-c.bin);return uR(s,o,i,r)}function uR(n,e,t,i){let r=n.length;if(r===0)return[];let o=n.reduce((d,f)=>d+f.value,0),s=t*(r-1),a=e-s,c=n.map(d=>Math.max(d.value/o*a,i)),l=c.reduce((d,f)=>d+f,0);if(l>a){let d=a/l;c=c.map(f=>f*d)}let u=0;return n.map((d,f)=>{let h=u,g=h+c[f];return u=g+t,at(Re({},d),{x0:h,x1:g})})}function Ame(n,e){let t=n.length;if(t<=e)return n;let i=new Array(e).fill(0),r=t/e;for(let o=0;o<t;o++){let s=Math.floor(o/r);s<e&&(i[s]+=n[o])}return i}var z5=0,G5=4102444800;function j5(n){return n>z5&&n<G5}function cR(n){return new Date(n*1e3).toLocaleDateString("en-US",{month:"short",year:"numeric"})}function lR(n){return Number.isInteger(n)&&Math.abs(n)<1e4?n.toString():Math.abs(n)>=1e3?n.toLocaleString("en-US",{maximumFractionDigits:1}):n.toFixed(2)}function Ime(n,e,t,i,r){let o=(i-t)/e,s=t+n*o,a=t+(n+1)*o;return r==="date"&&j5(s)?`${cR(s)} \u2013 ${cR(a)}`:`${lR(s)} \u2013 ${lR(a)}`}function Rme(n,e){if(!e?.length)return new Map;let t=Object.keys(n).map(Number);if(t.length===e.length)return new Map(t.map(r=>[r,e[r]]));let i=Object.entries(n).filter(([,r])=>r!==0).map(([r])=>Number(r));return new Map(i.filter((r,o)=>o<e.length).map((r,o)=>[r,e[o]]))}export{an as a,Gt as b,nn as c,An as d,SR as e,ER as f,Ne as g,Yi as h,Pe as i,He as j,lt as k,be as l,Cy as m,Kc as n,Qc as o,pM as p,mM as q,Ei as r,ao as s,Rn as t,jt as u,Xo as v,ts as w,vl as x,Fn as y,oP as z,sP as A,IE as B,cP as C,RE as D,rs as E,jP as F,i_ as G,Xn as H,ma as I,ll as J,fo as K,u_ as L,fl as M,nt as N,T_ as O,Gw as P,jw as Q,wL as R,RL as S,NL as T,po as U,Ma as V,Ea as W,FL as X,oh as Y,wa as Z,Ca as _,rC as $,zf as aa,P_ as ba,oC as ca,tr as da,yi as ea,mo as fa,aC as ga,L_ as ha,Ta as ia,Ir as ja,Cl as ka,ei as la,uC as ma,jL as na,WL as oa,dC as pa,$L as qa,qL as ra,us as sa,Da as ta,r2 as ua,Tl as va,Aa as wa,k_ as xa,bC as ya,MC as za,g2 as Aa,EC as Ba,y2 as Ca,v2 as Da,ds as Ea,E2 as Fa,C2 as Ga,D2 as Ha,xK as Ia,bK as Ja,SK as Ka,fs as La,EK as Ma,hs as Na,Q2 as Oa,G_ as Pa,ck as Qa,lk as Ra,uk as Sa,hk as Ta,pk as Ua,yk as Va,Z_ as Wa,Nl as Xa,WQ as Ya,kk as Za,Vk as _a,cT as $a,$ee as ab,h3 as bb,_T as cb,Xee as db,Yee as eb,Zee as fb,lb as gb,ye as hb,R as ib,ii as jb,rt as kb,Nx as lb,oi as mb,Wu as nb,z1 as ob,MT as pb,ET as qb,ir as rb,Nh as sb,FB as tb,ou as ub,UB as vb,HB as wb,xo as xb,ape as yb,cpe as zb,lpe as Ab,upe as Bb,dpe as Cb,fpe as Db,hpe as Eb,ppe as Fb,jle as Gb,Wle as Hb,$le as Ib,ap as Jb,Xle as Kb,cp as Lb,au as Mb,Vle as Nb,ZA as Ob,JA as Pb,Hle as Qb,Wa as Rb,up as Sb,pp as Tb,mp as Ub,gp as Vb,nx as Wb,tI as Xb,dp as Yb,sR as Zb,Cme as _b,Tme as $b,Dme as ac,Ame as bc,Ime as cc,Rme as dc,aR as ec};
