import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { Space_Grotesk } from 'next/font/google';
import { Lock, X, Target, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

interface FreeSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FreeSignupModal({ isOpen, onClose }: FreeSignupModalProps) {
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !isValidPhoneNumber(formData.phone)) {
        alert("Veuillez remplir correctement tous les champs.");
        return;
    }

    setIsSubmitting(true);
    try {
        const cleanPhone = formData.phone.replace(/[^\d+]/g, '');
        const emailPhonePrefix = cleanPhone.replace('+', '');
        const generatedEmail = `${emailPhonePrefix}@clients.onyxcrm.com`;
        const generatedPassword = cleanPhone.replace(/\D/g, '').slice(-6).padStart(6, "0");

        let realUserId: string | null = null;
        try {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: generatedEmail, password: generatedPassword,
                options: { data: { full_name: formData.name, phone: cleanPhone } }
            });
            if (signUpError) console.error("Échec initial Auth : " + signUpError.message);
            realUserId = signUpData?.user?.id || null;
        } catch (authCrash) {
             console.error("Auth crash ignoré", authCrash);
        }

        const clientPayload: any = {
            ...(realUserId ? { id: realUserId } : {}),
            full_name: formData.name,
            phone: cleanPhone,
            saas: "Nutrition à l'Africaine",
            status: "Lead",
            product_id: "FREE_PLAN",
            mrr_value: 0
        };

        const { data: existingClient } = await supabase.from("clients").select("id").eq("phone", cleanPhone).maybeSingle();
        let finalClientId = realUserId;

        if (existingClient) {
            finalClientId = finalClientId || existingClient.id;
            const { error: clientErr } = await supabase.from("clients").update(clientPayload).eq("phone", cleanPhone);
            if (clientErr) console.error("Erreur client (update) : " + clientErr.message);
        } else {
            const { data: newClient, error: clientErr } = await supabase.from("clients").insert([clientPayload]).select("id").single();
            if (clientErr) console.error("Erreur client (insert) : " + clientErr.message);
            if (newClient) finalClientId = finalClientId || newClient.id;
        }

        await supabase.from('leads').insert([{
            full_name: formData.name, phone: cleanPhone, source: "Free Signup Landing",
            intent: "A créé un compte gratuit", status: "Nouveau", saas: "Nutrition à l'Africaine",
            product_id: "FREE_PLAN",
            mrr_value: 0,
            lead_status: "Prospect (Gratuit)"
        }]);

        await supabase.from('crm_leads').insert([{
            full_name: formData.name,
            phone: cleanPhone,
            source: "Free Signup Landing",
            type: "Lead",
            status: "Nouveau",
            lead_status: "Prospect (Gratuit)",
            product_id: "FREE_PLAN",
            mrr_value: 0,
            saas: "Nutrition à l'Africaine"
        }]);

        try {
            await supabase.auth.signInWithPassword({
                email: generatedEmail, password: generatedPassword
            });
        } catch(e) {
            console.warn('Login ignoré');
        }

        setSuccess(true);
        setTimeout(() => {
            onClose();
            router.push('/nutrition');
        }, 3000);

    } catch (err: any) {
        console.error(err);
        alert(err.message || "Erreur");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (success) {
      return (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white border-t-[8px] border-[#39FF14] rounded-[2rem] shadow-2xl p-8 max-w-md w-full relative text-center">
                <div className="w-16 h-16 bg-[#39FF14]/10 text-[#39FF14] border-2 border-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2`}>Bienvenue !</h3>
                <p className="text-sm font-medium text-zinc-500 mb-6">Ton compte gratuit a été créé avec succès.</p>
                <div className="bg-black border border-zinc-800 p-6 rounded-2xl w-full text-left space-y-4 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10">
                    <p className="font-black text-[#39FF14] text-xs uppercase tracking-widest border-b border-zinc-800 pb-3 mb-3 flex items-center gap-2">
                        <Lock size={14}/> Tes identifiants :
                    </p>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">ID (WhatsApp)</span>
                        <span className="font-black text-white">{formData.phone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mot de passe</span>
                        <span className="font-black text-black bg-[#39FF14] px-2 py-1 rounded-md tracking-wider">
                            {(formData.phone || "0000").replace(/\D/g, '').slice(-6)}
                        </span>
                    </div>
                </div>
                <p className="text-[10px] font-bold text-zinc-400">Redirection vers ton espace en cours...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={(e: any) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-[0_0_20px_rgba(57,255,20,0.15)] p-8 max-w-md w-full relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
        <div className="text-center mb-6">
           <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-4"><Target size={32}/></div>
           <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter`}>Créer un Compte <span className="text-[#39FF14]">Gratuit</span></h3>
           <p className="text-sm font-medium text-zinc-500 mt-2">Rejoignez la communauté en 1 clic pour lire nos articles et découvrir nos conseils.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
           <div>
             <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-1">Votre Prénom et Nom</label>
             <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition" placeholder="Ex: Aminata Diop" />
           </div>
           <div>
             <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-1">Numéro WhatsApp</label>
             <div className="w-full bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden [&_.PhoneInput]:p-4 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:border-none [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:font-bold focus-within:border-black transition-colors">
                 <PhoneInput
                     international
                     defaultCountry="SN"
                     value={formData.phone}
                     onChange={(val) => setFormData({...formData, phone: val || ''})}
                 />
             </div>
           </div>
           <button type="submit" disabled={isSubmitting} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2 mt-2 disabled:opacity-50">
             {isSubmitting ? "Création en cours..." : <><Target size={18}/> Créer mon compte</>}
           </button>
        </form>
      </div>
    </div>
  );
}
