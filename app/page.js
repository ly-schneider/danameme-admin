"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");

  return (
    <>
      <div className="px-4">
        <div className="mt-8">
          <h1 className="title text-2xl">DANAMEME</h1>
          <div className="font-lato font-semibold text-sm text-text space-y-4 mt-2">
            <p>
              DANAMEME ist eine Open-Source Social-Media-Plattform, welche
              selbständig entwickelt worden ist.
            </p>
            <p>
              Die Idee hinter DANAMEME ist es, eine Plattform zu schaffen, auf
              der der gesamte Campus Campus-bezogene Memes oder IT-Memes posten
              kann. Ursprünglich entstand DANAMEME aus der Idee, 8einen
              Subreddit zu erstellen. Da uns (Team DANAMIKE) dies jedoch
              untersagt wurde, habe ich mich entschieden, eine eigene Plattform
              zu entwickeln. Ich habe mich sofort an die Arbeit gemacht, um dies
              zu realisieren.
            </p>
          </div>
        </div>
        <div className="mt-12">
          <h1 className="title text-2xl">Werde informiert</h1>
          <div className="font-lato font-semibold text-sm text-text space-y-4 mt-2">
            <p>
              Um den Launch von DANAMEME nicht zu verpassen und einen
              einzigartigen Badge zu erhalten, füge deine E-Mail-Adresse hinzu,
              um bei der Veröffentlichung informiert zu werden!
            </p>
            <form onSubmit={(e) => handleAddEmail(e)} className="flex">
              <div className="flex justify-between w-full">
                <input
                  className="input w-full"
                  placeholder="E-Mail Adresse"
                  onChange={(e) => setEmail(e)}
                />
                <button
                  className="bg-primary rounded-button px-6 py-2 text-text text-xs ms-4"
                  type="submit"
                >
                  Hinzufügen
                </button>
              </div>
            </form>
            <p>
              Lese mehr <Link href={"/about"} className="underline">über mich</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
