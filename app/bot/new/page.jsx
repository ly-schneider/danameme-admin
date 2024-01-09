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

  const [title, setTitle] = useState("");
  const [errorTitle, setErrorTitle] = useState("");

  const [text, setText] = useState("");
  const [errorText, setErrorText] = useState("");

  const [file, setFile] = useState(null);
  const [errorImage, setErrorImage] = useState("");

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

  const handleFileChange = (event) => {
    const input = event.target;
    if (input.files.length > 0) {
      setFile(input.files[0]);
    } else {
      setFile(null);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();

    let titleInput = null;
    if (title.length != 0) {
      titleInput = title;
    }

    let textInput = null;
    if (text.length != 0) {
      textInput = text;
    }

    if (titleInput == null && textInput == null && !file) {
      setErrorTitle("Bitte gib einen Titel ein.");
      return false;
    }

    let fileUrl = { publicUrl: null };
    if (file) {
      const { error } = await supabase.storage
        .from("post-images")
        .upload(profile.username + "-" + file.name, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.log(error);
        if (error.statusCode == "409") {
          setErrorImage(
            "Ein Bild mit diesem Namen existiert bereits. Bitte bennene dein Bild um."
          );
        } else {
          setErrorImage(
            "Beim Hochladen des Bildes ist ein Fehler aufgetreten."
          );
        }
        return;
      }

      const { data: url } = supabase.storage
        .from("post-images")
        .getPublicUrl(profile.username + "-" + file.name);

      fileUrl = url;
    }

    const { error } = await supabase.from("post").insert({
      title: titleInput,
      content: textInput,
      profile_id: profile.id_profile,
      asset: fileUrl.publicUrl,
      pinned: pinned,
    });

    if (error) {
      console.log(error);
      setErrorImage("Beim erstellen des Posts ist ein Fehler aufgetreten.");
      return;
    }

    router.push("/bot");
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
        <div>
          <label
            className={
              "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
              (errorTitle != "" ? " bg-error opacity-50" : " bg-primary ")
            }
            htmlFor="titel"
          >
            Titel
          </label>
          {errorTitle != "" && (
            <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
              {errorTitle}
            </div>
          )}
          <input
            className={
              "input w-full" +
              (errorTitle != ""
                ? " border-error rounded-b-form rounded-t-none"
                : "")
            }
            type="text"
            id="titel"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
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
          <textarea
            className={
              "min-h-[45px] input w-full" +
              (errorText != ""
                ? " border-error rounded-b-form rounded-t-none"
                : "")
            }
            rows={5}
            id="text"
            type="text"
            autoComplete="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="mt-5">
          <label className="text text-base py-1" htmlFor="pinned">
            Anheften
          </label>
          <input
            className="ms-2 rounded-md bg-transparent border-primary border-[2.5px] w-5 h-5"
            type="checkbox"
            id="pinned"
            autoComplete="off"
            value={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
        </div>
        <div className="flex justify-between mt-5">
          <div className="flex flex-row items-center">
            <label
              htmlFor="fileInput"
              className="inline-block cursor-pointer px-5 py-2 btn-secondary text-sm"
            >
              <FontAwesomeIcon
                icon={faPlusSquare}
                className="h-3 w-3 me-1 mb-[1px]"
              />
              {file ? "Bild ändern" : "Bild hinzufügen"}
              <input
                type="file"
                id="fileInput"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <button className="btn-primary text text-sm" type="submit">
            Post
          </button>
        </div>
        <p className="mt-2 text-xs text" id="fileName">
          {file ? file.name : ""}
        </p>
        {errorImage != "" && (
          <div className="bg-error font-bold mt-5 rounded-div px-3 py-2 text-text text text-sm">
            {errorImage}
          </div>
        )}
        <div className="mt-5">
          <img
            className="rounded-image"
            src={file ? URL.createObjectURL(file) : ""}
          />
        </div>
      </form>
    </div>
  );
}
