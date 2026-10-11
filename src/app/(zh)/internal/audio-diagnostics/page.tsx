import type {Metadata} from "next";
import {IphoneAudioDiagnostics} from "@/components/diagnostics/iphone-audio-diagnostics";

export const metadata: Metadata = {
  title: "iPhone Audio Diagnostics",
  robots: {index: false, follow: false, googleBot: {index: false, follow: false}},
};

export default function Page() {
  return <IphoneAudioDiagnostics />;
}
