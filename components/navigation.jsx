"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "./auth/getSession";
import { getAccount } from "./auth/getAccount";
import { getProfile } from "./auth/getProfile";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBarsStaggered,
  faChartBar,
  faComments,
  faFlag,
  faGripVertical,
  faRightToBracket,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import Icon from "@mdi/react";
import { mdiViewDashboard } from "@mdi/js";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const [profile, setProfile] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            setProfile(profile);
          }
        }
      } else {
        if (pathname != "/login" && pathname != "/register") {
          router.push("/login");
        }
      }
    }
    getData();
  }, []);

  return (
    <aside className="fixed bg-accentBackground min-h-screen items-center flex flex-col">
      <div className="items-center inline-flex flex-col flex-grow my-4">
        <div className="border-b border-mutedBorder px-5 pb-6 pt-2">
          <Link href={"/"}>
            <h1 className="title text-2xl sm:text-3xl">DANAMEME</h1>
          </Link>
        </div>
        <div className="flex flex-col mt-6 space-y-2 [&_p]:px-4 [&_p]:py-2 [&_p]:rounded-[10px] [&_p]:text [&_p]:text-lg [&_p]:items-center [&_p]:font-bold [&_p]:flex">
          {profile.length != 0 ? (
            <>
              <Link href={"/"}>
                <p className={pathname == "/" ? "bg-[#545454]" : null}>
                  <Icon path={mdiViewDashboard} size={1} className="me-2" />
                  Dashboard
                </p>
              </Link>
              <Link href={"/users"}>
                <p className={pathname == "/users" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon icon={faUsers} className="me-2.5" />
                  Benutzer
                </p>
              </Link>
              <Link href={"/posts"}>
                <p className={pathname == "/posts" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon
                    icon={faGripVertical}
                    className="ms-1.5 me-[15px]"
                  />
                  Beiträge
                </p>
              </Link>
              <Link href={"/comments"}>
                <p className={pathname == "/comments" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon icon={faComments} className="me-2.5" />
                  Kommentare
                </p>
              </Link>
              <Link href={"/activity"}>
                <p className={pathname == "/activity" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon icon={faChartBar} className="ms-1 me-2.5" />
                  Aktivität
                </p>
              </Link>
              <Link href={"/reports"}>
                <p className={pathname == "/reports" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon icon={faFlag} className="ms-1 me-2.5" />
                  Meldungen
                </p>
              </Link>
              <Link href={"/change-log"}>
                <p
                  className={pathname == "/change-log" ? "bg-[#545454]" : null}
                >
                  <FontAwesomeIcon
                    icon={faBarsStaggered}
                    className="ms-1 me-2"
                  />
                  Change Log
                </p>
              </Link>
              <Link href={"/bot"}>
                <p className={pathname == "/bot" ? "bg-[#545454]" : null}>
                  <FontAwesomeIcon
                    icon={faSquarePlus}
                    className="ms-1 me-2.5"
                  />
                  Bot Mitteilung
                </p>
              </Link>
            </>
          ) : (
            <Link href={"/login"}>
              <p className={pathname == "/login" ? "bg-[#545454]" : null}>
                <FontAwesomeIcon
                  icon={faRightToBracket}
                  className="ms-1 me-2.5"
                />
                Login
              </p>
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
