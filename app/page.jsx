"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import { calcTimeShort } from "@/components/other/calcTimeShort";
import supabase from "@/components/supabase";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            getUsers();
            getPosts();
            getComments();
            getRatings();
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getUsers() {
    const { data: usersData, error: usersError } = await supabase
      .from("profile")
      .select("username, profileimage, account (createdat)")
      .order("account (createdat)", { ascending: false });

    if (usersError) {
      console.log(usersError);
      return false;
    }

    setUsers(usersData);
  }

  async function getPosts() {
    const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select("id_post");

    if (postsError) {
      console.log(postsError);
      return false;
    }

    setPosts(postsData);
  }

  async function getComments() {
    const { data: commentsData, error: commentsError } = await supabase
      .from("comment")
      .select("id_comment");

    if (commentsError) {
      console.log(commentsError);
      return false;
    }

    setComments(commentsData);
  }

  async function getRatings() {
    const { data: ratingCommentData, error: ratingCommentError } =
      await supabase.from("rating_comment").select("id_ratingcomment");

    if (ratingCommentError) {
      console.log(ratingCommentError);
      return false;
    }

    const { data: ratingPostData, error: ratingPostError } = await supabase
      .from("rating_post")
      .select("id_ratingpost");

    if (ratingPostError) {
      console.log(ratingPostError);
      return false;
    }

    setRatings(ratingCommentData.length + ratingPostData.length);
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row justify-evenly w-full space-x-8">
        <div className="w-1/4 flex flex-row justify-between bg-accentBackground px-6 py-4 rounded-[15px]">
          <h1 className="title text-xl">Benutzer:</h1>
          <h1 className="title text-xl">{users.length}</h1>
        </div>
        <div className="w-1/4 flex flex-row justify-between bg-accentBackground px-6 py-4 rounded-[15px]">
          <h1 className="title text-xl">Beiträge:</h1>
          <h1 className="title text-xl">{posts.length}</h1>
        </div>
        <div className="w-1/4 flex flex-row justify-between bg-accentBackground px-6 py-4 rounded-[15px]">
          <h1 className="title text-xl">Kommentare:</h1>
          <h1 className="title text-xl">{comments.length}</h1>
        </div>
        <div className="w-1/4 flex flex-row justify-between bg-accentBackground px-6 py-4 rounded-[15px]">
          <h1 className="title text-xl">Ratings:</h1>
          <h1 className="title text-xl">{ratings}</h1>
        </div>
      </div>
      <div className="flex flex-row justify-start mt-6 space-x-8">
        <div className="w-1/2 bg-accentBackground px-6 py-4 rounded-[15px]">
          <h1 className="title text-xl border-b border-mutedBorder pb-3">
            Benutzer
          </h1>
          <div className="flex flex-col space-y-4 mt-4">
            {users.slice(0, 5).map((user, i) => (
              <div
                key={i}
                className="flex flex-row justify-between items-center"
              >
                <div className="flex flex-row items-center">
                  <img
                    src={user.profileimage}
                    className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                    alt="avatar"
                  />
                  <h1 className="title text-base ms-2">{user.username}</h1>
                </div>
                <div className="flex flex-row">
                  <p className="text-muted text-sm text">
                    Beigetreten: {calcTimeShort(user.account.createdat)}
                  </p>
                  <FontAwesomeIcon icon={faEllipsisH} className="ms-2" />
                </div>
              </div>
            ))}
            <Link href={"/users"} className="items-center flex">
              <button className="btn-primary bg-placeholder text font-bold mx-auto">
                Alle Benutzer
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
