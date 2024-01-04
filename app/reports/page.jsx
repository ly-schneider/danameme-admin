"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import { calcTimeShort } from "@/components/other/calcTimeShort";
import { generateTitle } from "@/components/post/generateTitle";
import supabase from "@/components/supabase";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const router = useRouter();

  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            await getReports();
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getReports() {
    const { data, error } = await supabase
      .from("report")
      .select(
        "*, reporter_id (username, profileimage), profile_id (username, profileimage), post_id (id_post, title, content, asset), comment_id (text, post_id (id_post, title) ), createdat"
      )
      .order("createdat", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    console.log(data);
    setReports(data);
  }

  async function removeReport(id) {
    const { data, error } = await supabase
      .from("report")
      .delete()
      .eq("id_report", id);

    if (error) {
      console.log(error);
      return;
    }

    setReports(reports.filter((report) => report.id_report != id));
  }

  return (
    <>
      <div className="mt-8 mx-5 mb-8 sm:mx-0">
        <h1 className="title ">Alle Meldungen</h1>
        <div className="mt-5 flex flex-col space-y-4">
          {reports.map((report) => (
            <div
              key={report.id_report}
              className="flex flex-row justify-between items-center"
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center">
                  <img
                    src={report.reporter_id.profileimage}
                    className="rounded-full border-[3px] border-accent h-12 w-12 object-cover"
                  />
                  <div className="ml-3">
                    <p className="text">
                      <Link href={`/p/${report.reporter_id.username}`} passHref>
                        <span className="font-semibold">
                          {report.reporter_id.username}
                        </span>{" "}
                      </Link>
                      hat{" "}
                      {report.post_id && (
                        <>
                          {report.post_id.asset && "diesen Beitrag gemeldet"}
                          {!report.post_id.asset && report.post_id.title ? (
                            <Link
                              href={"/post/" + generateTitle(report.post_id)}
                              className="font-semibold"
                            >
                              : {report.post_id.title}
                            </Link>
                          ) : (
                            <>
                              {!report.post_id.asset && (
                                <Link
                                  href={
                                    "/post/" + generateTitle(report.post_id)
                                  }
                                  className="font-semibold"
                                >
                                  : {report.post_id.content}
                                </Link>
                              )}
                            </>
                          )}
                        </>
                      )}
                      {report.comment_id && (
                        <>
                          {report.comment_id.text && ("diesen Kommentar gemeldet: ")}
                          <Link
                            href={
                              "/post/" +
                              generateTitle(report.comment_id.post_id)
                            }
                            className="font-semibold"
                          >
                            {report.comment_id.text}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  {report.post_id && (
                    <>
                      {report.post_id.asset && (
                        <Link href={"/post/" + generateTitle(report.post_id)}>
                          <img
                            src={report.post_id.asset}
                            className="rounded-sm h-10 w-10"
                          />
                        </Link>
                      )}
                    </>
                  )}
                  <button
                    className="ml-3 text-text"
                    onClick={() => removeReport(report.id_report)}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
