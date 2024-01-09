"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import { calcTimeShort } from "@/components/other/calcTimeShort";
import { calcTimeDifference } from "@/components/post/calcTimeDifference";
import { generateTitle } from "@/components/post/generateTitle";
import { handlePostDelete } from "@/components/post/handleDelete";
import supabase from "@/components/supabase";
import {
  faComment,
  faPaperPlane,
  faTrashCan,
} from "@fortawesome/free-regular-svg-icons";
import { faEllipsisH, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Icon from "@mdi/react";
import { Dropdown } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const router = useRouter();

  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            await getPosts();
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getPosts() {
    const { data, error } = await supabase
      .from("post")
      .select("*, profile (username, profileimage)")
      .eq("profile_id", 30)
      .order("createdat", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    console.log(data);
    setPosts(data);
  }

  return (
    <>
      <div className="mt-8 mx-5 mb-8 sm:mx-0">
        <h1 className="title ">Bot Mitteilung</h1>
        <Link href={"/bot/new"}>
          <button className="btn btn-primary text mt-5">Neue Mitteilung</button>
        </Link>
        <div className="mt-5 flex flex-col space-y-4">
          {posts.map((post) => (
            <div key={post.id_post}>
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={post.profile.profileimage}
                    className="rounded-full border-[3px] border-accent h-14 w-14 object-cover"
                  />
                  <h1 className="text-text font-bold text-xl font-poppins ms-2 sm:ms-4">
                    {post.profile.username}
                  </h1>
                </div>
                <div className="flex items-center">
                  {post.edited && (
                    <p className="text-muted text text-xs sm:text-sm mr-4">
                      (Bearbeitet)
                    </p>
                  )}
                  <p className="text-muted text text-xs sm:text-sm">
                    {calcTimeDifference(post.createdat)}
                  </p>
                  <div className="[&>div]:bg-background [&>div]:border-[3px] [&>div]:border-primary [&>div]:rounded-md flex items-center">
                    <Dropdown
                      dismissOnClick={false}
                      label=""
                      renderTrigger={() => (
                        <FontAwesomeIcon
                          icon={faEllipsisH}
                          className="ms-4 text-muted text-2xl hover:cursor-pointer"
                        />
                      )}
                    >
                      <Dropdown.Item
                        className="text text-sm hover:bg-accentBackground"
                        onClick={async () => {
                          await handlePostDelete(post.id_post);
                          await getPosts();
                        }}
                      >
                        <FontAwesomeIcon icon={faTrashCan} className="me-1.5" />
                        Löschen
                      </Dropdown.Item>
                    </Dropdown>
                  </div>
                </div>
              </div>
              <div className="w-full mt-3">
                <Link href={`/post/${generateTitle(post)}`}>
                  <h1 className="title text-2xl font-bold">{post.title}</h1>
                  {post.content && (
                    <p className="text text-base">{post.content}</p>
                  )}
                </Link>
              </div>
              {post.asset && (
                <div className="w-full mt-3">
                  <img src={post.asset} className="w-full rounded-image" />
                </div>
              )}
              <div className="flex items-center flex-row w-full mt-3 space-x-2">
                <div className="flex items-center">
                  <Link href={`/post/${generateTitle(post)}`} className="flex">
                    <FontAwesomeIcon
                      icon={faComment}
                      className="text text-2xl me-1"
                    />
                    <p className="text text-base">{post.comments}</p>
                  </Link>
                </div>
                <div>
                  <FontAwesomeIcon
                    icon={faPaperPlane}
                    className="text text-2xl hover:cursor-pointer"
                    onClick={() => {
                      const url = window.location.origin;
                      navigator.clipboard.writeText(
                        `${url}/post/${generateTitle(post)}`
                      );
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
