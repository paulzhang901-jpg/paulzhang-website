"use client";

import Script from "next/script";
import {useState} from "react";
import type {Locale} from "@/config/i18n";

export const GA4_MEASUREMENT_ID="G-YC5TTPM9GE";
export const ANALYTICS_CONSENT_STORAGE_KEY="paulzhang.analytics-consent.v1";
type Consent="granted"|"denied"|null;
function initialConsent():Consent{if(typeof window==="undefined")return null;const saved=window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);return saved==="granted"||saved==="denied"?saved:null;}
const copy={
  "zh-CN":{title:"网站分析",body:"是否允许使用 Google Analytics 帮助我们了解网站的匿名使用情况？不会把祷告、表单内容或其他敏感文字发送给分析服务。",accept:"允许分析",decline:"不允许",manage:"分析设置",statusOn:"Google Analytics：已允许",statusOff:"Google Analytics：未允许",close:"关闭"},
  "en-US":{title:"Website analytics",body:"Allow Google Analytics to help us understand anonymous website usage? Prayer text, form content, and other sensitive text are not sent to analytics.",accept:"Allow analytics",decline:"Do not allow",manage:"Analytics settings",statusOn:"Google Analytics: allowed",statusOff:"Google Analytics: not allowed",close:"Close"},
} as const;

export function GoogleAnalyticsConsent({locale}:{locale:Locale}){
  const [consent,setConsent]=useState<Consent>(initialConsent);
  const [manageOpen,setManageOpen]=useState(false);
  const choose=(value:Exclude<Consent,null>)=>{window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY,value);setConsent(value);setManageOpen(false)};
  const c=copy[locale];
  return <>
    {consent==="granted"?<>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga4-config" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_MEASUREMENT_ID}');`}</Script>
    </>:null}
    {consent===null?<div className="fixed inset-x-4 bottom-4 z-[90] mx-auto max-w-2xl rounded-xl border bg-surface p-5 shadow-[var(--shadow-soft)]" role="dialog" aria-labelledby="analytics-consent-title" aria-describedby="analytics-consent-description"><h2 id="analytics-consent-title" className="font-serif text-xl">{c.title}</h2><p id="analytics-consent-description" className="mt-2 text-sm leading-6 text-muted-foreground">{c.body}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={()=>choose("granted")} className="min-h-11 rounded-md bg-primary px-4 font-medium text-primary-foreground">{c.accept}</button><button type="button" onClick={()=>choose("denied")} className="min-h-11 rounded-md border bg-surface px-4 font-medium">{c.decline}</button></div></div>:null}
    {consent!==null?<div className="fixed bottom-3 right-3 z-[80]"><button type="button" onClick={()=>setManageOpen(v=>!v)} aria-expanded={manageOpen} className="rounded-md border bg-surface px-3 py-2 text-xs text-muted-foreground shadow-sm">{c.manage}</button>{manageOpen?<div className="absolute bottom-11 right-0 w-72 rounded-xl border bg-surface p-4 shadow-[var(--shadow-soft)]"><p className="text-sm font-medium">{consent==="granted"?c.statusOn:c.statusOff}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>choose("granted")} className="min-h-10 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">{c.accept}</button><button type="button" onClick={()=>choose("denied")} className="min-h-10 rounded-md border px-3 text-sm font-medium">{c.decline}</button><button type="button" onClick={()=>setManageOpen(false)} className="min-h-10 px-2 text-sm underline">{c.close}</button></div></div>:null}</div>:null}
  </>;
}
