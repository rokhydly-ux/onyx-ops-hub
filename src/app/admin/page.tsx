"use client";
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabaseAdmin"; // Utilise la clé secrète

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const { data } = await supabaseAdmin.from("profiles").select("*");
      if (data) setUsers(data);
    };
    fetchAllUsers();
  }, []);

  const approvePartner = async (userId: string) => {
    await supabaseAdmin
      .from("profiles")
      .update({ role: "partner" })
      .eq("id", userId);
    // Logique pour créer l'entrée dans la table 'partners' ici
    alert("Partenaire approuvé !");
  };

  return (
    <div className="p-12">
      <h1 className="text-3xl font-black uppercase mb-8">Administration Onyx</h1>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-zinc-100 text-[10px] uppercase font-black text-zinc-400">
            <th className="pb-4">Utilisateur</th>
            <th className="pb-4">Rôle Actuel</th>
            <th className="pb-4">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm font-bold">
          {users.map((u) => (
            <tr key={u.id} className="border-b border-zinc-50">
              <td className="py-4">{u.full_name}</td>
              <td className="py-4">{u.role}</td>
              <td className="py-4">
                {u.role === "user" && (
                  <button 
                    onClick={() => approvePartner(u.id)}
                    className="bg-[#39FF14] text-black px-4 py-1.5 rounded-lg text-[10px] uppercase font-black"
                  >
                    Rendre Partenaire
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}