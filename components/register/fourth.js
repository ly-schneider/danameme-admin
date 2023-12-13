"use client";

import { use, useEffect, useState } from "react";
import supabase from "../supabase";

export default function Fourth({ formData, setFormData, page, setPage }) {
  const [username, setUsername] = useState("");
  const [errorUsername, setErrorUsername] = useState("");
  const [usernameTryed, setUsernameTryed] = useState(false);

  useEffect(() => {
    if (formData.username != "") {
      setUsername(formData.username);
    }
  }, []);

  useEffect(() => {
    if (username.length < 3 && usernameTryed) {
      setErrorUsername("Benutzername muss mindestens 3 Zeichen lang sein!");
    } else {
      setErrorUsername("");
    }
  }, [username]);

  function handleValidation() {
    if (username.length < 3 && !usernameTryed) {
      setErrorUsername("Benutzername muss mindestens 3 Zeichen lang sein!");
      return false;
    } else {
      setErrorUsername("");
    }
    setUsernameTryed(true);
  }

  async function handleSubmit(e) {
    let formError = false;
    e.preventDefault();

    const { data, error } = await supabase
      .from("profile")
      .select("username")
      .eq("username", username);

    if (data.length != 0) {
      setErrorUsername("Benutzername ist bereits vergeben!");
      formError = true;
    }

    if (username == "") {
      setErrorUsername("Benutzername darf nicht leer sein!");
      formError = true;
    }

    if (username.length < 3) {
      setErrorUsername("Benutzername muss mindestens 3 Zeichen lang sein!");
      formError = true;
    }

    if (formError) {
      return false;
    }

    setFormData({ ...formData, username: username });
    setPage(5);
  }

  return (
    <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
      <div>
        <label
          className={
            "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
            (errorUsername != "" ? " bg-error opacity-50" : " bg-primary ")
          }
          htmlFor="username"
        >
          Benutzername
        </label>
        {errorUsername != "" && (
          <div className="bg-error rounded-t-div px-3 py-2 text-text text text-sm">
            {errorUsername}
          </div>
        )}
        <input
          className={
            "input w-full" +
            (errorUsername != ""
              ? " border-error rounded-b-form rounded-t-none"
              : "")
          }
          type="text"
          id="username"
          autoComplete="username"
          value={username}
          onBlur={handleValidation}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="flex justify-between mt-5">
        <button
          className="btn-secondary text text-sm"
          onClick={() => setPage(3)}
        >
          Zurück
        </button>
        <button className="btn-primary text text-sm" type="submit">
          Weiter
        </button>
      </div>
    </form>
  );
}