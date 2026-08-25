"use client";
import { useEffect } from "react";
import type { Locale } from "@/config/i18n";
import { emitProductEvent } from "@/lib/measurement/events";
export function HomeViewEvent({locale}: {locale: Locale}) { useEffect(() => { emitProductEvent("home.viewed", {locale}); }, [locale]); return null; }
