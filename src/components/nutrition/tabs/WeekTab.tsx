import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function WeekTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

          <div className="space-y-12 animate-in fade-in slide-in-from-right-4 w-full">
            <button onClick={() => handleTabChange('dashboard')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à l&apos;accueil</button>
            {/* SECTION SMART PLANNER (Générateur) */}
            <section>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-4">
                     <img src={MENU_ICONS.samaMenu} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Sama Menu" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} />
                     <div>
                        <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Sama Menu</h2>
                        <p className="text-zinc-500 font-bold text-xs mt-1 max-w-lg leading-relaxed">
                          Votre programme quotidien visuel. Suivez ces recommandations sans tracas. Loguez vos plats ici.
                        </p>
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={() => generateWeeklyMenu()} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                        <RefreshCcw size={14}/> Regénérer
                     </button>
                     <button onClick={() => setShowGroceryList(true)} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition shadow-sm flex items-center gap-2">
                        <ShoppingCart size={14}/> Liste de courses
                     </button>
                     <button onClick={downloadGroceryListPDF} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2 hidden sm:flex">
                        <Download size={14}/> PDF
                     </button>
                  </div>
               </div>

               {clientProfile?.plan_type !== 'premium' && daysLeft <= 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-300 rounded-[2rem] p-12 text-center relative overflow-hidden">
                     <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} />
                     </div>
                     <h3 className="font-black uppercase text-xl text-black mb-2">Générateur Verrouillé</h3>
                     <p className="text-sm font-medium text-zinc-500 mb-6 max-w-md mx-auto">Votre période d'essai est terminée. Passez au plan Premium pour réactiver le Smart Planner et votre liste de courses automatique.</p>
                     <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite passer au plan Premium !', '_blank')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 mx-auto">
                        <Sparkles size={16}/> Passer Premium
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 w-full">
                     {(() => {
                         const today = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);
                         const others = weeklyGeneratedMenu.filter(d => d.day !== formattedCurrentDay);
                         const displayMenu = today ? [today, ...others] : weeklyGeneratedMenu;
                         return displayMenu.map((dayPlan, dIdx) => {
                             const isToday = dayPlan.day === formattedCurrentDay;
                             return (
                        <div key={`${dIdx}-${dayPlan.meals?.['Déjeuner']?.id || 'empty'}`} className={`bg-white rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.06)] border-0 overflow-hidden flex flex-col group relative animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 ${isToday ? 'ring-4 ring-[#39FF14]' : 'opacity-80 grayscale-[20%] hover:grayscale-0 hover:opacity-100 transition-all'}`} style={{ animationFillMode: 'both', animationDelay: `${dIdx * 100}ms` }}>
                           <div className={`absolute top-4 left-4 ${isToday ? 'bg-[#39FF14] text-black' : 'bg-black text-white'} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest z-10 shadow-lg`}>
                              {dayPlan.day} {isToday && '(Auj.)'}
                           </div>

                           <div className="h-48 w-full bg-zinc-100 relative overflow-hidden">
                              <img src={dayPlan.meals?.['Déjeuner']?.image_url || 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg'} alt="Repas" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-5">
                                 <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest mb-1">Déjeuner</p>
                                 <p className="text-white font-bold text-lg leading-tight line-clamp-1">{dayPlan.meals?.['Déjeuner']?.nom || 'Repas'}</p>
                                 {dayPlan.meals?.['Déjeuner']?.is_boutique && <span className="absolute top-4 right-4 bg-[#39FF14] text-black px-2 py-1 rounded text-[9px] font-black uppercase shadow-md">Boutique</span>}
                              </div>
                           </div>

                           <div className="p-5 flex-1 flex flex-col gap-3">
                              {(isFastingMode ? ['Déjeuner', 'Collation', 'Dîner'] : ['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner']).map(mealType => {
                                 const recipe = dayPlan.meals?.[mealType];
                                 if(!recipe) return null;
                                 const isToday = dayPlan.day === formattedCurrentDay;
                                 const isConsumed = isToday && consumedMeals.some((m: any) => m.name === recipe.nom && m.type === mealType);
                                 const isBolCommun = clientProfile?.diagnostic_data?.lunch_context === 'maison_bol_commun' && mealType === 'Déjeuner';

                                 console.log("🔍 OBJET MEAL COMPLET :", JSON.stringify(recipe, null, 2));
                                 return (
                                    <React.Fragment key={mealType}>
                                    <div className={`flex justify-between items-center p-4 rounded-2xl transition-all ${isConsumed ? 'bg-[#39FF14]/15 shadow-sm opacity-90 border border-[#39FF14]' : 'bg-zinc-50 hover:bg-white hover:shadow-md'}`}>
                                       <div className="flex-1 min-w-0 pr-2 cursor-pointer" onClick={() => handleMealClick(mealType, { type: mealType, meal: recipe.nom, cals: recipe.calories || recipe.cals || recipe.kcal || 0, proteins: recipe.proteins || recipe.prots || 0, carbs: recipe.carbs || recipe.glucides || 0, fats: recipe.fats || recipe.lipides || 0, recipe: recipe.recipe, bienfaits: recipe.bienfaits }, 'guided')} title="Voir la recette">
                                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                          <p className={`text-xs font-bold truncate ${isConsumed ? 'text-[#39FF14]' : 'text-black'}`}>{recipe.nom} {isConsumed && '✅'}</p>
                                       </div>
                                       <div className="text-right shrink-0 flex flex-col items-end gap-1 relative">

                                          {isExpertMode ? (
                                             <div className="flex gap-2">
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CALS_ICON} className="w-3 h-3 rounded-full"/> {recipe.calories || recipe.cals || recipe.kcal || recipe.energy || '—'} kcal</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={PROTEINS_ICON} className="w-3 h-3 rounded-full"/> {recipe.proteins || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={CARBS_ICON} className="w-3 h-3 rounded-full"/> {recipe.carbs || 0}g</span>
                                                <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} flex items-center gap-1`}><img src={FATS_ICON} className="w-3 h-3 rounded-full"/> {recipe.fats || 0}g</span>
                                             </div>
                                          ) : (
                                             <span className={`text-[10px] font-bold ${isConsumed ? 'text-[#39FF14]' : 'text-zinc-500'} bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md`}>
                                                 {recipe.ux_unit ? recipe.ux_unit : guessVisualPortion(recipe.calories || 300, mealType)}
                                             </span>
                                          )}

                                          <div className="flex items-center gap-1 mt-0.5">
                                             {isToday && !isConsumed && (
                                               <button onClick={(e) => { e.stopPropagation(); confirmMealLog(mealType, recipe.nom, recipe.calories || recipe.cals || recipe.kcal || 0, recipe.proteins || recipe.prots || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.2)/4), recipe.carbs || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.5)/4), recipe.fats || Math.round(((recipe.calories || recipe.cals || recipe.kcal || 0) * 0.3)/9), { ux_unit: recipe.ux_unit || '1 portion' }); setToastMessage('Ajouté à Mon Jour !'); setTimeout(()=>setToastMessage(null), 3000); }} className="bg-[#39FF14] text-black px-1.5 py-1 rounded text-[8px] font-black uppercase shadow-sm hover:bg-black hover:text-[#39FF14] transition-colors" title="Ajouter à Mon Jour">➕ Ajouter</button>
                                             )}
                                             {isConsumed && (
                                                <button onClick={(e) => { e.stopPropagation(); const mealToDelete = consumedMeals.find((m: any) => m.name === recipe.nom && m.type === mealType); if (mealToDelete) deleteMealLog(mealToDelete); }} className="bg-red-500 text-white px-3 py-1 rounded text-[8px] font-black uppercase shadow-sm hover:scale-105 transition-transform" title="Annuler">🗑️ Supprimer</button>
                                             )}
                                             {!isConsumed && !isToday && (
                                                <span className="bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded text-[8px] font-black uppercase">Prévu</span>
                                             )}
                                             {!isConsumed && isToday && (
                                                <button onClick={(e) => { e.stopPropagation(); handleSwapMeal(dIdx, mealType, recipe.id); }} className="bg-zinc-200 text-zinc-600 px-1.5 py-1 rounded text-[8px] font-black uppercase shadow-sm hover:bg-black hover:text-white transition-colors" title="Changer ce repas">🔄</button>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                    {isBolCommun && (
                                      <div className="bg-zinc-100 border-2 border-[#39FF14] p-4 rounded-xl mt-1 mb-2">
                                         <p className="text-xs font-medium text-black leading-relaxed">
                                           💡 <strong>Conseil Woyof :</strong> Servez votre part dans une petite assiette creuse avant de rejoindre la famille, ou limitez votre espace de riz à la taille de votre poing dans le grand bol.
                                         </p>
                                      </div>
                                    )}
                                    </React.Fragment>
                                 )
                              })}
                           </div>
                        </div>
                     )
                 })
             })()}
                  </div>
               )}
               {/* BOUTON GÉNÉRER LISTE COURSES EN BAS */}
               {(clientProfile?.plan_type === 'premium' || daysLeft > 0) && weeklyGeneratedMenu.length > 0 && (
                  <div className="mt-12 text-center">
                     <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                        <button onClick={() => setShowGroceryList(true)} className="bg-black text-[#39FF14] px-10 py-5 rounded-[2.5rem] font-black uppercase text-sm md:text-base tracking-widest hover:scale-105 transition-transform shadow-[0_15px_40px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3">
                           <ShoppingCart size={24}/> Voir ma liste de courses
                        </button>
                     {(() => {
                        const list = getGroceryList();
                        const totalCost = Object.values(list).flatMap(rayon => Object.values(rayon as any)).reduce((acc: number, item: any) => acc + (item.price_cfa * item.quantite), 0);
                        return (
                           <p className="text-xs font-bold text-zinc-500 mt-2">Coût estimé pour la semaine : {totalCost.toLocaleString('fr-FR')} FCFA (Marché Sandaga/Auchan)</p>
                        );
                     })()}
                        <button onClick={downloadGroceryListPDF} className="bg-white text-black border-2 border-zinc-200 px-8 py-5 rounded-[2.5rem] font-black uppercase text-sm md:text-base tracking-widest hover:scale-105 transition-transform shadow-sm flex items-center justify-center gap-3">
                           <Download size={24}/> Télécharger PDF
                        </button>
                     </div>
                     <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-4">Calculée automatiquement d'après votre Sama Menu</p>
                  </div>
               )}
            </section>

            {/* SECTION MENUS DE LA SEMAINE */}
            <section className="mt-12">
               <div className="flex items-center gap-3 mb-8">
                  <img src={MENU_ICONS.samaMenu} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="Sama Menu" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} />
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Vos Menus Sur-Mesure</h2>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {weeklyMenus.map((menu: any, idx: number) => (
                     <motion.div
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                       key={menu.week}
                       className={`relative border-2 rounded-[2rem] p-8 transition-all overflow-hidden ${menu.status === 'unlocked' ? 'bg-white border-zinc-200 hover:border-black shadow-sm' : 'bg-zinc-100 border-dashed border-zinc-300'}`}
                     >
                        {menu.status === 'locked' && (
                           <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                              <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                                 <Lock size={28} />
                              </div>
                              <h3 className="font-black uppercase text-lg text-black mb-2">Semaine Verrouillée</h3>
                              <p className="text-xs font-bold text-zinc-500 mb-6">Passez au plan Premium pour débloquer la suite de votre programme.</p>
                           </div>
                        )}

                        <div className="flex justify-between items-start mb-6">
                           <div>
                              <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${menu.status === 'unlocked' ? 'bg-[#39FF14]/20 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                                 Semaine {menu.week}
                              </span>
                              <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase text-black`}>{menu.title}</h3>
                           </div>
                           {menu.status === 'unlocked' && <CheckCircle className="text-[#39FF14]" size={24} />}
                        </div>

                        <p className="text-sm font-medium text-zinc-600 mb-6">{menu.desc}</p>

                        {menu.status === 'unlocked' && (
                           <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-200 pb-2">Aperçu du menu</p>
                              <ul className="space-y-3">
                                 {menu.meals.map((meal: string, i: number) => (
                                    <li key={i} className="text-xs font-bold text-zinc-700 flex items-start gap-2">
                                       <span className="text-[#39FF14] mt-0.5">●</span> {meal}
                                    </li>
                                 ))}
                                 {todayPlan?.meals?.['Déjeuner']?.budget_tier === 'Serré 8k' && (
                                    <li className="text-xs font-bold text-green-700 flex items-start gap-2 mt-4">
                                       <PartyPopper size={16} className="text-green-500"/> Recette priorisée pour votre budget serré !
                                    </li>
                                 )}
                              </ul>
                           </div>
                        )}
                     </motion.div>
                  ))}
               </div>
            </section>

            {/* SECTION GUIDE PDF */}
            <section>
               <div className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-[#39FF14] transition-colors">
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-[#39FF14]/10 text-[#39FF14] p-5 rounded-2xl border border-[#39FF14]/20 group-hover:scale-110 transition-transform">
                       <Download size={32} />
                    </div>
                    <div>
                       <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-1`}>Le Guide Complet</h2>
                       <p className="text-zinc-500 font-bold text-sm">Nutrition à l'Africaine : Vos astuces et recettes de base.</p>
                    </div>
                 </div>
                 <button className="w-full md:w-auto bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 relative z-10">
                    Télécharger mon guide (PDF)
                 </button>
               </div>
            </section>

          </div>

    </>
  );
}
