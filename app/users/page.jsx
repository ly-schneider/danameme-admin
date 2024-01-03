"use client";

import { getAccount } from "@/components/auth/getAccount";
import { getProfile } from "@/components/auth/getProfile";
import { getSession } from "@/components/auth/getSession";
import { calcTime } from "@/components/other/calcTime";
import { calcTimeShort } from "@/components/other/calcTimeShort";
import supabase from "@/components/supabase";
import { faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);

  const [banUsername, setBanUsername] = useState("");
  const [banReason, setBanReason] = useState("");
  const [banFrom, setBanFrom] = useState("");
  const [banAccountId, setBanAccountId] = useState("");
  const [banUntil, setBanUntil] = useState("");
  const [banType, setBanType] = useState("");
  const [banUserData, setBanUserData] = useState({});
  const [displayBanModal, setDisplayBanModal] = useState(false);

  useEffect(() => {
    async function getData() {
      const session = await getSession();
      if (session) {
        const account = await getAccount(session.session.user.email);
        if (account) {
          const profile = await getProfile(account.id_account);
          if (profile) {
            await getUsers();
            setBanFrom(account.id_account);
          }
        }
      } else {
        router.push("/login");
      }
    }
    getData();
  }, []);

  async function getUsers() {
    const { data, error } = await supabase
      .from("profile")
      .select("*, account (createdat)")
      .order("account (createdat)", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    // Fetch ban data for each user
    data.forEach(async (user) => {
      const { data: banData, error: banError } = await supabase
        .from("banned")
        .select()
        .eq("account_id", user.account_id);

      if (banError) {
        console.log(banError);
        return;
      }

      if (banData.length != 0) {
        user.banData = banData;
      } else {
        user.banData = null;
      }
    });

    setUsers(data);
  }

  async function handleNewProfiles(payload) {
    console.log(payload);
    getUsers();
  }

  supabase
    .channel("users-new-profiles")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "profile" },
      handleNewProfiles
    )
    .subscribe();

  async function displayBan(user) {
    setBanUsername(user.username);
    setBanAccountId(user.account_id);
    setBanUserData(user);
    setDisplayBanModal(true);
  }

  async function handleBanSubmit() {
    const { data, error } = await supabase.from("banned").insert([
      {
        account_id: banAccountId,
        bannedby_id: banFrom,
        type: banType,
        reason: banReason,
        until: banUntil,
      },
    ]);

    if (error) {
      console.log(error);
      return;
    }

    location.reload();
  }

  async function removeBan(id) {
    const { data, error } = await supabase
      .from("banned")
      .delete()
      .eq("id_ban", id);

    if (error) {
      console.log(error);
      return;
    }

    location.reload();
  }

  return (
    <>
      <div className="mt-8 mx-5 mb-8 sm:mx-0">
        <h1 className="title ">Alle Benutzer</h1>
        <div className="mt-5 flex flex-col space-y-4">
          {users.map((user) => (
            <div key={user.id_profile}>
              <div className="flex flex-row justify-between items-center">
                <Link href={`/p/${user.username}`}>
                  <div className="flex flex-row items-center space-x-4">
                    <img
                      src={user.profileimage}
                      className="w-10 h-10 rounded-full object-cover border-2 border-accent"
                      alt="avatar"
                    />
                    <div className="flex flex-col">
                      <p className="font-semibold text text-lg">
                        {user.username}
                      </p>
                      <p className="text-muted text-sm text">
                        Beigetreten: {calcTime(user.account.createdat)}
                      </p>
                    </div>
                  </div>
                </Link>
                <div className="flex flex-row">
                  {user.banData != null ? (
                    <button
                      onClick={() => displayBan(user)}
                      className="btn-secondary border text text-xs bg-error border-error hover:bg-error transition-all duration-300"
                    >
                      Unban
                    </button>
                  ) : (
                    <button
                      onClick={() => displayBan(user)}
                      className="btn-secondary border text text-xs border-error hover:bg-error transition-all duration-300"
                    >
                      Ban
                    </button>
                  )}
                </div>
              </div>
              <hr className="border-muted border-opacity-20 mt-4" />
            </div>
          ))}
        </div>
      </div>

      <div
        className={
          "fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 " +
          (displayBanModal == false ? "hidden" : null)
        }
      >
        <div className="w-[500px] h-[550px] overflow-y-auto bg-background rounded-[10px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <>
            <div className="flex flex-row justify-between items-center px-5 py-4">
              <h1 className="title text-xl">{banUsername}</h1>
              <button
                className=" px-2 rounded-md bg-error border-none text-text hover:text-text transition-all duration-300"
                onClick={() => {
                  setDisplayBanModal(false);
                }}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {banUserData.banData != null && (
              <div className="px-5 pb-2">
                {banUserData.banData.map((ban) => (
                  <div
                    key={ban.id_ban}
                    className="border-b border-mutedBorder pb-4 pt-2"
                  >
                    <div className="flex flex-row justify-between items-center">
                      <div>
                        <p className="text">
                          Grund:{" "}
                          <span className="font-bold ms-2">{ban.reason}</span>
                        </p>
                        <p className="text">
                          Bis:{" "}
                          <span className="font-bold ms-2">
                            {calcTimeShort(ban.until)}
                          </span>
                        </p>
                        <p className="text">
                          Typ:{" "}
                          <span className="font-bold ms-2">{ban.type}</span>
                        </p>
                      </div>

                      <FontAwesomeIcon
                        icon={faTrashCan}
                        onClick={() => removeBan(ban.id_ban)}
                        className="text-error hover:cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-2 mt-4">
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form bg-error"
                }
                htmlFor="reason"
              >
                Grund
              </label>
              <input
                className={"input border-error w-full"}
                type="text"
                id="reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
            <div className="px-5 py-2 mt-2">
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form bg-error"
                }
                htmlFor="until"
              >
                Bis
              </label>
              <input
                className={"input border-error w-full"}
                type="datetime-local"
                id="until"
                value={banUntil}
                onChange={(e) => setBanUntil(e.target.value)}
              />
            </div>
            <div className="px-5 py-2 mt-2">
              <label
                className={
                  "text text-sm ms-1.5 px-3 py-1 rounded-t-form bg-error"
                }
                htmlFor="type"
              >
                Typ
              </label>
              <select
                className={"input border-error w-full"}
                type=""
                id="type"
                value={banType}
                onChange={(e) => setBanType(e.target.value)}
              >
                <option selected value="account">
                  Account
                </option>
                <option value="comment">Comment</option>
                <option value="create">Create</option>
              </select>
            </div>
            <div className="flex justify-end mt-5 me-5 mb-5">
              <button
                className="btn-primary bg-error text text-sm"
                onClick={handleBanSubmit}
              >
                Bannen
              </button>
            </div>
          </>
        </div>
      </div>
    </>
  );
}
