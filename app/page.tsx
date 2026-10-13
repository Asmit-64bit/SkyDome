import { Suspense } from 'react';
import { SkyDoApp } from '../components/SkyDoApp';

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#8EC9F0]">
          <div className="font-pixel text-lg text-[#2B2118]">
            Loading SkyDo...
          </div>
        </div>
      }
    >
      <SkyDoApp />
    </Suspense>
  );
}
