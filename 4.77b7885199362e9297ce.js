(window.webpackJsonp=window.webpackJsonp||[]).push([[4],{WSfN:function(t,e,a){"use strict";a.r(e),a.d(e,"dynamicInitializer",(function(){return f})),a.d(e,"dynamicInitializerRoutes",(function(){return h})),a.d(e,"routesFactory",(function(){return m})),a.d(e,"TestModule",(function(){return w}));var n=a("2kYt"),r=a("sEIs"),c=a("EM62");let o=(()=>{class t{}return t.\u0275fac=function(e){return new(e||t)},t.\u0275prov=c.Cb({token:t,factory:t.\u0275fac}),t})();function i(t,e){if(1&t&&(c.Kb(0,"a",1),c.cc(1),c.Jb()),2&t){const t=e.$implicit;c.Ub("routerLink",t.path),c.wb(1),c.dc(t.label)}}let s=(()=>{class t{constructor(t){this.testService=t}}return t.\u0275fac=function(e){return new(e||t)(c.Gb(o))},t.\u0275cmp=c.Ab({type:t,selectors:[["test"]],decls:4,vars:2,consts:[[3,"routerLink",4,"ngFor","ngForOf"],[3,"routerLink"]],template:function(t,e){1&t&&(c.Kb(0,"span"),c.cc(1),c.Jb(),c.bc(2,i,2,2,"a",0),c.Hb(3,"router-outlet")),2&t&&(c.wb(1),c.dc(e.testService.data),c.wb(1),c.Ub("ngForOf",e.testService.routes))},directives:[n.h,r.g,r.e],encapsulation:2}),t})();var u=a("ROBh"),d=a("BwBJ"),p=a("8j5Y"),b=a("x7A0");let l=(()=>{class t{constructor(t){this.route=t,this.data=t.snapshot.data.data}}return t.\u0275fac=function(e){return new(e||t)(c.Gb(r.a))},t.\u0275cmp=c.Ab({type:t,selectors:[["test"]],decls:2,vars:1,template:function(t,e){1&t&&(c.Kb(0,"span"),c.cc(1),c.Jb()),2&t&&(c.wb(1),c.dc(e.data))},encapsulation:2}),t})();function f(t){return()=>Object(u.a)("test_initializer").pipe(Object(d.a)(1e3),Object(p.a)(e=>t.data=e))}function h(t){return()=>Object(u.a)([{path:"data1",label:"Data 1",data:"data_1"},{path:"data2",label:"Data 2",data:"data_2"}]).pipe(Object(d.a)(1e3),Object(p.a)(e=>t.routes=e))}function m(t){const e=t.routes.map(t=>({path:t.path,component:l,data:{data:t.data}}));return[{path:"",component:s,children:e}]}let w=(()=>{class t{}return t.\u0275mod=c.Eb({type:t}),t.\u0275inj=c.Db({factory:function(e){return new(e||t)},providers:[o,{provide:b.a,multi:!0,useFactory:f,deps:[o]},{provide:b.a,multi:!0,useFactory:h,deps:[o]},{provide:r.c,multi:!0,useFactory:m,deps:[o]}],imports:[[n.b,r.f.forChild([])]]}),t})()}}]);