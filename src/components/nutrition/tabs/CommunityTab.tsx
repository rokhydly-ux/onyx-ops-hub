import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function CommunityTab({ ...tabProps }: any) {
  const [activeFeedFilter, setActiveFeedFilter] = React.useState("all");



  const { today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, handleToggleComments, handleLikeComment, handlePostComment } = tabProps;

  return (
    <>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                     <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783098237/8_v1l6ms.png" alt="Lekkologue Icon" className="w-10 h-10 object-contain drop-shadow-md" /> Club des Lekkologues</h2>
                     <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center bg-white border border-zinc-200 rounded-full px-4 py-2 flex-1 md:w-64 shadow-sm">
                            <Search size={16} className="text-zinc-400" />
                            <input type="text" placeholder="Search Feed..." className="bg-transparent border-none text-xs text-black outline-none w-full ml-2 placeholder:text-zinc-400" />
                        </div>
                        <button onClick={(e) => { e.preventDefault(); setShowMobileHub(true); setIsMobileMenuOpen(true); setIsSidebarOpen(true); }} className="lg:hidden flex items-center gap-2 bg-zinc-100 hover:bg-[#39FF14] text-zinc-900 px-4 py-2 rounded-full text-sm font-bold transition-colors shadow-sm shrink-0">
                            <Trophy className="w-4 h-4 text-[#39FF14]"/> Hub Club
                        </button>
                     </div>
                 </div>

                 {/* NAVIGATION HORIZONTALE DESKTOP (PILLS SUB-NAV) */}
                 <div className="hidden lg:flex items-center gap-2 mb-8 bg-zinc-100 dark:bg-zinc-800/60 p-1.5 rounded-full w-fit border border-zinc-200/50 dark:border-zinc-700/50">

                    {/* 1. Bouton Le Mur */}
                    <button
                      onClick={(e) => { e.preventDefault(); handleTabChange('community'); setActiveFeedFilter('all'); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins-bold text-sm transition-all duration-300 ${
                        activeTab === 'community' && activeFeedFilter === 'all'
                          ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20 scale-105'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>🌟 Le Mur</span>
                    </button>

                    {/* 2. Bouton Recettes & Menus */}
                    <button
                      onClick={(e) => { e.preventDefault(); setActiveFeedFilter('recipes'); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins-bold text-sm transition-all duration-300 ${
                        activeFeedFilter === 'recipes'
                          ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20 scale-105'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <Utensils className="w-4 h-4" />
                      <span>🍲 Recettes & Menus</span>
                    </button>

                    {/* 3. Bouton Challenges Tendance */}
                    <button
                      onClick={(e) => {
                        e.preventDefault(); document.getElementById('challenges-section')?.scrollIntoView({ behavior: 'smooth' });
                        // Future action to explicitly pop up the challenge modal if implemented.
                        // We scroll to it for now since it is part of the right column.
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins-bold text-sm text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-all duration-300 cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
                      <span>🏆 Challenges Tendance</span>
                    </button>

                    {/* 4. Bouton Mon Profil */}
                    <button
                      onClick={(e) => { e.preventDefault(); handleTabChange('profile'); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins-bold text-sm transition-all duration-300 ${
                        activeTab === 'profile'
                          ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20 scale-105'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>⚙️ Mon Profil</span>
                    </button>

                 </div>

                 {/* BARRE DES STORIES (Carrousel Horizontal) */}
                 <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-none mb-4 relative z-10">
                     {/* 1er cercle : "Ajouter ma story" */}
                     <div className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={() => storyInputRef.current?.click()}>
                         <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 p-0.5 flex items-center justify-center bg-zinc-50 hover:bg-zinc-100 transition-colors">
                             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} className="w-full h-full rounded-full object-cover pointer-events-none" alt="Moi" />
                             <Plus className="w-5 h-5 text-black bg-[#39FF14] rounded-full absolute bottom-0 right-0 border-2 border-white dark:border-zinc-900 pointer-events-none"/>
                         </div>
                         <span className="text-xs font-poppins text-center mt-1 truncate w-16 text-zinc-600 font-medium">Ajouter</span>
                         <input type="file" accept="image/*,video/mp4" capture="environment" className="hidden" ref={storyInputRef} onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                                 setStoryPreviewFile(file);
                                 setStoryPreviewUrl(URL.createObjectURL(file));
                                 setStoryCaption("");
                             }
                         }} />
                     </div>

                     {/* Les cercles des autres membres */}
                     {groupedStories.map((group, idx) => (
                         <div key={group.client.id} className="flex flex-col items-center gap-1 cursor-pointer shrink-0" onClick={(e) => {
                             if (!group.stories || group.stories.length === 0) return;
                             setViewerActiveGroupIndex(idx);
                             setViewerActiveStoryIndex(0);
                         }}>
                             <div className={`w-16 h-16 rounded-full p-0.5 relative transition-transform hover:scale-105 ${group.allViewed ? 'border-2 border-zinc-300 dark:border-zinc-700' : 'border-[3px] border-[#39FF14] shadow-md shadow-[#39FF14]/30'}`}>
                                 <img src={group.client.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(group.client.full_name || 'Membre')}&background=random`} className="w-full h-full rounded-full object-cover border-2 border-white dark:border-zinc-950 pointer-events-none" alt={group.client.full_name} />
                             </div>
                             <span className="text-xs font-poppins text-center mt-1 truncate w-16 text-zinc-800 font-medium">{group.client.full_name?.split(' ')[0]}</span>
                         </div>
                     ))}
                 </div>

                 {/* Grille 3 Colonnes */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                     {/* Colonne Gauche : Favoris & Communauté (3 cols) */}
                     <div className="hidden lg:flex lg:col-span-3 flex-col gap-6">

                         {/* Mini Profile Card */}
                         <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm relative mb-6">
                             <div className="h-24 bg-zinc-800 w-full relative">
                                 {clientProfile?.cover_url ? (
                                     <img src={clientProfile.cover_url} className="w-full h-full object-cover" alt="Cover" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} />
                                 ) : (
                                     <div className="absolute inset-0 bg-gradient-to-r from-black to-zinc-800"><div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div></div>
                                 )}
                             </div>
                             <div className="px-6 pb-6 relative flex flex-col items-center">
                                 <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} className="w-16 h-16 rounded-full border-4 border-white shadow-md -mt-8 mb-3 bg-zinc-100 object-cover" alt="Moi" />
                                 <div className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm absolute top-4 left-4">Lekkologue Pro</div>

                                 <p className="text-sm font-black text-black text-center">{user?.full_name || 'Membre'}</p>
                                 <p className="text-xs text-zinc-500 font-poppins mt-1 line-clamp-2 text-center">{clientProfile?.bio || "Ajoutez une bio dans vos réglages..."}</p>

                                 <div className="grid grid-cols-2 w-full gap-4 text-center border-t border-zinc-100 pt-4 mb-2 mt-4">
                                     <div onClick={openLeaderboard} className="cursor-pointer hover:bg-zinc-50 rounded-xl p-1 transition-colors">
                                         <p className="text-lg font-black text-black">{jongomaXP}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Score XP</p>
                                     </div>
                                     <div className="cursor-pointer hover:bg-zinc-50 rounded-xl p-1 transition-colors">
                                         <p className="text-lg font-black text-black">{myFollowersCount}</p>
                                         <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Abonnés</p>
                                     </div>
                                 </div>

                                 <button
                                   onClick={async () => { await supabase.auth.signOut(); window.location.href = '/nutriafro-login'; }}
                                   className="w-full mt-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-poppins-bold rounded-xl transition-all flex items-center justify-center gap-2"
                                 >
                                   Déconnexion
                                 </button>
                             </div>
                         </div>

                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Favoris</p>
                             <div className="space-y-4">
                                 {['Coach Rokhy', 'Dr. Thierno', 'Amina Fall'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} className="w-10 h-10 rounded-full border border-zinc-200" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <Heart size={14} className="text-red-500 fill-red-500" />
                                     </div>
                                 ))}
                             </div>
                         </div>

                         <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                             <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Abonnements</p>
                             <div className="space-y-4">
                                 {['Sophie Diop', 'Marietou Sall', 'Ndeye Ndiaye'].map((name, i) => (
                                     <div key={i} className="flex items-center justify-between cursor-pointer hover:bg-zinc-50 p-2 -mx-2 rounded-xl transition-colors group">
                                         <div className="flex items-center gap-3">
                                             <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 grayscale group-hover:grayscale-0 transition-all" alt={name} />
                                             <p className="text-xs font-bold text-black group-hover:text-[#39FF14] transition-colors">{name}</p>
                                         </div>
                                         <button className="text-[10px] font-black text-zinc-400 hover:text-black">Suivre</button>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     </div>

                     {/* Colonne Centrale : Feed (6 cols) */}
                     <div className="col-span-1 lg:col-span-6 space-y-6">
                        {/* Zone de Création */}
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm focus-within:border-[#39FF14]/50 transition-colors">
                           {/* Media Preview (Image/Video) */}
                           {postMode === 'normal' && (newPostImage || newPostVideo) && (
                               <div className="relative w-full aspect-[4/3] mb-4 rounded-2xl overflow-hidden border border-zinc-200 bg-black">
                                  {newPostVideo ? (
                                      <video src={newPostVideo} controls playsInline className="w-full h-full object-contain" />
                                  ) : (
                                      <img src={newPostImage || ''} className="w-full h-full object-contain" />
                                  )}
                                  <button onClick={(e) => { setNewPostImage(null); setNewPostVideo(null); }} className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 z-10"><X size={14}/></button>
                               </div>
                           )}

                           {/* Text Input Area */}
                           <div className="flex items-start gap-4">
                               {postMode === 'normal' && (
                                   <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Membre')}&background=random`} className="w-10 h-10 rounded-full border border-zinc-200 object-cover mt-1" alt="Moi" />
                               )}
                               <div className={`flex-1 relative transition-all ${postMode === 'text_only' ? `h-64 rounded-2xl ${TEXT_BACKGROUNDS[textBgIndex].startsWith("url") ? "" : TEXT_BACKGROUNDS[textBgIndex]} bg-cover bg-center p-6 flex flex-col justify-center items-center` : ''}`} style={postMode === 'text_only' ? { backgroundImage: TEXT_BACKGROUNDS[textBgIndex].startsWith("url") ? TEXT_BACKGROUNDS[textBgIndex] : "none", backgroundSize: "cover", backgroundPosition: "center" } : {}}>
                                   <textarea
                                       value={newPostText}
                                       onChange={e => {
                                           if (postMode === 'text_only' && e.target.value.length > 280) return;
                                           setNewPostText(e.target.value);
                                           // Trigger Friend Tagging simulation
                                           if (e.target.value.endsWith('@')) {
                                               // Here you would normally show a dropdown
                                           }
                                       }}
                                       placeholder={postMode === 'text_only' ? "Exprimez-vous..." : "Partagez votre repas, un défi, ou une vidéo..."}
                                       className={`w-full bg-transparent resize-none outline-none font-medium ${postMode === 'text_only' ? 'text-center text-white text-2xl font-black placeholder:text-white/70' : 'text-sm min-h-[60px] text-zinc-900 dark:text-white placeholder:text-zinc-400 mt-2'}`}
                                   />
                                   {postMode === 'text_only' && (
                                       <>
                                           <div className="absolute bottom-4 right-4 text-white/50 text-xs font-black tracking-widest">NXA</div>
                                           <div className="absolute top-4 right-4 text-white/80 text-xs font-bold">{280 - newPostText.length}</div>
                                       </>
                                   )}
                               </div>
                           </div>

                           {/* Location & Tags Preview */}
                           {(locationName || taggedFriends.length > 0) && postMode === 'normal' && (
                               <div className="flex flex-wrap gap-2 mt-3 ml-14">
                                   {locationName && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-1"><Compass size={12}/> {locationName}</span>}
                                   {taggedFriends.map((f, i) => <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md text-blue-600 dark:text-blue-400 font-bold">@{f}</span>)}
                               </div>
                           )}

                           {/* Toolbars */}
                           <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                              <div className="flex flex-wrap gap-2">
                                  {postMode === 'normal' ? (
                                      <>
                                          <label className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 cursor-pointer bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2">
                                             <input type="file" accept="image/*,video/mp4" capture="environment" className="hidden" onChange={(e) => {
                                                 const file = e.target.files?.[0];
                                                 if (!file) return;
                                                 if (file.type.startsWith('video/')) {
                                                     if (file.size > 15 * 1024 * 1024) return alert("Vidéo trop lourde (Max 15 Mo).");
                                                     // Simplified local preview for video
                                                     setNewPostVideo(URL.createObjectURL(file));
                                                     setNewPostImage(null);
                                                 } else {
                                                     handleImageUpload(e);
                                                 }
                                             }} disabled={uploadingImage} />
                                             {uploadingImage ? <Activity size={16} className="animate-spin" /> : <Camera size={16}/>}
                                             <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Média</span>
                                          </label>

                                          <button onClick={() => setPostMode('text_only')} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2">
                                              <FileText size={16}/>
                                              <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:block">Texte</span>
                                          </button>

                                          <button onClick={(e) => {
                                              const loc = prompt("📍 Où êtes-vous ? (Ex: Dakar, Sénégal)");
                                              if (loc) setLocationName(loc);
                                          }} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2">
                                              <span className="text-base leading-none">📍</span>
                                          </button>

                                          <button onClick={(e) => {
                                              const friend = prompt("@ Mentionnez un ami :");
                                              if (friend) setTaggedFriends([...taggedFriends, friend]);
                                          }} className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors p-2 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 rounded-xl flex items-center gap-2 font-black">
                                              @
                                          </button>
                                      </>
                                  ) : (
                                      <div className="flex gap-2 overflow-x-auto max-w-[200px] scrollbar-none">
                                          <button onClick={() => setPostMode('normal')} className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-500 shrink-0 hover:bg-zinc-300"><X size={14}/></button>
                                          {[...TEXT_BACKGROUNDS].reverse().map((bg, idx) => {
                                              const originalIdx = TEXT_BACKGROUNDS.length - 1 - idx;
                                              return (
                                                  <button key={originalIdx} onClick={() => setTextBgIndex(originalIdx)} className={`w-8 h-8 rounded-full shrink-0 ${bg.startsWith("url") ? "" : bg} bg-cover border-2 ${textBgIndex === originalIdx ? 'border-black' : 'border-transparent'}`} style={{ backgroundImage: bg.startsWith("url") ? bg : "none", backgroundSize: "cover", backgroundPosition: "center" }}></button>
                                              );
                                          })}
                                      </div>
                                  )}
                              </div>
                              <button onClick={handlePostCommunity} disabled={(!newPostText.trim() && !newPostImage && !newPostVideo) || uploadingImage} className="bg-black text-[#39FF14] px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md disabled:opacity-50 disabled:cursor-not-allowed">Publier</button>
                           </div>
                        </div>

                        {/* Filtre Favoris */}
                        {showSavedOnly && (
                            <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-300 flex items-center gap-2">📌 Mes Favoris Sauvegardés</span>
                                <button onClick={() => setShowSavedOnly(false)} className="text-zinc-400 hover:text-black dark:hover:text-white"><X size={16}/></button>
                            </div>
                        )}

                        {/* Le Feed */}
                        <div className="space-y-6">
                           {Array.isArray(communityPosts) && communityPosts.length > 0 ? communityPosts.filter(p => showSavedOnly ? p._bookmarkedByMe : true).filter(p => activeFeedFilter === 'recipes' ? (p.tags?.includes('recette') || p.tags?.includes('menu') || p.content?.toLowerCase().includes('recette') || p.content?.toLowerCase().includes('plat') || p.image_url) : true).map((post, idx) => (
                              <React.Fragment key={post.id || idx}>
                                 {/* Injection Challenge Mobile tous les 4 posts */}
                                 {idx > 0 && idx % 4 === 0 && activeChallenge && (
                                     <div id={`mobile-challenge-${idx}`} className="lg:hidden bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-0 shadow-xl relative overflow-hidden group transition-all mb-6 border border-zinc-800">
                                         <div className="h-48 relative bg-black cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }}>
                                             {activeChallenge.cover_url?.includes('.mp4') ? (
                                                 <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                                             ) : (
                                                 <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-80" />
                                             )}
                                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                             <div className="absolute top-4 left-4 flex gap-2">
                                                 <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"><Flame size={10} className="fill-black"/> Tendance</span>
                                                 <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">+{activeChallenge.reward_xp || 500} XP</span>
                                             </div>
                                             <div className="absolute bottom-4 left-4 right-4">
                                                 <h3 className="font-poppins-black text-white text-xl leading-tight line-clamp-2 mb-2">{activeChallenge.title}</h3>
                                                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }} className="w-full text-xs font-black uppercase tracking-widest text-black bg-[#39FF14] px-4 py-3 rounded-xl hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(57,255,20,0.2)]">Rejoindre le challenge</button>
                                             </div>
                                         </div>
                                     </div>
                                 )}
<React.Fragment key={post.id || idx}>
                                 {/* Injection Challenge Mobile tous les 4 posts */}
                                 {idx > 0 && idx % 4 === 0 && activeChallenge && (
                                     <div id={`mobile-challenge-${idx}`} className="lg:hidden bg-gradient-to-br from-zinc-900 to-black rounded-[2rem] p-0 shadow-xl relative overflow-hidden group transition-all mb-6 border border-zinc-800">
                                         <div className="h-48 relative bg-black cursor-pointer" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }}>
                                             {activeChallenge.cover_url?.includes('.mp4') ? (
                                                 <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
                                             ) : (
                                                 <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-80" />
                                             )}
                                             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                                             <div className="absolute top-4 left-4 flex gap-2">
                                                 <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md flex items-center gap-1"><Flame size={10} className="fill-black"/> Tendance</span>
                                                 <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">+{activeChallenge.reward_xp || 500} XP</span>
                                             </div>
                                             <div className="absolute bottom-4 left-4 right-4">
                                                 <h3 className="font-poppins-black text-white text-xl leading-tight line-clamp-2 mb-2">{activeChallenge.title}</h3>
                                                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }} className="w-full text-xs font-black uppercase tracking-widest text-black bg-[#39FF14] px-4 py-3 rounded-xl hover:scale-105 transition-transform shadow-[0_5px_15px_rgba(57,255,20,0.2)]">Rejoindre le challenge</button>
                                             </div>
                                         </div>
                                     </div>
                                 )}
<div key={post.id || idx} className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col group">
                                 <div className="flex items-center justify-between mb-4">
                                     <div className="flex items-center gap-3">
                                        {post.clients?.avatar_url && !post.clients.avatar_url.includes('ui-avatars') ? (
                                           <img src={post.clients.avatar_url} alt={post.client} className="w-12 h-12 rounded-full border border-zinc-200 object-cover shadow-inner" />
                                        ) : (
                                           <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center font-black text-xl shadow-inner">{post.client?.charAt(0) || 'M'}</div>
                                        )}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-black text-sm text-black flex items-center gap-1">{post.client || 'Membre'} <CheckCircle size={12} className="text-[#39FF14] fill-[#39FF14] text-black"/></p>
                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    followedUsers.includes(post.client_id) ? (
                                                        <span className="text-[10px] font-bold text-zinc-400">✓ Abonné</span>
                                                    ) : (
                                                        <button onClick={() => handleFollowUser(post.client_id)} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-[#39FF14] px-2 py-0.5 rounded-full font-poppins-bold hover:bg-[#39FF14] hover:text-black transition-all shadow-sm">+ Suivre</button>
                                                    )
                                                )}
                                                {post.client_id && post.client_id !== clientProfile?.id && (
                                                    <div className="flex items-center gap-2 ml-2">
                                                        <button className="text-zinc-400 hover:text-[#39FF14] transition-colors" title="Message Privé" onClick={() => alert("La messagerie privée arrive bientôt !")}>
                                                            <MessageSquare size={14} />
                                                        </button>
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.instagram && (
                                                            <a href={`https://instagram.com/${post.clients.nutrition_profiles[0].diagnostic_data.instagram.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors" title="Instagram">
                                                                <Instagram size={14} />
                                                            </a>
                                                        )}
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.facebook && (
                                                            <a href={`https://facebook.com/${post.clients.nutrition_profiles[0].diagnostic_data.facebook.replace('/','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-500 transition-colors" title="Facebook">
                                                                <Facebook size={14} />
                                                            </a>
                                                        )}
                                                        {post.clients?.nutrition_profiles?.[0]?.diagnostic_data?.twitter && (
                                                            <a href={`https://twitter.com/${post.clients.nutrition_profiles[0].diagnostic_data.twitter.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-sky-500 transition-colors" title="Twitter / X">
                                                                <Twitter size={14} />
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{post.created_at && !isNaN(new Date(post.created_at).getTime()) ? new Date(post.created_at).toLocaleString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'}) : 'Récemment'}</p>
                                        </div>
                                     </div>
                                     <div className="relative">
                                         <MoreHorizontal onClick={() => setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)} size={18} className="text-zinc-400 cursor-pointer hover:text-black transition-colors" />
                                         {activeMenuPostId === post.id && (
                                             <div className="absolute top-6 right-0 z-30 shadow-lg bg-white dark:bg-zinc-800 rounded-xl p-2 min-w-[150px] border border-zinc-100 dark:border-zinc-700 animate-in fade-in slide-in-from-top-2">
                                                 {post.client_id === clientProfile?.id ? (
                                                     <button onClick={() => handleDeletePost(post.id)} className="w-full flex items-center gap-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-2 rounded-lg transition-colors"><Trash2 size={14}/> Supprimer le post</button>
                                                 ) : (
                                                     <button className="w-full flex items-center gap-2 text-left text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 p-2 rounded-lg transition-colors"><AlertTriangle size={14}/> Signaler</button>
                                                 )}
                                             </div>
                                         )}
                                     </div>
                                 </div>

                                 {post.is_repost && (
                                     <div className="mb-3 text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1">
                                         <RefreshCcw size={12}/> Repartagé de {post.original_author || 'un Membre'}
                                     </div>
                                 )}

                                 {/* Location and Tag rendering */}
                                 {(post.location_name || post.tagged_friends?.length > 0) && (
                                     <div className="flex flex-wrap gap-2 mb-3">
                                         {post.location_name && <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-1"><Compass size={12}/> {post.location_name}</span>}
                                         {post.tagged_friends?.map((f: string, i: number) => <span key={i} className="text-[10px] bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md text-blue-600 dark:text-blue-400 font-bold">@{f}</span>)}
                                     </div>
                                 )}

                                 {post.media_type === 'text_only' ? (
                                     <div className={`w-full h-64 rounded-2xl ${TEXT_BACKGROUNDS[post.text_bg_index || 0].startsWith("url") ? "" : TEXT_BACKGROUNDS[post.text_bg_index || 0]} bg-cover bg-center p-6 flex flex-col justify-center items-center relative mb-4`} style={{ backgroundImage: TEXT_BACKGROUNDS[post.text_bg_index || 0].startsWith("url") ? TEXT_BACKGROUNDS[post.text_bg_index || 0] : "none", backgroundSize: "cover", backgroundPosition: "center" }}>
                                         <p className="text-center text-white text-2xl font-black">{post.content || post.texte}</p>
                                         <div className="absolute bottom-4 right-4 text-white/50 text-xs font-black tracking-widest">NXA</div>
                                     </div>
                                 ) : (
                                     <>
                                         <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 whitespace-pre-wrap leading-relaxed">{post.content || post.texte}</p>

                                         {post.image_url && post.media_type === 'video' && (
                                             <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-zinc-100 dark:border-zinc-800 bg-black relative">
                                                 <video src={post.image_url} controls playsInline className="w-full h-full object-contain" />
                                             </div>
                                         )}

                                         {post.image_url && post.media_type !== 'video' && (
                                             <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 relative cursor-pointer" onClick={() => window.open(post.image_url, '_blank')}>
                                                 <img src={post.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" alt="Post" />
                                             </div>
                                         )}
                                     </>
                                 )}

                                 <div className="flex items-center justify-between pt-4 border-t border-zinc-100 relative">
                                     <div className="flex items-center gap-6">
                                         <div className="relative" onMouseEnter={() => setActiveReactionPostId(post.id)} onMouseLeave={() => setActiveReactionPostId(null)}>
                                             {activeReactionPostId === post.id && (
                                                 <div className="absolute bottom-10 left-0 bg-white dark:bg-zinc-800 shadow-lg rounded-full p-2 flex gap-3 z-50 border border-zinc-100 dark:border-zinc-700 animate-in slide-in-from-bottom-2 fade-in">
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Like'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Like">👍</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Amour'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Amour">❤️</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Contane'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Contane">😄</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Faché'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Faché">😡</button>
                                                     <button onPointerDown={(e) => { e.stopPropagation(); handleLikePost(post.id, 'Fier'); }} className="hover:scale-125 transition-transform cursor-pointer" title="Fier">🔥</button>
                                                 </div>
                                             )}
                                             <button onClick={() => handleLikePost(post.id, 'Like')} className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors ${post._likedByMe ? (post._myReaction?.color || 'text-blue-500') : 'text-zinc-400 hover:text-blue-500'}`}>
                                                 {post._myReaction ? (
                                                     <span className="text-lg leading-none">{post._myReaction.icon}</span>
                                                 ) : (
                                                     <Heart size={16} className={post._likedByMe ? 'fill-blue-500 text-blue-500' : ''} />
                                                 )}
                                                 {post.likes_count || post.reactions?.top || post.reactions?.length || 0}
                                             </button>
                                         </div>
                                         <button onClick={() => handleToggleComments(post.id)} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors">
                                             <MessageSquare size={16}/> {post.comments_count || post.comments?.length || 0} Réponses
                                         </button>
                                     </div>
                                     <div className="flex items-center gap-4">
                                         <button onClick={() => handleRepost(post)} className="text-zinc-400 hover:text-black transition-colors" title="Repartager">
                                             <Share2 size={18} />
                                         </button>
                                         <button onClick={() => handleBookmarkPost(post.id)} className={`transition-colors ${post._bookmarkedByMe ? 'text-[#39FF14]' : 'text-zinc-400 hover:text-black'}`} title="Sauvegarder">
                                             <Bookmark size={18} className={post._bookmarkedByMe ? 'fill-[#39FF14]' : ''} />
                                         </button>
                                     </div>
                                 </div>

                                 {/* Commentaires Dropdown */}
                                 {showCommentsPostId === post.id && (
                                     <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-2">
                                         <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                                             {postComments.length === 0 ? (
                                                 <p className="text-xs text-zinc-400 text-center py-4">Aucun commentaire pour l'instant. Soyez le premier !</p>
                                             ) : (
                                                 postComments.map((c: any, idx: number) => (
                                                     <div key={idx} className="flex gap-3">
                                                         <img src={c.clients?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.clients?.full_name || 'Utilisateur')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Avatar"/>
                                                         <div className="flex-1">
                                                             <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl rounded-tl-none">
                                                                 <div className="flex justify-between items-start mb-1">
                                                                     <span className="text-xs font-bold text-black dark:text-white">{c.clients?.full_name || 'Membre NXA'}</span>
                                                                     <span className="text-[10px] text-zinc-400">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                 </div>
                                                                 <p className="text-sm text-zinc-700 dark:text-zinc-300">{c.content}</p>
                                                             </div>
                                                             <div className="flex items-center gap-4 mt-2 px-2 text-[10px] font-black uppercase text-zinc-400">
                                                                 <button onClick={() => handleLikeComment(c.id, 'like')} className="hover:text-black transition-colors flex items-center gap-1">👍 {c.likes_count || 0}</button>
                                                                 <button onClick={() => handleLikeComment(c.id, 'dislike')} className="hover:text-black transition-colors flex items-center gap-1">👎 {c.dislikes_count || 0}</button>
                                                                 <button onClick={() => setNewCommentText(`@${c.clients?.full_name?.split(' ')[0]} `)} className="hover:text-black transition-colors">Répondre</button>
                                                             </div>
                                                         </div>
                                                     </div>
                                                 ))
                                             )}
                                         </div>
                                         <div className="flex items-center gap-3">
                                             <img src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Moi')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Moi"/>
                                             <input type="text" value={newCommentText} onChange={e => setNewCommentText(e.target.value)} placeholder="Écrire un commentaire..." className="flex-1 bg-zinc-50 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm text-black dark:text-white outline-none focus:ring-2 focus:ring-[#39FF14] transition-shadow placeholder:text-zinc-400" onKeyDown={e => e.key === 'Enter' && handlePostComment(post.id)} />
                                             <button onClick={() => handlePostComment(post.id)} disabled={!newCommentText.trim() || isSaving} className="p-2 bg-black text-[#39FF14] rounded-full hover:scale-105 transition-transform disabled:opacity-50"><Send size={16}/></button>
                                         </div>
                                     </div>
                                 )}
                              </div></React.Fragment>
                           )) : (
                               <div className="text-center py-16 px-6 text-zinc-400 font-bold border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white">
                                   <Camera size={40} className="mx-auto mb-4 text-zinc-300"/>
                                   Soyez le premier à partager votre assiette ! 📸
                               </div>
                           )}
                        </div>
                     </div>

                     {/* Colonne Droite : Mini Profil & Notifications (3 cols) */}
                     <div id="challenges-section" className="hidden lg:flex lg:col-span-3 flex-col gap-6">

                         {/* CHALENGES TENDANCE WIDGET */}
                         {activeChallenge && (
                             <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-[2rem] p-0 shadow-sm relative overflow-hidden group transition-all">
                                 <div className="h-40 relative bg-black cursor-pointer" onClick={(e) => { e.preventDefault(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }}>
                                     {activeChallenge.cover_url?.includes('.mp4') ? (
                                         <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                     ) : (
                                         <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover" />
                                     )}
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                     <div className="absolute top-4 left-4">
                                         <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">En cours</span>
                                     </div>
                                     <div className="absolute bottom-4 left-4 right-4">
                                         <h3 className="font-poppins-black text-white text-lg leading-tight line-clamp-2">{activeChallenge.title}</h3>
                                     </div>
                                 </div>
                                 <div className="p-5">
                                     <p className="text-xs text-zinc-500 font-poppins mb-4 line-clamp-2">{activeChallenge.description}</p>
                                     <div className="flex items-center gap-2 mb-4 text-xs font-black uppercase tracking-widest text-zinc-500">
                                         <Users className="w-4 h-4 text-zinc-400" />
                                         {challengeParticipants} participants
                                     </div>
                                     <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl mb-4">
                                         <div className="flex items-center gap-2 text-[10px] font-black uppercase text-orange-500 animate-pulse">
                                             <Clock className="w-4 h-4" />
                                             {activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0} jours restants
                                         </div>
                                         <span className="text-[10px] font-bold text-zinc-400">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : ''}</span>
                                     </div>
                                     <div className="flex gap-2">
                                         <button onClick={(e) => { e.preventDefault(); setActiveChallenge(activeChallenge); setShowChallengeModal(true); }} className="flex-1 text-[10px] font-black uppercase tracking-widest text-black bg-[#39FF14] px-4 py-3 rounded-xl hover:scale-105 transition-transform shadow-sm">Détails</button>
                                         {isParticipating && (
                                             <button onClick={async () => {
                                                 if (!activeChallenge || !clientProfile) return;
                                                 setIsSaving(true);
                                                 try {
                                                     await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);
                                                     setIsParticipating(false);
                                                     setChallengeParticipants(prev => Math.max(0, prev - 1));
                                                 } catch(e) { console.error(e); }
                                                 setIsSaving(false);
                                             }} disabled={isSaving} className="flex-1 text-[10px] font-black uppercase tracking-widest text-white bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition-colors flex items-center justify-center">
                                                 {isSaving ? <Activity className="animate-spin w-4 h-4"/> : "Se désinscrire"}
                                             </button>
                                         )}
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* Notifications / Reminders */}
                         <div className="bg-white border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col max-h-96">
                             <div className="flex justify-between items-center mb-6">
                                 <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Notifications</p>
                                 <button className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors">See All</button>
                             </div>

                             <div className="overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-2">
                                 {notifications.length > 0 ? (
                                     notifications.map((notif: any) => (
                                         <div
                                             key={notif.id}
                                             className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${!notif.is_read ? 'bg-[#39FF14]/5 hover:bg-[#39FF14]/10 border border-[#39FF14]/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border border-transparent'}`}
                                             onClick={async () => {
                                                 if (!notif.is_read) {
                                                     await supabase.from('nutrition_notifications').update({ is_read: true }).eq('id', notif.id);
                                                     setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                                                 }
                                                 // Example: Scroll or navigate depending on type
                                                 if (notif.type === 'like' || notif.type === 'comment' || notif.type === 'repost') {
                                                     window.scrollTo(0, 0); // Placeholder to show it is interactive
                                                 }
                                             }}
                                         >
                                             {notif.clients ? (
                                                <img src={notif.clients.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(notif.clients.full_name || 'U')}&background=random`} className="w-8 h-8 rounded-full border border-zinc-200 object-cover shrink-0" alt="Actor" />
                                             ) : (
                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                                    <Bell size={14}/>
                                                </div>
                                             )}
                                             <div className="flex-1">
                                                 <p className="text-[10px] font-medium text-zinc-800 dark:text-zinc-200 leading-tight">
                                                     <span className="font-bold text-black dark:text-white">{notif.clients?.full_name || 'Système'}</span> {notif.message}
                                                 </p>
                                                 <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-widest">
                                                     {notif.created_at ? new Date(notif.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Récemment'}
                                                 </p>
                                             </div>
                                             {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#39FF14] shrink-0 mt-2"></div>}
                                         </div>
                                     ))
                                 ) : (
                                     <div className="flex flex-col items-center justify-center h-32 text-center text-zinc-400">
                                         <Bell size={24} className="mb-2 opacity-50"/>
                                         <p className="text-xs font-bold">Aucune notification</p>
                                     </div>
                                 )}
                             </div>
                         </div>

                     </div>
                 </div>

          </div>


          <AnimatePresence>
            {showChallengeModal && activeChallenge && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative border border-zinc-200 dark:border-zinc-800">

                  {/* Image / Video Cover */}
                  <div className="relative h-64 shrink-0 bg-black">
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowChallengeModal(false); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                        <X size={20} />
                     </button>
                     {activeChallenge.cover_url?.includes('.mp4') ? (
                         <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" />
                     ) : (
                         <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-90" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                     <div className="absolute bottom-6 left-6 right-6">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md mb-3 inline-block">En cours</span>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{activeChallenge.title}</h2>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">

                      <div className="flex flex-wrap gap-3 mb-6">
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Users className="w-5 h-5 text-blue-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Participants</p>
                                  <p className="text-sm font-black text-black dark:text-white">{challengeParticipants}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Clock className="w-5 h-5 text-orange-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Temps Restant</p>
                                  <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0} jours</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl w-full">
                              <Trophy className="w-6 h-6 text-amber-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Récompense</p>
                                  <p className="text-base font-black text-amber-600 dark:text-amber-400">+{activeChallenge.reward_xp || 500} XP</p>
                              </div>
                          </div>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2"><Target size={16}/> Objectif du challenge</h3>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">{activeChallenge.description}</p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl flex justify-between items-center mb-4">
                          <div className="text-center flex-1 border-r border-zinc-200 dark:border-zinc-700">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Début</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.start_date ? new Date(activeChallenge.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}</p>
                          </div>
                          <div className="text-center flex-1">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Fin</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : 'Continu'}</p>
                          </div>
                      </div>

                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                      {isParticipating ? (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Remove participation
                                      await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);

                                      // Anti-Cheat: Remove XP
                                      const xpToLose = activeChallenge.reward_xp || 500;
                                      const newXp = Math.max(0, (clientProfile.jongoma_xp || 0) - xpToLose);
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(false);
                                      setChallengeParticipants(prev => Math.max(0, prev - 1));
                                      setToastMessage({ type: 'success', text: `Vous avez quitté le challenge et perdu ${xpToLose} XP.` });
                                      setTimeout(() => setToastMessage(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Quitter le challenge (-XP)"}
                          </button>
                      ) : (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Add participation
                                      await supabase.from('nutrition_challenge_participants').insert({ challenge_id: activeChallenge.id, client_id: clientProfile.id });

                                      // Grant XP
                                      const xpToGain = activeChallenge.reward_xp || 500;
                                      const newXp = (clientProfile.jongoma_xp || 0) + xpToGain;
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(true);
                                      setChallengeParticipants(prev => prev + 1);
                                      setShowConfetti(true);
                                      setTimeout(() => setShowConfetti(false), 5000);
                                      setXpAnimation({ amount: xpToGain, reason: `Inscription: ${activeChallenge.title}`, id: Date.now() });
                                      setTimeout(() => setXpAnimation(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_40px_rgba(57,255,20,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre le challenge"}
                          </button>
                      )}
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>


          <AnimatePresence>
            {showChallengeModal && activeChallenge && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-zinc-900 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col relative border border-zinc-200 dark:border-zinc-800">

                  {/* Image / Video Cover */}
                  <div className="relative h-64 shrink-0 bg-black">
                     <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowChallengeModal(false); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-md">
                        <X size={20} />
                     </button>
                     {activeChallenge.cover_url?.includes('.mp4') ? (
                         <video src={activeChallenge.cover_url} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" />
                     ) : (
                         <img src={activeChallenge.cover_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1782594141/bols_gjqh7n.jpg"} className="w-full h-full object-cover opacity-90" />
                     )}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                     <div className="absolute bottom-6 left-6 right-6">
                        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-md mb-3 inline-block">En cours</span>
                        <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{activeChallenge.title}</h2>
                     </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">

                      <div className="flex flex-wrap gap-3 mb-6">
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Users className="w-5 h-5 text-blue-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Participants</p>
                                  <p className="text-sm font-black text-black dark:text-white">{challengeParticipants}</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 px-4 py-2 rounded-xl flex-1 min-w-[120px]">
                              <Clock className="w-5 h-5 text-orange-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Temps Restant</p>
                                  <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? Math.ceil((new Date(activeChallenge.end_date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : 0} jours</p>
                              </div>
                          </div>
                          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl w-full">
                              <Trophy className="w-6 h-6 text-amber-500" />
                              <div>
                                  <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">Récompense</p>
                                  <p className="text-base font-black text-amber-600 dark:text-amber-400">+{activeChallenge.reward_xp || 500} XP</p>
                              </div>
                          </div>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2"><Target size={16}/> Objectif du challenge</h3>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium whitespace-pre-wrap">{activeChallenge.description}</p>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl flex justify-between items-center mb-4">
                          <div className="text-center flex-1 border-r border-zinc-200 dark:border-zinc-700">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Début</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.start_date ? new Date(activeChallenge.start_date).toLocaleDateString('fr-FR') : 'Immédiat'}</p>
                          </div>
                          <div className="text-center flex-1">
                              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Fin</p>
                              <p className="text-sm font-black text-black dark:text-white">{activeChallenge.end_date ? new Date(activeChallenge.end_date).toLocaleDateString('fr-FR') : 'Continu'}</p>
                          </div>
                      </div>

                  </div>

                  {/* Footer CTA */}
                  <div className="p-4 shrink-0 bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800">
                      {isParticipating ? (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Remove participation
                                      await supabase.from('nutrition_challenge_participants').delete().eq('challenge_id', activeChallenge.id).eq('client_id', clientProfile.id);

                                      // Anti-Cheat: Remove XP
                                      const xpToLose = activeChallenge.reward_xp || 500;
                                      const newXp = Math.max(0, (clientProfile.jongoma_xp || 0) - xpToLose);
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(false);
                                      setChallengeParticipants(prev => Math.max(0, prev - 1));
                                      setToastMessage({ type: 'success', text: `Vous avez quitté le challenge et perdu ${xpToLose} XP.` });
                                      setTimeout(() => setToastMessage(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Quitter le challenge (-XP)"}
                          </button>
                      ) : (
                          <button
                              disabled={isSaving}
                              onClick={async (e) => {
                                  e.preventDefault(); e.stopPropagation();
                                  if (!activeChallenge || !clientProfile) return;
                                  setIsSaving(true);
                                  try {
                                      // Add participation
                                      await supabase.from('nutrition_challenge_participants').insert({ challenge_id: activeChallenge.id, client_id: clientProfile.id });

                                      // Grant XP
                                      const xpToGain = activeChallenge.reward_xp || 500;
                                      const newXp = (clientProfile.jongoma_xp || 0) + xpToGain;
                                      await supabase.from('clients').update({ jongoma_xp: newXp }).eq('id', clientProfile.id);
                                      setClientProfile({ ...clientProfile, jongoma_xp: newXp });
                                      setJongomaXP(newXp);

                                      setIsParticipating(true);
                                      setChallengeParticipants(prev => prev + 1);
                                      setShowConfetti(true);
                                      setTimeout(() => setShowConfetti(false), 5000);
                                      setXpAnimation({ amount: xpToGain, reason: `Inscription: ${activeChallenge.title}`, id: Date.now() });
                                      setTimeout(() => setXpAnimation(null), 3000);
                                      setShowChallengeModal(false);
                                  } catch (e) { console.error(e); }
                                  setIsSaving(false);
                              }}
                              className="w-full bg-[#39FF14] hover:bg-[#32e612] text-black font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] hover:shadow-[0_15px_40px_rgba(57,255,20,0.4)] hover:-translate-y-1 flex items-center justify-center gap-2 text-sm"
                          >
                              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Rejoindre le challenge"}
                          </button>
                      )}
                  </div>

                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

    </>
  );
}
