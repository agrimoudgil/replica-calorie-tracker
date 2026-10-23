"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { ScanBarcode } from "lucide-react";
import type { CustomFoodStart } from "@/components/custom-food-form";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import type { OffProduct } from "@/lib/off";

const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

// The browser's own barcode reader (Chrome on Android, Mac and ChromeOS). Elsewhere: type the number.
type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue: string }>> };
type DetectorClass = new (options?: { formats?: string[] }) => Detector;
const detectorClass = () => (typeof window !== "undefined" ? (window as unknown as { BarcodeDetector?: DetectorClass }).BarcodeDetector : undefined);
const noSubscribe = () => () => {};

/** One serving from the pack if it gives one, otherwise 100 g: the form takes it from there. */
function startFrom(p: OffProduct): CustomFoodStart {
  const name = p.brand && !p.name.toLowerCase().includes(p.brand.toLowerCase()) ? `${p.name} (${p.brand})` : p.name;
  const grams = p.servingGrams ?? 100;
  const scale = (v: number) => Math.round(((v * grams) / 100) * 10) / 10;
  const n = p.per100g;
  return {
    name: name.slice(0, 120),
    unit: p.servingGrams ? "piece" : "g",
    gramsPerUnit: grams,
    perServing: { kcal: scale(n.kcal), proteinG: scale(n.proteinG), carbG: scale(n.carbG), fatG: scale(n.fatG), fiberG: scale(n.fiberG) },
  };
}

/** Find a packaged food by its barcode (Open Food Facts), then save it as your own food. */
export function BarcodeLookup({ onUse }: { onUse: (start: CustomFoodStart) => void }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<OffProduct | null>(null);
  const [scanning, setScanning] = useState(false);
  const canScan = useSyncExternalStore(noSubscribe, () => Boolean(detectorClass()), () => false);
  const video = useRef<HTMLVideoElement>(null);

  const lookup = async (value: string) => {
    setError(null);
    setProduct(null);
    setBusy(true);
    const res = await fetch(`/api/foods/barcode?code=${encodeURIComponent(value)}`).catch(() => null);
    setBusy(false);
    const body = await res?.json().catch(() => null);
    if (res?.ok) return setProduct(body.product as OffProduct);
    setError(res ? (body?.message ?? "Couldn't look that up. Try again.") : "You seem to be offline. Try again.");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const digits = code.replace(/[\s-]/g, "");
    if (!/^\d{8,14}$/.test(digits)) return setError("A barcode is 8 to 14 digits, usually under the stripes.");
    void lookup(digits);
  };

  // Camera scanning: runs only while `scanning`, and always releases the camera.
  useEffect(() => {
    const Barcode = detectorClass();
    if (!scanning || !Barcode) return;
    let stream: MediaStream | null = null;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const detector = new Barcode({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    const tick = async () => {
      if (stopped || !video.current) return;
      const found = await detector.detect(video.current).catch(() => []);
      if (found[0]?.rawValue && !stopped) {
        stopped = true;
        setScanning(false);
        setCode(found[0].rawValue);
        void lookup(found[0].rawValue);
        return;
      }
      timer = setTimeout(tick, 300);
    };
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(async (s) => {
        stream = s;
        if (stopped || !video.current) return;
        video.current.srcObject = s;
        await video.current.play().catch(() => undefined);
        void tick();
      })
      .catch(() => {
        setScanning(false);
        setError("The camera isn't available. Type the number under the barcode instead.");
      });
    return () => {
      stopped = true;
      clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [scanning]);

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={submit} noValidate className="flex flex-col gap-3">
        <TextField label="Barcode number" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. 8901058851427" />
        <Button type="submit" loading={busy}>Look it up</Button>
      </form>
      {canScan && !scanning && (
        <Button variant="secondary" icon={<ScanBarcode aria-hidden className="size-4" />} onClick={() => setScanning(true)}>
          Scan with the camera
        </Button>
      )}
      {scanning && (
        <div className="flex flex-col gap-2">
          <video ref={video} muted playsInline aria-label="Camera view for scanning a barcode" className="aspect-[4/3] w-full rounded-lg bg-surface object-cover" />
          <Button variant="ghost" onClick={() => setScanning(false)}>Stop scanning</Button>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}

      {product && (
        <section aria-labelledby="barcode-found" className="flex flex-col gap-3 rounded-lg border border-border p-4">
          <h3 id="barcode-found" className="text-base font-semibold">
            {product.name}
            {product.brand && <span className="block text-sm font-normal text-muted">{product.brand}</span>}
          </h3>
          <p className="text-sm tabular-nums">
            Per 100 g: {fmt.format(product.per100g.kcal)} kcal · protein {fmt.format(product.per100g.proteinG)} g · carbs {fmt.format(product.per100g.carbG)} g · fat{" "}
            {fmt.format(product.per100g.fatG)} g
            {product.servingGrams ? ` · one serving is ${fmt.format(product.servingGrams)} g` : ""}
          </p>
          <p className="text-xs text-muted">
            From{" "}
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline underline-offset-2">
              Open Food Facts
            </a>{" "}
            (open data, ODbL). Packs change, so check the numbers against the label.
          </p>
          <Button onClick={() => onUse(startFrom(product))}>Check and save as my food</Button>
        </section>
      )}
    </div>
  );
}
