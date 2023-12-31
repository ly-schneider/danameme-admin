"use client";

import { checkBan } from "@/components/auth/checkBan";
import { calcTime } from "@/components/other/calcTime";
import supabase from "@/components/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");

  const [password, setPassword] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  const [banned, setBanned] = useState(false);
  const [banData, setBanData] = useState([]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email) {
      setErrorEmail("Bitte geben Sie eine E-Mail Adresse ein.");
    } else if (!email.includes("@") || !email.includes(".")) {
      setErrorEmail("Bitte geben Sie eine gültige E-Mail Adresse ein.");
    } else {
      setErrorEmail("");
    }

    if (!password) {
      setErrorPassword("Bitte geben Sie ein Passwort ein.");
    } else {
      setErrorPassword("");
    }

    if (email && password) {
      const { data: accountData, error: accountsError } = await supabase
        .from("account")
        .select("id_account")
        .eq("email", email)
        .single();

      if (accountsError) {
        console.log(accountsError);
        return false;
      }

      const { data: roleData, error: roleError } = await supabase
        .from("profile")
        .select("role_id")
        .eq("account_id", accountData.id_account)
        .single();

      if (roleError) {
        console.log(roleError);
        return false;
      }

      let permitted = false;
      if (roleData.role_id == 1 || roleData.role_id == 2) {
        permitted = true;
      }

      if (permitted) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          setErrorEmail("E-Mail Adresse oder Passwort ist falsch.");
          setErrorPassword("E-Mail Adresse oder Passwort ist falsch.");
          return false;
        }
        location.href = "/";
      } else {
        setErrorEmail(
          "Du bist nicht berechtigt auf diese Applikation zuzugreifen."
        );
        setErrorPassword(
          "Du bist nicht berechtigt auf diese Applikation zuzugreifen."
        );
        return false;
      }
    }
  }

  return (
    <>
      {banned ? (
        <div className="max-w-sm mx-auto flex flex-col items-center w-full mt-8">
          <h1 className="title font-extrabold text-error">Banned!</h1>
          <h1 className="title text-lg font-extrabold text-error">
            Bis: {calcTime(banData.until)}
          </h1>
          <p className="text text-base text-center mt-3">
            Grund dafür ist: {banData.reason}
          </p>
          <p className="text text-sm text-muted text-center mt-3">
            Du wurdest von {banData.bannedby} am {calcTime(banData.createdat)}{" "}
            gebannt.
          </p>
        </div>
      ) : (
        <div className="max-w-sm mx-auto mt-32">
          <h1 className="title text-center font-bold">Login</h1>
          <form onSubmit={(e) => handleSubmit(e)} className="mt-8">
            <div>
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                  (errorEmail != "" ? " bg-error opacity-50" : " bg-primary ")
                }
                htmlFor="email"
              >
                E-Mail Adresse
              </label>
              {errorEmail != "" && (
                <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                  {errorEmail}
                </div>
              )}
              <input
                className={
                  "input w-full" +
                  (errorEmail != ""
                    ? " border-error rounded-b-form rounded-t-none"
                    : "")
                }
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mt-5">
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form" +
                  (errorPassword != ""
                    ? " bg-error opacity-50"
                    : " bg-primary ")
                }
                htmlFor="password"
              >
                Passwort
              </label>
              {errorPassword != "" && (
                <div className="bg-error font-bold rounded-t-div px-3 py-2 text-text text text-sm">
                  {errorPassword}
                </div>
              )}
              <input
                className={
                  "input w-full" +
                  (errorPassword != ""
                    ? " border-error rounded-b-form rounded-t-none"
                    : "")
                }
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex justify-end mt-5">
              <button className="btn-primary text text-sm" type="submit">
                Anmelden
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
