"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/components/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { faComment, faPaperPlane } from "@fortawesome/free-regular-svg-icons";
import Icon from "@mdi/react";
import {
  mdiArrowBottomLeftBoldOutline,
  mdiArrowBottomRightBoldOutline,
  mdiArrowDownBold,
  mdiArrowDownBoldOutline,
  mdiArrowUpBold,
  mdiArrowUpBoldOutline,
} from "@mdi/js";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    async function getData() {
      const session = await checkSession();
      if (session) {
        const accountId = await getAccount(session);
        if (accountId) {
          const profileId = await getProfile(accountId);
          if (profileId) {
            await fetchPosts(profileId);
          }
        }
      }
    }
    getData();
  }, []);

  async function checkSession() {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.log(error);
      return;
    }

    if (data.session == null) {
      router.push("/login");
      return;
    }

    return data.session.user.email;
  }

  async function getAccount(email) {
    const { data, error } = await supabase
      .from("account")
      .select("id_account")
      .eq("email", email)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    return data.id_account;
  }

  async function getProfile(accountId) {
    const { data, error } = await supabase
      .from("profile")
      .select("id_profile")
      .eq("account_id", accountId)
      .single();

    if (error) {
      console.log(error);
      return;
    }

    setProfileId(data.id_profile);
    return data.id_profile;
  }

  async function fetchPosts(profileId) {
    const { data: postsData, error: postsError } = await supabase
      .from("post")
      .select(
        "id_post, title, content, asset, createdat, profile_id, profile (username, profileimage, id_profile)"
      )
      .order("createdat", { ascending: false });

    if (postsError) {
      console.log(postsError);
      return;
    }

    const calcLikes = await Promise.all(
      postsData.map(async (post) => {
        const { data: ratingData, error } = await supabase
          .from("rating_post")
          .select("*")
          .eq("post_id", post.id_post);

        let count = 0;
        ratingData.map((rating) => {
          if (rating.type == true) {
            count++;
          } else {
            count--;
          }
        });

        if (error) {
          console.log(error);
          return { ...post, likes: 0 };
        }

        return { ...post, likes: count };
      })
    );

    const countComments = await Promise.all(
      calcLikes.map(async (post) => {
        const { data: commentData, error } = await supabase
          .from("comment")
          .select("*")
          .eq("post_id", post.id_post);

        if (error) {
          console.log(error);
          return { ...post, comments: 0 };
        }

        let { data: ratingData, error: ratingError } = await supabase
          .from("rating_post")
          .select("*")
          .eq("post_id", post.id_post)
          .eq("profile_id", profileId);

        console.log(ratingData);

        if (ratingError) {
          console.log(ratingError);
          return { ...post, comments: commentData.length, rating: null };
        }

        if (ratingData.length == 0) {
          ratingData = null;
        } else {
          ratingData = ratingData[0].type;
        }

        return { ...post, comments: commentData.length, rating: ratingData };
      })
    );

    console.log(countComments);
    setPosts(countComments);
  }

  function calcTimeDifference(date) {
    const targetDateTime = new Date(date);
    const currentDateTime = new Date();

    const timeDifference = currentDateTime - targetDateTime;

    const secondsDifference = Math.floor(timeDifference / 1000);

    if (secondsDifference < 60) {
      return `vor ${secondsDifference} Sekunde${
        secondsDifference !== 1 ? "n" : ""
      }`;
    } else if (secondsDifference < 3600) {
      const minutes = Math.floor(secondsDifference / 60);
      return `vor ${minutes} Minute${minutes !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 86400) {
      const hours = Math.floor(secondsDifference / 3600);
      return `vor ${hours} Stude${hours !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 604800) {
      const days = Math.floor(secondsDifference / 86400);
      return `vor ${days} Tag${days !== 1 ? "en" : ""}`;
    } else if (secondsDifference < 2419200) {
      const weeks = Math.floor(secondsDifference / 604800);
      return `vor ${weeks} Woche${weeks !== 1 ? "n" : ""}`;
    } else if (secondsDifference < 29030400) {
      const months = Math.floor(secondsDifference / 2419200);
      return `vor ${months} Monat${months !== 1 ? "en" : ""}`;
    }
  }

  function generateTitle(post) {
    let title = post.title;
    let newTitle = title
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    if (newTitle.substring(newTitle.length - 1) == "-") {
      newTitle = newTitle.substring(0, newTitle.length - 1);
    }

    if (newTitle.length > 20) {
      newTitle = newTitle.substring(0, 20);
    }
    return newTitle + "-" + post.id_post;
  }

  async function handleVote(postId, type) {
    const { data, error } = await supabase
      .from("rating_post")
      .select("*")
      .eq("post_id", postId)
      .eq("profile_id", profileId);

    if (error) {
      console.log(error);
      return;
    }

    console.log(data)

    if (data.length == 0) {
      const { error } = await supabase.from("rating_post").insert({
        post_id: postId,
        profile_id: profileId,
        type: type,
      });

      if (error) {
        console.log(error);
        return;
      }
    } else {
      if (data[0].type == type) {
        const { error } = await supabase
          .from("rating_post")
          .delete()
          .eq("id_ratingpost", data[0].id_ratingpost);

        if (error) {
          console.log(error);
          return;
        }
      } else {
        const { error } = await supabase
          .from("rating_post")
          .update({ type: type })
          .eq("id_ratingpost", data[0].id_ratingpost);

        if (error) {
          console.log(error);
          return;
        }
      }
    }

    await fetchPosts(profileId);
  }

  return (
    <>
      <div className="space-y-24">
        {posts.map((post) => (
          <div key={post.id_post}>
            <div className="flex flex-row items-center justify-between">
              <div className="flex items-center">
                <img
                  src={post.profile.profileimage}
                  className="rounded-full border-[3px] border-accent h-14 w-14"
                />
                <h1 className="text-text font-bold text-xl font-poppins ms-4">
                  {post.profile.username}
                </h1>
              </div>
              <div className="flex items-center">
                <p className="text-muted text text-sm">
                  {calcTimeDifference(post.createdat)}
                </p>
                <FontAwesomeIcon
                  icon={faEllipsisH}
                  className="ms-4 text-muted text-2xl"
                />
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
                <Icon
                  path={
                    post.rating == true ? mdiArrowUpBold : mdiArrowUpBoldOutline
                  }
                  size={1.22}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={() => handleVote(post.id_post, true)}
                />
                <p className="text text-base mx-0.5">{post.likes}</p>
                <Icon
                  path={
                    post.rating == false
                      ? mdiArrowDownBold
                      : mdiArrowDownBoldOutline
                  }
                  size={1.22}
                  className="text text-2xl hover:cursor-pointer"
                  onClick={() => handleVote(post.id_post, false)}
                />
              </div>
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
                  className="text text-2xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
