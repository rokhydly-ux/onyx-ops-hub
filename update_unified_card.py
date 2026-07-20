import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# I will find the whole profile section and replace it perfectly.
start_marker = '{activeTab === \'profile\' && ('
end_marker = '{/* Mes Badges */}'

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    section_content = content[start_index:end_index]

    # We will reconstruct this section manually based on the user's instructions.

    # Extract the personal information inputs block
    personal_info_start = section_content.find('<div className="grid grid-cols-2 gap-4 mb-4">')
    personal_info_end = section_content.find('</form>')
    personal_info_html = section_content[personal_info_start:personal_info_end].strip()

    # Remove the extra `</div>` at the end of personal_info_html (it belonged to the form wrapper)
    # The last `</div>` before `</form>` in original was closing the form wrapper.
    if personal_info_html.endswith('</div>\n                                </div>\n                            </div>\n                            \n                            </div>'):
        pass # we will just leave it if it's there

    # Actually, personal_info_html has a stray </div>. Let's just fix the whole string properly.
    # original personal_info_html ends with:
    #                                   <div>
    #                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Twitter (X)</label>
    #                                      <input type="text" value={profileForm.twitter} onChange={e => setProfileForm({...profileForm, twitter: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="@username" />
    #                                   </div>
    #                                </div>
    #                            </div>

    # Find the exact last index of `</div>` and remove the one after it if we over-extracted.
    # Wait, the structure is:
    # <div>
    #   <h3 ...>Personal Information</h3>
    #   <div className="grid grid-cols-2 ...">
    #     <div>First Name</div>
    #     <div>Last Name</div>
    #   </div>
    #   <div>Age</div>
    #   <div>Bio</div>
    #   <div className="grid grid-cols-3 ...">
    #     <div>Insta</div>
    #     <div>Facebook</div>
    #     <div>Twitter</div>
    #   </div>
    # </div>
    # We extracted from `<div className="grid grid-cols-2 ...">` to `</form>`.
    # So we extracted:
    #   <div className="grid grid-cols-2 ..."> ... </div>
    #   <div>Age</div>
    #   <div>Bio</div>
    #   <div className="grid grid-cols-3 ..."> ... </div>
    # </div> (closes the <div className="space-y-6"> which was outside)

    # We should just take the content of the `<div>` holding the fields.
    # We'll just take it as is, and remove the very last `</div>`!
    personal_info_html = personal_info_html.rsplit('</div>', 1)[0].strip()

    # Same for body measures
    body_measures_start = section_content.find('<div className="grid grid-cols-2 gap-4">')
    body_measures_end = section_content.find('<div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">')
    body_measures_html = section_content[body_measures_start:body_measures_end].strip()
    body_measures_html = body_measures_html.rsplit('</div>', 1)[0].strip()


    # Extract buttons
    buttons_html_start = section_content.find('<div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">')
    buttons_html_end = section_content.find('</div>', section_content.find('CANCEL\n                           </button>')) + 6
    buttons_html = section_content[buttons_html_start:buttons_html_end]
    buttons_html = buttons_html.replace('sm:w-auto', 'w-full')
    buttons_html = buttons_html.replace('sm:flex-row', '')

    # Fix body measures logic for XP score
    # Look for {imcValue} and {jongomaXP} in Bento block
    # wait, we reconstruct from activeTab === 'profile'

    new_profile_section = f"""{{activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <button onClick={{() => handleTabChange('dashboard')}} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={{16}}/> Retour à l&apos;accueil</button>

{{/* GRANDE CARTE UNIFIÉE DU PROFIL */}}
<div className="w-full bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_40px_rgba(57,255,20,0.08)] border border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden mb-8">

  {{/* A. EN-TÊTE : LA BANNIÈRE DE COUVERTURE & AVATAR */}}
  <div className="w-full h-40 sm:h-48 rounded-3xl bg-zinc-800 relative overflow-hidden mb-12 group">
    {{profileForm.cover_url || clientProfile?.cover_url ? (
      <img src={{profileForm.cover_url || clientProfile?.cover_url}} alt="Cover" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-600 text-sm font-poppins">Bannière par défaut • Ajoutez une URL ci-dessous</div>
    )}}

    {{/* Avatar superposé en bas à gauche */}}
    <div className="absolute -bottom-6 left-6 z-20" onClick={{handleChangeAvatar}} title="Changer l'avatar par URL">
      <img src={{profileForm.avatar_url || clientProfile?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileForm.firstName || "M")}} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 object-cover shadow-lg cursor-pointer hover:opacity-80 transition-opacity bg-zinc-100" />
    </div>
  </div>

  <div className="mb-8 max-w-2xl">
     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">URL de la photo de couverture (Optionnel)</label>
     <input type="url" value={{profileForm.cover_url}} onChange={{e => setProfileForm({{...profileForm, cover_url: e.target.value}})}} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-zinc-50 dark:bg-zinc-950 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="https://..." />
  </div>

  {{/* B. LE GRILLE 3 COLONNES À L'INTÉRIEUR DE LA CARTE UNIFIÉE */}}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">

    {{/* COLONNE 1 - GAUCHE (4/12) : Personal Info */}}
    <div className="lg:col-span-4 space-y-4 order-1">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Personal Information</h3>
      <div className="space-y-4">
         {personal_info_html}
      </div>
    </div>

    {{/* COLONNE 2 - CENTRE (4/12) : L'Illustration NXA avec Halo Néon */}}
    <div className="lg:col-span-4 flex justify-center items-center py-6 relative order-3 lg:order-2">
      {{/* Halo lumineux d'arrière-plan */}}
      <div className="absolute inset-0 bg-[#39FF14]/20 dark:bg-[#39FF14]/15 rounded-full filter blur-3xl animate-pulse pointer-events-none" />

      {{/* Illustration NXA */}}
      <img
        src={{theme === 'dark'
          ? "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784394483/profile_blanc_lqoyxi.png"
          : "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784394442/profile_xeijfi.png"
        }}
        alt="NXA Wellness Warrior"
        className="relative z-10 w-full max-w-[240px] sm:max-w-[280px] h-auto object-contain drop-shadow-[0_0_25px_rgba(57,255,20,0.5)] select-none transition-all duration-500"
      />
    </div>

    {{/* COLONNE 3 - DROITE (4/12) : Body Measures & Boutons */}}
    <div className="lg:col-span-4 space-y-4 order-2 lg:order-3">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Body Measures</h3>
      <div className="space-y-4">
          {body_measures_html}
          {buttons_html}
      </div>
    </div>

  </div>
</div>

             {{/* Bottom Bento & Services */}}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="col-span-2 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Métabolisme de base (BMR)</span>
                  <div className="text-4xl font-black text-black dark:text-white">{{clientProfile?.diagnostic_data?.bmr || '---'}} <span className="text-sm font-bold text-zinc-400">kcal / jour</span></div>
                </div>

                <div className="col-span-1 bg-[#39FF14]/10 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Mon IMC</span>
                  <div className="text-3xl font-black text-green-700">{{imcValue}}</div>
                </div>

                <div className="col-span-1 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Score XP</span>
                  <div className="text-3xl font-black text-[#39FF14]">{{clientProfile?.jongoma_xp || clientProfile?.nutrition_profiles?.jongoma_xp || 0}}</div>
                </div>
             </div>

             """

    content = content[:start_index] + new_profile_section + content[end_index:]

    with open('src/app/nutrition/page.tsx', 'w') as f:
        f.write(content)
    print("Done")
