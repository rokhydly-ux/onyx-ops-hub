"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { X, Loader } from 'lucide-react';

interface AccountModalProps {
  user: any;
  onClose: () => void;
  onUpdate: (updatedData: any) => void;
}

export default function AccountModal({ user, onClose, onUpdate }: AccountModalProps) {
  const [fullName, setFullName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setWebsiteUrl(user.website_url || ''); // Assumant que la colonne est 'website_url'
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      // 1. Mettre à jour le mot de passe si fourni
      if (password) {
        const { error: authError } = await supabase.auth.updateUser({ password });
        if (authError) throw new Error(`Erreur de mot de passe: ${authError.message}`);
      }

      // 2. Mettre à jour les informations du profil dans la table 'clients'
      const updates = {
        full_name: fullName,
        website_url: websiteUrl,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { data: updatedUserData, error: profileError } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw new Error(`Erreur de profil: ${profileError.message}`);
      
      onUpdate(updatedUserData); // Mettre à jour l'état du parent
      setMessage({ type: 'success', content: 'Modifications enregistrées avec succès !' });

      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-8 relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-800 transition-colors">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Mon Compte</h2>
        
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Nom complet</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full mt-1 p-3 bg-zinc-100 border-2 border-transparent focus:border-[#39FF14] focus:bg-white rounded-lg transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">URL du site web</label>
            <input
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://mon-entreprise.com"
              className="w-full mt-1 p-3 bg-zinc-100 border-2 border-transparent focus:border-[#39FF14] focus:bg-white rounded-lg transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">URL de l'avatar</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full mt-1 p-3 bg-zinc-100 border-2 border-transparent focus:border-[#39FF14] focus:bg-white rounded-lg transition-all"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase">Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Laisser vide pour ne pas changer"
              className="w-full mt-1 p-3 bg-zinc-100 border-2 border-transparent focus:border-red-500 focus:bg-white rounded-lg transition-all"
            />
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-[#39FF14] font-black uppercase text-sm py-4 rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader size={16} className="animate-spin" />}
              Enregistrer les modifications
            </button>
          </div>
        </form>

        {message.content && (
          <div className={`mt-4 text-center text-sm p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {message.content}
          </div>
        )}
      </div>
    </div>
  );
}
