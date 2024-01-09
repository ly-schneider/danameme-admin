"use client";

import { checkBan } from "@/components/auth/checkBan";
import { getAccount } from "@/components/auth/getAccount";
import getBotProfile from "@/components/auth/getBotProfile";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CreatePostPage() {
  const router = useRouter();

  const [profile, setProfile] = useState({});

  const [text, setText] = useState("; ");
  const [errorText, setErrorText] = useState("");

  const [postId, setPostId] = useState(null);
  const [errorPostId, setErrorPostId] = useState("");

  const [commentId, setCommentId] = useState(null);
  const [errorCommentId, setErrorCommentId] = useState("");

  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            const profileBot = await getBotProfile();
            console.log(profileBot);
            setProfile(profileBot);
          } else {
            router.push("/login");
          }
        }
      }
    }
    getData();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    let textInput = null;
    if (text == null || text == "") {
      setErrorText("Bitte gib einen Text ein.");
      return;
    } else {
      textInput = text;
    }

    let postIdInput = null;
    if (postId != null && postId != "") {
      postIdInput = parseInt(postId);
    }

    let commentIdInput = null;
    if (commentId != null && commentId != "") {
      commentIdInput = parseInt(commentId);
    }

    const { data: users, error: usersError } = await supabase
      .from("profile")
      .select("id_profile");

    if (usersError) {
      console.log(usersError);
      return;
    }

    console.log(users);

    users.forEach(async (user) => {
      const { error } = await supabase.from("notification").insert({
        toprofile_id: user.id_profile,
        fromprofile_id: profile.id_profile,
        text: textInput,
        post_id: postIdInput,
        comment_id: commentIdInput,
      });

      if (error) {
        console.log(error);
        setErrorText(
          "Beim senden der Benachrichtigung für " +
            user.id_profile +
            " ist ein Fehler aufgetreten."
        );
        return;
      }
    });

    router.push("/broadcast");
  }

  return (
    <div className="max-w-lg mx-auto mt-8">
      <div className="flex items-center">
        <img
          src={profile.profileimage}
          className="w-16 h-16 rounded-full me-4 object-cover border-[3px] border-accent"
        />
        <h1 className="title font-bold">{profile.username}</h1>
      </div>
      <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
        <div className="mt-5">
          <label
            className={
              "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
              (errorText != "" ? " bg-error opacity-50" : " bg-primary ")
            }
            htmlFor="text"
          >
            Text
          </label>
          {errorText != "" && (
            <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
              {errorText}
            </div>
          )}
          <input
            className={
              "input w-full" +
              (errorText != ""
                ? " border-error rounded-b-form rounded-t-none"
                : "")
            }
            id="text"
            type="text"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="mt-5 flex justify-between space-x-6">
          <div>
            <label
              className={
                "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                (errorPostId != "" ? " bg-error opacity-50" : " bg-primary ")
              }
              htmlFor="text"
            >
              Post ID
            </label>
            {errorPostId != "" && (
              <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                {errorPostId}
              </div>
            )}
            <input
              className={
                "input w-full" +
                (errorPostId != ""
                  ? " border-error rounded-b-form rounded-t-none"
                  : "")
              }
              id="text"
              type="text"
              autoComplete="off"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
            />
          </div>
          <div>
            <label
              className={
                "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                (errorCommentId != "" ? " bg-error opacity-50" : " bg-primary ")
              }
              htmlFor="text"
            >
              Comment ID
            </label>
            {errorCommentId != "" && (
              <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                {errorCommentId}
              </div>
            )}
            <input
              className={
                "input w-full" +
                (errorCommentId != ""
                  ? " border-error rounded-b-form rounded-t-none"
                  : "")
              }
              id="text"
              type="text"
              autoComplete="off"
              value={commentId}
              onChange={(e) => setCommentId(e.target.value)}
            />
          </div>
        </div>
        <div className="justify-end flex flex-row mt-5">
          <button className="btn-primary text text-sm" type="submit">
            Broadcast
          </button>
        </div>
      </form>
    </div>
  );
}
