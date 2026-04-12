(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,94138,(e,t,r)=>{"use strict";function a(e,t){var r=e.length;for(e.push(t);0<r;){var a=r-1>>>1,n=e[a];if(0<o(n,t))e[a]=t,e[r]=n,r=a;else break}}function n(e){return 0===e.length?null:e[0]}function i(e){if(0===e.length)return null;var t=e[0],r=e.pop();if(r!==t){e[0]=r;for(var a=0,n=e.length,i=n>>>1;a<i;){var s=2*(a+1)-1,l=e[s],c=s+1,u=e[c];if(0>o(l,r))c<n&&0>o(u,l)?(e[a]=u,e[c]=r,a=c):(e[a]=l,e[s]=r,a=s);else if(c<n&&0>o(u,r))e[a]=u,e[c]=r,a=c;else break}}return t}function o(e,t){var r=e.sortIndex-t.sortIndex;return 0!==r?r:e.id-t.id}if(r.unstable_now=void 0,"object"==typeof performance&&"function"==typeof performance.now){var s,l=performance;r.unstable_now=function(){return l.now()}}else{var c=Date,u=c.now();r.unstable_now=function(){return c.now()-u}}var d=[],f=[],m=1,h=null,p=3,v=!1,x=!1,g=!1,y=!1,b="function"==typeof setTimeout?setTimeout:null,w="function"==typeof clearTimeout?clearTimeout:null,j="u">typeof setImmediate?setImmediate:null;function M(e){for(var t=n(f);null!==t;){if(null===t.callback)i(f);else if(t.startTime<=e)i(f),t.sortIndex=t.expirationTime,a(d,t);else break;t=n(f)}}function P(e){if(g=!1,M(e),!x)if(null!==n(d))x=!0,S||(S=!0,s());else{var t=n(f);null!==t&&z(P,t.startTime-e)}}var S=!1,C=-1,k=5,E=-1;function R(){return!!y||!(r.unstable_now()-E<k)}function T(){if(y=!1,S){var e=r.unstable_now();E=e;var t=!0;try{e:{x=!1,g&&(g=!1,w(C),C=-1),v=!0;var a=p;try{t:{for(M(e),h=n(d);null!==h&&!(h.expirationTime>e&&R());){var o=h.callback;if("function"==typeof o){h.callback=null,p=h.priorityLevel;var l=o(h.expirationTime<=e);if(e=r.unstable_now(),"function"==typeof l){h.callback=l,M(e),t=!0;break t}h===n(d)&&i(d),M(e)}else i(d);h=n(d)}if(null!==h)t=!0;else{var c=n(f);null!==c&&z(P,c.startTime-e),t=!1}}break e}finally{h=null,p=a,v=!1}}}finally{t?s():S=!1}}}if("function"==typeof j)s=function(){j(T)};else if("u">typeof MessageChannel){var _=new MessageChannel,N=_.port2;_.port1.onmessage=T,s=function(){N.postMessage(null)}}else s=function(){b(T,0)};function z(e,t){C=b(function(){e(r.unstable_now())},t)}r.unstable_IdlePriority=5,r.unstable_ImmediatePriority=1,r.unstable_LowPriority=4,r.unstable_NormalPriority=3,r.unstable_Profiling=null,r.unstable_UserBlockingPriority=2,r.unstable_cancelCallback=function(e){e.callback=null},r.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):k=0<e?Math.floor(1e3/e):5},r.unstable_getCurrentPriorityLevel=function(){return p},r.unstable_next=function(e){switch(p){case 1:case 2:case 3:var t=3;break;default:t=p}var r=p;p=t;try{return e()}finally{p=r}},r.unstable_requestPaint=function(){y=!0},r.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var r=p;p=e;try{return t()}finally{p=r}},r.unstable_scheduleCallback=function(e,t,i){var o=r.unstable_now();switch(i="object"==typeof i&&null!==i&&"number"==typeof(i=i.delay)&&0<i?o+i:o,e){case 1:var l=-1;break;case 2:l=250;break;case 5:l=0x3fffffff;break;case 4:l=1e4;break;default:l=5e3}return l=i+l,e={id:m++,callback:t,priorityLevel:e,startTime:i,expirationTime:l,sortIndex:-1},i>o?(e.sortIndex=i,a(f,e),null===n(d)&&e===n(f)&&(g?(w(C),C=-1):g=!0,z(P,i-o))):(e.sortIndex=l,a(d,e),x||v||(x=!0,S||(S=!0,s()))),e},r.unstable_shouldYield=R,r.unstable_wrapCallback=function(e){var t=p;return function(){var r=p;p=t;try{return e.apply(this,arguments)}finally{p=r}}}},88440,(e,t,r)=>{"use strict";t.exports=e.r(94138)},69492,e=>{"use strict";var t,r,a=e.i(65999);function n(e,t,r){if(!e)return;if(!0===r(e))return e;let a=t?e.return:e.child;for(;a;){let e=n(a,t,r);if(e)return e;a=t?null:a.sibling}}function i(e){try{return Object.defineProperties(e,{_currentRenderer:{get:()=>null,set(){}},_currentRenderer2:{get:()=>null,set(){}}})}catch(t){return e}}"u">typeof window&&((null==(t=window.document)?void 0:t.createElement)||(null==(r=window.navigator)?void 0:r.product)==="ReactNative")?a.useLayoutEffect:a.useEffect;let o=i(a.createContext(null));class s extends a.Component{render(){return a.createElement(o.Provider,{value:this._reactInternals},this.props.children)}}function l(){let e=a.useContext(o);if(null===e)throw Error("its-fine: useFiber must be called within a <FiberProvider />!");let t=a.useId();return a.useMemo(()=>{for(let r of[e,null==e?void 0:e.alternate]){if(!r)continue;let e=n(r,!1,e=>{let r=e.memoizedState;for(;r;){if(r.memoizedState===t)return!0;r=r.next}});if(e)return e}},[e,t])}let c=Symbol.for("react.context"),u=e=>null!==e&&"object"==typeof e&&"$$typeof"in e&&e.$$typeof===c;e.s(["FiberProvider",0,s,"traverseFiber",0,n,"useContextBridge",0,function(){let e=function(){let e=l(),[t]=a.useState(()=>new Map);t.clear();let r=e;for(;r;){let e=r.type;u(e)&&e!==o&&!t.has(e)&&t.set(e,a.use(i(e))),r=r.return}return t}();return a.useMemo(()=>Array.from(e.keys()).reduce((t,r)=>n=>a.createElement(t,null,a.createElement(r.Provider,{...n,value:e.get(r)})),e=>a.createElement(s,{...e})),[e])},"useFiber",0,l])},81222,e=>{"use strict";let t=(0,e.i(54352).default)("circle-alert",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["line",{x1:"12",x2:"12",y1:"8",y2:"12",key:"1pkeuh"}],["line",{x1:"12",x2:"12.01",y1:"16",y2:"16",key:"4dfq90"}]]);e.s(["AlertCircle",0,t],81222)},90475,e=>{"use strict";let t=(0,e.i(54352).default)("loader-circle",[["path",{d:"M21 12a9 9 0 1 1-6.219-8.56",key:"13zald"}]]);e.s(["Loader2",0,t],90475)},75064,e=>{"use strict";let t=(0,e.i(54352).default)("refresh-cw",[["path",{d:"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",key:"v9h5vc"}],["path",{d:"M21 3v5h-5",key:"1q7to0"}],["path",{d:"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",key:"3uifl3"}],["path",{d:"M8 16H3v5",key:"1cv678"}]]);e.s(["RefreshCw",0,t],75064)},80760,e=>{"use strict";var t=e.i(95397);e.s(["Layers",()=>t.default])},20922,e=>{"use strict";let t,r;var a=e.i(56323),n=e.i(65999),i=e.i(94906),o=e.i(41934),s=e.i(10872),l=e.i(11334),c=e.i(3626),u=e.i(75030),d=Object.defineProperty,f=(e,t,r)=>{let a;return(a="symbol"!=typeof t?t+"":t)in e?d(e,a,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[a]=r,r};let m=(()=>{let e={uniforms:{turbidity:{value:2},rayleigh:{value:1},mieCoefficient:{value:.005},mieDirectionalG:{value:.8},sunPosition:{value:new c.Vector3},up:{value:new c.Vector3(0,1,0)}},vertexShader:`
      uniform vec3 sunPosition;
      uniform float rayleigh;
      uniform float turbidity;
      uniform float mieCoefficient;
      uniform vec3 up;

      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      // constants for atmospheric scattering
      const float e = 2.71828182845904523536028747135266249775724709369995957;
      const float pi = 3.141592653589793238462643383279502884197169;

      // wavelength of used primaries, according to preetham
      const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
      // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
      const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

      // mie stuff
      // K coefficient for the primaries
      const float v = 4.0;
      const vec3 K = vec3( 0.686, 0.678, 0.666 );
      // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
      const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

      // earth shadow hack
      // cutoffAngle = pi / 1.95;
      const float cutoffAngle = 1.6110731556870734;
      const float steepness = 1.5;
      const float EE = 1000.0;

      float sunIntensity( float zenithAngleCos ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
      }

      vec3 totalMie( float T ) {
        float c = ( 0.2 * T ) * 10E-18;
        return 0.434 * c * MieConst;
      }

      void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position.z = gl_Position.w; // set z to camera.far

        vSunDirection = normalize( sunPosition );

        vSunE = sunIntensity( dot( vSunDirection, up ) );

        vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

        float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

      // extinction (absorbtion + out scattering)
      // rayleigh coefficients
        vBetaR = totalRayleigh * rayleighCoefficient;

      // mie coefficients
        vBetaM = totalMie( turbidity ) * mieCoefficient;

      }
    `,fragmentShader:`
      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      uniform float mieDirectionalG;
      uniform vec3 up;

      const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

      // constants for atmospheric scattering
      const float pi = 3.141592653589793238462643383279502884197169;

      const float n = 1.0003; // refractive index of air
      const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

      // optical length at zenith for molecules
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;
      // 66 arc seconds -> degrees, and the cosine of that
      const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

      // 3.0 / ( 16.0 * pi )
      const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
      // 1.0 / ( 4.0 * pi )
      const float ONE_OVER_FOURPI = 0.07957747154594767;

      float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
      }

      float hgPhase( float cosTheta, float g ) {
        float g2 = pow( g, 2.0 );
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
        return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
      }

      void main() {

        vec3 direction = normalize( vWorldPosition - cameraPos );

      // optical length
      // cutoff angle at 90 to avoid singularity in next formula.
        float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;

      // combined extinction factor
        vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

      // in scattering
        float cosTheta = dot( direction, vSunDirection );

        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;

        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;

        vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

      // nightsky
        float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
        float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
        vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
        vec3 L0 = vec3( 0.1 ) * Fex;

      // composition + solar disc
        float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
        L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

        vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

        vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

        gl_FragColor = vec4( retColor, 1.0 );

      #include <tonemapping_fragment>
      #include <${u.version>=154?"colorspace_fragment":"encodings_fragment"}>

      }
    `},t=new c.ShaderMaterial({name:"SkyShader",fragmentShader:e.fragmentShader,vertexShader:e.vertexShader,uniforms:c.UniformsUtils.clone(e.uniforms),side:c.BackSide,depthWrite:!1});class r extends c.Mesh{constructor(){super(new c.BoxGeometry(1,1,1),t)}}return f(r,"SkyShader",e),f(r,"material",t),r})();function h(e,t,r=new c.Vector3){let a=Math.PI*(e-.5),n=2*Math.PI*(t-.5);return r.x=Math.cos(n),r.y=Math.sin(a),r.z=Math.sin(n),r}let p=n.forwardRef(({inclination:e=.6,azimuth:t=.1,distance:r=1e3,mieCoefficient:a=.005,mieDirectionalG:i=.8,rayleigh:o=.5,turbidity:s=10,sunPosition:u=h(e,t),...d},f)=>{let p=n.useMemo(()=>new c.Vector3().setScalar(r),[r]),[v]=n.useState(()=>new m);return n.createElement("primitive",(0,l.default)({object:v,ref:f,"material-uniforms-mieCoefficient-value":a,"material-uniforms-mieDirectionalG-value":i,"material-uniforms-rayleigh-value":o,"material-uniforms-sunPosition-value":u,"material-uniforms-turbidity-value":s,scale:p},d))});var v=e.i(84129),x=e.i(12587),g=e.i(67939);let y=new c.Vector3,b=new c.Vector3,w=new c.Vector3,j=new c.Vector2;function M(e,t,r){let a=y.setFromMatrixPosition(e.matrixWorld);a.project(t);let n=r.width/2,i=r.height/2;return[a.x*n+n,-(a.y*i)+i]}let P=e=>1e-10>Math.abs(e)?0:e;function S(e,t,r=""){let a="matrix3d(";for(let r=0;16!==r;r++)a+=P(t[r]*e.elements[r])+(15!==r?",":")");return r+a}let C=(t=[1,-1,1,1,1,-1,1,1,1,-1,1,1,1,-1,1,1],e=>S(e,t)),k=(r=e=>[1/e,1/e,1/e,1,-1/e,-1/e,-1/e,-1,1/e,1/e,1/e,1,1,1,1,1],(e,t)=>S(e,r(t),"translate(-50%,-50%)")),E=n.forwardRef(({children:e,eps:t=.001,style:r,className:a,prepend:i,center:o,fullscreen:s,portal:u,distanceFactor:d,sprite:f=!1,transform:m=!1,occlude:h,onOcclude:p,castShadow:S,receiveShadow:E,material:R,geometry:T,zIndexRange:_=[0x1000037,0],calculatePosition:N=M,as:z="div",wrapperClass:I,pointerEvents:W="auto",...L},D)=>{let{gl:F,camera:A,scene:B,size:$,raycaster:O,events:G,viewport:V}=(0,x.useThree)(),[H]=n.useState(()=>document.createElement(z)),K=n.useRef(null),U=n.useRef(null),q=n.useRef(0),Z=n.useRef([0,0]),J=n.useRef(null),Q=n.useRef(null),X=(null==u?void 0:u.current)||G.connected||F.domElement.parentNode,Y=n.useRef(null),ee=n.useRef(!1),et=n.useMemo(()=>{var e;return h&&"blending"!==h||Array.isArray(h)&&h.length&&(e=h[0])&&"object"==typeof e&&"current"in e},[h]);n.useLayoutEffect(()=>{let e=F.domElement;h&&"blending"===h?(e.style.zIndex=`${Math.floor(_[0]/2)}`,e.style.position="absolute",e.style.pointerEvents="none"):(e.style.zIndex=null,e.style.position=null,e.style.pointerEvents=null)},[h]),n.useLayoutEffect(()=>{if(U.current){let e=K.current=v.createRoot(H);if(B.updateMatrixWorld(),m)H.style.cssText="position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;";else{let e=N(U.current,A,$);H.style.cssText=`position:absolute;top:0;left:0;transform:translate3d(${e[0]}px,${e[1]}px,0);transform-origin:0 0;`}return X&&(i?X.prepend(H):X.appendChild(H)),()=>{X&&X.removeChild(H),e.unmount()}}},[X,m]),n.useLayoutEffect(()=>{I&&(H.className=I)},[I]);let er=n.useMemo(()=>m?{position:"absolute",top:0,left:0,width:$.width,height:$.height,transformStyle:"preserve-3d",pointerEvents:"none"}:{position:"absolute",transform:o?"translate3d(-50%,-50%,0)":"none",...s&&{top:-$.height/2,left:-$.width/2,width:$.width,height:$.height},...r},[r,o,s,$,m]),ea=n.useMemo(()=>({position:"absolute",pointerEvents:W}),[W]);n.useLayoutEffect(()=>{var t,i;ee.current=!1,m?null==(t=K.current)||t.render(n.createElement("div",{ref:J,style:er},n.createElement("div",{ref:Q,style:ea},n.createElement("div",{ref:D,className:a,style:r,children:e})))):null==(i=K.current)||i.render(n.createElement("div",{ref:D,style:er,className:a,children:e}))});let en=n.useRef(!0);(0,g.useFrame)(e=>{if(U.current){A.updateMatrixWorld(),U.current.updateWorldMatrix(!0,!1);let e=m?Z.current:N(U.current,A,$);if(m||Math.abs(q.current-A.zoom)>t||Math.abs(Z.current[0]-e[0])>t||Math.abs(Z.current[1]-e[1])>t){var r;let t,a,n,i,o=(r=U.current,t=y.setFromMatrixPosition(r.matrixWorld),a=b.setFromMatrixPosition(A.matrixWorld),n=t.sub(a),i=A.getWorldDirection(w),n.angleTo(i)>Math.PI/2),s=!1;et&&(Array.isArray(h)?s=h.map(e=>e.current):"blending"!==h&&(s=[B]));let l=en.current;s?en.current=function(e,t,r,a){let n=y.setFromMatrixPosition(e.matrixWorld),i=n.clone();i.project(t),j.set(i.x,i.y),r.setFromCamera(j,t);let o=r.intersectObjects(a,!0);if(o.length){let e=o[0].distance;return n.distanceTo(r.ray.origin)<e}return!0}(U.current,A,O,s)&&!o:en.current=!o,l!==en.current&&(p?p(!en.current):H.style.display=en.current?"block":"none");let u=Math.floor(_[0]/2),v=h?et?[_[0],u]:[u-1,0]:_;if(H.style.zIndex=`${function(e,t,r){if(t instanceof c.PerspectiveCamera||t instanceof c.OrthographicCamera){let a=y.setFromMatrixPosition(e.matrixWorld),n=b.setFromMatrixPosition(t.matrixWorld),i=a.distanceTo(n),o=(r[1]-r[0])/(t.far-t.near),s=r[1]-o*t.far;return Math.round(o*i+s)}}(U.current,A,v)}`,m){let[e,t]=[$.width/2,$.height/2],r=A.projectionMatrix.elements[5]*t,{isOrthographicCamera:a,top:n,left:i,bottom:o,right:s}=A,l=C(A.matrixWorldInverse),c=a?`scale(${r})translate(${P(-(s+i)/2)}px,${P((n+o)/2)}px)`:`translateZ(${r}px)`,u=U.current.matrixWorld;f&&((u=A.matrixWorldInverse.clone().transpose().copyPosition(u).scale(U.current.scale)).elements[3]=u.elements[7]=u.elements[11]=0,u.elements[15]=1),H.style.width=$.width+"px",H.style.height=$.height+"px",H.style.perspective=a?"":`${r}px`,J.current&&Q.current&&(J.current.style.transform=`${c}${l}translate(${e}px,${t}px)`,Q.current.style.transform=k(u,1/((d||10)/400)))}else{let t=void 0===d?1:function(e,t){if(t instanceof c.OrthographicCamera)return t.zoom;if(!(t instanceof c.PerspectiveCamera))return 1;{let r=y.setFromMatrixPosition(e.matrixWorld),a=b.setFromMatrixPosition(t.matrixWorld);return 1/(2*Math.tan(t.fov*Math.PI/180/2)*r.distanceTo(a))}}(U.current,A)*d;H.style.transform=`translate3d(${e[0]}px,${e[1]}px,0) scale(${t})`}Z.current=e,q.current=A.zoom}}if(!et&&Y.current&&!ee.current)if(m){if(J.current){let e=J.current.children[0];if(null!=e&&e.clientWidth&&null!=e&&e.clientHeight){let{isOrthographicCamera:t}=A;if(t||T)L.scale&&(Array.isArray(L.scale)?L.scale instanceof c.Vector3?Y.current.scale.copy(L.scale.clone().divideScalar(1)):Y.current.scale.set(1/L.scale[0],1/L.scale[1],1/L.scale[2]):Y.current.scale.setScalar(1/L.scale));else{let t=(d||10)/400,r=e.clientWidth*t,a=e.clientHeight*t;Y.current.scale.set(r,a,1)}ee.current=!0}}}else{let t=H.children[0];if(null!=t&&t.clientWidth&&null!=t&&t.clientHeight){let e=1/V.factor,r=t.clientWidth*e,a=t.clientHeight*e;Y.current.scale.set(r,a,1),ee.current=!0}Y.current.lookAt(e.camera.position)}});let ei=n.useMemo(()=>({vertexShader:m?void 0:`
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `,fragmentShader:`
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `}),[m]);return n.createElement("group",(0,l.default)({},L,{ref:U}),h&&!et&&n.createElement("mesh",{castShadow:S,receiveShadow:E,ref:Y},T||n.createElement("planeGeometry",null),R||n.createElement("shaderMaterial",{side:c.DoubleSide,vertexShader:ei.vertexShader,fragmentShader:ei.fragmentShader})))});var R=e.i(4653),T=e.i(11053),_=e.i(90475),N=e.i(54352);let z=(0,N.default)("arrow-left",[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]]);var I=e.i(80760);let W=(0,N.default)("camera",[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]]);var L=e.i(81222),D=e.i(75064),F=e.i(79789);let A=[{instanceId:"1",name:"Executive Desk",widthCm:180,depthCm:80,heightCm:75,x:200,y:100,rotation:0,color:"#4a3b32",shape:"rect"},{instanceId:"2",name:"Ergo Chair",widthCm:60,depthCm:60,heightCm:110,x:260,y:110,rotation:90,color:"#222222",shape:"round"},{instanceId:"3",name:"Bookshelf",widthCm:120,depthCm:40,heightCm:200,x:50,y:400,rotation:0,color:"#f0f0f0",shape:"rect"},{instanceId:"4",name:"L-Desk",widthCm:160,depthCm:120,heightCm:75,x:50,y:50,rotation:0,color:"#8B6914",shape:"l-left"}];function B({item:e}){let t=(e.widthCm||60)/100,r=(e.depthCm||60)/100,n=(e.heightCm||75)/100,i=e.x/100,o=e.y/100,s=(e.rotation||0)*(Math.PI/180),l=e.color||"#3b82f6",c="round"===e.shape||"circle"===e.shape,u="l-left"===e.shape||"l-right"===e.shape;return(0,a.jsxs)("group",{position:[i+t/2,0,o+r/2],rotation:[0,-s,0],children:[c?(0,a.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,position:[0,n/2,0],children:[(0,a.jsx)("cylinderGeometry",{args:[t/2,t/2,n,32]}),(0,a.jsx)("meshStandardMaterial",{color:l,roughness:.6,metalness:.15})]}):u?(0,a.jsxs)("group",{position:[-t/2,0,-r/2],children:[(0,a.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,position:[t/2,n/2,.25*r/2],children:[(0,a.jsx)("boxGeometry",{args:[t,n,.5*r]}),(0,a.jsx)("meshStandardMaterial",{color:l,roughness:.6,metalness:.15})]}),(0,a.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,position:["l-left"===e.shape?.25*t/2:.75*t+.25*t/2,n/2,.5*r+.25*r],children:[(0,a.jsx)("boxGeometry",{args:[.5*t,n,.5*r]}),(0,a.jsx)("meshStandardMaterial",{color:l,roughness:.6,metalness:.15})]})]}):(0,a.jsxs)("mesh",{castShadow:!0,receiveShadow:!0,position:[0,n/2,0],children:[(0,a.jsx)("boxGeometry",{args:[t,n,r]}),(0,a.jsx)("meshStandardMaterial",{color:l,roughness:.6,metalness:.15})]}),(0,a.jsx)(E,{position:[0,n+.25,0],center:!0,distanceFactor:8,children:(0,a.jsxs)("div",{style:{background:"rgba(255,255,255,0.92)",color:"#1a1a1a",padding:"3px 8px",borderRadius:"4px",boxShadow:"0 1px 4px rgba(0,0,0,0.12)",fontSize:"10px",whiteSpace:"nowrap",pointerEvents:"none",fontFamily:"system-ui, sans-serif",fontWeight:500,border:"1px solid rgba(0,0,0,0.08)",textAlign:"center",lineHeight:"1.4"},children:[(0,a.jsx)("div",{style:{fontWeight:600},children:e.name}),(0,a.jsxs)("div",{style:{fontSize:"9px",color:"#6b7280"},children:[e.widthCm,"×",e.depthCm,"×",e.heightCm,"cm"]})]})})]})}function $({roomWidthCm:e,roomDepthCm:t,items:r}){let i=e/100,o=t/100,s=i/2,l=o/2,u=(0,n.useMemo)(()=>new c.MeshStandardMaterial({color:"#f0ede8",roughness:.85}),[]),d=(0,n.useMemo)(()=>{let e=document.createElement("canvas");e.width=128,e.height=128;let t=e.getContext("2d");t.fillStyle="#e8e4df",t.fillRect(0,0,128,128);for(let e=0;e<128;e+=4)for(let r=0;r<128;r+=4){let a=220+15*Math.random();t.fillStyle=`rgb(${a},${a-3},${a-6})`,t.fillRect(e,r,4,4)}let r=new c.CanvasTexture(e);return r.wrapS=c.RepeatWrapping,r.wrapT=c.RepeatWrapping,r.repeat.set(2,2),new c.MeshStandardMaterial({map:r,roughness:.92,metalness:0})},[]),f=Math.max(i,o),m=Math.round(2*f);return(0,a.jsxs)("group",{position:[-s,0,-l],children:[(0,a.jsxs)("mesh",{rotation:[-Math.PI/2,0,0],position:[s,0,l],receiveShadow:!0,children:[(0,a.jsx)("planeGeometry",{args:[i,o]}),(0,a.jsx)("primitive",{object:u})]}),(0,a.jsx)("gridHelper",{args:[f,m,"#999999","#bbbbbb"],position:[s,.005,l]}),(0,a.jsxs)("mesh",{position:[s,1.5,0],castShadow:!0,receiveShadow:!0,children:[(0,a.jsx)("boxGeometry",{args:[i,3,.1]}),(0,a.jsx)("primitive",{object:d})]}),(0,a.jsxs)("mesh",{position:[s,1.5,o],castShadow:!0,receiveShadow:!0,children:[(0,a.jsx)("boxGeometry",{args:[i,3,.1]}),(0,a.jsx)("primitive",{object:d})]}),(0,a.jsxs)("mesh",{position:[0,1.5,l],castShadow:!0,receiveShadow:!0,children:[(0,a.jsx)("boxGeometry",{args:[.1,3,o]}),(0,a.jsx)("primitive",{object:d})]}),(0,a.jsxs)("mesh",{position:[i,1.5,l],castShadow:!0,receiveShadow:!0,children:[(0,a.jsx)("boxGeometry",{args:[.1,3,o]}),(0,a.jsx)("primitive",{object:d})]}),r.map(e=>(0,a.jsx)(B,{item:e},e.instanceId||e.id||Math.random().toString()))]})}e.s(["default",0,function(){(0,i.usePathname)();let e=(0,i.useRouter)(),t=new URLSearchParams(window.location.search),r=t.get("id")?Number(t.get("id")):null,{data:l,isLoading:c,isError:u,refetch:d}=(0,T.useListPlans)(void 0,{query:{queryKey:(0,T.getListPlansQueryKey)(),enabled:!r}}),f=r||(l&&l.length>0?l[0].id:null),{data:m,isLoading:h,isError:v,refetch:x}=(0,T.useGetPlan)(f||0,{query:{queryKey:(0,T.getGetPlanQueryKey)(f||0),enabled:!!f}}),[g,y]=(0,n.useState)("orbit"),b=(0,n.useMemo)(()=>{if(!m||!m.documentJson)return null;try{return JSON.parse(m.documentJson)}catch(e){return null}},[m]),w=b?.items||A,j=m?.roomWidthCm||b?.roomWidthCm||500,M=m?.roomDepthCm||b?.roomDepthCm||500,[P,S]=(0,n.useState)(!1);return((0,n.useEffect)(()=>{try{let e=document.createElement("canvas");e.getContext("webgl")||e.getContext("experimental-webgl")||S(!0)}catch(e){S(!0)}},[]),P)?(0,a.jsxs)("div",{className:"h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10",children:[(0,a.jsx)(I.Layers,{className:"w-16 h-16 text-muted-foreground opacity-30 mb-4"}),(0,a.jsx)("h2",{className:"text-2xl font-bold mb-2",children:"3D Viewer Unavailable"}),(0,a.jsx)("p",{className:"text-muted-foreground max-w-md",children:"Your browser or device does not support WebGL, which is required for the 3D rendering engine."}),(0,a.jsx)(F.Button,{variant:"outline",className:"mt-6",onClick:()=>e.push("/"),children:"Return Home"})]}):v||u?(0,a.jsxs)("div",{className:"h-full flex flex-col items-center justify-center text-center p-8 bg-muted/10",children:[(0,a.jsx)(L.AlertCircle,{className:"w-12 h-12 text-destructive opacity-60 mb-4"}),(0,a.jsx)("h2",{className:"text-xl font-bold mb-2",children:"Failed to load plan"}),(0,a.jsx)("p",{className:"text-muted-foreground max-w-md mb-4",children:"There was a problem loading the plan data. Please try again."}),(0,a.jsxs)(F.Button,{variant:"outline",className:"gap-2",onClick:()=>{x(),d()},children:[(0,a.jsx)(D.RefreshCw,{className:"w-4 h-4"})," Retry"]})]}):(0,a.jsxs)("div",{className:"h-full flex flex-col bg-background",children:[(0,a.jsxs)("header",{className:"h-14 border-b flex items-center justify-between px-4 shrink-0 bg-card z-10 relative shadow-sm",children:[(0,a.jsxs)("div",{className:"flex items-center gap-4",children:[(0,a.jsx)(F.Button,{variant:"ghost",size:"icon",onClick:()=>e.push("/"),children:(0,a.jsx)(z,{className:"w-4 h-4"})}),(0,a.jsxs)("div",{children:[(0,a.jsx)("h1",{className:"font-semibold text-sm leading-tight",children:"3D Viewer"}),(0,a.jsx)("p",{className:"text-xs text-muted-foreground",children:m?m.name:"Demo Scene"})]})]}),(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsxs)(F.Button,{variant:"orbit"===g?"default":"outline",size:"sm",onClick:()=>y("orbit"),className:"gap-2",children:[(0,a.jsx)(I.Layers,{className:"w-4 h-4"})," Orbit"]}),(0,a.jsxs)(F.Button,{variant:"walk"===g?"default":"outline",size:"sm",onClick:()=>y("walk"),className:"gap-2",children:[(0,a.jsx)(W,{className:"w-4 h-4"})," Walk"]})]})]}),(0,a.jsxs)("div",{className:"flex-1 relative",children:[(h||c)&&(0,a.jsx)("div",{className:"absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm",children:(0,a.jsx)(_.Loader2,{className:"w-8 h-8 animate-spin text-primary"})}),(0,a.jsxs)(o.Canvas,{shadows:!0,dpr:[1,2],children:[(0,a.jsx)("color",{attach:"background",args:["#2a2a2a"]}),(0,a.jsx)(p,{sunPosition:[10,20,10],turbidity:.1,rayleigh:.5}),(0,a.jsx)("ambientLight",{intensity:.6}),(0,a.jsx)("directionalLight",{position:[10,15,10],intensity:1.5,castShadow:!0,"shadow-mapSize":[2048,2048]}),"orbit"===g?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(R.PerspectiveCamera,{makeDefault:!0,position:[0,8,10],fov:50}),(0,a.jsx)(s.OrbitControls,{makeDefault:!0,target:[0,0,0],maxPolarAngle:Math.PI/2-.05,minDistance:2,maxDistance:20})]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(R.PerspectiveCamera,{makeDefault:!0,position:[0,1.6,5],fov:60}),(0,a.jsx)(s.OrbitControls,{makeDefault:!0,target:[0,1.6,0],enablePan:!1,enableZoom:!1})]}),(0,a.jsx)($,{roomWidthCm:j,roomDepthCm:M,items:w})]}),"walk"===g&&(0,a.jsx)("div",{className:"absolute bottom-6 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur px-4 py-2 rounded-full border shadow-lg pointer-events-none text-xs font-medium text-muted-foreground flex gap-4",children:(0,a.jsx)("span",{children:"Click and drag to look around"})})]})]})}],20922)},86748,e=>{e.n(e.i(20922))}]);