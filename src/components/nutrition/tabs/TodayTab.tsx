import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function TodayTab({ ...tabProps }: any) {
  const { today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, setShowFoodSearch } = tabProps;

  return (
    <>

          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-4">
                  <img src={MENU_ICONS.monJour} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Mon Jour" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} />
                  <div>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Mon Jour</h2>
                     <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                       Enregistrez vos repas, suivez votre eau et complétez votre bilan de la journée.
                     </p>
                  </div>
               </div>

               {/* Switch Mode Guidé / Flexible */}
               <div className="bg-zinc-100 p-1.5 rounded-full inline-flex relative shadow-inner shrink-0 h-fit">
                  <button onClick={() => handleTrackingModeChange('guided')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'guided' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}`}>Mode Guidé</button>
                  <button onClick={() => handleTrackingModeChange('flexible')} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'flexible' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-400 hover:text-black'}`}>Mode Libre</button>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* COLONNE GAUCHE (1/3) */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                {/* 1. Le Pie Chart (Calories/Macros) ici */}
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center">
                   <div className="relative w-40 h-40 shrink-0 mb-6 min-h-[160px] min-w-[160px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie data={[{name: 'Consommé', value: calories}, {name: 'Restant', value: remainingCalories}]} cx="50%" cy="50%" innerRadius={50} outerRadius={70} stroke="none" startAngle={90} endAngle={-270}>
                               <Cell key="cell-0" fill="#39FF14" />
                               <Cell key="cell-1" fill="#f4f4f5" />
                            </Pie>
                         </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                         <p className="text-2xl font-black text-black leading-none">{calories}</p>
                         <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">/ {targetCalories} kcal</p>
                      </div>
                   </div>

                   <div className="w-full space-y-4">
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Protéines</span>
                            <span className="text-zinc-500 text-[9px]">{proteins} / {proteinGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${Math.min((proteins / proteinGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={CARBS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Glucides</span>
                            <span className="text-zinc-500 text-[9px]">{carbs} / {carbsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 transition-all duration-1000" style={{ width: `${Math.min((carbs / carbsGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                      <div>
                         <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-black uppercase tracking-widest text-[9px]"><img src={FATS_ICON} className="w-3 h-3 rounded-full inline mr-1"/> Lipides</span>
                            <span className="text-zinc-500 text-[9px]">{fats} / {fatsGoal}g</span>
                         </div>
                         <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 transition-all duration-1000" style={{ width: `${Math.min((fats / fatsGoal) * 100, 100)}%` }}></div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* 2. Le grand widget "Refaire mon diagnostic" en dessous du Pie Chart */}
                <button
                  onClick={() => setShowRedoDiagModal(true)}
                  className="relative w-full rounded-[2rem] overflow-hidden group shadow-lg flex-1 min-h-[300px] flex items-center justify-center border-2 border-transparent hover:border-[#39FF14] transition-all"
                >
                  <img
                    src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783002400/A_high-end__photorealistic_commercial_shot_202607021426_vutjqi.jpg"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    alt="Refaire Diagnostic"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40 backdrop-blur-[2px]"></div>

                  <div className="relative z-10 flex flex-col items-center gap-3">
                     <div className="bg-[#39FF14] text-black p-3 rounded-full animate-pulse shadow-[0_0_30px_rgba(57,255,20,0.6)]">
                       <Target size={24} />
                     </div>
                     <h3 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-white tracking-tighter drop-shadow-md text-center`}>
                       Refaire mon diagnostic
                     </h3>
                     <p className="text-zinc-300 font-bold text-[10px] uppercase tracking-widest text-center">
                       Ajuster mes objectifs
                     </p>
                  </div>
                </button>
              </div>

              {/* COLONNE DROITE (2/3) */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* 1. La liste des repas (Sama Menu ou Mode Libre) */}
                {trackingMode === 'guided' ? (
                   (() => {
                       const todayMenu = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                       if (!todayMenu) return <div className="bg-white border border-zinc-200 p-8 text-center text-zinc-500 font-bold rounded-[2.5rem] shadow-sm">Aucun menu généré pour aujourd'hui. Veuillez générer votre Sama Menu.</div>;

                       return (
                           <div className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden flex flex-col relative">
                              <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                                 <img src={todayMenu.meals?.['Déjeuner']?.image_url || 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg'} alt="Repas" className="w-full h-full object-cover" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                    <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                    <p className="text-white font-bold text-lg leading-tight line-clamp-1">{todayMenu.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                                 </div>
                              </div>

                              <div className="p-5 flex-1 flex flex-col gap-3">
                                 {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                    const recipe = todayMenu.meals?.[mealType];
                                    if(!recipe) return null;
                                    const isConsumed = consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);

                                    return (
                                       <div key={mealType} className={`flex justify-between items-center p-4 rounded-2xl transition-all ${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 hover:bg-white border border-zinc-100'}`}>
                                          <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => handleMealClick(mealType, { type: mealType, meal: recipe.nom, cals: recipe.calories || recipe.cals || recipe.kcal || 0, proteins: recipe.proteins || recipe.prots || 0, carbs: recipe.carbs || recipe.glucides || 0, fats: recipe.fats || recipe.lipides || 0, recipe: recipe.recipe, bienfaits: recipe.bienfaits }, 'guided')}>
                                             <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                             <p className={`text-xs font-bold truncate ${isConsumed ? 'text-[#39FF14]' : 'text-black'}`}>{recipe.nom} {isConsumed && '✅'}</p>
                                          </div>
                                          <div className="text-right shrink-0 flex flex-col items-end gap-1">

                                             <div className="flex gap-2">
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.cals || recipe.kcal || recipe.energy || '—'} kcal</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>

                                             {!isConsumed ? (
                                                <div className="flex gap-2">
                                                    <button onClick={(e) => { e.stopPropagation(); confirmMealLog(mealType, recipe.nom, recipe.calories || recipe.cals || recipe.kcal || 0, recipe.proteins || recipe.prots || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.2)/4), recipe.carbs || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.5)/4), recipe.fats || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.3)/9), { ux_unit: recipe.ux_unit || '1 portion' }); setToastMessage('Ajouté à Mon Jour !'); setTimeout(()=>setToastMessage(null), 3000); }} className="bg-[#39FF14] text-black px-2 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform">Valider</button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleSwapMeal(0, mealType, recipe.id || ''); }} className="bg-zinc-200 text-black px-2 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform">Swap</button>
                                                    <button onClick={(e) => { e.stopPropagation(); setConsumedMeals(prev => prev.filter((m: any) => m.name !== recipe.nom || m.type !== mealType)); }} className="bg-red-500 text-white px-2 py-1.5 rounded-lg text-[9px] font-black uppercase shadow-sm hover:scale-105 transition-transform">🗑️</button>
                                                </div>
                                             ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-[#39FF14] text-black px-2 py-1 rounded-lg text-[9px] font-black uppercase shadow-sm">Validé ✅</span>
                                                    <button onClick={(e) => { e.stopPropagation(); const mealToDelete = consumedMeals.find((m: any) => m.name === recipe.nom && m.type === mealType); if (mealToDelete) deleteMealLog(mealToDelete); }} className="bg-red-500 text-white px-2 py-1 rounded-lg text-[9px] font-black shadow-sm hover:scale-105 transition-transform" title="Annuler">🗑️</button>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </div>
                           </div>
                       )
                   })()
                ) : (
                   /* MODE LIBRE */
                   <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm flex-1">
                     <div className="mb-4">
                        <h3 className="font-black text-lg text-black uppercase tracking-tighter">Menu Libre</h3>
                        <p className="text-zinc-500 text-xs font-bold">Composez votre assiette avec vos propres repas.</p>
                     </div>
                     {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                         const loggedMeals = consumedMeals.filter((m: any) => m.type === mealType);
                         return (
                           <div key={mealType} className="flex flex-col gap-2 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-black transition-colors cursor-pointer" onClick={() => { setSelectedMealModal({ type: mealType, action: 'add' }); setShowFoodSearch(true); }}>
                             <div className="flex justify-between items-center">
                                 <p className="text-xs font-black uppercase text-zinc-500">{mealType}</p>
                                 <button onClick={(e) => { e.stopPropagation(); setSelectedMealModal({ type: mealType, action: 'add' }); setShowFoodSearch(true); }} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Plus size={14}/> Ajouter un repas
                                 </button>
                             </div>
                             {loggedMeals.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                    {loggedMeals.map((m: any, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-zinc-100">
                                           <span className="text-xs font-bold text-[#39FF14] truncate">{m.name}</span>

                                           <div className="flex items-center gap-2 shrink-0">
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {m.calories || m.cals || 0} kcal</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {m.prots || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {m.carbs || 0}g</span>
                                              <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {m.fats || 0}g</span>
                                           </div>

                                        </div>
                                    ))}
                                 </div>
                             )}
                           </div>
                         )
                     })}
                   </div>
                )}

                {/* 2. Eau et Bilan côte à côte */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Objectif Eau - Interactive */}
                    <div className="rounded-[2rem] border border-blue-100 shadow-sm p-4 relative overflow-hidden flex flex-col justify-between group">
                        <img
                            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1783099524/Woman_drinking_clear_water_2K_202607031724_wuqqco.jpg"
                            className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                            alt="Hydratation Background"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-blue-50/80 to-transparent"></div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                               <Droplet size={10} className="fill-blue-500"/> Objectif Eau
                            </p>
                            <p className="text-xl font-black text-black mb-1">{waterGlasses * 300} ml <span className="text-sm text-zinc-500">/ 2400 ml</span></p>
                            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest leading-tight max-w-[90%]">
                                {waterGlasses === 0 && [
                                    "L'eau booste votre métabolisme de 30% en 10 min.",
                                    "Buvez avant les repas pour mieux digérer.",
                                    "La fatigue est souvent signe de déshydratation.",
                                    "Objectif : 8 verres pour un ventre plat."
                                ][new Date().getDay() % 4]}
                                {waterGlasses > 0 && waterGlasses < 4 && "Continue comme ça ! Chaque verre compte."}
                                {waterGlasses >= 4 && waterGlasses < 8 && "Tu es à la moitié, bravo !"}
                                {waterGlasses >= 8 && "Objectif atteint ! Corps hydraté 💧"}
                            </p>
                        </div>

                        <div className="grid grid-cols-4 gap-1 mt-3 z-10">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleUpdateWater(i + 1 - waterGlasses)}
                                    className="aspect-square relative flex justify-center items-end hover:scale-110 transition-transform"
                                >
                                    <img
                                        src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png"
                                        className={`w-full h-full object-contain ${i < waterGlasses ? 'opacity-100' : 'opacity-20 grayscale'}`}
                                        alt="Verre d'eau"
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-blue-400/10 rounded-full blur-xl pointer-events-none"></div>
                    </div>

                    {/* Bilan de la journée */}
                    <button onClick={() => setShowDailyReport(true)} className="bg-[#39FF14] p-4 rounded-[2rem] border border-black shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:scale-[1.02] transition-transform">
                        <CheckCircle size={24} className="text-black mb-2"/>
                        <h3 className="font-black text-xs uppercase tracking-tighter text-black mb-1">Bilan du jour</h3>
                        <p className="text-black/70 font-bold text-[9px]">Clôturez pour gagner de l'XP.</p>
                    </button>
                </div>
              </div>
            </div>

            {/* Suggestions Boutique */}
            <div className="bg-white border border-zinc-200 shadow-sm rounded-[2rem] p-8 mt-12 relative overflow-hidden">
               <h3 className="text-xl font-black uppercase text-black mb-6 flex items-center gap-2"><ShoppingCart className="text-[#39FF14] bg-black p-1.5 rounded-lg" size={24}/> La Boutique Onyx</h3>
               <p className="text-zinc-500 font-bold text-sm mb-6">Boostez vos résultats avec nos produits 100% naturels.</p>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {crossSellProducts.slice(0,3).map((p: any) => (
                     <div key={p.id} className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden flex flex-col group cursor-pointer hover:border-[#39FF14] transition-colors" onClick={() => handleTabChange('shop')}>
                        <div className="h-40 w-full relative">
                            <img src={p.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                           <p className="text-sm font-black text-black group-hover:text-[#39FF14] transition-colors line-clamp-1">{p.nom}</p>
                           <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 mb-4">{p.prix_standard} FCFA</p>
                           <button className="mt-auto w-full bg-black text-[#39FF14] py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                              Voir le produit
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          </div>

    </>
  );
}
