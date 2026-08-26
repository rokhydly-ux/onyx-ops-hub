import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function ProfileTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>

{/* GRANDE CARTE UNIFIÉE DU PROFIL */}
<div className="w-full bg-white dark:bg-zinc-950 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_40px_rgba(57,255,20,0.08)] border border-zinc-200/80 dark:border-zinc-800/80 relative overflow-hidden mb-8">

  {/* A. EN-TÊTE : LA BANNIÈRE DE COUVERTURE & AVATAR */}
  <div className="w-full h-40 sm:h-48 rounded-3xl bg-zinc-800 relative overflow-hidden mb-12 group">
    {profileForm.cover_url || clientProfile?.cover_url ? (
      <img src={profileForm.cover_url || clientProfile?.cover_url} alt="Cover" className="w-full h-full object-cover" />
    ) : (
      <div className="w-full h-full bg-gradient-to-r from-zinc-800 to-zinc-900 flex items-center justify-center text-zinc-600 text-sm font-poppins">Bannière par défaut • Ajoutez une URL ci-dessous</div>
    )}

    {/* Avatar superposé en bas à gauche */}
    <div className="absolute -bottom-6 left-6 z-20" onClick={handleChangeAvatar} title="Changer l'avatar par URL">
      <img src={profileForm.avatar_url || clientProfile?.avatar_url || "https://ui-avatars.com/api/?name=" + encodeURIComponent(profileForm.firstName || "M")} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-zinc-900 object-cover shadow-lg cursor-pointer hover:opacity-80 transition-opacity bg-zinc-100" />
    </div>
  </div>

  <div className="mb-8 max-w-2xl">
     <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">URL de la photo de couverture (Optionnel)</label>
     <input type="url" value={profileForm.cover_url} onChange={e => setProfileForm({...profileForm, cover_url: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-zinc-50 dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="https://..." />
  </div>

  {/* B. LE GRILLE 3 COLONNES À L'INTÉRIEUR DE LA CARTE UNIFIÉE */}
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-6">

    {/* COLONNE 1 - GAUCHE (4/12) : Personal Info */}
    <div className="lg:col-span-4 space-y-4 order-1">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Informations Personnelles</h3>
      <div className="space-y-4">
         <div className="grid grid-cols-2 gap-4 mb-4">
                                   <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Prénom</label>
                                      <input type="text" value={profileForm.firstName} onChange={e => setProfileForm({...profileForm, firstName: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" required />
                                   </div>
                                   <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nom</label>
                                      <input type="text" value={profileForm.lastName} onChange={e => setProfileForm({...profileForm, lastName: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" required />
                                   </div>
                                </div>
                                <div className="mb-4">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Âge</label>
                                   <input type="number" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="Ex: 30" />
                                </div>
                                <div className="mb-4">
                                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Bio (À propos de moi)</label>
                                   <textarea rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none resize-none" placeholder="African Wellness Warrior. Passionate about healthy eating..."></textarea>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                   <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Instagram</label>
                                      <input type="text" value={profileForm.instagram} onChange={e => setProfileForm({...profileForm, instagram: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="@username" />
                                   </div>
                                   <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Facebook</label>
                                      <input type="text" value={profileForm.facebook} onChange={e => setProfileForm({...profileForm, facebook: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="/username" />
                                   </div>
                                   <div>
                                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Twitter (X)</label>
                                      <input type="text" value={profileForm.twitter} onChange={e => setProfileForm({...profileForm, twitter: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" placeholder="@username" />
                                   </div>
                                </div>
      </div>
    </div>

    {/* COLONNE 2 - CENTRE (4/12) : L'Illustration NXA avec Halo Néon */}
    <div className="lg:col-span-4 flex justify-center items-center py-6 relative order-3 lg:order-2">
      {/* Halo lumineux d'arrière-plan */}
      <div className="absolute inset-0 bg-[#39FF14]/20 dark:bg-[#39FF14]/15 rounded-full filter blur-3xl animate-pulse pointer-events-none" />

      {/* Illustration NXA */}
      <img
        src={theme === 'dark'
          ? "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784394483/profile_blanc_lqoyxi.png"
          : "https://res.cloudinary.com/dtr2wtoty/image/upload/v1784394442/profile_xeijfi.png"
        }
        alt="NXA Wellness Warrior"
        className="relative z-10 w-full max-w-[240px] sm:max-w-[280px] h-auto object-contain drop-shadow-[0_0_25px_rgba(57,255,20,0.5)] select-none transition-all duration-500 animate-pulse"
      />
    </div>

    {/* COLONNE 3 - DROITE (4/12) : Body Measures & Boutons */}
    <div className="lg:col-span-4 space-y-4 order-2 lg:order-3">
      <h3 className="font-poppins-bold text-lg text-zinc-900 dark:text-white mb-4 uppercase">Mesures Corporelles</h3>
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Poids initial (kg)</label>
                                        <input type="number" value={profileForm.startingWeight} onChange={e => setProfileForm({...profileForm, startingWeight: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Poids actuel (kg)</label>
                                        <input type="number" value={profileForm.currentWeight} onChange={e => setProfileForm({...profileForm, currentWeight: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Poids cible (kg)</label>
                                        <input type="number" value={profileForm.goalWeight} onChange={e => setProfileForm({...profileForm, goalWeight: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Taille (cm)</label>
                                        <input type="number" value={profileForm.height} onChange={e => setProfileForm({...profileForm, height: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Tour de taille (cm)</label>
                                        <input type="number" value={profileForm.waist} onChange={e => setProfileForm({...profileForm, waist: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Tour de hanches (cm)</label>
                                        <input type="number" value={profileForm.hips} onChange={e => setProfileForm({...profileForm, hips: e.target.value})} className="w-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 focus:border-[#39FF14] bg-white dark:bg-zinc-900 p-4 text-zinc-900 dark:text-white font-poppins text-sm transition-colors outline-none" />
                                    </div>
                                </div>
          <div className="flex flex-col  items-center gap-4 mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                           <button onClick={handleSaveProfile} disabled={isSaving} className="w-full w-full bg-[#39FF14] text-black font-poppins-extrabold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-all">
                              {isSaving ? "ENREGISTREMENT..." : "ENREGISTRER"}
                           </button>
                           <button className="w-full w-full bg-black text-white dark:bg-zinc-800 px-6 py-4 rounded-full font-poppins-bold hover:opacity-80 transition-opacity">
                              ANNULER
                           </button>
                        </div>
      </div>
    </div>

  </div>
</div>
{/* Bottom Bento & Services */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="col-span-2 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Métabolisme de base (BMR)</span>
                  <div className="text-4xl font-black text-black dark:text-white">{clientProfile?.diagnostic_data?.bmr || '---'} <span className="text-sm font-bold text-zinc-400">kcal / jour</span></div>
                </div>

                <div className="col-span-1 bg-[#39FF14]/10 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Mon IMC</span>
                  <div className="text-3xl font-black text-green-700">{imcValue}</div>
                </div>

                <div className="col-span-1 bg-zinc-50 dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200/60 dark:border-zinc-800 flex flex-col justify-center items-center text-center">
                  <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Score XP</span>
                  <div className="text-3xl font-black text-[#39FF14]">{clientProfile?.jongoma_xp || clientProfile?.nutrition_profiles?.jongoma_xp || 0}</div>
                </div>
             </div>

             {/* Mes Badges Débloqués */}
             <div className="bg-white dark:bg-zinc-950 p-8 rounded-[24px] border border-zinc-200 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8">
                 <h3 className="text-lg font-black uppercase text-black dark:text-white mb-6 flex items-center gap-2"><Trophy className="text-yellow-500"/> Mes Badges Débloqués</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Force Baobab', url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/FORCE_BAOBAB_ltcuer.png', xpReq: 0 },
                      { name: 'Maître du Fonio', url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/MAITRE_DU_FONIO_emczhf.png', xpReq: 100 },
                      { name: 'Lekkologue Or', url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEKKOLOGUE_OR_a0znxt.png', xpReq: 500 },
                      { name: 'Légende', url: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEGENDE_z4ipny.png', xpReq: 1000 }
                    ].map((b, i) => {
                       const currentXP = clientProfile?.jongoma_xp || clientProfile?.nutrition_profiles?.jongoma_xp || 0;
                       const unlocked = currentXP >= b.xpReq;
                       return (
                         <div key={i} className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${unlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border-yellow-200 dark:border-yellow-800' : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800'}`}>
                             {!unlocked && <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] z-10 rounded-2xl flex items-center justify-center"><Lock className="text-zinc-500 w-8 h-8" /></div>}
                             <img src={b.url} alt={b.name} className={`w-20 h-20 object-contain mb-3 drop-shadow-md ${unlocked ? '' : 'grayscale opacity-40'}`} />
                             <p className={`text-xs font-black uppercase tracking-widest text-center ${unlocked ? 'text-yellow-700 dark:text-yellow-400' : 'text-zinc-400'}`}>{b.name}</p>
                             <p className="text-[9px] font-bold text-zinc-400 mt-1">{b.xpReq} XP requis</p>
                         </div>
                       )
                    })}
                 </div>
             </div>

             <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
                <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Bell className="text-orange-500"/> Notifications & Rappels</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl gap-4">
                   <div>
                       <p className="font-bold text-sm text-black">Rappels d'hydratation (Eau)</p>
                       <p className="text-[10px] font-black uppercase text-zinc-500 mt-1">Toutes les 2 heures si objectif non atteint</p>
                   </div>
                   <div className="flex items-center gap-3">
                       <button onClick={sendWaterReminderPush} className="text-[10px] font-bold text-zinc-400 hover:text-black uppercase underline">Tester</button>
                       <button onClick={togglePushNotifications} className={`px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest transition-colors ${pushEnabled ? 'bg-green-100 text-green-700' : 'bg-black text-[#39FF14] hover:bg-zinc-800'}`}>
                           {pushEnabled ? 'Activé' : 'Activer'}
                       </button>
                   </div>
                </div>
             </div>

             <div className="bg-white p-8 rounded-[24px] border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mt-8">
                <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Download className="text-[#39FF14]"/> Historique des Téléchargements PDF</h3>
                {Array.isArray(pdfHistory) && pdfHistory.length > 0 ? (
                   <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                      {pdfHistory.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                            <div>
                               <p className="font-bold text-sm text-black">{item.type}</p>
                               <p className="text-[10px] font-black uppercase text-zinc-500">{item.date && !isNaN(new Date(item.date).getTime()) ? new Date(item.date).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'}) : 'Date inconnue'}</p>
                            </div>
                            {item.url ? (
                               <a href={item.url} target="_blank" rel="noopener noreferrer" className="bg-black text-[#39FF14] px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-transform flex items-center gap-2 w-max">
                                  <ExternalLink size={14}/> Ouvrir
                               </a>
                            ) : (
                               <span className="bg-zinc-200 text-zinc-500 px-3 py-1 rounded-lg text-[10px] font-black uppercase w-max">Local</span>
                            )}
                         </div>
                      ))}
                   </div>
                ) : (
                   <p className="text-sm font-medium text-zinc-500 italic">Aucun PDF téléchargé ou partagé pour le moment.</p>
                )}
             </div>
          </div>

    </>
  );
}
