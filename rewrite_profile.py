import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# We know the original code structure exactly since we just reset.
# Find where the `activeTab === 'profile' && (` starts.
start_marker = "{activeTab === 'profile' && ("
end_marker = "{/* Bottom Bento & Services */}"

start_index = content.find(start_marker)
end_index = content.find(end_marker)

if start_index != -1 and end_index != -1:
    section_content = content[start_index:end_index]

    # We will extract only what we need cleanly.

    # Extract "Personal Information" inputs
    # It starts with `<div className="grid grid-cols-2 gap-4 mb-4">` inside `Personal Information`
    p_start = section_content.find('<div className="grid grid-cols-2 gap-4 mb-4">')
    # It ends before `<div className="mt-8">` (which contains Body Measures)
    p_end = section_content.find('<div className="mt-8">')
    # Actually, let's find the closing tag of the `<div>` holding Personal Information.
    # The last element in Personal Information is `<div className="grid grid-cols-3 gap-4">`
    last_p_element = section_content.find('<div className="grid grid-cols-3 gap-4">', p_start)
    p_end = section_content.find('</div>', last_p_element)
    p_end = section_content.find('</div>', p_end + 1)
    p_end = section_content.find('</div>', p_end + 1)
    p_end = section_content.find('</div>', p_end + 1) + 6 # Closes the grid-cols-3 div

    personal_info_html = section_content[p_start:p_end]

    # Translate
    personal_info_html = personal_info_html.replace('First Name', 'Prénom')
    personal_info_html = personal_info_html.replace('Last Name', 'Nom')
    personal_info_html = personal_info_html.replace('Age', 'Âge')
    personal_info_html = personal_info_html.replace('Bio (À propos de moi)', 'Bio (À propos de moi)')

    # Extract "Body Measures" inputs
    b_start = section_content.find('<div className="grid grid-cols-2 gap-4">', p_end)
    b_end = section_content.find('<div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">', b_start)
    # The last div closing inside the grid
    b_end = section_content.rfind('</div>', b_start, b_end)
    b_end = section_content.rfind('</div>', b_start, b_end) + 6 # Closes grid-cols-2
    body_measures_html = section_content[b_start:b_end].strip()

    body_measures_html = body_measures_html.replace('Starting Weight (kg)', 'Poids initial (kg)')
    body_measures_html = body_measures_html.replace('Current Weight (kg)', 'Poids actuel (kg)')
    body_measures_html = body_measures_html.replace('Goal Weight (kg)', 'Poids cible (kg)')
    body_measures_html = body_measures_html.replace('Height (cm)', 'Taille (cm)')
    body_measures_html = body_measures_html.replace('Waist (cm)', 'Tour de taille (cm)')
    body_measures_html = body_measures_html.replace('Hips (cm)', 'Tour de hanches (cm)')

    # Extract buttons
    buttons_html_start = section_content.find('<div className="flex flex-col sm:flex-row items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">', b_end)
    buttons_html_end = section_content.find('</div>', section_content.find('CANCEL\n                           </button>')) + 6
    buttons_html = section_content[buttons_html_start:buttons_html_end]
    buttons_html = buttons_html.replace('sm:w-auto', 'w-full')
    buttons_html = buttons_html.replace('sm:flex-row', '')
    buttons_html = buttons_html.replace('SAVE CHANGES', 'ENREGISTRER')
    buttons_html = buttons_html.replace('CANCEL', 'ANNULER')
    buttons_html = buttons_html.replace('SAVING...', 'ENREGISTREMENT...')

    new_profile_section = f"""{{activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <button onClick={{() => handleTabChange('dashboard')}} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={{16}}/> Retour à l&apos;accueil</button>

{{/* GRANDE CARTE UNIFIÉE DU PROFIL */}}
<div className="w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_40px_rgba(57,255,20,0.08)] border border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden mb-8">

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
     <input type="url" value={{profileForm.cover_url}} onChange={{e => setProfileForm({{...profileForm, cover_url: e.target.value}})}} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-zinc-50 dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="https://..." />
  </div>

  {{/* B. LE GRILLE 3 COLONNES À L'INTÉRIEUR DE LA CARTE UNIFIÉE */}}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">

    {{/* COLONNE 1 - GAUCHE (4/12) : Personal Info */}}
    <div className="lg:col-span-4 space-y-4 order-1">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Informations Personnelles</h3>
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
        className="relative z-10 w-full max-w-[240px] sm:max-w-[280px] h-auto object-contain drop-shadow-[0_0_25px_rgba(57,255,20,0.5)] select-none transition-all duration-500 animate-pulse"
      />
    </div>

    {{/* COLONNE 3 - DROITE (4/12) : Body Measures & Boutons */}}
    <div className="lg:col-span-4 space-y-4 order-2 lg:order-3">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Mesures Corporelles</h3>
      <div className="space-y-4">
          {body_measures_html}
          {buttons_html}
      </div>
    </div>

  </div>
</div>
"""

    content = content[:start_index] + new_profile_section + content[end_index:]

    # Fix the XP Score styling in Bento section
    xp_search = '<div className="text-3xl font-black text-yellow-500">{clientProfile?.jongoma_xp || jongomaXP || 0}</div>'
    xp_replace = '<div className="text-3xl font-black text-[#39FF14]">{clientProfile?.jongoma_xp || clientProfile?.nutrition_profiles?.jongoma_xp || 0}</div>'
    content = content.replace(xp_search, xp_replace)

    with open('src/app/nutrition/page.tsx', 'w') as f:
        f.write(content)
    print("Done")
